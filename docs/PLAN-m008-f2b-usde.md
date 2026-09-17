# PLAN-m008-f2b-usde — Lot famille B (Narabi F2), instrument USDe (Ethena)

> **G0 AgileGates (plan AVANT code/pull).** Rattachement : ADR-M008 **D7bis** (amendé
> **2026-09-17** — USDe retiré de « le flux ne voit pas », 2ᵉ lot de famille) + **§3 amendé
> 2026-09-17** (`v0.3.0` = lot USDe ; msUSD clos négatif). PAS un nouvel ADR.
> **Décisions investisseur** : 2026-09-13 Option A (`stable-run-velocity-24h`, **homogène 24h→24h** ;
> `flow-redeem-1h` = descripteur, jamais une classe code) ; **2026-09-16 « B d'abord »** (verbatim,
> réponse AskUserQuestion : « B d'abord ... on choisit un autre stablecoin, critère pré-enregistré
> AVANT pull ») après l'échec dégénéré du lot msUSD ; **2026-09-17 « Confirme USDe »** (E-1 checkpoint-1).
> Statut : **ACCEPTE-AVEC-CORRECTIONS (checkpoint-1, 2026-09-17) — corrections C-1…C-9 foldées ci-dessous ;
> C-10…C-13 dues avant checkpoint-2.** **Aucun push. Tout seuil ci-dessous est PRÉ-ENREGISTRÉ (FIXÉ
> AVANT le pull complet), en connaissance déclarée des ~6 fenêtres scoutées (voir §5.0).**

## 0. Pourquoi USDe, et pourquoi pas msUSD
msUSD (F2-A) : MESURÉ (fixture sha `d95cc0a3…`, 198 fenêtres, 0 erreur, C1 tenue) puis **REFUSÉ** —
pure croissance (mints 187/192 jours, ×43) mais **1 seul jour calme avec burns** (2026-06-12, 1 token
sur ~82M = poussière) ⇒ q̂=0 ⇒ largeur nulle (advisor-defi : valide mais vide). Conservé comme **test
hors-échantillon**. USDe (scouting `wf_7721da9a`, `SCOUT-P-F-7`, preuves primaires recomputées onchain)
a **les deux** propriétés absentes chez msUSD : churn de rachat calme réel/récurrent (5/6 jours non nuls,
$17K–$430K/j sur 8 mois) **et** run primaire hors-échantillon GÉNUIN (11 oct. 2025, ≈11,16% du supply,
908 burns/40 adresses, **aucun confound de fermeture de primary** — redeem Ethena 24/7 whitelisté).

## 1. Instrument & mécanisme (VÉRIFIÉ [lu] au scouting)
- **Token** : `0x4c9EDD5852cd905f086C759E8383e09bff1E68B3` (Ethereum mainnet), USDe, 18 décimales,
  Etherscan « Verified — Exact Match » ; recoupé Ethplorer.
- **Rachat = burn-to-0x0** via **EthenaMinting** (V1 `0x2CC4…8AFc3`, V2 `0xe349…62D3`). `redeem()`
  (benefactors whitelistés) ⇒ `usde.burnFrom(benefactor, amount)` ⇒ `Transfer(benefactor, 0x0, amount)`.
  Filtrer `Transfer → 0x0` sur le token capte **les deux versions**. (OFT LayerZero = lock-and-mint,
  ne brûle pas ⇒ ne contamine pas ; mainnet seul, omnichain hors périmètre.)
- **`wrapping_family` déclarée** : `synthetic-dollar-whitelisted-redeem`. **Distincte** de msUSD
  (`wrapper long-tail`). Nouveau `calib_digest` ; **aucun pooling** (Mondrian) — isolation de famille sur le fil (C-10, §8).

