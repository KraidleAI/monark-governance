# G2-DELTA SITE-RELEASE-1 (relecteur Opus 4.8, reprise) — PASS

G2-DELTA verification complete on the updated fused tree `3759016`. Rendu intégral ci-dessous (identique au fichier `F:\tmp\g2-site\G2-DELTA-lot-site-release-1.md`).

Modèle résolu : claude-opus-4-8[1m]

# G2-DELTA — lot SITE-RELEASE-1 sous-lot B (pli checkpoint-2 C-1/C-2/C-3), arbre fusionné @ `3759016`

> Relecteur G2 (Opus 4.8, effort max), reprise, même clone `F:\tmp\g2-site\tree`. Données brutes (R-21), preuves rejouables. Aucun commit (R-20). Tout oracle sous `env -u` des 8 clés payantes (A-7). Aucune écriture dans `F:\Monark`, `F:\Monark-wt-*`, `F:\tmp\site-merge\tree`.

## 0. VERDICT G2-DELTA : **PASS**
Le pli B (`6aed9c3`, fusionné `3759016`) ferme le survivant X5 trouvé au checkpoint-2 (pilule Ukemi lisant `.status` mais **inversant sa valeur affichée**, survivant parce que le chemin build→assert exécutait la composition sans **asserter sa sortie**). Rejeu intégral confirmé. Une observation non-bloquante : le R-25(B) réel est **858** (le « 853 » du RENDU est un intermédiaire pré-raffinement ; §6). §7 : AM-1 du relecteur (lentille manquante à mon G2).

## 1. Reprise et périmètre du pli
- `git fetch F:\tmp\site-merge\tree` + `git checkout 3759016` ; `git rev-parse HEAD` = `3759016f37f8499641a12da21421f713c2abf10c` ; log : `3759016 merge SITE-B fold` ← `6aed9c3 SITE-RELEASE-1-B fold (cp-2 C-1/C-2/C-3)` ← `60ecf64`.
- node_modules (junctions) toujours valides après checkout : `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-site\tree\packages\rpc-guard\src\index.ts`.
- **`git diff --name-status 60ecf64 3759016` = exactement 4 fichiers** (attendu) :
```
M docs/G1-lot-site-release-1-B.md
M scripts/assert-fleet-html.d.mts
M scripts/assert-fleet-html.mjs
M test/site-ukemi.test.ts
```
- **Constat fort** : le composant (`ukemi-page.tsx`), la copie (`ukemi-copy.ts`), la route (`app/ukemi/page.tsx`) et l'icône **ne sont PAS touchés** — le correctif est dans l'**ORACLE** (`assert-fleet-html.mjs` asserte désormais la SORTIE de la pilule) + le test + le registre G1-B. `fleet.ts` intact. Aucun fichier de A touché. (⇒ l'artefact `ukemi.html` est inchangé ; la nouvelle protection est l'assertion.)

## 2. Le correctif, lu sur pièces (`git diff 60ecf64 3759016`)
- `assertUkemiBody({html, expected})` reçoit désormais **`expected.status`** (gardé anti-vacuité) et, après les contrôles digit-free/interdits, exige le **porteur `"Ukemi " + status`** dans le corpus du `<main>` : *« a pill that STILL reads `.status` but FLIPS the value (mutant X5) reddens HERE on the ARTEFACT path — the source-only `.status` check cannot catch a flip »*.
- `main()` **dérive `status` du registre RÉEL** `FLEET_AGENTS.find(a => a.name === "Ukemi").status` (déjà importé), **fail-closed** (`process.exit(1)`) si Ukemi absent.
- `test/site-ukemi.test.ts` : `UKEMI_STATUS` lu du **registre réel** `FLEET_AGENTS` (throw si absent, A-8) ; `greenMain()` rend `<span>${UKEMI_STATUS}</span>` (plus de `built` codé en dur) ; `EXPECTED.status = UKEMI_STATUS` ; cas rouges **pilule flippée** (`/pill does not carry/`), **pilule absente**, **`expected.status` vide** (`/vacuity/`) ; carrier **`rendered.has("status")`** (la pilule rend `{status}`, jamais un littéral — tue M12).

