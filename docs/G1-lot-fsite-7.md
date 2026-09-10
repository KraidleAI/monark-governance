# G1 — Journal de provenance — Lot F-site-7 (Roadmap & Token)

- **Campagne** : F-site MONARK (port du design `MONARK.dc.html` sur la fondation gouvernée).
- **Worktree** : `F:\Monark-wt-fsite7` — branche `lot-fsite7`, base `d8b63c4` (= lot-fsite3, contient le sim ; `main` = `1eaf8a1`, en amont ; sera rebasé sur main après merge F-site-3).
- **Date** : 2026-09-10.
- **Contrat** : `docs/PLAN-Fsite-lot.md` §1/§3.7/§7 (checkpoint-1 : C-4/C-5, réserve **R4** owner F-site-7 ; **E-1**, **β**, **Mod #2** tranchés) + §8 (réserve R4). `F:\Clawpumptech\DESIGN-MODS-MONARK.md` **Mod #2** (page Token). Inventaire `scratchpad/design-impl-inventory.md` §1/§4a (a3/a5/a6)/§4d. ADR-M004 addendum **D15** (sim illustratif, gate-enums, système visuel).
- **Rôle** : worker mono-agent, IMPLÉMENTEUR. **R-20** : ne committe pas, ne déclenche aucun workflow. Revue G2 (instance séparée, contexte frais) + verdict G7 restent à l'orchestrateur.

## Gate 0 (R-1) — contrôle de résolution du modèle
- **Modèle résolu tel quel** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` attendu — conforme ; **pas** `claude-opus-5` banni).
- **Effort** : `max`.

## Fichiers créés / modifiés (code de ce lot)
| Fichier | Statut | Delta |
|---|---|---|
| `apps/site/app/token/page.tsx` | **créé** (server component ; monte `GateSim` mode `token`) | +118 / -0 |
| `apps/site/app/roadmap/page.tsx` | **modifié** (ajout section design « Roadmap » : 4 layers + 3 phase-cards, au-dessus des sections built/upcoming conservées) | +137 / -16 |

**Non touchés** : `schemas/`, `packages/` (`git diff d8b63c4` **vide**, 0 octet) ; `honesty-lint.exempt.json` (**aucune exemption ajoutée** — Phase/L reformulés en mots, pas exemptés ; voir D-2) ; `test/ci-gates.test.ts` (aucun nouveau gate requis — voir C-4 ; l'intention de la garde `NEW_SURFACES`/`fleet_register_built_set_is_frozen` (consommation du registre par `roadmap/page.tsx`) est **préservée** : après le renommage D-1bis, le seul `status` de la surface est le `StatusBadge` alimenté par `a.status`) ; `app/page.tsx` (fichier de F-site-4 — sa constante `LAYERS` duplique la mienne pendant le transitoire ; **je n'y touche pas**, isolation C-3 — noté pour F-site-4) ; tous les composants `gate-sim/*`, `lib/{sim,gate-enums}.ts` (réutilisés en l'état).
- **sha256** (pré-commit, provenance) : `token/page.tsx` = `bf6a8300f71993872dde564b39beb09aed88657b2dcf6cb6a0de9d45e2a74187` ; `roadmap/page.tsx` = `708fb556be8efe8b83abb273c5facc81166def2f92070a22f22d7da3ad14a4ea` (post-renommage D-1bis).

## Décisions

### D-1 — Roadmap : AUGMENTER, pas remplacer (réserve advisor)
La section design « Roadmap » (`data-screen-label="Roadmap"`, L335-352) = **titre « Four layers, at four maturities. » + 4 layers + 3 phase-cards** est ajoutée **en tête** ; les sections **Built** et **On the roadmap** existantes (consommatrices du registre `fleet.ts`) sont **conservées telles quelles en dessous**. Raisons : (a) lecture littérale de « extension » ; (b) les **8 agents `upcoming` n'ont aucune autre surface rendue** aujourd'hui — le home rend les 3 panneaux bâtis + 5 `PRODUCTS`, pas ces 8 — et **F-site-6 est en fin de DAG** : les retirer maintenant les orphelinerait toute la campagne ; (c) le lien home « Eight more agents are named on the fleet roadmap » reste vrai ; (d) l'intention de la garde `fleet_register_built_set_is_frozen` (2) (`NEW_SURFACES` inclut `roadmap/page.tsx` — consommation du registre) reste **significative** au lieu de devenir vacante. **Résidu pour l'orchestrateur (non-dette)** : F-site-6 relocalise les listes built/upcoming vers `/fleet` (design Fleet L302/L319) ; retrait de ces deux sections de `/roadmap` alors.

### D-1bis — champ `LAYERS.status` renommé `maturity` (hygiène NEW_SURFACES, réserve advisor)
Le champ de statut des layers est renommé `status`→`maturity` (+ `statusTone`→`maturityTone`) pour que le **seul** `status` de `roadmap/page.tsx` soit désormais le `StatusBadge status={a.status}` **alimenté par le registre** `fleet.ts`. La garde `fleet_register_built_set_is_frozen` (2) (`NEW_SURFACES`) est sensible à la casse (`/status\s*=\s*\{?\s*["'](?:built|upcoming)["']/`) : un futur éditeur qui « simplifierait » une pill de layer en `status="Built"` passerait silencieusement (capitale, colon), tandis qu'un `status="built"` sur le badge du registre rougirait. Le renommage supprime cette ambiguïté (la surface n'a plus de champ `status` non-registre). Type-safe (toutes les réfs migrées), oracle re-vert après renommage.

### D-2 — Phase/L reformulés SANS chiffre (mots), PAS d'exemption
Le design rend `Phase 0/1/2` (L349-351, texte JSX) et `Layer 01..04` (L724-728, ici en JSX). Les chiffres nus rougiraient test 44 (`NUMERIC_TOKEN` = `\d+`, `ALLOWED_ID` ne couvre pas un ordinal nu). **Choisi : reformulation en mots** — `Phase zero/one/two`, `Layer one..four` — (option (α) de l'inventaire a3, recommandée ; le task l'autorise explicitement). **Écarté : l'exemption fermée** `honesty-lint.exempt.json` — l'inventaire interdit d'exempter des chiffres nus `0/1/2/3` (« éventre le détecteur »), et une exemption exigerait la **garde d'inertie C-6** (owner F-site-4) → contention sur `honesty-lint.exempt.json`. La reformulation garde le lot **isolé** (0 delta de gate, 0 exemption).
- **Départ documenté** vs l'exemple de l'inventaire a3 (« Contract freeze — closed »…) : j'utilise le **mot-ordinal** (`Phase zero · closed`) plutôt que le sujet, car **plus fidèle** au « phase card » du design (garde la structure `Phase N · statut`). Digit-free et honnête dans les deux cas.

### D-3 — BLOCKER attrapé (advisor) : `G2`/`G7` dans le corps de Phase one
Corps design de Phase 1 (L350) : « under independent **G2** review and a **G7** verdict ». `NUMERIC_TOKEN` matche le `2` et le `7` ; `ALLOWED_ID` n'a **pas** de `G\d`. L'inventaire a3 n'avait signalé que les eyebrows, pas ce corps. **Reformulé** (pas d'exemption/extension) : « Hikae and Ukemi engines, **closed under independent review and a closing verdict** » — réemploie la formule déjà présente `roadmap/page.tsx` L48 (« closed under independent review »). Grep `[0-9]` du rendu final : 0 chiffre en position texte JSX (tous les hits sont className `text-ink2`/`grid-cols`, balises `h1/h2`, identifiants `D-4`/`C-4`/`F-2c`, ou commentaires — non scannés par test 44). Confirmé par test 44 (b) vert.

### D-4 — Token : mini-sim B_t monté ; **R4 (`cost={COST}`) satisfait**
`app/token/page.tsx` (server) : lit les enums gelés via `loadGateEnums(join(process.cwd(),"..",".."))` (calque `load-contract`/`page.tsx`), importe `COST`/`AMBIENT` de `@/lib/sim`, et monte `<GateSim mode="token" actions={actions} reasons={reasons} cost={COST} ambient={AMBIENT} />`. **R4 (owner F-site-7, contrat D-4 de F-site-3)** : la page passe `cost={COST}` — **la MÊME constante** que `decide()` dépense → l'affichage « Each commit spends {cost.toFixed(2)} of B_t » et la déplétion simulée ne divergent pas (une seule source de vérité). **Premier montage effectif du sim de toute la campagne** (aucune route ne le montait avant — vérifié : 0 hit `GateSim`/`loadGateEnums` dans `app/**` à la base). Le mode `token` est **manuel** (bouton « Push a reading », auto-récupération d'epoch) : pas d'auto-cycle qui écraserait l'action manuelle.

### D-5 — `abstain`/champs gelés jamais quotés (§4d)
- Le mot `abstain` apparaît **en prose** (token hero « defer and abstain do not… the gate abstains ») = texte JSX nu, **jamais** `"abstain"`/`'abstain'`/`` `abstain` `` → non capté par `frozen_contract_fields_stay_dynamic` (qui fait `includes(quote+field+quote)` ; prose = non-cible déclarée). Dans le mini-sim, le mot d'action de chaque ligne de log vient de l'enum chargé **par index** (`actions[row.actionIndex]`, composant F-site-3).
- `remaining_budget` (champ **GateDecision seulement**, hors des 3 contrats gérés par le gate) et `budget_exhausted` (code-raison, pas un champ) rendus en **texte nu** `<span>` — sûrs aujourd'hui, et **survivent** à l'extension planifiée F-site-8 R1 (gate étendu aux champs GateDecision). **Vérif** : script `includes(quote+field+quote)` sur mes 2 fichiers contre les 21 champs des 3 contrats = **0 hit** ; `frozen_contract_fields_stay_dynamic` **vert**.

### D-6 — Mod #2 (page Token) : staking UTILE, sous étude ; PAS de profit-share, 0 promesse de rendement
La section 2 « Tokenomics » du design (bannière « to be announced » L380-384) est transformée : **le mécanisme de staking est révélé « under design / useful »**, `Supply/distribution/replenishing B_t` **restent « to be announced »** (seul le staking sort du TBA — Mod #2). La liste « It is not » est **réconciliée** : « a stake » **retiré** (la flotte stake désormais), remplacé par « **idle staking** » ; « a yield / an oracle / a probability of being right » **conservés**. **0 chiffre rendu, 0 promesse de rendement/yield/profit-share** (plancher securities Howey/MiCA) — le profit-share n'est **pas publié** ; les seules mentions « yield/profit-share » sont des **dénégations** (liste « It is not » + commentaires, non-bannies). « never to the company » rendu verbatim.
- **Meta-copy coupée** (task) : la phrase intro roadmap du design « Dates appear only where a phase has actually closed » est **retirée** — aucune carte ne rend de date, elle sous-livre (défensif superflu). Plancher factuel conservé (« MONARK is not one product and not three sub-agents… »).

## Copy tokenomics/token rendue (verbatim — pour vérification adversariale R-21)
> **MONARK · the token** — **A depletable authorization budget.**
> MONARK carries B_t, the fleet's conformal authorization capacity. Each `commit` spends it; `defer` and `abstain` do not. When it is exhausted, the gate abstains — with reason `budget_exhausted`.
>
> **It is** : a right-to-act, metered · spent only by commit · a field on every GateDecision: `remaining_budget` · one token, one ticker
> **It is not** : a yield · idle staking · an oracle · a probability of being right
>
> **Tokenomics — The token** *(mechanics under design — details to be announced)*
> - **Stakers get discounts** on the products they use.
> - **Skin in the game to act** — an operator posts MONARK as a bond to be authorized; a commit proven faulty is **slashed** (to the party it harmed, a burn, and the watcher who proved it — never to the company).
> - **Watchers earn** for catching a faulty commit; fault is proven by recomputing the frozen decision.
> - A **staker reward mechanism is under design — useful staking, tied to the fleet's work, not a passive payout.**
> - Supply, distribution, and the mechanics of replenishing B_t. → *to be announced*

## C-4 — numeric-hole clos SANS nouveau gate (JSX-fragments)
Les tableaux `LAYERS`/`PHASES` de `roadmap/page.tsx` ont **chaque champ rendu en fragment JSX** (`<>…</>`), pas en chaîne nue : le détecteur test 44 **scanne le fragment là où il est DÉFINI** (le walker atteint la `JsxText`), donc les libellés sont **couverts sur place** — aucun test numeric-hole séparé n'est requis (contraste avec `fleet.ts`/`sim.ts` dont les chaînes vivent hors d'un composant, rendues via accès-propriété, d'où leurs scans frères C-4). Le mini-sim token ne rend **aucun** littéral numérique (état calculé / appels, composant F-site-3 déjà couvert). Le token page n'a **aucun module de données rendu** (prose inline). **Aucune dette** : le trou potentiel est fermé par construction, prouvé par test 44 (b) vert sur l'arbre.

## Frontière client / bundling (premier montage — K-2(i) reste owner F-site-4)
- `next build` **exit 0**, `/roadmap` et `/token` **prérendues statiques** : la page server monte l'îlot client `GateSim` **sous le `ThemeProvider` du layout** (`useTheme` résout — pas de throw SSR), et `loadGateEnums` (`node:fs`) **reste server-side** (sinon le build échouerait).
- **Preuve de non-fuite** : `grep -rl "readFileSync|loadGateEnums|gate-decision.schema" .next/static` = **0** (server-only n'a pas fui dans le bundle client). Preuve suffisante pour ce lot ; **K-2(i) (garde de bundling formelle) reste dû à F-site-4** (premier montage board) — je ne le revendique pas, je le corrobore.

## Critère de fidélité (C-1)
- **Roadmap** (`data-screen-label="Roadmap"`, L335-352) : titre « Four layers, at four maturities. » + intro (moins la phrase dates) + **4 layers** (ordinal mot / nom / what / detail mono / pill de statut coloré `--hikae-t` ou `--line`/`--ink2`) + **3 phase-cards** (eyebrow coloré `--hikae-t`/`--defer` + corps). Sections built/upcoming conservées en dessous (hors design Roadmap, relocalisées en F-site-6). Layout responsive par CSS (grid `sm:grid-cols-[…]`, cartes `auto`), pas d'état de largeur JS.
- **Token** (`data-screen-label="Token"`, L358-384) : grille 2-col (hero + mini-sim) `lg:grid-cols-2` ; cartes « It is »/« It is not » ; section Tokenomics (staking révélé + TBA supply). Couleurs = tokens de marque figés (`text-monark-t`, `text-hikae-t`, `text-abst`, `bg-soft`, `bg-card`). Comparaison au design par le relecteur G2 (instance séparée).

## Oracle (exit codes réels, mesurés 2026-09-10, worktree `F:\Monark-wt-fsite7`)
| Commande | Exit | Note |
|---|---|---|
| `npm ci` | 0 | 276 packages, 0 vuln |
| `npm run ci` (`gate:vocab && typecheck && test`) | 0 | **103/103** pass, 0 fail — test 44 (b), `frozen_contract_fields_stay_dynamic`, `fleet_register_built_set_is_frozen` (NEW_SURFACES roadmap), numeric-hole, `no_coverage_level_alpha`, export test 42, tous verts |
| `npm run lint` (`eslint .`) | 0 | — |
| `npm run lint:ratchet` | 0 | **92/92** (plafond inchangé) |
| `(cd apps/site ; npx next build)` | 0 | « Compiled successfully » ; route table : `/`, `/_not-found`, **`/roadmap`**, **`/token`** (○ Static) |
| `node scripts/lang-gate.mjs --scope site` | 0 | 0 hit français (scope site GATED) |
| `node scripts/grep-forbidden.mjs` | 0 | 78 fichiers, aucun mot proscrit (commentaires compris) |
| `git diff d8b63c4 -- schemas/ packages/` | — | **vide** (0 octet) |
| `.next/static` grep `readFileSync\|loadGateEnums` | — | **0** (pas de fuite server-only) |

## R-25 (chiffre unique final, métrique CI = insertions+deletions, vs lot-fsite3 d8b63c4)
**271 lignes changées** (255 insertions + 16 deletions), `git diff --shortstat d8b63c4` hors `docs/G1-lot-*.md`/`docs/G2-lot-*.md`/`package-lock.json` (pathspecs CI `ci.yml` L53) — **< 1205** (marge **934**). Décomposition : `token/page.tsx` (+118) + `roadmap/page.tsx` (+137/-16). `docs/G1-lot-fsite-7.md` exclu (pathspec CI).

## Choix douteux (pour la vérification adversariale R-21)
1. **Roadmap augmenté vs remplacé** (D-1) : le design Roadmap n'a **pas** de cartes d'agents built/upcoming ; je les **garde** en dessous des layers/phases pour ne pas orpheliner les 8 `upcoming` avant F-site-6. Fidélité = couverture des sections design (layers+phases livrés), pas interdiction de contenu honnête additionnel. **À confirmer G2** : accepte-t-on le contenu additionnel, ou F-site-6 doit-il précéder ? (Recommandation : garder — non-régressif.)
2. **Mot-ordinal `Phase zero` vs sujet `Contract freeze`** (D-2) : départ de l'exemple de l'inventaire a3, choisi pour la fidélité « phase card ». Digit-free et honnête. Reformulable trivialement si G2 préfère le sujet.
3. **`Three built, eight on the roadmap`** (Layer two status) : repris du phrasing home (`app/page.tsx` L25) plutôt que du design « Three built, eight upcoming » — cohérence inter-pages ; mots, 0 chiffre. Non dérivé du registre (le compte est verrouillé ailleurs par `fleet_register_built_set_is_frozen`).
4. **Grille arbitraire Tailwind** `sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]` (fidélité layout design L341) : chiffres en **className** (hors scan test 44) ; build vert. Simplifiable en `sm:grid-cols-3` si jugé fragile.
5. **`app/page.tsx` LAYERS non touché** : duplication transitoire des 4 layers (home + roadmap) jusqu'à la refonte home de F-site-4. Isolation C-3 respectée (je ne touche pas le fichier d'un autre lot). Noté pour F-site-4.

## error_origin
n/a au niveau lot (implémentation conforme au contrat ; aucun défaut résiduel). Le BLOCKER `G2`/`G7` (D-3) a été **attrapé (consultation advisor) et corrigé dans la passe** — origine = spec design non honnête sur ce corps, résolue avant clôture (pas une dette). Verdict G7 + `error_origin` définitif à l'orchestrateur.
