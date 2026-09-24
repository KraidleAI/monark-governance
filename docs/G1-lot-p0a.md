# G1 — Lot P0-a « dette d'entrée, code » (ADR-M015 D1 (a)(b))

> Journal de provenance (gate G1). Artefact tracé, vérifiable adversarialement (R-21).
> **Le worker ne committe pas (R-20)** ; l'orchestrateur commit/relit/rend le verdict G7.

## Provenance
- **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, 1M ctx, épinglé ; Opus 5 banni). Effort `max`.
- **Date** : 2026-09-18. **Rôle** : worker mono-agent + oracle déterministe (garde-fou de réduction AgileGates :
  tâche vérifiable, budget serré → pas de fan-out).
- **Worktree** : `F:\Monark-wt-p0a` ; **branche** `lot/p0-a-dette` ; **HEAD** `fda960e` ; **base** `lot/etude-suite`.
  Topologie mesurée : `merge-base(HEAD, lot/etude-suite) = fda960e`, or `lot/etude-suite = 0d3725f` (avancée depuis
  `fda960e` par des commits de procurement sans rapport). `git diff lot/etude-suite` liste donc 33 fichiers hérités
  du base branch ; **le changeset du lot = 7 fichiers** (cf. `git status --short`).
- **Rattachement** : ADR-M015 D1 (a) [correction 1] + (b) [corrections 2 et 3 — « `@monark/ukemi` retiré ou justifié ;
  commentaires périmés » sont un seul et même item (b), ADR-M015 l.42] ; PLAN-STRATEGIE §2 ligne P0-a ; go investisseur « go »
  2026-09-18. **D1(c) = mesure de l'item (a) M009 = lot distinct, hors périmètre de ce lot** (non livré ici).
  Sources d'entrée : `docs/adr/ADR-M015-phase-portefeuille.md` (Contexte 6, D1), `docs/etude-suite-2026-09-18/CARTOGRAPHIE-code.md` §6.
- **Réviseur** : orchestrateur (Fable 5.1) — vérification adversariale (R-21) et verdict G7 non
  encore rendus ; cette sortie est une donnée brute à vérifier, pas une clôture auto-déclarée.
- **Setup worktree** : `npm ci --offline` requis pour peupler `node_modules` (281 paquets depuis le cache npm, **zéro réseau**
  — « aucune action sortante » respectée ; oracle reproductible ainsi). Le recorder ne fait aucun pull (il consomme la série
  committée `fixtures/usde-calib-series.json`) ; **aucun appel réseau ajouté au test**.

## Fichiers du lot (sha256 = contenu LF ; identique au sha brut, CRLF=0 vérifié byte-level)
| Fichier | Δ (ins/del) | sha256 (LF) | git blob OID |
|---|---|---|---|
| `scripts/record-usde-calib.mjs` (M) | +61 / −33 | `ab8aaf5967e5b1e202df9e92577e4379c527fc12ade8760df33c65efbe134a01` | `f60fc4f2df7ed3e35e2261fd9bcbfc644acbe9c7` |
| `scripts/record-usde-calib.d.mts` (new) | +35 | `2b3c0428c33a3aabef087d2b2ae93465ccfc54a275fa31f82a4379fa435f68eb` | `6acb5a7edc8246f6a938f70a498a9b79f4f8da05` |
| `test/record-usde-calib.test.ts` (new) | +50 | `c7b21b0bf58fb14976ef3096d568cf2342d1c761da5ce5ed8bd71e0de3909838` | `98eb3a3a32028f88629ebca5576244d4cf25f4f1` |
| `packages/monark/package.json` (M) | +1 / −0 | `00174521b2bd8bce7fde0616a03ce8da0651982ee80e2777d921fba687f0efad` | `1534c680d1fd1dec616c635cfc07c5f06b24ef65` |
| `packages/hikae/src/index.ts` (M) | +1 / −1 | `94f5246a86a82652092b4ef9250db2ef73bdc93dd2b060c43fd673a9b9e39a79` | `9dcc2f05f706a0394b3de191aaf6f7e33bd03cb2` |
| `scripts/export-public.mjs` (M) | +3 / −2 | `fc204e4c7aef5d13f667bc2baeab57e00fca063ae0d56f8b903e26e4226d3a51` | `fd7213d19f4ff774fb97f7718a37650e8ae5defc` |
| `test/contracts-frozen.test.ts` (M) | +1 / −1 | `e25b01a9cf3f5c416224573644bacc3ca925db0aa4022138e6872d20a0328b6c` | `9c30dd03870a04125aec6765ecc3488c4df1c8aa` |