## 3. X5 rejoué PAR MOI sur le chemin build → assert (le point que mon G2 avait manqué)
### 3.1 Rejeu INDÉPENDANT (ma propre mutation, mes propres build+assert)
Mutation `const status = ukemiAgent.status;` → `… = ukemiAgent.status === "built" ? "upcoming" : ukemiAgent.status;` (lit toujours `.status`) :
- test source `site_ukemi_reads_status_only` : **SURVIT (vert)** — rejoué sous MA mutation : `ℹ pass 1 / ℹ fail 0` (reçu capturé) ; un contrôle source ne peut pas attraper une inversion de sortie ;
- `npm run build -w @monark/site -- --webpack` : **exit 0** (code valide) ;
- `node scripts/assert-fleet-html.mjs` : **exit 1** — `assert-ukemi: the /ukemi <main> pill does not carry the registry status (expected carrier "Ukemi built") — a flipped pill value (mutant X5)` ;
- artefact `<main>` : `upcoming=true`, `"Ukemi built"=false` ;
- `git checkout` → restauré byte-exact ; rebuild propre + assert = **exit 0** ; `git status` propre.

### 3.2 Corroboration par le harnais livré `mutants-X-siteB.mjs` (repointé sur le clone, chemin RÉEL)
`node <scratchpad>/mutants-X.mjs` = **exit 0** ; les 4 tués sur l'artefact, restaurés byte-exact, rebuild propre vert :
| X | mutation | tests racine | build | assert artefact |
|---|---|---|---|---|
| X1 | `<p>185 of 189</p>` littéral | `body_scan_and_carrier` RED | 0 | **RED** `["185","189"]` |
| X2 | `interval` dans `LIQ_CONDITIONAL` | `copy_equals` + `never_interval` RED | 0 | **RED** « interval » |
| **X5** | pilule flippée (lit `.status`) | `reads_status_only` **GREEN (survit au source)**, `body_scan_and_carrier` GREEN | 0 | **RED** « pill does not carry … mutant X5 » ; `<main>` upcoming=true, Ukemi-built=false |
| X6b | `{ukemiAgent.line}` rendu | `reads_status_only` RED | 0 | **RED** « cascade » |

