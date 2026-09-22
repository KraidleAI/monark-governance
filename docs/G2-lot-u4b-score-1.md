# G2 — lot U-4b-SCORE-1 (décision 126) — relecteur Opus 4.8, contexte frais

Modèle résolu : claude-opus-4-8[1m]

> **Provenance.** Relecteur G2 `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22. Instance NEUVE, contexte frais. Clone à historique complet `F:\tmp\g2-u4bscore\tree` (`git clone --no-hardlinks --branch lot/u4b-score-1 F:\Monark`, 1003 commits, base `31a9b42` présente), node_modules isolés par `mk-nm.ps1` (220 entrées, 10 @monark, 0 fail ; `@monark/rpc-guard` résout vers le clone). Chaque vérification 1-8 REFAITE par moi (jamais lue dans le rendu G1). Oracles sous `env -u` des 8 clés (A-7), AUCUNE variable d'environnement affichée, AUCUN commit (R-20), AUCUNE écriture hors `F:\tmp\g2-u4bscore\`. Objet : branche `lot/u4b-score-1` @ `35f7a671722cdee4d26083ddfbb374889ce40f23`.

## VERDICT G2 : PASS-AVEC-CORRECTIONS

**Toutes les 8 vérifications passent sur mesure** : chaque sha, digest, q̂, oracle, mutant, R-25 est conforme à l'attendu ; **aucune assertion affaiblie ni supprimée (D-4 vérifié), aucune valeur non reproductible.** Une SEULE correction de contenu (C-4 : une référence de sha PÉRIMÉE dans une ligne de prose du prereg CANDIDAT, `PLAN:74`) ; les autres corrections (C-1/C-2/C-3) sont wording / process / intégration. Aucun défaut ne touche le code du score, la fixture, les digests, les oracles ni les tests.

---

## Vérification 1 — Diff exact du code

**Fait mesuré décisif** : `merge-base(31a9b42, 35f7a67) = f26693f` — les deux branches ont DIVERGÉ (`f26693f` est ancêtre de `31a9b42` ; `lot/etude-suite` a avancé de **9 commits** depuis : GARDE-HELIUS-2b-iii `985fed9`, U-5 DRAFT, Décision 127…). Le lot `lot/u4b-score-1` est **UN SEUL commit** `35f7a67` sur `f26693f`.

- **Diff two-dot `31a9b42..35f7a67 -- scripts apps` (celui de la mission)** : POLLUÉ par la divergence — montre en plus du lot : `u4-guard.mjs` (D), `u4-oracle-path.mjs` (M), `u4-probe.mjs` (A), `u4-redraw.mjs` (M) + de nombreux docs. **Ce ne sont PAS des changements du lot** : ce sont les 9 commits d'etude-suite vus « à l'envers » (le lot est en amont d'eux). R-25 two-dot = **1010** (artefact).
- **Diff three-dot `31a9b42...35f7a67` = `f26693f..35f7a67` (périmètre RÉEL du lot, = ce qu'utilise la gate R-25 `...HEAD`)** : EXACTEMENT 7 fichiers —
  - Sous `scripts`+`apps` (5) : `scripts/census/u4b/u4b-scores.mjs`, `scripts/census/u4b/u4b-scores.d.mts`, `apps/sentinel/test/ukemi-u4b-scores.test.ts`, `apps/sentinel/test/fixtures/ukemi/u4b/U4b-scores-e2.jsonl`, `apps/sentinel/test/fixtures/ukemi/u4b/PROVENANCE-u4b.md`.
  - Sous `docs` (2) : `docs/adr/ADR-U4b-calibration-episode-frais.md`, `docs/PLAN-u4b-prereg.CANDIDAT.md`.
- **`u4b-scores.mjs`** : diff = commentaire d'entête l.28-29 (`|Y − ŷ| (base 8-dec, no clipping)` → `max(Y − ŷ, 0) — one-sided exceedance score, decision 126 (base 8-dec, clamped at 0)`, 1 ligne → 2) + **la SEULE ligne de score** (`const score = Y > yhat ? Y - yhat : yhat - Y;` → `: 0n;`). **Rien d'autre.** La ligne de score est à la NOUVELLE l.245 (ANCIENNE l.244, décalage +1 dû à l'expansion du commentaire) : la référence « :244 » de la mission/ADR/G1 est le numéro BASELINE.
- **`u4b-scores.d.mts`** : 1 ligne JSDoc (`|Y−ŷ|` → `max(Y−ŷ,0) one-sided exceedance`) — justifié : type-doc de véracité, fichier NON gelé.
- **`u4b-reduce.mjs` et `record-u4b-calib.mjs` sha256 INCHANGÉS** : absents du diff du lot ; recomputés (V6) = `a5e66cd3…57a6fac0` / `5733daeb…2a1fbc31a3` (attendus). ✓
- **`ukemi-u4b-scores.test.ts` — D-4 (assertions non affaiblies) VÉRIFIÉ par diff** (`git diff f26693f..35f7a67 -- …test.ts`) : **6 asserts supprimés, TOUS appariés** à une version valeur-mise-à-jour — `CELL_A_DIGEST`/`CELL_B_DIGEST` (`dc9ab572…`/`89897a61…` → `2feb4ab0…`/`07bb8e3b…`), `r.cellA.qhat` (`145029844742724` → `1861718113769`), les 2 lignes de strates du `deepEqual` (`199069846640`/`9315546795545` → `23169870364`/`3609978241254`), les 4 `calib_digest` registre (`8fa7f0f5…`/`ffdcb597…`/`0eca5077…`/`0b58be96…` → `371f0577…`/`624e21c7…`/`31654567…`/`db51ef06…`) ; **+14 asserts ajoutés** (6 remplacements + 8 nets neufs des 2 tests `one_sided_exceedance` et `fixture_kind_census`). Les messages `no clipping` → décision 126. **Aucune assertion retirée sans remplacement, aucune affaiblie** — que des pins ré-obtenus par exécution + des ajouts.

**Verdict V1 : PASS.** Périmètre du lot propre (three-dot), D-4 tenu. Corrections C-1 (commande two-dot de la mission) et C-2 (branche en retard) ci-dessous.

## Vérification 2 — Régénération de la fixture (recette PROVENANCE §3)

- Bruts (lecture seule) : `sha256sum` `U4-book-23545087.raw.json` = `8f620f6c83638814f5cff7bb5d3379989995bbf525da9fe1d32ab68a07304b5c` ✓ ; `U4-oracle-path-e2.raw.json` = `7b87f6d35a742ebb12a2dd084709c5bc73429aff2ef55eaf4b6e0cad0e58144e` ✓ (PROVENANCE §2). Aucun écart ⇒ pas de STOP.
- Recette §3 EXACTE rejouée depuis le clone sous `env -u` (exit 0). Log : `u4b-reduce: wrote 3 fixtures … cellA n=565 digest=2feb4ab057613925c9ed77dbec4f186044375b223d5ea520df3ec82d63524720, cellB n=99 digest=07bb8e3b1f35a95f5679f013133cc3e87540e01177279ccfe9ec6f4f8dfb8b0f`.
- **Byte-à-byte vs committé** : LF-sha régénérée = `301d39fa806fd36a72cc446484aa4d04807a56ab603b1b69f464264550a126ad` = committé ✓ ; book `baf717b7…` byte-identique ✓ ; oracle `5e6448dc…` byte-identique ✓. `git diff` = **BYTE-IDENTICAL** (aucune dérive EOL). Arbre restauré propre.

**Verdict V2 : PASS.** La fixture committée est byte-reproductible depuis les bruts sha-pinnés par la recette gelée ; seuls `score`/digests bougent, book/oracle inchangés.

## Vérification 3 — q̂ par strate (recompute indépendant)

Script propre `F:\tmp\g2-u4bscore\scripts\v3-qhat.mjs` (α=1 %, nMin=100, `p=⌈(n+1)·0,99⌉`, tri BigInt, q̂=s[p−1] ; PAS les helpers G1) :

| Strate | n | p | q̂ | under_calib |
|---|---|---|---|---|
| 0 | 363 | 361 | **23169870364** (231,70 $) | false |
| 1 | 148 | 148 | **3609978241254** (36 099,78 $, p=n=max) | false |
| 2 | 46 | 47 | null | **true** |
| 3 | 8 | 9 | null | **true** |

Cellule A poolée : n=565, p=561, q̂=**1861718113769** (= pin test :52). **Attendus k0/k1/under_calib confirmés.**
- **One-sided** : violations `Y<ŷ ∧ score≠0` = **0** (attendu 0) ✓ ; Y<ŷ=509 / Y==ŷ=0 / Y>ŷ=56 ; 0 score négatif ; toutes les lignes Y>ŷ ont `score == Y−ŷ` ; toutes Y<ŷ et ex æquo ont `score==0`.
- **Disjonction clause 3 (MESURÉE, pour V7)** : `census.crossed_yhat_zero`=**1** ; `{ŷ=0 ∧ liquidés}`=**3**, tous `pstar=null` (**3** null / **0** non-null) ⇒ DISJOINTS ⇒ **3, pas 3−1**. Y = 32 772,78 $ (`0x6760ff…`), 231,70 $ (`0xb6f077f7…`), 106 668,92 $ (`0xf508c2a6…`). q̂₀=231,70 $ EST le 3ᵉ échec de règle.

**Verdict V3 : PASS.**

## Vérification 4 — Mutant symétrique

Test ciblé `u4b_score_is_one_sided_exceedance` (recalcule via `computeScoresU4b` en direct — pas la fixture statique) :
1. Pristine : **VERT** (exit 0) — non-vacuité.
2. Mutant l.245 → `Y > yhat ? Y - yhat : yhat - Y` (symétrique exact ; LF-sha `36c363ff…`) : **ROUGE** (exit 1) — `AssertionError [ERR_ASSERTION]: every Y<ŷ account scores exactly 0 (one-sided clamp; symmetric mutant RED here)`.
3. Restauration `git checkout` : ligne unilatérale, LF-sha = **`2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0`** (byte-exact = re-gelé), porcelain vide.
4. Post-restauration : **VERT** (exit 0).

**Verdict V4 : PASS.** Mutant tueur, non-vacuité prouvée, restauration byte-exacte.

## Vérification 5 — Oracle complet ×1 (sous `env -u`)

| Oracle | exit | Détail mesuré |
|---|---|---|
| `npm run ci` (gate:vocab ∧ typecheck ∧ test) | **0** | **tests 765, pass 763, fail 0, skipped 2, todo 0** ; gate:vocab OK (206 fichiers, 0 claim interdit) ; typecheck OK ; 4 tests u4b VERTS (dont one_sided + kind_census + registry) |
| `npm run lint` | **0** | — |
| `npm run lint:ratchet` | **0** | **69/69** (plafond committé) |
| `npm run lang:gate` | **0** | 0 hit FR non-exempt |
| `npm run export:check` | **0** | 0 chemin interdit, 0 hit FR |

Les **2 skips sont connus** (sans lien avec le lot) : `u4_redraw_selects_by_book_digest_seed` (différé à 2b-iii) et `fetch_only_inside_client` (différé à 1b). **Conforme à l'attendu 765/763/0/2.**

**Verdict V5 : PASS** (sur l'arbre du lot ; cf. correction C-2 : oracle sur arbre mergé dû au G7).

## Vérification 6 — Amendement ADR-U4b

- **Tableau des 9 sha (ADR §3 l.195-205)** — recomputés du clone (`git show HEAD:<f> | tr -d '\r' | sha256sum`) et comparés :
  1. `u4b-scores.mjs` = `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0` (**RE-GELÉ**, = AVANT `9ad20666…` → APRÈS attendu) ✓
  2. `u4b-reduce.mjs` `a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0` ✓ ; 3. `record-u4b-calib.mjs` `5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3` ✓ ; 4. `wadray.ts` `7bee76fc…e4de2322` ✓ ; 5. `abi.ts` `3376eb08…c1ab2d66` ✓ ; 6. `l1-split.ts` `9206df91…8164ffa3` ✓ ; 7. `rpc.ts` `0e232519…c1c65ca0` ✓ ; 8. `calib-digest.ts` `3603265d…94c42380` ✓ ; 9. `u3-realized.mjs` (labeler) `755b3a38…618db2de4` ✓. **Les 9 correspondent aux fichiers du clone.** (Concordance identique avec la table PLAN §2, l.108-118.)
- **Région servie** : ADR §2 l.186 « BORNE HAUTE `[0, ŷ + q̂_k]` », texte servi « upper bound », jamais « interval » ✓ ; DRAFT `buildIntervalRegion(ŷ − q̂, ŷ + q̂)` → `buildIntervalRegion(0, ŷ + q̂)` (fonction conservée).
- **`region.kind` reste `"interval"` sur le fil (contrat gelé)** — VÉRIFIÉ par mesure : l'émetteur du kind wire est `apps/harness/src/tools/gate.ts:525` (`v.region.kind === "interval"`) et `buildIntervalRegion` dans `packages/hikae/src/region.ts` ; **AUCUN de ces fichiers n'est touché par le lot** (périmètre 7 fichiers V1). Le kind wire est donc trivialement préservé. **Réserve C-3** : l'ADR/PLAN sont SILENCIEUX sur le champ wire `region.kind` (ils disent « jamais un intervalle » en prose et gardent `buildIntervalRegion`) — cohérent mais ré-écrivable par l'implémenteur -2 comme un renommage du kind. Correction non bloquante ci-dessous.
- **Item Mondrian avec déclencheur** : ADR §6 l.255-258 « Item formé, propriétaire orchestrateur, déclencheur : épisode frais avec ≥ 100 liquidés mono-WETH dans une strate » ✓.

**Verdict V6 : PASS** (avec correction C-3 non bloquante).

## Vérification 7 — Prereg CANDIDAT

- **H-3** (l.94) : « test exact bêta-binomial UNILATÉRAL, **CONSERVATEUR sous ex æquo** (atomes en 0 comptés couverts) » ✓ ; « couverture `s ≤ q̂` (fermée, cohérente avec la région borne-haute) » ; « aucune revendication sur un nouvel événement » ; « un OUI de H-3 ne licencie rien de plus » (C-11) ⇒ **aucune revendication nouvelle** ✓.
- **n ≥ 199** (H-2bis l.92) : « `n ≥ 199` par strate servie pour un q̂ intérieur (α=1 % ⇒ p<n ssi n≥199), distincte de nMin=100 ; sinon q̂ = max rapporté tel quel » ; e2 strate 1 n=148<199 ⇒ q̂=max=`3609978241254` ✓.
- **Compteurs (l.93)** : `crossed_yhat_zero`=1 (franchi, NON liquidé, hors cellule) + `{ŷ=0 ∧ liquidés}`=3 sous-divisé par `pstar` (**3** null / **0** non-null), DISJOINTS (**3, pas 3−1**). **Vérifié sur le code** : `u4b-scores.mjs:176` (`no_crossing`, `pstar` reste null, `yhat:0n`) sort AVANT `census.crossed++` l.177 ; `crossed_yhat_zero++` l.224 est DANS la branche franchie (après crossed++) — donc `{pstar=null}` (no_crossing) ∩ `{crossed_yhat_zero}` (pstar≠null) = ∅. (Références mission `:175`/`:223` = numéros baseline ; actuels 176/224.) **Vérifié sur la fixture** (V3) : 3 lignes `ŷ=0 ∧ liquidés` toutes `pstar=null`. ✓
- **Score en §Définitions** (l.63) : « `s = max(Y − ŷ, 0)` (exceedance UNILATÉRALE, base 8-dec, clipée à 0 ; décision 126) » ✓ ; « Région servie = borne haute `[0, ŷ + q̂_k]`, jamais un intervalle ; texte servi « upper bound » » ⇒ **texte servi jamais « interval »** ✓.

**Verdict V7 : PASS.**

## Vérification 8 — R-25

Pathspec VERBATIM de `.github/workflows/ci.yml:65` (`...HEAD` three-dot, exclusions docs `**/*.md`, séries json/jsonl/csv, lockfile). Base = `31a9b42` (three-dot ⇒ `f26693f..35f7a67`), awk de `ci.yml:69` :
```
shortstat = 4 files changed, 67 insertions(+), 16 deletions(-)  ⇒  CHANGED = 83
```
4 fichiers comptés (numstat) : `PROVENANCE-u4b.md` 24/2, `ukemi-u4b-scores.test.ts` 39/11, `u4b-scores.d.mts` 1/1, `u4b-scores.mjs` 3/2. Exclus : fixture jsonl (série), ADR/PLAN (`docs/**/*.md`). **R-25 = 83** (attendu 83). (Two-dot pollué = 1010 — cf. C-1.)

**Verdict V8 : PASS.**

---

## Corrections formées (déclencheur/propriétaire donnés)

- **C-4 (CONTENU — prereg CANDIDAT, propriétaire orchestrateur R-20, déclencheur = AVANT le commit réel du prereg)** — `docs/PLAN-u4b-prereg.CANDIDAT.md:74` affirme au PRÉSENT : « Règle d'agrégation servie … **déjà GELÉE** dans `u4b-scores.mjs:102-120` (sha `9ad20666…`) ». Après le re-gel, le fichier est gelé à **`2f9a31f6…`** — cette ligne se CONTREDIT avec l.110/121 du même document (qui portent le nouveau sha). La logique d'agrégation Y (lignes ~103-121) est bien inchangée par le re-gel, mais le sha de FICHIER cité est périmé ; le régime B recompute la TABLE §2 au commit, PAS cette ligne de prose ⇒ elle ne s'auto-corrige pas. Correction : `9ad20666…` → `2f9a31f6…` (et plage baseline 102-120 → 103-121). **Seul défaut de contenu du lot** ; non bloquant pour la correction du re-gel (code/fixture/digests/tests tous justes), à corriger avant le commit du prereg. (Autres hits `9ad20666` classés : ADR corps D4 l.18 + amendement §3 l.197/210 = append-only superseded, par design ; PLAN l.110/121 + PROVENANCE l.100 = historiques AVANT/APRÈS. Note baseline : `PLAN:83` cite `u4b-scores.mjs:112` = le throw `deficit_base_no_price`, désormais l.113 ; numéro baseline, pas un défaut.)
- **C-1 (commande de la mission, non bloquant)** — La vérification 1 dicte `git diff 31a9b42..35f7a67` (two-dot), qui MÉLANGE le lot avec la divergence des 9 commits d'etude-suite (u4-guard/u4-probe/u4-oracle-path/u4-redraw + docs ; 1010 lignes). Le périmètre RÉEL du lot est le **three-dot `31a9b42...35f7a67` = `f26693f..35f7a67`** (7 fichiers, ce que la gate R-25 utilise et ce que l'« attendu » décrit). Correction : lire le diff du lot en three-dot / merge-base. **Le lot est propre.** (Note : l'« attendu » V1 omet `PROVENANCE-u4b.md`, 5ᵉ fichier légitime sous `apps/`, requis par la mission G1 item 6.)
- **C-2 (intégration, propriétaire orchestrateur, déclencheur = merge)** — La branche `lot/u4b-score-1` est **9 commits en retard** sur `lot/etude-suite` @ `31a9b42` (cut de `f26693f`). Le rebase est textuellement PROPRE (les 9 commits touchent `scripts/census/u4-*.mjs`, `test/guard-scripts-u4.test.ts`, docs — **zéro recouvrement** avec les 7 fichiers du lot ni ses imports gelés ; les 9 sha gelés concordent). MAIS mon oracle V5 (765/763/0/2) a tourné sur l'ARBRE DU LOT, pas sur l'arbre mergé. **L'oracle sur arbre mergé doit être rejoué au G7** (précédent : G7 GARDE-HELIUS-2b-iii, arbre mergé 779/778/0/1). Item formé, non un blocage G2.
- **C-3 (clarté ADR/PLAN, non bloquant)** — ADR §2 (l.186-190) et PLAN §Définitions (l.63) disent « jamais un intervalle / upper bound » (prose servie) et gardent `buildIntervalRegion` ; ils NE NOMMENT PAS le champ wire `region.kind`. C'est cohérent (le kind wire `"interval"`, gelé au checkpoint-1 delta U-4b-2 `4e63f7b` D-1, n'est touché par aucun fichier du lot) mais ré-interprétable par l'implémenteur -2 comme un renommage. Ajouter une phrase : « le champ wire `region.kind` reste le littéral `"interval"` ; « upper bound » ne concerne QUE le texte/la forme servie ». Insertion par l'orchestrateur (R-20).

## Frontière checkpoint-2 (hors de mon rôle G2)

Le verdict CA-1..CA-11 (ACCEPTE / … / ESCALADE) est celui du **validateur-humain Fable 5.1**, pas du relecteur G2. **Entrée factuelle pour CA-11** (« le re-gel ne change aucun chemin servi ; `branché`/`built` inchangés »), sans verdict : le lot touche 7 fichiers (V1), **aucun** n'est une surface servie/publique (site, README, skill, registre) ni le code de région (`gate.ts`/`region.ts`) ; e2 est le jeu de CONCEPTION, jamais servi (PROVENANCE §1, ADR) ; les tests de gel public sont VERTS dans V5 (`visage_register_is_frozen`, `token_ca_pinned`, `site_renders_only_committed_data`). Le kind wire `region.kind="interval"` est intact (V6).

## Discipline (consigne)
- **R-1** : modèle résolu déclaré 1ʳᵉ ligne (`claude-opus-4-8[1m]`).
- **A-7** : tous les oracles/mutant/régénération sous `env -u` des 8 clés ; **aucune** variable d'environnement affichée (jamais `env`/`printenv`/`echo $X`).
- **R-20** : aucun commit, aucun workflow déclenché. **Écritures** confinées à `F:\tmp\g2-u4bscore\` (clone `tree/`, `scripts/v3-qhat.mjs`, `logs/`, ce rapport) ; le clone restauré propre (`git status --porcelain` vide) après chaque étape destructive (V2, V4).
- **R-21** : chaque chiffre porte sa preuve reproductible (commandes/logs sous `F:\tmp\g2-u4bscore\logs\`).

## Reproductibilité
- 9 sha : `cd F:/tmp/g2-u4bscore/tree && git show HEAD:<f> | tr -d '\r' | sha256sum`.
- Bruts + régénération : `env -u … node scripts/census/u4b/u4b-reduce.mjs --book-raw F:/PRODUITS/etude-2026-09-20/u4-raws/U4-book-23545087.raw.json --oracle-raw …/U4-oracle-path-e2.raw.json --labels apps/sentinel/test/fixtures/ukemi/u3/U3-realized.jsonl --event-id e2-2025-10-10-weth --episode-tag e2`.
- q̂ : `node F:/tmp/g2-u4bscore/scripts/v3-qhat.mjs apps/sentinel/test/fixtures/ukemi/u4b/U4b-scores-e2.jsonl`.
- Mutant : Edit l.245 → `yhat - Y` ; `env -u … node --test --test-name-pattern one_sided_exceedance apps/sentinel/test/ukemi-u4b-scores.test.ts` (exit 1) ; `git checkout` (sha `2f9a31f6…`).
- Oracles : `env -u … npm run ci|lint|lint:ratchet|lang:gate|export:check`.
- R-25 : pathspec `ci.yml:65` avec base three-dot `31a9b42...35f7a67`.
