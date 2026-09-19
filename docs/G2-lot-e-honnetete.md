# G2 — Lot E-honnêteté (revue fraîche, relecteur, ADR-EC D1, régime site T0)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, contexte 1M), effort `max`. Relecteur en **instance séparée à contexte frais** — je n'ai PAS écrit ce lot (le G1 est signé du worker Opus 4.8 ; je le vérifie adversarialement, R-21). R-20 respecté : **aucun commit, aucun workflow**. Livrable écrit par moi dans le dépôt principal ; l'orchestrateur seul committe.

**Gel jugé** : `d44b656` sur `lot/e-honnetete`. **Base** : `ac04d41` (= ancêtre direct, `git merge-base --is-ancestor ac04d41 d44b656` = vrai ; le lot est **un commit unique**). **Méthode** : lecture par SHA (`git show d44b656:…`, `git diff ac04d41 d44b656`), copie `git archive d44b656` → `F:\tmp\g2-ehonnetete\` + `npm ci` (exit 0, 0 vuln), gates rejoués avec `TEMP=TMP=TMPDIR=F:/tmp` ; rien sur C:. Docs de gouvernance (ADR-EC, CHECKPOINT1-ADR-EC) mesurés à `d44b656` (identiques à la base, hors diff — ce sont la **spec**, pas le livrable).

---

## VERDICT : APPROUVÉ-AVEC-CORRECTIONS

Le travail **dans le périmètre ADR-EC D1 « E-honnêteté »** est exact et complet ; **tous les gates sont verts** (328/328, lint 0, ratchet 69/69, export:check, lang:gate, gate:vocab) ; **R-25 = 201** (tel que livré) ; **4 merge-tree propres**. Une **correction (C-1)** est due : le jumeau `shogen-panel.tsx:47` du surclaim de couche « act » corrigé sur README:98 (C-11 vi) n'a pas été touché — hors périmètre ADR-EC mais surface publique T0 vivante, rendue **incohérente** avec README:98 par ce lot, et bloquante à la release (décision investisseur 19). error_origin = **orchestrateur** (cadrage ADR-EC C-11 vi sous-mesuré ; le worker est resté dans le périmètre donné et l'a signalé, §7.3 — ce n'est PAS une erreur worker). Les items O-2..O-11 sont **formés avec déclencheur** (zéro dette nue, P5). Les deux vérifications qui pouvaient faire basculer le verdict (surface `.mdx` non couverte par l'oracle ; READMEs exportés hors oracle) reviennent **propres** (0 fichier `.mdx` ; READMEs licites), donc le verdict tient.

---

## Checklist (mesuré · preuve · verdict)

### 1. CI, gates, R-25 — VERT
Sur `git archive d44b656` + `npm ci` (exit 0) :

| Gate | Commande | Mesuré | Attendu | Verdict |
|---|---|---|---|---|
| tests | `node --test "test/*.test.ts" "packages/*/…" "apps/{harness,sentinel,bell}/test/*.test.ts"` | **tests 328 / pass 328 / fail 0** | 328/328 | ✔ |
| typecheck | `tsc --noEmit` | rc=0 | 0 | ✔ |
| gate:vocab | `grep-forbidden.mjs` | OK — 156 fichiers, 0 forbidden claim | OK | ✔ |
| lint | `eslint .` | rc=0 | 0 | ✔ |
| lint:ratchet | `lint-ratchet.mjs` | **69/69** (plafond `measured_on 2026-09-16`, non bougé par le lot) | 69/69 | ✔ |
| export:check | `export-public.mjs --check` | OK — 0 forbidden path, 0 French ; `sentinel`+`bell` [GATED] | OK | ✔ |
| lang:gate | `--scope root,contracts,schemas,site,skills,sentinel,bell` | OK — 0 hit ; `sentinel`/`bell` [GATED] | OK | ✔ |

**R-25** (`git diff --shortstat ac04d41...d44b656 -- .` + exclusions **exactes** de `ci.yml:52`) :
- **Variante A — pathspec de `d44b656`** (`docs/G1-lot-*.md`, `docs/G2-lot-*.md`, S2, lockfile, fixtures data exclus ; **ADR docs comptés**) : **201** lignes (11 fichiers, 184 ins + 17 del). = attendu. Borne 1205 ✔.
- **Variante B — + `docs/**/*.md` exclu (D9 septies)** : **190** lignes (9 fichiers, 174 + 16). Le G1 §9 estime « ~191 » ; l'exact est **190** (imprécision triviale, hedgée « ~ », sans effet sur la borne). **Le pathspec `docs/**/*.md` n'est PAS dans `ci.yml` à `d44b656`** — il vit sur `lot/e-registre` (décision 25 = D9 septies, porté par E-registre, ADR-EC D4). Cohérent avec le G1 §9 item 4 (formé). Les deux variantes ≪ 1205. ✔

### 2. E7 ×6 (C-2) — VERT
Lignes exactes vérifiées à `d44b656` (par `sed -n`) — les 6 sites sont **précisément** ceux nommés par ADR-EC C-2 ; `shogen-panel:63` **intouché** (diff ne le contient pas) :

| Site | Avant | Après (mesuré) | Verdict |
|---|---|---|---|
| `shogen-panel.tsx:51` | « emits a verified testimony only after a passing verdict » | « emits **an attested** testimony only after **its own verdict passes** » | ✔ fait vrai conservé (P1) |
| `shogen-panel.tsx:57` | « A verified testimony proves… » | « **An attested** testimony **proves** what was said, that its bytes hash as recorded, and that the attestor signed it. » | ✔ voir adjudication ↓ |
| `shogen-panel.tsx:63` | « …exactly what is **not verified**. » | **INTOUCHÉ** | ✔ négation honnête |
| `fleet-presentation.ts:33` | « a verified testimony, emitted only after a passing verdict » | « **an attested** testimony, … » | ✔ |
| `README.md:48` | « attested perception (verified price testimony) » | « attested perception (**an attested price testimony — origin and bytes, never truth**) » | ✔ |
| `README.md:111` | « A verified testimony (bytes + hash…) » | « **An attested** testimony (bytes + hash…) **— origin and bytes, never truth.** » | ✔ |
| `README.md:112` | « A verified testimony of redemption flow… » | « **An attested** testimony of redemption flow… **— origin and bytes, never truth.** » | ✔ |

**Adjudication `:57` « proves »** : LICITE. L'objet de « proves » est **borné** — « what was said, that its bytes hash as recorded, and that the attestor signed it » — puis désavoué explicitement en `:61-63` (« It does not claim the price is true … residual hypotheses are exactly what is not verified »). C'est exactement le cadrage « origin and bytes, never truth ». « proves » ∉ liste interdite (proven/certified/guaranteed) et ∉ motif de l'oracle. Aucune revendication de vérité résiduelle sur ce site.
**Aucune revendication de vérité restante** sur README/site/skills : voir §3 (census indépendant = 0 résidu).

### 3. Oracle racine `public_surfaces_make_no_probative_claim` (C-1) — VERT, non-vacuité et anti-contournement prouvés
Motif : `/(?<!\bnot )(?<!\bno )(?<!\bnever )\b(?:verified|proven|certified)\b/gi`.

**(a) Census indépendant** (mon `grep -rniE` sur README + `apps/site` src [prune test/data/.next/.turbo/node_modules/dist, exts .ts/.tsx/.md hors .d.ts] + `skills/monark/*.md`, **même périmètre que l'oracle**) : **19 occurrences post-édition** = 25 (worker) − 6 sites E7 corrigés. Chacune mappe **1:1** :
- **4 négations** (lookbehind) : `how/page.tsx:62`, `shogen-panel.tsx:63` (« what is not verified »), `narabi-copy.ts:20` (« not certified »), `narabi-live.ts:471` (« never certified »).
- **15 spans licites** du masque fermé : 8 commentaires de code, 3 provenance (`COMPONENTS-PROVENANCE.md`), 3 mécanisme slashing/watcher (`token/page.tsx`), 1 skill-test (`DEMO.md:89`).
Le total = 19 **sans résidu** ⇒ **aucun span ne masque une seconde occurrence non voulue** (masque serré) ; **aucun surclaim résiduel**.

**(b) Anti-contournement** (synonymes/formes hors motif) :
- **Multi-lignes** (« never » en fin de ligne précédente) : le lookbehind est mono-ligne ⇒ un « never\nverified » **rougirait** (fail-closed, faux-rouge), jamais un faux-vert ; test vert ⇒ aucun cas réel.
- **Capitalisation** : vérifié empiriquement — `« Verified testimony »` → ROUGE, `« Never verified »`/`« NOT certified »` → vert (le `/i` s'applique au forward ET aux lookbehinds). Aucun trou par casse.
- **« verification »/« verify »/« verifier »** : mots de **processus** (nom d'outil « Rust verifier », « Verify the wiring », négations « does not verify ») — licites, hors motif à bon droit.
- **« proves »** (README:177 « proves they reject… », `:57`), **« validated »** (`COMPONENTS-PROVENANCE:33` provenance ; how/page:63 « no validated flag » = négation), **« guaranteed »** (how/page:275 titre « What is guaranteed » suivi de la **garantie de couverture conforme honnête** — « Coverage holds on average over exchangeable calibration data at 1−α », immédiatement équilibrée par « What is not » ; how/page:269 commentaire) : **tous licites** (bornés, provenance, négation, ou garantie mathématique vraie). **Aucun surclaim n'échappe par synonyme.**

**(c) Masque fermé — non-vacuité par entrée** : le test asserte `joined.includes(span)` pour chacun des 15 spans (une entrée morte rougit) + 3 négations présentes et vertes. Confirmé par le census (chaque span présent ≥1×, tight).

**(d) Mutants** (rejoués dans la copie archive, `node --test` isolé) :

| Mutant | Attendu | Mesuré |
|---|---|---|
| **README:111** `attested→verified` (mutant nommé, REJOUÉ) | ROUGE | **fail 1** (survivant `README.md:111 verified`) ✔ ; restauré, re-vert |
| « verified » ajouté à `skills/monark/SKILL.md` | ROUGE | **fail 1** ✔ |
| « proven » ajouté à `apps/site/app/how/page.tsx` | ROUGE | **fail 1** ✔ |
| Baseline / restauration | 2/2 vert | 2/2 vert ✔ |
| Synthétiques in-test (proven/certified swap MAST ; span voisin ne blanchit pas un surclaim nu ; négation verte) | passent | passent ✔ |

L'oracle est **load-bearing sur les trois types de surface** (README, skills, apps/site).

**(e) Portée du scan (vérifié)** : `EXTS = {.ts,.tsx,.md}` **hors `.mdx`** — mesuré : **0 fichier `.mdx` sous `apps/site`** aujourd'hui (mon `find`), donc aucun surclaim n'échappe. C'est un **gap latent** (O-10 : un futur page `.mdx` fail-open) — mon census indépendant partageant les mêmes extensions le manquerait à l'identique. `SKIP={.next,.turbo,node_modules,dist,test,data}` élague à toute profondeur : mesuré, **seuls `apps/site/{test,data}` existent** (aucun `test/`/`data/` imbriqué), confirmant le commentaire du test.
**Adjudication `DEMO.md:89` « verified end-to-end by »** (laissée « à adjuger » par ADR-EC C-1) : LICITE (un **test** vérifie la boucle démo de bout en bout — couverture de test, pas vérité de prix ; ADR-M017 D3). Gardée dans le masque, non reformulée. Correct.

### 4. skill/DEMO vs code (ADR-M017 D3) — VERT
`SKILL.md` (nouvelle section « The `gate` envelope ») confronté à `apps/harness/src/tools/gate.ts` :
- « `{prediction, params}` — both required, unchanged » ⇔ `runGate(prediction, params, attested?)` (l.538) ; `required === ["prediction","params"]` (ADR-M017 D1). ✔
- « OPTIONAL `attested: AttestedPrice` … origin and bytes, never truth » ⇔ paramètre optionnel (l.538). ✔
- « only its named `residual` … carried through to `verdict.residual` » ⇔ **l.612-613** `verdict = { ...verdict, residual: [...attested.residual] }` (D2(iii)/D4(3)). ✔
- « subject must be a URL committed for that task_class — a declared match checked for coherence, never a call-time re-derivation … no temporal binding » ⇔ garde **l.571-572** `checkAttestedConsistency(taskClass, attested.subject)` (D2(i), « no temporal binding in P1 »). ✔
- « BYO call carrying `attested` is refused … never accepted silently » ⇔ classe BYO absente de la table ⇒ `checkAttestedConsistency` (importée d'`attestation-binding.ts`, gate.ts:47/572) ⇒ 400. **Vérifié au niveau CODE+TEST**, pas seulement description : `gate.test.ts:707` asserte `e.message.includes("not accepted for BYO classes")` (test vert dans les 328) ; description l.133-134 « BYO classes do not accept `attested` in P1 » (D2 C'-8). ✔
`DEMO.md` : la phrase ajoutée (« `attested` is not part of this BYO loop … refused in this phase — see SKILL.md ») est exacte (la section 2 est une boucle BYO). Aucun chiffre ni promesse. `gate:vocab` scope skills OK (156 fichiers) ; `lang:gate` skills 0 hit. ✔

### 5. E8 — retrait `MONARK_PHASE` — VERT
- Bloc JSDoc + `export const MONARK_PHASE` **retirés** (`packages/monark/src/index.ts`, diff 0/7). ✔
- **Importeurs = 0** : `git grep MONARK_PHASE d44b656` en `.ts/.tsx/.mjs/.js` = **une seule** occurrence, `docs/cartographie-p1/import-graph.mjs:125` — et le contexte (l.120-126) est `const SYMBOLS = ["MONARK_PHASE", …]`, une **liste de census** (« dead-export probes named by the mission »), **pas un import**. ✔
- **Supersession de ADR-M019 D3** (« MONARK_PHASE conservé », l.38) : **déclarée** dans la gouvernance — ADR-EC (ligne E8 « retrait », ADR gouvernant, plus récent) + `CARTOGRAPHIE-P1:113` (item formé « mort déclaré », déclencheur « retrait ») + G1 §5. La convention du dépôt (ADR non réécrit, superséé par ADR ultérieur) est respectée. ✔ (voir O-4 pour le texte stale de M019.)

### 6. C-11 i — `lang-gate` scopes `sentinel`/`bell` + test 42 — VERT (teeth prouvés)
Mécanique mesurée dans `lang-gate.mjs` : `collectTextFiles` parcourt tout l'arbre (skip node_modules/.git/dist/**docs**/.next/.turbo) ; `--scope` ne gate que le **code de sortie** (`bad = Σ byScope[selected].hits`, l.290).
- `SCOPES` (l.117) `+ "sentinel","bell"` ; `classifyScope` (l.140-141) route `apps/sentinel/**→sentinel`, `apps/bell/**→bell` (avant : tombaient en `root`). ✔
- **test 42** : (c) scope export `+sentinel` (`apps/sentinel` **exporté** package-style, `APP_PACKAGE_DIRS=["apps/harness","apps/sentinel"]`) ; (c-bis) **appel source-tree** `--scope sentinel,bell` sur ROOT. Motif **fail-closed correct** : `apps/bell` **n'est PAS** dans la whitelist d'export (ni `APP_PACKAGE_DIRS` ni `WHITELIST_DIRS`), donc gater `bell` sur l'export serait un **faux-vert** (0 fichier) ; le vrai gate = l'arbre source. **Conséquence critique bien gérée** : reclasser sentinel/bell HORS de `root` **retire** leurs hits du bucket `root` gaté ⇒ il **faut** les réajouter au scope (fait), sinon faux-vert.
- **Mutants (rejoués)** : French dans `apps/sentinel/src/flow.ts` ⇒ **test 42 FAIL** ; French dans `apps/bell/src/digest.ts` ⇒ **test 42 FAIL** ; restauration ⇒ VERT. Les teeth mordent sur export ET source. (Le retrait de `sentinel` du scope gaté laisserait le hit dans un bucket non-sélectionné ⇒ vert : la présence du scope est donc load-bearing, cf. l.290.) ✔
- **`bell` scanné sur l'arbre SOURCE (non exporté)** : logique **fail-closed** (l'export ne contient pas bell ⇒ l'appel source est le seul filet). ✔
- **0 français mesuré** : sentinel/bell [GATED] 0 hit. `apps/bell` existe à `d44b656` (10 fichiers, src EN + `test/bell.test.ts` + `test/fixtures/halts-reduced.csv` **anglais** : en-têtes « Halt Date… », raisons « News pending »/« LULD Pause »).
- **Risque signalé « apps/bell/test couvert »** (G1 §10.7 = O-6) : `classifyScope` route `apps/bell/test/**→bell` et `collectTextFiles` ne skippe pas `test/`, alors que le scope **vocab** `bell` exclut `test/` (contrôles négatifs). **Mesuré sur `lot/t-1a-ii-a`** (`git ls-tree` + scan diacritiques/fr-words sur `apps/bell/**`) : **0 français** aujourd'hui ⇒ l'appel source resterait vert. Item **forward** correctement formé (remède = entrée `lang-exempt.json`, jamais retrait de scope). ✔