### 3.3 M12 — pilule hard-codée en littéral (non branchée à `.status`)
`mutants.mjs` (15) M12 (`{status}` → littéral `built`) → `site_ukemi_body_scan_and_carrier` **RED** via le carrier source `rendered.has("status")` (le littéral matcherait l'artefact par coïncidence — d'où le contrôle SOURCE en complément de l'artefact).

### 3.4 A-8 + fail-closed (lus sur pièces)
`greenMain()` et `EXPECTED.status` **lisent `FLEET_AGENTS` réel** (jamais un stub) ; `UKEMI_STATUS` throw si Ukemi absent. `main()` dérive `status` de `FLEET_AGENTS` et **`process.exit(1)` si Ukemi absent** (registre cassé ne passe pas). ✔

## 4. Mutants — 15 + X1/X2/X5/X6b + CM1..CM5, tous rejoués sur `3759016`
- **`mutants.mjs` (15)** : baseline 5/5 vert ; **15/15 ROUGES + restaurés**, exit 0 (M1–M12 incl. M12 CA-11).
- **`mutants-X-siteB.mjs` (X1/X2/X5/X6b)** : **4/4 tués sur l'artefact**, rebuild propre vert, exit 0 (§3.2).
- **Mes CM1..CM5 rejoués** : CM1 (`gate.ts` interval → `copy_equals` RED), CM2 (`fleet.ts` Ukemi built→upcoming → `fleet_register_built_set_is_frozen` RED), CM4 (`honesty-lint` `scanText` neutralisé → `body_scan_and_carrier` RED) — tous **RED+restaurés** (exit 0) ; **CM3** (`fleet.ts` rename Ukemi → build **exit 1** « fleet-presentation: no INSIDE block for 'ukemi_x' », restauré) ; **CM5** (digit rendu dans `REGION_NOTE` → assert **exit 1** `["185","189"]`, restauré). Tree pristine après chaque.

## 5. Oracle sur artefact FRAIS (`3759016`, tout `env -u`)
| Oracle | Exit | Résultat |
|---|---:|---|
| `npm run ci` | **0** | **830 / 829 / 0 / 1** ; 1 skip = `fetch_only_inside_client` (pré-existant, apps/bell) ; 5 tests `site_ukemi_*` verts |
| `npm run build -w @monark/site -- --webpack` | **0** | artefact frais (rejoué ×2 : baseline + rebuild propre final) |
| `node scripts/assert-fleet-html.mjs` | **0** | `/fleet` 4 notes ; `/ukemi` `<main>` digit-free 0 token, état+clause présents, **« pill carries registry status "built" »**, 0 interval/cascade/Bell/Aave ; corpus `<main>` porte « Ukemi built », pas « upcoming » (vérifié indépendamment) |
| `lint` / `lint:ratchet` / `lang:gate` / `export:check` | 0 / 0 / 0 / 0 | ratchet **69/69** ; lang/export 0 hit, scope inclut `site` |

## 6. R-25 B (pathspec VERBATIM `ci.yml:65`, base `7c34bef`) — **858** (le « 853 » du RENDU est un intermédiaire)
- `git diff --shortstat 7c34bef 3759016 -- <7 fichiers B> <excludes>` = **`7 files changed, 855 insertions(+), 3 deletions(-)`** ⇒ **R-25(B) = 858**.
- **Reproductible** : identique au **commit du pli** `6aed9c3` (`855+/3-`), et le merge `3759016` **n'altère aucun fichier B** (`git diff --stat 6aed9c3 3759016 -- <B> ` = vide). 858 **< 1 150**. PASS.
- **Réconciliation du 853 — MESURÉE (non-bloquant)** : décomposition `git diff --numstat 2de11fb 6aed9c3` (B original → pli) sur les 3 fichiers modifiés = **47 insertions, 12 suppressions, net +35** (`.d.mts` 5/4, `.mjs` 23/5, `test` 19/3) ⇒ B original **823** + **35** = **858** (les 12 lignes retirées étaient des insertions de la B originale, d'où cumul vs `7c34bef` = 855+/3−, R-25 inchangé côté suppressions). Le **+5** entre le « 853 » du §6 du RENDU et le 858 final est **mesuré** : `git diff 2de11fb 6aed9c3 -- test/site-ukemi.test.ts | grep -c` du cluster de raffinement advisor (carrier `rendered.has("status")`, cas rouges pilule flippée/absente, `expected.status` vide, `greenMain` `${UKEMI_STATUS}`) = **5** lignes — exactement les ajouts que le RENDU §8 déclare postérieurs à sa mesure §6. Chiffre autoritaire de l'artefact livré = **858** (< 1150) ; le « 853 » du registre gagnerait à être corrigé en 858 (imprécision de provenance, sans effet sur le gate).

## 7. AM-1 du relecteur — pourquoi mon G2 n'a pas produit X5 (lentille manquante)
Mon premier G2 a vérifié le **côté ENTRÉE** (C-6 : le composant *lit* `.status` — source ; `.line`/`.wiring` = 0) et la **PRÉSENCE** du jeton (`/\bbuilt\b/` = true dans le corpus du `<main>`), mais **pas le LIAGE de SORTIE** : que la **valeur RENDUE de la pilule ÉGALE le statut du registre**. X5 **préserve la lecture** (`.status`) et **inverse la sortie** — invisible à un contrôle source ET à un contrôle de présence. Mon `pill-and-scan` imprimait même « pill 'built' present: true » (à un pas du défaut), mais j'ai traité la **présence comme suffisante** et n'ai jamais construit le mutant *lecture-préservée / sortie-altérée*. Mon CM2 testait le **gel du registre** (source), pas le rendu.

**Lentille manquante (à intégrer) : sur toute surface SERVIE, pour chaque valeur câblée, asserter que la SORTIE servie ÉGALE sa source (liage), pas seulement « le code lit la bonne source » (entrée) ni « le jeton est présent » (présence) — et l'éprouver par un mutant qui PRÉSERVE la lecture et ALTÈRE la sortie.** C'est exactement le mode d'échec CA-11/MAST « composition exécutée, sortie non assertée » : le tuyau `fleet.status → pilule` s'exécutait au build sans qu'aucun oracle non-LLM n'asserte sa sortie.

**Discriminant MESURÉ (le nœud que j'ai manqué)** : mon CM2 déplaçait la SOURCE (`fleet.ts` `built→upcoming`) ; X5 déplace la SORTIE **après** la lecture. J'ai vérifié empiriquement que ce sont deux classes distinctes : un flip de SOURCE est attrapé **avant** que l'assertion importe — (a) `fleet_register_built_set_is_frozen` **RED** (`ℹ fail 1`), et (b) le build **échoue** au type-check `lib/fleet.ts: error TS2322 … 'wiring' … not assignable to 'undefined'` (un agent `built` porte `wiring`, interdit sur `upcoming`) ⇒ il n'atteint jamais l'assert. X5, lui, est **type-valide, préserve la lecture `.status`, et n'altère que la sortie rendue** : il passe C-6 (source), le gel, ET le tsc — **seule** une assertion de LIAGE DE SORTIE sur l'artefact servi le tue. C'est précisément cette classe (type-valide / lecture-préservée / sortie-altérée) que ma lentille entrée+présence ne pouvait pas produire. Le checkpoint-2 a ajouté l'assertion d'artefact (`"Ukemi " + status`) + le mutant X5 ; le pli l'a implémentée. (Cohérent avec l'`error_origin` proposé : X5 = plan + conception de test, manqué au G0 §3.3 / cp-1, et non attrapé par mon G2 faute de la lentille de liage de sortie.)

## 8. Registre G1-B persisté (C-2/C-3) — vérifié
- **C-2 (tuyaux verbatim, 0 renvoi hors dépôt)** : `docs/G1-lot-site-release-1-B.md` §2 = ligne Tuyaux B verbatim, sources = fichiers du dépôt (`gate.ts`, `ukemi-copy.ts`, `fleet.ts`, `globals.css`, `assert-fleet-html.mjs`, `test/site-ukemi.test.ts`, job `g3-site`). `grep -cE 'F:\\|F:/' docs/G1-lot-site-release-1-B.md` = **0**.
- **C-3 (5 écarts maquette déclarés)** : §5.2 porte les cinq (i)-(v) avec déclencheur (design episode, Provenance, replay-it, dérives is/is-not, bloc servi `class`/`price path`/`unit`/`nominal coverage`) → **U-4b-2b** ou lot de suivi ; §5.1 rappelle les 4 du G0 §16.1. La citation C-11 corrigée (« in the stratum → for a population » re-justifié par la consistance avec le glossaire `under_calib` livré par A, pas par C-11).

## 9. Zéro dette
Items formés à déclencheur (inchangés, nommés) : nav `/ukemi` (lot de suivi / U-4b-2b) ; figures/sections design-set + bloc servi (U-4b-2b) ; `LIQ_UPPER_BOUND`/`LIQ_H3` non rendues (U-4b-2b) ; dérives (iv) (lot de suivi). Aucun dû nu. Aucun commit ni workflow (R-20).

## 10. Reproductibilité
```
git fetch F:/tmp/site-merge/tree ; git checkout 3759016
git diff --name-status 60ecf64 3759016                      # 4 fichiers
env -u … npm run build -w @monark/site -- --webpack ; node scripts/assert-fleet-html.mjs   # 0 ; « pill carries registry status "built" »
# X5 indépendant : sed ternaire dans ukemi-page.tsx -> build 0 -> assert 1 (« pill does not carry … X5 ») -> git checkout -> rebuild -> assert 0
node <scratchpad>/mutants-B15.mjs                            # 15/15 RED (incl. M12), exit 0
node <scratchpad>/mutants-X.mjs                              # X1/X2/X5/X6b tués sur l'artefact, exit 0
node <scratchpad>/cross-mutants.mjs                          # CM1/CM2/CM4 RED, exit 0
env -u … npm run ci                                          # 830/829/0/1, exit 0
git diff --shortstat 7c34bef 3759016 -- <7 B files> <pathspec ci.yml:65>   # 855+/3- = 858
grep -cE 'F:\\|F:/' docs/G1-lot-site-release-1-B.md         # 0
```
Logs : `F:\tmp\g2-site\{d-build,d-assert,x5-build,x5-assert,x5-rebuild,d-mutants15,d-mutantsX,d-cm3,d-cm5a,d-cm5b,d-final-build,d-final-assert,d-ci,d-lint,d-ratchet,d-lang,d-export}.log`. Harnais scratchpad : `mutants-B15.mjs`, `mutants-X.mjs`, `cross-mutants.mjs`.

---
**Verdict G2-DELTA : PASS.** X5 tué sur le chemin build→assert (rejoué indépendamment + harnais) ; M12 tué au source ; 15 + X1/X2/X5/X6b + CM1..CM5 rouges ; oracle 830/829/0/1, build+assert 0 ; R-25(B) 858 < 1150 ; registre G1-B verbatim, 0 renvoi hors dépôt, 5 écarts déclarés. Observation non-bloquante : le registre affiche 853 au lieu du 858 mesuré (intermédiaire pré-raffinement). Sortie soumise à la vérification adversariale de l'orchestrateur (R-21) ; aucun commit ni workflow (R-20).

Fichiers pertinents (chemins absolus) : `F:\tmp\g2-site\G2-DELTA-lot-site-release-1.md` (ce rendu) ; `F:\tmp\g2-site\G2-lot-site-release-1.md` (G2 initial) ; clone vérifié `F:\tmp\g2-site\tree` @ `3759016` (pristine) ; logs sous `F:\tmp\g2-site\` ; harnais scratchpad sous `F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad\` (`mutants-B15.mjs`, `mutants-X.mjs`, `cross-mutants.mjs`).
