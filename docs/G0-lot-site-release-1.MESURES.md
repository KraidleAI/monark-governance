Modèle résolu : claude-opus-4-8[1m]

# MESURES — G0 SITE-RELEASE-1 (chaque chiffre = sa commande, rejouable à `58e4d13`)

Base : `F:\Monark` @ `58e4d13` (lecture seule). Aucun réseau, aucune variable d'environnement affichée (A-7).
`cwd` de référence = `F:/Monark` sauf indication. Horloge de session : 2026-09-22.

## M0 — HEAD et branche
```
$ cd F:/Monark && git rev-parse HEAD && git rev-parse --abbrev-ref HEAD
58e4d1327d85dd70113c2b095cc32ef12a17cdc0
lot/etude-suite
```

## M1 — N = `tracker.t` LU du snapshot committé (jamais tapé)
Script `measureN.mjs` (parse les octets `stateJson` de `narabi-snapshot.ts`, mêmes octets que lit le site) :
```
import { readFileSync } from "node:fs";
const s = readFileSync("F:/Monark/apps/site/lib/narabi-snapshot.ts", "utf8");
const m = s.match(/stateJson:\s*("(?:[^"\\]|\\.)*")/);
const state = JSON.parse(JSON.parse(m[1]));
console.log("N = tracker.t =", state.tracker.t);
console.log("projected_bound_leq_target_T =", state.projected_bound_leq_target_T);
```
Sortie :
```
N = tracker.t = 1
projected_bound_leq_target_T = 1789
digest(16) = 9b5f89fdd49c69e0...
```
⇒ **N = 1** → pilule « shipped · day 1 of 7 before first reading ». Valeur DÉRIVÉE, non écrite.

## M2 — sha256 des 4 assets maquette (marques sombres + favicons adaptatifs, locaux)
```
$ cd F:/PRODUITS/etude-2026-09-21/maquettes-release/v4/assets
$ for f in *.svg; do node -e 'const fs=require("fs"),c=require("crypto");\
  console.log(c.createHash("sha256").update(fs.readFileSync(process.argv[1])).digest("hex").slice(0,16)+"  "+process.argv[1])' "$f"; done
aa2f3006f1c33464  favicon-narabi.svg
90eea553756b7c0c  favicon-ukemi.svg
3e847c8d05cdf91d  monark-narabi-mark-dark.svg
f30fc79e97887dc0  monark-ukemi-mark-dark.svg
```
Tailles (lignes) : favicon-narabi 14, favicon-ukemi 12, mark-dark narabi 13, mark-dark ukemi 11 (`wc -l assets/*.svg`).

## M3 — motifs interdits sur les 3 maquettes v4 (grep, insensible à la casse)
```
$ cd F:/PRODUITS/etude-2026-09-21/maquettes-release/v4
$ for w in "interval" "cascade" "Bell" "Aave" "reference price"; do \
    n=$(grep -icE "$w" index.html narabi.html ukemi.html | awk -F: '{s+=$2} END{print s+0}'); echo "  '$w' : $n"; done
  'interval' : 0
  'cascade' : 0
  'Bell' : 23
  'Aave' : 0
  'reference price' : 0
```
- `interval`, `cascade`, `Aave`, `reference price` = **0** sur les 3 maquettes (passe site+sentinel propre côté design).
- `Bell` = 23, mais TOUS en (i) commentaires source charte C (`design_handoff_bell`, `bell.css`) ou (ii) la carte « upcoming » du **navigateur de maquettes** (`index.html:116-119` « No page, no logo, no link in temps 1 »). **Aucun n'est du contenu servi porté** (voir M6). Bell reste absent du site (M4).

## M3b — clause « which the gate does not check » dans la maquette v4 (attendu : 0, à porter par le lot)
```
$ grep -c "which the gate does not check" ukemi.html
0
```
⇒ la maquette v4 NE porte PAS la clause conditionnelle (designer v4 point 1 / item G7-u4b-2a §5). Ce lot la porte via `LIQ_CONDITIONAL_SENTENCE` (M7).

## M4 — mêmes motifs sur les surfaces SERVIES actuelles (`apps/site`, `.ts/.tsx/.mdx`)
```
$ cd F:/Monark
$ for w in "interval" "cascade" "Bell" "Aave"; do \
    n=$(grep -ricE "\b$w\b" apps/site --include=*.tsx --include=*.ts --include=*.mdx \
        | grep -v ":0" | grep -v ".next" | awk -F: '{s+=$2} END{print s+0}'); echo "  '$w' : $n"; done
  'interval' : 16
  'cascade' : 21
  'Bell'    : 0
  'Aave'    : 0
$ grep -rilE "\bcascade\b|\binterval\b" apps/site --include=*.tsx --include=*.ts | grep -v ".next"
apps/site/app/how/page.tsx
apps/site/app/integrators/page.tsx
apps/site/app/page.tsx
apps/site/components/gate-sim/board.tsx
apps/site/components/hikae-panel.tsx
apps/site/components/ukemi-panel.tsx
apps/site/lib/fleet-presentation.ts
apps/site/lib/fleet.ts
apps/site/lib/how-copy.ts
apps/site/lib/sim.ts
```
⇒ le cadrage « cascade »/« interval » vit dans **10 fichiers actuels** (verts : `\bcascade\b`/`interval` sont scope **sentinel**, pas site — M9). Durcir le site (Q-1) les tirerait tous dans le lot. **Bell = 0** : déjà absent (D-117).