### 7. C-11 iv/vi — VERT
- **iv — ADR-M009:124** : « 35 % (t°=30) → **49,1 %** (t°=365) par bruit binomial **[abs]** (binomiale au bord, **ADR-M002 l.166** ; CHANTIERS §E) ». Source vérifiée **verbatim** : `ADR-M002:166` « 35,3 %→**49,1 %** [abs] (le [abs] est la binomiale au **bord**, p̂ = alpha ; reproduit exactement) ». Chiffre **sourcé [abs] reproductible**, **jamais de seconde main** (doc 03). ✔ (« 35 % » vs source « 35,3 % » = O-2, hors périmètre.)
- **vi — README:98** : « acts (execute) » → « acts (execute · **upcoming**) ». **Vrai** : `SKILL.md:10` « gate never executes the named tool » ; « attest is demonstrative, not probative » ; D0 no-trade. Aucun outil n'exécute ⇒ « upcoming » exact. ✔

### 8. Amendement ADR-M018 D2 — VERT (une réserve error_origin)
- **Bloc daté** : « ## Amendement D2 — 2026-09-19, ratifié par l'investisseur (décision 23) ». ✔
- **Original cité périmé, NON réécrit** : l'énoncé d'origine (l.22) est **intact** ; l'amendement (ajouté en fin) le cite comme « périmé (prémisse « Ukemi non consommé » **fausse**) … **Il n'est pas réécrit (traçabilité)** ». **Aucune réécriture de l'historique.** ✔
- **Texte ratifié = ADR-M019 D3 verbatim** : comparaison mot-à-mot avec `ADR-M019` l.78-81 = **identique**. ✔
- **Cite décision 23** (vérifiée : `DECISIONS-investisseur-2026-09-19.md` §23 « ADR-M018 D2 ratifié … porté par le lot E-honnêteté ») **et la cartographie P1** (`CARTOGRAPHIE-P1` §2 l.62 `cascade → gate` CÂBLÉ vacue, §3 l.86) + mesure **[lu]** `fixtures/h5-e2e-trace.json` étape 4. ✔
- **error_origin** : **RÉSERVE (O-8)** — l'amendement porte la **provenance** (worker Opus 4.8 / orchestrateur Fable 5.1 / ratification 23) mais **n'assigne pas explicitement d'`error_origin`** pour la prémisse fausse d'origine. Per AgileGates c'est une tâche **G7 de l'orchestrateur** (candidat : orchestrateur, D2 rédigé **avant** la cartographie). Non-bloquant pour le worker.

