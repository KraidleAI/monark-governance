# Checkpoint-2 SITE-RELEASE-1 A+B (validateur-humain Fable 5.1) — ACCEPTE-AVEC-CORRECTIONS

Modèle résolu : claude-fable-5-1

# CHECKPOINT-2 — lot SITE-RELEASE-1 (sous-lots A `/narabi` + B `/ukemi`), arbre fusionné `60ecf64`

## 1. Checkpoint et artefacts lus (contexte frais : artefacts seuls ; le G2 parallèle n'a PAS été lu, ses chiffres non plus)

- Mission `F:\tmp\site-merge\MISSION-G2-CP2-site-release-1.md`.
- Plan et rulings : `F:\tmp\cp2-site\docs\G0-lot-site-release-1.md` (§1-§19), `docs\CHECKPOINT1-lot-site-release-1.md`, `docs\CHANTIERS.md` l.680-725 (Q-1..Q-8, C-3/C-4, D-1/D-2), `docs\G1-lot-site-release-1-B.md` (persisté), `docs\adr\ADR-U4b-calibration-episode-frais.md` §3 (table des sha gelés).
- Rendus G1 : `F:\tmp\siteA\G1-lot-site-release-1-A.md`, `RENDU-PLI.md`, `DELIVERED.sha256`, `mutants.mjs` ; `F:\tmp\siteB\G1-lot-site-release-1-B.md`, `DELIVERED.sha256`, `mutants.mjs`.
- Maquettes : `F:\PRODUITS\etude-2026-09-21\maquettes-release\NOTE-maquettes-v4.md`, `v4\ukemi.html`, `v4\assets\favicon-{narabi,ukemi}.svg`.
- Code livré (13 fichiers du diff `de9ac07..60ecf64`) lu intégralement.

