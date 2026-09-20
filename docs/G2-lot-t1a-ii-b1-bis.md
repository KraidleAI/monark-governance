claude-opus-4-8[1m]

# G2 — Revue à contexte frais du lot Bell T-1a-ii-b1-bis-i (relecteur Opus 4.8, instance séparée)

Modèle résolu (R-1) : **`claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme). Worker RELECTEUR G2, contexte frais,
instance séparée de l'implémenteur (ne connaît que les artefacts). **Aucun commit, aucun fichier du worktree modifié (R-20)** ;
rejeux/mutants/recomputes sur COPIE `F:\tmp\g2-bellb1bis\` (`git archive 4ade9aa | tar -x` + `npm ci`, TMP=F:\tmp).
Objet : `git diff 5c29871..4ade9aa` (bdfff31 PLI → e6ddbca gel offline → 9033670 gel mesuré → 4ade9aa RÉSULTATS).
Verdict : **ACCEPTE-AVEC-CORRECTIONS** (0 bloquant ; 1 majeur ; 5 mineurs ; 2 observations). Justification et essais ci-dessous.

## Synthèse des vérifications de première main (pas « cru sur parole »)
- **C-8 recomputé offline, PASS 4/4** (script `c8-recompute.ts`, `replayTriplet` importé de la COPIE, PAS le script de
  l'implémenteur) : pour chaque mint, événements produits (`slot ≤ oracle_slot épinglé DE CHAQUE série`, A-1) == série
  épinglée champ à champ (`bits|slot|index|signature`) ET `replayTriplet(produced, +inf)` == `oracle_triplet` épinglé sur
  les TROIS bits. TSLAx 1/1, SPYx 9/9, NVDAx 11/11, AAPLx 11/11.
- **Ancrage C-3 live confirmé 4/4 (réseau, quorum-2 Helius+Chainstack)** : `pinOracleState` relu de première main == `replayTriplet(produced)` sur
  les bits pour les 4 mints ; autorité `066f592251cc4774…` invariante. (SPYx a d'abord rendu `no_quorum` sur un fault de
  transport de MON côté, reconfirmé au 2ᵉ tir.)
- **confirmVault (C-5) confirmé 4/4 (réseau)** : owner-of-owner lu on-chain == `programId` committé ; `whirLbMii…` EST bien
  l'owner-of-owner réel de SPYx/NVDAx, correctement `unknown-program` (PAS un DEX de mémoire) ; TSLAx/AAPLx = `CAMMCzo5…`
  raydium-clmm ; tous `executable=true`.
- **Découverte : lean committé == brut hors dépôt, champ à champ, 4/4** (`cmp-discovery.mjs`) : `founding_pool`, `vault_share_of_sample`,
  `sampled_tx=15000`, `candidates_below_threshold.length` (raw) == `_count` (lean) = 3273/3558/3694/3258 ; vault top == `vaultBase` ;
  aucun vault < 0,05 retenu. Les 6 shas de bruts + 4 shas de fichiers lean == RÉSULTATS §Cumul et PROVENANCE.
- **R-25 = 1090** re-mesuré sous la pathspec `STAT=` de `ci.yml` (`1063 insertions + 27 suppressions`) ≤ 1205. Seam non tiré.
- **Suite verte sur la COPIE** : suite COMPLÈTE `npm run test` **475/475** (0 fail ; base 464 + ce lot ⇒ critère G0-1 « base + ≥8 » tenu),
  dont Bell 92/92, racine 91/91 (`ci-gates` 27/27, `bell_no_secret_in_repo`, `no_secret_in_repo`, `fleet_register_built_set_is_frozen`),
  typecheck 0, eslint 0, gate:vocab 0, lang:gate (bell 0 [GATED]) + `--scope bell` 0, export:check 0, lint:ratchet 69/69.
  `PINNED_BELL_SHA 0cfbed20…` inchangé (absent du diff).
- **ADR D1-sexies (point 11)** : les 19 lignes ajoutées portent la table Tuyaux **entrée/sortie/état/test** — 5 rangées (producteur→fichier,
  fichier→gate ancré, gate.residuals→state, découverte→registre, g_t→course), **État = `upcoming` × 4 + « item formé » × 1** (aucune
  `built`), consommateur servi = -b1-bis-ii nommé, chaque rangée porte son test non-LLM. CA-11 durci respecté.
- **Mutants : 12/13 tués** (10 annoncés + 2 de mon cru) ; **1 survivant de mon cru** (finding C-G2-5).
- **Isolation** : diff = `apps/bell/**` + `docs/PLI` + `docs/adr` seulement. Aucun fleet.ts/README/site/skills ;
  `test/no-secret-in-repo.test.ts` vérifié NON modifié (absent du diff). Bell reste `upcoming`/absent (built = {Shōgen,Hikae,Ukemi,Narabi}).
- **Hygiène** : 0 clé, 0 URL à clé, 0 bearer dans le diff ET les bruts. Seuls matches = l'id d'opérateur nu `"chainstack"`
  (champ report) et des hôtes nus `mainnet.helius-rpc.com`/`core.chainstack.com` (labels de test, sans `?api-key=`) — non-fuites ratifiées.

---

## FINDINGS

### C-G2-1 — MAJEUR — C-5 erratum : `executable` et `authority_kind` calculés puis JETÉS (jamais enregistrés) ; ADR/checkpoint le déclarent enregistrés
**Preuve (code).** `confirmVault` (`apps/bell/src/discover.ts:148-156`) calcule `{ownerOfOwner, executable, dex, authorityKind, programId}`,
mais `discoverFounding` (`discover.ts:180-181`) ne reporte que `programId` et `dex` dans `founding_pool` :
`programId: conf.programId ?? "unknown-program", dex: conf.dex` — `conf.executable` et `conf.authorityKind` sont abandonnés.
`FoundingPoolRef` (`apps/bell/src/pools.ts:149-153`) et `DiscoveryFile.founding_pool` (`discover.ts:158-166`) n'ont **aucun**
champ `executable` ni `authority_kind`.
**Preuve (la spec ratifiée l'exige, verbatim).** CHECKPOINT1 Erratum C-5 (i) (`docs/CHECKPOINT1-lot-t1a-ii-b1-bis.md:76`) :
« `owner`, `owner_of_owner`, `executable` sont **lus (quorum-2) et enregistrés dans `discovery-<MINT>.json`** ; … possédé par le
System Program ⇒ `authority_kind: "system-owned-pda-or-wallet"` **déclaré** ». ADR D1-sexies (`docs/adr/ADR-T1aii…:330`, committé au lot)
**affirme** : « confirmation quorum-2 des **trois champs du vault `owner`/`owner_of_owner`/`executable`** … System-owned ⇒ `authority_kind`
**déclaré** ». Or le fichier servi n'enregistre **ni** `executable` **ni** `authority_kind` : l'ADR décrit un calcul (que `confirmVault`
fait bien) mais **surdéclare ce que l'artefact porte**.
**Preuve (perte d'information mesurée).** Pour SPYx/NVDAx, le fichier committé porte `dex: "unknown-program"` seul — **ambigu** entre
« exécutable hors carte », « non exécutable » et « System-owned ». J'ai dû relire on-chain (`net-verify.ts`) pour lever l'ambiguïté :
`whirLbMii…` est `executable=true` **et** hors carte (donc `unknown-program`, PAS System-owned) — information perdue de l'artefact servi.
**Preuves annexes (commentaires de test trompeurs, non touchés au gel mesuré).** (a) `bell_discover_confirm_vault_executable_and_system_owned`
(B) (`discover.test.ts:176-179`) commente « authority_kind declared » mais **n'asserte jamais** `authority_kind` (champ inexistant) ;
(b) `bell_founding_registry_equals_discovery_measure` (`discover.test.ts:91`) commente « here both null, MEASURE-GATED » alors que les 4
entrées sont désormais peuplées (commentaire périmé post-mesure).
**Impact.** Les 4 pools mesurés sont tous possédés par un programme exécutable (`authKind=null`, confirmé first-hand) ⇒ **pas de dette de
donnée** ; mais la garantie C-5 ratifiée (enregistrer `executable`, déclarer `authority_kind`) est **structurellement absente**, l'ADR la
surdéclare, et `unknown-program` est irréductiblement ambigu dans l'artefact servi (récupérable seulement par un appel réseau).
**Correction demandée.** Ajouter `executable: boolean` + un **`authority_kind` en enum FERMÉ** à `FoundingPoolRef`+`DiscoveryFile` — surtout
**pas** `authority_kind: null` comme recommandé naïvement : `confirmVault` renvoie `authorityKind:null` à la fois pour « programme
exécutable » ET pour « quorum échoué / illisible » (`discover.ts:150,155`), donc `null` **reste** ambigu et ne ferme PAS la perte
d'information des l.55-57. Enum proposé : `authority_kind: "program" | "system-owned-pda-or-wallet" | "unread"` (les 4 pools = `"program"`).
Remplir depuis `conf` dans `discoverFounding` ; re-pinner `discovery-*.json`+PROVENANCE ; corriger les deux commentaires de test.
(OU, si l'orchestrateur juge l'ADR seulement descriptif de `confirmVault`, aligner ADR:330 sur le contenu réel du fichier — mais alors
C-5 (i) « enregistrés » reste non tenu.)
**Test/mutant attendu.** Étendre (B) : `assert.equal(b.founding_pool.authority_kind, "system-owned-pda-or-wallet")` et
`assert.equal(a.founding_pool.executable, false)` — rouge sur le code actuel.
**error_origin proposé : worker** (implémentation + ADR/commentaires en deçà de la bloquante C-5). L'orchestrateur tranche block-G7 vs
item formé -ii, mais la clôture zéro-dette exige l'un ou l'autre, pas un dû nu. **Non bloqué ici car** l'ADR décrit un calcul réel
(`confirmVault` lit bien les 3 champs) et aucune donnée committée n'est fausse — sinon ce serait bloquant.

### C-G2-2 — MINEUR — fichiers `discovery-*.json` « lean » DÉRIVÉS À LA MAIN ; `lean == brut` non testé en CI
**Preuve.** `runDiscoverCli` (`discover.ts:189-206`) écrit le `DiscoveryFile` COMPLET dont `candidates_below_threshold: string[]`
(`discover.ts:165`). Le fichier committé porte à la place `candidates_below_threshold_count: <n>` **+** un `measure_note` (ex.
`discovery-TSLAx.json:26-27`) — une forme qu'**aucun chemin de code n'émet**. `bell_founding_registry_equals_discovery_measure`
(C-4) prouve `FOUNDING_POOLS == lean` (CI), mais **rien en CI ne prouve `lean == brut`**. J'ai recomputé `lean == brut` champ à
champ de première main (`cmp-discovery.mjs`, brut sha-pinné) : **conforme 4/4**, donc pas de dette de donnée. Mais la réduction
brut→lean est manuelle/LLM (le risque MAST « registre recopié à la main » de C-4, déplacé d'un cran).
**Correction demandée.** Soit un réducteur brut→lean **non-LLM** (script sha-consigné) rejoué en CI depuis le brut pinné, soit un
test qui régénère le lean depuis le brut pinné et compare. À défaut immédiat : `measure_note` documente déjà la règle (acceptable
en intérim, mais c'est un item formé, pas un « dû » nu).
**error_origin proposé : orchestrateur** (adjudication « mesure lean acceptée » sans réducteur non-LLM).

### C-G2-3 — MINEUR — rang du vault PoC CY9Xzc1z… : RÉSULTATS et PROVENANCE disent « 6ᵉ », c'est le **7ᵉ**
**Preuve.** RÉSULTATS §RUN 2 (`PLI l.131`) : « le vault du PoC TSLAx est retenu mais **6ᵉ** (part 0,0753) » ; idem
PROVENANCE-founding-discovery.md l.48 « ranks **6th** ». `vault_share_of_sample` de `discovery-TSLAx.json` trié desc (recompute
`cmp-discovery.mjs`) : D2JX 0.3985(1), 7AmJ 0.2951(2), qJB1 0.1741(3), B3Jh 0.1531(4), ERyg 0.122(5), AtD4 0.1034(6),
**CY9X 0.0753(7)**, 9mAp 0.0546(8). CY9X est le **7ᵉ** des 8 retenus.
**Correction demandée.** Remplacer « 6ᵉ » par « 7ᵉ » dans RÉSULTATS §RUN 2 et PROVENANCE l.48.
**error_origin proposé : worker** (PROVENANCE) **+ orchestrateur** (RÉSULTATS rédigée par l'orchestrateur).

### C-G2-4 — MINEUR — table sha256 « traçabilité R-21 » du PLI §5 PÉRIMÉE pour `pools.ts` et PROVENANCE
**Preuve.** PLI §5 (`l.91,97`) : `pools.ts = 3caf397a…`, `PROVENANCE = 12d13d80…`. Ce sont les shas du gel OFFLINE `e6ddbca`
(`git show e6ddbca:… | sha256sum` = `3caf397a…` / `12d13d80…`). Les fichiers committés FINAUX (`9033670`=HEAD) valent
`pools.ts = 080b2e51…`, `PROVENANCE = 90a0893e…` — publiés **nulle part**. Cause : le PLI (bdfff31) a été committé AVANT le
code, sa §5 décrit l'état offline, et le « gel mesuré » (9033670, registre rempli) n'a pas touché le PLI. RÉSULTATS l.116 admet
« shas de `pools.ts` … re-vérifiés par l'orchestrateur » mais ne publie pas les nouveaux. Les 9 autres fichiers du §5 concordent avec HEAD.
**Correction demandée.** Noter la dérive (ou ajouter les shas finaux `080b2e51…`/`90a0893e…`) — sinon §5 n'est pas une table
fidèle de l'état committé, contraire à sa propre étiquette « traçabilité R-21 ».
**error_origin proposé : orchestrateur.**

### C-G2-5 — MINEUR — ancrage C-3 : la comparaison du **multiplier courant** (mulBits) n'est pas couverte (MUTANT SURVIVANT)
**Preuve.** Mutant de mon cru (MINE1) : dans `stateAnchorMatches` (`collect.ts`), retirer `expected.multiplierBitsHex === live.mulBits`
(ne garder que newBits + effTs) ⇒ **`node --test apps/bell/test/collect.test.ts` reste vert (fail=0) = SURVIVANT**. Cause : tous les cas
de `bell_c3_anchor_stale_trajectory_is_unverified` utilisent `mult=1` (concordance ET stale) ; seuls `new_multiplier`/`effTs` varient.
Le champ « multiplier courant » de l'ancrage n'est donc jamais exercé, alors que C-7 impose « comparé sur les TROIS champs de bits ».
(Les mutants « multiplier seul » C-7(a) et « scanMethod non passé » sont bien tués — voir table.)
**Correction demandée.** Ajouter un cas où l'état live diverge sur le **multiplier courant** (replay ⇒ mul=X, live ⇒ mul=Y≠X, new/effTs
égaux) ⇒ `rebase_unverified` attendu ; ce cas tue MINE1.
**error_origin proposé : worker** (couverture de test incomplète sur une bloquante C-7 ; pas de défaut de code — le code compare bien les 3 champs).

### C-G2-6 — MINEUR — le run `--discover` n'est pas auto-descriptif (ni `calls_by_method`, ni paramètres pré-enregistrés)
**Preuve.** `DiscoveryFile` (`discover.ts:158-166`) n'enregistre pas `pagesPerPoint`/seuil/3 points/fenêtre/`calls_by_method` ; le
CLI `--discover` n'imprime que le total (`discover.ts:205`). PROVENANCE l.23-28 le reconnaît : « Calls: 76 total … Reconstructed by
method ». Le rapport scanner omet `max_pages`. Les paramètres EXÉCUTÉS concordent pourtant EXACTEMENT avec le pré-enregistré (vérifié :
3 points asc/asc/desc, `sampled_tx=15000`=3×5×1000, seuil `0.05` épinglé code+test `discover.test.ts:87`, `--max-calls 300`,
gTfA 60 appels, fenêtre `1751328000/1761955199`) — donc **inférable**, pas une dette de correction, mais pas auto-documentant.
**Correction demandée.** Item formé (déjà listé RÉSULTATS §Items : `calls_by_method` au CLI `--discover`, G0 -ii). Rien de plus dû en -i.
**error_origin proposé : worker** (observabilité) — item, non bloquant.

### C-G2-7 — OBSERVATION — ordre de commit (PLI avant code) et incohérence R-25 §1(854)/§2(1031) dans la partie pré-enregistrée
**Preuve.** `git show --stat` : bdfff31 = PLI SEUL (112 l.) ; e6ddbca ajoute le code « no network yet » ; `git diff bdfff31..4ade9aa
docs/PLI` = STRICTEMENT la §RÉSULTATS (31 l.), donc §2 (« R-25 mesuré au gel = 1031 ») et §5 (table sha) étaient DÉJÀ dans bdfff31 —
mesures offline connues avant le commit du PLI. **Ce n'est PAS une violation de C-3** : C-3 contraint budget-avant-réseau (respecté :
aucun appel réseau avant bdfff31 ; e6ddbca offline), pas PLI-avant-code. Les **paramètres de budget pré-enregistrés** (N=5, 3 points,
seuil 0,05, `--max-calls 300`, `--max-pages 200/5`, fenêtre) == exactement ceux exécutés (rapports bruts `rebase-produce-report.json`
`calls_by_method` = gTfA 166/getTx 18/getAccountInfo 8, `calls_used 192/max_calls 300`). Incohérence mineure : §1 (`l.25`) dit
« R-25 = 854 », §2 « 1031 » — deux chiffres dans le même doc pré-réseau (854 semble une projection périmée) ; le final mesuré est 1090.
**Aucune correction bloquante** ; signaler l'ordre comme provenance et corriger/retirer le « 854 » orphelin serait propre.

### C-G2-8 — OBSERVATION — recouvrement possible entre points d'échantillonnage (double comptage non déclaré)
**Preuve.** Le tally déduplique **par corps** (`seen` réinitialisé à chaque itération, `discover.ts:75`), **pas** entre les 3 points. Les
points construits (`discover.ts:193-197`) sont : (1) `[fromSec,toSec]` asc, (2) `[mid,toSec]` asc, (3) `[fromSec,toSec]` desc. Les points
(2) et (3) échantillonnent tous deux la **seconde moitié** de la fenêtre ; si cette moitié porte < ~10 000 tx, une même tx apparaît dans les
deux ⇒ ses comptes sont comptés **deux fois** (numérateur ET `sampled_tx` gonflés ⇒ parts distordues près du seuil 0,05 — `9mAp…` est à
**0,0546**, marge fine). Non vérifiable a posteriori (les corps ne sont pas archivés — sonde C-7 lot -b3d). La limitation déclarée de C-3
couvre « un pool actif seulement HORS des points », pas ce recouvrement.
**Correction demandée.** Aucune en -i (pas de dette de donnée prouvée). À déclarer, ou dédupliquer par `signature` entre points, en -ii.
**error_origin proposé : worker** — observation, item -ii.

---

## Table des mutants rejoués (COPIE ; restauration sha-exacte depuis le worktree HEAD, jamais git checkout)
| # | Mutant | Fichier muté | Test rejoué | Attendu | Résultat |
|---|---|---|---|---|---|
| M1 | C-1 `loadTrajectories` sans `scanMethod==="authority"` (fail-open) | collect.ts | rebase-produce.test.ts | rouge | **RED** (fail=1) |
| M2 | C-2 quote apparié par signe seul (retire `owner===`) | discover.ts | discover.test.ts | rouge | **RED** (1) |
| M3 | C-4 `FOUNDING_POOLS` vaultBase 1 caractère changé | pools.ts | discover.test.ts | rouge | **RED** (1) |
| M4 | C-5 `dexForProgram` renvoie un DEX de mémoire | discover.ts | discover.test.ts | rouge | **RED** (1) |
| M5 | C-5 `confirmVault` suppose `executable=true` | discover.ts | discover.test.ts | rouge | **RED** (1) |
| M6 | C-6 `quoteClass` toujours "usd" | discover.ts | discover.test.ts | rouge | **RED** (1) |
| M7 | C-7(a) ancrage compare `multiplier` seul | collect.ts | collect.test.ts | rouge | **RED** (1) |
| M8 | C-7 `scanMethod` non passé au gate | collect.ts | collect.test.ts | rouge | **RED** (1) |
| M9 | C-8 pager `pages += 2` (double-incrément) | rebase-produce.ts | rebase-produce.test.ts | rouge | **RED** (1) |
| M10 | C-10 émission des résiduels neutralisée | collect.ts | collect.test.ts | rouge | **RED** (1) |
| MINE2 | inverser le garde « quote = mint différent » | discover.ts | discover.test.ts | rouge | **RED** (3) |
| MINE3 | retirer la déduplication tally par-tx | discover.ts | discover.test.ts | rouge | **RED** (1) |
| **MINE1** | **ancrage retire l'égalité `mulBits` (multiplier courant)** | **collect.ts** | **collect.test.ts** | **rouge** | **SURVIVANT (fail=0)** → C-G2-5 |
Bilan : **12/13 tués**, 1 survivant (couverture, C-G2-5). Les 10 mutants annoncés dans le G0/PLI sont tous tués.

## Appels réseau de vérification (borne ≤ 60 appels / ≤ 600 crédits Helius pire cas, `--max-calls` fail-closed)
| Lot | Méthode | Appels | Crédits Helius (1 cr/appel) |
|---|---|---|---|
| `net-verify.ts` (confirmVault ×4 + pinOracleState ×4) | getAccountInfo | 23 (12 helius / 11 chainstack), 1 fault | 12 |
| `net-spyx.ts` (reconfirmation SPYx) | getAccountInfo | 2 (1/1) | 1 |
| **Total** | getAccountInfo | **25 / 60** | **~13 / 600** |
Aucune autre méthode. Aucune URL/clé imprimée (URLs composées en mémoire depuis `HELIUS_API_KEY`/`CHAINSTACK_SOLANA_URL`, jamais logguées).
Résultat : confirmVault 4/4 (programId/dex de première main), ancrage live 4/4, autorité `066f5922…` invariante.

## R-25 (re-mesuré)
`git diff --shortstat 5c29871 4ade9aa -- <pathspec STAT= ci.yml:65>` = **10 fichiers, 1063 insertions + 27 suppressions ⇒ CHANGED = 1090** ≤ 1205. Conforme à RÉSULTATS ; seam non tiré.

## Modes MAST observés
- **FM-1.2 (spec non pleinement suivie)** : C-G2-1 (recording `executable`/`authority_kind` de C-5 non livré) — majeur, mitigé par
  données mesurées correctes + item.
- **FM-3.1 (vérification incomplète)** : C-G2-5 (mutant survivant = champ mulBits non exercé), C-G2-2 (`lean==brut` hors CI).
- **Mitigation dominante confirmée** : l'**oracle d'exécution non-LLM** est réel et fort — la composition
  producteur→fichier→`loadTrajectories`→`buildSolanaSymbol`→gate→`collect` est EXÉCUTÉE (CA-11 durci ; jamais une regex sur le source,
  motif `collect.test.ts:507-514` proscrit respecté), et les tuyaux `--discover`/`--rebase-produce` passent par `runMain`. Indépendance
  de vérification tenue (contexte frais, recompute first-hand, réseau quorum-2).

## Verdict G2 : **ACCEPTE-AVEC-CORRECTIONS**
Aucun défaut bloquant : toutes les affirmations porteuses sont vérifiées de première main (C-8 4/4 offline + live, découverte
lean==brut==RÉSULTATS==on-chain, C-1/2/4/6/7/10 implémentées et mutants tués, R-25 1090, gates verts, isolation + hygiène propres,
Bell `upcoming`). Corrections dues avant clôture zéro-dette : **C-G2-1 (majeur)** — block-G7 ou item formé -ii au choix de l'orchestrateur,
jamais un dû nu ; **C-G2-3/C-G2-4 (mineurs, docs)** ; **C-G2-5 (mineur, +1 cas de test)** ; **C-G2-2/C-G2-6** items formés déjà amorcés.