### 9. T0 / CA-11 — VERT
- **`apps/site/lib/fleet.ts` INTACT** : `git diff ac04d41 d44b656 -- apps/site/lib/fleet.ts` = **vide**. Aucun registre touché. ✔
- **Régime T0 exact** (ADR-M013:18) : README/panel/`fleet-presentation.ts`/skills = **texte/copie**. Aucune bascule T2 (l.22) : (a) aucun test existant ne rougit (les 2 tests oracle sont des **ajouts**, pas des rouges) ; (b) aucun registre/contrat gelé touché ; (c) **aucun chiffre ni marque nouveau** sur la vitrine (`49,1 %` est en ADR gouvernance, préexistant ADR-M002:166) ; (d) aucune dépendance. `fleet-presentation.ts:33` = édition de **copie** (« verified »→« attested »), pas de structure de registre ⇒ **T0** par **ADR-EC C-8** (« présentation copie »). ✔ Les fichiers gouvernance/outillage/test (ADR-M009, ADR-M018, `index.ts`, `lang-gate.mjs`, tests) ne sont pas la vitrine ; ils passent le **G0–G7 complet** (cette revue). Préfixe commit `site[T0]` exact pour la portion vitrine.

### 10. Fusion — VERT
`git merge-tree --write-tree --name-only d44b656 <cible>` (git 2.55) :

