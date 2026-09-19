# G2 — delta `6e07274→fededb7` (lot E-honnêteté-2, MONARK), relecteur Opus 4.8

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` — conforme). Effort max. Instance séparée, contexte frais.
**Date** : 2026-09-19. **Rôle** : relecteur G2, PAS générateur. **R-20** : aucun commit, aucun `git` d'écriture, aucun workflow.
**Isolation** : `git archive fededb7` depuis `F:\Monark-wt-ehonnetete` → `F:\tmp\g2-eh2\tree` ; `npm ci --cache F:/tmp/npm-cache` (282 pkgs, exit 0) ; `TEMP/TMP=F:/tmp` forcé sur chaque appel ; toutes écritures sous `F:\tmp\g2-eh2\`. Rien sur C:, rien écrit dans `F:\Monark*`.

## VERDICT : **CONFORME** (code V-1 + V-4 pleinement atteints, branchés, mutation-testés, restaurés byte-exact) — avec **1 correction docs formée (C-1)** + **1 item formé (sentinel README)** à plier par l'orchestrateur avant G7. **Aucun défaut de CODE.** (V-2b relu, résout à fededb7 — voir §V-2b ; une hypothèse « référence pendante » écartée en revue après vérification directe, `error_origin` aurait été relecteur.)

---

## 1. Périmètre du delta — CONFORME

`git diff --name-status 6e07274..fededb7` (rejoué) :
```
A	docs/RAPPORT-lot-e-honnetete-2.md          (+132)
M	docs/adr/ADR-M018-regle-branchement.md     (+1/-1  = une phrase, fold V-2b orchestrateur)
A	scripts/lang-gate.d.mts                     (+13)
A	test/lang-gate-routing.test.ts              (+46)
M	test/public-surfaces-honesty.test.ts        (+16/-3)
```
= exactement les 5 fichiers attendus (le worker n'énumérait que 4 ; ADR-M018 est le fold V-2b de l'orchestrateur, cohérent avec la « Suite » du checkpoint).

Blobs immuables (`git ls-tree` @6e07274 == @fededb7) :
| Fichier | blob @6e07274 | blob @fededb7 | statut |
|---|---|---|---|
| `scripts/lang-gate.mjs` | `38832c5c…` | `38832c5c…` | **byte-intouché** (sha256 contenu `cbf28054…` == valeur RAPPORT worker) |
| `apps/site/lib/fleet.ts` | `f770e191…` | `f770e191…` | **T0 tenu** (identique) |
| `packages/atelier/README.md` | `2df6a945…` | `2df6a945…` | identique (mutant B restauré, sha256 `7c32d726…`) |
| `scripts/export-public.mjs` | `fd7213d1…` | `fd7213d1…` | identique |

## 2. V-1 (épinglage routage `lang-gate.mjs`, C-11 i) — CONFORME

- Le test importe et épingle `classifyScope`/`SCOPES` depuis `../scripts/lang-gate.mjs` (symboles déjà `export`és par le `.mjs` byte-intouché — l'« exporte-les si nécessaire » se réalise par la seule surface de types `.d.mts`).
- Toutes les assertions du test sont **vraies** contre le vrai `classifyScope`/`SCOPES` (relu : branches `apps/bell`, `apps/sentinel`, normalisation `\\`→`/`, préfixe `apps/bell/` incluant tests, fallthrough `root`/`site`/`atelier`).
- **`.d.mts` ne masque PAS un type faux** : `SCOPES: readonly string[]` = sur-typage-lecture SÛR du `string[]` réel (rien de ce que le type autorise n'est invalide à l'exécution) ; `classifyScope(rel: string): string` = signature exacte. **Load-bearing prouvé** : sans le `.d.mts`, `tsc --noEmit` ROUGE `TS7016` (`test/lang-gate-routing.test.ts(15,39)`) ; avec, VERT.
- **Gouvernance-seule (non exporté), mesuré** : `collectFiles().kept` ne contient NI `scripts/lang-gate.d.mts` NI `test/lang-gate-routing.test.ts` NI `test/public-surfaces-honesty.test.ts` (ni aucun `test/` racine) — les nouveaux fichiers ne franchissent pas la whitelist d'export (claim worker confirmé).

### Table mutants V-1 (rejoués dans `F:\tmp\g2-eh2\tree`, restauration byte-exact `cbf28054…`)
| Mutant | Modification | routing test 1 (classifyScope) | routing test 2 (SCOPES) | test 42 | `npm test` |
|---|---|---|---|---|---|
| **Md-only** | retrait branche `apps/bell` (SCOPES intacts) | **ROUGE** (`apps/bell/src/x.ts`→`root`) | vert | **VERT** | 330/329/1 (= worker) |
| **Md+FR** | Md + jeton FR (`le fichier est`) dans `apps/bell/src/digest.ts` | **ROUGE** | vert | **VERT** (fail-open : hit reclassé `root`, non sélectionné par `--scope sentinel,bell`) | 330/329/1 |
| **FR-only** | jeton FR seul, branche `bell` intacte | vert | vert | **ROUGE** (`--scope bell` : 3 hits `le/fichier/est`) | 330/329/1 |
| **Md'** | retrait `"sentinel"` de `SCOPES` | vert | **ROUGE** (`SCOPES must declare 'sentinel'`) | (n/a) | routing-file 2/1/1 |

**Asymétrie mesurée** (le point du checkpoint, mode MAST « faux-vert de garde ») : le MÊME jeton FR dans `apps/bell/src` est attrapé par test 42 quand le routage est correct (FR-only ⇒ test 42 ROUGE) mais **glisse en fail-open** quand la branche `bell` est retirée (Md+FR ⇒ test 42 VERT), et dans ce cas **seul le nouveau routing test rougit**. Md est donc bien attrapé — asymétrie fermée. `error_origin` (rappel checkpoint) : worker (routage non épinglé) + miss G2 initial (Md non rejoué). **Fermé.**
Note : Md' est redondant avec le chemin fail-closed existant (checkpoint Mc), pas un cas d'asymétrie — c'est la non-vacuité de l'assertion SCOPES.

## 3. V-4 (extension oracle racine aux READMEs exportés) — CONFORME

- **Branché** : `surfaces()` dérive les READMEs de `collectFiles(ROOT).kept` (énumérateur d'export RÉEL). Rejoué : `kept` READMEs = `README.md`, `apps/harness/README.md`, `packages/{atelier,hikae,ukemi}/README.md` ; `apps/sentinel/README.md` **absent** (silent-skip) ; `frenchMd`/`missingRequired`/`structuralViolations` **vides**.
- `.mdx` ajouté à `EXTS` ; **0 fichier `.mdx`** au dépôt (inerte aujourd'hui ; item formé worker correctement posé).
- **Census indépendant** `grep -rniE '\b(verified|proven|certified)\b'` sur `apps/harness/README.md` + `packages/*/README.md` = **1 occurrence** :
```
packages/atelier/README.md:22:  (test 26, mutant verified).
```
provenance de test (non-probative), masquée par le span `["provenance","mutant verified"]`. Rien d'autre — identique à la mesure du validateur.

### Table mutants V-4 (rejoués dans `F:\tmp\g2-eh2\tree`)
| Mutant | Modification | attribution | oracle honnêteté | restauration |
|---|---|---|---|---|
| **A** | crée `apps/sentinel/README.md` : `The recorded timeline is verified.` | `kept.includes` = **true**, `frenchMd` = false (rouge = scan, pas drop-FR) | **ROUGE** : `apps/sentinel/README.md:3  verified >> …` (survivor, PAS dead-mask) | `rm` ⇒ absent ; oracle **VERT 2/2** |
| **B** | `verified` nu HORS span en `packages/atelier/README.md:44` | `kept` = true, `frenchMd` = false | **ROUGE** : `packages/atelier/README.md:44  verified >> The render output is verified.` | restauré sha256 `7c32d726…` ; oracle **VERT 2/2** |

Mutant A prouve la couverture de la surface sentinel **dès qu'elle existe**. Mutant B prouve (i) les READMEs de paquets sont bien scannés (l'extension a des dents), (ii) le masque `"mutant verified"` (:22) est **span-spécifique**, PAS un blanchiment de fichier (un autre `verified` nu du même fichier rougit). `error_origin` (rappel) : V-4 = O-7+O-10, worker. **Fermé.**

## 4. Oracle complet — CONFORME (note R-25 = C-1)

```
npm run ci        => gate:vocab OK (156) · tsc 0 · tests 330 / pass 330 / fail 0 · CI_EXIT=0
npm run lint      => exit 0 (eslint .)
npm run lint:ratchet => 69/69, exit 0
node scripts/lang-gate.mjs --scope root,contracts,schemas,site,skills,sentinel,bell
                  => lang-gate OK — 0 non-exempt French hit(s). exit 0
export:check (scope root,contracts,schemas,site,harness,skills,sentinel,bell)
                  => check OK — 0 forbidden path, 0 non-exempt French hit. exit 0
npm run export:check (global 12 scopes)  => check OK, exit 0
node scripts/lang-gate.mjs (global 12 scopes) => OK, exit 0  (0 non-exempt French dans les 12 scopes ; les commentaires « RED by design » du code décrivent un état antérieur où les scopes paquets E-* portaient du français — mesuré vert aujourd'hui, non-défaut)
```

**R-25** — pathspec EXACT `ci.yml:52` (`. ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude)package-lock.json' ':(exclude,glob)fixtures/**/*.{json,jsonl,csv}' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.{json,jsonl,csv}'`), `ac04d41...fededb7` :
- **RAW (docs inclus, ci.yml de CETTE branche)** = **407** (14 fichiers, 389 ins / 18 del)
- **docs `**/*.md` exclus (D9 septies, cible `lot/etude-suite`)** = **264** (11 fichiers, 247 ins / 17 del)
- Tous **≪ 1205** ⇒ **R-25 PASSE** sous toute lecture.
- **C-1 (report-accuracy, error_origin worker, non-bloquant)** : le RAPPORT porte « R-25 **projeté** = 203 + 78 = **281 hors docs** » — une projection pré-commit (à partir du 203 du checkpoint), à **remplacer par la mesure directe** : `ci.yml:52` sur `ac04d41...fededb7` = **407 brut / 264 docs-exclus** (le brut ≠ 203+212=415 : non-additivité du diff de plage, ~8 lignes). R-25 passe (≪ 1205) ; corriger la ligne du RAPPORT vers les valeurs mesurées.

## 5. `apps/sentinel/README.md` absent — confirmé + item formé

Confirmé absent : `kept.includes("apps/sentinel/README.md")` = false ; `git ls-tree -r fededb7 apps/sentinel` sans README. L'export le **silent-skip** (comme `packages/*` optionnels). L'oracle le couvre **dès qu'il existera** (Mutant A). **Item formé** (non-dette), `error_origin` = prémisse checkpoint (surface annoncée non présente au gel) : **(a)** rédiger `apps/sentinel/README.md` (prose anglaise, package-style) — l'oracle + `export:check` le gateront alors automatiquement ; OU **(b)** acter que l'app sentinel reste sans README (silent-skip toléré).

## V-2b (fold ADR-M018, orchestrateur) — VÉRIFIÉ OK, pas de citation fantôme

L'amendement ADR-M018 (dans mon delta) enregistre **où** vit la décision 23 ET **fournit le verbatim inline** (= versement V-2c folded-in). Les trois éléments **résolvent à `fededb7`** :
- CHANTIERS §E `l.67` « Décisions 22-24 : … **M018 D2 ratifié** » ✓
- ADR-EC Q3 `l.78` « Q3 — TRANCHÉE (décision 23) : **ADR-M018 D2 ratifié** » ✓
- verbatim « 3. ta reco » : **présent dans le fichier ADR-M018 lui-même** (`git cat-file blob fededb7:docs/adr/ADR-M018-regle-branchement.md` → 1× « verbatim investisseur « 3. ta reco » ») — c'est le versement V-2c, PAS une référence externe.

**Aucune référence pendante.** Note neutre (non-correction) : le `CHANTIERS.md` de cette branche est antérieur à `23551ca` — son §E porte la forme **résumée** (l.67) tandis que la forme **complète** (bloc verbatim §E l.68 « 1. b 2. ta reco … ») vit sur `lot/etude-suite` (HEAD `2be8b2a`) ; la fusion apporte le §E plus complet, sans conflit (mon delta ne touche pas `CHANTIERS.md`). **Hypothèse écartée en revue** : j'avais d'abord noté une « référence pendante » (grep de CHANTIERS/ADR-EC sans grep de l'amendement lui-même) ; vérification directe du blob ADR-M018 ⇒ verbatim présent, hypothèse **retirée** (sinon `error_origin` = relecteur, classe V-2a). Piège UTF-8 mesuré : `grep 'd.cision'` (`.` = 1 octet) rate `décision` (`é` = 2 octets 0xC3 0xA9) — re-vérifié au mot accentué littéral.

## Preuve d'état inchangé (R-20)
```
F:/Monark-wt-ehonnetete : git status --porcelain = (vide) ; HEAD=fededb78e9ca9993d6a9ce7cda6fc37f1c2a788e
F:/Monark               : git status --porcelain = (vide) ; HEAD=2be8b2a…, branch=lot/etude-suite
```
Aucun commit, aucun `git` d'écriture, aucun workflow. Toutes les mutations rejouées dans la copie `git archive` sous `F:\tmp\g2-eh2\tree` et restaurées byte-exact (sha256 vérifiés).
Note provenance : `F:/Monark` a avancé `2be8b2a → e08a7fc` pendant la revue = **commit de l'orchestrateur** sur `lot/etude-suite` (concurrent, légitime R-20), **pas le mien** ; les deux arbres restent à 0 changement non-committé et ma cible `wt-ehonnetete` est restée épinglée à `fededb7` de bout en bout.

## Synthèse des corrections (liste fermée, à plier par l'orchestrateur avant G7)
- **C-1** (RAPPORT §R-25, error_origin worker) : « R-25 projeté 281 hors docs » → mesure directe **407 brut / 264 docs-exclus** (≪ 1205, R-25 passe).
- **Item sentinel README** (error_origin prémisse checkpoint) : (a) rédiger `apps/sentinel/README.md` OU (b) acter l'absence.
- (V-2b relu = OK ; aucune autre correction.)

Aucun défaut de CODE : V-1 et V-4 fermés, mutants rejoués (Md/Md+FR/FR-only/Md'/A/B) et restaurés byte-exact, suite 330/330 + lint + ratchet 69/69 + lang-gate + export:check verts.
