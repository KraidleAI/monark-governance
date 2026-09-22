MODELE RESOLU: claude-opus-4-8[1m]

# G0 (BROUILLON — PROPOSÉ) — Sprint backlog lot Ukemi **U-5** : le PRODUCTEUR servi de ŷ (décision 123) — book attesté fourni → `Prediction` par la règle close-factor GELÉE, prend le siège de `cascade` dans la MÊME fusion

> **STATUT : BROUILLON DE WORKER — NON COMMITTÉ, NON VÉRIFIÉ.** Sortie brute pour l'orchestrateur (R-21). **Tout est « proposé ».** Aucun code, aucun réseau, aucun commit, aucun workflow dans ce G0 (plan seul).
> **Provenance** : worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22. Mission DOCS SEULEMENT. `F:\Monark` LECTURE SEULE (HEAD `cabd3d5`, `lot/etude-suite`, clean) ; écriture confinée à `F:\tmp\u5\` ; rien sur `C:` ; règle A-7 (aucune variable d'env affichée ; aucun test payant). Mesures reproductibles : `F:\tmp\u5\MESURES.md` (M-0..M-14 ; **M-12 = faisabilité MESURÉE 565/565**).
> **R-20** : le worker ne committe pas, ne déclenche aucun workflow ; verdict/commit = orchestrateur `claude-fable-5-1`. **R-21** : chaque affirmation porte sa preuve (`fichier:ligne` / grep / mesure, cf. MESURES). **R-1** : modèle résolu déclaré première ligne.
> **Cadre décisionnel** : **décision 123** (`CHANTIERS.md:622-627`, verbatim « D ») — décision 51 MAINTENUE À LA LETTRE ; le **remplaçant réel de `cascade` est le PRODUCTEUR de ŷ** (livre attesté → `Prediction` par la règle close-factor gelée, nom de travail `fromRealizedBook`), pas la classe du `gate` ; le retrait de `cascade` **se déplace à la fusion de U-5**. Item formé 123(i) : « le G0 de U-5 doit TRANCHER son périmètre (trois documents divergent) » — c'est l'objet §1. Item 123(ii) : « faisabilité d'un producteur PUR sous K-8 + oracle d'égalité sur TOUTES les lignes `score_a` du JSONL frais » — §2. Item 123(iii) : « relevé des appels externes à `cascade` (logs servis) — dimensionne la pierre tombale » — §11 Q. Item 123(iv) : « pivot D5 : consigné NON TIRÉ » — §11 Q.
> **Sources amont** : décision **51** (`CHANTIERS.md:116` : Ukemi jamais `upcoming`, `cascade` retiré dans la même fusion que son remplaçant réel ; endpoint garde 4 outils, le 4ᵉ change de contenu et de nom, alias déprécié une version, version bumpée ; ADR-M005 D14 maintenue), **50/59** (`:115,:124` : le texte intérimaire « v0 » et le nommage), **108** (`:467` : classe A seule au release ; B/shortfall hors service), **119** (`:559-562` : HORS portée = U-6 course live, site, DNS, achats), **122** (accélération sans perte de qualité). Avis **architecte** (option D, `AVIS-architecte:52-88`), **DeFi** (« candidat = producteur de ŷ, coût statistique nul, seconde implémentation, oracle d'égalité sur toutes les lignes `score_a`, fail-closed version de protocole, bloc dans la sortie, clause C-6 servie à chaque réponse ; rejeter region-for-account par adresse », `AVIS-defi:58-89`), **marché** (« aucun acheteur nommé, pivot D5 non tiré, ne pas forcer », `AVIS-marche:29-32,89-91`). ADR-M020 D3/D4/D5, ADR-U4b, ADR-M005 D14, ADR-M007, ADR-M019 D2/D5. G0/checkpoint-1 U-4b-2 (`docs/G0-lot-u4b-2.DRAFT.md`, `docs/CHECKPOINT1-lot-u4b-2.md`) : état d'entrée, C-1..C-12.
> **Prérequis DUR (item à déclencheur, pas une question)** : U-5 démarre APRÈS la fusion de U-4b-2 **-2b** (registre FRAIS épinglé + `fleet.ts` re-câblé sur la jambe `gate` + course -1b close). État d'entrée mesuré : MESURES M-11. Sans -2b, U-5 est bloqué (§8).

---

## §1. PÉRIMÈTRE TRANCHÉ (proposé) — U-5 = l'outil PRODUCTEUR `ukemi-predict`, K-8 pur ; le témoin résiduel = lot SÉPARÉ

**Les trois documents divergent** (mesuré) :
- **ADR-M020 D4** (`ADR-M020:44`) : « U-5 = témoin résiduel oracle/marché ; rejeux A-H pré-enregistrés ».
- **TABLEAU §3** (`TABLEAU-DE-BORD.md:48`) : « U-5 branchement outil servi | À VENIR | après U-4b ».
- **G0 U-4b-2 §10** (`G0-lot-u4b-2.DRAFT.md:185`) : « U-5 — outil servi COMPLET : calcul serveur de ŷ (adaptateur wiré côté serveur depuis un book attesté) + témoin résiduel oracle/marché ».

**Définition UNIQUE proposée (à trancher par l'orchestrateur/investisseur — décision de périmètre, item 123(i))** :

> **U-5 = l'outil MCP/HTTP `ukemi-predict` (nom proposé, §3/Q-U5-1) : un PRODUCTEUR de ŷ, PUR (K-8), déterministe, sans revendication statistique.** Entrée = un **book attesté fourni** (tranche mono-compte, §3) + le chemin d'oracle `D_e` + les paramètres e-mode ; sortie = une `Prediction` (ŷ à la règle close-factor GELÉE v3.5.0, au premier franchissement, base 8-déc entière) + son enveloppe K-1 (strate, `m_bps`, `p*`, `book_digest`, bloc, clause). Il **prend le siège de `cascade`** dans la MÊME fusion (retrait de `cascade`, décision 51/123). Sa sortie est **CONSOMMÉE** par la classe `gate` `liquidation-eligible-coverage` (livrée en U-4b-2) : c'est le tuyau `producteur → gate → région servie` (ADR-M020 D3 ligne « Prediction → gate »).

Justification (branchement, CLAUDE.md « built ⇔ branché ») : la classe `liquidation-eligible-coverage` servie par U-4b-2 est **conditionnelle à un ŷ produit par la règle gelée**, laquelle vit dans `scripts/census/u4b/u4b-scores.mjs`, **hors copie publique** (`AVIS-defi:44-47`, `AVIS-architecte:31-32`) ⇒ **aucun tiers ne peut produire un ŷ conforme servi** ; le producteur comble ce trou (« la seule pièce qu'un tiers ne peut pas refaire sans nous », `AVIS-defi:86`). C'est la « vraie plus-value » (mandat investisseur 123).

**Le « témoin résiduel oracle/marché » de D4 (`ADR-M020:44` ; D3 ligne 4 `:33`) : PROPOSÉ = lot SÉPARÉ, hors U-5** (Q-U5-2). Motifs :
1. La décision 123 a re-périmétré U-5 comme LE producteur ; c'est ce qui prend le siège de `cascade` et fixe la fusion de retrait. Y adjoindre le résidu alourdit et dé-atomise la fusion critique (R-25, §7).
2. Le témoin résiduel est un **tuyau distinct** (`ADR-M020 D3:33` : « oracle attesté vs marché attesté (Shōgen étendu) → `attested.residual` du gate ; rejeux pré-enregistrés 2025-02-21, CAPO ») — il dépend de la couture `attested`/Shōgen et de l'énumération oracle-vs-marché, PAS de la règle close-factor. En U-4b-2, l'`attested` sur la classe liq est **refusé** (`G0-lot-u4b-2:82` D-5, ligne `["liquidation-eligible-coverage", []]`), avec « le témoin résiduel est U-5 ».
3. Placement recommandé du résidu : **lot propre (« U-5-witness ») OU fondu dans U-6** (`ADR-M020:45` : `sentinel-2 → /ukemi/` servi), car il partage la machinerie attested-book/served de U-6. **Le worker ne tranche pas** (valeur/numérotation ADR) : Q-U5-2.

**Ce que U-5 N'EST PAS** (rejeté, sur pièces) :
- **« region-for-account par adresse »** (le serveur cherche un compte par son adresse) : **rejeté** — viole K-8 (I/O serveur) et ADR-M020 D1(b) (nouvel événement) ; c'est U-6 (`sentinel-2 → /ukemi/state.json → attest`) (`AVIS-defi:75`). ⇒ le book du compte est **PORTÉ par l'appelant**, jamais recherché serveur (§3).
- Un 4ᵉ outil « lecture de calibration » inventé pour tenir un chiffre : déconseillé (`AVIS-architecte:33`).

---

## §2. FAISABILITÉ SOUS K-8 — MESURÉE : producteur pur FAISABLE (item 123(ii))

**Verdict : un producteur PUR (K-8) est FAISABLE — MESURÉ, pas argumenté. Aucun repli B forcé** (le repli §9 reste pré-déclaré par prudence, décision 123).

> **Mesure directe (MESURES M-12)** : l'instrument `F:\tmp\u5\scratch\measure-producer.mjs` ré-implémente le bloc ŷ (pur, AUCUN I/O ni import sentinel dans le chemin de calcul) et le rejoue sur les 565 lignes `score_a` : **565/565 ÉGAL** sur `{yhat, strate, m_bps, pstar}`, 0 écart. Tranche mono-compte = **30 244 octets** (39 réserves + 1 compte + `D_e`) vs cap 262 144 (256 KB) ⇒ **marge ×8,67**. Preuves complémentaires : MESURES M-2/M-3/M-4/M-7.

> **Frontière -2a/-5a de l'adaptateur `fromRealizedBook` (A-6) — NON tranchée à HEAD (MESURES M-13) ⇒ Q-U5-0.** Le calcul PUR de ŷ a sa place dans **`packages/monark/src/adapter-book.ts`** (déjà K-8-pur, `:12-13` ; `@monark/monark` déjà dépendance du harness, `apps/harness/package.json:15`), PAS dans `src/tools/`. **G0 U-4b-2 2a-5** (`:59`) et **checkpoint-1 §10** (`:97`, « -2a re-périmétré … `fromRealizedBook` … invariant à la réponse de l'investisseur ») placent `fromRealizedBook` en **-2a** ; la **décision 123** le déplace à U-5 (avec le producteur/retrait). **Mot discriminant** : décision 123 `:625` dit « -2a = classe servie sur registre vide (**inchangé**…) » — « inchangé » (= le -2a re-périmétré du checkpoint, qui INCLUT A-6) penche vers **-2a garde A-6 ⇒ -5a = wrapper**. ⇒ **si -2a livre déjà `fromRealizedBook`, l'outil U-5 est un MINCE wrapper K-8 qui l'importe, les oracles A/B sont partagés/hérités, et -5a s'effondre** (§7). Le worker ne tranche pas : Q-U5-0.

### 2.1 Ce qu'il faut RÉ-IMPLÉMENTER de `computeScoresU4b` sans I/O

Le fichier gelé importe `node:fs`/`node:crypto`/`node:url`/`node:path` + `apps/sentinel/src/ukemi/{wadray,abi}.ts` (M-2). Un outil sous `src/tools/**` est K-8 pur (M-3). On **ré-déclare** (jamais on n'importe le module gelé — motif D-4 U-4b-2, jugé « la bonne architecture, K-8 + frontière apps, mesuré » par le checkpoint `CHECKPOINT1-lot-u4b-2:56`). **Home du calcul pur = `packages/monark/src/adapter-book.ts` (`fromRealizedBook`/A-6), PAS `src/tools/`** — une seule implémentation, importée par l'outil + les deux oracles + les tests (Q-U5-0 : à RÉUTILISER si -2a la livre ; sinon -5a la construit là) :

| # | À ré-implémenter (pur, bigint) | Source gelée | Dépendance sentinel | K-8 |
|---|---|---|---|---|
| a | `STRATA_CUTS_SERVED` + `strateOf(yhat)` | `u4b-scores.mjs:53-59` | — | **déjà** dans le harness (U-4b-2 2a-2 / D-4 / C-5) — RÉUTILISER, ne pas re-créer |
| b | `percentMul(value,bps)` = `(v·bps+5000)/1e4` | `wadray.ts:21-23` | `wadray.ts` (0 import) | ré-déclarer (3 lignes) |
| c | Cœur ŷ par compte : `hfAt`, premier franchissement, `C_weth`, `CA`, `D_tot`, `halfDtot`, boucle ŷ=max (gate/CF/CA), mono-WETH X=0, e-mode {0,WETH-cat} | `u4b-scores.mjs:88-224` | — | ~90-120 lignes pur bigint |
| d | Constantes v3.5.0 `T,HF95,CF_BPS,WAD,WETH` | `u4b-scores.mjs:38-47` | — | littéraux |
| — | `decodeEModeCategoryData` (ABI) | `abi.ts:173-184` | `abi.ts → rpc.ts` (non-K-8) | **NON requis** : `emode_params` pris DÉCODÉ (M-2), décodage hors outil |
| — | `createHash`/`node:crypto` | `u4b-scores.mjs:32,61` | — | **NON requis** : `book_digest` porté, pas recalculé (M-2/M-7) |
| — | Y/déficit/`usdt_prices` (scoring) | `u4b-scores.mjs:102-120,229-238` | — | **NON requis** : le producteur émet ŷ SEUL, pas de score |

**`dust_bounded`/`LEFT` NON portés** : le dust est un résidu de census (`u4b-scores.mjs:217-221`) qui **ne touche jamais ŷ** (l'instrument M-12 l'omet et rend 565/565) ⇒ le producteur ne l'émet pas (option : l'ajouter à `provenance`, Q-U5-6-bis). Idem Y/déficit/`usdt_prices` (scoring, pas ŷ).

**Écart déclaré** (item formé, motif U-4b-2 item 6) : le commentaire du fichier gelé `u4b-scores.mjs:51` dit `strateOf` « imported by gate.ts » ; le fichier gelé ne peut être édité ⇒ la ré-déclaration pincée EST l'implémentation réelle, prouvée équivalente par l'oracle d'égalité (2.2) et le pin-test `STRATA_CUTS_SERVED == Number(STRATA_CUTS)` (déjà exigé en U-4b-2 C-5).

### 2.2 Oracle d'égalité contre le module gelé — sur TOUTES les lignes `score_a`

- **Cible mesurée** (M-6) : `U4b-scores-e2.jsonl` porte **565** lignes `score_a` `{address,y,yhat,score,liquidated,strate,m_bps,pstar}`.
- **Oracle A (contre les lignes committées, e2 puis FRAIS)** : `u5_producer_yhat_equals_frozen_on_all_score_a` — pour CHACUNE des 565 lignes `score_a`, construire la tranche mono-compte depuis `U4b-book-23545087.json` (le compte `row.address`) + `D_e` (`U4b-oracle-path-e2.jsonl`) + `emode_params`, appeler le producteur, asserter **`yhat`, `strate`, `m_bps`, `pstar` égaux à la ligne** (bigint exact). Rejoué sur le **JSONL FRAIS** après la course -1b (item 123(ii)).
- **Oracle B (contre le module gelé LIVE, sur TOUS les comptes)** : dans un test **export-exclu** (motif `ukemi-u4b-scores.test.ts`, `export-exclude-tests.json` — il importe `scripts/census`), rejouer `computeScoresU4b` gelé sur le book entier, et pour CHAQUE compte (16 096) asserter que le producteur rend le même ŷ/strate/m_bps/pstar **OU** le même refus (`non_evaluable`/no_crossing/no_aweth) — couvre les branches fail-closed que `score_a` (cellule A seule) ne contient pas. Mutant : une constante v3.5.0 altérée (T, HF95, CF_BPS) ⇒ ROUGE ; e-mode non fail-closed ⇒ ROUGE ; non-WETH non tenu à p0 ⇒ ROUGE.
- **Copie publique (MESURES M-14, mesuré)** : le book/scores u4b sont EXCLUS du miroir (décision 111, `export-exclude-data.json` ; `ukemi-u4b-scores.test.ts` ∈ `export-exclude-tests.json`) ⇒ un Oracle A dans `apps/harness/test/` lisant le book 7,5 Mo **échouerait en public** (fixtures absentes). **Scinder** (motif U-4b-2 C-5) : (a) un test PUBLIC-survivant à **fixture littérale committée réduite** (poignée de comptes : mono-WETH e-mode 0, e-mode WETH-cat, no-crossing, crossed-yhat-zero, non_evaluable) dans `apps/harness/test/` ; (b) l'oracle COMPLET (565 lignes + Oracle B sur les 16 096 comptes) dans `apps/sentinel/test/` AJOUTÉ à `export-exclude-tests.json` **dans le MÊME sous-lot** que sa création.

### 2.3 Taille d'un book vs cap 256 KB — MESURÉE

- Book ENTIER = **7,5 Mo ≈ 29× le cap 256 KB** (M-4) ⇒ **inservable en entier**. Cap réseau = Caddy `request_body max_size 256KB` (`deploy/Caddyfile.monark-harness:10,17`) ; garde interne 512 KiB ⇒ 413 (`server.ts:40-46`).
- **Tranche mono-compte servie MESURÉE = 30 244 octets** (39 réserves + 1 compte + `D_e` complet, M-12) vs cap 262 144 ⇒ **marge ×8,67**. `maxItems` au bord SDK (motif `CASCADE_MAX_NODES`) sur `reserves`, `balances`, `updates`.
- **DÉFAUT PROPOSÉ : porter TOUTES les réserves (12,4 KB, marge déjà mesurée), PAS d'élagage.** Piège mesuré : la règle gelée **saute silencieusement** tout token de solde absent de `resByV` (`u4b-scores.mjs:190` « `if (r === undefined) continue; // aWETH or an unknown token` ») — correct SEULEMENT parce que le book complet porte chaque réserve. Un `reserves[]` élagué où l'appelant OUBLIE un vtoken de dette ⇒ ce token devient « unknown » ⇒ sauté ⇒ **ŷ silencieusement SOUS-compté** (non couvert par le 565/565, mesuré avec les 39 réserves). ⇒ si l'élagage est retenu (Q-U5-6), il EXIGE une **garde fail-closed que la règle gelée n'a pas** : tout token de solde non-nul qui n'est ni aWETH ni un vtoken PORTÉ ⇒ **400** (+ mutant). L'instrument M-12 doit alors rejouer l'oracle sur tranches élaguées AVANT toute revendication d'équivalence.

### 2.4 Fail-closed sur la version de protocole (v3.5.0 seulement)

- La règle est « CLOSE FACTOR v3.5.0 » (`u4b-scores.mjs:5` ; LiquidationLogic.sol v3.5.0, `ADR-U4b:10`). **Aucun champ de version de close-factor n'existe dans le book** (M-4 : book porte `schema="ukemi-book/1"`, pas de version protocole). Risque réel déjà consigné : `ADR-U4b`/PR-U4-3-ter (« v3.7 change d'autres arrondis — item formé si l'épisode FRAIS tombe après v3.7 », `CHANTIERS.md:579`).
- **Proposé** : l'entrée porte un champ **`close_factor_version` obligatoire ; le producteur REFUSE (400) tout ≠ `"3.5.0"`** (`AVIS-defi:71` « échouer fermé sur la version de protocole v3.6, v4 ») ; + refuser `book.schema ≠ "ukemi-book/1"` et `oracle.schema ≠ "ukemi-u4b-oracle/1"` (M-4/M-5). La version modélisée est **DÉCLARÉE dans le label servi** (2.5). Mutant : `close_factor_version:"3.7.0"` accepté ⇒ ROUGE.

### 2.5 « Bloc dans la sortie », clause C-6 servie, jambes non-WETH figées p0

- **Book stale par nature** ⇒ le **bloc** figure dans la sortie (`AVIS-defi:72`) : `provenance.block` (= `book.block`, ÉCHO de l'entrée) + `provenance.book_digest` (§3) + un libellé de fraîcheur.
- **NON-RÉ-VÉRIFICATION (correction — sinon sur-revendication)** : le producteur reçoit une **tranche mono-compte** ; il ne PEUT PAS recalculer `book_digest` (le digest couvre les 16 096 comptes ; K-8 l'interdit de toute façon) ⇒ `book_digest`/`features_digest` et `D_e` sont **PORTÉS par l'appelant, NON re-vérifiés** (aucun vérifieur ne tourne, K-8). Le `label` porte une phrase de non-ré-vérification (motif `GATE_NON_REVERIFICATION_SENTENCE`, `gate.ts:117-119`, ADR-M017 D2(iv)) : « the book slice, its digest and the oracle path are carried by the caller and are NOT re-verified here; no verifier runs (K-8) ». ⇒ ŷ est un **recompute déterministe des ENTRÉES PORTÉES** par la règle close-factor gelée, **pas** « des faits on-chain ».
- **Clause C-6 servie à CHAQUE réponse** (`AVIS-defi:74`, checkpoint U-4b-2 C-6/C-8) : le `label` porte VERBATIM « ŷ = recompute déterministe des entrées PORTÉES par la règle close-factor gelée (Aave v3.5.0), au premier franchissement, mono-collatéral WETH, jambes non-WETH tenues à p0 ; **la couverture, si elle est revendiquée, l'est par le `gate` sur l'épisode CALIBRÉ, et aucune couverture n'est revendiquée sur un autre événement** ; entrées non re-vérifiées ; book = instantané au bloc N (stale) ; jamais une probabilité, jamais une garantie ». Mutant (retrait de « aucun autre événement » OU de la non-ré-vérification) ⇒ ROUGE (motif U-4b-2 mutant (h), `gate.ts:498`).
- **Jambes non-WETH figées p0** (`u4b-scores.mjs:13` « other assets held at p0 », D2 limit) : le producteur tient les actifs non-WETH à `p0` (le WETH seul est reprisé le long de `D_e`) ; limite DÉCLARÉE dans le label.

---

## §3. CONTRAT de l'outil `ukemi-predict` (proposé) — aucun enum gelé touché

**Nom** (Q-U5-1) : `ukemi-predict` (proposé). Le worker ne tranche pas le nom public (décision de surface, 51 Q2 « le 4ᵉ change de nom si l'ADR le décide »). Alternatives : `ukemi-yhat`, `predict-liquidable`, `book-predict`.

### 3.1 Entrée (NON-frozen, déclarée dans `schema-projection.ts`, motif `CASCADE_INPUT_SCHEMA:183-205`)

```
{
  book:  { schema:"ukemi-book/1", chain_id, cluster, block, book_digest,
           reserves: [ {asset,atoken,variable_debt_token,decimals,
                        liquidation_threshold_bps,liquidation_bonus_bps,
                        reserve_emode_category,price_base_8dec}, ... ]   // maxItems cap
           accounts: [ <EXACTEMENT UN compte> ] },                       // len===1 fail-closed
  oracle: { schema:"ukemi-u4b-oracle/1", event_id, anchor_price,
            updates:[{block,log_index,price},...],                       // maxItems cap
            emode_params:{ "<cat>":{lt,bonus} } },                       // DÉCODÉ (M-2)
  close_factor_version: "3.5.0",                                          // fail-closed ≠ 3.5.0
  produced_at: "<RFC3339>"                                               // caller-carried (K-8, motif cascade:105)
}
```
`additionalProperties:false` partout ; jamais dans `schemas/` (précédent `params`/cascade/attest, `schema-projection.ts:26-27,105-110,181`). `emode_raw` **non retenu** par défaut (Q-U5-4) : la règle gelée prend `emode_params` décodé (M-2) ; prendre `emode_raw` exigerait de ré-déclarer `decodeEModeCategoryData` (pur mais second re-impl) — proposé seulement si l'orchestrateur veut l'auto-suffisance ABI.

### 3.2 Sortie (enveloppe K-1 `{prediction, provenance, label}`, motif `attest` `schema-projection.ts:234-252`)

- **`prediction`** = `Prediction` GELÉE (M-7), rien d'autre dedans (K-1) :
  `{ schema_version:"1.0.0", task_class:"liquidation-eligible-coverage", yhat:<ENTIER base 8-déc>, predictor_id:"<base>/s<k>", produced_at, features_digest:<book_digest 64-hex> }`.
  - `yhat` = **JSON `number`** (`Number(bigint)`, exact car < 2^53 — borne C-9 ; `Number.isSafeInteger` fail-closed AVANT émission). **NON une chaîne** : les branches numériques du `gate` jettent sur `typeof yhat !== "number"` (`gate.ts:591,597`) et la classe `liquidation-eligible-coverage` (U-4b-2 D-1/2a-3) fait `Number.isSafeInteger(yhat)` ⇒ un `yhat` chaîne ferait **400** le tuyau producteur→gate au G1. (Le fixture `score_a` porte `yhat` en chaîne — représentation de census, pas la `Prediction` servie.) **ENTIER base 8-déc** (même unité que les scores committés à `scale=1`, U-4b-2 D-1 ; un ŷ en décimales-USD ⇒ strate fausse, mutant §6-5).
  - `book_digest` rid DANS la `Prediction` via **`features_digest`** (champ gelé optionnel `^[0-9a-f]{64}$`, M-7) — **ÉCHO du digest PORTÉ par l'appelant, jamais recalculé ni re-vérifié** (tranche mono-compte + K-8, §2.5) ; c'est une trace, pas une attestation (Q-U5-3 : ou book_digest seulement dans `provenance`).
  - `predictor_id` = **provenance seule** : le `gate` re-dérive la clé committée serveur (`UKEMI_LIQ_PREDICTOR_BASE`+`/s`+`strateOf(yhat)`) et IGNORE le `predictor_id` de l'appelant pour le lookup (U-4b-2 C-10/C-6).
- **`provenance`** (hors contrat gelé) : `{ book_digest, block, event_id, pstar, strate, m_bps, close_factor_version }` — les faits recomputables (`AVIS-defi:63` « atteste des faits, octets recalculables »).
- **`label`** (hors contrat gelé, porteur K-1) : la clause C-6 VERBATIM (2.5) + fraîcheur + « never a probability / no guarantee / no score » (vocab-clean, `lang:gate`).

### 3.3 Erreurs nommées (400 fail-closed) — `UkemiPredictToolError`

Nouvelle classe d'erreur `UkemiPredictToolError` (motif `CascadeToolError:110-115`), **ajoutée à `TOOL_ERROR_NAMES`** (`http.ts:36`) ⇒ 400 côté miroir, jamais 500 (checkpoint U-4b-2 §5 point 1 : un refus doit porter un `name` de `TOOL_ERROR_NAMES`). Refus nommés (aucun ŷ émis, jamais estimé) :
- `book.schema ≠ "ukemi-book/1"` ; `oracle.schema ≠ "ukemi-u4b-oracle/1"` ; `close_factor_version ≠ "3.5.0"` (2.4) ;
- `accounts.length ≠ 1` ; réserve WETH absente du book (`u4b-scores.mjs:89`) ; `anchor_price ≤ 0` (`:83`) ;
- compte non mono-collatéral WETH (`residual ≠ 0`) ⇒ `non_evaluable` (`:149`) ; e-mode ∉ {0, WETH-cat} ⇒ `non_evaluable` (`:160`) ; params e-mode manquants (`:158`) ;
- `yhat` non `isSafeInteger` (2.1/M-7) ; `produced_at` non RFC3339 (`cascade.ts:118,160`).
- **Distinction** (Q-U5-7) : un compte évaluable **sans franchissement** ⇒ `yhat=0` (`u4b-scores.mjs:175`) — est-ce une `Prediction` `yhat:0` servie (cohérent avec le gate qui abstient si hors strate committée) OU un refus nommé ? Proposé : **`Prediction` `yhat:0`** (fidèle à la règle : ŷ=0 est un fait, « NEVER a silent 0 », `:223`), le gate décide en aval.

### 3.4 Aucun enum gelé touché (mesuré, M-7)

`task_class` string libre (`prediction.schema.json`) ; `liquidation-eligible-coverage` conforme au pattern ; `features_digest` champ gelé optionnel utilisé dans son domaine (64-hex). **Aucune** édition de `schemas/*.json` ni de `packages/contracts/src/types.ts` (les 2 occurrences « cascade » y sont des DESCRIPTIONS gelées, à ne pas éditer — checkpoint U-4b-2 §3(2), C-9). `assertClosedPrediction`/`assertNoForbiddenKey` réassertés à la sortie (motif `cascade.ts:202-203`).

---

## §4. RETRAIT de `cascade` dans la MÊME fusion (décisions 51/123) — 4→4 remplacement

`ukemi-predict` **remplace** `cascade` : le set reste à **4** (51 Q2/Q3, ADR-M005 D14 maintenue). Pas d'alias incohérent (entrées incompatibles `FinancialSystem` vs book, `AVIS-architecte:50`) : **pierre tombale 410** à la place.

### 4.1 Set d'outils : `ALLOWED_TOOL_NAMES` 4→4 (remplacement, pas retrait)

- `registry.ts:32` : `["attest","gate","cascade","calibrate"]` → `["attest","gate","ukemi-predict","calibrate"]`.
- `HARNESS_TOOLS` (`registry.ts:58-122`) : descripteur `cascade` (`:76-89`) **remplacé** par le descripteur `ukemi-predict` (mêmes clés : `name/description/inputSchemaJson/outputSchemaJson/inputStandardSchema/outputStandardSchema/run`). `run` : `runUkemiPredict(input)` → enveloppe `{prediction, provenance, label}` (motif `attest.run` `:97-103`).
- **`registry.test.ts`** (le tueur de set exact) : `:50` `includes("cascade")` → `includes("ukemi-predict")` ; `:57` `deepEqual(..., ["attest","calibrate","cascade","gate"])` → `[..., "gate","ukemi-predict"]` trié ; commentaires `:40-56`.

### 4.2 Les fichiers du retrait (footprint ~55, M-9 ; catégories)

| Catégorie | Fichiers | Action |
|---|---|---|
| Outil (suppr.) | `apps/harness/src/tools/cascade.ts` | supprimé ; `runUkemiPredict`/`ukemiPredict…` neufs (fichier `ukemi-predict.ts`) |
| Dispatch/consts | `apps/harness/src/tools/gate.ts` | retrait `TASK_CASCADE`, `CASCADE_UNCALIBRATED_SENTENCE`, `cascadeVerdict` (`:53,:62-63,:421-434,:590-595`). **ATTENTION 2 points** : (a) `honestyText` **retombe sur `CASCADE_UNCALIBRATED_SENTENCE` par défaut** (`:509`) pour toute classe inconnue ⇒ **nouveau libellé par défaut** requis (« no committed calibration for this class; abstains under_calib ») ; (b) le message de classe inconnue **liste `TASK_CASCADE`** (`:603`) ⇒ à mettre à jour. La classe `cascade-liquidable-24h` disparaît du dispatch (`liquidation-eligible-coverage` de U-4b-2 la remplace comme classe numérique) |
| Binding/registre | `apps/harness/src/attestation-binding.ts` (ligne `cascade → []`, `:33`), `apps/harness/src/calibration.ts` (mentions cascade) | retrait des lignes/commentaires cascade (M-9) |
| Anti-override guard | `apps/harness/src/tools/gate.ts:557` (`taskClass === TASK_CASCADE` dans la garde anti-override BYO `:555-565`) | retrait de la branche `TASK_CASCADE` (le class-lock de `liquidation-eligible-coverage` de U-4b-2 la remplace) |
| Autres (M-9) | `packages/hikae/src/region.ts`, `packages/contracts/test/fixtures.ts` | mentions cascade à nettoyer/vérifier (fixtures de test) |
| Registre/schéma/miroir/openapi | `registry.ts`, `schema-projection.ts` (`CASCADE_INPUT/OUTPUT_SCHEMA`, `CASCADE_MAX_NODES` importé `:36`), `openapi.ts:99`, `http.ts:36` (`CascadeToolError`→`UkemiPredictToolError`) | remplacés |
| Pierre tombale | `http.ts` | +410 (4.4) |
| Trace h5 | `fixtures/h5-e2e-trace.json` (EXCLU R-25), `test/h5-trace-builder.ts`, `test/h5-e2e-probe.test.ts` | re-pin : l'étape 4 `cascade→gate` devient **`ukemi-predict`→`gate`(`liquidation-eligible-coverage`)→région** (prouve le producteur branché) |
| Tests harness | `cascade.test.ts` (suppr.→`ukemi-predict.test.ts`), `gate.test.ts`, `http.test.ts`, `openapi.test.ts`, `registry.test.ts`, `server.test.ts`, `calibrate.test.ts` | mis à jour |
| Tests racine | `test/cra-b.test.ts`, `test/harness-export.test.ts`, `test/skills.test.ts` | mis à jour |
| Deploy/verif | `scripts/verify-harness.mjs:13,32,212-215` (asserte `task_class==="cascade-liquidable-24h"` LIVE), `deploy/monark-harness.service:15` | remplacés |
| Site (visuel = 101, item SITE-U5) | `apps/site/app/integrators/page.tsx:8,89`, `components/gate-sim/board.tsx`, `components/ukemi-panel.tsx`, `lib/fleet-presentation.ts` | registre `fleet.ts` GATÉ (4.5) ; retouche visuelle = décision 101 |
| Public/skill (EXTERNE, C-10) | `README.md`, `apps/harness/README.md`, `skills/monark/{SKILL.md,INTEGRATION.md,DEMO.md}` | 4.6 |
| Contrats (NE PAS éditer) | `schemas/coverage-verdict.schema.json:5`, `packages/contracts/src/types.ts:202` | descriptions GELÉES — ÉCARTÉS (C-9) |
| Treillis (CONSERVER) | `packages/ukemi/**`, `packages/monark/src/index.ts`, `packages/atelier/src/render.ts` | `@monark/ukemi` conservé (123/U-4b-2 Q-5) ; item « sans consommateur servi » (D-9) |

### 4.3 Bump `HARNESS_VERSION` + tag

`version.ts:22` `"0.4.0"` → **`"0.5.0"`** (« bump = MÊME commit que le tag », `:7`) ; tag annoté `v0.5.0` par l'orchestrateur (R-20). Propagé automatiquement : `openapi.ts:27` (`OPENAPI_INFO_VERSION`) et `server.ts` `serverInfo.version`. Le guard interdit un `1.` de tête (`version.ts:12`).

### 4.4 Pierre tombale 410 `replaced_by` (une version) — plutôt qu'un alias

`http.ts` : une table `TOMBSTONES = { cascade: { replaced_by: "ukemi-predict", since: "0.5.0" } }` ; `POST/GET /cascade` → **410 Gone** `{error:"gone", operation:"cascade", replaced_by:"ukemi-predict", message:"cascade was replaced by ukemi-predict at v0.5.0; see tools/list"}` au lieu du 404 `unknown_operation` (`http.ts:78`) (~10 lignes, `AVIS-architecte:74`). Durée : **une version** (Q-U5-8, dimensionnée par le relevé d'appels 123(iii) — item §11). Côté MCP : `tools/list` ne liste plus `cascade` (rupture gérée par la liste, `AVIS-architecte:73`).

### 4.5 `fleet.ts` `served_by` (registre gaté, oracle-porteur)

`apps/site/lib/fleet.ts:161` : `served_by = "MCP cascade → gate (cascade-liquidable-24h; abstains…)"` → **`"MCP ukemi-predict → gate (produces ŷ by the frozen close-factor rule; consumed by the liquidation-eligible-coverage committed Mondrian region)"`** ; `integration_test` += `["u5_producer_predicts_then_gate_serves_region"]`. `note` digit-free honnête. `built` MAINTENU (Ukemi jamais `upcoming`, 51 Q1). Invariant `fleet_register_built_set_is_frozen` (`test/ci-gates.test.ts`) : le SET built {Shōgen,Hikae,Ukemi,Narabi} inchangé ; seul `served_by`/`integration_test` change (non rendus, digit-bearing) ⇒ invariant vert ssi `served_by` non-vide + test réel (M-11, `fleet.ts:8,34`).

### 4.6 Skill / registre MCP / README = PUBLICATION EXTERNE ⇒ go investisseur (C-10)

`README.md:42,144,145,195,202`, `skills/monark/SKILL.md:3,9,75` + `INTEGRATION.md`/`DEMO.md`, `apps/harness/README.md:4,101,104` : « four tools … cascade … » → « … ukemi-predict … ». La **fiche MCP Registry `tech.monarkgate/monark`** (`version.ts:6`) et le **skill ClawHub** = surfaces EXTERNES ⇒ mise à jour = **publication externe ⇒ go investisseur** (C-10 ; hors portée 119 ; `AVIS-architecte:70`, `AVIS-marche:84`, U-4b-2 C-10). **Item formé avec déclencheur** (§11).

---

## §5. TUYAUX (ADR-M018 D3 : entrée → sortie → état → test NON-LLM) — PROPOSÉS

| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration NON-LLM |
|---|---|---|---|---|
| book → ŷ | tranche mono-compte `ukemi-book/1` (recorder sentinel-2 / réduction census ; PORTÉE par l'appelant) + `D_e` + `emode_params` | `ukemi-predict` → **enveloppe `{prediction(ŷ), provenance, label}`** | pur K-8 ; refus nommés fail-closed | `u5_producer_yhat_equals_frozen_on_all_score_a` (565 lignes e2 + FRAIS) ; `u5_producer_refuses_named` |
| **ŷ → gate → région** (branchement) | `Prediction(ŷ)` du producteur | **`gate` `liquidation-eligible-coverage` (U-4b-2) → `GateDecision`** région `[ŷ−q̂,ŷ+q̂]` (n≥nMin) / `under_calib` | **`built`** ssi test bout-en-bout vert | **`u5_producer_predicts_then_gate_serves_region`** (book → `ukemi-predict` via `registry.run` → `Prediction` → `gate` via `registry.run` → région ; + un cas par `POST /` miroir) |
| cascade retrait | outil `cascade` + classe fixture | 410 `/cascade`, `tools/list` sans cascade, set 4→4 | fusion U-5 | `no_cascade_in_harness` (grep=0 hors contrats gelés/`packages/ukemi`) ; `cascade_route_is_gone_410` |
| registre public | `fleet.ts` `Ukemi.served_by` (gaté) | `/fleet`, panneau (visuel = SITE-U5, 101) | -5b | `fleet_register_built_set_is_frozen` |

Le tuyau CENTRAL (raison d'être du lot, `CLAUDE.md` branchement) = **`ukemi-predict` → `gate` → région**, re-pin dans la trace h5 (l'étape 4 devient la composition producteur→gate→région) : le producteur est « built » **ssi** sa sortie est CONSOMMÉE par un chemin servi (le `gate` `liquidation-eligible-coverage`), prouvé par un test d'intégration non-LLM qui rejoue la composition (jamais un consommateur = test unitaire/fixture seul).

---

## §6. TESTS IMPOSÉS + MUTANTS NOMMÉS (tueurs non tautologiques) — PROPOSÉS

**Tests** :
1. `u5_producer_predicts_then_gate_serves_region` — book → `ukemi-predict` (`registry.run`) → `Prediction` → `gate` (`registry.run`, classe `liquidation-eligible-coverage`) → région `[ŷ−q̂,ŷ+q̂]`+digest (strate committée) et `under_calib` (strate n<nMin). **Branchement bout-en-bout** (+ un cas via `handleJsonMirror` `POST /ukemi-predict` puis `POST /gate`).
2. `u5_producer_yhat_equals_frozen_on_all_score_a` — 565 lignes `score_a` e2 : `producteur.{yhat,strate,m_bps,pstar}` == ligne. Rejoué FRAIS (item 123(ii)).
3. `u5_producer_equals_frozen_module_all_accounts` (export-exclu) — `computeScoresU4b` gelé LIVE vs producteur sur les 16 096 comptes (ŷ + refus).
4. `u5_producer_refuses_named` — non-mono-WETH, e-mode hors {0,WETH-cat}, WETH absent, anchor≤0, `close_factor_version≠3.5.0`, `book.schema≠ukemi-book/1`, `accounts.length≠1`, yhat>2^53 ⇒ `UkemiPredictToolError` (400), aucun ŷ.
5. `u5_yhat_is_base8dec_integer` — ŷ en décimales-USD (÷1e8) ⇒ strate fausse ⇒ ROUGE.
6. `u5_label_serves_c6_clause_verbatim` — le `label` porte la clause « aucun autre événement » + la phrase de **non-ré-vérification** (« caller-carried, not re-verified; no verifier runs ») + fraîcheur + « never a probability » ; passe `gate:vocab`, `lang:gate` (ASCII). Mutant : retrait de l'une des deux phrases ⇒ ROUGE.
7. `u5_output_has_no_forbidden_key` / `assertClosedPrediction` — enveloppe = `{prediction(closed), provenance, label}` ; `FORBIDDEN_KEYS` (`packages/contracts/src/forbidden-keys.ts`) absents.
8. `u5_producer_block_in_output` — `provenance.block === book.block` (bloc dans la sortie).
9. `no_cascade_in_harness` — grep `cascade` = 0 dans `apps/harness/src`, `apps/harness/test`, `skills/`, `README.md`, `deploy/` (ÉCARTÉS nommés : `schemas/*.json`, `types.ts`, `packages/ukemi/**`).
10. `cascade_route_is_gone_410` — `POST /cascade` → 410 `replaced_by:"ukemi-predict"`.
11. `mcp_tools_have_no_side_effects` (existant, `registry.test.ts`) — set exact `{attest,gate,ukemi-predict,calibrate}` + scan K-8 de `ukemi-predict.ts` (0 `node:fs`/`fetch`/…).

**Mutants (chacun ROUGE)** :
- (a) constante v3.5.0 altérée (`T`/`HF95`/`CF_BPS`/`LEFT`) ⇒ test 2/3.
- (b) `strateOf` côté appelant (predictor_id porté, non re-dérivé) — déjà tué côté gate (U-4b-2) ; ici : producteur émet une strate ≠ `strateOf(yhat)` ⇒ test 2.
- (c) e-mode non fail-closed (catégorie autre acceptée) ⇒ test 3/4.
- (d) jambes non-WETH reprisées le long de `D_e` (au lieu de p0) ⇒ test 2/3.
- (e) `close_factor_version` non vérifiée (accepte 3.7.0) ⇒ test 4.
- (f) **anti-vacuité** : la sortie ne DÉPEND pas de ŷ (ŷ varié — book/compte différents ⇒ décision `gate` identique) ⇒ ROUGE (test 1 ; ADR-M020 D3 « ŷ varié ⇒ décision varie »). NB : ce n'est PAS « lier le book_digest » (le digest est un ÉCHO non-vérifié, §2.5) — l'anti-vacuité est la dépendance ŷ→décision.
- (f-bis) `features_digest`/`provenance` ÉCHO absent ou faux (n'échoie pas le digest porté) ⇒ ROUGE (test 8, trace) — distinct de (f).
- (g) clause C-6 « aucun autre événement » retirée du label ⇒ test 6.
- (h) `Number.isSafeInteger(yhat)` retiré ⇒ ŷ>2^53 sert une région fausse ⇒ test 4/5.
- (i) `accounts.length` non borné à 1 (le producteur agrège plusieurs comptes) ⇒ test 4.
- (j) 410 remplacé par un alias silencieux (l'ancien schéma `FinancialSystem` accepté) ⇒ test 10.
- (k) set d'outils ≠ `{attest,gate,ukemi-predict,calibrate}` (cascade laissé, ou 5 outils) ⇒ test 11.

**Contrôle live indépendant (G2-delta, contexte frais)** : rejeu de 1 + 2 + recompute contre le module gelé (3) ; anti-vacuité (ŷ ∈ {petit, grand, hors strate} ⇒ décisions gate distinctes).

---

## §7. R-25 mesuré (grep des sites) + COUTURE pré-déclarée — PROPOSÉ

Garde R-25 plafond **1205** (M-10). La fusion U-5 est LOURDE (producteur + ré-impl + oracles + retrait ~55 fichiers + h5 + version + pierre tombale + publics). **Pré-déclaration de scission (couture)** :

| Sous-lot | Contenu | Est. (ins+del gatés) |
|---|---|---|
| **-5a — PRODUCTEUR** | `packages/monark` `fromRealizedBook` (ré-impl ŷ ~120 + validations ~60) + `ukemi-predict.ts` (wrapper + enveloppe/label ~60) + `schema-projection` (entrée/sortie ~60) + `UkemiPredictToolError` + tests/mutants/oracle A+B (~300) | **≈ 600-700** — **CONDITIONNEL Q-U5-0 : si -2a a DÉJÀ livré `fromRealizedBook` (A-6), -5a se réduit au WRAPPER K-8 + schema + enveloppe + intégration ≈ 250-350** (les oracles A/B sont hérités/partagés) |
| **-5b — REMPLACEMENT** | retrait `cascade` (src ~200 + tests ~250) + `registry`/`http`(410)/`openapi`/`version` + re-pin h5 (`h5-trace-builder`+`h5-e2e-probe` ~50) + `fleet.ts` + `verify-harness` + publics/skill/README | **≈ 500-600** |

**Projection -5a + -5b ≈ 1100-1300 ⇒ 2 PR (scission IMPOSÉE).** Contrainte 51/123 : **le retrait de `cascade` ne se sépare JAMAIS de son remplaçant réel** ⇒ -5a (producteur) et -5b (remplacement) sont **atomiques ENSEMBLE** au sens de la surface publique : entre -5a et -5b, `cascade` reste servi (4 outils, aucune fenêtre sans chemin servi) ; c'est -5b qui bascule le set (4→4) et retire `cascade` — la couture sépare le CODE, jamais la promesse « même fusion ». Si -5a > 1205 (ré-impl volumineuse), re-scinder « ré-impl+strateOf » / « enveloppe+schema+intégration » (motif U-4b-2 Q-10). **Incertitude déclarée** : le footprint cascade aura bougé après U-4b-2 ⇒ re-mesurer au G1 -5b (le retrait doit inclure `h5-trace-builder.ts`+`h5-e2e-probe.test.ts`, checkpoint U-4b-2 C-12).

---

## §8. ORDRE — après -2b (registre FRAIS)

- U-5 démarre **APRÈS la fusion de U-4b-2 -2b** (registre FRAIS épinglé + `fleet.ts` sur la jambe gate + course -1b close ; MESURES M-11). Sans la classe `liquidation-eligible-coverage` servie et le registre frais, le tuyau `producteur → gate → région` n'a pas de consommateur committé.
- **L'état d'entrée EXACT dépend de Q-U5-0** (M-13) : si -2a a livré `fromRealizedBook` (A-6) dans `packages/monark`, U-5 le RÉUTILISE (ne le recrée pas) ; sinon U-5 le construit. L'orchestrateur fige cet état d'entrée AVANT le G1 de -5a.
- Séquence Ukemi (51/`ADR-M020:47`, amendée 123) : U-2a → U-3 → U-4b(-1a/-1b/-2a/-2b) → **U-5** → (U-5-witness ?) → U-6 → U-7.
- Couture interne : **-5a (producteur) AVANT -5b (remplacement)** — le nouveau chemin producteur existe et est testé AVANT que `cascade` soit retiré (aucune fenêtre sans jambe servie, 51 Q1). La bascule du set (4→4) et la pierre tombale sont dans -5b.
- Chevauchement (122) : -5a (fichiers neufs `apps/harness/src/tools/ukemi-predict.ts`, tests) est disjoint de la course Bell et de U-6 ⇒ parallélisable ; -5b touche les surfaces publiques ⇒ sérialisé, go investisseur (C-10) requis AVANT le commit du remplacement public.

---

## §9. REPLI B pré-déclaré (si producteur infaisable sous K-8) — décision 123

**§2 MESURE que le producteur pur est FAISABLE** ⇒ le repli est peu probable. Pré-déclaré par prudence (décision 123 « Repli pré-déclaré ») : **si** le G0/G1 établit qu'aucun producteur servi pur n'est réalisable (p. ex. une dépendance non-K-8 irréductible apparaît), **alors option B** :
- **3 outils** `{attest, gate, calibrate}` ; `cascade` retiré sans remplaçant.
- Amendements DATÉS : ADR-M005 **D14** (« 4 outils permanents »), **ADR-M007** (set terminal), **ADR-M020:41** (ligne U-2 amendée).
- Bump `HARNESS_VERSION` (`version.ts:7`) dans le commit du tag ; mise à jour MCP Registry + skill = **publication externe ⇒ go investisseur** (C-10).
- **Pierre tombale 410** `replaced_by` (ou, ici, un 410 « removed, no replacement ») pendant une version — **jamais un alias** (entrées incompatibles `FinancialSystem` vs book, `AVIS-architecte:50`, décision 123).
- Conséquence marché : Ukemi n'a plus d'outil propre (`AVIS-architecte:46`) — la classe `gate` reste servie mais sans producteur public (le trou de `AVIS-defi:44-47` rouvre). À porter à l'investisseur.

Bascule vers B (mesurée, à surveiller) : l'oracle d'égalité fait sortir -5a du plafond R-25 même re-scindé (`AVIS-defi:89`), OU une dépendance non-K-8 irréductible.

---

## §10. HORS lot (déclaré ; chacun un item à déclencheur — jamais un « dû » nu)

- **Témoin résiduel oracle/marché** (`ADR-M020 D4:44`, D3 ligne 4 `:33`) : PROPOSÉ hors U-5 (§1), lot propre « U-5-witness » ou fondu dans U-6 — Q-U5-2.
- **U-6 — course LIVE / book complet servi** (`ADR-M020:45` ; TABLEAU `:49` ; décision 119 HORS portée ; go investisseur + go conditionnel pré-enregistré 122) : `sentinel-2 → /ukemi/` servi, `wiring` (c), « c'est ce test qui rend (c) réellement built » ; critère de mort « 0 consommateur SP en 90 j ».
- **U-7 — biblio paginée / rejeu public / papier** *Eligible is not liquidated…* (`ADR-M020:46` ; TABLEAU `:50`).
- **Classe B servie** (`liquidation-realized-given-liquidated`) : hors décision 108 (« servie quand un 3ᵉ épisode existera »).
- **Classe shortfall** `cluster-shortfall-given-oracle-path-24h` (`ADR-M020 D5:49`) : hors 108.
- **Surface VISUELLE du site** (`ukemi-panel.tsx`, `gate-sim/board.tsx`, `integrators/page.tsx`, panneaux) : item **SITE-U5**, décision 101 (backend branché d'abord).
- **`emode_raw` + décodeur ABI ré-déclaré** (si l'auto-suffisance ABI est voulue) : Q-U5-4, item.
- **ŷ par chemin natif (percentDivCeil) toutes branches** : item déjà formé U-4b (`CHANTIERS.md:576`) — le producteur suit la convention floor gelée (C-V-7), pas la bit-fidélité.

---

## §11. QUESTIONS pour l'orchestrateur (choix/écarts NON couverts — le worker ne tranche pas)

- **Q-U5-0 — Frontière `fromRealizedBook` (A-6) : -2a ou -5a ? (BLOQUANTE, MESURES M-13).** Où atterrit le calcul PUR de ŷ, et **A-6 de -2a CALCULE-t-il ŷ ou le REÇOIT-il** ? (DeFi advisor `:70` : « à lever au checkpoint-1 delta » — non résolu à HEAD ; G0 U-4b-2 2a-5/checkpoint §10 le placent en -2a, décision 123 le déplace à U-5.) **Home proposé dans les deux cas : `packages/monark`** (une implémentation). Si -2a le livre, -5a s'effondre au wrapper (§7) ; l'orchestrateur doit CONDITIONNER l'état d'entrée (§8/M-11) et l'estimation R-25 sur la réponse. **Le worker ne tranche pas.**
- **Q-U5-1 — Nom public de l'outil.** `ukemi-predict` (proposé) vs `ukemi-yhat`/`predict-liquidable`. 51 Q2 laisse le nom à l'ADR U-5.
- **Q-U5-2 — Témoin résiduel oracle/marché (item 123(i), périmètre).** Confirmer : SÉPARÉ (« U-5-witness ») / fondu dans U-6 / DEDANS U-5 ? (Proposé : séparé.) Touche la numérotation `ADR-M020 D4` (amendement daté). **Décision de valeur.**
- **Q-U5-3 — `book_digest` dans `features_digest` (Prediction gelée) OU seulement dans `provenance` ?** (Proposé : les deux — `features_digest` lie DANS le contrat, `provenance` pour la lisibilité.)
- **Q-U5-4 — Entrée e-mode : `emode_params` décodé (proposé, K-8 clean) OU `emode_raw` + décodeur ABI ré-déclaré ?** (`AVIS-defi:61` propose `emode_raw` ; la règle gelée prend décodé, M-2.)
- **Q-U5-5 — Granularité : mono-compte (proposé, K-8, `AVIS-defi:75` rejette region-for-account) confirmée ?** Le producteur rend UNE `Prediction` ⇒ tranche mono-compte portée par l'appelant.
- **Q-U5-6 — `reserves[]` : TOUTES les réserves (12,4 KB, PROPOSÉ, sûr) OU élagué ?** Défaut = toutes (marge ×8,67 mesurée) : l'élagage silencieux SOUS-compte ŷ (la règle gelée saute les tokens absents, `u4b-scores.mjs:190`, §2.3) ⇒ élaguer EXIGE la garde fail-closed « token de solde non-nul non porté ⇒ 400 » + mutant + rejeu de l'oracle sur tranches élaguées. **Q-U5-6-bis** : `dust_bounded` dans `provenance` (option) ou omis (proposé — ne touche pas ŷ) ?
- **Q-U5-7 — Compte évaluable SANS franchissement (`yhat=0`) : `Prediction` `yhat:0` servie (proposé) OU refus nommé ?**
- **Q-U5-8 — Durée de la pierre tombale 410, et RELEVÉ des appels externes à `cascade` (item 123(iii)).** À mesurer dans les logs servis Caddy/harness du VPS (propriétaire orchestrateur/investisseur) : si ≈ 0, retrait sans coût (`AVIS-marche:91`) ; sinon 410 durable. **Le worker n'a pas accès aux logs** (lecture seule dépôt) ⇒ demande formée.
- **Q-U5-9 — Pivot D5 (`ADR-M020 D5:49`, item 123(iv)) : « un acteur à précédent de paiement consomme le book attesté ou Y_{i,e} dans un artefact public avant U-4 ».** CONSIGNÉ **NON TIRÉ à ce jour** (aucune pièce trouvée ; `AVIS-marche:32,89` : « demande pour le livre attesté non démontrée sur pièces » ; `AVIS-marche:205-207` demande formée). Conséquence : le producteur se justifie par le **branchement** (combler le trou « aucun producteur public de ŷ »), PAS par un acheteur nommé. Confirmer que U-5 se fait sur ce fondement (branchement/plus-value technique), le pivot D5 restant ouvert.
- **Q-U5-10 — go investisseur C-10** pour la mise à jour skill ClawHub + fiche MCP Registry + README (publication externe, §4.6) : à poser AVANT le commit du remplacement public (-5b).
- **Q-U5-11 — `produced_at` : caller-carried (proposé, K-8, motif `cascade:105`) confirmé ?** (le producteur ne lit pas l'horloge).

---

## §Provenance (règle de branchement — tuyaux déclarés de CE brouillon)
**Entrées lues ce tour (lecture seule, `fichier:ligne` ouverts ; détail MESURES M-0..M-11)** : `docs/CHANTIERS.md` (déc. 47/49/50/51/52/59/108/119/122/**123**/124/125), avis `F:\PRODUITS\etude-2026-09-21\consultation-3-questions\AVIS-{architecte,defi,marche}-*.md`, `docs/G0-lot-u4b-2.DRAFT.md`, `docs/CHECKPOINT1-lot-u4b-2.md`, `docs/adr/ADR-M020-programme-ukemi.md`, `docs/TABLEAU-DE-BORD.md` (§3) ; code : `apps/harness/src/{version.ts,http.ts,openapi.ts,schema-projection.ts,server.ts (tête),tools/{cascade.ts,gate.ts,registry.ts}}`, `apps/harness/test/registry.test.ts`, `packages/monark/src/adapter-book.ts`, `scripts/census/u4b/u4b-scores.mjs`, `apps/sentinel/src/ukemi/{wadray.ts,abi.ts}`, `schemas/prediction.schema.json`, `apps/site/lib/fleet.ts` (extraits), `scripts/verify-harness.mjs` (extraits) ; fixtures MESURÉES (jamais lues en entier) : `apps/sentinel/test/fixtures/ukemi/u4b/{U4b-book-23545087.json (7,5 Mo, structure via node),U4b-scores-e2.jsonl,U4b-oracle-path-e2.jsonl}` ; greps (MESURES M-8/M-9). **Sortie** : ce brouillon + `MESURES.md`, consommés par l'orchestrateur (vérification adversariale R-21), puis worktrees -5a/-5b. **État** : plan (aucun code, aucun réseau, aucun commit). **Réviseur** : orchestrateur `claude-fable-5-1` (R-21). Modèle épinglé `claude-opus-4-8[1m]`, effort max, 2026-09-22.

## §MAST (checklist de risque résiduel — revue de sprint, motif ADR-M020/U-4b-2 C-11)
- **FM-1.1 spécification ambiguë** : « périmètre U-5 » (3 documents divergents) → §1 tranche + Q-U5-2.
- **FM-2.6 dérive raisonnement/action** : copie servie de la règle ŷ ≠ module gelé → oracle d'égalité A+B (§2.2), mutants (a)(c)(d).
- **FM-3.2 vérification incomplète** : producteur « built » mais consommateur = test seul → tuyau `producteur→gate→région` (test 1), re-pin h5 (branchement réel).
- **FM-3.3 vérification incorrecte** : set d'outils exact non re-testé → `registry.test.ts` set `{attest,gate,ukemi-predict,calibrate}` (test 11, mutant k).
- **FM-1.5 condition de fin ignorée** : version de protocole / stale → fail-closed `close_factor_version` (2.4), bloc en sortie (2.5), mutant (e)(h).
- **Dérive de vocabulaire** (« cascade », « Λ=0 », « garantie », probabilité) → `gate:vocab`/`lang:gate` (test 6), grep `no_cascade_in_harness` (test 9).
