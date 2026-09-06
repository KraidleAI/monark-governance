claude-opus-4-8[1m]

# G1 — Journal de provenance, Lot E-contracts (ADR-M004 D8, English only)

> **GATE-0 (R-1)** — modèle résolu du worker, vérifié tel quel : `claude-opus-4-8[1m]`
> (préfixe `claude-opus-4-8` attendu ; effort `max`). Worker Opus 4.8, siège worker.
> Opus 5 banni (CLAUDE.md mainteneur 2026-08-14). Aucun tier nu.

## 1. Provenance

| Champ | Valeur |
|---|---|
| Modèle | `claude-opus-4-8[1m]`, effort `max` (roster ADR-M003 D10 ; CLAUDE.md mainteneur 2026-08-14) |
| Date | 2026-09-06 |
| Contexte | Lot E-contracts = campagne « English only » ADR-M004 **D8** sur `packages/contracts/**` ; worktree `F:\Monark-wt-econtracts`, branche `lot-e-contracts`, base `main b929464` (HEAD == main, `git log main..HEAD` vide au départ) |
| Écriture | siège worker (aucune écriture en siège orchestrateur ; D10 non déclenché) |
| Revue | G2 DUE : relecteur `claude-opus-4-8` séparé, contexte frais — non faite par ce worker |
| Verdict | G7 orchestrateur + acceptation validateur-humain — non faits par ce worker |
| Commit | **aucun** (R-20 : seul l'orchestrateur committe) ; **aucun push, aucun réseau** |

## 2. Rattachement normatif (G0)

- **ADR-M004 D8** — traduction en anglais du texte humain (commentaires, JSDoc, noms/messages de tests,
  README de package, `$comment`), **sans toucher** identifiants, clés de schéma, littéraux d'enum, valeurs de fixture.
- **ADR-M001 / ADR-M003 D2** — contrats gelés : test racine `contracts_frozen`.

## 3. Décision « zone gelée » (branche a de la mission) — PROUVÉE

`test/contracts-frozen.test.ts` hashe le **contenu octet par octet** (sha256, LF-normalisé) de **tout**
`schemas/**` **et** `packages/contracts/src/**` (manifeste `test/contracts-frozen.manifest.json`, 13 entrées :
5 schémas + 8 sources). Fonction `sha256()` = `readFileSync` → `replace(/\r\n/g,"\n")` → sha256 du contenu entier
(pas seulement du sens sémantique). **Donc les sources `packages/contracts/src/*.ts` sont gelées au byte près** :
la **branche (a)** de la mission s'applique — **aucun fichier de `src/` n'est modifié** ; leurs commentaires
restent tels quels (exclusion gelée, §5). Seuls `test/`, le README de package et la description `package.json`
sont éligibles à la traduction.

Vérif reproductible : `node --test "test/contracts-frozen.test.ts"` → vert (les deux cas), avant et après le lot.

## 4. Constat central : `packages/contracts/**` est **déjà en anglais**

Inventaire exhaustif de `packages/contracts/**` (hors `node_modules`) = **16 fichiers** : 1 `package.json`,
8 sources `src/*.ts` (gelées), 7 tests `test/*.ts`. **Aucun `README.md` de package** (rien à traduire de ce côté).

- Les **7 fichiers de test** + `fixtures.ts` : commentaires, noms de tests et messages d'assertion **déjà en anglais**
  (lecture intégrale). Seule exception : voir §6.
- `packages/contracts/package.json` `description` : **déjà en anglais** (« Frozen interface contracts for the MONARK fleet… »).
- Les **8 sources `src/`** (gelées) : commentaires **déjà en anglais**.
- **Gate portable reproductible** : `rg -n '[éèàùçêâîôûëïüö]' packages/contracts` → **exit 1 (aucune correspondance)**.
  Corroboré par un scan codepoint-exact (Node `scan.mjs`, appui) : **`Real French-accent characters found: 0`** ;
  recensement non-ASCII = `§`×4, `—`(em-dash)×23, `→`×8, `∪`×1, `≥`×1 — tous typographiques/mathématiques ou signe
  de section, aucun accent français.

Les « 4 lignes accentuées mesurées » de la mission = les 4 `§` (U+00A7) : le byte 0xA7 est le **2ᵉ octet de `ç`**
(UTF-8 `ç`=C3A7), donc un `grep` **orienté octets** (locale non-UTF-8, ex. Git-Bash MSYS ici) fait matcher `§`
dans `[éèàùçêâîôû]`. Ces 4 lignes sont **du texte anglais** dans `src/` **gelé** (voir §7). En grep **UTF-8-aware**
(ripgrep / CI Linux), la même passe rend **0** — cf. §7.

## 5. Fichier touché (état livré)

**Modifié** (1 seul) : `packages/contracts/test/schema.test.ts` — `git diff --stat` = **1 fichier, +1 / −1**.

```
-test("schema rejects a DUPLICATE residual (uniqueItems) — validateur C4 edge case", () => {
+test("schema rejects a DUPLICATE residual (uniqueItems) — validator C4 edge case", () => {
```

Justification : `validateur` (schema.test.ts:106) est la **seule** prose française de tout `packages/contracts/**`
(minuscule, hors zone gelée, dans un **nom de test** — que la mission exige en anglais). Traduction **strictement
conservatrice du sens** : la référence `C4` (item de revue du validateur-humain) est **conservée à l'identique** ;
seule la prose « validateur » devient « validator » (le mot est déjà présent dans le fichier comme nom de fonction,
`validator(...)` L54, donc gate vocab et cohérence lexicale saines). Fichier en **LF** (hexdump L106 se termine `7b 0a`,
`git ls-files --eol` = `w/lf`) → l'édition ne change **aucune** fin de ligne (diff = 1 ligne, pas de réécriture).

**Lecture alternative signalée pour la revue G2/G7** : `validateur` **pourrait** se lire comme référence au **rôle**
`validateur-humain` (nom propre du framework AgileGates). Choix retenu = traduire (règle « noms de tests en anglais » +
indice mission « lignes FR sans accent… comptez-les »), en surfaçant l'alternative pour que l'orchestrateur tranche
en G7 s'il la lit comme nom propre à figer. Impact d'un revert éventuel : trivial (1 ligne).

**Cross-ref historique** : `docs/G1-lot-K.md:254` cite verbatim la **sortie de test** de l'époque
(« … — validateur C4 edge case »). C'est un **enregistrement historique** (journal de provenance d'un autre lot,
hors périmètre) : il reflète l'état au run de Lot K et **n'est pas** mis à jour ici. Aucune dette (record daté).