## 2. Forme de calibration (A-homogène, ADR-M008 D4 / PLAN-m008-f2 §2)
- **Fenêtre** = 24h UTC. **Vélocité** `v_t = burns/(S_open·Δ)`, Δ=24 (fraction du **stock d'ouverture**
  rachetée/heure). `S_open = supply_close + burns − mints`. `S_open ≤ 0` ⇒ `non_evaluable` ;
  `supply_close = 0` avec vrai drain ⇒ `v = 1/Δ`.
- **Prédicteur = persistance** : `v̂_t = v_{t-24h}`. Paires homogènes `(v̂_t, v_t)` sur fenêtres 24h
  **consécutives** calmes. **Score** `s_t = |v_t − v̂_t|`. Quantile hand-rollé (anti-circularité).

## 3. Fenêtre calme, EXCLUSIONS (règle UNIQUE, symétrique, mécanique — C-2) & amorçage (C-5)
- **Calme candidat** = [premier jour UTC où `S_open ≥ S_floor`] → **2025-10-09 23:59 UTC**.
- **Amorçage (C-5, pré-enregistré)** : `S_floor = 10 000 000 USDe` (`1e25` wei). Les fenêtres à
  `S_open < S_floor` (ramp initial ~fév. 2024, float minuscule) sont hors régime mûr, exclues ; les
  incluses passent l'identité C1. (Choix de modélisation déclaré, pas un théorème.)
- **Règle de stress — UNE seule, symétrique, mécanique, ABSOLUE (non circulaire, C-2)** : une fenêtre
  calme candidate est **exclue comme stress** ssi `burns/S_open ≥ θ_stress = 0.01` (**1% du stock
  d'ouverture racheté en 24h**). Indépendante des quantiles de calibration (⇒ pas de circularité
  q99↔exclusion). S'applique **identiquement** à toute fenêtre :
  - 21 fév. 2025 (~2%/j, Bybit) ⇒ **exclue** ; 1er mars 2025 (~4,67%/j) ⇒ **exclue** — par la MÊME règle.
  - Churn calme ordinaire (<0,1%/j) ⇒ **retenu**.
  - La **nature** du 1er mars ($267,9M, non expliqué au scouting) est **documentée en provenance** au
    pull (rachat légitime vs artefact de contrat/migration), mais son **exclusion est par magnitude**,
    pas par un jugement « légitime/artefact ».
- **Fenêtre Bybit = le seul 21 fév.** (seul jour sourcé, delta net −123,26M ; largeur 5 jours non sourcée retirée).
- **Robustesse (rapportée, un seul committable)** : le recorder imprime q̂/q99 **AVEC** exclusion
  (jeu pré-enregistré, **seul committable**) **ET SANS** (sensibilité). Le sans-exclusion est un
  diagnostic, jamais committé.
- **Run tenu HORS ÉCHANTILLON** (test) : **2025-10-10 → 2025-10-15** (pic 11 oct.). Nommé avant le pull.

## 4. Strates calendaires : AUCUNE (déclaré + justifié)
Primaire Ethena **whitelisté 24/7**, pas adossé à des rails bancaires ⇒ aucun confound semaine/week-end
(pic du 11 oct. = samedi, rachats procédés). **Pas de stratification Mondrian calendaire** (contrairement
à USDC/Koyomi). `nMin` s'applique à la série entière.

## 5. Critère de NON-DÉGÉNÉRESCENCE & d'acceptation (PRÉ-ENREGISTRÉ)