| Cible | HEAD | Résultat |
|---|---|---|
| `lot/etude-suite` | `8878281` | **CLEAN** (rc=0) |
| `lot/e-registre` | `7d6d117` | **CLEAN** (confirme la mesure orchestrateur) |
| `lot/u-1b-a` | `b64ca1b` | **CLEAN** (README partagé) |
| `lot/t-1a-ii-a` | `88c3324` | **CLEAN** |

**README ⇔ u-1b-a — hunks disjoints (mesuré)** : u-1b-a touche README **17, 39, 105, 115-117, 176** ; e-honnêteté touche **48, 98, 111, 112**. **Aucun chevauchement** (même avec 3 lignes de contexte : 111-112 vs 115-117 ne se recouvrent pas), fusion auto confirmée par merge-tree. ✔

### 11. C-10 (CRA/ENISA) — hors code de ce lot, disposition déclarée
La ligne ADR-EC D1 « E-honnêteté » cite **C-10** (audit d'entrée CRA/ENISA = **lecteur Sonnet 5**). Ce **n'est pas du code** : l'audit d'entrée a été exécuté séparément (commits `d1ef9f8`/`ac04d41` à la base — applicabilité CRA **INDÉTERMINÉE**, art. 14, 5 questions au conseil) et **escaladé à l'investisseur** (décision 24 : « instruction d'applicabilité par un lecteur Sonnet 5, escalade si dans le champ »). **Pas un écart de ce lot** ; suivi hors E-honnêteté (compliance G6). ✔

