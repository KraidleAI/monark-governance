# G1 — Lot F-site-5 : How it works (explainer + pipeline + region + 13 reasons + one-plug + limits)

## Gate 0 (R-1) — contrôle de résolution
- **Modèle résolu tel quel** : `claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` vérifié ✔ ; **pas** `claude-opus-5` (banni). Effort `max`. Rôle : worker IMPLÉMENTEUR mono-agent.
- **R-20** : aucun commit, aucun workflow déclenché. Les fichiers sont laissés **non commités** dans le worktree ; seul l'orchestrateur committe. (Staging temporaire `git add -A` utilisé pour mesurer R-25, immédiatement suivi de `git reset` — pas un commit.)

## Provenance
- Généré 2026-09-10, worker `claude-opus-4-8` effort max, contexte `shogen-orchestrator` / référentiel Compliance G0–G7. Worktree `F:\Monark-wt-fsite5`, branche `lot-fsite5`, base `d8b63c4` (= lot-fsite3, contient le sim). Réviseur = orchestrateur (G2 instance séparée à venir).
- Sources `[lu]` : design `MONARK.dc.html` (How it works L156-261 ; modèle x-dc `pipeline`/`reasons` L768-788, one-plug L251, limits L256-260) ; `scratchpad/design-impl-inventory.md` ; `docs/PLAN-Fsite-lot.md` §1/§7/§8 ; fondation (`apps/site/lib/{sim,gate-enums,fleet,load-contract}.ts`, `components/gate-sim/*`, `app/{layout,page}.tsx`, `globals.css`, `next.config.mjs`) ; gates (`test/{ci-gates,site-honesty}.test.ts`, `apps/site/test/honesty-lint.ts`, `scripts/{grep-forbidden,lang-gate}.mjs`, `vocab-banned.json`, `scripts/lang-exempt.json`) ; schemas `gate-decision`/`coverage-verdict`/`forbidden-keys`. Advisor consulté 2× (1× avant écriture, 8 angles morts fermés ; 1× avant clôture, défaut de preuve mutant-3 détecté et corrigé).

## Fichiers (delta vs lot-fsite3)
| Fichier | Δ | Rôle |
|---|---|---|
| `apps/site/app/how/page.tsx` | +303 | **NOUVEAU** — coquille server : intro, 3 issues, explainer monté, pipeline (4 contrats gelés), region, grille 13 raisons, one-plug, limits. |
| `apps/site/lib/how-copy.ts` | +98 | **NOUVEAU** — données de présentation PURES (no JSX/@-alias/node:), importables par Next ET `node --test` (patron `fleet.ts`). Glosses + vocab region ; codes/action jamais épelés en position rendue. |
| `apps/site/components/gate-sim/controls.tsx` | +4/-1 | **K-4(a)** — rétablit « Classification task, label schema `up|down`. » (design L171) dans l'intro de l'explainer. |
| `apps/site/components/gate-sim/index.tsx` | +15/-3 | **R3b** (démenti fort) + **K-4(b)** (qualification « vue abrégée/illustrative ») à côté de la vue JSON, mode explainer seul (design L192). |
| `test/ci-gates.test.ts` | +76/-1 | **K-4(b)** gate racine `gate_sim_json_keys_subset_of_frozen_contracts` + **R2** sœur `how_page_rendered_vocab_has_no_numeric_hole` + imports. |
| `docs/G1-lot-fsite-5.md` | (exclu R-25) | ce rapport. |

`git diff main -- schemas/ packages/` = **0 octet** (aucune frontière gelée touchée).

## Traitement des réserves (owner F-site-5)