### 5.0 Déclaration de pré-enregistrement informé (C-3)
Les seuils ci-dessous (`ρ_min`, plancher d'activité, `θ_stress`, `S_floor`) sont fixés **EN CONNAISSANCE
des ~6 fenêtres scoutées** (`SCOUT-P-F-7` : ρ_scouté = 5/6 ≈ 0,83 ; burns calme min observé ≈ 17 061 USDe ;
run 11 oct. ≈ 11,16%/j ; 10 oct. ≈ 2,65%/j). Choix assumé et déclaré (réserve scout §5), pas dérivé après
le pull complet. Le jeu de **calibration calme** (~600 fenêtres) reste **non vu** ; le run est le **test**.

### 5.1 Conditions (une calibration n'est committée que si TOUTES tiennent ; sinon `under_calib` honnête)
1. **Garde structurelle (largeur nulle)** : région committée `lo == hi` ⇒ **`under_calib`**, jamais
   commit. Indépendante de tout seuil. **C-11 = SATISFAIT par ADR-M011 NDG-1** (lot `task_e94d7490`
   clos 2026-09-17, commit en attente de go investisseur) : garde posée dans `region.ts
   buildIntervalRegion` (`lo===hi ⇒ abstain under_calib`) + auto-défense L3 `decideInterval` (`lo>=hi`).
   Critère **sur les BORNES**, pas `q̂>0` (l'absorption flottante donne `lo===hi` avec `q̂>0` ; un `q̂`
   global régresserait les set-singletons). **Aucune 2ᵉ garde** dans `calibration.ts` (elle ne fait que
   pinner le digest, motif existant) ; F2-B **vérifie** NDG-1 par mutant sur la calib USDe.
2. **Activité `ρ`** : fenêtre calme « active » ssi `burns_raw ≥ 1e21` wei (**1000 USDe**). **`ρ ≥ ρ_min
   = 0.30`.** Critère d'**efficacité/informativité** (Vovk et al. 2016, §5.2), pas de validité ; motivé
   Diamond–Dybvig (un régime calme a une demande de liquidité ordinaire). Déclaré, jamais un théorème.
3. **Support** : `n` paires calmes consécutives `≥ nMin = 50`. Le recorder **imprime le support** de q̂
   et de q99 (nombre de fenêtres ≥ chaque quantile).
4. **Non-dégénérescence effective** : `q̂(1−α) > 0`, `α = 0.10`.
5. **Test rétrospectif hors-échantillon (`ALERT_P = 0.99`)** : **le run FRANCHIT ssi au moins UNE fenêtre de run
   nommée (10-15 oct.) a `v > q99_calm`** (règle ENCODÉE dans le recorder : `retroPositive` ⇒ condition de
   `committable`, C-14 checkpoint-2 ; la branche « valide mais rétrospective négative » doit être atteignable) ;
   chaque fenêtre est rapportée — **observation de témoin factuelle**, champs à dates nues (`run_windows_above_q99`),
   **JAMAIS « aurait alerté N jours avant »**. **Attendu pré-enregistré** : 11 oct. (11,16%) franchit
   trivialement (reproduction d'une issue connue, PAS un test). **Question ouverte pré-enregistrée = le
   10 oct.** (~2,65%) : le q99 calme le flag-t-il ? (C-4). Un run qui **ne** franchit pas ⇒ clôture
   `under_calib`, la méthode n'est pas invalidée.

## 6. Échangeabilité — déclaration honnête
« Échangeabilité déclarée au sein de `(wrapping_family = synthetic-dollar-whitelisted-redeem)` ; couverture
marginale finie sous cette déclaration ; **dépendance sérielle des paires chevauchantes** (`s_t`, `s_{t+1}`
partagent `v_t`) non modélisée, diagnostiquée par **thinning** (1 paire/2, couverture empirique ≈ 1−α) —
diagnostic, jamais garantie ; le run oct. 2025 est un **shift hors-échantillon**. » ACI (M009) règle α_t,
pas l'absence de dispersion — hors périmètre (D8).

## 7. Acquisition de données (K-8, out-of-tool ; sources AVANT travail)
`usde-full-pull.mjs` (motif `msusd-full-pull.mjs`) : fenêtres 24h UTC, [premier jour post-déploiement] →
15 oct. 2025 (bloc de création à confirmer au setup [lu]). RPC publics read-only sans clé, résumable (JSONL).
Par fenêtre : `burns` (Transfer→0x0), `mints` (Transfer 0x0→), `supply_close` (`totalSupply`@to_block),
`[from_block, to_block]`, **identité C1** `totalSupply(from_block−1) == supply_close + burns − mints`
(fail-close par fenêtre). Fixture série **sha-pinnée** + `PROVENANCE-usde.md`. Portée ~20 mois ≈ 600 fenêtres.
- **Cross-checks de reproduction PRÉ-ENREGISTRÉS (data-integrity gate, C-6)** — le pull est **rejeté**
  si l'un échoue (tolérance ±0,5% magnitude, exact sur comptes d'events ±2) : **11 oct. 2025** =
  `1 595 045 831,80` USDe / 908 events ; **1er mars 2025** = `267 874 594,64` / 66 ; **21 fév. 2025** =
  delta net `totalSupply` `−123,26M`. Setup : décodage de quelques `redeem()` pour confirmer EthenaMinting V2.

## 8. Recorder + garde + isolation de famille (livrable)
`record-usde-calib.mjs` (motif `record-msusd-calib.mjs`, **purgé de la surface interdite** — C-12 : plus
de `spoke_before_public_mid`/`would have`, champs neutres `run_windows_above_q99` + dates nues) applique
§3/§5. **Garde largeur-nulle = NDG-1 réutilisée** (`region.ts`, ADR-M011 ; **aucune garde dans `calibration.ts`**, qui ne fait que pinner le digest — C-11, cf. §5.1.1 ; aligné C-16 checkpoint-2).
- **Isolation de POPULATION sur le fil (C-10, fail-closed, mutant) — option (i') advisor-defi, ratifiée
  2026-09-17 (ADR-M008 amendement bis)** : `gate.ts` dispatche sur `task_class` seul ⇒ câbler
  `USDE_STABLE_RUN_CALIB` tel quel poolerait TOUTE prévision `stable-run-velocity-24h` (msUSD comprise)
  sur USDe = interdit D7bis. **Clé = `(task_class, predictor_id)`** ; `predictor_id` =
  `narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3` (segment formule
  **conservé** + suffixe population **copié verbatim, canonicalisé, depuis les champs attestés `chain` +
  `subject`** — **aucune map** issuer→famille dans l'adaptateur). **Registre unique** = `calibration.ts` ;
  adaptateur et registre dérivent la clé par la **même fonction partagée** (zéro doublon). Non-correspondance
  (id nu, autre token, autre chaîne, clé altérée) ⇒ `under_calib`. **Famille = métadonnée de provenance ;
  clé = support.** Convention : `subject` = token canonique (domaine `eth_getLogs`), `source.issuer` =
  contrat mint/redeem. **Garde BYO key-aware** (BYO permis ssi aucune calib committée pour la clé).
  **Porteurs K-1 par clé** (A2 : `honestyText`/phrase de classe sur `(task_class, predictor_id)`).
  **Scores = `adaptateur.scores` (A1, À FAIRE EN PREMIER)** : régénérés via `fromAttestedFlow` (échelle
  1e12) sur des `AttestedFlow` construits depuis la fixture (payload canonique incluant `{address,
  fromBlock, toBlock, topics}`) ; écart recorder(1e6)↔adaptateur **déclaré** score à score ; si q̂/q99
  sortent du support (61/6) ⇒ **STOP, re-déclaration**, jamais un ajustement. `calib_digest` =
  `calibDigest` C5 sur **ces** scores. **Mutants bout-en-bout exigés (A7)** : (a) flux msUSD réel →
  adaptateur → gate ⇒ `under_calib`, jamais la région USDe ; (b) flux USDe mainnet ⇒ région committée ;
  (c) même token, `chain` L2 ⇒ `under_calib` ; (d) clé altérée d'un caractère ⇒ `under_calib` ; (e) id
  nu `narabi:persistence-v2` ⇒ `under_calib` ; (f) surclaim « committed » sur (a) ⇒ rouge. 0 octet
  `schemas/` ; nouvelle `task_class` ou contrat gelé touché ⇒ escalade, pas une correction.
- Si committable : build `USDE_STABLE_RUN_CALIB` + digest pinné + provenance **mesurée** dans
  `calibration.ts` ; wiring `stableRunVerdict` clé-famille ; bascule de la phrase d'honnêteté (re-pin h5).

## 9. Topologie, MAST, provenance (C-7, C-9)
- **Topologie** : le **pull** = orchestrateur exécute un script scratchpad **déterministe** (K-8,
  hors outil) — **garde-fou de réduction AgileGates** (tâche vérifiable + oracle déterministe : C1 par
  fenêtre + sha-pin + cross-checks §7) ⇒ **mono-agent + oracle, PAS de fan-out**. Le **recorder + wiring**
  (garde, isolation famille, `calibration.ts`) = **implémenteur worker `claude-opus-4-8` effort max** ;
  **G2 = relecteur en instance FRAÎCHE ≠ générateur** ; orchestrateur adjuge (**G7**). **Gate 0** : le
  premier worker déclare son modèle résolu (`claude-opus-4-8`), préfixe vérifié avant consommation (R-1).
- **MAST (risque résiduel)** : (1) **perte à la passation** — la réserve de pré-enregistrement du scout
  avait été perdue ; **capturée** ici (§5.0, valeurs épinglées) ; (2) **pooling par omission** — isolation
  famille C-10 mutant ; (3) **dégénérescence** (E-F2-2) — garde largeur-nulle C-11 ; (4) **fuite surface
  interdite** dans le recorder — purge C-12 + `vocab-banned.json`/`grep-forbidden.mjs` étendus à
  `PROVENANCE-usde.md` + doc de clôture ; (5) **exclusion circulaire** — corrigée par `θ_stress` absolu (§3).
- **Provenance** : entrée `docs/JOURNAL-PROVENANCE.md` pour le lot F2-B (`error_origin` assigné au G7).
- **Déclaration B_t** : la rétrospective compare `v` à `q99` **dans le recorder** (hors-ligne), **PAS**
  via le gate L3 / `B_t` (aucune déplétion de budget) ; si un jour passée par le gate live, les 3
  conditions de PLAN-m008-f2 §5 s'appliqueraient — non le cas ici.

## 10. Barre « fini » F2-B, gates & dettes formées
- **Fini** : classe committée pour la famille USDe (`calib_digest` réel reproductible) **OU** `under_calib`
  honnête si un critère §5 échoue. **La clôture distingue les deux négatifs (C-13)** : (a) support/
  dégénérescence insuffisants (`ρ<ρ_min`, `n<nMin`, `q̂=0`) vs (b) calibration valide **mais** rétrospective
  négative (run ≤ q99) — sur le fil les deux rendent `under_calib` (enum gelé), le **texte de clôture dit lequel**.
- **Gates** : G2 fraîche + checkpoint-2 (validateur, C-10..C-13 vérifiées) + G7 ; zéro dette ; aucun push.
- **Sources / dettes formées** : « Vovk, Nouretdinov, Fedorova, Petej, Gammerman 2016, *Criteria of
  efficiency for conformal prediction*, arXiv:1603.04416 » — **[abs]** (abstract lu ; **procurement formé
  si le corps est cité**) — C-8. Bloc de création USDe + décimales : [lu] onchain au setup. Item routé
  (chip `task_e94d7490`, **en revue G2 le 2026-09-17**) : garde largeur-nulle du chemin **BYO interval** L3
  (décision ADR). **Coordination C-11** : si cette garde est posée dans `buildIntervalRegion` (seul
  constructeur de région) elle couvre **AUSSI** la classe committée ⇒ **C-11 = réutiliser/vérifier cette
  garde, pas de 2ᵉ garde concurrente** ; sinon F2-B la pose côté classe committée. **Ne pas éditer
  `interval-conformer`/`region`/`l3-gate`/tests tant que `task_e94d7490` n'est pas mergée.** `04-task-classes.md` (scratch, hors repo) contredit l'ADR (1h) : note à réconcilier.
