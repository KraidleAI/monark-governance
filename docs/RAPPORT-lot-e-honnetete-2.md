# RAPPORT — lot E-honnêteté-2 (worker Opus 4.8)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` requis — conforme).
**Effort** : max. **Worktree** : `F:\Monark-wt-ehonnetete`, branche `lot/e-honnetete`, HEAD de départ `6e07274` (gel E-honnêteté).
**Date** : 2026-09-19. **Contexte** : suite checkpoint-2 (`docs/CHECKPOINT2-lot-e-honnetete.md`), liste fermée V-1 + V-4, code bloquant.
**Scratch** : `F:\tmp\ehonnetete-2\` uniquement ; `TEMP/TMP=F:/tmp`, `npm_config_cache=F:/tmp/npm-cache` ; rien sur C:.
**R-20** : aucun commit, aucun `git` d'écriture, aucun workflow déclenché — l'orchestrateur (Fable 5) le fera.

---

## Delta (3 fichiers de code + ce rapport)
| Fichier | Nature | numstat |
|---|---|---|
| `test/lang-gate-routing.test.ts` | NOUVEAU (V-1) | +46 |
| `scripts/lang-gate.d.mts` | NOUVEAU (V-1, surface de types) | +13 |
| `test/public-surfaces-honesty.test.ts` | MODIFIÉ (V-4) | +16 / −3 |
| `docs/RAPPORT-lot-e-honnetete-2.md` | NOUVEAU (ce rapport, docs) | — |

`scripts/lang-gate.mjs`, `apps/site/lib/fleet.ts`, `packages/atelier/README.md`, `apps/sentinel/README.md` : **NON modifiés** (mutants procéduraux restaurés byte-identiques, voir plus bas).

---

## V-1 — Épinglage du routage de `lang-gate.mjs` (C-11 i, ADR-EC)

### Constat
`classifyScope` et `SCOPES` étaient **déjà exportés** par `scripts/lang-gate.mjs` (l.136 `export function classifyScope`, l.117 `export const SCOPES`) : **aucune modification du `.mjs` n'était nécessaire** pour l'import (le comportement CLI est intact). L'« exporte-les si nécessaire » de la mission se réalise donc uniquement par une **surface de types** `.d.mts` (le `.mjs` reste byte-identique au gel).

### Fichiers
- **`test/lang-gate-routing.test.ts`** (nouveau, gouvernance-seule : racine `test/`, non-whitelistée pour l'export — mesuré : 0 fichier de `test/` racine dans `collectFiles().kept`). Deux tests non-LLM :
  - `lang_gate_classifyScope_routes_off_tool_app_source_trees` — assertions :
    - `classifyScope("apps/bell/src/x.ts") === "bell"`
    - `classifyScope("apps/sentinel/src/x.ts") === "sentinel"`
    - `classifyScope("apps\\bell\\src\\digest.ts") === "bell"` (normalisation des séparateurs Windows)
    - `classifyScope("apps/bell/test/x.test.ts") === "bell"` — **valeur attendue documentée : `"bell"`** (le préfixe est `apps/bell/`, pas `apps/bell/src/` : tout l'arbre off-tool, tests inclus, est gaté en anglais)
    - `classifyScope("apps/sentinel/test/x.test.ts") === "sentinel"`, `classifyScope("apps/bell") === "bell"`, `classifyScope("apps/sentinel") === "sentinel"`
    - sanité de fallthrough : `scripts/lang-gate.mjs → root`, `apps/site/lib/fleet.ts → site`, `packages/atelier/README.md → atelier`
  - `lang_gate_SCOPES_declares_the_off_tool_app_scopes` — `SCOPES` contient `sentinel` **et** `bell`, et **l'union de tous les ensembles gatés** ⊆ `SCOPES` : test 42(c) `{root,contracts,schemas,site,harness,skills,sentinel}`, test 42(c-bis) `{sentinel,bell}`, appel checkpoint/lot `{root,contracts,schemas,site,skills,sentinel,bell}` (une valeur inconnue ferait sortir lang-gate en code 2 ; `harness` est inclus dans la boucle).
- **`scripts/lang-gate.d.mts`** (nouveau) : surface de types pour `classifyScope(rel: string): string` et `SCOPES: readonly string[]`, sur le patron exact de `scripts/export-public.d.mts` / `scripts/grep-forbidden.d.mts`. Requis car aucun test `.ts` n'importait `lang-gate.mjs` auparavant (donc pas de `.d.mts` sœur) ; sans elle `tsc --noEmit` échoue en TS7016. Gouvernance-seule, non-whitelistée (aucun `.ts` exporté n'importe `lang-gate.mjs` — mesuré, `grep` sur `packages/*/test`, `apps/{harness,sentinel,bell}/test` = 0).

### Mutant Md rejoué (faux-vert mesuré du checkpoint)
Md = retrait de la branche `apps/bell` de `classifyScope` (l.141 `if (p === "apps/bell" || p.startsWith("apps/bell/")) return "bell";`), **SCOPES intacts**. Procédure (backup `F:\tmp\ehonnetete-2\lang-gate.mjs.bak`, restauration byte-identique) :

- `sha256` avant : `cbf280547595127e7292e811c4649924efd0fb7d5ec525825475d5839c775eef`
- blob git (worktree) avant : `38832c5c2aa14a72c09b53d95e68654d2d3bc925` == `HEAD:scripts/lang-gate.mjs` (byte-identique au gel — je n'ai jamais touché le `.mjs`)
- sous Md : `classifyScope("apps/bell/src/x.ts") => "root"` (fail-open confirmé), `SCOPES.includes("bell") => true` (intact) ⇒ **`test/lang-gate-routing.test.ts` ROUGE** (`AssertionError`, `apps/bell/src/x.ts` attendu `bell`, obtenu `root`)
- **restauration** : `sha256` après = `cbf280547595127e...c775eef` (identique) ; blob après = `38832c5c...` **== HEAD** ; `git status --porcelain scripts/lang-gate.mjs` = vide
- après restauration : `test/lang-gate-routing.test.ts` **VERT** (2/2)
- **Rejeu Md contre `npm test` complet** (mesuré, `F:\tmp\ehonnetete-2\md-full-npmtest.log`) : `tests 330 / pass 329 / fail 1` — l'**unique** rouge est `lang_gate_classifyScope_routes_off_tool_app_source_trees` ; **test 42 reste VERT** (30,7 s). C'est exactement l'asymétrie mesurée du checkpoint : Md est fail-open pour le chemin export/test-42 (`apps/bell` non exporté ⇒ hit reclassé `root`, non sélectionné), et seul ce test de routage l'attrape. G2 rejouant Md verra donc 329/330, l'écart = ce test (attendu, pas un défaut).

`error_origin` (rappel checkpoint) : worker (routage non épinglé) + miss relecteur G2 (Ma/Mb rejoués, pas Md). **Fermé ici.**

---

## V-4 — Extension de l'oracle racine `public_surfaces_make_no_probative_claim` aux READMEs exportés

### Modifications (`test/public-surfaces-honesty.test.ts`)
1. `EXTS` : ajout de `.mdx` → `new Set([".ts", ".tsx", ".md", ".mdx"])`. **Inerte aujourd'hui** : 0 fichier `.mdx` dans le dépôt (mesuré `git ls-files | grep -i .mdx` = vide) ; future-proofing du walk `apps/site`. **Aucun mutant synthétique n'exerce la branche `.mdx`** (aucun fichier à scanner) — l'en-tête du test annonce pourtant `.mdx` comme scanné : **item formé** (non-dette) — au premier `.mdx` sous `apps/site`, ajouter un span/mutant au census honnêteté.
2. `import { collectFiles } from "../scripts/export-public.mjs"` (précédent : `test/harness-export.test.ts`, `test/skills.test.ts` importent déjà ce module ; run-guardé, sans effet de bord à l'import ; `scripts/export-public.d.mts` fournit les types).
3. `surfaces()` : après le corpus existant (README racine + `apps/site` + `skills/monark/*.md`), ajout de **chaque README que l'export publie**, **dérivé de l'énumérateur réel** `collectFiles(ROOT).kept` (filtre `rel === "README.md" || rel.endsWith("/README.md")`), dédupliqué par `new Set`. **Branchement** (règle mainteneur) : la liste des surfaces suit automatiquement `scripts/export-public.mjs` — `apps/harness/README.md`, `packages/*/README.md`, et `apps/sentinel/README.md` dès qu'il existera (silent-skip d'un sous-chemin absent, exactement comme l'export ; un README français serait dans `frenchMd`, pas `kept`, donc ni publié ni scanné). C'est plus fort que la dérivation littérale de `PACKAGE_SUBPATHS` proposée en repli : source unique de vérité = l'export lui-même.

### Census (grep -rniE du motif `\b(verified|proven|certified)\b` sur les READMEs exportés)
READMEs exportés (`kept`, mesuré) = racine (déjà scanné), `apps/harness/README.md`, `packages/{atelier,hikae,ukemi}/README.md` ; `apps/sentinel/README.md` **absent** (silent-skip). Résultat du census :

```
packages/atelier/README.md:22:  (test 26, mutant verified).
```

**Une seule occurrence** — identique à la mesure du validateur. C'est une **provenance de test** (« le paquet et le rendu passent grep-forbidden (test 26, mutant verified) »), licite (non-probative), **pas un surclaim**. Confirmation par l'oracle lui-même (et non par le grep seul) : après extension de `surfaces()` mais **avant** ajout du masque, l'oracle rougit sur **exactement** `packages/atelier/README.md:22 verified >> (test 26, mutant verified).` et rien d'autre.

### Masque (liste `LICIT`, +1 entrée)
```
["provenance", "mutant verified"], // packages/atelier/README.md:22 — grep-forbidden test 26 mutant provenance (V-4)
```
Span multi-mots (interdiction du token nu conservée) ; non-vacuité automatiquement assertée (l'assertion existante exige que chaque span `LICIT` apparaisse ≥1 fois dans le corpus — `packages/atelier/README.md` y est désormais). **Aucune prose de surface modifiée** : aucun VRAI surclaim n'est apparu dans les READMEs ajoutés (pas de correction « verified→attested » à consigner). Après ajout du masque : oracle **VERT** (2/2).

### Mutants V-4 (teeth des nouvelles surfaces)
- **Mutant A (mission)** — `apps/sentinel/README.md` absent créé temporairement avec un surclaim anglais (zéro FR_WORD, zéro diacritique : `The recorded timeline is verified.`). Attribution vérifiée AVANT l'oracle : `collectFiles().kept.includes("apps/sentinel/README.md") === true` (rouge attribuable au scan, pas à un drop-français). Oracle **ROUGE** : `apps/sentinel/README.md:3 verified >> The recorded timeline is verified.` **Restauration** : `rm` ⇒ absent ; `git status --porcelain apps/sentinel/README.md` = vide ; oracle **VERT**. (Preuve : la surface sentinel est couverte dès qu'elle existe.)
- **Mutant B (byte-identique, README présent)** — injection d'un surclaim nu `The render output is verified.` en ligne 44 (hors span masqué) de `packages/atelier/README.md`. Oracle **ROUGE** : `packages/atelier/README.md:44 verified >> ...` (⇒ le masque `"mutant verified"` de la l.22 ne blanchit PAS un autre `verified` nu du même fichier : le masque est spécifique au span, pas au fichier). **Restauration** depuis backup : blob `2df6a9456b4bea502ed8c3b9d4a0d533ec7d998d` **== `HEAD:packages/atelier/README.md`** (byte-identique) ; `git status` vide ; oracle **VERT**.

`error_origin` (rappel checkpoint) : V-4 = O-7 + O-10, worker. **Fermé ici.** Observation formée : voir §Reste.

---

## Sorties d'oracle (toutes vertes)

```
############ npm run ci ############
gate:vocab OK — scanned 156 file(s), no forbidden claim.
tsc --noEmit           => exit 0
node --test summary:
  ℹ tests 330
  ℹ pass  330
  ℹ fail  0
  (dont ✔ export_public_no_governance_no_french — clean public export (test 42) 30160ms,
        ✔ public_surfaces_make_no_probative_claim,
        ✔ public_surfaces_make_no_probative_claim — scrub is load-bearing (synthetic mutants),
        ✔ lang_gate_classifyScope_routes_off_tool_app_source_trees,
        ✔ lang_gate_SCOPES_declares_the_off_tool_app_scopes)