---

## Corrections (C-n)

**C-1 — `apps/site/components/shogen-panel.tsx:47`** — surclaim de couche « act », **jumeau non corrigé** de README:98.
- **Preuve** : `:47` = « sensor (attest) → the gate … → **act (execute)**. The gate emits commit, defer, or abstain. » README:98 (même pipeline) a été honnêtement corrigé « acts (execute) » → « acts (execute · **upcoming**) » (C-11 vi), mais son **jumeau T0** `shogen-panel:47` porte le **même** claim « act (execute) » alors qu'**aucun outil n'exécute** (SKILL.md:10, D0). Le lot **crée ainsi une incohérence** entre deux surfaces publiques T0. La **décision investisseur 19** rend tout item d'honnêteté de surface publique **bloquant à la release** (« formé avec déclencheur ne vaut jamais pour franchir une release »).
- **Complétude (balayage `execute`, mesuré)** — j'ai énuméré **tous** les usages « (execute) » de couche act sur README + `apps/site` src + skills, pour ne pas replier un jumeau sur N : (a) **`shogen-panel.tsx:47`** = le jumeau **parenthétique** exact de README:98 ⇒ **à corriger** ; (b) `README.md:16` « attest, a gate that authorizes, and **acts that execute** » = **prose de patron conceptuel** (pas un diagramme de statut) ⇒ **à adjuger** par l'orchestrateur (mon avis : distinct, « · upcoming » y serait grammaticalement faux ; garder) ; (c) `board.tsx:84` = **E-registre** (C-11 vi, Ukemi sous « acts · execute ») ; (d) `DEMO.md:78`, `SKILL.md:3,:34` = **négations honnêtes** (« NOT permission to execute », « MONARK never executes it »), licites.
- **Faisabilité (mesuré) — fold T0 trivial, pas de bascule T2** : **aucun test ne fige** « act (execute) » (`grep` sur `test/` + `apps/site` = seul le fichier source) ; les comptes « upcoming » (`ci-gates.test.ts:588`, `visage-register.test.ts`) portent sur le **champ structuré `status === "upcoming"`**, pas sur la prose ⇒ ajouter « · upcoming » à la prose de `:47` ne rougit **aucun** test existant (pas de bascule ADR-M013:22(a)). La correction reste **une ligne T0**.
- **Correction** : éditer `:47` « act (execute) » → « act (execute · upcoming) » (identique à README:98). L'orchestrateur décide de **replier dans ce lot** (trivial, cohérence T0) ou en suivi nommé **avant release**.
- **error_origin** : **orchestrateur** — cadrage ADR-EC C-11 vi sous-mesuré (a nommé README:98 + `board.tsx:84`→E-registre, **manqué le jumeau** `shogen-panel:47`). Le worker est **resté dans le périmètre** donné et l'a signalé (G1 §7.3) ⇒ **pas** une erreur worker.

