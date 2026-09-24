# CHECKPOINT-1 (approbation du PLAN) — lot Bell T-1a-iii (mesure de l'univers Solana élargi)

- **Avis rendu par le `validateur-humain`**, modèle résolu **`claude-fable-5-1`** (R-1), instance séparée à contexte frais, **2026-09-20 21:45:51 → 21:54:27 UTC**. Biais d'affinité Fable/Fable déclaré, mitigé (contexte frais, checklist fermée, vérifications first-hand). Avis = acceptation du PLAN, jamais verdict (G2 et G7 restent chez l'orchestrateur, R-21).
- **Persistance au format dépôt par le worker RÉDACTEUR `claude-opus-4-8[1m]`** (effort max) : je transcris l'avis rendu, je vérifie sur pièces chaque citation corrigée (lecture seule, `F:\Monark`), je **ne committe pas** (R-20) — l'orchestrateur vérifie adversarialement (R-21) puis committe. **Le sha `bce6ad32…` transmis avec l'avis est celui de l'artefact JUGÉ** (le G0 `ec0f422`, recalculé conforme ci-dessous), **pas** un digest du texte de l'avis du validateur : ce dernier n'est pas disponible au rédacteur (j'ai reçu le texte de l'avis, pas son fichier).
- **Artefact jugé** : `docs/G0-lot-t1a-iii-univers-solana.md` au commit `ec0f422`, sha256 `bce6ad326b7b049578776086b19a05e059e40500fe0665452357ef3eb44e6794` (**recalculé conforme** par le rédacteur : `git show ec0f422:… | sha256sum` == working tree, diff vide). HEAD `001750e` inchangé avant/après ; aucune écriture dans le dépôt ; aucun appel réseau ; aucune valeur de close ni de prix citée.
- **DÉCISION (scindée)** :
  - **Missions de lecture PR-U-\* : ACCEPTÉES** (complétées par B-5 / B-6).
  - **`-iii-a` : ACCEPTE-AVEC-CORRECTIONS** — **B-1..B-11 bloquantes AVANT le commit du pré-enregistrement et AVANT tout worker / tout appel**.
  - **`-iii-b` : structure ACCEPTÉE sous B-7** ; **lancement SUSPENDU à ESCALADE-INVESTISSEUR** (Q6 plafond 50 000 cr ; Q7 créneau).
  - **Périmètre émetteurs (Q9) : ESCALADE-INVESTISSEUR.**