`package-lock.json` **non modifié** (`npm install --dry-run --offline` = « up to date »).

## Correction 1 — Recorder q99 fail-closed (ADR-M015 D1(a))
**Défaut** : `q(arr, p)` rendait `Infinity` dès `rank = ceil((n+1)*ALERT_P) > n` (avec `ALERT_P = 0.99` ⇒ n < 99),
et l'alerte rétrospective était masquée par `Number.isFinite(q99)` ⇒ toute population 50 ≤ n < 99 était étiquetée
`under_calib:valid-but-retrospective-negative` alors qu'elle est **indécidable** (q99 non calculable). Frontière mesurée :
`ceil((n+1)*0.99) <= n` ⇔ n ≥ 99 (n=98 : rank 99 > 98 ⇒ indécidable ; n=99 : rank 99 ≤ 99 ⇒ décidable ; USDe n=613 : rank 608 ≤ 613).

**Correctif** (racine, source unique de décidabilité) : `q()` rend désormais **`null`** (jamais `Infinity` — invalide en JSON) quand
`rank > n`. Fonction pure **`evaluateClosure({scores, rho, runVelocities}, cfg)`** extraite (aucune I/O, aucun réseau),
avec `closureOf` à 5 arguments et une **troisième branche explicite** `under_calib:retrospective-undecidable`
(`committable = false`, `q99_calm = null`, `reason = "q99 needs n >= 99 calm pairs; got <n>"`, seuil dérivé de la même
règle : `Math.ceil(ALERT_P/(1-ALERT_P)) = 99`). Priorité des branches : support/dégénérescence → q99-indécidable →
rétrospective-négative → COMMITTABLE. Réconciliation de nommage : le rapport garde le champ **`q99_alert`** (nom pré-enregistré
ADR-M015 D1(a) / avis advisor-architecture, rendu null-safe) ; la fonction pure renvoie **`q99_calm`** (nom d'assertion de la
mission/test) — **même valeur**, null quand indécidable. `main()` derrière un run-guard (`import.meta.url`), donc l'import par
le test n'exécute pas le recorder. Les self-tests C-14 (réachabilité de chaque branche) restent, remontés au module et étendus
à la branche D1(a). **Chemin n ≥ 99 non touché.**

### Preuve byte-identique de la sortie USDe committée (n = 613)
Recorder rejoué sur la série committée `fixtures/usde-calib-series.json` (aucun réseau — le recorder consomme une série committée) :
```
COMMITTABLE: n=613, rho=0.6327, q_hat=0.00013119228083333334, q99=0.000340093727625,
             calib_digest=c9793b281167465af88c9e837aaeaf7fb26c709ff4c5e342c68893e759d9e86c
```
- `fixtures/usde-calib-scores.json` : **git blob `0e7ae59026c8b043bb4d31f2ac447c8966c88532` (inchangé)** ;
  sha256 `e44a68b6b697a32f3f198770e740ab206393dc3425e8cc59e4b0e1e4e65cfd28` ; `git status fixtures/` **propre** (non réécrit).
- `calib_digest = c9793b281167465af88c9e837aaeaf7fb26c709ff4c5e342c68893e759d9e86c` = `USDE_STABLE_RUN_CALIB_DIGEST_PINNED`
  (`apps/harness/src/calibration.ts:158`, fichier **non modifié**).