---

## Items formés (O-n) — zéro dette nue (P5), propriétaire + déclencheur

- **O-2 — `ADR-M009` « 35 % » (t°=30)** vs source `ADR-M002:166` « 35,3 % ». Hors périmètre (task = 47→49,1 % seul). Propriétaire : orchestrateur ; **déclencheur** : prochaine édition d'ADR-M009. (G1 §10.2.)
- **O-3 — `docs/cartographie-p1/import-graph.out.json` (l.471 `"MONARK_PHASE":1`) + `import-graph.mjs:125` SYMBOLS** stale après E8. Sous `docs/` (hors R-25, hors oracle). Propriétaire : worker contexte frais ; **déclencheur** : cartographie pré-release (ADR-EC D2). (G1 §10.6.)
- **O-4 — `ADR-M019` texte stale** : l.4/l.76 « M018 D2 proposé, à ratifier » (désormais ratifié, décision 23) **et** l.38 « MONARK_PHASE conservé » (désormais retiré, E8). Propriétaire : orchestrateur ; **déclencheur** : fold G7 (mise à jour « ratifié 2026-09-19 » / « retiré E8 »). (G1 §10.1, étendu par moi à l.38.)
- **O-5 — D9 septies (`docs/**/*.md` hors R-25)** décidé (décision 25) **pas encore dans `ci.yml`** à `d44b656` (mesuré : variante B ≠ pathspec livré). Correct : porté par **E-registre** (ADR-EC D4). Propriétaire : E-registre ; **déclencheur** : atterrissage E-registre. (G1 §10.4.)
- **O-6 — `lang-gate` scope `bell` couvre `apps/bell/test/**`** (contrairement au scope vocab). 0 français aujourd'hui (mesuré à `d44b656` ET `lot/t-1a-ii-a`) ; un contrôle négatif français futur en `apps/bell/test` rougirait l'appel source (c-bis). Remède **entrée `lang-exempt.json`** (jamais retrait de scope). Propriétaire : orchestrateur ; **déclencheur** : G2 de T-1a-ii. (G1 §10.7.)
- **O-7 — portée de l'oracle d'honnêteté** : `README + apps/site + skills` **exclut** (i) les descriptions d'outils servies `apps/harness`/`apps/sentinel` (surface publique MCP) et (ii) les READMEs exportés `apps/harness/README.md`, `apps/sentinel/README.md`, `packages/*/README.md`, que `gate:vocab` ne police pas non plus pour « verified » (ADR-W1). **Mesuré (balayage advisor)** : ces surfaces ne portent aujourd'hui que des usages **licites** — « Shōgen-verified witness » (provenance, `attest.ts:33,69`), « not re-verified at call time » (négation, `gate.ts:118`), `packages/atelier/README.md:22` « (test 26, mutant verified) » (provenance de test) ; **0 surclaim**. Gap **latent**, pas un défaut. Propriétaire : orchestrateur ; **déclencheur** : cartographie pré-release / prochaine passe honnêteté.
- **O-8 — error_origin de l'amendement M018 D2** (cf. §8) : à assigner par l'orchestrateur au G7 (candidat : orchestrateur, D2 rédigé avant la cartographie).
- **O-9 (report du G1) — rebase du lot** : `lot/e-honnetete` ff-mergé vers `ac04d41` (11 commits docs-only de `lot/etude-suite`, mes éditions préservées). Propriétaire : orchestrateur ; **déclencheur** : intégration (R-20). (G1 §10.5 ; sans objet pour la fusion, merge-tree propre.)
- **O-10 — oracle `EXTS` sans `.mdx`** (cf. §3(e)) : l'oracle scanne `.ts/.tsx/.md`, pas `.mdx` ; **0 fichier `.mdx` aujourd'hui** ⇒ latent. Remède défensif : ajouter `.mdx` à `EXTS` + mutant. Propriétaire : orchestrateur ; **déclencheur** : premier `.mdx` sous `apps/site` / prochaine passe honnêteté.
- **O-11 — cross-lot forward SKILL.md ⇔ décision 20(B)** : `u-1b-a` livre le **contrat AttestedBook** (`packages/contracts` + `schemas/attested-book.schema.json`) mais **ne touche PAS** `gate.ts`/ADR-M017/SKILL.md (stat mesuré vide) ⇒ la règle de cohérence M017 D2(i) reste **exact-match**, et la phrase SKILL.md « URL committed for that task_class » reste **exacte après fusion**. **Quand** l'amendement décision 20(B) (« exacte ou motif committé selon la classe ») sera câblé dans `gate.ts` (lot futur), SKILL.md devra être mis à jour. Propriétaire : lot qui câble D2(i) ; **déclencheur** : câblage du book dans le gate.