**Rejeu (AM-2 ter)** : clone `git clone --no-hardlinks` → `F:\tmp\cp2-site` @ `60ecf64` ; `node_modules` par `mk-nm.ps1` (jonctions en lecture vers `F:\Monark\node_modules`, aucun `.cache` présent) ; copies de harnais sous `F:\tmp\cp2-site-work\` (B `ROOT` re-pointé sur le clone — l'original vise `F:\Monark-wt-siteB`, non exécuté) ; logs `F:\tmp\cp2-site-logs\`. `TEMP/TMP/TMPDIR=F:/tmp`. Tout oracle sous `env -u` des 8 clés payantes ; aucune variable affichée.
**Preuve d'innocuité** : sha256 des 13 fichiers du lot dans `F:\tmp\site-merge\tree` AVANT == APRÈS (`tree-sha-before/after.txt`, diff vide) ; `git status --short` = 0 ligne dans `F:\tmp\site-merge\tree` (HEAD `60ecf64`), `F:\Monark`, `F:\Monark-wt-siteA`, `F:\Monark-wt-siteB`, et dans le clone après tous les rejeux ; clone 13 sha == tree. (Fait consigné : `F:\Monark` HEAD est passé de `9cf1487` à `8085cb2` pendant ma session — commits de l'orchestrateur, pas les miens.)

## 2. Vérifications refaites (mission 1-8), chiffres mesurés par moi

| # | Vérification | Mesuré sur `F:\tmp\cp2-site` |
|---|---|---|
| 1 | `npm run ci` | exit 0 — **830 tests, 829 pass, 0 fail, 1 skip** (`ci.log`) ; les 5 tests `site_ukemi_*` et 5 `narabi_*` nouveaux verts |
| 1 | lint / lint:ratchet / lang:gate / export:check | exit 0 / **69/69** / 0 hit / 0 forbidden path |
| 1 | `npm run build -w @monark/site -- --webpack` (D-1) | exit 0, **sans `.next` préalable** (build frais) ; 14 routes dont `/narabi`, `/ukemi` (○ Static) ; TypeScript site vérifié par le build |
| 1 | `node scripts/assert-fleet-html.mjs` sur l'artefact frais | exit 0 — `/fleet` 4 notes ; `/ukemi` `<main>` **0 token numérique**, état + clause présents, 0 interval/cascade/Bell/Aave (4433 chars) |
| 1 | Sha gelés | `git diff --stat de9ac07 60ecf64 -- apps/harness apps/sentinel packages scripts/census .github apps/site/lib/fleet.ts apps/site/lib/narabi-snapshot.ts apps/site/test test/site-build-fleet.test.ts` = **vide** ; les 10 blobs (8 gelés ADR-U4b §3 + labeler `755b3a38…` + `gate.ts`) OID-identiques `de9ac07` vs `60ecf64` ; sha256 worktree : `u4b-scores 2f9a31f6…`, `u4b-reduce a5e66cd3…`, `record-u4b-calib 5733daeb…`, `wadray 7bee76fc…`, `abi 3376eb08…`, `l1-split 9206df91…`, `rpc.ts 0e232519…`, `calib-digest 3603265d…` |
| 1 | `git diff --name-status de9ac07 60ecf64` | exactement 13 fichiers : `apps/site/**` (9), `scripts/assert-fleet-html.{mjs,d.mts}`, `test/site-ukemi.test.ts`, **`test/narabi-live.test.ts`** (M) — ce dernier hors de la liste de la mission mais dans le G0 §17/§19 : conforme au plan, écart de rédaction de la mission |
| 2 | Registre | `fleet.ts` byte-identique (Narabi/Ukemi `built` gelés) ; corpus `<main>` bâti de `/ukemi` commence par « Ukemi built » — pilule = `{status}` du registre ; 0 token numérique ; `gate:vocab` sur les 4 HTML bâtis (ukemi, narabi, fleet, index) = **0 claim** ; greps corpus `/ukemi` : interval 0, cascade 0, Bell 0, Aave 0, `\bverified\b` 0, shipped 0, upcoming 0 ; « probability » ×4, toutes en négation (« Never a probability… », « Not a probability… ») — seule forme bannie = `true with probability` (`vocab-banned.json`) ; les patrons de scope sentinel (`reference price`, `would have`, `Λ=0`, `adaptive…`) = 0. `/narabi` bâti = coquille « reading the published files… » (28 chars, client component, résiduel C-7 nommé). Les 4 `LIQ_*` de `ukemi-copy.ts` byte-identiques à `gate.ts` (test d'égalité vert + X7 ci-dessous). C-6 : `ukemi-page.tsx` lit `.status` seul et `throw` si Ukemi absent (lu ; mutant M5 rouge). **Note** : la ligne de mission « Ukemi affiché "built · step N of 7" (Q-3) » est un lapsus (step N of 7 = pilule Narabi, C-3 ; Q-3 = favicons) — l'Ukemi affiche `built` seul, conforme G0 §5 |
| 3 | Icônes (D-2) | `public/icons/narabi.svg` = `aa2f3006…` = `v4\assets\favicon-narabi.svg` ; `public/icons/ukemi.svg` = `90eea553…` = `v4\assets\favicon-ukemi.svg` (byte-identiques) ; head bâti `narabi.html` et `ukemi.html` : `<link rel="icon" href="/icons/<x>.svg" type="image/svg+xml"/>` ×1 chacun, `href="/<x>/icon…"` ×0 ; `app/narabi/icon.svg` et `app/ukemi/icon.svg` absents ; `/fleet` et `/` gardent `/icon.svg?…` racine ; seule URI dans les SVG = xmlns |
| 4 | Harnais A (7 mutants) | **7/7 ROUGES**, sweep sha == baseline (`mutants-A.log`) |
| 4 | Harnais B (14 mutants) | baseline 5/5 verts ; **14/14 ROUGES**, restauration byte-exacte (`mutants-B.log`) |
| 4 | Mes mutants cross-sous-lot (chemin RÉEL : test racine → `next build --webpack` → `assert-fleet-html`) | voir §3 |
| 5 | A-8 registre réel | le composant est exécuté par `next build` sur `FLEET_AGENTS` réel ; les tests racine importent `fleet.ts` réel (test Narabi lie le préfixe de pilule à `FLEET_AGENTS`). Réserve : la fixture `greenMain()` code `<span>built</span>` en dur (stub) — traitée en C-1 |
| 6 | R-25 (pathspec verbatim `ci.yml:65`) | **A = 171** net (`7c34bef..b5f665a` : 6 files, 170+/1−) = 135 (`89c90b3`) + 42 (pli) ; **B = 823** (`7c34bef..2de11fb` : 820+/3−) ; fusionné vs `de9ac07` = **994** (13 files) ; vs `7c34bef` (incluant les lots intermédiaires) = 1 718. Chaque sous-lot < 1 150. Le « A ≈ 6xx+42 » de la mission est un lapsus |
| 7 | Maquette v4 ↔ rendu | voir §4 |
| 8 | Items formés | lien nav → `/ukemi` : **confirmé absent** (`href="/ukemi"` = 0 dans les 13 HTML bâtis ; l'en-tête de `/ukemi` porte `/narabi` mais pas `/ukemi`) ; design-set → U-4b-2b (G0 §10.B, B §8) ; Caddy → release |

## 3. Mutants cross-sous-lot (`F:\tmp\cp2-site-work\mutants-X.mjs`, `mutant-X6b.mjs` ; `mutants-X.log`)

| Mutant | Test racine | Build | Assertion artefact | Lecture |
|---|---|---|---|---|
| X1 `<p>185 of 189</p>` littéral JSX dans `/ukemi` | ROUGE | 0 | **ROUGE** (`["185","189"]`) | composition exécutée depuis l'artefact réel |
| X2 « interval » dans `LIQ_CONDITIONAL_SENTENCE` (servie, rendue) | ROUGE ×2 (égalité + A-9) | 0 | **ROUGE** (« interval ») | idem |
| X3 `scanNumericTokens` neutralisé + chiffre dans la page | ROUGE (parité) | 0 | VERT | information : `g3-site` seul ne garde pas le scanner, c'est le test de parité du job `ci` — conforme au plan (§3.3 parité), à consigner |
| X4 icône déclarée sous `/ukemi/` | ROUGE | 0 | VERT ; head bâti `href="/ukemi/icon.svg"` ×1 | aucun oracle artefact pour l'icône (C-9 = oracle local) ; le test racine la tue — information |
| **X5 pilule `built` → `upcoming` en lisant toujours `.status`** | **VERT (survit)** ×2 | 0 | **VERT** ; `<main>` bâti dit « upcoming », plus « built » | **SURVIVANT** → C-1 |
| X6 `{ukemiAgent.wiring.note}` | ROUGE | **1** (tsc : `wiring?: never` sur l'union) | — | fail-closed au build |
| X6b `{ukemiAgent.line}` (« Liquidation-cascade survival. ») | ROUGE | 0 | **ROUGE** (« cascade ») | le chemin artefact tue le rendu d'un champ non-`status` |
| X7 dérive de `gate.ts` (amont), copie site inchangée | ROUGE (égalité) | (non bâti) | resterait VERT (importe `ukemi-copy.ts`) | le tuyau `gate.ts → ukemi-copy` est gardé par le seul test racine — conforme §10.B, information |

Tous restaurés byte-exact ; rebuild propre final + assertion verte ; `git status` clone = 0.

## 4. Maquette v4 ↔ rendu (mission 7)

Conforme aux corrections 1-3 de `NOTE-maquettes-v4.md` : pilule `built` (registre) ; hero/dek ; is/is-not ; barre de 0 à la borne avec ŷ marqué (`aria-hidden`, sans graduation) ; libellé « upper bound » ; clause conditionnelle (point ouvert §3 de la note) rendue byte-identique ; méthode 4 pas ; limites 3 cartes. Écarts **déclarés** (G0 §16.1, Q-5a) : shipped→built, day→step, ordinaux 01-04/S1-S4 digit-free, régions SAMPLE et figures design-set non rendues. Écarts **non déclarés** (mesurés sur `v4\ukemi.html`) : (i) section « design episode » entière absente (prose et énoncés des hypothèses, pas seulement les figures) ; (ii) bloc « Provenance » (reads, prereg_sha, « signature attests origin, not truth ») absent ; (iii) section « replay it » absente ; (iv) dérives de texte is/is-not : « no loan-to-value » retiré, « separate from the design episode, which is never served » retiré, « in the stratum » → « for a population » ; (v) lignes `class` / `price path` / `unit` / `nominal coverage` du bloc servi non portées. Le G0 §18 cadrait la page sans ces sections (approuvé au checkpoint-1) ; ils restent à **déclarer** dans le registre du lot avec déclencheur (correction C-3), pas un changement de code.

## 5. Checklist CA-1..CA-11

| Règle | État | Preuve |
|---|---|---|
| CA-1 falsifiable | **conforme** | chaque critère du G0 a son test nommé et son mutant rejoué par moi (7 + 14 rouges) ; reformulation : A = « pilule pure lue du snapshot + glossaire + icône statique hors `/narabi/*` » ; B = « route statique `/ukemi`, copie byte-identique, `<main>` digit-free asserté sur l'artefact » |
| CA-2 valeur | **conforme** | aucune décision de valeur nouvelle ; D-1/D-2 tranchés par rulings datés (CHANTIERS 06:0x) ; écarts maquette = information investisseur |
| CA-3 ADR / gates | **correction** | `docs/` diff `de9ac07..60ecf64` = vide : le G1 A et le RENDU-PLI (tuyaux A, D-2, sémantique de N, résiduel C-7) n'existent que sous `F:\tmp\siteA\` ; le `docs/G1-lot-site-release-1-B.md` persisté renvoie à `F:\tmp\siteB\` pour la ligne Tuyaux (F-1 interdit `F:\tmp` comme source) → C-2. Aucun gate suspendu ; D-1 n'altère ni `next.config.mjs` ni la ligne `run:` CI |
| CA-4 fan-out | **conforme** | mono-worker par sous-lot + oracle non-LLM ; G2/cp-2 = indépendance de vérification |
| CA-5 MAST | **conforme** | G0 §14 ; occurrence FM-3.2 mesurée par X5 (vérification incomplète : composition exécutée, sortie non assertée) |
| CA-6 oracle + G2 | **conforme sous jonction** | trace d'oracle re-exécutée par moi (§2) ; la revue G2 est parallèle et non lue — l'orchestrateur joint les deux au G7 |
| CA-7 zéro dette | **conforme** | items formés avec déclencheur (nav `/ukemi`, design-set U-4b-2b, Caddy à la release, `/icons/*.svg` à vérifier par curl orchestrateur avant mise en ligne) ; fait daté Blast/Llama ; D-PLI-1 corrigée dans l'arbre |
| CA-8 provenance | **correction** | modèles résolus `claude-opus-4-8[1m]` en 1ʳᵉ ligne (A, pli, B) ; générateur ≠ relecteur ; `DELIVERED.sha256` A (3) + B (7) == sha du tree (13/13 avec les 3 fichiers cœur de A `8e12619…`/`eadd808…`/`8effd627…`) ; `error_origin` à assigner au G7 (liste §7) ; passation A non persistée → C-2 |
| CA-9 imposée par le système | **conforme** | `g3-site` = build + assertion sur l'artefact réel ; rejoué en instance/clone séparés ; X1/X2/X6b prouvent que l'artefact tue |
| CA-10 anti-vitesse | **conforme** | R-25 171 / 823 par sous-lot ; aucun argument de vitesse |
| CA-11 branchement (+ durci) | **correction bloquante** | `/ukemi` : tuyau `gate.ts → ukemi-copy → <main> bâti` **exécuté** par `next build` et asserté sur l'artefact (X1/X2/X6b) ; icône : head bâti mesuré. **Mais** le tuyau `fleet.ts status → pilule` est exécuté sans qu'aucun test non-LLM n'asserte sa sortie : X5 survit (regex `.status` sur le source = « test sur le source », même forme que le précédent Bell -b3a) → C-1. Narabi : résiduel C-7 nommé (client component), plancher = fonction pure sur octets réels + porteur ; accepté au cp-1, inchangé. Registre : aucun statut ne bascule |

## 6. Décision : **ACCEPTE-AVEC-CORRECTIONS** — A : ACCEPTE-AVEC-CORRECTIONS (C-2, C-3) ; B : ACCEPTE-AVEC-CORRECTIONS (C-1, C-2, C-3) ; global : ACCEPTE-AVEC-CORRECTIONS. Pas d'ESCALADE (rulings, G0 et checklist convergent ; aucune valeur nouvelle).

Liste fermée, à plier AVANT G7 :
- **C-1 (B, bloquante, CA-11 durci)** — `assertUkemiBody({ html, expected })` reçoit aussi `expected.status` ; `main()` le dérive de `FLEET_AGENTS` (déjà importé) : `FLEET_AGENTS.find(a => a.name === "Ukemi").status` ; l'assertion exige la pilule dans le `<main>` bâti (texte « Ukemi <status> » ou porteur dédié) ; `.d.mts` mis à jour ; test racine : fixture `greenMain()` lit le registre réel au lieu de `<span>built</span>` codé en dur (A-8) + cas rouge « statut absent/altéré » ; **mutant nommé = X5** (`status === "built" ? "upcoming" : …`) rouge sur le chemin artefact. Trois fichiers du lot, code d'`fleet.ts` intact.
- **C-2 (A+B, CA-3/CA-8)** — persister `F:\tmp\siteA\G1-lot-site-release-1-A.md` + `RENDU-PLI.md` dans `docs/` ; réécrire `docs/G1-lot-site-release-1-B.md` avec la ligne Tuyaux B verbatim (pas de renvoi `F:\tmp`) ; propriétaire orchestrateur au pli.
- **C-3 (B, mission 7)** — étendre §16.1 du registre du lot avec les écarts maquette non déclarés (§4 i-v), chacun avec déclencheur (U-4b-2b pour design-episode/provenance/replay ; lot de suivi pour les dérives de texte is/is-not, ou justification).

Informations (sans correction) : X3/X4/X7 = coutures gardées par le job `ci` et non par `g3-site` seul (conforme au plan) ; `next/font/google` dans un clone sans `.next` = réserve déclarée du layout (`layout.tsx:12`), hors lot ; lapsus de la mission (item 2 « step N of 7 »/Q-3 ; item 1 liste sans `test/narabi-live.test.ts` ; « A ≈ 6xx+42 »).

## 7. `error_origin` proposés pour le G7
D-2 = **plan** (angle mort G0 §6.5, attrapé par le worker A) ; D-1 = **environnement** (jonction/Turbopack, ruling `--webpack`) ; D-PLI-1 = **worker** (commentaire français, attrapé par `lang:gate`) ; X5 = **plan + conception de test** (composition exécutée, sortie non assertée ; ni le G0 §3.3 ni le cp-1 ne l'ont exigé — manqué par moi au checkpoint-1).

AM-1 : la checklist a attrapé (i) la pilule Ukemi exécutée mais non assertée sur l'artefact (survivant X5), (ii) le registre ADR de A absent du dépôt / B renvoyant à `F:\tmp`, (iii) trois sections de maquette omises sans déclaration. Manqué au cp-1 par moi : l'exigence d'asserter le statut sur l'artefact (X5). Rien à réconcilier avec le G2 (non lu, par construction).

Modèle résolu : claude-fable-5-1
