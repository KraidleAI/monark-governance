# G2-DELTA — lot U-4a (Ukemi) : revue cumulée (pli G2 + pli checkpoint-2) + contrôle indépendant LIVE (D-12)

Relecteur **G2-DELTA**, instance séparée à contexte frais : n'a écrit AUCUNE partie de ce lot, n'a
PAS mené la course. **Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8`
conforme, effort max ; Opus 5 banni respecté). Date : 2026-09-21 (UTC ; `date -u` de lancement =
2026-09-21T01:25:01Z). Cible : worktree `F:\Monark-wt-u4a`, branche `lot/u-4a`, HEAD **`16640ee`**
(β-fix). Périmètre validateur (`docs/CHECKPOINT2-lot-u4a.md`) = CUMUL depuis l'arbre vu par la G2
fraîche = **pli G2 (dans `3887190`) + pli checkpoint-2 (`c137af1`, `16640ee`)** — ces plis MODIFIENT
DES ORACLES.

Méthode : revue statique → exécution → mutants, hors ligne ; puis le SEUL appel réseau autorisé (le
re-tirage live D-12). Rien édité dans le worktree (git status PRE==POST vide), aucun commit (R-20),
aucun `git checkout` de restauration, scratch `F:\tmp\u4a\g2d\`, rien sur C: (TMP/cache npm sur F:),
bruts hors dépôt en lecture partagée (`readFileSync`, jamais exclusif). Tout est rejouable sous
`F:\tmp\u4a\g2d\{recompute.mjs, preflight.mjs, r25.mjs, mutants.mjs, redraw-run.log}` + arbres
`tree-{base,alpha,final,c137af1}` (git archive).

---

## VERDICT : **PASS-AVEC-CORRECTIONS**

La mesure est **saine et intégralement reproduite de première main** : les 3 fixtures se régénèrent
**byte-identiques** au committé et aux pins (`u4-reduce.mjs`), `calib_digest = 267cd991…`, n=797,
p=791, q̂=364550606513851 recalculés indépendamment ; l'**invariance C-V-2 est prouvée** (ancien Y ⇒
ancien digest `668ab214…` exact, n/p/q̂ inchangés). Le **contrôle indépendant LIVE pré-enregistré
(D-12) PASSE sans écart** : les 3 comptes book-digest-seedés et les 3 `AnswerUpdated` re-tirés en
direct sont **IDENTIQUES au cache** (all_match=true, cache byte-inchangé). Suite complète : α-seul
**437/437**, arbre final **442/442** ; R-25 α=948 / β=810 (≤ 1205) ; **11 mutants tous ROUGES**,
restaurés byte-exact ; oracles verts. **Aucun défaut bloquant.**

Une correction (non bloquante) demeure : l'export public embarque des **fixtures u4/ orphelines
(6,12 Mo ≈ 60 % de l'export) + un chemin local `F:\…` publié** (C-G2D-1) — état déjà adjugé Option A
au checkpoint-2 (précédent u3), documenté fidèlement en ADR-M004 D7 sexies, mais dont le chemin local
mérite un scrub minimal + un item DATA formé. Deux observations de traçage (C-G2D-2/3).

---

## Défauts et observations (liste fermée) — C-G2D-n

| # | sévérité | fichier:ligne | constat (mesuré) | correction minimale | error_origin | bloquant |
|---|----------|---------------|------------------|---------------------|--------------|:---:|
| **C-G2D-1** | correction (défaut au sens mission : orpheline + chemin local publié) | `apps/sentinel/test/fixtures/ukemi/u4/PROVENANCE-u4.md:44,58` ; export via `scripts/export-public.mjs:41` (`APP_PACKAGE_DIRS` inclut `apps/sentinel`) | L'export **mesuré** embarque `U4-book-23545087.json` (5 957 519 o) + oracle (17 058) + scores (142 250) + PROVENANCE (6 775) = **6 123 602 o orphelins ≈ 60 % de l'export total 10 276 555 o**, leurs 2 tests exclus ⇒ **données mortes dans le miroir public** ; PROVENANCE-u4.md publie `F:\PRODUITS\etude-2026-09-20\u4-raws\` (l.44, 58). Précédent u3 **RÉEL** (PROVENANCE-u3.md:42 même chemin `F:\…`, shipé) — c'est la **1ʳᵉ instance du même défaut latent**, pas une base propre. | (a) remplacer le chemin absolu `F:\…` de PROVENANCE-u4.md (+ balayer u3) par un renvoi générique / au PLI (`docs/`, blacklisté, jamais exporté) ⇒ cascade : recalculer le LF sha de PROVENANCE-u4.md dans la table C-V-7 du PLI (`ec35820c`) ; `series_pinned` intact (3 sha fixtures inchangés). (b) **item formé** : exclusion des DONNÉES orphelines upcoming de l'export (analogue de `export-exclude-tests.json` pour fixtures) — **jamais** `STRUCTURAL_BLACKLIST` (échec dur + divergence du miroir test 42) ; déclencheur : publication Ukemi / G0 U-7 ; propriétaire orchestrateur. | worker + orchestrateur (classe C-V-1) | **NON** (annexe, upcoming, rien servi, test 42 vert, 1ʳᵉ publication = décision mainteneur) |
| **C-G2D-2** | observation | (mission) « α-seul-corrigé (`git archive c137af1`) » ; message de commit `c137af1` | Historique **linéaire** α→β→α-fix→β-fix ⇒ `git archive c137af1` = α+β+α-fix = **439/440, test 42 ROUGE** (C-V-1 β non plié à ce commit — == « β 439/440 » du checkpoint-2). Le VRAI α-seul-corrigé = `git archive 041a902` + les 3 fichiers α-fix = **437/437** (méthode réelle du PLI §350). Les deux mesurés. Commits intermédiaires `3887190` et `c137af1` sont ROUGES ; seul l'arbre final `16640ee` (+ α-seul reconstruit) est vert. **Le message de `c137af1` dit « full root suite green on alpha alone (437/437) » — vrai pour l'arbre RECONSTRUIT (041a902+α-fix), FAUX pour l'arbre du commit (439/440)** ⇒ induit un futur bisecteur en erreur. | Aucune sur le livrable (chiffres checkpoint-2 437/437 / 442/442 VÉRIFIÉS). Note orchestrateur : (a) si le G7 présente α/β en deux plis verts, les frontières de commit réelles ne s'alignent pas (α-fix = commit séparé postérieur) ; (b) une phrase dans le message/journal distinguant « α reconstruit vert 437/437 » de « arbre du commit 439/440 » évite le piège bisect. | phrasing mission/orchestrateur (pas le PLI) | NON |
| **C-G2D-3** | observation | `docs/PLI-lot-u4a.md:354` | « total 1756 » ≠ α cumulé 948 + β cumulé 810 = **1758**. Le **1756 est le diff DIRECT** base→final (vérifié : 1703 ins + 53 del) ; l'écart **+2 = `scripts/export-exclude-tests.json` compté dans les deux plis** (α : base→2-entrées = 4 l. ; β : 2→3-entrées = 2 l. ; direct = 4 l.). | Clarifier « total 1756 = diff direct ; α+β = 1758 (export-exclude compté 2×) ». | worker (doc) | NON |

---

## A. Revue hors ligne

### A.1 — C-V-2 (Y complété par le déficit prisé) : VÉRIFIÉ

- **Prereg §2 + C-12 définissent bien Y = remboursé + déficit** : `PLAN-u4-prereg.md:8` « Y_compte = Σ
  (`repayment_base + deficit_base`) » ; `CHECKPOINT1-lot-u4.md:55` C-12 (déficit `0x15391e…` renseigné,
  Y complet) et l.33/44 D-5 « Y = repayment + deficit RATIFIÉ ». ADR-U4 D1 (l.32-39) idem.
- **Unité / décimales** (`scripts/census/u4-scores.mjs:36,68`) : `USDT_DECIMALS = 6n` ; USDT natif
  (6 déc.) × `getAssetPrice` (base 8 déc.) / 1e6 = base 8 déc. **Recalcul de première main** :
  `4 428 191 052 × 100 567 000 / 10⁶ = 445 329 889 526` (exact) ⇒ Y = `277 615 428 066 + 445 329 889 526
  = 722 945 317 592`. Concorde avec la ligne fixture (`dLine.y = 722945317592`, `yhat=0`, `score=Y`).
- **Bloc de prix pré-enregistré** : `usdtPrices[String(p.first_block)]` avec `first_block=23550406`
  (ligne réalisée, C-12) ⇒ `100567000`. Le bloc D-1 `23550879` (`100315000`) n'est PAS utilisé pour la
  réduction (mutant N2 le prouve : forcer 23550879 ⇒ ROUGE).
- **Fail-closed** (mutants A/B/C ROUGES, ci-dessous) : `u4-scores.mjs:64` throw si `debt_asset` ≠ USDT ;
  `:67` throw si prix USDT absent ; `:96` throw si LT e-mode absent (l'ancien `?? wethBaseLT` silencieux
  est SUPPRIMÉ). Jamais un Y silencieusement amputé.
- **AUCUNE autre ligne à déficit manquée (tous tokens)** — mesuré sur `U3-realized.jsonl` : 4 lignes à
  `deficit_native>0`, toutes e2 : 3 CRV (`deficit_base` déjà renseigné en U-3 ⇒ ajouté via `db =
  BigInt(p.deficit_base)`) + **1 USDT** (`0x15391e…`, `deficit_base=0`, résidu `deficit_base_no_price`
  ⇒ complété). **Lignes à `deficit_native>0 ∧ deficit_base==0 ∧ non flaggées = 0.** `deficit_lines_
  priced_from_usdt = 1` (asserté `ukemi-u4-scores.test.ts:60`).
