Modèle résolu : claude-opus-5-5[1m]

# RUNBOOK — course Ukemi U-4b-1b (épisode WETH FRAIS) — ordonné, prêt à exécuter — 2026-09-22

> **Provenance (R-1/R-20/R-21).** Worker `claude-opus-5-5[1m]` (préfixe attendu `claude-opus-5-5`, décision 133 appliquée, `docs/CHANTIERS.md:811-814` ; le prompt système du worker nomme encore `claude-opus-4-8` : écart de roster à trancher par l'orchestrateur au contrôle R-1), effort max, rédigé le 2026-09-22 (horloge `date -u` 19:45:30Z au début de l'écriture), mission `F:\tmp\course-ukemi\MISSION-RUNBOOK.md`. Base LECTURE SEULE : `F:\Monark` `lot/etude-suite` @ `b130852` (HEAD a avancé pendant la mission, `7b99737`→`b130852`, deux commits docs-only `CHANTIERS.md` + `CHECKPOINT1-lot-a9-outille.md` ; sha du prereg inchangé) ; `F:\Monark-wt-u4b1b3` `lot/u4b-1b-3` @ `801859f` (lot en vol, lecture seule). **Aucune écriture dans le dépôt ni dans un worktree, aucun appel réseau, aucune exécution de course.** Lectures locales hors dépôt : provenance du brut discover v2 (pas les records), journaux `F:\course-ukemi\**\*.log`, LISTE (noms, tailles, mtimes) de `F:\monark-ledger\` (aucun contenu de ledger ouvert), fixtures e2 committées (`apps/sentinel/test/fixtures/ukemi/{u3,u4,u4b}`). Les contrôles de l'annexe C ont été exécutés hors ligne (0 réseau) sur ces fixtures ou sur des fichiers synthétiques du scratchpad du worker. Réviseur = orchestrateur (R-21). R-20 : aucun commit, aucun workflow.
>
> **Écart de source de mission (mesuré).** `docs/G7-lot-ukemi-retry-1.md` **n'existe pas** (`ls docs/` ; `git log --all -- docs/G7-lot-ukemi-retry-1.md` vide). Le G7 UKEMI-RETRY-1 vit dans `docs/CHANTIERS.md:774-779` et dans le message de la fusion `f6442fe` (« G7 921/921/0/0 ») ; la précondition recorder est écrite à `CHANTIERS.md:777` et `docs/adr/ADR-U4b-calibration-episode-frais.md:616-619` ; « précondition du départ » = l'étape recorder (`docs/CHECKPOINT2-lot-ukemi-retry-1-re.md:53`).
>
> **Sha du prereg recalculé** (régime B, blob HEAD) : `git -C F:/Monark show HEAD:docs/PLAN-u4b-prereg.md | tr -d '\r' | sha256sum` = `1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49` (mesuré à `7b99737` et à `b130852` ; fichier déjà LF, sha brut identique) = SIDECAR `docs/course-ukemi/SIDECAR-prereg-u4b-1b-2026-09-22.md:8`. Commit du prereg `a75dbf1` (SIDECAR `:7`).

---

## A. Conventions (valent pour toutes les étapes)

- **Shell** : Git Bash de l'orchestrateur ; toute commande commence par `cd F:/Monark &&` (scripts invoqués par chemin relatif) ; étapes 2c-bis et 5 : `cd <EXEC_TREE_E2> &&`, arbre d'exécution épinglé à `<HEAD_E2>` (« Gel d'outillage » ci-dessous ; re-checkpoint-2 C-V4b-2). Le prereg est résolu depuis la racine du script, pas du cwd (`record.ts:230,263` ; `u4b-select-episode.mjs:33,171` ; `u4-oracle-path.mjs:32,46` ; `u3-realized.mjs:474,483`). Chemins hors dépôt écrits `F:/course-ukemi/...`.
- **ENV-8** (toute vérification et tout pas keyless), littéral (prereg `:380` ; `F:\tmp\u4b1b3\MISSION-PLI.md:3`) :
  `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`
- **ENV-7** (UNIQUEMENT l'étape 3, recorder temps 1 et temps 2), littéral :
  `env -u HELIUS_API_KEY -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`
  → conserve **`CHAINSTACK_ETH_URL`**, la clé Chainstack que le prereg requiert pour la jambe payante `chainstack` du recorder (§5a `:208` ; « La course LIVE du recorder utilise le vrai env », `:190`). Seul lecteur de la clé : le transport gardé (`packages/rpc-guard/src/transport.ts:105-110`) ; `record.ts` n'en lit aucune (`record.ts:21-24,318`). **Jamais affichée** (contrôle de présence seul, §0.4). Le labeler la scrubbe explicitement (§5d `:295`) ⇒ ENV-8.
- **Ledger — UNE valeur pour tous les pas gardés** (décision 121 « un seul ledger de cycle », prereg `:158`) : `--ledger-dir F:/monark-ledger/chainstack-2026-09-19 --cycle chainstack-2026-09-19`. Preuves : le garde crée seulement `<ledger-dir>/<cycle>/` sous un parent pré-existant (`packages/rpc-guard/src/ledger.ts:72-79` ; `scripts/census/u4-guard.mjs:98-106`) ; les pas déjà joués (discover v2, fill-ts ×3) ont écrit dans `F:\monark-ledger\chainstack-2026-09-19\chainstack-2026-09-19\{drpc.org,mevblocker.io,nodies.app,pocket.network,tenderly.co}.{jsonl,head}` (liste mesurée ; aucun `chainstack.jsonl`, aucun `.lock`) ; c'est la ligne d'instance du prereg `:265`, contredite par le commentaire `:229-230` (« `--ledger-dir F:\monark-ledger` … à désambiguïser »). **[à confirmer par l'orchestrateur — R-C]**. Un autre `--ledger-dir` ouvrirait des ledgers vierges et placerait `chainstack.jsonl` hors du dossier que lira le reconcile (§7).
- **Deux formats de `--method-caps`** : recorder = `k=v,k=v` (`record.ts:148-159`) ; `--fill-ts`, `--check-version`, prober = objet JSON `'{"méthode":n}'` (`u4b-select-episode.mjs:277-279,329-331` ; `u4-guard.mjs:90-93`, valeurs entières > 0 exigées côté prober). **Inertes pour les opérateurs keyless** : cap par méthode et cap de coût ne s'appliquent qu'aux payants (`packages/rpc-guard/src/client.ts:111-119`) ; seul `--max-calls` borne un pas keyless (`client.ts:110`).
- **Instances** `<…>` : valeurs lues à l'exécution, jamais devinées (`<EP>` = `episode.id`, `<B0>` = `episode.B0`, `<RAWLOGS_SHA>` = `rawlogs_sha256`, lus par C-2). `[à confirmer par l'orchestrateur]` : tout flag/valeur que le code ne tranche pas, ou tout écart à une ligne figée du prereg.
- **Aucun commentaire en ligne dans les commandes** : les lignes figées du prereg portent des `\   # …` qui rompent la continuation bash (le `\` échappe alors l'espace, le `#` ouvre un commentaire) ; ici chaque commande est copiable telle quelle, les notes sont sous la commande.
- **Journal** : chaque commande longue redirige `> <log> 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> <log>` sous `F:/course-ukemi/logs/` (lancer en arrière-plan ; le code de sortie est lu dans le log).
- **Gel d'outillage pendant la course** (« Aucun changement d'outil pendant une course (D-n) », `CHANTIERS.md:769`) : noter `git -C F:/Monark rev-parse HEAD` à l'étape 1 (= `<HEAD_E1>`) ; avant chaque étape suivante, `git -C F:/Monark diff --stat <HEAD_E1>..HEAD -- . ':(exclude)docs'` DOIT être vide (seuls les commits docs de l'orchestrateur — sidecar, CHANTIERS — sont licites). Non vide ⇒ STOP + D-n.
  - **D-n datée 2026-09-23 (ruling I-6, `docs/CHANTIERS.md:935` ; re-checkpoint-2 C-V4b-2, `docs/CHECKPOINT2-lot-u4b-1b-4-4b.md:26`)** : l'étape 1 est partie de `<HEAD_E1>` = `f28a184`, qui ne contient pas U-4b-1b-4 (ordre de fusion cp-1 C-7 non tenu ; `error_origin` orchestrateur) ; pas de relance (l'étape 1 n'importe aucun fichier du lot, mesuré au G2). Pour toute étape non encore commencée à partir de 2c-bis, la référence du gel est **`<HEAD_E2>`** = commit portant la fusion de U-4b-1b-4 et de U-4b-STATS-1, consigné par la ligne SIDECAR « gel `<HEAD_E2>` » écrite AVANT toute étape ≥ 2c-bis non commencée ; le contrôle devient `git -C <EXEC_TREE_E2> diff --stat <HEAD_E2>..HEAD -- . ':(exclude)docs'` (vide). Les étapes 2c-bis et 5 s'exécutent depuis **`<EXEC_TREE_E2>`**, worktree détaché à `<HEAD_E2>` (calque R-SP-C ; `git -C <EXEC_TREE_E2> rev-parse HEAD` == `<HEAD_E2>`) ; 0.5 y est rejoué avec pour attendu les chemins sous `<EXEC_TREE_E2>`, et 0.6 y est rejoué. Le recorder (étape 3) tourne depuis l'arbre épinglé déclaré au Sidecar 3. Toute autre fusion non docs pendant la course = D-n datée au SIDECAR avec re-mesure de 0.6 (`docs/CHECKPOINT2-lot-garde-fsync-1.md:89`).
- **Ancre / sidecar** : aucune décision OTS ne couvre Ukemi (mesuré : seul `docs/course-bell/ANCHORS.md` existe, décision 124 = Bell). L'« ancre » Ukemi = lignes datées ajoutées **par l'orchestrateur (R-20)** au SIDECAR daté `docs/course-ukemi/SIDECAR-prereg-u4b-1b-2026-09-22.md` (ligne `:14` « Découverte / brut / sonde go-no-go | à renseigner au fil de la course ») + une puce `docs/CHANTIERS.md`. L'objet ancré = la chaîne de sha : brut → sidecar fill-ts → sélection → A-rawlogs/events → book → labels → raw prober → fixtures réduites → registre.
- **Provenance des artefacts** : les scripts écrivent un littéral `model: "claude-opus-4-8[1m]"` (`record.ts:380,411,440` ; `u4-oracle-path.mjs:188,204` ; `u3-realized.mjs:667`) = auteur du code, PAS l'exécutant. Chaque ligne de sidecar consigne l'exécutant réel, l'heure `date -u`, le HEAD (OBS-1).
- **Arborescence hors dépôt** : `F:/course-ukemi/{discover,select,select-replay,record,label/out,label/raws,prober/raws,reduce,offline,reconcile,probe,logs}`.

---

## B. Rulings requis AVANT exécution (liste fermée ; chacun gate une étape ; aucun n'est tranché par ce runbook)