## 1. Vérifications sur pièces (défauts de faits corrigés — lecture seule, jamais « fais-moi confiance »)
| Fait du G0 | Mesure first-hand | Verdict |
|---|---|---|
| M2(a) « **~575 cr/mint mesuré** … 2 302 cr pour 4 mints » (l.95) | 2 302 cr = **RUN 1 scanner d'autorité 1 686** (`PLI-lot-t1a-ii-b1-bis.md:119`) **+ RUN 2 découverte 616** (`PLI:122`) ; découverte **seule** = 616 / 4 = **154 cr/mint**, échantillon « **3 points, N = 5 pages/point** » (`PLI:121`) ; 575 = 2 302/4 confond scanner + découverte | **DÉFAUT (a) → B-3** |
| « présenter M1 seul … (**5,4 M / 4 mints**) » présenté en fait (l.95) | `F:\Monark-wt-bellb3d\docs\G0-lot-t1a-ii-b3d.md:23` s'auto-étiquette « **ordre de grandeur de budget** », « estimation haute », N « **INCONNU jusqu'à épuisement** » | **DÉFAUT (b) → B-3 : à étiqueter « projection »** |
| `getAccountInfo` **1 cr** → `CHANTIERS:122` (l.71) | `CHANTIERS:122` liste gTfA 10 / getTransaction 1 / gSFA 1 — **PAS getAccountInfo** ; le barème `getAccountInfo`=1 est en **`PLI-lot-t1a-ii-b1-bis.md:45`** (« RPC standard … getAccountInfo \| 1 ») | **DÉFAUT (c)** |
| `assertNoClose`/`CLOSE_KEY` « **`pools.ts` motif** » (l.55) | vivent dans **`apps/bell/src/digest.ts:33`** (`const CLOSE_KEY`) et **`:38`** (`export function assertNoClose`) | **DÉFAUT (d)** |
| repli keyless « `drpc`/`ankr`/`pocket` (`operators.ts:23,26,20`) » (l.48) | `operators.ts:23` = **llamarpc** (EVM) ; **dRPC = `:24`** ; ankr `:26` OK, pocket `:20` OK | **DÉFAUT (e)** |
| « **décision 40 exclut le pré-IPO** (`CHANTIERS:49`) » (l.28) | `décision 40` présente **en minuscule** l.49 et l.126 (renvois **internes à la ligne census v3**) ; **aucune entrée formée** « DÉCISION … 40 » (grep `D.CISION (INVESTISSEUR\|ORCHESTRATEUR) 40` = **0**) ; **décision 82** formelle (`CHANTIERS:241`) liste « PreStocks (pré-IPO : pas de clôture boursière ⇒ hors mesure d'écart, à déclarer) » | **DÉFAUT (f) → refonder l'exclusion sur décision 82** |
| `readPriorCalls`/mutant **M17** + « `--max-calls == plafond` » pour le budget cumulatif -iii-b (l.71,73) | **absents** de `F:\Monark\apps\bell\src\collect.ts` (grep = 0 ; main n'a que `makeBudgetedCall(maxCalls, inner)` → `{call, calls, tick}`, `:296`) ; `readPriorCalls`/`priorCalls`/`maxCredits` vivent dans le **worktree -b3d NON fusionné** (`F:\Monark-wt-bellb3d\apps\bell\src\collect.ts:29,297,582`, commit **`eb54baa`**, `git merge-base --is-ancestor eb54baa HEAD` = **non-ancêtre**) ; ce commit introduit le flag **`--max-credits`** (`collect.ts:440-447` de -b3d) que le G0 **ignore** | **DÉFAUT (g) → B-4 / B-7** |
| « le **811** … est le compte produit **multi-chaîne** » (l.46, l.140) | décision 82 (`CHANTIERS:241`) dit « `xstocks.fi/products` liste **811 produits** » — **jamais** « multi-chaîne » ; la répartition Solana est **à mesurer** (`L-lecture…:407` : tri interne non alphabétique, 4 mints absents des 700 premiers ⇒ épuisement) | **DÉFAUT (h) → NB-6 : « à mesurer »** |
| **Isolation** : L-1 « `--universe` de `runMain` », L-4 « `--count-signatures` de `runMain` » (l.104,107) | `runMain` vit dans `collect.ts` ; le toucher avant la fusion de -b3d-a **casse l'isolation** ; `makeBudgetedCall` (main, `collect.ts:296,305`) **expose `tick()`** (B-5 satisfiable en -iii-a1 en import lecture seule) mais **pas** `priorCalls`/`maxCredits` | **→ B-4 (point d'entrée en fichier neuf) ; B-5 (`tick()` OK en a1)** |
| **C7** « coût ≤ plafond `T_cost` (Q5) ⇒ `cost_prohibitive` » (l.91) | un seuil de coût ferait **échouer les 4 mints fondateurs eux-mêmes** (très actifs) ⇒ pré-enregistrer un seuil qui exclut l'ancre est un anti-motif | **→ B-1 : C7 = colonne, `T_cost` différé à l'ADR d'ajout** |

## 2. Corrections — liste fermée

### Bloquantes (B-1..B-11 ; pliées dans le G0 AVANT le commit du pré-enregistrement et AVANT tout worker/appel)
- **B-1 — C7 devient une COLONNE sans seuil.** M1 (coût full-mint) **rapporté** comme colonne ; le seuil `T_cost` est **différé à l'ADR d'ajout par symbole** ; **Q5 retirée**. Aucun mint n'est disqualifié par le coût au stade -iii.
- **B-2 — C4 refondu.** Colonne **`quote_vault_balance_usd`** de **première main** (solde on-chain du vault quote), **jamais « profondeur »** (mot supprimé partout). Étiquette **`below_founding_anchor` NON excluante** (publiée, calque `discover.ts` « publié, jamais dropé »). **Jeu de pools d'ancrage + date de lecture PRÉ-ENREGISTRÉS** : ancre = `FOUNDING_POOLS` (`pools.ts:166-179`, 4 vaults quote fondateurs, USDC, `quote_class:"usd"`). **`T_vol` supprimé comme seuil** ; le volume tiers reste une **colonne de triage**. **Oracle de calibration pré-enregistré** : les **4 mints fondateurs** (`pools.ts:90-99`) **apparaissent dans l'énumération à épuisement, adresse identique caractère-pour-caractère, satisfont C1-C6** ; **sinon STOP** (l'énumérateur est cassé).
- **B-3 — M2 sans total, chaque composante étiquetée.** M2(a) = **154 cr/mint** (échantillon 3 points × 5 pages, `PLI-lot-t1a-ii-b1-bis.md:121-122`), **jamais** 575. **M2 n'a JAMAIS de total** ; chaque composante porte `measured` / `extrapolated_n4` / `not_measured`. « **5,4 M** » = **projection** (`G0-b3d:23`, incertitude large auto-déclarée), jamais un fait.
- **B-4 — Isolation.** **Point d'entrée CLI PROPRE dans un fichier neuf** (jamais `runMain` de `collect.ts`) ; **aucune modification de `collect.ts` tant que -b3d-a n'est pas fusionné** ; **-iii-b vient APRÈS la FUSION de -b3d-a** (il consomme `readPriorCalls`/`--max-credits`, qui n'existent que dans le worktree -b3d).
- **B-5 — Sources tierces gated.** Chaque **PR-U-\*** nomme ses documents (conditions d'usage, doc API, `robots.txt`) + une **règle de décision pré-enregistrée** (lecture ⇒ source admise **ou** repli nommé). **ALLOWLIST D'HÔTES dans le sampler HTTP alimentée SEULEMENT par le PLI après lecture**, avec **mutant** (hôte hors allowlist ⇒ refus). **Les GET publics passent par `tick()` du même budget** (main l'expose déjà, `collect.ts:296,305`).
- **B-6 — Procurements manquants formés** : **PR-U-BACKPACK**, **PR-U-SUPERSTATE**, **PR-U-SOLANA-PUBLIC-RPC** (limites/conditions de `api.mainnet-beta.solana.com` et publicnode ; prérequis du premier appel keyless).
- **B-7 (-iii-b)** — **Allowlist de MÉTHODES dans le chemin d'appel** : toute méthode hors `{getSignaturesForAddress, getAccountInfo}` ⇒ **`BudgetExceededError` AVANT l'envoi** (+ mutant). **Plafond en CRÉDITS sur un LEDGER DÉDIÉ** (JAMAIS partagé avec -b3d : le plafond 6,5 M de la décision 67 est « pour cet usage »). **Lecture du dashboard AVANT** (consommé + réserves + 50 k ≤ 10 M) **et APRÈS** (delta == `credits_recomputed`, sinon STOP). **`N × C_page` + surcoûts ≤ plafond écrit noir sur blanc** (N=20 × 2 500 = 50 000 ne laisse **AUCUNE marge** ⇒ **`C_page` ≤ 2 000 ou deux paliers**).
- **B-8 — CA-11 durci.** Test de rejeu **`universe-candidates` committé** + **pré-enregistrement committé → classement committé à l'octet** ; test **-iii-b lisant le top-N DEPUIS l'artefact committé de -iii-a** (RPC stubé) ; **rejeu checkpoint-2 depuis le brut émetteur sha-pinné** sous **`F:\tmp\cp2-t1a-iii-a\`**.
- **B-9 — Amendement daté d'ADR** (ADR-T1aii ou ADR-B0 D6) : **sources nouvelles (R-8)** + **table des tuyaux §4.2**, AVANT tout code — le **TEXTE de l'amendement est rédigé dans le G0** (l'orchestrateur le portera).
- **B-10 — FAIT par l'orchestrateur** (`docs/CHANTIERS.md:244-245`, commit **`001750e`**) : amendement de la décision 82, verbatim investisseur « pourquoi tu ne veux pas le faire maintenant? » ⇒ Phase A lançable dès G0 plié + pré-enregistrement committé, Phase B après fusion -b3d-a + sonde -b3d.
- **B-11 — Anti-close par ALLOWLIST DE CHAMPS, jamais par strip.** Artefact construit par **allowlist de champs** ; **aucun couple de champs dont le ratio donne un prix** (attention `fdv_usd`, `market_cap_usd`, solde base + solde quote). **Donnée tierce et bruts HORS dépôt**, sha-pinnés sous **`F:\PRODUITS\`**, par défaut ; **seuls les champs on-chain committables avant lecture des conditions** ; **fixtures synthétiques seulement**. **Seam PRÉ-DÉCLARÉ** : **-iii-a1** (identité + `ScaledUiAmount`, première main seule) **puis -iii-a2** (liquidité + classement) ; **R-25 ré-estimé pour chacun** (le validateur juge **~770 sous-estimé**).

### Non bloquantes (NB-1..NB-8 ; au plus tard au G1)
- **NB-1** — citations corrigées (défauts a-h ci-dessus).
- **NB-2** — **filtrer `deployments[].network` côté client** (`L-lecture…:409` : les filtres serveur `underlyingType`/`listingCountry` rendent des listes vides ⇒ ne pas s'y fier).
- **NB-3** — déclarer le **biais d'énumération par API de DEX** (l'ensemble des pools vus dépend du DEX interrogé).
- **NB-4** — **`C_page` à deux paliers** : K pages de débit pour tous ; épuisement seulement si projection < cap.
- **NB-5** — conditions d'usage : **citation ≤ 25 mots + URL + date + sha**, jamais le texte collé.
- **NB-6** — « **811** » à mesurer (défaut h).
- **NB-7** — dire que **pour un mint capé, le coût par symbole N'EST PAS livré** (plancher + débit seulement).
- **NB-8** — **une seule mission lecteur** pour toutes les lectures de conditions.

## 3. Réponses aux questions Q1..Q9
- **Q1** — N = 20 **acceptable sous B-7 / NB-4** (porté dans l'escalade Q6).
- **Q2** — **`C_page` ≤ 2 000 pages** ou **deux paliers** (N × cap sans marge sinon).
- **Q3** — **(a)** : plancher + débit récent seulement (Phase B pure 1-cr ; pas de page gTfA asc).
- **Q4** — **structure acceptée, MODIFIÉE par B-2** (`quote_vault_balance_usd` ancré sur `FOUNDING_POOLS` ; `below_founding_anchor` non excluant ; `T_vol` retiré).
- **Q5** — **SUPPRIMÉE** (C7 = colonne, `T_cost` différé, B-1).
- **Q6 / Q7 / Q9** — **ESCALADE-INVESTISSEUR** (EN ATTENTE DE DÉCISION INVESTISSEUR ; aucune réponse présumée).
- **Q8** — **oui sous quorum-2 keyless** avec **`scaled_ui_unread` fail-closed** (`ScaledUiAmount` lu en Phase A).

## 4. Conditions d'ordonnancement
- **Chemin critique** (-b3d, -b1-bis-ii, -b3c, T-1b) **prioritaire sur toute file**.
- **Aucun run keyless de phase A pendant un run réseau du chemin critique** (mêmes RPC publics, même IP).
- **Aucun tirage Helius concurrent.**

## 5. Question à l'INVESTISSEUR (verbatim du validateur, à reproduire — EN ATTENTE DE DÉCISION)
> (1) plafond **50 000 cr** pour compter les signatures des **20 premiers candidats**, cumul pire cas **7,58 M / 10 M**, plancher + débit pour les mints très actifs ; (2) **créneau A** (après la sonde -b3d, hors tout tirage du chemin critique) **ou B** (après la course -b1-bis-ii) ; (3) **report de Backpack/Sunrise et Superstate** avec **deux lectures d'émetteur formées**, déclenchées après le release.

**Recommandation du validateur** : (1) **oui** ; (2) **A** sous priorité absolue du chemin critique et contrôle dashboard ; (3) **oui**.

## 6. AM-1 — ce que la checklist a attrapé
« 575 » mal décomposé (154 réels) ; **C7 faisant échouer les 4 fondateurs** ; **violation d'isolation `collect.ts`** ; **ignorance de `--max-credits`** ; **ledger partagé couplant deux plafonds** ; **N × cap sans marge** ; **deux « items formés » sans procurement** (Backpack/Sunrise, Superstate) ; **RPC public sans lecture de conditions** ; **donnée tierce committée avant lecture** ; « **pourquoi pas maintenant** » non consigné (orchestrateur). `error_origin` du G0 (`CHANTIERS:245`) : **worker** (575 mal décomposé, C7 incohérent, isolation `collect.ts`) + **orchestrateur** (« pourquoi pas maintenant » non consigné avant de lancer).

## 7. Note de persistance (rédacteur `claude-opus-4-8[1m]`)
- **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max) — je suis le RÉDACTEUR, pas le validateur ; l'avis de §Décision reste celui de `claude-fable-5-1`.
- **Sur la checklist CA-1..CA-11** : l'avis rendu par le validateur **n'énonce pas de verdict CA par CA** (contrairement au format -b3d) ; je ne le fabrique pas. **Mapping dérivé de l'avis** (non rendu ligne par ligne par le validateur, à confirmer par lui si un G7 l'exige) : **CA-1** ← B-1/B-2/B-3 (seuils/critères falsifiables, pré-enregistrés, sans circularité) ; **CA-9** ← B-8 (re-exécution imposée, rejeu checkpoint-2 depuis le brut sha-pinné) ; **CA-11 durci** ← B-8 (composition exécutée depuis l'artefact committé) ; **anti-close** ← B-11 (allowlist de champs) ; **fan-out (CA-4)** ← seam -iii-a1/-iii-a2 puis -iii-b séquentiels, un worker.
- Toutes les citations `fichier:ligne` de ce document ont été **ouvertes et lues** dans `F:\Monark` (et `F:\Monark-wt-bellb3d` pour le worktree -b3d) avant écriture.
