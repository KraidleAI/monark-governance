# G7 — SITE-RELEASE-1 (index + /narabi + /ukemi, maquettes v4 validées par l'investisseur) — ACCEPTED, fusions `eb2e716` (A) + `db14e8a` (B)

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-22 07:51 UTC (`date -u`). Sous-lots disjoints `lot/site-release-1-A` @ `b5f665a` et `lot/site-release-1-B` @ `2d1db11`, fourche `7c34bef`, relus ensemble sur l'arbre fusionné `F:/tmp/site-merge/tree` (`60ecf64` puis `3759016`), fusionnés `--no-ff` dans `lot/etude-suite` (seul conflit : le registre G1-B persisté deux fois — version du pli retenue).

## 1. Oracle complet sur l'arbre FUSIONNÉ `db14e8a` (clés payantes retirées du process)
`npm run ci` → 0 : tests **867 / 867 pass / 0 fail / 0 skip** ; `lint` 0 ; `lint:ratchet` 0 (69/69) ; `lang:gate` 0 ; `export:check` 0 ; `npm run build -w @monark/site` (ligne CI, Turbopack, dépôt principal) → 0 ; `node scripts/assert-fleet-html.mjs` → 0 sur l'artefact frais (/fleet 4 notes ; /ukemi `<main>` 0 token numérique, état + clause, pilule = statut du registre « built », 0 interval/cascade/Bell/Aave). Logs `F:\tmp\g7-site\*.log`. R-25 : A 171, B 858 (borne 1 150). Zones gelées (`apps/sentinel`, `packages`, `gate.ts`, `scripts/census`, 9 sha U-4b) byte-identiques.

## 2. Lignée
| Étape | Référence | Résultat |
|---|---|---|
| Plan | `docs/G0-lot-site-release-1.md` (§18 B, §19 disjonction), `docs/CHECKPOINT1-lot-site-release-1.md`, rulings SITE Q-1..Q-8, D-1 (`--webpack` en worktree jonctionné), D-2 (icône statique `public/icons/*.svg`, shadow Caddy) | approuvé |
| G1 A + pli | `docs/G1-lot-site-release-1-A.md`, `docs/G1-PLI-lot-site-release-1-A.md` (7 mutants) | — |
| G1 B | `docs/G1-lot-site-release-1-B.md` (14 mutants) | — |
| G2 (arbre fusionné) | `docs/G2-lot-site-release-1.md` : 7+14 rejoués + 5 cross-sous-lot dont oracle g3-site rougi sur l'artefact réel (CM5) | PASS |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-site-release-1.md` : X5 survivant (pilule Ukemi exécutée, sortie non assertée), registres A non persistés, 3 sections de maquette omises non déclarées | ACCEPTE-AVEC-CORRECTIONS |
| Pli | C-2 orchestrateur (`0004400`) ; B `6aed9c3` + `2d1db11` (assertion de la pilule sur l'artefact depuis le registre réel, M12, C-3) | — |
| G2-delta | `docs/G2-DELTA-lot-site-release-1.md` : X5 rejoué indépendamment, AM-1 du relecteur → consigne **A-10** | PASS |
| Re-checkpoint-2 | `docs/CHECKPOINT2-DELTA-lot-site-release-1.md` : X5/X8 rouges, X10 fail-closed | ACCEPTE |

## 3. Livré
`/narabi` : pilule « built · step N of 7 before first reading » (N = `tracker.t` du snapshot committé, 7 = `SERIES_MIN_STEPS`) → « built · N windows published » à T ≥ 7 ; glossaire `under_calib` ; icône statique. `/ukemi` : page statique digit-free, copie byte-identique aux 4 constantes `LIQ_*` servies par `gate.ts`, pilule = `status` du registre gelé (throw si absent), barre borne-haute schématique sans chiffres, icône statique. Oracle `assert-fleet-html` étendu (voie /ukemi + liage de la pilule) exécuté par le job `g3-site` sur l'artefact réel.

## 4. Branchement
Surfaces servies = les pages bâties (`.next/server/app/{narabi,ukemi}.html`) ; tuyaux `fleet.ts status → pilules`, `gate.ts → ukemi-copy → <main>`, `narabi-snapshot → pilule` — chacun asserté sur l'artefact ou sur les octets réels (résiduel C-7 : pilule Narabi client-rendue, plancher fonction pure + porteur). Registre public inchangé (aucun statut ne bascule).

## 5. Items formés
Lien de navigation vers `/ukemi` (lot nav / U-4b-2b) ; figures design-set, borne haute chiffrée, sections design-episode/Provenance/replay, bloc servi class/price path/unit/nominal coverage (U-4b-2b) ; dérives is/is-not (lot de suivi) ; porteur dédié de la pilule Ukemi (X9, optionnel) ; `next/font/google` réserve du layout hors lot ; **déploiement g3-site + vérification curl de `/icons/*.svg` = étape de release, sur go explicite de l'investisseur (décision 127)**.

## 6. `error_origin`
D-2 icône : plan (angle mort G0 §6.5, attrapé par le worker A) ; D-1 : environnement ; X5 : plan + conception de test (G0 §3.3, checkpoint-1, G2 — lentille de liage de sortie absente ; désormais A-10) ; R-25 853→858 : worker (mesure intermédiaire).

## 7. MAST résiduel
FM-3.2 « composition exécutée, sortie non assertée » — occurrence fondatrice de A-10 ; résiduel nommé : C-7 (client component) jusqu'au parcours visuel de l'investisseur à la mise en ligne.