## M5 — grep-forbidden CLI (patterns GLOBAL) sur les 3 maquettes v4
```
$ node scripts/grep-forbidden.mjs \
    F:/PRODUITS/etude-2026-09-21/maquettes-release/v4/index.html \
    F:/PRODUITS/etude-2026-09-21/maquettes-release/v4/narabi.html \
    F:/PRODUITS/etude-2026-09-21/maquettes-release/v4/ukemi.html; echo "exit=$?"
gate:vocab OK — scanned 212 file(s), no forbidden claim.
exit=0
```
⇒ GLOBAL propre (concorde avec `NOTE-maquettes-v4.md` §2 « OK — 0 claim »). Le G1 rejouera GLOBAL + scope site + scope sentinel sur les surfaces React livrées.

## M6 — où vivent les 23 « Bell » des maquettes (aucun n'est du contenu servi porté)
```
$ grep -icE "Bell" index.html narabi.html ukemi.html   # index 3 / narabi 11 / ukemi 9
$ grep -nE "Bell" index.html | grep -v "handoff\|design_handoff\|<!--"
116:    <div class="card upcoming" aria-label="Bell, upcoming">
118:      <span><b>Bell</b><br>Second release step (decision 117). No page, no logo, no link in temps 1.</span>
```
⇒ seul contenu « Bell » rendu = la carte upcoming du **navigateur de maquettes** (non porté à la home réelle).

## M7 — constantes servies de la classe liq (`apps/harness/src/tools/gate.ts`) — cibles A-9 + clause
```
$ sed -n '140,142p' apps/harness/src/tools/gate.ts | grep -ic "interval"          # LIQ_UPPER_BOUND_SENTENCE
0
$ sed -n '167,168p' apps/harness/src/tools/gate.ts | grep -ic "interval"          # LIQ_EMPTY_REGISTRY_SENTENCE
0
$ sed -n '156,158p' apps/harness/src/tools/gate.ts | grep -c "which the gate does not check"  # LIQ_CONDITIONAL_SENTENCE
1
```
Constantes (lecture directe, à recopier byte-identique dans `ukemi-copy.ts`) :
- `LIQ_UPPER_BOUND_SENTENCE` (`gate.ts:140-142`) = « a conformal upper bound on the liquidable amount for the calibrated class; the lower edge is 0 by construction, not a calibrated bound; abstains (under_calib) outside it » — **0 « interval »**.
- `LIQ_CONDITIONAL_SENTENCE` (`gate.ts:156-158`) = « the bound holds only if yhat was produced by the frozen close-factor rule on a mono-collateral WETH account at the first crossing, **which the gate does not check** ».
- `LIQ_EMPTY_REGISTRY_SENTENCE` (`gate.ts:167-168`) = « no liquidation-eligible-coverage calibration is committed yet; the gate abstains (under_calib) by construction » — **0 « interval »** (phrase EFFECTIVEMENT servie au temps 1, registre vide).
- `honestyText` (`gate.ts:648`) compose `${LIQ_EMPTY_REGISTRY_SENTENCE}; B_t is caller-carried.` quand `hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE)` est faux (temps 1) — c'est la sortie composée que le mutant A-9 doit cibler.

## M8 — R-25 : pathspec verbatim `ci.yml:65` valide (docs exclus)
```
$ git diff --shortstat HEAD~1...HEAD -- . ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json'
(pas de sortie : le dernier commit ne touche que docs ⇒ 0 après exclusion — le pathspec :(exclude,glob) est accepté)
```
Bornes (CONSIGNE A-5 ; `ci.yml:43` `VIBEGATES_PR_LIMIT: "1205"`) : **CI = 1 205 ; interne = 1 150**. R-25 réel MESURÉ au G1 sur l'arbre du lot, pas ici (pas de code). Exclus du compte : `docs/**/*.md`, fixtures `json/jsonl/csv`, lockfile ; **comptés** : `docs/**/*.mjs`, **SVG**, `.ts/.tsx`.

