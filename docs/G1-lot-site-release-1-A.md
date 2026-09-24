Modèle résolu : claude-opus-4-8[1m]

# G1 — lot SITE-RELEASE-1, SOUS-LOT A (Narabi : pilule + glossaire under_calib + favicon narabi)

> Rendu worker (Opus 4.8, effort max). Données brutes pour l'orchestrateur (R-21) : chaque
> affirmation porte sa preuve rejouable. Aucun commit (R-20). Aucun réseau. Écriture hors worktree
> uniquement sous `F:\tmp\siteA\`. Aucune variable d'environnement affichée (A-7).

## 0. Provenance (doc 02)
- **Modèle** : `claude-opus-4-8` (effort max), worker AgileGates. Résolu tel quel : `claude-opus-4-8[1m]` (R-1, préfixe conforme).
- **Date** : 2026-09-22 (~06:01 UTC, `date -u`).
- **Worktree** : `F:\Monark-wt-siteA`, branche `lot/site-release-1-A`, base `HEAD = 7c34bef42a4f2c91b80fccc243c56d698db59785` (arbre final = 4 fichiers modifiés + 1 nouveau, cf. §3).
- **node_modules** : construits (mk-nm.ps1, A-2). `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-siteA\packages\rpc-guard\src\index.ts` (worktree, pas `F:\Monark`).
- **Mission** : G0 `docs/G0-lot-site-release-1.md` §17 (sous-lot A) ; disjointness §19 ; consigne `docs/CONSIGNE-STANDARD-G1.md`.
- **Écriture** : `F:\tmp\siteA\{G1-lot-site-release-1-A.md, DELIVERED.sha256, mutants.mjs, oracle-*.log, narabi.built.html, narabi.built.head.html}` + scratchpad. Aucune écriture sur `C:`. Worktree : seulement les 5 fichiers du lot.

## 1. Périmètre livré (5 fichiers, disjoints de B — §19 vérifié)
| Fichier | Δ | Rôle |
|---|---|---|
| `apps/site/lib/narabi-live.ts` | +18 l | `firstReadingLabel(state, lines)` PURE (C-3/C-5/C-7) |
| `apps/site/components/narabi/narabi-live.tsx` | +8 l | rendu pilule `{firstReadingLabel(state, lines)}` dans le héros (tokens storefront, repli `min-w-0`/`truncate`) |
| `apps/site/lib/narabi-copy.ts` | +1 l | entrée glossaire `under_calib` (générique, digit-free, C-11) |
| `apps/site/app/narabi/icon.svg` | +14 l (nouveau) | favicon adaptatif par route, repris byte-identique de l'asset v4 (Q-3b, C-9) |
| `test/narabi-live.test.ts` | +94 l | 4 tests nommés + carriers (D-1) |

`git status --porcelain` final = exactement ces 5 (4 ` M` + 1 `??`). **Aucun fichier de B touché** ; **aucun** de `ci.yml`, `test/site-build-fleet.test.ts`, `fleet.ts` (lu seulement), `honesty-lint.exempt.json`, `narabi-snapshot.ts`, `gate.ts`, `next.config.mjs`, Caddyfile.

## 2. Implémentation (pièces)
- **Pilule (C-3, Q-8b)** : `t < SERIES_MIN_STEPS` ⇒ « built · step ${t} of ${SERIES_MIN_STEPS} before first reading » ; sinon « built · ${lines.length} windows published ». `t` = `state.tracker.t` (LU), « 7 » = `SERIES_MIN_STEPS` (l.36, source UNIQUE — pas de `WINDOW_BEFORE_FIRST_READING`, C-5). Mot de statut « built » (jamais « shipped »).
- **Rendu** : pilule `self-start` dans l'en-tête héros, `bg-soft`/`border-border`/`text-foreground`/`text-muted-foreground`/`bg-monark-t` (tokens `globals.css`), repli débordement `min-w-0` + `truncate`.
- **Glossaire (C-11)** : `{ term: "under_calib", def: "Too few calibration points for a population: the gate abstains for it, serving no region while its state is published. A named state, never a number." }` — anglais GÉNÉRIQUE (jamais « in the stratum », vocabulaire Ukemi), digit-free.
- **Favicon (Q-3b, C-9)** : `app/narabi/icon.svg` copié byte-identique de `F:\PRODUITS\etude-2026-09-21\maquettes-release\v4\assets\favicon-narabi.svg` (sha `aa2f3006…daff867`, 14 l.), adaptatif `@media (prefers-color-scheme:dark)`, 0 URL chargée.

## 3. ADR — lignes exigées par §17
### (a) Tuyaux du sous-lot A (F-1, C-8 ; §10.A)
- **Entrée** : `narabi-snapshot.ts` (octets committés, sha re-hashé par le test) → `state.tracker.t` (= N, T<7) + `parseTimeline(...).length` (= N, T≥7) ; `SERIES_MIN_STEPS` (`narabi-live.ts:36`) → « 7 » ; `FLEET_AGENTS` (`fleet.ts`, lu) → mot de statut « built ».
- **Sortie** : `/narabi` bâti par `next build` et servi (Caddy `reverse_proxy` pour la route nue `/narabi`) → visiteur = chemin servi. La pilule rend `{firstReadingLabel(state, lines)}` dans le héros ; l'entrée `under_calib` rend dans le glossaire (`{g.def}`) ; `app/narabi/icon.svg` produit `<link rel="icon">` dans le `<head>` bâti.
- **État** : `state.json`/`timeline.jsonl` publiés (repli snapshot committé, badge « snapshot » déclaré).
- **Test non-LLM (autorise « branché », D-3)** : `narabi_first_reading_label_reads_committed_t` (fonction pure sur octets RÉELS t=1 + états synthétiques t=6/t=7, N à deux longueurs de timeline) + porteur `comp.includes("{firstReadingLabel(")` + `scanText` digit-free du glossaire + oracle LOCAL `<link rel="icon">` du `<head>` bâti de `/narabi` (vert, §5). **Chaîne servie mesurée** : `next build` → `narabi.html` bâti → `<link rel="icon" href="/narabi/icon.svg?fd049e52b123b9e5" type="image/svg+xml">` présent.
- **Branchement** : A ne flippe aucun statut (Narabi déjà `built`, gelé).

### (b) Sémantique de N (C-3/C-5)
« step » = pas ÉVALUABLE, pas « day » : le snapshot committé a `tracker.t = 1` mais **2** fenêtres publiées (2026-09-17 `non_evaluable` T=0 ; 2026-09-18 `evaluable` T=1) — « day 1 » serait faux (2ᵉ jour de publication), « step 1 of 7 » est honnête (1 pas évaluable sur 7). N = `state.tracker.t` (T<7) puis `lines.length` (T≥7). « 7 » = `SERIES_MIN_STEPS`, source unique (aucune constante doublon). Prouvé par le test `narabi_first_reading_label_single_source_of_seven` (le corps de la fonction contient `SERIES_MIN_STEPS`, aucun `\b7\b` nu ; exactement un `const … = 7` dans le fichier ; aucun `const WINDOW_BEFORE_FIRST_READING`).

### (c) Résiduel client-component NOMMÉ (C-7) — plancher + déclencheur
`/narabi` est un client component (`narabi-live.tsx:1` « use client »). Le HTML de `next build` pour `/narabi` = coquille « reading the published files… » ⇒ **le N de la pilule est ABSENT du HTML bâti** (mesuré : `grep -c "before first reading" narabi.html` = **0**). **Plancher accepté (non-LLM)** : (i) fonction pure testée sur les octets RÉELS du snapshot (t=1) + états synthétiques (t=6/t=7) ; (ii) porteur asserté `{firstReadingLabel(` ; (iii) oracle local `<link rel="icon">`. **Déclencheur du résidu** : parcours visuel investisseur (décision 101). Ce n'est pas une dette nue : nommé, plancher = test non-LLM, aligné §4/§10.A/§15 du G0.

## 4. Oracle (A-3 ; codes de retour capturés DIRECTEMENT ; toutes commandes sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`)
| Étape | Commande | Exit | Résultat | Log |
|---|---|---:|---|---|
| CI (gate:vocab+typecheck+test) | `npm run ci` | 0 | 814 tests, **813 pass, 1 skip, 0 fail** | `oracle-ci.log` |
| lint | `npm run lint` | 0 | 0 | `oracle-lint.log` |
| lint:ratchet | `npm run lint:ratchet` | 0 | **69/69** (plafond inchangé — aucun `any`/unsafe ajouté) | `oracle-ratchet.log` |
| lang:gate | `npm run lang:gate` | 0 | 0 hit non-exempt (site inclus, GATED) | `oracle-lang.log` |
| export:check | `npm run export:check` | 0 | 0 forbidden path, 0 French hit (icon.svg passe) | `oracle-export.log` |
| build site | `npm run build -w @monark/site` | **1** | **Turbopack échoue** (jonction node_modules hors racine, cf. D-1) | `oracle-build.log` |
| build site (webpack) | `npm run build -w @monark/site -- --webpack` | 0 | 14 routes prérendues, dont `/narabi` et **`/narabi/icon.svg`** | `oracle-build-webpack.log` |
| assert-fleet-html | `node scripts/assert-fleet-html.mjs` | 0 | /fleet toujours vert (header + 4 notes servies, 33324 chars) | `oracle-assert-fleet.log` |
| oracle LOCAL favicon | grep `<link rel="icon">` du `<head>` bâti `/narabi` | 0 | `href="/narabi/icon.svg?fd049e52b123b9e5" type="image/svg+xml"` | (ci-dessous) |
| forbidden-vocab (walk complet, 4 surfaces incluses) | `node scripts/grep-forbidden.mjs <4 surfaces>` | 0 | 0 forbidden claim — « scanned 213 file(s) » (le CLI ajoute les cibles AU walk par défaut, en-tête l.18) | `oracle-vocab-surfaces.log` |

- **Test étendu narabi** (extrait de `npm run ci`) : 10/10 vert (6 existants + 4 nouveaux : `narabi_first_reading_label_reads_committed_t`, `narabi_first_reading_label_single_source_of_seven`, `narabi_glossary_under_calib_generic_digit_free`, `narabi_icon_svg_local_no_remote_url`).
- **passes GLOBAL/site/sentinel = 0** : gate:vocab full (dans ci) = 0 ; lang:gate site+sentinel GATED = 0 ; grep-forbidden (walk complet 213 fichiers, 4 surfaces incluses) = 0.
- **Note artefact** : `apps/site/.next` laissé en place est l'artefact **webpack** (gitignoré, non versionné). Un rejeu `next build` (Turbopack) par l'orchestrateur échouera pour la raison D-1 (jonction), PAS à cause de ce cache.

## 5. Mutants (D-1) — harnais `F:\tmp\siteA\mutants.mjs`, 6 nommés, tous ROUGES, restauration byte-exacte
`node F:/tmp/siteA/mutants.mjs` → exit 0. Chaque mutant : mutation transitoire (find/replace asserté non-vide), test complet relancé sous `env -u …` (A-7), ROUGE exigé = `✖ <test nommé>` **ET** `ℹ fail ≥ 1` (pas seulement exit≠0 — évite le faux-rouge d'un crash de chargement), puis restauration des octets ORIGINAUX + sha == baseline.
| # | Mutant | Fichier | Test qui rougit | Vérdict |
|---|---|---|---|---|
| M1 | N tapé au lieu de lu (`step 1 of`) | narabi-live.ts | `narabi_first_reading_label_reads_committed_t` | RED, restauré |
| M2 | « of 7 » à T=7 (`<` → `<=`) | narabi-live.ts | `narabi_first_reading_label_reads_committed_t` | RED, restauré |
| M3 | SERIES_MIN_STEPS dupliqué (2ᵉ constante `= 7`) | narabi-live.ts | `narabi_first_reading_label_single_source_of_seven` | RED, restauré |
| M4 | statut « shipped » | narabi-live.ts | `narabi_first_reading_label_reads_committed_t` | RED, restauré |
| M5 | favicon distant (`<image href="https://…">`) | app/narabi/icon.svg | `narabi_icon_svg_local_no_remote_url` | RED, restauré |
| M6 | glossaire chiffré (digit dans la def) | narabi-copy.ts | `narabi_glossary_under_calib_generic_digit_free` | RED, restauré |

Sweep global final : les 3 fichiers cibles sha == baseline (`narabi-live.ts 8e12619…`, `narabi-copy.ts 8effd627…`, `icon.svg aa2f3006…`). `git status` après harnais = inchangé (5 fichiers du lot).

## 6. R-25 (A-5 ; pathspec VERBATIM `ci.yml:65`, SVG comptés, base `HEAD=7c34bef`)
`git add -N apps/site/app/narabi/icon.svg` → `git diff --shortstat HEAD -- . <14 excludes verbatim>` → `git reset -q`. Résultat : **5 files changed, 135 insertions(+)** ⇒ **R-25 = 135** ≪ 1 150 (borne interne) < 1 205 (CI). Pas de STOP. Note : légèrement au-dessus de l'estimation §9 (~80–100), écart dû aux assertions anti-mutant supplémentaires (contrôle registre Q-8b, single-source structurel C-5, oracle favicon, deux longueurs de timeline) recommandées par l'advisor ; reste très en-deçà de la borne.

## 7. Invariants byte-identiques (A-6)
- `app/narabi/icon.svg` == asset v4 `favicon-narabi.svg` : sha `aa2f3006f1c3346441d0c9e11301a001fc38081d1463a2c6874dda0a3daff867` (source ET dest identiques).
- Fichiers du gel U-4b et pièces servies : **non touchés** (hors périmètre A). `fleet.ts`, `narabi-snapshot.ts`, `gate.ts` : lus seulement (sha inchangés). `assert-fleet-html.mjs` (B) : non modifié, s'exécute vert.

## 8. Consigne standard G1 — point par point
- **A-1** fait : 1ʳᵉ ligne « Modèle résolu : claude-opus-4-8[1m] », préfixe conforme.
- **A-2** fait : node_modules mk-nm ; `require.resolve('@monark/rpc-guard')` → worktree.
- **A-3** fait : codes de retour capturés directement (`cmd > log 2>&1; echo exit=$?`), oracle complet (§4).
- **A-4** fait : `DELIVERED.sha256` (chemins worktree-relatifs, 5 fichiers) ; rendu sous `F:\tmp\siteA\` ; aucun commit ; rien sur `C:` ; aucun réseau (build local, aucun fetch).
- **A-5** fait : R-25 = 135 (pathspec verbatim), < 1 150 (§6).
- **A-6** fait : invariants byte-identiques listés (§7) ; aucun fichier de gel touché.
- **A-7** fait : toutes commandes (oracle + mutants) sous `env -u` des 8 clés payantes ; aucune variable affichée (contrôle par présence/résolution seulement).
- **A-8** n-a : pas de tuyau externe dans le sous-lot A (aucune API émetteur ; la pilule lit un snapshot committé). Motif : lot vitrine, entrée = fichiers du dépôt.
- **A-9** fait : le mutant « statut » porte sur la phrase EFFECTIVEMENT servie (préfixe de la pilule) et est lié au registre `fleet.ts` (Q-8b) ; le mutant glossaire porte sur la def rendue. Pas d'injection « interval » ici (constantes servies = sous-lot B).
- **B-1..B-6** n-a : aucun secret, aucun opérateur payant, aucun `fetch`/clé dans le sous-lot A (vitrine pure ; les tests d'intégrité snapshot lisent des octets committés).
- **C-1..C-4** n-a : aucune classe d'erreur / retry / budget dans ce lot.
- **D-1** fait : chaque test imposé a son mutant nommé ROUGE, rejoué par `mutants.mjs` (mutation transitoire + restauration byte-exacte, §5).
- **D-2** fait : vecteurs synthétiques NON vides (états t=6/t=7, timeline à 2 et 9 lignes), valeurs recomputées (jamais entrée legacy vide).
- **D-3** fait : test d'intégration non-LLM par tuyau (§3a) — fonction pure sur octets réels + porteur + oracle favicon sur l'artefact bâti.
- **D-4** fait : aucune assertion existante affaiblie (les 6 tests préexistants restent verts et intacts ; ajouts seulement).
- **E-1..E-3** n-a : pas de verrou/ledger/cooldown dans ce lot.
- **F-1** fait : ligne « Tuyaux » par pièce (§3a) ; aucun renvoi vers `F:\tmp` comme source (sources = dépôt) ; résidus nommés avec déclencheur (§3c, §9).
- **F-2** fait : sources ASCII sauf glyphes d'AFFICHAGE tolérés (« · » séparateur, déjà expédié par la surface narabi ; G0 §6.7, M12) ; `gate:vocab` propre.
- **F-3** fait : déviations D-n déclarées (§9), jamais contournées en silence ; blocage build → recherche documentée + item formé.

## 9. Déviations (D-n) et items formés avec déclencheur (P5, règle Dettes) — ZÉRO dette nue
### D-1 (déviation build, DÉCLARÉE) — la commande pinnée `next build` (Turbopack) échoue dans un worktree jonctionné
- **Mesuré (rejouable)** : `npm run build -w @monark/site` (Turbopack, défaut Next 16.3.4) exit **1** — « Could not find the Next.js package (next/package.json) ; Resolved from: F:\Monark-wt-siteA\apps\site\app ; Filesystem root used for resolution: F:\Monark-wt-siteA ». Fait observé : mk-nm.ps1 (A-2) crée `node_modules/next` en **JUNCTION** vers `F:\Monark\node_modules\next` (`fsutil reparsepoint query` = tag mount-point 0xa0000003) ; le message de Turbopack indique qu'il résout la jonction vers son chemin réel HORS de la racine de workspace (« files outside of the workspace root are not compiled »).
- **Causalité QUALIFIÉE (memstack, pas déterministe)** : le lien « jonction ⇒ Turbopack refuse » est observé dans CE worktree, mais la mémoire le nuance — uid `aa2aa5c004484b5a8eaba7e5c7994774` (2026-09-19) : un worktree `Monark-wt-p1b1` **jonctionné** (uid `5ab4a867…`, même jour, junctions mk-nm) a lancé `npm run build -w apps/site` et atteint une **erreur TypeScript** ; or Next vérifie les types APRÈS la compilation Turbopack ⇒ Turbopack y a résolu `next` malgré la jonction. Les builds Turbopack verts du 10/09 (uids `427d12b3…`, `b1c335dc…`) **précèdent** le fichier `mk-nm.ps1` (daté 2026-09-21) ⇒ ils ne prouvent rien sur la jonction. **Différenciateur siteA vs p1b1 non établi** (version Next ? détection de racine ? état node_modules ?) — je ne ré-enquête pas (l'artefact webpack est fidèle) ; le différenciateur fait partie de l'item formé.
- **Résolution documentée (non contournement)** : `next.config.mjs` **n'active pas** Turbopack (c'est le défaut de Next 16.3) ; le mode **`--webpack`** est un mode de build first-class de Next (résolveur qui suit les jonctions sans la contrainte de racine). `npm run build -w @monark/site -- --webpack` exit **0**, produit le MÊME artefact App Router (14 routes prérendues, `/narabi` + `/narabi/icon.svg`), sur lequel `assert-fleet-html` et l'oracle favicon passent. Je n'ai PAS modifié `next.config.mjs` (hors lot A/B) ni le node_modules.
- **Portée** : purement un artefact du worktree jonctionné. Sur la CI réelle (`npm ci`, sans jonction), `g3-site` exécute `next build` (Turbopack) sans ce problème — ce n'est PAS un défaut du code du lot.
- **Item formé, déclencheur = ruling orchestrateur** : soit (i) le worktree de build site est dé-jonctionné (node_modules réels dans la racine) pour rejouer Turbopack à l'identique de la CI, soit (ii) l'oracle build worktree standardise `--webpack` (documenté ici). À trancher avant checkpoint-2. Aucune modification de code requise.

### D-2 (angle mort du G0, item formé) — le favicon par route de `/narabi` est une RÉGRESSION servie (fonctionnel → 404), shadowé par Caddy
- **C'est une régression, pas seulement un manque (mesuré, rejouable)** : Next n'émet PAS le lien racine `/icon.svg` quand un segment a le sien. Preuve sur l'artefact bâti : `grep -c '<link[^>]*rel="icon"' narabi.built.html` = **1** ; ce lien unique = `/narabi/icon.svg?…` ; `grep -c 'href="/icon.svg' narabi.built.html` = **0** (le lien racine a disparu). Contrôle : `/fleet` bâti garde `href="/icon.svg?791dd22601ec6190"` (racine, non shadowé, fonctionnel). ⇒ **AVANT** ce lot `/narabi` servait le favicon RACINE `/icon.svg` (hors `/narabi/*`, donc atteint Next, fonctionnel) ; **APRÈS**, `/narabi` ne référence QUE `/narabi/icon.svg`.
- **Shadow Caddy (mesuré)** : `deploy/Caddyfile.monark-narabi.snippet` porte `handle_path /narabi/* { root * /var/lib/monark-sentinel/public ; file_server }` — **terminal, aucun fallthrough** vers Next. La fonction `shadowed()` du test existant (`test/narabi-live.test.ts:173-179`) donne `shadowed("/narabi/icon.svg", "/narabi/*") === true`. En prod, `/narabi/icon.svg` est servi par le `file_server` du sentinel où `icon.svg` n'existe pas ⇒ **404**. Net : favicon servi de `/narabi` **fonctionnel → 404** tant que le ruling Caddy n'est pas rendu.
- **Non un blocage de merge, MAIS un blocage de DÉPLOIEMENT** : Q-3b (favicon par route) est plié ; j'implémente `icon.svg` tel quel, l'oracle local (`<link rel="icon">` dans le `<head>` bâti) est VERT, et je **ne touche pas au Caddyfile** (∉ A, ∉ B, deploy). Le lot BUILDE et GATE, ne DÉPLOIE PAS (§11 G0), donc le merge n'est pas bloqué ; mais sans ruling, la pièce serait « branchée » sur un chemin servi CASSÉ (règle Branchement). Le G0 §6.5/§10.A a manqué cette interaction.
- **Item formé, déclencheur = ruling orchestrateur AVANT MISE EN LIGNE** : options — (i) exception Caddy `handle /narabi/icon.svg` → Next ; (ii) copier statiquement `icon.svg` dans `/var/lib/monark-sentinel/public` (RUNBOOK) ; (iii) ré-ruling Q-3b vers l'icône racine seule pour `/narabi`. Aucune n'est du code de A/B (deploy).

### Faits de provenance (non-dette)
- Snapshot Narabi `capturedAt 2026-09-19` (endpoints Blast/Llama antérieurs à D-106) : inchangé, hors périmètre A (lu seulement).

## 10. Captures du rendu bâti (« sinon dis-le »)
- **Aucune capture visuelle PNG possible hors réseau** : pas de navigateur headless dans l'environnement (Chromium nécessiterait un téléchargement = réseau, interdit). De plus, `/narabi` étant un **client component**, le corps de `narabi.html` bâti est la coquille « reading the published files… » : même un rendu du HTML statique n'afficherait pas la pilule (elle rend côté client après chargement snapshot/live) — c'est le résiduel C-7 (déclencheur = parcours visuel investisseur).
- **Ce que je livre à la place (artefacts réels, non fabriqués)** :
  - `F:\tmp\siteA\narabi.built.html` : `narabi.html` bâti (artefact `next build --webpack`).
  - `F:\tmp\siteA\narabi.built.head.html` : le `<head>` bâti (1630 o) montrant `<link rel="icon" href="/narabi/icon.svg?fd049e52b123b9e5" type="image/svg+xml" sizes="any">`.
  - `apps/site/app/narabi/icon.svg` : la source SVG où l'adaptivité clair/sombre est visible (`@media (prefers-color-scheme:dark){.ink{stroke:#E9EBF2}.acc{stroke:#E8C468}.accf{fill:#E8C468}}`) — le rendu clair = strokes `#14151B`/`#B8922E`, le rendu sombre = `#E9EBF2`/`#E8C468`.
  - Le libellé exact de la pilule (fonction pure, non rendu au build) : à t=1 « built · step 1 of 7 before first reading » ; à t=6 « built · step 6 of 7 before first reading » ; à t=7 « built · 2 windows published ». Vérifiable par `narabi_first_reading_label_reads_committed_t`.

## 11. Écarts à la maquette v4 (INFORMATION due à l'investisseur, pas escalade — G0 §16.1)
1. « shipped » → « built » (Q-8b : le mot suit le registre gelé `fleet.ts` ; test lie le préfixe à `FLEET_AGENTS` Narabi.status).
2. « day 1 of 7 » → « step 1 of 7 » (C-3/M-15 : « day » faux sur le snapshot committé — 2 fenêtres publiées, `tracker.t=1`).