## 6. Lignes FR restantes — décomptées et justifiées (aucune dette)

Après le lot, il **n'existe plus aucune prose française** dans `packages/contracts/**`. Les seuls tokens
« FR-dérivés » restants sont des **identifiants / clés / valeurs / références** que la mission ordonne de **préserver
au byte près** :

| Token | Classe | Emplacement(s) | Traitement |
|---|---|---|---|
| `octets_recalcules` | clé de schéma / champ | `test/fixtures.ts:15` (clé fixture) ; `src/*` gelé | **préservé** (byte-identique) |
| `verifier_revision` | clé de schéma / champ | `test/fixtures.ts:16` (clé + valeur `"shogen-verifier@abc123"`) ; `src/*` gelé | **préservé** |
| `sens_emis_digest` | clé de schéma / champ | `src/closed-check.ts:17`, `src/types.ts:33,70` (gelé) | **préservé** (gelé) |
| `COVERAGE_REASONS` | identifiant d'enum (import) | `test/enums.test.ts:4,17,18` ; `src/enums.ts`, `src/index.ts` gelé | **préservé** |
| `EntreeDupliquee` | identifiant code Rust (variante d'erreur Shōgen) | `test/schema.test.ts:86` | **préservé** (nom propre code) |
| `CleInconnue` | identifiant code Rust (variante d'erreur Shōgen) | `test/closed-check.test.ts:25` ; `src/closed-check.ts` gelé | **préservé** |
| `temoignage_canonique.rs` | référence de fichier (Rust) | `src/forbidden-keys.ts:4` (gelé) | **préservé** |
| `verite`, `valide`, `verdict_de_verite` | **littéraux `FORBIDDEN_KEYS`** (valeurs) | `src/forbidden-keys.ts:17,19,23` (gelé) ; `schemas/forbidden-keys.json` | **préservé** (traduire casserait le contrat) |
| `harness_version` | (token protégé mission) | **absent** de `packages/contracts` (Shōgen-spécifique, hors périmètre) | n/a |

`validateur` : **0 occurrence restante** dans `packages/contracts` (`grep -rn 'validateur' packages/contracts` → vide).

## 7. Exclusions gelées (déclarées)

1. **8 sources `src/*.ts`** (calib-digest, closed-check, enums, forbidden-keys, index, region, serialize, types) :
   gelées par `contracts_frozen` (hash octet). **Déjà en anglais** ; **non modifiées** (0 diff). Leurs commentaires
   restent tels quels par obligation de gel.
2. **4 lignes `§` (U+00A7)** captées par le grep-octets de la mission — **toutes dans `src/` gelé**, **texte anglais** :
   - `src/forbidden-keys.ts:4` — `* - Shogen 03 §0 (temoignage_canonique.rs L15-19): no truth field, no confidence`
   - `src/types.ts:6` — `* Shogen 03 §0 (no verite, no confidence score, no "validated") ∪ Grok hac-cp.ts:77`
   - `src/types.ts:37` — `/** Canonical designation of the source queried (Shogen 03 §1). */`
   - `src/types.ts:43` — `* then the delegation residual). NEVER aggregated into a single level (03 §2).`
   Ce ne sont **pas** des accents français (faux positif d'octet 0xA7) et le fichier est **gelé** : intraduisibles ici.

## 8. Oracles (sorties exactes, reproductibles)

Toutes les commandes depuis la racine du worktree, après `npm ci` (exit 0).

| Oracle | Commande | Résultat |
|---|---|---|
| CI (vocab + typecheck + tests) | `npm run ci` | **exit 0** — `tests 83 / pass 83 / fail 0` ; `contracts_frozen` **vert** (2 cas) ; `vocab_monark_scope_bans_naked_hermes` vert |
| Lint | `npm run lint` | **exit 0** — 0 problème |
| Lint-ratchet | `npm run lint:ratchet` | **107/92 → exit 1 (ROUGE)** — voir §9 (pré-existant, non causé par ce lot, **inchangé** par l'édition) |
| Gate de langue (byte-grep mission) | `grep -rn -E '[éèàùçêâîôû]' packages/contracts` | **4 lignes**, **toutes** dans `src/` gelé = les 4 `§` (§7). Hors zone gelée : **0** |
| Gate de langue (UTF-8-aware, **portable**) | `rg -n '[éèàùçêâîôûëïüö]' packages/contracts` | **exit 1 = aucune correspondance** (0 accent français) — c'est la source de vérité ; le census `node scan.mjs` (`Real French-accent characters found: 0`) est un appui |

## 9. Lint-ratchet 107 > 92 — ROUGE **pré-existant**, attribution exacte (pas de dette nue)

Le ratchet réactive en `error` les 6 règles `no-unsafe-*` / `no-explicit-any` sur les **fichiers de test**
(mises en `off` par `eslint.config.mjs` selon ADR-M003 D9 ter §3) puis compte. **Baseline sur `main`/HEAD (avant
toute édition) : 107** — déjà > plafond `92`. Ce n'est **pas** ce lot qui rougit le gate.

**Attribution au byte près** (reproductible) :
- Plafond `92` commis au commit **`af1f95a`** (« Lot V — DEVOPS », 2026-09-06 ; `git log -1 -- lint-ratchet.json`).
- Répartition actuelle des 107 (ESLint API, 6 règles réactivées sur `**/*.test.ts` + `test/**`) :
  `contracts/test/contracts.test.ts` 23, `contracts/test/schema.test.ts` 20, `test/fixtures-root.test.ts` 16,
  `hikae/test/interval-conformer.test.ts` 15, `ukemi/test/prediction.test.ts` 15, `contracts/test/enums.test.ts` 9,
  `test/ci-gates.test.ts` 9.
- Au commit `af1f95a`, les fichiers **alors existants** somment à **exactement 92** :
  `23 + 20 + 16 + 15(ukemi/prediction) + 9 + 9 = 92`.
- `git diff af1f95a HEAD --stat -- '*.test.ts' 'test/' 'packages/*/test/'` montre que **`packages/hikae/test/interval-conformer.test.ts`
  a été AJOUTÉ après `af1f95a`** (nouveau fichier, +106) — il apporte **+15** violations → **92 + 15 = 107**.
- **Commit propriétaire** (`git log --oneline af1f95a..HEAD -- packages/hikae/test/interval-conformer.test.ts`) :
  **`c05b7f6`** « Lot K — UKEMI Phase 2: interval conformer, liquidable-24h synthetic class, Rogers-Veraart… ; tests 34-37 ».

**Conclusion** : la brèche 92→107 est **entièrement** due à l'ajout post-`af1f95a` de `hikae/interval-conformer.test.ts`
(commit **`c05b7f6`**, **Lot K**) — workstream **D9 ter** « typer les fixtures, un lot par package S/I/K », **pas**
le Lot E-contracts (traduction). Le plafond n'a pas été rebumpé/abaissé par le lot propriétaire.

**Effet de ce lot** : `npm run lint:ratchet` = **107 avant ET après** l'édition (l'édition ne touche qu'un **littéral de
chaîne** dans un nom de test ; aucune des 6 règles typées ne s'y applique). Le cliquet **ne monte pas** (contrainte
« ne doit pas monter » respectée : 107 → 107).

**Traitement zéro-dette (P5)** : ce ROUGE est **signalé** à l'orchestrateur/mainteneur comme **dette pré-existante
attribuée**, **hors périmètre traduction** ; le worker **ne bumpe pas** `lint-ratchet.json` (interdit) et **ne type
pas** les fixtures (siège worker, hors scope de ce lot). Résolution recommandée = le lot D9 ter propriétaire (hikae)
type `interval-conformer.test.ts` (parse + ajv typé) **ou** l'orchestrateur ré-aligne le plafond par ADR. G7 = décision
orchestrateur.

## 10. Mesure R-25

- **Changement de traduction (livrable du lot)** : `git diff --shortstat HEAD -- packages/contracts` = **1 fichier, +1 / −1**.
- **Mesure R-25 complète** (commande mission, inclut ce journal) :
  `git add -N . && git diff --shortstat HEAD -- . ':(exclude)package-lock.json' && git reset`
  → **`2 files changed, 187 insertions(+), 1 deletion(-)`** (= 188 lignes) — **≤ 1205** ✅
  (dominé par ce journal, +186 ; le code = +1/−1). `git status --short` = exactement 2 chemins
  (`packages/contracts/test/schema.test.ts` modifié ; `docs/G1-lot-E-contracts.md` nouveau) ; `node_modules/` gitignoré.

## 11. Hors périmètre (signalé pour le lot propriétaire)

Le répertoire **racine** `test/` porte des **noms de tests en français** (hors `packages/contracts/**`, donc **hors
Lot E**) : `test/contracts-frozen.test.ts` (« … identiques au manifeste Phase 0 (357ef25) », « … n'est pas vide et
couvre les 5 schémas »), `test/ci-gates.test.ts` (« workflow bloquant et épinglé »), `test/fixtures-root.test.ts`
(« 9 états, hash == manifest », « ajv + gardes runtime Phase 0, répartition 3/2/3/1 »), et `scripts/grep-forbidden.mjs`
(nom de test vocab FR). À traiter par le lot « English only » couvrant la **racine** (`test/`, `scripts/`), pas ici.

## 12. Clôture zéro dette

- Livrable : 1 traduction sûre (`validateur`→`validator`), sens et références conservés ; `src/` gelé intact (0 diff).
- Oracles bloquants du périmètre : CI **vert** (83, `contracts_frozen` vert), lint **0**, gate de langue **0 hors zone gelée**.
- Cliquet : ROUGE **pré-existant, attribué, inchangé** (§9) — remonté formé, jamais contourné.
- Aucun `eslint-disable`, aucun changement d'identifiant/valeur/clé/littéral, aucun commit, aucun push, aucun tier nu.

---
*Worker `claude-opus-4-8[1m]`, effort max. Chaque chiffre/commande est rejouable (R-21). Le worker ne committe pas (R-20) ;
revue G2, verdict G7 et acceptation validateur = orchestrateur/validateur.*