CI_EXIT=0
```
(330 = 328 du gel + 2 tests de routage V-1 ; l'oracle honnêteté garde ses 2 blocs `test()`.)

```
############ npm run lint ############              => exit 0 (eslint . : 0)
############ npm run lint:ratchet ############      => 69/69, exit 0 (aucun nouveau `any` : d.mts + tests sans no-unsafe)
############ node scripts/lang-gate.mjs --scope root,contracts,schemas,site,skills,sentinel,bell ############
  lang-gate OK — 0 non-exempt French hit(s) in scope {root,contracts,schemas,site,skills,sentinel,bell}.  => exit 0
############ npm run export:check ############
  check OK — 0 forbidden path, 0 non-exempt French hit in scope {…,sentinel,bell}.                        => exit 0
```

---

## Diff stat + R-25 (pathspec `ci.yml:52`, exclusions D9/D9 quater/sexies)

- **R-25 committé** `ac04d41..6e07274` : `11 files changed, 185 insertions(+), 18 deletions(-)` ⇒ **203** (= checkpoint ; `185+18`).
- **Mon delta code (working tree)** :
  - `test/public-surfaces-honesty.test.ts` : +16 / −3
  - `scripts/lang-gate.d.mts` : +13 (nouveau ; dernier octet `0a` vérifié ⇒ `wc -l` == numstat git exact)
  - `test/lang-gate-routing.test.ts` : +46 (nouveau ; dernier octet `0a` vérifié)
  - **= +75 / −3 = 78 lignes changées** (cible « +80 » atteinte)
- **R-25 projeté (code seul, après commit orchestrateur)** = 203 + 78 = **281 ≤ 1 205**. ✅
- **`docs/RAPPORT-lot-e-honnetete-2.md`** : ce fichier compte sous le pathspec **de cette branche** (`lot/e-honnetete` n'exclut pas `docs/**/*.md` — seulement `docs/G1-lot-*.md` / `docs/G2-lot-*.md`). À l'intégration sur `lot/etude-suite` (qui porte ADR-M003 **D9 septies**, `docs/**/*.md` hors R-25, cf. `3f2f19c`), il **cesse de compter**. R-25 projeté full (branche courante) reste **≪ 1 205**.
- **T0 / CA-11** : `apps/site/lib/fleet.ts` blob `f770e191ba9378aa3ac6be31a026579300c4c230` **== HEAD**, `git status` vide — intact. Aucune pièce « built » nouvelle ; le seul consommateur nouveau (l'oracle racine) est branché sur `collectFiles` (surface servie de l'export) et couvert par un test non-LLM rejouant la composition.

`git status --porcelain` final = exactement `M test/public-surfaces-honesty.test.ts`, `?? scripts/lang-gate.d.mts`, `?? test/lang-gate-routing.test.ts`, `?? docs/RAPPORT-lot-e-honnetete-2.md` (+ ce rapport). Rien d'autre.

---

## Reste (doit être vide de dettes)
- **Aucune dette de code.** V-1 et V-4 fermés, mutants rejoués et restaurés byte-identiques, suite verte.
- **Observation formée (non-dette, déclencheur fourni)** : `apps/sentinel/README.md` est **absent** alors que le checkpoint (V-4) et l'orchestrateur le listaient comme surface exportée (`apps/harness` en a un ; `apps/sentinel` non ; l'export le silent-skip). Ce n'est PAS un surclaim ni un trou d'oracle : l'oracle le couvre **dès qu'il existera** (Mutant A le prouve). Rédiger un README est de la **prose**, hors périmètre de ce worker (contrainte « aucune modification de prose des surfaces sauf vrai surclaim »). **Item formé** — décision + déclencheur pour l'orchestrateur/investisseur : (a) créer `apps/sentinel/README.md` (prose anglaise, package-style, comme `apps/harness/README.md`) — l'oracle et `export:check` le gateront alors automatiquement ; OU (b) acter que l'app sentinel reste sans README (silent-skip toléré par l'export). `error_origin` : prémisse checkpoint (surface annoncée non présente au gel). Aucun contournement : le mécanisme de couverture est déjà en place et prouvé.