- Diff stdout rapport (avant/après édition) = **une seule ligne ajoutée** : `+ "reason": null,` (tous les autres champs, dont
  `q99_alert: 0.000340093727625`, `closure: "COMMITTABLE"`, `committable: true`, byte-identiques).

### Test (`test/record-usde-calib.test.ts`, hors CI réseau — aucun pull ajouté)
Alimente la fonction pure avec des séries synthétiques de paires calmes (strictement positives, distinctes ⇒ largeur > 0,
support/activité vrais ⇒ **la décidabilité de q99 est la seule condition en jeu** au bord n=98/99).
- **n = 98** ⇒ `closure === "under_calib:retrospective-undecidable"`, `q99_calm === null`, `committable === false`,
  `reason === "q99 needs n >= 99 calm pairs; got 98"`, `enough_support === true`, `zero_width === false`.
- **n = 99** (bord) ⇒ décidable, `q99_calm` fini, `closure === "COMMITTABLE"` (≠ undecidable).
- **Invariant Infinity** ⇒ `q99_calm === null`, jamais `Infinity`.

### Mutants rejoués (appliqués → test rouge → restaurés byte-exact via backup `recorder.good`)
| Mutant | Mutation | Résultat | Exit |
|---|---|---|---|
| **M1** « Infinity réintroduit » | `q()` : `rank > n ? Infinity` | **ROUGE** — 2 échecs (n=98 : `closure` retombe sur `valid-but-retrospective-negative` **et** `q99_calm = Infinity ≠ null`) | 1 |
| **M2** branche retirée | suppression de `if (!q99Decidable) return "…retrospective-undecidable"` | **ROUGE** — le self-test C-14/D1(a) au niveau module **jette à l'import** ⇒ fichier de test en échec global | 1 |
| **M3** bord off-by-one | `q()` : `rank >= n ? null` (n=99 rendu indécidable) | **ROUGE** — le test **n=99** rougit (bord exactement n=99) ; n=98 reste vert | 1 |
Après restauration : fichier **identique** au backup, recorder **byte-identique** (blob `0e7ae590…`), test **3/3 vert**.

> Note (anti-mésinterprétation) : `JSON.stringify(Infinity)` rendait déjà `null` dans le JSON — le défaut réel était
> **l'étiquette de clôture** (valid-but-retrospective-negative pour un cas indécidable) **et la valeur JS** (`Infinity`
> propagée dans `retroPositive`/`support`), pas le rendu JSON. Le correctif adresse les deux.