- **INVARIANTS recalculés de première main** (`recompute.mjs`, hors driver) : **n=797, p=⌈798·0,99⌉=791,
  q̂=364550606513851** (791ᵉ plus petit score ; 6 strictement au-dessus, 1 = q̂, 790 en dessous ;
  couverture 791/797 = **99,25 %**), **`calib_digest = 267cd9918abde0ee6de23f71c1dc0852d545e00824107c3
  dfb51f84bb943ea4b`**. Census : eligible_static_b0 64, eligible_under_De 770, liquidated_not_in_book 4,
  liquidated_not_eligible_under_De 23, eligible_not_liquidated 608, emode_nonzero_in_cell 42, clamps 0.
  **TOUS identiques au PLI/ADR.**
- **Invariance C-V-2 PROUVÉE** : rejouer avec l'ancien Y (déficit omis) ⇒ `calib_digest = 668ab214…`
  (l'ANCIEN digest, exact, celui vu par la G2 fraîche) avec **n/p/q̂ INCHANGÉS** ; l'ancien Y de
  `0x15391e…` = `277615428066` (remboursement seul). Le score complété `722 945 317 592` << q̂
  (`3,65e14`) ⇒ n'affecte pas le 791ᵉ. Conforme à la thèse « seul `calib_digest` re-pin ».
- **3 fixtures régénérées par le driver committé** (`u4-reduce.mjs --raws-dir F:/PRODUITS/…/u4-raws
  --out <scratch>`) ⇒ LF sha256 **regen == committé == pin PROVENANCE-u4.md** pour les 3
  (`U4-book 743e9499…`, `U4-oracle-path-e2 970357…`, `U4-scores-e2 8b84e095…`).

### A.2 — C-V-1 (export) : VÉRIFIÉ (défaut résiduel = C-G2D-1)

- **Suite complète `npm run test`** (offline, TMP + cache npm sur F:, `--test-force-exit`) :
  - **α-seul-corrigé** = `git archive 041a902` + les 3 fichiers α-fix (`ukemi-u4-governance.test.ts`
    nouveau, `ukemi-u4a.test.ts` modifié, `export-exclude-tests.json` 2 entrées) = **437 / 437 / 0**
    (test 42 `export_public_no_governance_no_french` VERT). == claim checkpoint-2.
  - **arbre final** `16640ee` = **442 / 442 / 0** (test 42 VERT). == claim checkpoint-2.
  - `git archive c137af1` littéral = **439/440** (test 42 ROUGE) — c'est α+β+α-fix, pas α-seul
    (C-G2D-2).
- **Mécanisme d'exclusion = LE BON, pas un skip silencieux** : `scripts/export-exclude-tests.json`
  (liste `tests[]`) est le mécanisme « governance-only » du D7 addendum : `export-public.mjs:126-142`
  le charge **fail-closed** (JSON absent/illisible/`tests` non-array ⇒ exit 1) ; `:261` exclut ces
  chemins ; `:372` les inscrit dans `manifest.excluded_tests` ; test 42 (d) `export-public.test.ts:214-
  219` **assère `manifest.excluded_tests == cfg.tests`**. C'est DISTINCT du skip silencieux
  `DORMANT_APP_TEST` (`export-public.mjs:116,262`). Mesuré : `excluded_tests = [ukemi-u4-governance,
  ukemi-u4-scores, s2]`.
- **Les fixtures u4/* ET PROVENANCE-u4.md ENTRENT dans l'export** (MESURÉ, pas raisonné —
  `node scripts/export-public.mjs --out <scratch>`) : `apps/sentinel` est exporté PACKAGE-STYLE
  (`APP_PACKAGE_DIRS`, `export-public.mjs:41`) ⇒ walk complet de `apps/sentinel/test/**`, dont
  `fixtures/ukemi/u4/**`. La sortie contient `U4-book-23545087.json` (5 957 519 o au manifeste),
  oracle, scores, PROVENANCE-u4.md — tandis que `ukemi-u4-scores.test.ts` + `ukemi-u4-governance.test.ts`
  sont ABSENTS (exclus). ⇒ **fixtures orphelines** (aucun test exporté ne les consomme). PROVENANCE-u4.md
  publie `F:\PRODUITS\…` (grep mesuré). **AUCUNE vraie clé fuitée** : le seul hit du grep
  `https?://|chainstack|p2pify|api-key` est la ligne 44 de PROVENANCE-u4.md qui **contient littéralement
  le motif** (auto-référence, faux positif), 0 `://`+clé. ⇒ **C-G2D-1** (correction non bloquante).
- **Addendum ADR-M004 D7 sexies (l.125-152) dit EXACTEMENT ce qui est fait** : 2 tests exclus (pourquoi :
  ENOENT prereg / TS2307 reducer non whitelisté) ; `scripts/census/**` non whitelisté (Ukemi upcoming) ;
  calibration non rejouable au miroir public (item formé) ; fixtures + PROVENANCE-u4.md (« cites a local
  raws path on the F: volume ») copiées via le walk package-style, **laissées Option A**, orphelines
  comme u3 ; jamais `STRUCTURAL_BLACKLIST` ; contrainte de disjonction α/β. **Description fidèle** — mais
  elle documente le défaut sans le corriger (C-G2D-1).

### A.3 — Points ciblés (fichier:ligne, confirmés)

- **Fail-closed `?? wethBaseLT`** : `u4-scores.mjs:95-96` — l'ancien fallback silencieux est remplacé
  par `?? emodeLT[String(emode)]` puis `throw` si `undefined` (C-3). Mutant C ROUGE.
- **Épinglage 69/107** : `ukemi-u4-scores.test.ts:103` `preregLE===69`, `:104` union `===77` (forme
  pré-enregistrée, NON enregistré, regression-guard). Mutant « 69→64 » ROUGE.
- **Assertion 12 e-mode non-cat-1** : `ukemi-u4-scores.test.ts:72-73` (42 in-cell, dont 12 non-cat-1
  {2,11,19,23}) — résiduel C-3 déclaré (ADR-U4 l.90-92).
- **Libellé POST-HOC** : `ukemi-u4-scores.test.ts:106-113` (106/107 ∈ série = diagnostic POST-HOC, « ne
  valide PAS H6 », borne p_min seulement) ; ADR-U4 l.97-98.
- **Condition de l'encadrement p_min (C-V-5)** : `ukemi-u4-scores.test.ts:115` (borne médiane tient
  UNIQUEMENT si toute valeur servie ∈ events ∪ {p0}, 179 blocs biaisés liquidations) ; ADR-U4 l.100-104.
- **`u4-redraw.mjs`** (revue statique, avant l'appel) :
  - `selectIndices` PURE (l.34), graine dérivée de `book_digest` (l.79-80 ; suffixe `:updates` distinct),
    indices DISTINCTS (Set, l.40) et BORNÉS (`% BigInt(n)`, l.39). Triplets pinnés reproduits hors ligne :
    `[3443,12793,15952]` / `[131,68,114]`. Mutants CP2-D et N3 ROUGES.
  - `--max-calls ≤ 60` **fail-closed en DEUX endroits** : CLI (l.60, throw si `>60` ou `≤0`) ET runtime
    (`makeBudgetedCall`, `record.ts:146-147`, rejette avant l'appel, compté avant round-trip) ; `--k ≥ 3`
    exigé (l.59).
  - **N'écrit JAMAIS dans le cache** : lecture par `readFileSync`+`parseResumeLines` (l.76, `resume.ts`
    pur) ; `writeFileSync` ne vise QUE `--out` (l.117). Confirmé live (sha/taille cache before==after).
  - **Aucun secret imprimé** : rapport en LABELS (`operatorLabel`, `record.ts:39-41`, archive→`archive-env`) ;
    `scrubUrls` (`record.ts:33`) nettoie **tous** les chemins d'erreur de `makeDefaultCall` (l.95,102,106,
    114,123) ; `NoQuorumError` (`rpc2.ts:184`) embarque `lastErr.message` mais celui-ci est déjà scrubé ;
    `providerOf` = domaine, jamais l'URL à clé. `u4-redraw.mjs:123` imprime `String(e)` mais sur message
    scrubé. Confirmé live : 0 fuite malgré `CHAINSTACK_ETH_URL` SET et archive-env utilisée (2 appels).
  - **Exclusion d'opérateurs** : `applyExcludeOperators` (`record.ts:46-49`) + garde quorum-2 fail-closed
    (l.87, `< 2 distincts` ⇒ throw). `mevblocker.io` exclu = **dégradé MESURÉ** (`u4-oracle-path.mjs:56-57`
    l'exclut en dur ; provenance course `excluded_operators=[mevblocker.io]`, D-5 : 34 % d'erreurs à 200 ms).
    `publicnode.com` = **hors pool** (`rpc2.ts:250-251` : eth_call drpc/mevblocker/blastapi/nodies ; getLogs
    drpc/mevblocker/tenderly) ⇒ `--exclude-operator publicnode.com` = no-op (capacité CONF-SRC-1). La
    commande de la mission n'exclut que `mevblocker.io` (suffisant : eth_call reste 3 distincts, getLogs 2 +
    archive-env).

### A.4 — Mutants (11 ; source, copie scratch `tree-final`, restauration par buffer + sha PRE==POST, JAMAIS `git checkout`)

| # | mutant | cible | résultat |
|---|--------|-------|:---:|
| CP2-A | complétion Y désactivée | u4-scores.mjs:61 | **ROUGE** (fail 3) |
| CP2-B | throw prix USDT retiré | u4-scores.mjs:66 | **ROUGE** (fail 1) |
| CP2-C | fail-closed LT e-mode retiré (`?? wethBaseLT`) | u4-scores.mjs:95 | **ROUGE** (fail 1) |
| CP2-D | graine re-tirage ignorée (`[0,1,2]`) | u4-redraw.mjs:39 | **ROUGE** (fail 1) |
| A4-Y | déficit_base abandonné | u4-scores.mjs:60 | **ROUGE** (fail 2) |
| A4-De | p_min ignoré (`hfMin<WAD`→`hf0<WAD`) | u4-scores.mjs:107 | **ROUGE** (fail 2) |
| A4-LTW | LT_W←0 | u4-scores.mjs:93 | **ROUGE** (fail 2) |
| 69→64 | `u.block <= b`→`< b` | ukemi-u4-scores.test.ts:92 | **ROUGE** (fail 1) |
| N1 (neuf, UNITÉ) | `USDT_DECIMALS 6n→8n` | u4-scores.mjs:36 | **ROUGE** (fail 2) |
| N2 (neuf, BLOC) | prix USDT au bloc 23550879 (D-1) | u4-scores.mjs:66 | **ROUGE** (fail 2) |
| N3 (neuf, GRAINE) | séparateur `${seed}:${ctr}`→`.` | u4-redraw.mjs:38 | **ROUGE** (fail 1) |

**11/11 ROUGES ; 11/11 restaurés byte-exact (sha PRE==POST).** N1 prouve l'unité (6 déc.), N2 le bloc
pré-enregistré (23550406, pas 23550879), N3 la dérivation de graine — exactement ce que la mission
demande de garantir par mesure, pas par raisonnement.

### A.4bis — R-25 (pathspec `STAT=` de `.github/workflows/ci.yml`, `CHANGED = ins + del`, borne 1205)

Diff de contenu par `git diff --no-index --numstat` (arbres `git archive`, node_modules retiré),
exclusions pathspec ci.yml appliquées en JS :
- **α cumulé** (b1302db → α-final = 041a902 + α-fix) = **948** (record.ts 296, ukemi-u4a.test 230,
  resume 157, u4-probe 152, rpc2 47, abi 37, governance-test 19, ukemi-record.test 6, export-exclude 4).
  == annoncé, **≤ 1205**.
- **β cumulé** (α-final → final) = **810** (u4-scores 177, ukemi-u4-scores.test 165, u4-oracle-path 163,
  u4-redraw 124, PROVENANCE-u4.md 75 [.md hors docs/ ⇒ COMPTÉ], u4-reduce 67, u4-scores.d.mts 32,
  u4-redraw.d.mts 5, export-exclude 2). == annoncé, **≤ 1205**. (Exclus mesurés : les 3 fixtures data u4,
  + 6 `.md` sous `docs/`.)
- Cross-check : `git diff --shortstat b1302db 16640ee -- <pathspec>` = **1703 ins + 53 del = 1756** (==
  PLI « total 1756 »). α+β = 1758 ; **écart +2 = `export-exclude-tests.json` compté dans les deux plis**
  (α 4 l., β 2 l. ; direct 4 l.) — C-G2D-3. **Ni α ni β ne dépasse 1205 : pas de STOP.**

### A.4ter — Oracles (arbre final `16640ee`, offline)

| oracle | résultat |
|---|---|
| `npm run test` COMPLET (α-seul / final) | **437/437** / **442/442** |
| `typecheck` (tsc --noEmit) | **exit 0** |
| `lint:ratchet` | **69/69** |
| `gate:vocab` | **OK (174 fichiers, 0 claim interdit)** |
| `export:check` | **OK (0 chemin interdit, 0 français non exempté ; tous scopes)** |
| `lang:gate --scope sentinel` | **OK (0 hit)** |
| `no_secret_in_repo` + `bell_no_secret_in_repo` | **VERTS** (dans la suite 442) |
| `series_pinned_are_declared_and_hashed` | **VERT** (dans la suite 442) |

---

## B. CONTRÔLE INDÉPENDANT LIVE pré-enregistré (D-12) — SEUL appel réseau

Commande exacte de la mission, lancée depuis `tree-final` (= `git archive 16640ee`), sortie hors dépôt :
`node scripts/census/u4-redraw.mjs --cache …/U4-inputs.jsonl --block 23545087 --k 3 --max-calls 60
--prereg-sha 9209cdab… --exclude-operator mevblocker.io --out …/U4-redraw.json`.

**Pré-vol hors ligne** (avant l'appel) : `--max-calls 60` fail-closed (double garde) ; l'outil n'écrit
jamais le cache (lecture partagée) ; aucune URL à clé imprimable (labels + scrubUrls) ; cache
pré-épinglé `sha 09968df1…`, `64 534 599 o` (== pin PROVENANCE-u4.md, 138 711 lignes). Triplets,
clés getUserAccountData (`0xbf92857c`+addr@23545087 présentes) et blocs d'updates confirmés en cache.

**Résultat** (`REDRAW_EXIT=0`, `recorded_at_utc 2026-09-21T01:56:48Z`) :
- **`all_match: true`** — **3 comptes** (idx 3443/12793/15952 = `0x36fe79cc…`, `0xcbe23f7d…`,
  `0xfdcad570…`) : hex `getUserAccountData` LIVE **== cache byte-à-byte** ; **3 `AnswerUpdated`** (blocs
  23551584 / 23549988 / 23550743 ; prix 385343492860 / 365452783400 / 383302920000) : le prix enregistré
  ∈ logs LIVE (le bloc 23549988 est l'un des 3 multi-update de D-9 — le match tient). **AUCUN écart.**
- **Appels consommés = 13** (`drpc.org 5, blastapi.io 3, tenderly.co 3, archive-env 2, nodies 0`), < 60.
  **Cumul lot = 278 987 + 13 = 279 000 < 300 000.** `excluded_operators=[mevblocker.io]`.
  **Reconstruction (compatible ordre du pool + `cooldownUntil` 25 s, `rpc2.ts:180`)** : 3 ethCall
  drpc+blastapi (6) ; getLogs#1 drpc+tenderly (2) ; **getLogs#2 : drpc échoue (compté, benché) →
  tenderly+archive-env** ; getLogs#3 : drpc en cooldown, skippé → tenderly+archive-env ⇒ **archive-env
  (Chainstack) a porté 2 des 3 contrôles `AnswerUpdated`** (load-bearing). La **cause de l'échec drpc
  est NON ENREGISTRÉE** : `u4-redraw.mjs:88` construit `makeDefaultCall()` **sans `onRpcError` ni
  retry** (contrairement à `u4-oracle-path.mjs:60`, retries 3 + sink). Ce n'est **pas un défaut** (les 3
  matches tiennent, quorum concordant) mais une **amélioration d'outil à former** : sink d'erreurs
  par-opérateur dans le rapport de re-tirage (déclencheur : ré-usage G2-delta ; propriétaire
  orchestrateur). À noter pour le suivi RU Chainstack.
- **Cache byte-INCHANGÉ** : sha/taille after == before (`09968df1…` / `64 534 599`). L'outil ne l'a pas
  touché.
- **Fuite = 0** : grep `https?://|chainstack|p2pify|api-key|CHAINSTACK` sur `redraw-run.log` ET
  `U4-redraw.json` = 0 (bien que `CHAINSTACK_ETH_URL` SET et archive-env utilisée 2×).
- **Nouveau brut hors dépôt pinné** (convention PROVENANCE-u4.md §2 ; ABSENT de la raws-dir avant le run,
  vérifié au `ls` initial) : `U4-redraw.json` **sha256 `c01f75ce68dba297811b5269082aeeaa9e423e4aebf2276
  60582020f038119b3`, 1 392 o** — pour recompute au checkpoint-2 bis.
- **Confirmation supplémentaire (exit 0)** : `u4-redraw.mjs:63-64` revérifie `docs/PLAN-u4-prereg.md` de
  `ROOT` = tree-final = **`16640ee`** contre `9209cdab…` ⇒ **confirmation INDÉPENDANTE que le prereg est
  INCHANGÉ à HEAD** (exigé mission « inchangé ; sha LF `9209cdab…` »).

**Pourquoi `mevblocker.io` doit être exclu** : dégradation fournisseur MESURÉE (D-5, 2026-09-20 : 34 %
d'erreurs à 200 ms) ; codé en dur dans `u4-oracle-path.mjs:56-57` et publié `excluded_operators` de la
course book. `publicnode.com` : hors pool ⇒ no-op (capacité CONF-SRC-1, non requise ici). L'exclusion
laisse eth_call 3 distincts (drpc/blastapi/nodies) + archive-env, et getLogs 2 (drpc/tenderly) + archive-env
⇒ quorum-2 tenu.

---

## Chiffres recalculés (récapitulatif)

| grandeur | recalculé G2-DELTA | PLI/ADR | == |
|---|---|---|:---:|
| n | 797 | 797 | ✓ |
| p = ⌈(n+1)·0,99⌉ | 791 | 791 | ✓ |
| q̂ | 364550606513851 | 364550606513851 | ✓ |
| calib_digest | 267cd9918abde0ee6de23f71c1dc0852d545e00824107c3dfb51f84bb943ea4b | 267cd991… | ✓ |
| déficit prisé (USDT) | 445 329 889 526 | 445 329 889 526 | ✓ |
| Y complet 0x15391e14 | 722 945 317 592 | 722 945 317 592 | ✓ |
| ancien digest (Y omis) | 668ab214… (n/p/q̂ inchangés) | 668ab214… | ✓ |
| couverture ≤ q̂ | 791/797 = 99,25 % | 99,25 % | ✓ |
| lignes déficit e2 manquées | 0 | — | ✓ |
| fixtures regen==commit==pin | 3/3 | — | ✓ |

---

## Provenance / reproduction

- Modèle résolu : **`claude-opus-4-8[1m]`** (R-1). Rôle : G2-DELTA, contexte frais, R-20 (aucun commit,
  aucun workflow), R-21 (écrit pour vérification adversariale).
- Worktree `F:\Monark-wt-u4a` HEAD `16640ee`, `git status --short` **vide PRE et POST** (jamais édité).
- Bruts hors dépôt : lecture partagée (`readFileSync`) ; SEULE écriture hors dépôt = `U4-redraw.json`
  (sortie explicite de la mission). Rien sur C: (TMP + cache npm sur F:).
- Rejeu : `F:\tmp\u4a\g2d\{recompute.mjs (n/p/q̂/digest/invariance), preflight.mjs (triplets/cache),
  r25.mjs (R-25), mutants.mjs (11 mutants), redraw-run.log, ns-alpha.txt, ns-beta.txt}` ; arbres
  `tree-{base,alpha,final,c137af1}` (git archive) ; logs `test-{alpha,c137af1,final}.log` ;
  `export-out/` (export mesuré) ; `regen/` (3 fixtures régénérées).
- Budget : cumul lot après contrôle = **279 000 < 300 000**.