| # | Objet | Preuve (lue / mesurée) | Options | Gate |
|---|---|---|---|---|
| R-A | U-4b-1b-3 + pli (C-V-1..C-V-6) → G7 → fusion | À HEAD `b130852`, `runFillTs` n'a pas de clamp : `tsOf` sonde tout bloc manquant, y compris `> to_block` (`u4b-select-episode.mjs:349-356`, blob `225d2304…`) ⇒ même STOP « malformed block » (`CHANTIERS.md:772`). Clamp `+Infinity` + sidecar `partial/complete` reprenable seulement sur `801859f` (diff mesuré). C-V-1 (verrou tenu après un refus de reprise, `docs/CHECKPOINT2-lot-u4b-1b-3.md:27,37`) = pli dû (`CHANTIERS.md:807`) ; mission de pli en cours (`F:\tmp\u4b1b3\MISSION-PLI.md`, aucun `RENDU-PLI.md` à la rédaction ; worktree propre à `801859f`). | attendre le G7 (statut : EN ATTENTE) | 1 |
| R-B | opérateurs, ordre, intervalle, budget du `--fill-ts` | Mission : `drpc, mevblocker, nodies`. Ligne figée §5b-fill `:246` : `drpc.org,mevblocker.io,tenderly.co`. Ledger : 3ᵉ essai SANS tenderly (mtime `tenderly.co.jsonl` 18:09 locale = fin de l'essai 2, 17:09:11 UTC `F:\course-ukemi\select\fill-ts-2.log` ; `drpc/mevblocker/nodies` 18:23 locale = fin de l'essai 3, 17:23:38 UTC `fill-ts-3.log` ; inférence : `unlockAll` écrit une ligne dans le ledger de CHAQUE opérateur demandé, `u4-guard.mjs:174-181`). La donnée ne dépend pas des témoins : quorum-2 sur le HASH du bloc (`rpc2.ts:219-221`, désaccord ⇒ throw `:180`). | (a) jeu de la mission, D-n au PLI ; (b) ligne figée | 1 |
| R-C | imbrication `--ledger-dir` | §A « Ledger » | (a) valeur observée `F:/monark-ledger/chainstack-2026-09-19` (continuité des ledgers keyless) ; (b) `F:/monark-ledger` (ledgers vierges, D-n) | 1,2,3,5,7 |
| R-D | fraîcheur du floor | `<FLOOR-CHAINSTACK>` = « lecture n°2 … IMMÉDIATEMENT avant le go » (prereg `:172`) ; n°2 = **12 916 RU** au 2026-09-22 13:56:23 UTC (`docs/course-ukemi/FAITS-floor-chainstack-n2-2026-09-22.md:3,10` — lecture première main de l'orchestrateur, fichier [lu] par le worker) ; le recorder ne partira qu'après R-A et les étapes 1-2 ; Narabi consomme Chainstack sur le même compte (créneaux 00:30/03:30/06:30/09:30 UTC « à RECONFIRMER », prereg `:168` ; décision 121 `:158`). | (a) re-lecture sur place juste avant l'étape 3 (nouvelle instance, aussi `--before` du §7) ; (b) conserver 12 916 (déclaré) | 3,7 |
| R-E | `--from-block` du recorder | Ligne figée §5a `:207` : `--from-block <max(reserveInitBlock, F)>` ; `docs/PLI-lot-u4a.md:124,129` : « jamais `--from-block` (borner la fenêtre change la population — U-1a « sous-ensemble, digest différent ») » ; `apps/sentinel/src/ukemi/book.ts:59-67` ; e2 a couru sans le flag (`PLI-lot-u4a.md:130`). `reserveInitBlock` aWETH = `16496792` (`apps/sentinel/src/ukemi/clusters.ts:32`). | (a) supprimer la ligne ; (b) `--from-block 16496792` (= `max(16496792,16496792)` ; population, `from_block` du book et `book_digest` identiques à (a), `book.ts:109-112,180,188` ; lettre de §5a respectée). Toute F > 16496792 est interdite. | 3 |
| R-F | budgets du recorder | prereg §Sonde `:179-180,187` ; plafonds `:341` ; `--max-ru ≤ 16 000 000 − FLOOR` = borne PROCÉDURALE (ruling Q7, prereg `:212`), pas un garde-code : le code refuse dynamiquement `cycle_cap` quand `priorFrozen + run + coût > 16 000 000` (`client.ts:118` ; `priorFrozen = max(floor, Σ attempted)`, `client.ts:87`, `ledger.ts:128` ; cap `transport.ts:23`) et exige `floor ≤ cap` (`client.ts:74`) | instances `<MAX_RU>`, `<MAX_CALLS_T1>`, `<MAX_CALLS_T2>`, `<CAP_CALL>`, `<CAP_LOGS>`, `<CAP_BLOCK>` | 3 |
| R-G | sonde (d) `s_cutoffTime()` @B_fresh | exigée « sous garde » avant la course (prereg `:186` ; E-I-7 = OUI, `docs/G0-lot-u4b.md:301`) ; **aucun outil** : `grep -rn -i "cutoffTime" --include=*.mjs --include=*.ts` sur le dépôt = 0 occurrence (mesuré ; seuls des `.md`) ; l'adresse cible n'est dans aucun code | (a) lot outillage hors gel (sous-commande gardée, calque `--check-version`) ; (b) ruling : sonde (d) reportée, D-n déclarée ; jamais un appel improvisé hors garde ; **tranché (a) — livré par U-4b-1b-4** : `scripts/census/u4b/u4b-probe-cutoff.mjs` (scan `CutoffTimeSet`, règle de l'ADDENDUM §1, écarts de l'ADDENDUM-2), étape 2c-bis, contrôle C-12 | 3 |
| R-H | dérivation de `--usdt-blocks` | Le helper documenté (`usdtBlocksFromLabelerDeficit(U3-deficit.jsonl)`, prereg `:262-263`) filtre `kind === "deficit"` (`u4-oracle-path.mjs:79`) ; `U3-deficit.jsonl` porte `kind ∈ {in_event, bad_debt_other_reserve, window_other, positive_control}` (`u3-realized.mjs:254-257`). **Mesuré sur la fixture e2** : `{window_other: 24, in_event: 4}` ⇒ helper = `[]` ; appliqué à `U3-inputs.jsonl` il rend les 7 blocs `DeficitCreated` USDT `[23549984,…,23551670]` SANS `23550406`. Or le scoreur gelé lit `usdtPrices[first_block]` des lignes `U3-realized` à `residual ∋ deficit_base_no_price` (`u4b-scores.mjs:109-116`) ; e2 : `first_block` = `23550406`, présent dans la fixture (`U4b-oracle-path-e2.jsonl` : `usdt_prices {"23550406","23550879"}`). Le test du helper utilise une ligne synthétique `kind:"deficit"` (`apps/sentinel/test/u4b-oracle-path.test.ts:196-202`), pas la forme réelle. Conséquence sans correction : `--usdt-blocks` omis ⇒ `u4b-scores` jette « no USDT price at block … » (`:115`) à l'étape 6. | dérivation C-7 (annexe C ; testée sur e2 : `23550406` requis, `23550879` optionnel = clés de la fixture) ; item formé : le helper filtre `kind:"deficit"` (forme des lignes de `U3-inputs`) alors que prereg `:262-263` et `ADR-U4b…md:555-556` l'appliquent à `U3-deficit.jsonl` ; l'intention de `ADR-U4b…md:571-572` (lignes `deficit_base_no_price` USDT de `U3-realized`) est celle que reproduit C-7 ; **tranché — helper livré par U-4b-1b-4** (`usdtBlocksFromLabelerDeficit(U3-realized[, U3-inputs])`, contrôle C-7-bis ; ruling R-1b4-1 : `<USDT_BLOCKS>` = requis seuls) | 5 |
| R-I | ancre pré-B₀ | prereg `:66` « Ancre pré-B₀ = `AnswerUpdated ≤ B₀` réel » ; ADR-U4b D2 (`ADR-U4b-calibration-episode-frais.md:16`) ; `u4b-reduce.mjs:66-69` lit `oRaw.pre_b0_anchor`, sinon repli `source:"book_weth_price_base_8dec"` ; le prober ne l'écrit pas (objet `raw` `u4-oracle-path.mjs:195-201` ; getLogs sur `[B0, bLast]` seulement, `:149`) ; attrapé par `docs/CHECKPOINT2-lot-garde-helius-2b-iii.md:72` (C-R-7), non résolu par -1b-2 ; la fixture e2 porte elle-même le repli (mesuré C-10). | (a) D-n déclarée avant l'étape 6 (repli = prix book @B₀) ; (b) lot hors gel sur le prober (capturer le dernier `AnswerUpdated ≤ B₀`) avant l'étape 5 ; **tranché (b) — livré par U-4b-1b-4** (ancre inconditionnelle, ADDENDUM §2 ; repli inadmissible ; contrôles C-9-bis et C-10-bis) | 5/6 |
| R-J | ordre NARABI-OPS-1d | prereg §7-6 `:367` : « NE fusionne PAS entre le commit du prereg et la clôture de la course » ; ordre post-restart `CHANTIERS.md:809` : « (4) G7 x2 ; (5) fill-ts reel → … course Ukemi ». Mesuré : `lot/narabi-ops-1d` @ `7daf8e5` touche 8 fichiers (`apps/sentinel/src/keyless-transport.ts`, `apps/sentinel/src/run.ts`, 4 tests, `deploy/monark-sentinel.service`, `test/rpc-guard-fetch-only-inside-client.test.ts`), aucun outil de course ; `rpc.ts` sur la branche = `0e232519…` (gel D4 intact). | (a) reporter la fusion après clôture (lettre) ; (b) fusionner avant l'étape 1, D-n déclarée (fond intact) ; jamais entre l'étape 1 et l'étape 6 (gel d'outillage §A) | 0 |
| R-K | outils des rapports H-3/H-4/H-6 | H-3 = test exact bêta-binomial unilatéral 5 % (prereg `:100`) : `grep -rn -i -E "betaBinom|beta_binom|betabinomial"` sur `scripts apps packages` = 0 (mesuré) ; aucun script ne calcule H-4 (`:101`) ni H-6 (`:103`) | lot outillage hors ligne (non réseau) avant le rapport -1b et avant le go U-6 (`:359`) | rapport |
| R-L | e-mode du prober | `--book` attend un objet à `accounts[]` de premier niveau (`u4-oracle-path.mjs:64-65,113`) ; le brut du recorder est `{provenance, book}` (`record.ts:449`) ⇒ `--book <U4-book…raw.json>` jette « --book has no accounts[] (fail-closed) » (**mesuré** sur un brut synthétique de même forme) | (a) `--emode-categories` dérivé par C-8 (réutilise `emodeCategoriesFromBook` sur `raw.book`, testé) ; (b) extraire `raw.book` dans un fichier puis `--book` | 5 |
| R-M | tag d'épisode | `--episode-tag` du labeler (`u3-realized.mjs:425,668`) et du réducteur (`u4b-reduce.mjs:32,72,85`) sans valeur au prereg (`:305,320`) | `<EP>` = `episode.id` (proposé) | 4,6 |
| R-N | sortie du réducteur | `u4b-reduce --out` a pour défaut `apps/sentinel/test/fixtures/ukemi/u4b/` (`u4b-reduce.mjs:36`) = DANS le dépôt | `--out F:/course-ukemi/reduce` (proposé) ; copie en fixtures = acte -2b (§8) | 6 |
| R-O | reconcile | wrapper 1b-i absent (prereg `:288`) ; `delta = after − before` brut (`reconcile.ts:65`), aucun paramètre de soustraction ; A-4 (iv) exige le résiduel Narabi en MINORANT (`:164`) ; un `reconcile` ajoute une ligne `reconciled` chaînée (`reconcile.ts:52`) qui referme la fenêtre (`:37-47`) | forme de la soustraction (proposée : `after − minorant`) ; un seul passage | 7 |

---

## Étape 0 — Préconditions (toutes vérifiables ; valeurs mesurées au HEAD `b130852`)

**0.0 Dossiers hors dépôt** (le parent du ledger existe déjà et ne doit JAMAIS être créé par script, C-8 `u4-guard.mjs:98-99`) :
```
mkdir -p F:/course-ukemi/select F:/course-ukemi/select-replay F:/course-ukemi/record F:/course-ukemi/label/out F:/course-ukemi/label/raws F:/course-ukemi/prober/raws F:/course-ukemi/reduce F:/course-ukemi/offline F:/course-ukemi/reconcile F:/course-ukemi/probe F:/course-ukemi/logs
```

**0.1 UKEMI-RETRY-1 fusionné ✓ `f6442fe`** (G7 : `CHANTIERS.md:774-779`) :
```
cd F:/Monark && git merge-base --is-ancestor f6442fe HEAD && echo "UKEMI-RETRY-1 OK" || echo "STOP: f6442fe absent de HEAD"
cd F:/Monark && git show HEAD:apps/sentinel/src/ukemi/record.ts | tr -d '\r' | sha256sum
```
Attendu : `UKEMI-RETRY-1 OK` ; `afa20f8cbe4421cc3b3ed98a0676088b998c99d6aa2cf39e57c34ceb18028d7e` (= golden du pli, `CHANTIERS.md:775` ; mesuré). Clause présente : `record.ts:353-355` (`NonJsonBody` à 200/429/≥500 transitoire). STOP si absent : le recorder ne part pas (précondition `ADR-U4b…md:619`).