Aucun de ces items n'est une dette nue ; chacun porte propriétaire + déclencheur (P5). **O-6 est aujourd'hui non-déclenché** (0 français mesuré). **Bloquant release** : C-1 (décision 19) ; les autres sont ordonnancement inter-lots ou hors surface publique.

---

## Modes MAST (checklist de risque résiduel)
- Surclaim par **synonyme** (proven/certified) : couvert (motif + mutant synthétique). Par **casse** : couvert (test empirique). Par **span de masque trop large** : réfuté (census 1:1, 0 résidu). Par **surface hors oracle** (harness/sentinel) : O-7, 0 surclaim mesuré. Par **jumeau non scopé** (shogen-panel:47) : **C-1**.
- **Faux-vert de gate** (sentinel/bell reclassés hors `root` sans réajout au scope) : réfuté (mutants rouges ; scope réajouté).
- **Artefact mouvant** (import-graph stale) : O-3, déclencheur cartographie.
- **Terminaison prématurée** : non — 328/328 + 4 merge-tree + mutants rejoués.
- **Générateur = relecteur** : respecté (instance fraîche, je n'ai pas écrit le lot).

---

## Provenance
Revue produite le 2026-09-19 par un relecteur `claude-opus-4-8[1m]` effort `max`, instance séparée à contexte frais, sous orchestration `claude-fable-5-1`. Mesures reproductibles : `git archive d44b656` → `F:\tmp\g2-ehonnetete` + `npm ci` ; gates rejoués (328/328, lint 0, ratchet 69/69, export:check, lang:gate, gate:vocab) ; R-25 recomputé (201 / 190) ; oracle d'honnêteté rejoué + 3 mutants ; lang-gate sentinel/bell rejoué + 2 mutants (French dans `apps/sentinel/src` et `apps/bell/src` ⇒ test 42 rouge) ; oracle edge-cases (casse) rejoués ; 4 merge-tree ; census indépendant des 3 jetons probatifs. **Balayages complémentaires (advisor)** : `.mdx` sous apps/site (0) ; profondeur `SKIP` (seuls `apps/site/{test,data}`) ; READMEs exportés + `packages/*/README.md` (0 surclaim) ; énumération des jumeaux « (execute) » ; refus BYO+attested au code+test (`gate.test.ts:707`) ; impact cross-lot `u-1b-a` (n'affecte pas gate.ts/SKILL.md). **Discipline (R-21, déclaré, non caché)** : la boucle merge-tree a écrit un fichier temporaire `/tmp/mt.out` qui, sous Git Bash, résout vers `C:\…\Temp` — **écart à la consigne « rien sur C: »** (fichier de parsing éphémère, contenu = sortie merge-tree, supprimé après). Aucun autre écrit hors `F:`. Aucun commit, aucun workflow (R-20). Verdict adversarial (R-21) : **APPROUVÉ-AVEC-CORRECTIONS** (C-1) ; O-2..O-11 formés.