## Correction 2 — `@monark/ukemi` dans `packages/monark/package.json` (ADR-M015 D1(b))
Vérifié par **grep** : `packages/monark/src` ne l'importe pas, mais **`packages/monark/test/cross-agent-gate.test.ts:17`
importe `emitPrediction`** (test d'intégration cross-agent gate). La condition de retrait de la mission (« aucun import **ni test**
de `packages/monark` ne l'utilise ») est donc **fausse** ⇒ dépendance **conservée + justifiée en commentaire** (clé `"//"`
top-level, anglais). Vérifié par **`npm install --dry-run --offline`** = « up to date » (npm tolère `"//"`, aucun changement de
lock). **Déviation déclarée** : la clé `"//"` n'a **pas de précédent dans ce dépôt** ; l'alternative idiomatique (déplacer en
`devDependencies`) a été **considérée et non retenue** — hors du menu retirer/commenter de la mission et hors périmètre R-8
(« pas d'autre changement de dépendance »).

## Correction 3 — Commentaires périmés (ADR-M015 D1(b), volet « commentaires périmés » ; aucune assertion changée)
- `packages/hikae/src/index.ts:95` : « no consumer » ⇒ « consumed out-of-tool by the sentinel (apps/sentinel/src/timeline.ts) »
  (preuve : `timeline.ts:13` importe `trackerStep`). « no guarantee claimed » conservé.
- `scripts/export-public.mjs:84-86` : « LICENSE is absent and the real export deliberately fails » ⇒ LICENSE **existe**
  (Apache-2.0, racine, 11 339 o) et est une **entrée fixe REQUISE de `WHITELIST_FILES`** (l.52) ⇒ c'est son **absence**
  (pas sa présence) qui fail-close.
- `test/contracts-frozen.test.ts:56` : nom de test « identical to the Phase 0 manifest (357ef25) » ⇒ « match the current frozen
  manifest (357ef25 baseline, re-pinned by ADR-M001 D9-bis + ADR-M008 D9; not pure Phase 0) » — le manifeste (14 entrées) a été
  re-pinné (`attested-flow.schema.json` ajouté en M008, postérieur à Phase 0). **Aucune assertion modifiée** (docstring l.4-12
  déjà exacte ; grep confirme qu'aucun outil/CI ne dépend de l'ancien nom).

## Oracle brut (arbre final, après les 3 corrections)
```
npm run ci                      -> gate:vocab OK ; tsc 0 ; tests 286, pass 286, fail 0            EXIT 0
npm run lint                    -> eslint . (0 erreur)                                            EXIT 0
npm run lint:ratchet            -> lint-ratchet: 69/69 (plafond non relevé, non croissant)        EXIT 0
node scripts/lang-gate.mjs --scope root  -> 0 non-exempt French hit in scope {root}              EXIT 0
git diff --check                -> (aucune sortie ; pas d'espace/conflit)                          EXIT 0
git diff --stat lot/etude-suite -- schemas packages/contracts  -> VIDE (frozen zone 0 octet)      —
npm run export:check            -> check OK — 0 forbidden path, 0 non-exempt French (tous scopes)  EXIT 0
```
Base (avant lot) pour référence : tests 283, lint 0, ratchet 69/69, lang-gate 0 — le lot ajoute **+3 tests** (286) et **0**
au ratchet (imports typés via `.d.mts`, aucun `any`/unsafe).

## Conformité de périmètre (interdits)
- `schemas/`, `packages/contracts/` : **diff 0 octet** vs base **et** vs HEAD (`git diff --stat … -- schemas packages/contracts` vide).
- `apps/harness/src/tools/**`, `apps/site` : **aucun changement** (`git status --short --` vide sur ces chemins).
- `apps/harness/src/calibration.ts` : **non modifié** (digest committé `c9793b28…` intact).
- **Aucune valeur committée modifiée** : la seule sortie committée du recorder (`fixtures/usde-calib-scores.json`) est
  byte-identique (blob `0e7ae590…`).

## R-25 (méthode nommée)
Méthode : `git diff --numstat HEAD` (fichiers suivis) + `wc -l` (nouveaux fichiers non suivis). **Ajouts code = 67 (suivis) + 85
(nouveaux `.d.mts` + `.test.ts`) = 152 lignes** ; suppressions = 37. Le gros poste (`record-usde-calib.mjs` +61/−33, net +28) est
l'extraction de la fonction pure + la branche fail-closed + la remontée des self-tests. **152 < 400** (analogie F1a 314). Le
présent `docs/G1-lot-p0a.md` (~133 lignes) est un artefact de gouvernance **compté à part** (convention F2-B) ; même compté,
152 + 133 < 400. Lot unitaire (une dette d'entrée, corrections liées).

## Dettes à la clôture
**Zéro dette nue.** Une seule déviation, **déclarée et justifiée** (non un « dû » nu) : nouveau fichier `scripts/record-usde-calib.d.mts`
— hors de la liste énumérée par la mission mais **imposé par la convention du dépôt** (tout `.mjs` importé par un test type-checké
porte un `.d.mts` : précédents `grep-forbidden.d.mts`, `export-public.d.mts`, `release-public.d.mts` ; sinon `tsc --noEmit` rougit
TS7016). Non whitelisté pour l'export (le `test/` racine n'est pas exporté ; précédent `release-public.d.mts`) — vérifié par
`export:check` = 0. À **accepter ou rejeter par l'orchestrateur** au verdict G7.