**0.2 U-4b-1b-3 G7 — EN ATTENTE (R-A)** :
```
cd F:/Monark && git show HEAD:scripts/census/u4b/u4b-select-episode.mjs | tr -d '\r' | sha256sum
cd F:/Monark && git show HEAD:scripts/census/u4b/u4b-select-episode.mjs | grep -c "return Infinity"
```
STOP si le sha vaut `225d2304e65b3e175eef1c33a06f9425c57fe140b088f07aeb9f36b51e349447` (pré-clamp, mesuré à `b130852`) ou si le compte `return Infinity` est < 2 (clamp dans `reduceSelection` ET `runFillTs`, diff `801859f`). Attendu : le sha du blob fusionné au G7 post-pli **[à confirmer par l'orchestrateur : ni `225d2304…` ni `896858e6…` (= `801859f` pré-pli)]**. Les flags de l'étape 1 ont été lus sur `801859f` : les re-vérifier sur le blob fusionné (le pli ne doit ajouter aucun flag, `MISSION-PLI.md:8-11`).

**0.3 Floor Chainstack n°2** : `12 916 RU`, lu le 2026-09-22 13:56:23 UTC, cycle « Sep 19, 2026–Oct 19, 2026 », extra usage Disabled (`FAITS-floor-chainstack-n2-2026-09-22.md:3,5,10` ; SIDECAR `:13`). Fraîcheur : R-D.

**0.4 Clé `CHAINSTACK_ETH_URL`** (requise à l'étape 3 SEULEMENT ; jamais `echo "$CHAINSTACK_ETH_URL"`, jamais `env`/`printenv`/`set` en liste) :
```
[ -n "${CHAINSTACK_ETH_URL:-}" ] && echo "CHAINSTACK_ETH_URL: presente" || echo "CHAINSTACK_ETH_URL: ABSENTE"
```
Absente au moment de l'étape 3 ⇒ STOP (le recorder jetterait avant tout verrou : `transport.ts:102-103,107` ; `record.ts:318`).

**0.5 `node_modules` / Node** :
```
cd F:/Monark && node --version && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node -e 'for (const p of ["@monark/rpc-guard","@monark/contracts","@monark/hikae"]) console.log(p, "->", require.resolve(p))'
```
Attendu (mesuré) : `v24.15.0` (`package.json` engines `>=24`) ; `F:\Monark\packages\rpc-guard\src\index.ts`, `F:\Monark\packages\contracts\src\index.ts`, `F:\Monark\packages\hikae\src\index.ts` (liens `node_modules/@monark/* -> /f/Monark/...`). STOP si un chemin pointe vers un worktree `F:\Monark-wt-*` (la course exécuterait l'arbre d'un autre lot), sauf l'arbre d'exécution épinglé déclaré au SIDECAR : recorder (Sidecar 3) ; étapes 2c-bis et 5 : `<EXEC_TREE_E2>` (ligne « gel `<HEAD_E2>` », §A « Gel d'outillage »), où l'attendu est la même liste sous cet arbre.

**0.6 Gel D4 (9 sha §2) + arbre de travail == HEAD** (prereg `:8,:382-390` ; Node exécute le fichier SUR DISQUE, et le recorder relit prereg et labeler sur disque, `record.ts:270,279`) :
```
cd F:/Monark && for f in scripts/census/u4b/u4b-scores.mjs scripts/census/u4b/u4b-reduce.mjs scripts/record-u4b-calib.mjs apps/sentinel/src/ukemi/wadray.ts apps/sentinel/src/ukemi/abi.ts packages/hikae/src/l1-split.ts apps/sentinel/src/rpc.ts packages/contracts/src/calib-digest.ts scripts/census/u3-realized.mjs docs/PLAN-u4b-prereg.md apps/sentinel/src/ukemi/record.ts apps/sentinel/src/ukemi/rpc2.ts scripts/census/u4b/u4b-select-episode.mjs scripts/census/u4b/liquidation-logs.mjs scripts/census/u4-oracle-path.mjs scripts/census/u4b/u4b-probe-cutoff.mjs scripts/census/u4-guard.mjs apps/sentinel/src/windows.ts packages/rpc-guard/src/transport.ts packages/rpc-guard/src/client.ts packages/rpc-guard/bin/rpc-guard.mjs; do h=$(git show "HEAD:$f" | tr -d '\r' | sha256sum | cut -d' ' -f1); w=$(tr -d '\r' < "$f" | sha256sum | cut -d' ' -f1); if [ "$h" = "$w" ]; then echo "OK    ${h:0:8} $f"; else echo "ECART $f"; fi; done
```
Attendu (21/21 `OK` ; 18 valeurs mesurées à `b130852` et inchangées, 3 re-mesurées au fold U-4b-1b-4 sur l'arbre fusionné virtuel `lot/etude-suite` @ `38c767e` + blobs de `206bc56` ; à re-mesurer sur `<HEAD_E2>` et à consigner à la ligne SIDECAR « gel `<HEAD_E2>` », C-V4b-2) : 9 gelés = §2 exactement (`2f9a31f6` `a5e66cd3` `5733daeb` `7bee76fc` `3376eb08` `9206df91` `0e232519` `3603265d` `cb020425`), prereg `1971d9b1`, `record.ts` `afa20f8c`, `rpc2.ts` `92577c5a`, `liquidation-logs.mjs` `bf4eb293`, `u4-oracle-path.mjs` `4ed4c31e` (U-4b-1b-4 ; `a2b39d0e` avant sa fusion), `u4b-probe-cutoff.mjs` `8bdb1478` (U-4b-1b-4, sonde (d)), `u4-guard.mjs` `e3f5c70d`, `windows.ts` `b84827ae`, `transport.ts` `f95567f3`, `client.ts` `6553556c`, bin `d67b6b1b` (change si GARDE-FSYNC-1 est fusionné : re-mesure, `docs/CHECKPOINT2-lot-garde-fsync-1.md:89`) ; `u4b-select-episode.mjs` `20e1cf9d` (blob du G7 U-4b-1b-3, Sidecar 0 ; DOIT différer de `225d2304`, 0.2). Valeurs complètes (sha256 LF) des deux fichiers de U-4b-1b-4 : `u4-oracle-path.mjs` `4ed4c31e99f148b9d6285926f010cd7beb5f3b686c70a9e7188b3c0c7f8f0d7a`, `u4b-probe-cutoff.mjs` `8bdb1478e7b3c107b91f5daa9c01642ef97956033ddaf72cfe29b3d73f19e56b`. Tout `ECART` sur un gelé, ou un gelé ≠ §2 ⇒ **ÉCART = STOP** (prereg `:8`).

**0.7 NARABI-OPS-1d (R-J)** :
```
cd F:/Monark && git merge-base --is-ancestor lot/narabi-ops-1d HEAD && echo "NARABI-OPS-1d FUSIONNE" || echo "NARABI-OPS-1d non fusionne"
```
Mesuré : non fusionné. Si fusionné : 0.6 doit rester vert (`rpc.ts` `0e232519`) et la D-n de R-J(b) doit être consignée ; toute fusion entre l'étape 1 et l'étape 6 = STOP (gel d'outillage), sauf D-n datée : fusions de U-4b-1b-4 puis de U-4b-STATS-1 pendant la course (ruling I-6, référence `<HEAD_E2>`, §A « Gel d'outillage ») ; toute autre fusion non docs = D-n datée au SIDECAR avec re-mesure de 0.6.

**0.8 Aucun verrou tenu** :
```
ls F:/monark-ledger/chainstack-2026-09-19/chainstack-2026-09-19/*.lock 2>/dev/null && echo "STOP: verrou tenu" || echo "aucun verrou"
```
Mesuré : aucun `.lock`. Si un verrou est tenu ET qu'aucun processus de course ne tourne (vérifier), libération SERVIE, une commande par opérateur verrouillé (`packages/rpc-guard/src/cli.ts:36-42` ; ligne `unlocked` chaînée, `lock.ts:38-43`) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node packages/rpc-guard/bin/rpc-guard.mjs --ledger-dir F:/monark-ledger/chainstack-2026-09-19 --floor 0 unlock --cycle chainstack-2026-09-19 --op <label> --reason "<motif date -u>"
```
(pour `--op chainstack` : `--floor <FLOOR>` par cohérence, `u4-guard.mjs:178` ; le bin ne lit aucun secret, `rpc-guard.mjs:5-6`).

**0.9 Brut discover v2 = LE brut de la course** (contrôle C-0, annexe C) : attendu (mesuré) `schema ukemi-u4b-discover/2`, `phase complete`, `[22803459, 26034127]`, `n_logs 13696` = `n_records 13696`, `n_block_ts 2328`, `carried 2ffa3acfa317118e419545bdf0e80491a425097f34d391db30ad0f0d3b093fa8`, `recomputed_ok true`. `START-v2.txt` : `finalized=26034191 to=26034127` (= finalized − 64, prereg `:29`). Le sélecteur et `--fill-ts` recalculent ce sha par code (`u4b-select-episode.mjs:194-196,337-338`). **Toute re-découverte changerait `to_block` (donc `B_hi`) et potentiellement l'épisode ⇒ D-n, interdite sans ruling** (anti « sélection sur l'issue », prereg `:14`).

**0.10 Sonde go/no-go (prereg `:176-191`)** : (a)/(b) mesurées au temps 1 (étape 3a) ; (c) Pocket L-5 faite le 2026-09-21 (`CHANTIERS.md:410` ; `rpc2.ts:5-6`) ; (d) outil `scripts/census/u4b/u4b-probe-cutoff.mjs`, étape 2c-bis (ADDENDUM §1 et ADDENDUM-2), contrôle C-12 ; (e) garantie par code (`record.ts:297-298`) ; (f) faite (SIDECAR `:7-13`) ; (g) comptée à l'étape 4.

**0.11 CGU (règle 2026-09-20)** : CONF-SRC-2 rendu (`CHANTIERS.md:405-406`) ; publicnode = décision 89 (`:272`), Pocket = décision 100 (`:409-410`), Tenderly conservé = décision 102 (`:417-419`) ; dRPC, bloXroute, Nodies, MEV Blocker « ADMIS SOUS CONDITIONS ou INDÉTERMINÉ (procurements formés dans l'archive) » (`:406`) — l'orchestrateur confirme que les conditions tiennent pour cette campagne **[à confirmer par l'orchestrateur]**.

**Sidecar 0** : `préconditions | <date -u> | HEAD <sha> | 0.1..0.11 verts | R-A..R-O tranchés : <liste> | exécutant <modèle orchestrateur>`.

---

## Étape 1 — `--fill-ts` réel (keyless quorum-2, gardé ; reprise = même `--out`)

**Préconditions** : R-A, R-B, R-C tranchés ; 0.2 vert ; 0.8 aucun verrou ; `<HEAD_E1>` noté. `F:/course-ukemi/select/block-ts-extra.json` : ABSENT (départ ; mesuré : absent, les 3 essais étaient tout-ou-rien, `CHANTIERS.md:772`) OU `phase:"partial"` avec `discover_sha 2ffa3acf…` (reprise) — contrôle C-1.

**Commande** (ENV-8 ; jeu d'opérateurs de la mission) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node scripts/census/u4b/u4b-select-episode.mjs --fill-ts \
  --discover F:/course-ukemi/discover/weth-discover-2026-09-22.json \
  --out F:/course-ukemi/select \
  --operators drpc.org,mevblocker.io,nodies.app \
  --ledger-dir F:/monark-ledger/chainstack-2026-09-19 \
  --cycle chainstack-2026-09-19 \
  --max-calls <N_FILL> \
  --method-caps '{"eth_getBlockByNumber":<N_FILL>}' \
  --min-interval-ms 150 \
  > F:/course-ukemi/logs/fill-ts-4.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/fill-ts-4.log
```
Notes (flags lus au parseur `u4b-select-episode.mjs:313-343` HEAD et `801859f`) :
- `--e2-window` omis = défaut `[23545088,23557060]` (`:39,:319`), identique à l'étape 2 (où il est passé explicitement, mêmes valeurs).
- Opérateurs : keyless par code (`assertKeylessOperators`, `u4b-discover.mjs:44-49`), ≥ 2 distincts par `operatorOf` (`:323`) : {drpc, mevblocker, pocket(=nodies)} = 3 (`rpc2.ts:28-31`). `pocket.network` exclu : élague les en-têtes anciens (`F:\course-ukemi\discover\run.log` : « blocks are available from block 25771356 » ; `ADR-U4b…md:498-500`). L'ORDRE de `--operators` est l'ordre de préférence du quorum (pas de round-robin : `rpc2.ts:156-174,247` ; `:343`) ; mevblocker a eu 677 erreurs pendant le discover v2 (provenance du brut, mesuré) et un 429 au 1ᵉʳ fill-ts (`select/fill-ts.log`) ⇒ l'ordre `drpc.org,nodies.app,mevblocker.io` est une alternative **[à confirmer par l'orchestrateur — R-B]**.
- `--min-interval-ms 150` = valeur du 2ᵉ essai (`CHANTIERS.md:771`), politesse PAR fournisseur (`rpc2.ts:131-145`), défaut 50 (`:342`) **[instance R-B]**.
- `<N_FILL>` : seul plafond liant (keyless, `client.ts:110`) ; repère : chaque essai pré-clamp a consommé « ~12 000 appels keyless » avant le STOP (`CHANTIERS.md:772`, journal orchestrateur [lu], non re-mesuré), sondes au-delà de `to_block` incluses, désormais à 0 fetch. Post-R-A un arrêt budget est non destructif (sidecar `partial` persisté). `--method-caps` requis par le parseur, inerte en keyless.
- `--resume` n'existe pas ici : la reprise lit `<out>/block-ts-extra.json` de même `discover_sha` (diff `801859f`, bloc RESUME ; flush `partial` tous les 50 ts neufs et sur arrêt ; `complete` en fin).

**Sorties attendues** (code `801859f`, à re-vérifier au blob fusionné) : stdout `u4b-fill-ts phase=complete n_extra=<n> block_ts_extra_sha256=<sha> calls=<c>/<N_FILL>` puis `out=F:/course-ukemi/select/block-ts-extra.json` ; `exit=0` ; sidecar `{schema:"ukemi-u4b-block-ts-extra/1", phase:"complete", discover_sha, n_extra, block_ts_extra, block_ts_extra_sha256}` ; une ligne `unlocked` par opérateur en fin (`u4-guard.mjs:174-181`).
**Contrôle** : C-1 → `phase=complete`, `discover_ok=true`, `self_sha_ok=true` ; 0.8 → aucun verrou.

**STOP + acte** (pas de H-n à cette étape ; H-0 est jugé à l'étape 2) :
- `exit=1` + « STOP after … partial (n_extra=…) persisted, re-run to RESUME » (NoQuorum/transport) : laisser passer le banc (25 s, `rpc2.ts:172`) puis **relancer la commande IDENTIQUE** (même `--out` ⇒ 0 re-fetch des ts acquis). Même bloc en échec répété ⇒ STOP + consultation (R-26) ; tout changement d'opérateurs = nouvelle instance consignée au sidecar, jamais silencieuse.
- `BUDGET STOP` : `partial` persisté ; re-budget = décision orchestrateur (R-26) ; relance identique (seul `<N_FILL>` change).
- `already locked for this cycle` : vérifier qu'aucun processus ne tourne ; `unlock` servi (0.8) ; relance.
- `malformed block` sur un bloc `> to_block` : impossible post-clamp ⇒ le code exécuté n'est pas le blob fusionné ⇒ STOP (retour 0.2).
- `belongs to another brut` / `self-sha mismatch` / `unreadable` : sidecar étranger ou corrompu dans `--out` ⇒ STOP ; ne jamais l'éditer ; ruling (le déplacer dans un dossier daté, repartir).

**Sidecar 1** : `fill-ts | <date -u> | HEAD <HEAD_E1> | sélecteur <sha blob> | opérateurs <liste ordonnée> | min-interval 150 | calls <c>/<N_FILL> | n_extra <n> | block_ts_extra_sha256 <sha> | discover_sha 2ffa3acf…`.

---

## Étape 2 — sélection (hors ligne) ⇒ `episode-selection.json`, rejeu déterministe, puis `--check-version` (H-1)

### 2a — `runSelect --block-ts-extra` (0 réseau)

**Préconditions** : étape 1 `phase=complete` (C-1) ; gel d'outillage (§A) vide.

**Commande** (ENV-8) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node scripts/census/u4b/u4b-select-episode.mjs \
  --discover F:/course-ukemi/discover/weth-discover-2026-09-22.json \
  --prereg-file docs/PLAN-u4b-prereg.md \
  --prereg-sha 1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49 \
  --out F:/course-ukemi/select \
  --n-min 50 \
  --e2-window 23545088,23557060 \
  --block-ts-extra F:/course-ukemi/select/block-ts-extra.json \
  > F:/course-ukemi/logs/select.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/select.log
```
Notes : `--n-min 50` et `--e2-window` = valeurs du prereg §DISC (`:27`, E-I-2) = défauts du code (`:37,:39,:187-188`) ⇒ `selection_sha256` identique avec ou sans ces flags ; `--b-hi` omis ⇒ `brut.to_block` = 26034127 (`:197`) = B_hi (prereg `:29`). `--prereg-sha` obligatoire et vérifié (`:167-176`). `--out` refusé sous la racine du dépôt (`:151-158`).

**Sorties attendues** (`:218-228`) : `episode-selection.json` (`version_check:"pending"`, `selection_sha256`), `events-<EP>.json` (tableau `[{id, collateral:WETH, clusterLo:B_first, clusterHi:B_last, preV33:false}]`, `:127-129`), `A-rawlogs-<EP>.jsonl` (enregistrements e2-EXCLUS, `:124`) ; stdout `u4b-select episode=<EP> B_first=… B_last=… B0=… n_distinct=…`, `candidates=… eligible=… window_truncated=… n_excluded_e2=… residual_outside_window=…`, `version_check=pending selection_sha256=… rawlogs_sha256=… block_ts_extra_sha256=…`.
**Contrôle** : C-2 → `discover_ok` (maillon brut `2ffa3acf…` → sélection), `prereg_ok`, `selection_sha_ok`, `rawlogs_ok`, `events_ok`, `b0_ok` (B0 = B_first − 1, `:126`), `n_min_ok`, `residual_outside_window == 0` (invariant glouton, `ADR-U4b…md:581-584`), `block_ts_extra_sha256` == celui de l'étape 1, `e2_window`, `b_hi 26034127`. Lire `<EP>`, `<B0>`, `<RAWLOGS_SHA>` pour la suite.

**STOP + acte** :
- **H-0** : « H-0 no_fresh_episode: 0 eligible WETH cluster … » (`:120`, exit 1) ⇒ arrêt `no_fresh_episode`, item formé (élargir la fenêtre / abaisser N_min = décision investisseur), **AUCUNE course** (prereg `:95`). Toute relaxation = D-n au PLI (`:58`).
- « brut has no ts for block N » : fill-ts incomplet ⇒ retour étape 1 (reprise).
- « sidecar phase 'partial' » : retour étape 1.
- `brut_sha256 mismatch` / `discover_sha … belongs to another brut` / `block_ts_extra_sha256 mismatch` : altération ⇒ STOP, enquête ; jamais de régénération silencieuse.

### 2b — rejeu de déterminisme (tuyau `u4b_episode_selection_is_deterministic`, prereg `:58`) — AVANT 2c (qui réécrit le fichier)

```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node scripts/census/u4b/u4b-select-episode.mjs \
  --discover F:/course-ukemi/discover/weth-discover-2026-09-22.json \
  --prereg-file docs/PLAN-u4b-prereg.md \
  --prereg-sha 1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49 \
  --out F:/course-ukemi/select-replay \
  --n-min 50 \
  --e2-window 23545088,23557060 \
  --block-ts-extra F:/course-ukemi/select/block-ts-extra.json \
  > F:/course-ukemi/logs/select-replay.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/select-replay.log
cmp F:/course-ukemi/select/episode-selection.json F:/course-ukemi/select-replay/episode-selection.json && cmp F:/course-ukemi/select/A-rawlogs-<EP>.jsonl F:/course-ukemi/select-replay/A-rawlogs-<EP>.jsonl && cmp F:/course-ukemi/select/events-<EP>.json F:/course-ukemi/select-replay/events-<EP>.json && echo "REJEU IDENTIQUE"
```
Attendu : `REJEU IDENTIQUE` (`block_ts_extra_file` = `basename`, identique, `:214`). Différence ⇒ STOP (non-déterminisme = défaut de tuyau).

### 2c — `--check-version` (H-1 ; keyless quorum-2, 1 `eth_getStorageAt` EIP-1967)

**Commande** (ENV-8 ; opérateurs de la ligne figée §5b-ter `:252`) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node scripts/census/u4b/u4b-select-episode.mjs --check-version \
  --episode-file F:/course-ukemi/select/episode-selection.json \
  --operators drpc.org,mevblocker.io,tenderly.co \
  --ledger-dir F:/monark-ledger/chainstack-2026-09-19 \
  --cycle chainstack-2026-09-19 \
  --max-calls 9 \
  --method-caps '{"eth_getStorageAt":9}' \
  > F:/course-ukemi/logs/check-version.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/check-version.log
```
Notes : `--max-calls 9` = pire cas dérivé du code (≤ 3 étiquettes, arrêt à 2 succès, `:238-248` ; ≤ 3 tentatives/étiquette, `retries: 2`, `:282`, `u4-guard.mjs:149-166`) **[instance à confirmer]** ; si tenderly ne sert pas `eth_getStorageAt` ancien, drpc + mevblocker suffisent ; substitution par `nodies.app` = instance consignée **[à confirmer]**. `--version-neutral-ref` ABSENT (seulement après PR-U4-3-bis, ci-dessous).

**Sorties attendues** : stdout `u4b-check-version B_first=<n> impl=<addr> version_ok=true (== v3.5.0) calls=<c>/9` ; fichier réécrit avec `version_check {status:"checked", block, impl, expected_v350, version_ok, neutral_ref, checked_at_utc, operators, calls}`, `selection_sha256` INCHANGÉ (`:292-293`).
**Contrôle (obligatoire)** : C-3 (exit 0 ssi `status checked` ∧ `version_ok` ∧ `impl == 0x97287a4f35e583d924f78ad88db8afce1379189a`) + C-2 (`selection_sha_ok` toujours vrai). **Le code de sortie de `--check-version` ne suffit PAS** : il vaut 0 même si `version_ok=false` (`:294-297` retourne sans lever ; `:380-382` ne mappe que les rejets) — OBS-2 ; et aucun aval ne relit `version_check` (recorder : `--block` seul ; prober : `selection_sha256` hors `version_check`) ⇒ H-1 est procédural.

**STOP H-1 + acte** : `impl ≠ v3.5.0` (stderr « version_ok=FALSE … STOP H-1, item PR-U4-3-bis ») ⇒ **course EN PAUSE**, `PR-U4-3-bis` (lire l'impl effective [lu], déclarer le diff `LiquidationLogic` NEUTRE) AVANT tout ŷ (prereg `:56,:96`) ; si NEUTRE : relancer 2c avec `--version-neutral-ref <doc>` ; **jamais d'avance vers un autre candidat** (prereg `:254` ; `u4b-select-episode.mjs:18`). `quorum disagreement` / `needs 2 distinct operators` ⇒ STOP, relance plus tard ou substitution consignée.

**Sidecar 2** : `sélection | <date -u> | episode <EP> | B_first/B_last/B0 | n_distinct | selection_sha256 | rawlogs_sha256 | events_sha256 | block_ts_extra_sha256 | rejeu identique | version_check.impl | version_ok | checked_at_utc | calls`.

### 2c-bis — sonde (d) `s_cutoffTime` (ADDENDUM §1 + ADDENDUM-2 ; keyless quorum-2, gardée ; go/no-go de l'étape 3)

**Préconditions** : C-2 et C-3 verts ; ligne SIDECAR « gel `<HEAD_E2>` » écrite (re-checkpoint-2 C-V4b-2 ; §A « Gel d'outillage ») ; sha de l'ADDENDUM (`eb7ad29b…`) et de l'ADDENDUM-2 inscrits au SIDECAR (checkpoint-2 C-V-2) ; `<EXEC_TREE_E2>` détaché à `<HEAD_E2>`, 0.5 et 0.6 rejoués dans cet arbre ; 0.8 aucun verrou ; dossier `probe` créé (0.0).

**Commande** (ENV-8 ; instance R-1b4-2) :
```
cd <EXEC_TREE_E2> && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node scripts/census/u4b/u4b-probe-cutoff.mjs \
  --episode-file F:/course-ukemi/select/episode-selection.json \
  --operators drpc.org,mevblocker.io,tenderly.co \
  --ledger-dir F:/monark-ledger/chainstack-2026-09-19 \
  --cycle chainstack-2026-09-19 \
  --max-calls 1200 \
  --method-caps '{"eth_call":1200,"eth_getLogs":1200}' \
  --out F:/course-ukemi/probe \
  > F:/course-ukemi/logs/probe-cutoff.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/probe-cutoff.log
```
Notes (parseur `u4b-probe-cutoff.mjs:69-95` à `206bc56`) :
- `B_fresh` = `episode.B0` du `--episode-file` sha-vérifié (refus à 0 fetch sur écart) ; `--block`, `--finalized`, `--target` refusés nommément ; env VIDE passé au garde (aucune clé lue) ; opérateurs payants refusés par code ; ≥ 2 opérateurs distincts (`operatorOf`) exigés ; `--ledger-dir` absent ou vide ⇒ refus nommé (C-G2-1).
- Opérateurs = instance R-1b4-2 (ADDENDUM-2 (f), (g)) ; l'ordre de la liste est l'ordre de préférence du quorum ; `tenderly.co` sert en repli.
- `--max-calls 1200` = instance de l'ADDENDUM §1 ; pour B0 = 23 414 968 la plage est `[22 076 041, 23 545 087]` (branche `max` vive, ADDENDUM-2 §0), soit 148 morceaux de 9 990 blocs (`rpc2.ts:212-213`) ⇒ 2 + 2 × 148 = 298 appels nominaux, hors tentatives et découpes. `--method-caps` inerte en keyless (OBS-3) mais exigé (objet JSON).
- `--min-interval-ms` (défaut 50 ms par fournisseur, `u4b-probe-cutoff.mjs:95`) est absent de l'instance ; 429 mesurés sur `mevblocker.io` (ADDENDUM-2 (g)) ⇒ valeur **[à confirmer par l'orchestrateur]** (item PROBE-RATE-1 de l'amendement U-4b-1b-4 d'ADR-U4b).
- `exit=0` ⇔ GO ; `exit=3` ⇔ STOP (`reason` ∈ `cutoff_changed`, `aggregator_mismatch`, `no_event_at_or_below_block`, `budget_stop`, `read_failed:<Classe>`) ; `exit=1` = refus d'argument (aucun fichier).

**Sorties attendues** : stdout `u4b-probe-cutoff B_fresh=<B0> aggregator=0x7c7f… events=<n> c_fresh=<v> c_e2=<v> deploy_value=30 rule="c_fresh == c_e2" verdict=GO calls=<c>/1200` puis `out=…/cutoff-<B0>.json` ; fichier `cutoff-<B0>.json` dans le dossier `probe` (champs de l'ADDENDUM §1 et de l'ADDENDUM-2 (e)).
**Contrôle** : C-12 (annexe C).
**STOP + acte** : C-12 ≠ 0 ⇒ **STOP + retour investisseur** avec `c_fresh`, `c_e2`, `deploy_value`, `events[]` (bloc, hash, logIndex) — aucune règle ne laisse partir la course sur inégalité (ADDENDUM §1) ; `budget_stop` / `read_failed:*` = scan incomplet ⇒ même STOP ; relance après délai ou re-budget (R-26), fichier réécrit ; jamais un GO sans C-12 exit 0.

**Sidecar 2c-bis** : `sonde (d) | <date -u> | HEAD_E2 <sha> / arbre <EXEC_TREE_E2> | B_fresh | aggregator | range | n_events | c_fresh | c_e2 | deploy_value 30 | verdict | reason | calls/1200 | sha256 du fichier cutoff | sha ADDENDUM + ADDENDUM-2`.

---

## Étape 3 — recorder (§5a) : temps 1 `--filter-only`, go/no-go, temps 2 course pleine (la SEULE étape à clé Chainstack)

**Préconditions** : C-2 et C-3 verts ; R-D, R-E, R-F, R-J tranchés ; **R-G : C-12 exit 0** (sonde (d) GO, étape 2c-bis) avant toute partie de l'étape 3 non encore commencée — l'étape 3a a démarré avant la sonde (ADDENDUM-2 (h)) ; 0.4 `presente` ; 0.8 aucun verrou ; gel d'outillage vide ; `F:/course-ukemi/record/U4-inputs-<B0>.jsonl` ABSENT au PREMIER lancement du temps 1 SEULEMENT — ensuite CONSERVÉ pour le temps 2 et pour toute reprise après re-budget (`record.ts:375-387`), jamais supprimé (cache neuf au départ : la méta du cache n'est pas validée, `resume.ts:86` ⇒ un fichier par B0, jamais le cache e2 `F:/PRODUITS/etude-2026-09-20/u4-raws/U4-inputs.jsonl`) ; plafonds (décisions 119/121, prereg `:341`) : `<FLOOR> ≤ 16 000 000` (garde-code `client.ts:74`) ; `<MAX_RU> ≤ 16 000 000 − <FLOOR>` (borne procédurale, ruling Q7, prereg `:212` ; le garde-code dynamique est `cycle_cap`, `client.ts:118`) — si `<FLOOR>` = 12 916 : ≤ 15 987 084, arithmétique. Aucun autre processus Chainstack sur ce `cycleDir` (verrou exclusif `lock.ts:17-27`).

### 3a — temps 1 `--filter-only`

**Commande** (ENV-7 — conserve `CHAINSTACK_ETH_URL`) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node apps/sentinel/src/ukemi/record.ts \
  --cluster weth \
  --block <B0> \
  --from-block 16496792 \
  --operators drpc.org,mevblocker.io,nodies.app,pocket.network,tenderly.co,chainstack \
  --ledger-dir F:/monark-ledger/chainstack-2026-09-19 \
  --cycle chainstack-2026-09-19 \
  --floor <FLOOR> \
  --max-ru <MAX_RU> \
  --max-calls <MAX_CALLS_T1> \
  --method-caps eth_call=<CAP_CALL>,eth_getLogs=<CAP_LOGS>,eth_getBlockByNumber=<CAP_BLOCK> \
  --prereg-file docs/PLAN-u4b-prereg.md \
  --prereg-sha 1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49 \
  --labeler-sha cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af \
  --concordance-out F:/course-ukemi/record/concordance-filter-<B0>.jsonl \
  --resume F:/course-ukemi/record/U4-inputs-<B0>.jsonl \
  --filter-only \
  --out F:/course-ukemi/record/U4-filter-<B0>.json \
  > F:/course-ukemi/logs/record-t1.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/record-t1.log
```
Notes (parseur `record.ts:139-186`, gardes `:238-298`) :
- Les 6 arguments requis sont AVANT la branche `filterOnly` (`:238-250` vs `:394`) ⇒ présents au temps 1 (prereg `:179`). `--prereg-sha` et `--labeler-sha` OBLIGATOIRES dès que le prereg existe (`:264-267`) et vérifiés sur disque (`:268-281`). **`--no-prereg-binding` INTERDIT** (prereg `:222`) ; `--exclude-operator` n'existe plus (`:30-34`).
- `--from-block 16496792` = option R-E(b) ; option R-E(a) = supprimer cette ligne **[à confirmer — R-E]**.
- Ordre effectif du pool = ordre épinglé du transport, pas celui de `--operators` : eth_call `drpc, mevblocker, nodies, pocket`, getLogs `drpc, mevblocker, tenderly, pocket`, `chainstack` AJOUTÉ EN DERNIER (`record.ts:293-295` ; `transport.ts:36-37`) ⇒ tiré seulement sur banc.
- `--method-caps` : caps par méthode sur les tentatives `chainstack` seulement (`client.ts:114-116`) ; les 3 méthodes du pool DOIVENT figurer (`eth_call`, `eth_getLogs`, `eth_getBlockByNumber` = toutes les méthodes émises, `rpc2.ts:190,208,220,231`), sinon `method_cap_unlisted` (`client.ts:115`) ; 2 RU/appel pour ces trois méthodes (`packages/rpc-guard/src/tariff.ts:45-51`, conservateur).
- `<MAX_CALLS_T1>` (règle prereg `:179`) : énumération + `holders × 2` + marge déclarée. Minimum dérivé du code : `2 × (⌈(B0 − 16496792 + 1)/9990⌉ + holders + 4)` (morceaux getLogs de 9990 blocs, `rpc2.ts:129,210-216` ; quorum-2 = 2 réponses, `:161,175-176` ; + finalized, `getPriceOracle`, `getReservesList`, `getReserveData`, `record.ts:65-78` ; + `getUserConfiguration` par détenteur, `:84-85`), hors découpes (`rpc2.ts:197-201`) et reprises. `holders` inconnu avant le temps 1 : l'ensemble des destinataires `Transfer` aWETH sur `[16496792, B0]` croît avec B0 (`record.ts:77-81`) ; repère e2 : 69 481 détenteurs à B0 23545087 (`docs/JOURNAL-PROVENANCE.md:307`, `PLI-lot-u4a.md:122` [lu]). Un arrêt budget est non destructif (exit 2, cache conservé).
- Politesse : `--min-interval-ms` défaut 200 par fournisseur (`record.ts:164`) ; `--slow-operator <label>`/`--slow-interval-ms` existent (`:176-177`) mais ne figurent pas dans la ligne figée ⇒ toute addition = instance consignée **[à confirmer]**.

**Sorties attendues** : `U4-filter-<B0>.json` = `{provenance}` (`:410-420`) avec `phase:"filter-only"`, `params` (`prereg_sha`, `prereg_file`, `prereg_binding`, `labeler_sha`, `from_block`), `holders`, `holders_digest`, `n_at_risk_config`, `projection_remaining_calls = 9 × n_at_risk_config` (`:416`), `calls`, `calls_by_operator`, `spent_by_operator` (RU chainstack), `errors_by_operator`, `finalized_block`, `ukemi_sha` ; stdout `ukemi/record FILTER-ONLY cluster=weth B=<B0> holders=… n_at_risk_config=…` + `calls=…/… projection_remaining=9*n=… seconds=…` ; `exit=0`.
**Contrôle** : C-4 → `binding_ok`, `prereg_ok`, `labeler_ok` vrais ; `block == <B0>` ≤ `finalized_block` ; noter `holders_digest`, `n_at_risk_config`, `spent_by_operator.chainstack`, `ukemi_sha`, `finalized_block`.

### 3b — go/no-go du temps 2 (acte orchestrateur, prereg `:180,:187`)

- `<MAX_CALLS_T2>` = énumération (temps 1) + `9 × n_at_risk_config` + marge déclarée (`:180` ; « ≈ 9 appels » par compte, `PLI-lot-u4a.md:122`).
- **Sonde (d)** : C-12 exit 0 (étape 2c-bis) AVANT le go du temps 2 (ADDENDUM §1 « go/no-go de l'étape 3 » ; ADDENDUM-2 (h)) ; C-12 ≠ 0 ⇒ STOP + retour investisseur, aucun temps 2.
- Part Chainstack projetée depuis `calls_by_operator.chainstack` / `spent_by_operator.chainstack` du temps 1 ; `<MAX_RU>` et les caps la couvrent ; **dépassement projeté ⇒ arrêt + consultation** (`:187`), jamais un dépassement.
- H-5 (rapporté, `:102`) : `n_at_risk_config` noté (condition nécessaire, non suffisante de H-2).
- Précondition de l'étape 4 calculée ICI : `B_first + 30000 ≤ finalized_block` (voir étape 4).
- Projection d'ordre du prereg : ~280 k appels × 2 RU ≈ ~560 k RU (`:191`, décision 91) — borne si tout passait par chainstack ; à comparer aux mesures du temps 1.

### 3c — temps 2 course pleine

**Commande** (ENV-7 ; MÊME `--resume` qu'au temps 1, `record.ts:375-387` ; autre `--out`) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node apps/sentinel/src/ukemi/record.ts \
  --cluster weth \
  --block <B0> \
  --from-block 16496792 \
  --operators drpc.org,mevblocker.io,nodies.app,pocket.network,tenderly.co,chainstack \
  --ledger-dir F:/monark-ledger/chainstack-2026-09-19 \
  --cycle chainstack-2026-09-19 \
  --floor <FLOOR> \
  --max-ru <MAX_RU> \
  --max-calls <MAX_CALLS_T2> \
  --method-caps eth_call=<CAP_CALL>,eth_getLogs=<CAP_LOGS>,eth_getBlockByNumber=<CAP_BLOCK> \
  --prereg-file docs/PLAN-u4b-prereg.md \
  --prereg-sha 1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49 \
  --labeler-sha cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af \
  --concordance-out F:/course-ukemi/record/concordance-book-<B0>.jsonl \
  --resume F:/course-ukemi/record/U4-inputs-<B0>.jsonl \
  --out F:/course-ukemi/record/U4-book-<B0>.raw.json \
  > F:/course-ukemi/logs/record-t2.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/record-t2.log
```
(Même choix R-E qu'au temps 1 : la ligne `--from-block` est présente aux deux temps ou absente aux deux.)

**Sorties attendues** : `U4-book-<B0>.raw.json` = `{provenance, book}` (`:439-449`) ; stdout `ukemi/record cluster=weth B=<B0> book_digest=<sha>` + `holders=… at_risk=… eligible=… excluded={…}` + `calls=… rpc_errors=… ukemi_sha=…` ; `exit=0` ; fin : N lignes `unlocked` (6 opérateurs, `:508-512`).
**Contrôle** : C-5 → `binding_ok`/`prereg_ok`/`labeler_ok` ; `holders_digest` == temps 1 (vérifié aussi par code, `:432-433`) ; `counts.at_risk + counts.excluded_zero_balance == n_at_risk_config` du temps 1 (`:62-63`) ; `ukemi_sha` == temps 1 (aucun changement d'outil) ; `book_digest` noté ; `<out>.diag.json` ABSENT ; 0.8 aucun verrou après.

**STOP + acte (3a et 3c)** :
- `exit=2` = BUDGET STOP (`:485-494`, stderr « seen: … calls=… ») : cache conservé ; « re-run --resume ONLY after a re-budget decision (R-26), never a silent raise » (`:492`). Si la cause est un plafond Chainstack (`run_credits`, `cycle_cap`, `method_cap`, `client.ts:113-118`) ⇒ **STOP + retour investisseur** (prereg `:341`).
- `exit=1` FATAL (NoQuorum, désaccord, `AbiMismatchError`, look-ahead `:391`, verrou tenu, `--prereg-sha`/`--labeler-sha` refusé `:266-281`) : `<out>.diag.json` écrit (`:456-483`, sans secret) ⇒ STOP + consultation ; aucun book partiel présenté (abstention du book entier, `rpc2.ts:9`). Un refus prereg/labeler = ÉCART D4 = STOP (prereg `:8`).
- Crash dur (SIGKILL, fermeture de session) : verrous TENUS (`:503-504`) ⇒ N `unlock` servis (0.8, les 6 opérateurs, `--floor <FLOOR>` pour chainstack) AVANT toute relance ou tout reconcile (prereg `:338`).
- `prereg_binding` ≠ `docs/PLAN-u4b-prereg.md` ⇒ D-n, course non servable (prereg `:222`).
- H-5 : rapporté, pas un STOP.

**Sidecar 3** : `recorder T1 | <date -u> | FLOOR <valeur + heure de lecture> | MAX_RU | caps | MAX_CALLS_T1 | holders | holders_digest | n_at_risk_config | calls | spent chainstack RU | finalized_block | ukemi_sha | from-block <R-E>` puis `recorder T2 | <date -u> | MAX_CALLS_T2 | book_digest | counts | calls | spent chainstack RU | rpc_error_count | ukemi_sha`.

---

## Étape 4 — labeler §5d (keyless-only, CARTO-T1-1) ; ordre labeler → prober (D-n, prereg `:226`)

**Préconditions** : étape 3 close (ordre prereg `:226`) ; gel d'outillage vide ; labeler sur disque = `cb020425…` (0.6) ; `<RAWLOGS_SHA>` = `rawlogs_sha256` de `episode-selection.json` (sha BRUT des octets, `u4b-select-episode.mjs:125`, comparé par le labeler sur les octets, `u3-realized.mjs:480-482`) ; **`episode.B_first + 30000 ≤ finalized_block`** (provenance du temps 1 ou 2) : la recherche de fenêtre du labeler gelé (`firstBlockAtOrAfter(ts+86400, bFirst, bFirst+60000)`, `u3-realized.mjs:554`) sonde d'abord `lo + ⌊(hi−lo)/2⌋ = B_first + 30000` (`apps/sentinel/src/windows.ts:50-58`) ; un bloc au-delà de la tête ⇒ « bad block » (`u3-realized.mjs:370`) sur chaque jambe ⇒ `no_quorum` (`:340`) non rattrapé ⇒ FATAL (`:719`) ; le labeler gelé ne se corrige pas sans re-gel + re-prereg (prereg `:83`). Si faux : attendre que `finalized` dépasse `B_first + 30000` (vérifier sur la provenance du temps 2, postérieure), sinon STOP.

**Commande** (ENV-8 ; `--archive-operator` et `--allow-paid` ABSENTS) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node scripts/census/u3-realized.mjs \
  --events F:/course-ukemi/select/events-<EP>.json \
  --rawlogs F:/course-ukemi/select/A-rawlogs-<EP>.jsonl \
  --rawlogs-sha <RAWLOGS_SHA> \
  --prereg-file docs/PLAN-u4b-prereg.md \
  --prereg-sha 1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49 \
  --operators drpc.org,mevblocker.io,pocket.network,publicnode.com,blxrbdn.com \
  --out F:/course-ukemi/label/out \
  --raws-dir F:/course-ukemi/label/raws \
  --episode-tag <EP> \
  --max-calls <N_LAB> \
  > F:/course-ukemi/logs/label.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/label.log
```
Notes (parseur `u3-realized.mjs:413-443`, gardes `:477-517`) : labeler keyless HORS `@monark/rpc-guard` (fetch direct sur `PUBLIC_ENDPOINTS`, `apps/sentinel/src/rpc.ts:19-24` gelé ; `callOn` `:304-318`) ⇒ ni ledger, ni cycle, ni verrou ; budget = compteur interne `--max-calls` (`:305`, requis > 0 `:479`). `1rpc.io` refusé par code (`:283,:501-505`). `--out`/`--raws-dir` obligatoires, refusés sous `apps/sentinel/test/fixtures/` (`:491-496`). `--events` = tableau du sélecteur (`parseEventsFile` `:401-408`). `--episode-tag <EP>` **[R-M]**. `--min-interval-ms` défaut 60 (`:290,:475`). Reprise : `--raws-dir/u3-reads.jsonl` = cache des lectures CONCORDANTES (`remember` sur succès seulement `:350`, `loadCache` `:347-349`).

**Sorties attendues** : `U3-inputs.jsonl`, `U3-realized.jsonl`, `U3-sources.jsonl`, `U3-deficit.jsonl` dans `--out` (`:679-682`) ; `u3-reads.jsonl` dans `--raws-dir` (`:521`) ; stdout `[u3] start … prereg_sha=… rawlogs_sha ok`, `[u3] archive leg: none (keyless-only, CARTO-T1-1) | operators: …`, `[u3] <EP> cluster=… B_first=… B_last=… in_window=… outside=…`, résumé JSON entre `===U3_SUMMARY_BEGIN===` et `===U3_SUMMARY_END===` (`series_sha`, `calls`, `events`, `realized_rows`, `deficit_rows`, `raws_sha`, `:691-692`) ; `exit=0`.
**Contrôle** : C-6 → `chainstack_in_providers:false` et `archive_operator:null` (prereg `:292`) ; `prereg_ok:true` ; `rawlogs_sha == <RAWLOGS_SHA>` ; `events[0].b_first == B_first` ET `events[0].b_last == B_last` de la sélection (parité sélecteur/labeler, `ADR-U4b…md:595`) ; `events[0].impl == 0x97287a4f…` (cohérent avec 2c) ; `rows_by_event` ; **`labels_no_quorum`** (lignes `repayment_base: null`, `u3-realized.mjs:226`) ; `deficit_base_no_price_non_usdt` ; `deficit_base_no_price_usdt` (⇒ étape 5).

**STOP + acte (règle d'abstention pré-enregistrée, prereg `:87-89`)** :
- `labels_no_quorum > 0` ou `deficit_base_no_price` sur un actif ≠ USDT ⇒ **re-tirage sous budget** : relancer la commande IDENTIQUE (même `--raws-dir` ⇒ seules les lectures manquantes repartent) jusqu'à 0 ; sinon **STOP + D-n** ; **jamais d'exclusion silencieuse** d'un compte liquidé de la cellule A. (`labels_no_quorum` non résolus conditionnent aussi le go U-6, `:359`.)
- Parité `B_last` fausse ⇒ STOP + D-n (tuyau sélecteur → labeler).
- `FATAL` (exit 1) : `no_quorum` sur une lecture structurelle (finalized, ts de bloc, oracle), `MAX_CALLS … reached` (`:305`), sha `--rawlogs`/`--prereg-sha` refusé (`:482,:486`) ⇒ relance identique si transitoire (cache), re-budget R-26 si budget ; refus de sha = ÉCART = STOP.

**Sidecar 4** : `labeler | <date -u> | series_sha (4 fichiers) | raws_sha | calls | realized_rows | deficit_rows | labels_no_quorum | deficit_base_no_price usdt/non-usdt | parité B_last | providers`.

---

## Étape 5 — prober D_e `--episode-file` (keyless-only ; `--with-chainstack` ABSENT)

**Préconditions** : étape 4 close, `labels_no_quorum == 0` (ou D-n consignée) ; **R-H** : `<USDT_BLOCKS>` dérivé par **C-7-bis** (helper ; ruling R-1b4-1 : requis seuls ; C-7 reste un recoupement indépendant) ; **R-L** : `<EMODE_CATS>` dérivé par C-8 ; **R-I livré** par U-4b-1b-4 (ancre inconditionnelle, aucun flag à ajouter ; plafond `--pre-b0-max-windows` optionnel, défaut 6) ; **C-12 exit 0** (étape 2c-bis) ; arbre `<EXEC_TREE_E2>` à `<HEAD_E2>` (§A « Gel d'outillage ») ; gel d'outillage vide ; `selection_sha256` intact (vérifié aussi par code, 0 fetch sur écart, `u4-oracle-path.mjs:53-57`).

**Commande** (ENV-8) :
```
cd <EXEC_TREE_E2> && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node scripts/census/u4-oracle-path.mjs \
  --episode-file F:/course-ukemi/select/episode-selection.json \
  --prereg-file docs/PLAN-u4b-prereg.md \
  --prereg-sha 1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49 \
  --usdt-blocks <USDT_BLOCKS> \
  --emode-categories <EMODE_CATS> \
  --raws-dir F:/course-ukemi/prober/raws \
  --ledger-dir F:/monark-ledger/chainstack-2026-09-19 \
  --cycle chainstack-2026-09-19 \
  --floor <FLOOR> \
  --max-ru <MAX_RU> \
  --max-calls <N_PROBE> \
  --method-caps '{"eth_call":<N_PROBE>,"eth_getLogs":<N_PROBE>}' \
  > F:/course-ukemi/logs/prober.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/prober.log
```
Notes (parseur `u4-oracle-path.mjs:86-130`) :
- Si `<USDT_BLOCKS>` est VIDE : **supprimer la ligne `--usdt-blocks`** (statut `omitted`, `:106-108`). Ne JAMAIS passer `--usdt-blocks ""` : le parseur `:107` rend `[0]` (mesuré : `"".split(",").map(Number)` = `[0]`, entier) ⇒ lecture `getAssetPrice(USDT)` au bloc 0.
- `<EMODE_CATS>` peut être vide (`--emode-categories ""` ⇒ `[]`, filtre `n > 0`, `:112`) ; `--book <brut>` est invalide (R-L).
- `--feed-proxy` omis ⇒ défaut `0x5424384b256154046e9667ddfaaa5e550145215e` (§DISC `:28` ; `:34,:102-104`, provenance `feed_proxy_source:"default §DISC:28"`).
- `--floor`/`--max-ru`/`--method-caps` exigés par le parseur (`u4-guard.mjs:81-95`, entiers > 0) mais **inertes sans `--with-chainstack`** (`u4-guard.mjs:116-121` ; `buildLabelLists` `:62-69`) ⇒ mêmes valeurs qu'à l'étape 3 par cohérence (décision 121). `--with-chainstack` absent de la ligne figée (R-U-2, `ADR-U4b…md:700`).
- `mevblocker.io` exclu par code (`:124`) ⇒ jambes eth_call = `drpc.org, nodies.app, pocket.network` = **2 opérateurs distincts seulement** (drpc + {nodies,pocket}, `rpc2.ts:28-31`) : aucune marge (OBS-4).
- `<N_PROBE>` : minimum dérivé `2 × (2 + P_ancre + ⌈(B_last − B0 + 1)/9990⌉ × n_agrégateurs + |USDT_BLOCKS| + |EMODE_CATS|)` ; `P_ancre` = morceaux getLogs cumulés des fenêtres de l'ancre tentées = **2, 3, 5, 9, 17, 33** pour 1..6 fenêtres (fenêtre 1 = `[B0 − 9 990, B0]` = 2 morceaux ; fenêtre k ≥ 2 = `9 990·2^(k−2)` blocs ; ADDENDUM-2 (b)) ; × jusqu'à 4 tentatives (`retries: 3`) **[instance]** ; cas nominal (heartbeat ETH/USD ≤ 1 h, ADDENDUM §2) : `P_ancre = 2`.

**Sorties attendues** : `U4-oracle-path-<EP>.raw.json` et `U4-oracle-inputs.jsonl` dans `--raws-dir` (`:202-208`) ; stdout `u4-oracle-path episode=<EP> aggregator@B0=… aggregator@Blast=… phase_change=…`, `n_updates=… monotone_blocks=… p_min=… p_max=…`, `usdt_blocks_status=… usdt_prices=… emode_categories_read=… feed_proxy_source=…`, `calls=…`, `raw: … sha256=…`, `inputs: … sha256=…` ; `exit=0`.
**Contrôle** : **C-9-bis** (remplace C-9, annexe C) → `selection_sha_ok`, `prereg_ok`, `phase_change:false` (sinon `abi_mismatch:true`, C-4 du prober `:16`) ; `monotone_blocks:true` ; `n_updates > 0` ; `usdt_ok` (chaque bloc a un prix) ; `emode_ok` (chaque catégorie a une chaîne hex ; une entrée `{error}` est ignorée par le réducteur, `u4b-reduce.mjs:64`) ; **`has_pre_b0_anchor:true` exigé** (exit 3 sinon ; R-I livré par U-4b-1b-4) ; `pre_b0_anchor_window` et `pre_b0_max_windows` notés.

**STOP + acte** : `exit=2` = BUDGET STOP (`:218-221`, `process.exitCode = status` `:231`) — AUCUN chemin partiel écrit ⇒ re-budget R-26, relance ; `selection_sha256 mismatch` ⇒ fichier d'épisode altéré ⇒ ÉCART = STOP ; NoQuorum ⇒ relance différée / consultation ; `phase_change:true` ou catégorie e-mode sans hex ⇒ STOP + consultation **[à confirmer par l'orchestrateur]**. `exit=3` = **PRE-B0 ANCHOR STOP** (aucun `AnswerUpdated ≤ B0` dans les 6 fenêtres, ≈ 320 k blocs ; AUCUN raw écrit) ⇒ STOP + consultation ; le repli `book_weth_price_base_8dec` est **inadmissible** pour la course -1b hors D-n investisseur (ADDENDUM §2). H-6 (série servie, prereg `:103`) se juge au rapport (R-K).

**Sidecar 5** : `prober | <date -u> | raw sha256 | inputs sha256 | aggregator@B0/@Blast | phase_change | n_updates | p_min/p_max | USDT_BLOCKS (+ C-7) | EMODE_CATS (+ C-8) | calls | ancre : réelle `pre_b0_anchor {block, price, log_index, round_id}` + `pre_b0_anchor_window {from, to, windows_tried, calls}` | USDT optionnels : déclarés, non lus (R-1b4-1)`.

---

## Étape 6 — hors ligne : reduce → scores → registre (sous vérification des 9 sha, prereg `:310`)

**Préconditions** : R-I tranché ; 0.6 rejoué (9/9 = §2, arbre de travail == HEAD) — prereg `:4` (ii) « recompute des 9 sha … AVANT `u4b-reduce`/`u4b-scores` » ; gel d'outillage vide ; entrées présentes.

### 6a — réducteur
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node scripts/census/u4b/u4b-reduce.mjs \
  --book-raw F:/course-ukemi/record/U4-book-<B0>.raw.json \
  --oracle-raw F:/course-ukemi/prober/raws/U4-oracle-path-<EP>.raw.json \
  --labels F:/course-ukemi/label/out/U3-realized.jsonl \
  --event-id <EP> \
  --episode-tag <EP> \
  --out F:/course-ukemi/reduce \
  > F:/course-ukemi/logs/reduce.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/reduce.log
```
Notes : `--out` OBLIGATOIRE ici (défaut DANS le dépôt, `u4b-reduce.mjs:36` ; R-N) ; les bruts doivent être hors dépôt (`:37`). **`--event-id` DOIT valoir `episode.id`** = l'`event_id` des lignes du labeler (id du fichier events, `u4b-select-episode.mjs:127` ; `u3-realized.mjs:614,649`) : le scoreur ignore toute ligne d'un autre `event_id` (`u4b-scores.mjs:107`) ⇒ un écart viderait Y en silence.
**Sorties attendues** : `U4b-book-<B0>.json`, `U4b-oracle-path-<EP>.jsonl`, `U4b-scores-<EP>.jsonl` (`:57,:72,:85`) ; stdout `u4b-reduce: wrote 3 fixtures to … for episode <EP> (block <B0>, tag <EP>; accounts …, cellA n=… digest=…, cellB n=… digest=…)` (`:87`).
**Contrôle** : **C-10-bis** (remplace C-10 ; 4ᵉ argument `<B0>`, annexe C) → `anchor.source` = **`answer_updated_pre_b0` exigé** (exit 3 sinon) ; rapportés, jamais un STOP : `anchor.price − p0` et `census.pstar_is_anchor` (écart attendu sous SVR) ; `labels_rows_with_event_id == labels_rows_total` ; `usdt_prices` contient les blocs requis de C-7 ; `cellA`/`cellB` notés.

### 6b — scoreur (runner, 3 chemins positionnels OBLIGATOIRES, `u4b-scores.mjs:278-296`)
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node scripts/census/u4b/u4b-scores.mjs \
  F:/course-ukemi/reduce/U4b-book-<B0>.json \
  F:/course-ukemi/reduce/U4b-oracle-path-<EP>.jsonl \
  F:/course-ukemi/label/out/U3-realized.jsonl \
  > F:/course-ukemi/offline/scores-summary-<EP>.json 2> F:/course-ukemi/logs/scores.err; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/scores.err
```
**Sortie** : JSON `{cellA:{n, qhat, calib_digest, strata:[{k,n,q}]}, cellB:{n, qhat, calib_digest}, census}` (`:295`). **Contrôle** : `cellA.calib_digest` et `cellB.calib_digest` == ceux imprimés en 6a (même fonction gelée sur les fixtures réduites, `u4b-reduce.mjs:78`).

### 6c — générateur de registre classe A (`record-u4b-calib.mjs:64-84`)
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node scripts/record-u4b-calib.mjs \
  --scores F:/course-ukemi/reduce/U4b-scores-<EP>.jsonl \
  --scale 1 \
  > F:/course-ukemi/offline/registry-A-<EP>.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/offline/registry-A-<EP>.log
```
**Sortie** : JSON `{class, n_min, alpha, strata:[{strate, predictor_id, n, p, qhat, scale, calib_digest, under_calib}]}` puis `registry: <k>/<n> strata committable (n ≥ 100)…` (`:80-83`) ; n'écrit rien d'autre (stdout seul). `--scale 1` = choix de méthode déclaré (C-V-7, prereg `:330`). Contrôles par code : anti-circularité `splitQuantile` vs main (`:49-50`), fail-closed divisibilité/2^53 (`:38-41`).

### 6d — H-n (la course CLÔT sur les données H-1..H-4, décision 129 ; prereg `:95-106`)
- **H-2** : strate n < 100 ⇒ `under_calib`, q̂ null, comptée (`:97` ; `u4b-scores.mjs:68`).
- **H-2bis** : q̂ intérieur seulement si n ≥ 199 par strate servie ; sinon q̂ = max, rapporté tel quel (`:98`).
- **Rapport à côté de q̂₀** (`:99`) : `census.crossed_yhat_zero` + ensemble {ŷ=0 ∧ liquidés} avec Y, sous-divisé par `pstar` (lignes `score_a` de `U4b-scores-<EP>.jsonl`).
- **H-3** (bêta-binomial exact unilatéral 5 %, par strate servie + cellule A poolée, contre la fixture `U4b-scores-e2.jsonl` — sha LF `301d39fa…` vérifié PAR CODE, aucun flag `--reference`) : outil `scripts/census/u4b/u4b-hyp.mjs` (lot U-4b-STATS-1, ruling R-K ; checkpoint-1 C-1..C-12). K = #{`score_a` e2 ≤ q̂_frais} ; loi nulle BB(n_e2, p, n+1−p), `n`/`p`/`q̂` LUS dans la méta du producteur gelé et assertés ; queue BASSE ; NON ssi p-value ≤ 5/100 (rationnel exact) ; verdicts {OUI, NON, UNDER_CALIB (n_frais < 100), NON_TESTABLE_E2 (n_e2 < 50 : strates 2/3 e2 = 46/8)} ; résultat mesuré, jamais pré-décidé.
- **H-4** (numérateur = Σ remboursements floor des appels APRÈS le premier par (block, log_index) ; dénominateur = `y` des scores ; deficit rapporté à part ; médiane exacte + Σ par strate ; fractions multi-appels cellule A et tous liquidés vs 5 %) et **H-6** (valeurs servies = lignes `kind:"price"` WETH `price`/`price_prev` aux blocs des appels de EP ; série = ancre p0 + lignes `update` du oracle-path RÉDUIT ; NON ssi valeur ∉ events ∪ {p0} ou retard > 3 events ; `anchor.source` rapporté — repli prix-book = chemin D-n, R-I) : même outil, sous-commande `report`. **Précondition d'ordre (C-4)** : le lot U-4b-STATS-1 est FUSIONNÉ et le sha LF de `u4b-hyp.mjs` (blob HEAD) est écrit au sidecar 6 AVANT l'étape 6a ; un brut frais existant avant la fusion ⇒ D-n déclarée. Commande (0 réseau, ENV-8) :
```
cd F:/Monark && git show HEAD:scripts/census/u4b/u4b-hyp.mjs | tr -d '\r' | sha256sum   # -> sidecar 6 (AVANT 6a) ; == provenance.tool.sha256_lf du rapport
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node scripts/census/u4b/u4b-hyp.mjs report \
  --scores F:/course-ukemi/reduce/U4b-scores-<EP>.jsonl \
  --inputs F:/course-ukemi/label/out/U3-inputs.jsonl \
  --u3-realized F:/course-ukemi/label/out/U3-realized.jsonl \
  --oracle-path F:/course-ukemi/reduce/U4b-oracle-path-<EP>.jsonl \
  --event-id <EP> \
  --out F:/course-ukemi/offline/hyp-report-<EP>.json \
  > F:/course-ukemi/logs/hyp-report.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/hyp-report.log
```
**Sortie** : `hyp-report-<EP>.json` = `{schema, kind, provenance:{tool:{rel,sha256_lf}, node, inputs (sha LF par rôle, e2 + prereg épinglés), event_id}, body:{h3, h4, h6, h2, h2bis, q0_rule_failures, h5, h7, labels, clause_359, summary}, body_digest}` ; `--out` refusé sous le dépôt et jamais écrasé ; aucun jeton de décision (décision 137 : entrée de décision). **STOP** (refus nommés `HypError`, jamais contournés) : sha de la fixture e2 ou du prereg ≠ épinglé ; méta `p`/`q̂`/`n` incohérente ; rapprochement exact d'une position ≠ `repayment_base` ; `event_id` incohérent entre entrées ⇒ STOP + demande de consultation formée.
- **H-5** : `n_at_risk_config` (3a) et `cellA.n` rapportés (`:102`). **H-7** : `census.pstar_is_anchor` rapporté (`u4b-scores.mjs:178`).
- **STOP (throws fail-closed du scoreur)** : `deficit_base_no_price on non-USDT asset` (`:113`) ⇒ retour étape 4 (re-tirage) ou D-n ; `no USDT price at block <b>` (`:115`) ⇒ `<USDT_BLOCKS>` incomplet ⇒ retour étape 5 (C-7) ; `anchor_price` absent/≤ 0 (`:82-84`) ⇒ STOP.

**Sidecar 6** : `hors-ligne | <date -u> | 9 sha recomputés (9/9) | sha256 LF des 3 fixtures réduites | cellA n/qhat/calib_digest | cellB n/calib_digest | strates k/n/p/q̂/under_calib | registre (strates committables) | ancre (source) | sha LF `u4b-hyp.mjs` (blob HEAD, écrit AVANT 6a ; == `provenance.tool.sha256_lf`) | `hyp-report-<EP>.json` sha256 + `body_digest` | H-3 verdict par strate + poolé (k, n_e2, p-value) | H-4 fractions cellule A / tous + parts par strate | H-6 verdict + retard max | H-2/H-2bis/H-5/H-7 (du rapport) | `clause_359` {h3_no_NON_on_served_strata, labels_no_quorum_unresolved, condition_satisfied}`.

---

## Étape 7 — `reconcile` Chainstack = GATE DE COMPTABILITÉ SÉPARÉE (décision 129 ; ne retient ni la clôture ni -2b/U-5/U-6/U-7)

**Déclencheur** : colonne du jour visible au dashboard (≥ 24 h) (prereg `:156,:288`). **Protocole A-4** (`:160-168`) : fenêtre d'une journée entière ; double lecture de stabilité de `after` après le délai de mise à jour (deux lectures identiques espacées) ; aucune lecture dans 00:30–01:00, 03:30–04:00, 06:30–07:00, 09:30–10:00 UTC ; résiduel Narabi soustrait en MINORANT, lu au journal du sentinel (appels Chainstack du jour, `ethereum-mainnet`). Lectures = actes orchestrateur sur place (FAITS datés).

**Préconditions** : `F:/monark-ledger/chainstack-2026-09-19/chainstack-2026-09-19/chainstack.jsonl` EXISTE (né au recorder ; mesuré : absent aujourd'hui) ; aucun verrou `chainstack.lock` (le reconcile le prend, `cli.ts:30`) ; **R-O** tranché ; snapshots écrits puis validés par C-11 AVANT le passage (un NO-GO de forme — `rollover`, `aggregate_mode_*`, `negative_delta` — ajoute AUSSI une ligne `reconciled` et referme la fenêtre, `reconcile.ts:51-55,62-66` ; un second passage lirait `ledger_run = 0`, `:37-47`, ⇒ `hard:total`).

**Snapshots** (forme agrégat : `{cycle,total_ru}`, `byMethod` absent, `reconcile.ts:62-63` ; `cycle` == `--cycle`, `:55`) :
```
printf '{"cycle":"chainstack-2026-09-19","total_ru":%s}\n' <TOTAL_BEFORE> > F:/course-ukemi/reconcile/snapshot-before.json
printf '{"cycle":"chainstack-2026-09-19","total_ru":%s}\n' <TOTAL_AFTER_NET> > F:/course-ukemi/reconcile/snapshot-after.json
```
`<TOTAL_BEFORE>` = la lecture floor retenue par R-D (celle passée en `--floor`) ; `<TOTAL_AFTER_NET>` = lecture après stabilisée − minorant Narabi (et toute autre consommation Chainstack du compte dans la fenêtre, p. ex. Bell, décision 121 `:158`) **[à confirmer par l'orchestrateur — R-O]**.

**Commande** (ENV-8 ; le bin ne lit aucun secret, `rpc-guard.mjs:5-6`) — **UN SEUL PASSAGE** :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY \
  node packages/rpc-guard/bin/rpc-guard.mjs \
  --ledger-dir F:/monark-ledger/chainstack-2026-09-19 \
  --floor <FLOOR> \
  reconcile \
  --before F:/course-ukemi/reconcile/snapshot-before.json \
  --after F:/course-ukemi/reconcile/snapshot-after.json \
  --cycle chainstack-2026-09-19 \
  --op chainstack \
  --mode aggregate-calibration \
  > F:/course-ukemi/logs/reconcile.log 2>&1; echo "exit=$? $(date -u +%FT%TZ)" >> F:/course-ukemi/logs/reconcile.log
```
Notes : `--ledger-dir`/`--floor` = args du bin, dépouillés avant `runCli` (`rpc-guard.mjs:13-24`) ; `--floor` n'affecte pas le verdict (prereg `:286`) ; `--mode aggregate-calibration` obligatoire pour `chainstack` (`cli.ts:25-28`).
**Sorties attendues** : `GO calibration_soft:<n>` + `exit=0` (bande souple CONSIGNÉE, pré-enregistre la bande de la 2ᵉ course, `reconcile.ts:69-73`) ; ou `NO-GO <raison>` + `exit=1` ; `exit=2` sur erreur d'usage (`rpc-guard.mjs:16,20,30`). Une ligne `reconciled` chaînée est ajoutée à `chainstack.jsonl` (`:52`).

**STOP + acte** : `NO-GO hard:total` (Δ > ledger_run, `:67`) ⇒ consommation hors garde OU minorant sous-estimé ⇒ STOP + enquête ; **aucune nouvelle dépense Chainstack** (décision 129) ; `rollover`/`negative_delta`/`aggregate_mode_*` ⇒ NO-GO (évités par C-11). Le verdict conditionne UNIQUEMENT le statut `built` de `@monark/rpc-guard` au registre interne et toute NOUVELLE dépense Chainstack (prereg `:285`) ; toute course Chainstack ultérieure (U-6 live) ré-enclenche cette gate.

**Sidecar 7** : `reconcile | <date -u> | before (valeur + heure) | after lectures n°a/n°b (valeurs + heures, hors créneaux) | minorant Narabi (source journal, sha) | Δ | ledger_run | verdict | calibration_soft`.

---

## Étape 8 — items -2b / U-5b (et suites) — déclencheurs, sans chiffre

- **-2b (atterrissage de la calibration fraîche)** : copie des 3 fixtures réduites de `F:/course-ukemi/reduce/` vers `apps/sentinel/test/fixtures/ukemi/u4b/` (PROVENANCE sha-pinnée) et épinglage des entrées de `registry-A-<EP>` dans `apps/harness/src/calibration.ts` (« The orchestrator pins these in calibration.ts in -2 from the FRESH episode (R-20) », `record-u4b-calib.mjs:7-8,83`) ; classe A seule (décision 108) ; région servie = borne haute `[0, ŷ + q̂_k]` (décision 126, prereg `:68`) ; q̂ intérieur seulement si n ≥ 199 (H-2bis). Items rattachés : 123(ii) (déclencheur -2b, `CHANTIERS.md:761` C-5) ; mutant (f) (déclencheur fusion -2b, rejoué en -5b, `:761` C-3). **Déclencheur** : course close sur H-1..H-4 + étape 6 verte. Propriétaire : orchestrateur (R-20).
- **U-5b** : enregistrement `ukemi-predict` dans `ALLOWED_TOOL_NAMES` + route HTTP + retrait `cascade` 4→4 + re-pin h5 + verify-harness + skill/MCP/README/site dans la MÊME fusion (option (B), `CHANTIERS.md:760`) ; A-9-OUTILLE (portée vocabulaire du harness, `:766` ; checkpoint-1 `b130852`). **Déclencheur** : -2b fusionné. Bloqués par la course : -2b/U-5b/U-6/U-7 (`:824`).
- **Go U-6 conditionnel pré-enregistré** (`PLAN-u4b-prereg.md:359`) : GO sans nouveau tour ssi aucune strate servie en NON à H-3 ET `labels_no_quorum` non résolus = 0 ; sinon retour investisseur avec les chiffres. **Entrée = `body.clause_359` de `F:/course-ukemi/offline/hyp-report-<EP>.json`** (lot U-4b-STATS-1, ruling R-K) : `h3_no_NON_on_served_strata` (NON compté sur les seules strates SERVIES, n_frais ≥ 100 ; UNDER_CALIB/NON_TESTABLE_E2 ne comptent jamais), `labels_no_quorum_unresolved` (= lignes `repayment_base: null` de l'épisode, `u3-realized.mjs:226`), `condition_satisfied` ; le verdict H-3 de la cellule A POOLÉE est rapporté HORS condition (demande formée Q-1 du G1 U-4b-STATS-1) ; application MÉCANIQUE par l'orchestrateur (décision 137) — le rapport n'émet jamais de jeton de décision.
- **R-U-2** (`scripts/census/u4-guard.mjs:136`, classifieur `NonJsonBody` non aligné) : déclencheur clôture de course / frontière ancrée / ajout de `--with-chainstack` (`ADR-U4b…md:697-704`).
- **NARABI-OPS-1d pli §11-1** (suppression du code mort de `rpc.ts`, retrait d'allowlist) + 2ᵉ redéploiement VPS : déclencheur clôture de course (`CHANTIERS.md:783`).
- **Gate reconcile** (étape 7) ⇒ statut `built` de `@monark/rpc-guard` ; wrapper 1b-i (`PLAN-u4b-prereg.md:288`).

---

## Annexe C — contrôles hors ligne (0 réseau ; tous exécutés par le worker le 2026-09-22 sur l'entrée indiquée)

**C-0 — brut discover** (testé sur le brut réel : `recomputed_ok:true`) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node --input-type=module -e 'import { readFileSync } from "node:fs"; import { canon, sha256Hex } from "./scripts/census/u4b/liquidation-logs.mjs"; const f = JSON.parse(readFileSync("F:/course-ukemi/discover/weth-discover-2026-09-22.json", "utf8")); const b = f.brut; console.log(JSON.stringify({ schema: b.schema, phase: b.phase, from_block: b.from_block, to_block: b.to_block, n_logs: b.n_logs, n_records: b.records.length, n_block_ts: Object.keys(b.block_ts).length, carried: f.provenance.brut_sha256, recomputed_ok: sha256Hex(canon(b)) === f.provenance.brut_sha256 }));'
```

**C-1 — sidecar fill-ts** (testé sur un sidecar synthétique) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node --input-type=module -e 'import { readFileSync } from "node:fs"; import { canon, sha256Hex } from "./scripts/census/u4b/liquidation-logs.mjs"; const sc = JSON.parse(readFileSync(process.argv[1], "utf8")); console.log(JSON.stringify({ phase: sc.phase, discover_sha: sc.discover_sha, discover_ok: sc.discover_sha === "2ffa3acfa317118e419545bdf0e80491a425097f34d391db30ad0f0d3b093fa8", n_extra: sc.n_extra, self_sha_ok: sha256Hex(canon(sc.block_ts_extra)) === sc.block_ts_extra_sha256, block_ts_extra_sha256: sc.block_ts_extra_sha256 }));' F:/course-ukemi/select/block-ts-extra.json
```

**C-2 — sélection** (testé sur une sélection synthétique construite avec `buildARawlogs`/`selectionSha` du code ; `discover_ok`/`prereg_ok` y rendent `false`, le payload synthétique portant `discover_sha:"2ffa"`/`prereg_sha:"p"` — détection prouvée) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node --input-type=module -e 'import { readFileSync } from "node:fs"; import { createHash } from "node:crypto"; import { canon, sha256Hex } from "./scripts/census/u4b/liquidation-logs.mjs"; const d = process.argv[1] + "/"; const f = JSON.parse(readFileSync(d + "episode-selection.json", "utf8")); const { version_check, selection_sha256, ...payload } = f; const raw = (p) => createHash("sha256").update(readFileSync(d + p)).digest("hex"); const e = f.episode; console.log(JSON.stringify({ episode: e, discover_sha: f.discover_sha, discover_ok: f.discover_sha === "2ffa3acfa317118e419545bdf0e80491a425097f34d391db30ad0f0d3b093fa8", prereg_ok: f.prereg_sha === "1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49", selection_sha256, selection_sha_ok: sha256Hex(canon(payload)) === selection_sha256, rawlogs_sha256: f.rawlogs_sha256, rawlogs_ok: raw(f.rawlogs_file) === f.rawlogs_sha256, events_sha256: f.events_sha256, events_ok: raw(f.events_file) === f.events_sha256, b0_ok: e.B0 === e.B_first - 1, n_min_ok: e.n_distinct >= 50, residual_outside_window: f.residual_outside_window, n_eligible: f.n_eligible, window_truncated: f.window_truncated, n_excluded_e2: f.n_excluded_e2, e2_window: f.e2_window, b_hi: f.b_hi, block_ts_extra_sha256: f.block_ts_extra_sha256 ?? null, version_check }));' F:/course-ukemi/select
```

**C-3 — H-1** (testé : `pending` ⇒ exit 3) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node -e 'const v = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).version_check; console.log(JSON.stringify(v)); const ok = v && v.status === "checked" && v.version_ok === true && v.impl === "0x97287a4f35e583d924f78ad88db8afce1379189a"; console.log(ok ? "H-1 OK (impl == v3.5.0)" : "H-1 NON ou non verifie => STOP (voir etape 2c)"); process.exit(ok ? 0 : 3);' F:/course-ukemi/select/episode-selection.json; echo "C-3 exit=$?"
```

**C-4 / C-5 — provenance du recorder** (testé sur une provenance synthétique ; argument = `U4-filter-<B0>.json` au temps 1, `U4-book-<B0>.raw.json` au temps 2) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node -e 'const p = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).provenance; const q = p.params ?? {}; console.log(JSON.stringify({ phase: p.phase ?? "book", block: q.block, from_block: q.from_block ?? null, prereg_binding: q.prereg_binding, binding_ok: q.prereg_binding === "docs/PLAN-u4b-prereg.md", prereg_ok: q.prereg_sha === "1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49", labeler_ok: q.labeler_sha === "cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af", finalized_block: p.finalized_block, holders: p.holders ?? p.counts?.holders, holders_digest: p.holders_digest, n_at_risk_config: p.n_at_risk_config ?? null, projection_remaining_calls: p.projection_remaining_calls ?? null, counts: p.counts ?? null, book_digest: p.book_digest ?? null, calls: p.calls, calls_by_operator: p.calls_by_operator, spent_by_operator: p.spent_by_operator, errors_by_operator: p.errors_by_operator, rpc_error_count: p.rpc_error_count, ukemi_sha: p.ukemi_sha }));' F:/course-ukemi/record/U4-filter-<B0>.json
```

**C-6 — labeler** (testé sur les fixtures U-3 réelles : `chainstack_in_providers:false`, `labels_no_quorum:0`, `deficit_base_no_price_usdt:1`, `non_usdt:0` ; `prereg_ok:false` attendu sur cette fixture, liée à `docs/PLAN-u3-prereg.md`) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node -e 'const fs = require("fs"), d = process.argv[1] + "/"; const L = (f) => fs.readFileSync(d + f, "utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse); const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7"; const meta = L("U3-inputs.jsonl").find((o) => o.kind === "meta"); const R = L("U3-realized.jsonl"); const dnp = R.filter((o) => BigInt(o.deficit_base ?? "0") === 0n && Array.isArray(o.residual) && o.residual.includes("deficit_base_no_price") && BigInt(o.deficit_native ?? "0") > 0n); console.log(JSON.stringify({ providers: meta.providers, chainstack_in_providers: meta.providers.some((p) => /chainstack/i.test(p)), archive_operator: meta.archive_operator ?? null, episode_tag: meta.episode_tag ?? null, prereg_sha: meta.prereg_sha, prereg_ok: meta.prereg_sha === "1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49", rawlogs_sha: meta.rawlogs_sha, events: meta.events.map((e) => ({ id: e.id, b_first: e.b_first, b_last: e.b_last, impl: e.impl, n_calls_window: e.n_calls_window })), realized_rows: R.length, rows_by_event: R.reduce((a, o) => (a[o.event_id] = (a[o.event_id] ?? 0) + 1, a), {}), labels_no_quorum: R.filter((o) => o.repayment_base === null).length, residual_no_quorum: R.filter((o) => Array.isArray(o.residual) && o.residual.includes("no_quorum")).length, deficit_base_no_price_usdt: dnp.filter((o) => String(o.debt_asset).toLowerCase() === USDT).length, deficit_base_no_price_non_usdt: dnp.filter((o) => String(o.debt_asset).toLowerCase() !== USDT).length }));' F:/course-ukemi/label/out
```

**C-7 — `<USDT_BLOCKS>` (R-H)** (testé sur les fixtures U-3 e2 : `required_first_blocks=23550406`, `optional_deficitcreated_blocks=23550879`, `USDT_BLOCKS=23550406,23550879` = exactement les clés `usdt_prices` de la fixture e2) — reproduit la condition du scoreur gelé (`u4b-scores.mjs:109-116`) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node -e 'const fs=require("fs"), d=process.argv[1]; const L=(f)=>fs.readFileSync(d+"/"+f,"utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse); const USDT="0xdac17f958d2ee523a2206206994597c13d831ec7"; const R=L("U3-realized.jsonl").filter(o=>BigInt(o.deficit_base??"0")===0n && Array.isArray(o.residual) && o.residual.includes("deficit_base_no_price") && BigInt(o.deficit_native??"0")>0n); const nonUsdt=R.filter(o=>String(o.debt_asset).toLowerCase()!==USDT); const need=[...new Set(R.filter(o=>String(o.debt_asset).toLowerCase()===USDT).map(o=>o.first_block))].sort((a,b)=>a-b); const users=new Set(R.map(o=>String(o.user).toLowerCase())); const opt=[...new Set(L("U3-inputs.jsonl").filter(o=>o.kind==="deficit" && String(o.debt_asset).toLowerCase()===USDT && users.has(String(o.user).toLowerCase())).map(o=>o.block))].sort((a,b)=>a-b); console.log("non_usdt_deficit_base_no_price="+nonUsdt.length); console.log("required_first_blocks="+need.join(",")); console.log("optional_deficitcreated_blocks="+opt.join(",")); console.log("USDT_BLOCKS="+[...new Set([...need,...opt])].sort((a,b)=>a-b).join(","));' F:/course-ukemi/label/out
```
`non_usdt_deficit_base_no_price > 0` ⇒ STOP (étape 4, règle d'abstention). `required_first_blocks` vide ⇒ supprimer `--usdt-blocks` (étape 5). Preuve du défaut du helper documenté (mesurée) : `usdtBlocksFromLabelerDeficit(U3-deficit.jsonl e2) = []` ; `(U3-inputs.jsonl e2) = [23549984,23549992,23549993,23550195,23550199,23550879,23551670]` (sans 23550406).

**C-7-bis — `<USDT_BLOCKS>` par le helper livré (R-H ; U-4b-1b-4 ; remplace l'usage de C-7, qui reste un recoupement indépendant)** (testé sur `apps/sentinel/test/fixtures/ukemi/u3` : `required_first_blocks=23550406`, `optional_deficitcreated_blocks=23550879`, `USDT_BLOCKS_REQUIRED=23550406`, `USDT_BLOCKS_WITH_OPTIONAL=23550406,23550879` ; rejoué par le checkpoint-2 et le re-checkpoint-2) — le helper importé est celui de `<HEAD_E2>` :
```
cd <EXEC_TREE_E2> && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node --input-type=module -e 'import { readFileSync } from "node:fs"; import { usdtBlocksFromLabelerDeficit } from "./scripts/census/u4-oracle-path.mjs"; const d = process.argv[1]; const r = usdtBlocksFromLabelerDeficit(readFileSync(d + "/U3-realized.jsonl", "utf8"), readFileSync(d + "/U3-inputs.jsonl", "utf8")); console.log("required_first_blocks=" + r.required.join(",")); console.log("optional_deficitcreated_blocks=" + r.optional.join(",")); console.log("USDT_BLOCKS_REQUIRED=" + r.required.join(",")); console.log("USDT_BLOCKS_WITH_OPTIONAL=" + r.blocks.join(","));' F:/course-ukemi/label/out
```
`<USDT_BLOCKS>` = `USDT_BLOCKS_REQUIRED` (ruling R-1b4-1 ; minimal et prouvé suffisant : digests e2 A/B inchangés avec les seuls blocs requis) ; `USDT_BLOCKS_WITH_OPTIONAL` est rapporté au Sidecar 5 (« déclarés, non lus »). Une ligne `deficit_base_no_price` NON-USDT ⇒ la commande jette (exit 1, message nommé) ⇒ STOP étape 4. `required` vide ⇒ supprimer `--usdt-blocks` (jamais `--usdt-blocks ""`, étape 5).

**C-8 — `<EMODE_CATS>` (R-L)** (testé sur un brut synthétique `{provenance, book:{accounts:[emode 0,1,3,1]}}` : `EMODE_CATS=1,3` ; le même brut passé en `--book` jette « --book has no accounts[] (fail-closed) ») :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node --input-type=module -e 'import { readFileSync } from "node:fs"; import { emodeCategoriesFromBook } from "./scripts/census/u4-oracle-path.mjs"; const raw = JSON.parse(readFileSync(process.argv[1], "utf8")); console.log("EMODE_CATS=" + emodeCategoriesFromBook(raw.book).join(","));' F:/course-ukemi/record/U4-book-<B0>.raw.json
```
(L'import ne déclenche pas le prober : garde d'exécution `u4-oracle-path.mjs:229`.)

**C-9 — raw prober** (testé sur un raw synthétique ; arguments = raw, sélection) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node -e 'const fs = require("fs"); const r = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); const sel = JSON.parse(fs.readFileSync(process.argv[2], "utf8")); const P = r.provenance; const emodeOk = (P.params.emode_categories ?? []).every((c) => typeof r.emode_raw[c] === "string"); const usdtOk = (P.params.usdt_blocks ?? []).every((b) => r.usdt_prices[b] !== undefined); console.log(JSON.stringify({ selection_sha_ok: P.selection_sha256 === sel.selection_sha256, prereg_ok: P.prereg_sha === "1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49", aggregator: r.aggregator, n_updates: r.n_updates, monotone_blocks: r.monotone_blocks, p_min: r.p_min, p_max: r.p_max, usdt_ok: usdtOk, emode_ok: emodeOk, emode_raw_keys: Object.keys(r.emode_raw), has_pre_b0_anchor: r.pre_b0_anchor !== undefined, calls: P.calls }));' F:/course-ukemi/prober/raws/U4-oracle-path-<EP>.raw.json F:/course-ukemi/select/episode-selection.json
```

**C-9-bis — raw prober avec ancre réelle (remplace C-9)** (testé sur un raw RÉEL du prober, CLI sous e2 bouchonné : `has_pre_b0_anchor:true`, exit 0 ; rejoué par le checkpoint-2 et le re-checkpoint-2) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node -e 'const fs = require("fs"); const r = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); const sel = JSON.parse(fs.readFileSync(process.argv[2], "utf8")); const P = r.provenance; const emodeOk = (P.params.emode_categories ?? []).every((c) => typeof r.emode_raw[c] === "string"); const usdtOk = (P.params.usdt_blocks ?? []).every((b) => r.usdt_prices[b] !== undefined); const a = r.pre_b0_anchor; const anchorOk = a !== undefined && a !== null && Number.isInteger(a.block) && a.block <= P.params.b0 && /^-?[0-9]+$/.test(String(a.price)); console.log(JSON.stringify({ selection_sha_ok: P.selection_sha256 === sel.selection_sha256, prereg_sha: P.prereg_sha, aggregator: r.aggregator, n_updates: r.n_updates, monotone_blocks: r.monotone_blocks, p_min: r.p_min, p_max: r.p_max, usdt_ok: usdtOk, emode_ok: emodeOk, emode_raw_keys: Object.keys(r.emode_raw), has_pre_b0_anchor: anchorOk, pre_b0_anchor: a ?? null, pre_b0_anchor_window: P.pre_b0_anchor_window ?? null, pre_b0_max_windows: P.params.pre_b0_max_windows ?? null, calls: P.calls })); process.exit(anchorOk ? 0 : 3);' F:/course-ukemi/prober/raws/U4-oracle-path-<EP>.raw.json F:/course-ukemi/select/episode-selection.json; echo "C-9-bis exit=$?"
```

**C-10 — fixtures réduites** (testé sur les fixtures u4b e2 : `anchor.source:"book_weth_price_base_8dec"`, 194/198 lignes U-3 à l'`event_id` e2, `cellA.calib_digest 2feb4ab0…`, `cellB 07bb8e3b…` = prereg `:403`) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node -e 'const fs = require("fs"); const [dir, ep, labels] = process.argv.slice(1); const L = (p) => fs.readFileSync(p, "utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse); const o = L(dir + "/U4b-oracle-path-" + ep + ".jsonl"); const s = L(dir + "/U4b-scores-" + ep + ".jsonl"); const meta = o.find((x) => x.kind === "meta"); const sm = s.find((x) => x.kind === "meta"); const R = L(labels); console.log(JSON.stringify({ anchor: o.find((x) => x.kind === "anchor"), oracle_event_id: meta.event_id, labels_rows_with_event_id: R.filter((r) => r.event_id === meta.event_id).length, labels_rows_total: R.length, usdt_prices: meta.usdt_prices, cellA: { n: sm.cell_a.n, qhat: sm.cell_a.qhat, calib_digest: sm.cell_a.calib_digest }, cellB: { n: sm.cell_b.n, calib_digest: sm.cell_b.calib_digest }, census_keys: Object.keys(sm.census) }));' F:/course-ukemi/reduce <EP> F:/course-ukemi/label/out/U3-realized.jsonl
```
(Sur l'épisode frais, `labels_rows_with_event_id` DOIT égaler `labels_rows_total` : le fichier events n'a qu'un épisode.)

**C-10-bis — fixtures réduites avec ancre réelle (remplace C-10 ; 4ᵉ argument = `<B0>`)** (testé sur la sortie du réducteur GELÉ lancé sur un raw réel du prober : `anchor_is_real:true`, exit 0 ; rejoué par le checkpoint-2 et le re-checkpoint-2) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node -e 'const fs = require("fs"); const [dir, ep, labels, b0] = process.argv.slice(1); const L = (p) => fs.readFileSync(p, "utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse); const o = L(dir + "/U4b-oracle-path-" + ep + ".jsonl"); const s = L(dir + "/U4b-scores-" + ep + ".jsonl"); const book = JSON.parse(fs.readFileSync(dir + "/U4b-book-" + b0 + ".json", "utf8")); const wr = book.reserves.find((x) => String(x.asset).toLowerCase() === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"); const anchor = o.find((x) => x.kind === "anchor"); const meta = o.find((x) => x.kind === "meta"); const sm = s.find((x) => x.kind === "meta"); const R = L(labels); const real = anchor.source === "answer_updated_pre_b0"; console.log(JSON.stringify({ anchor, anchor_is_real: real, anchor_vs_p0: { anchor_price: anchor.price, p0: wr.price_base_8dec, anchor_minus_p0: (BigInt(anchor.price) - BigInt(wr.price_base_8dec)).toString() }, pstar_is_anchor: sm.census.pstar_is_anchor, cell_a_anchor_price: sm.cell_a.anchor_price, oracle_event_id: meta.event_id, labels_rows_with_event_id: R.filter((r) => r.event_id === meta.event_id).length, labels_rows_total: R.length, usdt_prices: meta.usdt_prices, deficit_lines_priced_from_usdt: sm.census.deficit_lines_priced_from_usdt, cellA: { n: sm.cell_a.n, qhat: sm.cell_a.qhat, calib_digest: sm.cell_a.calib_digest }, cellB: { n: sm.cell_b.n, calib_digest: sm.cell_b.calib_digest } })); process.exit(real ? 0 : 3);' F:/course-ukemi/reduce <EP> F:/course-ukemi/label/out/U3-realized.jsonl <B0>; echo "C-10-bis exit=$?"
```

**C-11 — snapshots du reconcile** (testé sur des snapshots synthétiques : `snapshots_ok:true`, exit 0) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node -e 'const fs = require("fs"); const [b, a] = process.argv.slice(1).map((p) => JSON.parse(fs.readFileSync(p, "utf8"))); const C = "chainstack-2026-09-19"; const ok = b.cycle === C && a.cycle === C && Number.isFinite(b.total_ru) && Number.isFinite(a.total_ru) && b.byMethod === undefined && a.byMethod === undefined && a.total_ru - b.total_ru >= 0 && Object.keys(b).length === 2 && Object.keys(a).length === 2; console.log(JSON.stringify({ before: b, after: a, delta: a.total_ru - b.total_ru, snapshots_ok: ok })); process.exit(ok ? 0 : 3);' F:/course-ukemi/reconcile/snapshot-before.json F:/course-ukemi/reconcile/snapshot-after.json; echo "C-11 exit=$?"
```

**C-12 — verdict de la sonde (d) (étape 2c-bis ; ADDENDUM §1)** — exit 0 ssi `verdict == "GO"` sous la règle pré-enregistrée (testé : GO ⇒ 0, STOP ⇒ 3 ; rejoué par le checkpoint-2 et le re-checkpoint-2). Le corps `node -e` est, à l'octet, la constante `C12` de `apps/sentinel/test/u4b-probe-cutoff.test.ts:22` (égalité vérifiée à l'insertion ; item C12-PIN) :
```
cd F:/Monark && env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node -e 'const r = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")); console.log(JSON.stringify({ verdict: r.verdict, reason: r.reason, c_fresh: r.c_fresh, c_e2: r.c_e2, deploy_value: r.deploy_value, aggregator: r.aggregator, range: r.range, n_events: r.events.length, calls: r.calls, selection_sha256: r.selection_sha256 })); process.exit(r.verdict === "GO" && r.rule === "c_fresh == c_e2" && r.c_fresh !== null && r.c_fresh === r.c_e2 ? 0 : 3);' F:/course-ukemi/probe/cutoff-<B0>.json; echo "C-12 exit=$?"
```
C-12 ≠ 0 ⇒ STOP + retour investisseur (étape 2c-bis).

---

## Annexe O — observations (non bloquantes seules ; chacune = item formé à déclencheur)

- **OBS-1** : littéral `model: "claude-opus-4-8[1m]"` dans la provenance des scripts (`record.ts:380,411,440` ; `u4-oracle-path.mjs:188,204` ; `u3-realized.mjs:667`) ⇒ l'exécutant réel est consigné au sidecar. Item : paramétrer ou renommer en `code_author` (lot hors gel ; `u3-realized.mjs` est gelé ⇒ jamais avant la clôture). Déclencheur : prochain lot touchant ces scripts, hors `u3-realized.mjs` — ATTEINT par U-4b-1b-4 pour `u4-oracle-path.mjs` sans traitement (littéral conservé, `:266,283` à `206bc56` ; ruling du G7 : item OBS-1 de l'amendement U-4b-1b-4 d'ADR-U4b) ; la sonde `u4b-probe-cutoff.mjs` porte `code_author`.
- **OBS-2** : `--check-version` sort 0 quand `version_ok=false` (`u4b-select-episode.mjs:294-297,380-382`). Item : mapper `versionOk:false` à un code non nul (lot hors gel) ; contournement procédural = C-3. Déclencheur : prochain lot sur le sélecteur.
- **OBS-3** : `--method-caps` inerte en keyless (`client.ts:111-119`) — à écrire dans la doc des lignes §5b pour ne pas croire borner.
- **OBS-4** : jambes eth_call du prober = 2 opérateurs distincts seulement (mevblocker exclu `u4-oracle-path.mjs:124` ; {nodies,pocket} = 1 `rpc2.ts:28-31`) ⇒ aucun témoin de réserve. Déclencheur : premier NoQuorum du prober.
- **OBS-5** : les lignes figées du prereg (§5a, §5d) portent des commentaires `\   # …` non copiables en bash (§A). Déclencheur : prochaine réécriture docs-only du prereg (jamais pendant la course : le sha du prereg est lié par code).
- **OBS-6** : un `reconcile` est un passage unique ; un NO-GO de forme referme aussi la fenêtre (`reconcile.ts:51-55`) ⇒ C-11 obligatoire avant. Item : validation de forme AVANT l'append dans le wrapper 1b-i.
- **OBS-7** : la méta du cache `--resume` n'est pas validée (`resume.ts:86`) ⇒ un fichier par B0. Déclencheur : prochain lot sur `resume.ts`.
- **OBS-8** : discover v2 : `cluster_error: "rpc-guard: run_calls (fail-closed)"` — le témoin `clusters` a épuisé le budget de 6 000 appels (`calls_by_method` : 659 getLogs, 5 341 getBlockByNumber ; provenance mesurée) ; consultatif par construction (prereg `:60`), aucun effet sur la sélection.

## Annexe S — sources (toutes [lu] par le worker ; valeurs [mesuré] = commande rejouable exécutée le 2026-09-22)

- Prereg `docs/PLAN-u4b-prereg.md` (433 lignes, lu en entier ; sha LF `1971d9b1…` [mesuré]) : §DISC `:22-60`, Définitions `:64-69`, §Y `:73-90`, H-0..H-7 `:95-106`, §2 `:110-126`, §4 `:152-172`, Sonde `:176-191`, §5a-§5e `:195-331`, §6 `:335-345`, §7 `:349-374`, §8 `:378-403`, annexe A `:424-433`.
- `docs/course-ukemi/SIDECAR-prereg-u4b-1b-2026-09-22.md` (16 l.), `FAITS-floor-chainstack-n2-2026-09-22.md` (10 l.), `FAITS-floor-chainstack-2026-09-22.md` (26 l.).
- `docs/CHANTIERS.md:755-824` (journal de course, décisions 133/134, G7 UKEMI-RETRY-1, cp-2/G2 U-4b-1b-3), `:405-419` (CONF-SRC-2, décisions 100/102).
- `docs/G1-lot-u4b-1b-3.md`, `docs/CHECKPOINT2-lot-u4b-1b-3.md`, `docs/G2-lot-u4b-1b-3.md` (extraits ciblés), `F:\tmp\u4b1b3\MISSION-PLI.md`, diff `lot/etude-suite..801859f` du sélecteur [mesuré].
- `docs/G7-lot-u4b-1b-2.md` ; `docs/adr/ADR-U4b-calibration-episode-frais.md:453-712` (amendements U-4b-1b-2 et UKEMI-RETRY-1) ; `docs/G1-lot-ukemi-retry-1.md`, `docs/CHECKPOINT2-lot-ukemi-retry-1-re.md`, `docs/G2-lot-ukemi-retry-1-delta.md` (extraits) ; message de fusion `f6442fe`.
- Code (HEAD `b130852`, sha LF [mesuré] au §0.6) : `scripts/census/u4b/u4b-select-episode.mjs` (382 l., lu en entier), `apps/sentinel/src/ukemi/record.ts` (526 l., lu en entier), `scripts/census/u4-oracle-path.mjs` (233 l., lu en entier), `scripts/census/u3-realized.mjs:1-16,271-719`, `scripts/census/u4b/u4b-reduce.mjs` (entier), `scripts/record-u4b-calib.mjs` (entier), `scripts/census/u4b/u4b-scores.mjs:100-122,276-296` (+ grep), `scripts/census/u4-guard.mjs:1-183`, `packages/rpc-guard/{bin/rpc-guard.mjs, src/cli.ts, src/lock.ts}` (entiers), `src/ledger.ts:70-148`, `src/client.ts:60-139`, `src/reconcile.ts:1-90`, `src/transport.ts:1-135`, `src/tariff.ts:1-60`, `apps/sentinel/src/ukemi/rpc2.ts:1-249`, `resume.ts` (grep + `:118-131`), `apps/sentinel/src/windows.ts:50-71`, `apps/sentinel/src/rpc.ts:19-33`, `apps/sentinel/src/ukemi/clusters.ts` (grep), `book.ts` (grep).
- Hors dépôt [mesuré, lecture locale] : provenance de `F:\course-ukemi\discover\weth-discover-2026-09-22.json` ; `F:\course-ukemi\discover\{START,START-v2,run,run-v2}` ; `F:\course-ukemi\select\fill-ts{,-2,-3}.log` ; liste de `F:\monark-ledger\`.
- Fixtures [mesuré] : `apps/sentinel/test/fixtures/ukemi/u3/{U3-deficit,U3-inputs,U3-realized}.jsonl`, `u4b/U4b-oracle-path-e2.jsonl`, `u4b/U4b-scores-e2.jsonl`, `u4/U4-oracle-path-e2.jsonl`.

## Clôture zéro dette (P5)

- **Aucune demande de procurement** : toutes les sources sont des fichiers du dépôt ou hors dépôt, lus au niveau [lu] ; aucun document externe requis. Seul chiffre non re-mesuré par le worker : « ~12 000 appels keyless » par essai fill-ts (`CHANTIERS.md:772`), utilisé comme repère d'instance, jamais comme fait porteur ; mesure possible hors réseau par l'orchestrateur (comptage des lignes `attempted` entre lignes `unlocked` des ledgers keyless).
- **Points non tranchés** = rulings R-A..R-O (§B, preuves et options jointes) + observations OBS-1..OBS-8 (items formés à déclencheur). Recherches de solutions documentées : R-H (dérivation reproduisant la condition du scoreur gelé, testée sur e2), R-L (réutilisation de la fonction exportée, testée), R-I et R-G et R-K (options (a)/(b) avec la pièce hors gel à modifier), R-O (forme de soustraction + validation préalable C-11).
- Aucun `dû` nu ; aucun contournement proposé : chaque écart à une ligne figée est présenté comme D-n à déclarer ou ruling, jamais appliqué en silence.
