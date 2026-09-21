# G2-DELTA — RELECTEUR (revue adversariale du delta) lot `CI-site`

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, contexte 1M), effort max. Instance séparée à
contexte frais — je n'ai écrit AUCUNE partie de ce lot. **R-20** : je ne committe pas, ne déclenche aucun
workflow, aucune action sortante. **R-21** : rapport écrit pour être re-vérifié (chaque chiffre rejouable).

**Horloge** (`date -u`) : ouverture **2026-09-20 23:21:07 UTC** → clôture **2026-09-20 23:52:09 UTC**.
**Delta relu** : `git diff 5195378..e5fbf72` = pli G2 `64cf0f6` + pli checkpoint-2 `e5fbf72` (les deux
POSTÉRIEURS au G2 tiers `5195378`, jamais relus par un tiers avant ce checkpoint-2). Base `c9e7b4b`, worktree
`F:\Monark-wt-cisite` (`lot/ci-site`, HEAD `e5fbf72`), laissé **intact** (`git status` vide, HEAD inchangé —
vérifié à la clôture). **Rejeu offline** dans la copie jetable `F:\tmp\cisite\g2d\build\` (`git archive e5fbf72`
+ `npm ci`), jamais dans `F:\Monark`/`F:\Monark-wt-cisite` ni sur `C:` (`TMP/TEMP=F:\tmp\cisite\g2d\tmp`, cache
`F:\cache\npm`). Exigé par le validateur (C2-4) car ce delta **MODIFIE LE COMPORTEMENT D'ORACLES**.

### Déclaration réseau (contrainte)
`apps/site/app/layout.tsx:3` (UNTOUCHED, vérifié aux deux plages) importe `next/font/google` : `next build`
récupère les fontes chez Google (item **C-7** déclaré). J'ai buildé avec réseau. `npm ci` cache chaud F: (« added
282 packages in 15s », `NEXT_TELEMETRY_DISABLED=1`). **Aucun autre accès sortant.**

---

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le delta est solide et fait ce qu'il annonce. Le comportement d'oracle MODIFIÉ est **correct** :
- l'élargissement `if:`/`continue-on-error` **tue réellement les 3 survivants du checkpoint-2** et TOUTES les
  formes idiomatiques (bloc / tiret / guillemets simples+doubles / flow-mapping / espace-avant-`:` / tabulation /
  BOM / `${{ … }}`) — A–G rejoués ROUGE byte-exact ; les contrôles (shell `if [`, `if-no-files-found:`,
  `with: { if-…: }`, clé de job `g3-site:`) restent VERTS ; **0 match** IF/COE sur le `ci.yml` réel ;
- `renderedBody` durci : script (attribué/majuscule/niché-en-attribut), `<noscript>`, `<template>` strippés,
  fail-closed sur `<script>` non fermé — les 6 mutants du pli G2 rouges ; décodage d'entités **sans**
  double-décodage (`&amp;#x27;` → `&#x27;`, PAS `'` — mesuré) ;
- le tripwire AST rougit quand l'en-tête rendu change (le commentaire JSX ne le sauve plus, O-1 mutant rouge) ;
- **sur l'artefact RÉEL** (rebuild + O-2 EXTRAITES) : build exit 0, `fleet.html` **61 163 o**, O-2 exit 0,
  **34 099** body chars, script **équilibré 13/13**, **0** `<noscript>/<template>/<style>/<textarea>` — le
  fail-closed NE se déclenche PAS à tort, aucun faux-vert ;
- table sha §1 **exacte à `e5fbf72`** (15/15 blobs), **R-25 = 661** (mesuré), `layout.tsx` non touché, suite
  **486/486**, JOURNAL §8 par modèle résolu fidèle au `git log`.

Les corrections sont **toutes NON BLOQUANTES** : deux imprécisions du D9 octies « liste EXACTE des résiduels »
(le delta lui-même se réclame de « ne rien sur-affirmer », donc l'exactitude est due), une asymétrie de faux-rouge
entre les deux détecteurs, et deux chiffres R-25 périmés dans le PLI. **Aucun critère de FAIL rencontré** : aucun
mutant annoncé-rouge trouvé vert ; aucun faux-VERT sur une forme IDIOMATIQUE ni sur l'artefact réel ; restauration
byte-exacte sur les **18** mutants (A–G 7 + `renderedBody` 6 + O-1 1 + NEW 4) ; sha §1 exacts ; R-25 exact.

---

## Défauts numérotés

### C-G2D-1 (précision de doc + asymétrie de détecteurs ; `error_origin` : **worker (pli G2/checkpoint-2)** ; NON BLOQUANT — faux-rouge fail-closed, 0 hit vivant)
- **Fichier:ligne** : `test/ci-gates.test.ts:65-66` (`hasDirective` saute `^\s*#` seulement) vs `:1349-1352`
  (le bloc g3-site strippe `#.*$`) ; `docs/adr/ADR-M003-phase2-integration.md:116` (résiduel « prose en
  commentaire `#` restée licite »).
- **Constat mesuré (mutant NEW-1, batterie part E)** : un commentaire de **FIN de ligne** contenant
  `- if:` / `{ if:` / `, if:` (ou les équivalents `continue-on-error`) sur une ligne NON `^\s*#` **FALSE-RED**
  test 38 (`hasDirective(LINES, IF_DIRECTIVE_RE)` = **true**), tandis que le **bloc g3-site** (qui strippe les
  commentaires inline `#.*$`) reste **VERT**. NEW-1 (` # e.g. - if: false` sur la ligne `run: npm run build`) :
  **test38 ROUGE, bloc GREEN**. L'affirmation « prose en commentaire licite » (D9 octies + test 38 (1)/(1bis))
  n'est vraie que pour un commentaire **PLEINE LIGNE** ; un commentaire trailing avec `- if:` n'est PAS licite
  (il rougit). Le résiduel déclaré ne parle que de « chaîne entre guillemets », pas du commentaire trailing, ni
  de l'ASYMÉTRIE entre les deux détecteurs.
- **Direction sûre** : c'est un faux-ROUGE (fail-closed), jamais un faux-vert ; le strip inline du bloc ne cache
  aucun vrai `if:` (une clé réelle avant le `#` reste scannée — vérifié). **0 hit vivant** sur le `ci.yml` réel.
- **Correction minimale (choix laissé au plieur, non prescrit)** : soit aligner le scan pleine-ligne de test 38
  sur le strip inline `#.*$` du bloc ; soit **déclarer** dans D9 octies (i) le faux-rouge d'un `if:`/`coe`
  derrière un `#` de fin de ligne et (ii) l'asymétrie test 38 (pleine ligne) / bloc g3-site (inline strippé).

### C-G2D-2 (liste de résiduels incomplète / trop étroite ; `error_origin` : **worker (pli checkpoint-2)** ; NON BLOQUANT — formes non-idiomatiques)
- **Fichier:ligne** : `docs/adr/ADR-M003-phase2-integration.md:116` et `test/ci-gates.test.ts:57-59`
  (bloc de résiduels déclarés).
- **Constat mesuré (batterie part B + mutants NEW-2/NEW-3)** :
  - le résiduel « clé explicite `? if` / `: false` **sur deux lignes** » est **trop étroit** : la forme
    **MONO-LIGNE** `? if : false` échappe AUSSI (`IF_DIRECTIVE_RE.test` = **false** ; NEW-2 survivant, test38+bloc
    verts). Le wording doit dire « syntaxe de clé explicite `?` **sous toute forme** (mono- ou multi-ligne) ».
  - **non déclaré** : une clé double-quotée **échappée** `"i\x66": false` (YAML décode `\x66`→`f` ⇒ clé `if`,
    mais la regex ne décode pas) échappe (NEW-3 survivant, both green) ;
  - **non déclaré** : un saut de ligne **CR isolé** (`foo\rif: false`) échappe car `WF.split(/\r?\n/)` ne coupe
    pas un `\r` nu (mesuré part B).
- **Cadre de gravité** : ces trois formes sont **non-idiomatiques** — un contributeur ne les écrit pas par
  inadvertance, et un adversaire qui contrôle `ci.yml` peut aussi supprimer le test ; le détecteur protège
  l'inadvertance. **Non bloquant.** MAIS le D9 octies **revendique une liste EXACTE des résiduels** : les nommer
  (une ligne chacun) est dû (cohérence avec « sans sur-affirmer »).
- **Correction minimale** : élargir la ligne « résiduels déclarés » : « `?` explicit-key mono/multi-ligne ;
  échappements YAML dans une clé double-quotée non décodés ; saut de ligne CR isolé non segmenté ». Aucune
  dépendance (parseur YAML) ajoutée.

### C-G2D-3 (traçabilité — chiffre R-25 périmé dans le PLI ; `error_origin` : **worker (pli checkpoint-2)** ; NON BLOQUANT)
- **Fichier:ligne** : `docs/PLI-lot-ci-site.md:80` (§5) et `:157` (§9).
- **Constat mesuré** : §5 affirme **« 601 lignes changées »** avec répartition **`ci.yml` 25 / `ci-gates.test.ts`
  56** ; §9 affirme **« 601 lignes, 37/37 »**. Or §1, §8 (JOURNAL, lu au G7) et §11.3 disent **661** avec
  **ci.yml 29 / ci-gates 112** et suite **486/486**. Mesuré ici : **R-25 = 661** (652 ins + 9 del), ci.yml **29**,
  ci-gates **112**. Le pli checkpoint-2 a mis à jour §1/§8/§11 mais PAS §5/§9 (restés à l'état pli-G2). Le chiffre
  consommé au G7 (§8) est correct ; §5/§9 le contredisent (incohérence interne).
- **Correction minimale** : §5 : 601→661, ci.yml 25→29, ci-gates.test.ts 56→112 (et l'étiquette « post-pli G2 »
  → « post-pli checkpoint-2 ») ; §9 : « 601 lignes »→661 et rafraîchir/retirer « 37/37 » (suite = 486/486).

---

## Observations (non numérotées — signalées, corrections optionnelles ; O-2 couvre)

- **O(D)-a — surfaces cachées non strippées par `renderedBody`** (même classe que le trou noscript/template
  pré-G2) : `<style>`/`<title>`/`<textarea>` NE sont PAS strippés ; une note y logeant seule serait un faux-VERT
  (batterie part 2 : GREEN sur les trois). **NON VIVANT sur l'artefact réel** : 0 `<style>`/`<textarea>` ; 1
  `<title>`/`<head>` mais (contrôle advisor) après strip `<head>…</head>` l'assertion reste **GREEN** (32 752 body
  chars) et aucune `wiring.note` n'est sous-chaîne du `<title>` ni de `metadata.description` (mesuré : 4× false).
  Optionnel : strip `<style>`/`<title>`/`<textarea>` ou les déclarer résiduels. Non bloquant.
- **O(D)-b — tripwire satisfait par une chaîne non rendue** : `fleet_page_renders_the_served_header` est bien
  **insensible aux commentaires JSX** (O-1 mutant ROUGE : changer le rendu, garder le commentaire :125-127 rougit).
  MAIS `renderedTexts`→`renderedLiterals` descend dans les **deux** branches de `?:` et les opérandes `&&`/`||`
  (sur-inclusion héritée de `honesty-lint.ts`, correcte là-bas, sur-inclusive ici). Mutant **NEW-4** : en-tête placé
  UNIQUEMENT dans `{false && "How each built agent is served"}` ⇒ tripwire **VERT** (survivant) MAIS **O-2 sur
  artefact rebuild = ROUGE** « header absent » (mesuré). O-2 est la vraie dent (cadrage O-1 du G2). Durcissement
  optionnel (position réellement rendue) ; non bloquant.
- **O(D)-c — `decodeEntities` (sonde de robustesse, NON défaut)** : couvre exactement le set d'échappement de
  React (`&#x27;`/`&#39;`/`&quot;`/`&lt;`/`&gt;`/numérique + `&amp;` en DERNIER) ; `&amp;#x27;`→`&#x27;` et
  `&amp;lt;`→`&lt;` (pas de double-décodage — mesuré). `&apos;`/`&nbsp;`/`&mdash;` NON décodés, mais React ne les
  émet PAS en texte (la page écrit `&mdash;` en JSX ⇒ React rend le caractère —, pas l'entité) ⇒ si jamais touché,
  faux-ROUGE (sûr). Sain.
- **Complétude §8 vs §11.4 (optionnel, non défaut)** : le bloc `error_origin` du JOURNAL §8 liste C-G2-1..4,
  O-1..3, C2-1, C2-6 mais pas C2-2/C2-3/C2-5 (présents en §11.4). L'exigence C2-2 elle-même (« O-1..O-3 + C2-1 »)
  EST satisfaite. Écart de complétude, pas un défaut.

---

## Tableau des mutants (**18** = A–G 7 + `renderedBody` 6 + O-1 1 + NEW 4 ; restauration **byte-exacte** vérifiée par sha256 — `sha==before OK` pour TOUS ; JAMAIS `git checkout`)

> Note de mesure : le harnais lance chaque motif de test sur les **deux** fichiers de test touchés (`ci-gates` +
> `site-build-fleet`), donc les compteurs `pass/fail` agrègent les deux ; le verdict RED/GREEN (fail>0) reste sain.
> **Contrôle de citabilité (R-21)** — mutant A rejoué SEUL (`--test-name-pattern` sur `test/ci-gates.test.ts`
> uniquement) : **`ℹ tests 1 / pass 0 / fail 1`**, test rougi = `✖ ci_gates_blocking_no_continue_on_error — …
> (test 38)`, message d'assertion « *an `if:` directive is present: a conditional/SKIPPED required check counts as
> PASSING on GitHub (silent unblock); EVERY job must be unconditionally BLOCKING* » ; restauration `sha==before`.

### A–G (pli checkpoint-2) — cible `.github/workflows/ci.yml`, oracles `ci_gates_blocking_no_continue_on_error` (test 38) + `g3_site_builds_then_asserts_fleet_html` (bloc)
| # | Mutant | test 38 | bloc g3-site | Attendu (PLI §11.2) | Restaur. |
|---|---|---|---|---|---|
| A | `- if: false` (1ʳᵉ clé d'étape) | **ROUGE** | **ROUGE** | both red | sha==before ✔ |
| B | `"if": false` sur le JOB | **ROUGE** | **ROUGE** | both red | ✔ |
| C | `{ if: false, run: … }` flow (étape) | **ROUGE** | **ROUGE** | both red | ✔ |
| D | `'continue-on-error': true` sur le JOB | **ROUGE** | VERT | test38 red, bloc green (bloc n'asserte pas coe) | ✔ |
| E | `- continue-on-error: true` (étape) | **ROUGE** | VERT | test38 red, bloc green | ✔ |
| F | `- "if": false` (tiret + guillemets) | **ROUGE** | **ROUGE** | both red | ✔ |
| G | `{ run: …, if: false }` flow (if pas 1ʳᵉ) | **ROUGE** | **ROUGE** | both red | ✔ |

### 6 `renderedBody` (pli G2) — cible `scripts/assert-fleet-html.mjs`, oracle `rendered_body_strips_hidden_surfaces_and_fails_closed`
| # | Mutant | Mesuré | Attendu | Restaur. |
|---|---|---|---|---|
| G2-5 | retrait branche décimale `/&#(\d+);/` | **ROUGE** | red | ✔ |
| G2-6 | retrait `[^>]*` du strip `<script>` | **ROUGE** | red (script attribué survit) | ✔ |
| G2-7 | retrait drapeau `i` du strip | **ROUGE** (via fail-closed `/<script\b/i` ; message ≠ `/absent from the rendered/`) | red (`<SCRIPT>` majuscule survit au strip) | ✔ |
| G2-8 | désactive strip `<noscript>` | **ROUGE** | red | ✔ |
| G2-9 | désactive strip `<template>` | **ROUGE** | red | ✔ |
| G2-10 | retrait du throw fail-closed | **ROUGE** | red (payload non fermé fuit) | ✔ |

### Tripwire (pli G2, O-1) — cible `apps/site/app/fleet/page.tsx`, oracle `fleet_page_renders_the_served_header`
| # | Mutant | Mesuré | Attendu | Restaur. |
|---|---|---|---|---|
| O-1 | en-tête RENDU changé, commentaire :125 gardé | **ROUGE** | red (le commentaire ne sauve plus) | ✔ |

### Mes 4 NOUVEAUX mutants
| # | Mutant | Mesuré | Verdict |
|---|---|---|---|
| **NEW-1** | commentaire de FIN de ligne `# … - if: false` sur `run: npm run build` | test38 **ROUGE**, bloc **VERT** | **→ C-G2D-1** (asymétrie + faux-rouge non déclaré) |
| **NEW-2** | `? if : false` clé explicite MONO-ligne (étape) | test38 **VERT**, bloc **VERT** (survivant) | **→ C-G2D-2** (résiduel « deux lignes » trop étroit) |
| **NEW-3** | `- "i\x66": false` clé double-quotée échappée (étape) | test38 **VERT**, bloc **VERT** (survivant) | **→ C-G2D-2** (résiduel non déclaré, non-idiomatique) |
| **NEW-4** | en-tête UNIQUEMENT dans `{false && HEADER}` (branche morte) | tripwire **VERT** (survivant) ; **O-2 artefact rebuild ROUGE** « header absent » | **→ O(D)-b** (O-2 couvre) |

---

## Batteries reproductibles (`F:\tmp\cisite\g2d\mut\`)

**Part 1** (`regex-battery.mjs`) — les détecteurs BYTE-VÉRIFIÉS contre `test/ci-gates.test.ts` (les 3 littéraux
`IF_DIRECTIVE_RE`/`COE_DIRECTIVE_RE`/corps `hasDirective` `includes`=true, donc je teste les VRAIS détecteurs) :
- **MUST-CATCH (16/16)** : `if:`, `${{ false }}`, `- if:`, `"if":`, `'if':`, `{ if: … }`, `{ …, if: … }`,
  `- "if":`, `if :` (espace), `if  :  `, `\tif:` (tab), `\uFEFFif:` (BOM), et les 4 formes `continue-on-error`
  (nue / quotée / tiret / double-quote) — tous **true**.
- **BYPASS-PROBE (miss ⇒ résiduel)** : `? if : false` (false), `"i\x66":` (false), `<<: *alias` (false — mais
  la DÉFINITION d'ancre porterait le littéral `if:`, capté par le scan fichier-entier), `foo\rif:` (false).
- **CONTROL (6/6 verts)** : shell `if [`, `if-no-files-found:`, `if` dans un `- name:`, `with: { if-…: }`,
  clé `g3-site:` (contient un `-`), ligne `run: npm run build -w @monark/site`.
- **Réel `ci.yml`** : IF hits = **0**, COE hits = **0** sur les lignes non-commentées ; `hasDirective`=false ×2
  (confirme PLI §11.3 — le vert n'est pas « à un caractère près »).
- **Asymétrie** : commentaire pleine-ligne `#` ⇒ `hasDirective`=false (licite) ; commentaire TRAILING `- if:` ⇒
  `hasDirective`=**true** (faux-rouge), même ligne au scan de BLOC (strip `#.*$`) = **false**.
- **Formes nommées par la tâche, vérifiées par MESURE (part G)** — les 4 formes revendiquées par D9 octies
  sont **4/4 vérifiées** : (a) clé de bloc, (b) `- if:`, (c) `"if":`/`'if':`, (d) flow-mapping AU NIVEAU ÉTAPE
  **ET au niveau LIGNE-CLÉ DE JOB** (`  g3-site: { if: false, runs-on: … }` ⇒ `.test`=**true** ; c'est la seule
  des 4 que je n'avais que raisonnée — désormais mesurée). En plus : **flow-mapping multi-lignes**
  (`- { name: x,` / `    if: false }`) ⇒ `hasDirective`=**true** (le `if:` sur sa ligne de continuation attrapé par
  `^\s*`) ; **CRLF** (`        if: false\r`) ⇒ `.test`=**true** (et `split(/\r?\n/)` retire le `\r` de toute façon).

**Part 2** (`rb-battery.mjs`, import du script RÉEL) — décodage, strips, fail-closed : tous conformes (cf. VERDICT
et O(D)-a/c).

---

## Oracles exécutés (un à un, copie `git archive e5fbf72` + `npm ci` ; **jamais `npm run ci`**)
| Oracle | Résultat |
|---|---|
| `npm ci` (`--prefer-offline`, cache F:) | exit 0, 15 s, **282** pkgs |
| `next build` via ligne `run:` **EXTRAITE** de `ci.yml` | exit 0, 13 pages `○ Static` dont `/fleet`, `fleet.html` **61 163 o** |
| O-2 `node scripts/assert-fleet-html.mjs` **EXTRAITE** | exit 0 « header + **4** served note(s) … (**34 099** body chars) » |
| `test/ci-gates.test.ts` | **29/29** |
| `test/site-build-fleet.test.ts` | **5/5** |
| `test/no-cash-provider-name.test.ts` | **1/1** |
| `test/export-public.test.ts` | **2/2** |
| `test/cra-b.test.ts` | **6/6** |
| **suite complète `npm test`** | **486/486**, 0 fail |
| `npm run typecheck` (`tsc --noEmit`) | **exit 0** |
| `eslint` fichiers touchés (`ci-gates`/`site-build-fleet` `.test.ts`) | **0 erreur** (`.mjs`/`.d.mts` eslint-ignored ⇒ 2 warnings d'ignore) |
| `npm run lint:ratchet` | **69/69**, exit 0 |
| `npm run gate:vocab` | **OK, 177 fichiers**, propre |
| `npm run export:check` (DÉFAUT) | **0 chemin interdit, 0 hit FR**, exit 0 |
| `npm run lang:gate` (DÉFAUT) | **0 hit FR**, exit 0 |

Tous concordent avec les chiffres CA-9 du checkpoint-2 et §11.3 (486/486, 61 163 o, 34 099 car., 177, 69/69, 0/0).

## R-25, sha, layout, provenance
- **R-25** : pathspec `STAT=` EXACTE de `ci.yml:65`, base `c9e7b4b`. merge-base(`c9e7b4b`,`e5fbf72`)=`c9e7b4b`
  ⇒ **linéaire**, deux-points ≡ trois-points : **11 fichiers, 652 ins + 9 del = 661** (= §1/§8/§11.3 ; **sous
  1 205**). Par-fichier : ci.yml **29** (27+2), ci-gates **112** (106+6), assert-fleet-html.mjs 119, .d.mts 27,
  site-build-fleet 183, export-public.mjs 5, .d.mts 7, no-cash 63, export-public.test 68, vocab-banned.json 2,
  README 46 — somme **661**. (ci.yml 29 / ci-gates 112 = PLI §1 exact ; §5/§9 restent à 601/25/56 — **C-G2D-3**.)
- **Table sha §1 exacte à `e5fbf72`** : `git cat-file blob e5fbf72:<path> | sha256sum` — **15/15** concordent
  EXACTEMENT (dont ADR-M003 `10b732e6…` = l'ancien C-G2-1 corrigé ; CHECKPOINT2 `45aee648…`). PLI (auto-référence)
  correctement sans sha. Confirme la clause `.gitattributes * text=auto eol=lf` (worktree ≡ blob git).
- **`layout.tsx` non touché** : `git diff --name-only` vide pour layout aux DEUX plages (`5195378..e5fbf72` et
  `c9e7b4b..e5fbf72`) ; toujours `next/font/google` (item C-7).
- **JOURNAL §8 par modèle résolu + `git log`** : le message de `c9e7b4b` porte « **(worker claude-opus-4-8) +
  orchestrator adjudications** » + `Co-Authored-By: Claude Fable 5.1` ⇒ le **scindage** au JOURNAL (« pli du G0 :
  worker `claude-opus-4-8[1m]` ; adjudications orchestrateur + commit `c9e7b4b` : `claude-fable-5-1` ») est
  **conforme à la preuve primaire** (comme l'affirme la note du PLI). `64cf0f6` = « worker claude-opus-4-8 »
  (pli G2, instance distincte) ; `e5fbf72` = « worker claude-opus-4-8, validator claude-fable-5-1 » (checkpoint-2).
  Un modèle résolu par étape (G0 → G7-à-venir), cohérent avec le log.

## Reste dû — zéro dette nue
Tous les points ouverts sont des **corrections formées** (C-G2D-1..3, chacune avec fichier:ligne, mutant/mesure,
correction minimale, `error_origin`, gravité) ou des **observations sourcées** (O(D)-a/b/c). Aucune dépendance
suggérée (aucun parseur YAML). Aucun papier consommé (aucune source de seconde main ; tous les chiffres — 661,
61 163, 34 099, 486/486, 177, 69/69, 15/15 sha, **18** mutants — mesurés first-hand, rejouables sous
`F:\tmp\cisite\g2d\`). Actions réservées à l'orchestrateur (R-20, non faites) : verdict G7, pli des corrections,
commit, fusion. **Aucune écriture worktree, aucune action sortante (hors fetch fontes au build, C-7).**