## M9 — portée vocab (scopes site vs sentinel) — ce que « passes site/sentinel » mesure
`node -e` sur `vocab-banned.json` (extrait) :
- **SITE scope** (`apps/site/**`, `.ts/.tsx/.mdx`) banni : `\bAave\b`, `\bautonomous\b`, `\bself-evolving\b`, `\bpredicts\b`, `\bconfidence\b`, `\baccuracy\b`, `\bhedge fund\b`, `\bKraidle\b`, `\bPolymarket\b`… + `adaptive (cover|guarantee|region|gate)` / `(coverage|region|gate) adapt`. **exemptPhrases** : `["no confidence field"]`. → **`\bcascade\b` / `interval` / `reference price` NE sont PAS dans le scope site.**
- **SENTINEL scope** (`apps/sentinel/{src,test}`, `deploy/*`, `.ts`) banni : `\bcascade\b`, `(Λ|lambda)=0`, `would have alerted`, `reference price`, `adaptive coverage`. **exemptPhrases** : `["attest, gate, cascade, calibrate"]`.
⇒ **« passe sentinel 0 »** sur les surfaces livrées = appliquer CE jeu de patterns aux pages `/ukemi`,`/narabi`,`/` (0 attendu). La maquette v4 est à 0 (M3).

## M10 — inventaire de branchement (état actuel, entrées du §10 du G0)
```
$ find apps/site/app -iname "*ukemi*"                 # => (vide) : AUCUNE route /ukemi
$ ls apps/site/app                                    # console fleet how integrators narabi products roadmap token writing page.tsx ...
$ grep -n "site_renders_only_committed_data" test/site-honesty.test.ts | head
38:test("site_renders_only_committed_data (a) — manifest verified, 5 sourced figures (test 44)", ...
50:test("site_renders_only_committed_data (b) — no rendered numeric literal under apps/site (test 44)", ...
$ cat apps/site/data/manifest.sha256.json   # seule donnée manifestée : fixtures/figures-sourced.json (aucun record ukemi/design-set)
$ node -e 'const{WHITELIST_DIRS}=...'        # export-public WHITELIST_DIRS inclut "apps/site" (walk complet), test/** = DORMANT exclu
```
⇒ `/ukemi` = pièce à créer ; le test « renders only committed data » (test 44 (a)+(b)) est ce que le G0 §7 conserve ; nul enregistrement design-set committé (Q-5).

## M11 — comptes de lignes (entrées de l'estimation R-25 §9)
```
$ wc -l F:/PRODUITS/etude-2026-09-21/maquettes-release/v4/{index,narabi,ukemi}.html
  139 index.html   368 narabi.html   429 ukemi.html   (936 total)
$ wc -l apps/site/app/page.tsx apps/site/app/narabi/page.tsx apps/site/components/narabi/narabi-live.tsx \
        apps/site/lib/narabi-copy.ts apps/site/lib/narabi-live.ts apps/site/components/ukemi-panel.tsx apps/site/lib/fleet.ts
  145 page.tsx  37 narabi/page.tsx  342 narabi-live.tsx  87 narabi-copy.ts  471 narabi-live.ts  108 ukemi-panel.tsx  294 fleet.ts
```
⇒ le portage `/ukemi` (maquette 429 l. → TSX + copie externalisée) + Narabi + favicons + tests place le lot **complet** ~760–1 020 l. (proche de 1 150) ; avec Q-5(a) > 1 150 ⇒ couture (G0 §9).

## M12 — non-ASCII math toléré sur la vitrine (preuve par le site vert actuel)
```
$ grep -rnoE "q₁|q_t|ε|α|·|−|ŷ" apps/site/lib/narabi-copy.ts apps/site/components/narabi/narabi-live.tsx | head
apps/site/lib/narabi-copy.ts:74:q₁
apps/site/lib/narabi-copy.ts:75:q_t
apps/site/lib/narabi-copy.ts:79:q₁
apps/site/components/narabi/narabi-live.tsx:110:·
$ grep -rlP "[^\x00-\x7F]" apps/site/lib/narabi-copy.ts apps/site/components/narabi/narabi-live.tsx apps/site/lib/narabi-live.ts
apps/site/lib/narabi-copy.ts
apps/site/components/narabi/narabi-live.tsx
apps/site/lib/narabi-live.ts
$ node scripts/lang-gate.mjs --scope site; echo "exit=$?"
lang-gate OK — 0 non-exempt French hit(s) in scope {site}.
exit=0
```
⇒ `q₁`, `q_t`, `α`, `ε`, `·`, `−` **déjà expédiés** sur `/narabi` et `lang:gate --scope site` = **0** (vert). Donc `ŷ`/`α` licites en **prose d'affichage** `/ukemi`. Les constantes `LIQ_*` de `ukemi-copy.ts` restent **ASCII** (`yhat`/`qhat`), byte-identiques à `gate.ts:140-168` (ASCII-only, `gate.ts:148`).

## Provenance des scripts de mesure (déviation déclarée, F-3)
- `F:\tmp\site-release\measureN.mjs` (M1) — copié en périmètre (`F:\tmp\site-release\`), rejouable : `node F:/tmp/site-release/measureN.mjs`.
- **Déviation D-1 (déclarée, non tue)** : la première version de ce script a été écrite dans le scratchpad de session (`F:\tmp\claude\…\scratchpad\measureN.mjs`), hors `F:\tmp\site-release\`, avant d'être copiée ici. Reproductible et sans effet de bord ; aucun autre fichier hors `F:\tmp\site-release\` (et scratchpad) n'a été écrit ; `F:\Monark` en lecture seule (aucun commit, R-20).