### R3b — démenti fort « no p_correct, no confidence, no score » vs vocab-gate
- **Solution retenue (sans nouvelle exemption)** : rendu **`no p_correct, no confidence field, no score`**. La sous-chaîne `no confidence field` est **la phrase exemptée fermée existante** (`vocab-banned.json` `scan.site.exemptPhrases`, `grep-forbidden.mjs` L48/L33-49) ; `maskLine` la blanchit **par ligne, insensiblement à la casse, AVANT** le test des patterns, donc le `\bconfidence\b` nu ne l'atteint jamais. **Aucune nouvelle exemption, aucune garde d'inertie requise** (celle des exemptions vit chez K-2, owner F-site-4, absente de ma base — je ne crée donc pas de dette).
- **Contrainte respectée** : `no confidence field` tenu **contigu sur UNE ligne source** (le scan vocab est par ligne ; `renderedTexts` inclut les sauts de ligne dans `.text`, donc un reflow casserait à la fois le masque et le contrôle de porteur R-E). Vérifié dans `index.tsx` (démenti) et `page.tsx` (carte pipeline « sensors »).
- **Porteur R-E** : le démenti (JSX text) est un porteur rendu valide de la phrase exemptée (`vocab_site_confidence_exemption`, ci-gates L266 `.find` — porteurs multiples sans conflit ; page.tsx L103 reste le premier). Test vert.
- `1.0.0` (design L192/L238) **non écrit en prose** (aurait exigé une exemption honnesty-lint dont la garde d'inertie est K-2/F-site-4) : la version rend déjà **dynamiquement** dans la vue JSON (`gateJson` → `SCHEMA_VERSION`) ; la prose dit « GateDecision, a frozen contract » et le badge « Built · frozen schema ».

### K-4(a) — intro de l'explainer
`controls.tsx` : ajout de « Classification task, label schema **up|down**. » (`up|down` en mono, design L171), devant la phrase existante. 0 chiffre, 0 mot banni, `up|down` ≠ champ gelé.

### K-4(b) — vue JSON abrégée + gate racine
- **Qualification** (`index.tsx`, mode explainer) : « An abbreviated, illustrative view — the frozen CoverageVerdict carries more fields than are shown here; the Hikae panel lists them. » (le contrat porte 12 champs requis + `scores`, la vue en montre 7 → renvoi Hikae).
- **Gate racine** `gate_sim_json_keys_subset_of_frozen_contracts` (patron R1 : **pilote le vrai `gateJson()`**, jamais de liste de clés en dur) : clés top-level de `gateJson()` ⊆ `properties(GateDecision)` **et** clés `verdict` ⊆ `properties(CoverageVerdict)`. **Non-vacuité** : état pilote via `push(fresh(), {reading:0.8,…})` (branche `covered`, `verdict` = OBJET, pas l'ELLIPSIS), assertion `typeof verdict === "object"` avant de vérifier ses clés.
- **État vérifié sur la base** : top-level {schema_version, action, allow, tool, intent, verdict, remaining_budget, reason} = 8/8 exact ; verdict {task_class, method, alpha, region, abstain, reason, residual} = 7 ⊆ 13. Gate **vert** sur la base.
- **Distinct de F-site-8 R1** (`frozen_contract_fields_stay_dynamic` étendu aux **noms** de champs GateDecision cités en littéral) : K-4(b) vérifie la **FORME émise** par le sim, pas l'orthographe. **NB honorée** : F-site-8 R1 n'est **pas** dans ma base (branche séparée `855e61f`, non mergée) ; j'ai vérifié l'état du gate `frozen_contract_fields_stay_dynamic` (ci-gates L341, couvre 3 contrats, PAS GateDecision) → je construis K-4(b) à neuf, **sans duplication** (gate différent).

### R2 — scan numeric-hole étendu (region + codes-raison)
- **Gate sœur** `how_page_rendered_vocab_has_no_numeric_hole` : scanne au **même détecteur** (`scanText` honesty-lint) toutes les chaînes rendues via `{property access}` qui **échappent** au test 44 — `OUTCOMES[].gloss`, `REGION_KINDS[].{eyebrow,title,example[]}`, `REASON_GLOSS[].gloss`. 0 hit.
- **Complétude BIDIRECTIONNELLE** de la grille : `reasons` (de `loadGateEnums`) == clés `REASON_GLOSS` **dans les deux sens** (raison sans gloss ⇒ rouge ; gloss fantôme ⇒ rouge). La grille rend le **code depuis l'enum gelé** (jamais un littéral) et le glose par code → elle ne peut ni dériver ni dépasser l'enum (« a new reason needs an ADR »). Bornes de `tone` vérifiées (∈ [0, actions.length)).
- Le vocab region rendu **inline** de la page (pipeline `layer`/`what`/`absent` = **fragments ReactNode**, region blurbs) est scanné **directement par le test 44** (convention C-4 : prose = JSX text), défense en profondeur.

## Décisions de sourçage (zéro dette, C-4 / MAST « dérive de copie »)
- **Pipeline carte 1** : le design met « AttestedPrice · **AttestedDoc · AttestedFlow** / 1 built · 2 upcoming ». `AttestedDoc`/`AttestedFlow` **absents de `schemas/` ET de `fleet.ts`** (grep) ⇒ **non inventés** : la carte « sensors » rend le **seul** contrat d'attestation gelé (`AttestedPrice`, titre chargé), statut « Built », sans compte « two upcoming ». Les 4 cartes = les **4 shapes gelées** (`attested-price`/`prediction`/`coverage-verdict`/`gate-decision`), champs `required[]` **chargés** (jamais en dur).
- **One-plug** : chaque exemple aligné sur la ligne `fleet.ts` de l'agent (sourçage par descripteur propre, pas par le mapping produit) : Kaihi = « exits a liquidity range… ahead of toxic order flow » (`fleet.ts` L79) → « a liquidity vault installs Kaihi » (nom-client du design L251 conservé, sourcé à la ligne Kaihi) ; Ukemi = « Liquidation-cascade survival » (L63) → « a looping desk installs Ukemi » ; Genkan = distribution, « the point every transfer/swap/signature passes through first… commit, defer, or abstain… remaining budget » (L109) → « an agent runtime installs Genkan — the gate as a tool ». Cadrage AGENT (pièce visible), distinct du mapping PROFIL→PRODUIT (E-1, rendu ailleurs).
- **Troisième action `abstain`** (∈ CoverageVerdict) : **jamais un littéral** (ni cité ni en prose nue) dans mes fichiers — rendu `actions[ACTION_ABSTAIN]` depuis l'enum chargé (3 cartes d'issue, étiquettes-action des 13 raisons, chips region). `commit`/`defer` (non-champs) et les 13 codes-raison sont cités librement.

## Oracle (tout vert)
| Étape | Résultat |
|---|---|
| `npm ci` | 276 paquets, 0 vuln. |
| `npm run ci` (gate:vocab + typecheck + test) | **105/105** tests pass ; `gate:vocab OK` ; typecheck 0 erreur. Inclut test 44, `frozen_contract_fields_stay_dynamic`, `vocab_site_confidence_exemption`, `no_coverage_level_alpha`, mes K-4(b)+R2. |
| `npm run lint` (eslint .) | **0 erreur** (après retrait d'un import inutilisé `ACTION_COMMIT`). |
| `npm run lint:ratchet` | **92/92** (plafond inchangé). |
| `cd apps/site && npx next build` | **exit 0** ; `/how` **prerendered static** ; îlot client OK sous ThemeProvider ; schémas lus au build sans erreur. |
| `lang-gate --scope site` | **0** hit non-exempt. |
| `grep-forbidden` (`node scripts/grep-forbidden.mjs`) | **OK**, 79 fichiers, 0 réclamation. |
| `git diff main -- schemas/ packages/` | **0 octet**. |
| **R-25 vs lot-fsite3** | **501** (496 ins + 5 del) < 1205. |

## Preuves de mutant nommé (R-21, restore sha256 byte-exact)
1. **K-4(b)** : `p_correct: 0.9` injecté dans l'objet `view` de `gateJson()` (`sim.ts`) ⇒ `gate_sim_json_keys_subset_of_frozen_contracts` **rouge seul** (« emits top-level key(s) not in GateDecision: p_correct »). Restauré (sim.ts sha `f7ad2bc8…` avant == après).
2. **R2 (numeric-hole)** : « in time. » → « in 3 seconds. » dans un gloss ⇒ **rouge** (« carries a numeric literal: ["3"] »).
3. **R2 (bidirectionnel)** : clé `ghost_reason` (SANS chiffre) injectée seule dans `REASON_GLOSS` d'un fichier **propre** ⇒ **rouge** avec le message **spécifique** « How gloss(es) for a non-existent reason code: **ghost_reason** » (le check numeric-hole passe d'abord, donc la complétude bidirectionnelle EST atteinte et discriminante). sha `ed154611…` avant == après.
- **Note honnête (défaut de procédure détecté à la relecture, corrigé)** : au **premier** essai, `how-copy.ts` étant **non suivi par git**, `git checkout --` n'a pas pu réverter le mutant 2 (« pathspec did not match ») ; le mutant 3 s'est donc appliqué **par-dessus** le « 3 seconds » résiduel, et comme le test asserte `numericHits` **en premier**, le rouge observé était le **chiffre**, pas la clé fantôme — preuve mutant-3 **confondue**. Corrigé : `how-copy.ts` réécrit à l'identique (sha re-vérifié), puis **re-run isolé** (backup scratchpad → injection `ghost_reason` seule → message spécifique confirmé → restore → sha `ed154611…`). Pour un fichier non commité, l'oracle de restauration est **le sha, pas `git checkout`**.

## Choix douteux / limites déclarées (aucune dette nue, P5)
- **Liens vers routes futures** (`/token`, `/products`, `/integrators`) : `typedRoutes` **désactivé** (`next.config.mjs`) ⇒ `next build` ne casse pas ; 404 runtime jusqu'à ce que ces lots atterrissent. Cibles conformes au header (`/products`, `/token`, `/integrators`) et à l'inventaire (`/api` → `/integrators`).
- **Édition de fichiers F-site-3** (`controls.tsx`, `index.tsx`) : dans le mandat explicite K-4(a)/(b)+R3b ; comptée dans mon delta.
- **`liquidable`** (design L225) : **conservé** — vérifié absent de `FR_WORDS` et sans diacritique (`lang-gate.mjs` L54-87) ⇒ lang-gate vert.
- **Complétude R2** : le test épingle 5 branches distinctes via `decide()` déjà couvertes ; une future branche `decide()` devra étendre la liste (limite déclarée, héritée de F-site-3 R1).
- **K-4(b)** : vérifie top-level + verdict (spec) ; la sous-forme `region` (kind/labels/label_schema) n'est pas re-vérifiée (hors spec ; ses clés ne sont pas des champs des 3 contrats scannés — sûres). Déclaré, non caché.

## Clôture zéro dette
Toutes les tensions **résolues et documentées** : R3b par la phrase exemptée fermée (contigüité + porteur) ; `1.0.0`/`AttestedDoc`/`AttestedFlow` par reformulation/sourçage (jamais inventés) ; `abstain` par l'enum chargé ; K-4(b) par un gate pilotant la vraie fonction ; R2 par un scan sœur bidirectionnel. Aucun « dû » nu, aucun contournement, aucune procurement en attente.
