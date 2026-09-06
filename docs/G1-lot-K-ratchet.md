claude-opus-4-8[1m]

# G1 — Journal de provenance, Lot K correctif (cliquet de dette de typage)

## GATE-0 / R-1
- Modèle worker résolu = `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme au roster CLAUDE.md 2026-08-14 / ADR-M003 D10 ; `claude-opus-5` banni, non utilisé). Ligne 1 de ce fichier = cette résolution, vérifiable par l'orchestrateur avant consommation.
- Effort `max`. Worker : ne committe pas, ne pousse pas, ne déclenche aucun workflow (R-20). Vérification adversariale G7 = orchestrateur `claude-fable-5-1` (R-21).

## Provenance
- Worktree : `F:\Monark-wt-kratchet`, branche `lot-k-ratchet`, base HEAD `b935b2b` (`b935b2bb1f18cd2d9d781346e3a23a8410be0950`). `npm ci` préexistant. Généré le **2026-09-06**.
- Environnement mesuré : node **v24.15.0**, tsc/typescript **6.0.3**, eslint **10.10.0**, typescript-eslint **8.69.0**, ajv **8.20.0**, ajv-formats **3.0.1**.
- Fichiers touchés (git status, mesuré) : **un seul** — `packages/hikae/test/interval-conformer.test.ts` (M, +19/-9). Aucune autre modification. `lint-ratchet.json` **non modifié** (voir Oracles §3). `packages/hikae/src/l1-split.ts` : restauré byte-identique après le mutant (sha256 inchangé).
- sha256 (final) `packages/hikae/test/interval-conformer.test.ts` = `438407e51c4edc184f8a0317671da5b5b2c903557804e4a8ca325c3b10e9d86b`.
- sha256 `packages/hikae/src/l1-split.ts` (inchangé, avant = après mutant) = `9543f161973028b04717345fe399d917fb50d083d83b115d6dba2a5ba576a479`.
- Consultation advisor intégré (R-26, canal 1) ×2 : avant édition (imports de types **nommés** depuis `ajv/dist/2020.js` retenus contre `typeof import(...).default` — piège d'interop CJS/`default` sous nodenext ; annotation explicite `ValidateFunction<CoverageVerdict>` pour figer la surcharge 139 ; séquence de vérification + mutant par copie) et à la **clôture** (correction d'un commentaire de code au invariant faux « byte-identical » vers « executed logic unchanged », rafraîchissement du sha256, ajout de cette ligne). Avis, jamais verdict — G7 et R-21 restent à l'orchestrateur.

## Mission et périmètre
Le cliquet `scripts/lint-ratchet.mjs` rougissait sur `main` : **107 > plafond 92**. Les 15 violations excédentaires sont toutes dans `packages/hikae/test/interval-conformer.test.ts` (Lot K, mergé avant l'existence du cliquet). Correction par **typage des fixtures** (ADR-M003 D9 ter §3), jamais par `eslint-disable`, jamais en relevant le plafond. Sémantique des assertions du test 34 (oracle q̂/région exacts + couverture moyenne R=100 ≥ 1−α−0.005) **inchangée**.

## 1. Mesure des 15 violations (avant correction)
Réactivation des 6 règles `no-unsafe-*`/`no-explicit-any` de `lint-ratchet.json` sur les tests (même `overrideConfig` que le cliquet), fichier ciblé — mesuré :

| # | Ligne:col (avant) | Règle | Construction fautive |
|---|---|---|---|
| 1 | 22:7 | no-unsafe-assignment | `const ajvMod = require("ajv/dist/2020")` — `require()` renvoie `any` |
| 2 | 23:7 | no-unsafe-assignment | `const Ajv2020 = ajvMod.default ?? ajvMod` — RHS `any` |
| 3 | 23:24 | no-unsafe-member-access | `ajvMod.default` — accès membre sur `any` |
| 4 | 24:7 | no-unsafe-assignment | `const addFormatsMod = require("ajv-formats")` |
| 5 | 25:7 | no-unsafe-assignment | `const addFormats = addFormatsMod.default ?? addFormatsMod` |
| 6 | 25:34 | no-unsafe-member-access | `addFormatsMod.default` |
| 7 | 27:7 | no-unsafe-assignment | `const ajv = new Ajv2020({...})` — instance `any` |
| 8 | 27:13 | no-unsafe-call | `new Ajv2020(...)` — construction d'un `any` |
| 9 | 28:1 | no-unsafe-call | `addFormats(ajv)` — appel d'un `any` |
| 10 | 29:7 | no-unsafe-assignment | `const validateVerdict = ajv.compile(...)` — résultat `any` |
| 11 | 29:25 | no-unsafe-call | `ajv.compile(...)` — appel sur membre `any` |
| 12 | 29:29 | no-unsafe-member-access | `ajv.compile` — accès membre sur `any` |
| 13 | 58:16 | no-unsafe-call | `validateVerdict(rHand.verdict)` — appel d'un `any` |
| 14 | 58:94 | no-unsafe-member-access | `validateVerdict.errors` — accès membre sur `any` |
| 15 | 59:16 | no-unsafe-call | `validateVerdict({ ...rHand.verdict, p_correct: 0.99 })` — appel d'un `any` |

Toutes les 15 proviennent du **montage ajv/`require` non typé** ; les résultats de `conformInterval` étaient déjà pleinement typés (`IntervalConformalResult` : `verdict: CoverageVerdict`, `qhat: number|null`, `region: {lo,hi}|null`), donc **aucune** violation dans les assertions — celles-ci restent intactes.

Constat mesuré : le fichier de référence `packages/ukemi/test/prediction.test.ts` porte le **même** motif de 15 violations (lignes 12-19, 35-36) — il n'est **pas** propre. Conformément à la mission (« comme prediction.test.ts si c'est propre, sinon mieux »), le montage a été **typé proprement** plutôt que recopié. Le plafond résiduel 92 inclut ces 15 de `ukemi` (lot séparé S/I au sens de D9 ter §3, « un lot par package »).

## 2. Correction ligne par ligne (par typage, aucune autre voie)
Ajout de trois `import type` (effacés au runtime) :
- `import type { Ajv2020 as Ajv2020Instance, Options, SchemaObject, ValidateFunction } from "ajv/dist/2020.js";`
- `import type { FormatsPlugin } from "ajv-formats";`
- `import type { CoverageVerdict } from "@monark/contracts";`

et d'un alias `type Ajv2020Ctor = new (opts?: Options) => Ajv2020Instance;`.

Chaque violation et la construction typée qui la supprime :

| # (avant) | Construction typée qui la supprime |
|---|---|
| 1,4 (require) | `require(...) as { default?: T }` — l'annotation `as` change le type de l'expression `any` en objet typé ; l'assignation n'est plus `any`. |
| 3,6 (`.default`) | `.default` est désormais lu sur `{ default?: T }` (type littéral, pas d'index-signature), donc `T | undefined`, pas `any`. |
| 2,5 (Ajv2020/addFormats) | `x.default ?? (x as unknown as T)` a le type `T` (`Ajv2020Ctor` / `FormatsPlugin`), plus `any`. |
| 8 (new), 7 (assign) | `const Ajv2020: Ajv2020Ctor` est un **constructeur typé** ⇒ `new Ajv2020(...)` renvoie une instance typée. |
| 9 (addFormats call) | `const addFormats: FormatsPlugin` est un **appelable typé** (signature d'appel `(ajv: Ajv, opts?) => Ajv`). |
| 12 (.compile), 11 (call), 10 (assign) | `ajv` est une instance typée ; `ajv.compile<CoverageVerdict>(verdictSchema)` renvoie `ValidateFunction<CoverageVerdict>` (surcharge 139, schéma typé `SchemaObject ⊂ Schema`). |
| 13,15 (validateVerdict(...)) | `validateVerdict: ValidateFunction<CoverageVerdict>` est un garde de type `(data) => data is CoverageVerdict` ⇒ appel typé (renvoie `boolean`). |
| 14 (.errors) | `.errors` est `null | ErrorObject[]` sur `ValidateFunction`, plus `any`. |

**Runtime inchangé (invariant chargé)** : tout jeton ajouté pour le typage — `import type`, l'alias `type`, chaque `as`, l'argument de type `<CoverageVerdict>` — est **effacé par le strip-types de Node**. Après effacement, le code exécuté se réduit à `const ajvExport = require(...); const Ajv2020 = ajvExport.default ?? ajvExport; ... ; const validateVerdict = ajv.compile(verdictSchema);` — identique en logique au montage antérieur (seuls des noms de variables changent et un intermédiaire `verdictSchema` remplace l'appel imbriqué). Preuve reproductible : `npm run ci` = **83/83 tests** inchangés (§3).

### Constat toolchain (rapporté, jamais rustiné)
Sous `moduleResolution: nodenext`, l'import de types `from "ajv/dist/2020"` échoue (`TS2307`) car `ajv` n'expose **pas** de champ `exports` et le sous-chemin de types doit porter l'extension explicite : `from "ajv/dist/2020.js"` résout (TS mappe `.js` → `.d.ts` adjacent). Le `require("ajv/dist/2020")` **runtime** n'est pas concerné (résolution CJS). Aucun autre spécifieur du fichier n'était en cause. C'est un constat de résolution, pas une correction de code : aucune dépendance ajoutée (R-8 sans objet), `package.json` inchangé.

## 3. Oracles (mesurés)
1. `node scripts/lint-ratchet.mjs` **avant** : `lint-ratchet: 107/92` — `::error::` ECHEC, exit 1 (rouge, comme attendu).
2. Compte des violations tracées dans le fichier ciblé **après** : **0** (lister à `overrideConfig` identique au cliquet).
3. `npm run lint:ratchet` **après** : `lint-ratchet: 92/92`, exit 0, **aucune** ligne NOTE (donc compte == plafond, pas `<`) ⇒ `lint-ratchet.json` **non modifié** (la clause « toute baisse abaisse le plafond » ne se déclenche que sur `<`, absente ici). `ceiling` reste 92, `measured_on` 2026-09-06.
4. `npm run lint` (`eslint .`, `recommended-type-checked` + `no-floating-promises` réglé) : **0**, exit 0.
5. `npm run ci` (`gate:vocab && typecheck && test`) : **vert** — `tests 83 / pass 83 / fail 0`, exit 0. `tsc --noEmit` strict (TS 6.0.3) : 0 erreur.
6. Mutant nommé du test 34 — q̂ décalé d'un rang dans `packages/hikae/src/l1-split.ts` (`sorted[p - 1]` → `sorted[p - 2]`, ligne 40) :
   - sha256 **avant** = `9543f161973028b04717345fe399d917fb50d083d83b115d6dba2a5ba576a479` ; sauvegarde par **copie de fichier** (`cp` vers scratchpad, jamais `git`).
   - Sous mutant : `✖ interval_conformer_coverage`, `AssertionError` sur « q̂ = ...99e résidu trié = 99 », `98 !== 99`, exit 1 — le test reste **rouge** (l'oracle q̂ exact mord toujours après le refactor de typage).
   - Restauration par **copie de fichier** (`cp` depuis la sauvegarde, **jamais `git checkout`**). sha256 **après** = `9543f161973028b04717345fe399d917fb50d083d83b115d6dba2a5ba576a479` = **avant** (byte-identique). Re-run du test après restauration : `✔ interval_conformer_coverage`, exit 0 (preuve fonctionnelle que la restauration a pris).

## 4. Sources (niveaux [lu]/[abs]/[2nd])
- `F:\Monark\docs\adr\ADR-M003-phase2-integration.md`, addendum **D9 ter §3** et **D9 quater** [lu] — cliquet mesuré, 6 règles OFF sur tests + réactivation/plafond, pendant formé « typage des fixtures (parse puis validation ajv typée), un lot par package (S, I, K) », aucun `eslint-disable`, source unique `lint-ratchet.json` ; D9 quater (3) : English-only = lot transverse E ultérieur (justifie le français de ce journal, comme G1-lot-V.md / G1-lot-K.md).
- `scripts/lint-ratchet.mjs`, `lint-ratchet.json`, `eslint.config.mjs` [lu] — mécanique du gate, 6 règles, plafond 92, `measured_on`, fail-closed.
- ajv **8.20.0** `node_modules/ajv/dist/{2020,core,types/index}.d.ts` [lu] — `Ajv2020 extends AjvCore`, `compile<T>` surcharges (139 `Schema|JSONSchemaType<T> ⇒ ValidateFunction<T>`), `Plugin<Opts> = (ajv: Ajv, opts?) => Ajv`, `ValidateFunction<T> = (data) => data is T` + `errors?: null|ErrorObject[]`, absence de champ `exports`.
- ajv-formats **3.0.1** `node_modules/ajv-formats/dist/index.d.ts` [lu] — `FormatsPlugin extends Plugin<FormatsPluginOptions>`, export `default`.
- `packages/contracts/src/types.ts` [lu] — `CoverageVerdict` (avec `region: PredictionRegion`, `qhat: number|null`) et `PredictionRegion` (union `set`/`interval`) ; export via `@monark/contracts` (`exports["."] = ./src/index.ts`).
- `packages/hikae/src/interval-conformer.ts` [lu] — `IntervalConformalResult` déjà typé (raison pour laquelle les assertions ne portent aucune violation).
- Effacement au runtime (`import type`/`as`/`<T>`/alias `type` par le strip-types de Node) : **vérifié empiriquement** — 83/83 tests inchangés sous `node --test`, logique byte-identique par construction (non [2nd]).

## 5. Clôture — zéro dette
- Aucune dette ouverte. Aucun `eslint-disable`, aucun `any` nouveau, aucune hausse de plafond, aucune autre modification, aucun commit/push.
- Point de toolchain (extension `.js` requise pour l'import de types `ajv/dist/2020` sous nodenext) : **rapporté** ci-dessus (§2), résolu dans le périmètre par le spécifieur canonique nodenext, sans dépendance ni contournement — pas un « dû » nu.
- Sortie destinée à la vérification adversariale de l'orchestrateur (R-21) : chaque affirmation porte sa commande/preuve reproductible.
