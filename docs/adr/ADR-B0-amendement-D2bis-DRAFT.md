# ADR-B0 amendement D2-bis — Registre multi-émetteur (R1) et échelle de qualification Q0-Q5 (T-1a-iv) — BROUILLON

> **BROUILLON rédigé par le worker PLANIFICATEUR-RÉDACTEUR `claude-opus-4-8[1m]` effort max, 2026-09-21 ; PORTÉ par l'orchestrateur** (le worker ne committe pas, ne déclenche aucun workflow — R-20). **Modèle résolu (R-1) : `claude-opus-4-8[1m]`**. À insérer comme **amendement daté d'ADR-B0** (suite de D1..D9 ; calque des amendements datés d'ADR-T1aii D1-bis..D1-sexies). Sortie vérifiée adversarialement (R-21) : chaque `fichier:ligne` ouvert et lu. **Aucun code, aucun contrat gelé, aucun commit par ce brouillon.**

- **Statut** : **PROPOSÉ (amendement G0)** — à passer au checkpoint-1 (validateur `claude-fable-5-1`, instance séparée) AVANT tout code de R1 / T-1a-iv (AgileGates : approbation du PLAN avant le code). Escalades investisseur ouvertes : **doctrine fenêtre courante** (D2-bis.5), **seuils d'admissibilité (b)** (T-1a-iv Q3), **PreStocks** (T-1a-iv Q2), **juriste** (comparaison publique d'émetteurs, décision 79).
- **Dates** : décision 85/86 investisseur 2026-09-20 (`CHANTIERS:253-255`) · brouillon 2026-09-21.
- **Propriétaire de la décision** : investisseur (décision 85 « on pose le plan qui va les inclure, pas les exclure », `CHANTIERS:249` ; scénario (a) « A », `:254` ; méthode « lecture sur place » `:255`). Exécution : orchestrateur `claude-fable-5-1`.
- **Gate concerné** : G0 → G1/G2/G7 + checkpoints 1/2, lots **R1** (registre) et **T-1a-iv** (qualification). Séquencement : R1 **après fusion -b3d-b, avant G0 -b1-bis-ii** ; T-1a-iv **après R1 + -iii-a1 + sonde -b3d** (Q0 lançable dès maintenant, zéro code).
- **Éléments affectés** : `apps/bell/src/pools.ts` (`IssuerRef`+`ISSUERS`, `TokenRef` étendu, `XSTOCKS` alias, `solanaTokens`) ; `supply.ts` (`POR_SOURCES`/`WRAPPERS` dérivés) ; `collect.ts`/`discover.ts`/`rebase-scan.ts`/`rebase-produce.ts`/`rebase-crosscheck.ts` (6 sites d'itération) ; provenance `sources.issuers[]` (non hachée) ; page `/bell/method` (échelle Q0-Q5, T-1b). **Rattache** : ADR-B0 D2 (faits, doctrine fenêtre) / D5 (`gate:vocab`) / D6 (R-8) / D8 (Définition de fini) ; ADR-T1aii D1-quater (`ScaledUiAmount`) / D1-bis (fenêtre par chaîne, décision 44) / item -b1-bis-ii #8 (`quoteDec:6`) / #13 (source émetteur). **error_origin** : n/a (amendement de programme).

## Contexte (mesuré, sourcé)
1. **Registre mono-émetteur codé en dur** : `XSTOCKS` (`pools.ts:90-99`) itéré à **6 sites** `XSTOCKS.filter((t) => wanted.includes(t.symbol))` (mesuré : `collect.ts:588`, `discover.ts:241`, `rebase-scan.ts:230`, `rebase-produce.ts:102`+`:112` sur `main` ; + `rebase-crosscheck.ts:447` dans le worktree -b3d, **fichier neuf -b3d-a**). `TokenRef` (`pools.ts:23-30`) **sans champ émetteur/mécanisme/classe**. Cartes `UNDERLYING` (`collect.ts:275`), `POR_SOURCES` (`supply.ts:93-99`), `WRAPPERS` (`supply.ts:104-106`) par symbole. `quoteDec: 6` **codé en dur** (`collect.ts:521`).
2. **FWDI existe deux fois** (droit sur titre Backpack ; action elle-même Superstate — avis defi §2, `FAITS…:28`) ⇒ indexer par **(émetteur, mint)**, jamais le ticker.
3. **Le pin est fragile mais préservable** : `newResidualCounts()` (`residuals.ts:61-65`) itère `RESIDUAL_CODES` (`:48`) ⇒ objet `counts` **avec toutes les clés** ⇒ entre dans le digest (`collect.ts:241-242`) ⇒ `canonical()` sérialise tout (`digest.ts:23-31`). **Ajouter un code résiduel change le sha ⇒ re-pin.** Un champ **hors digest** (provenance `sources`, `collect.ts:256-262` ; précédent `close_source` testé `collect.test.ts:368`) ne re-pinne pas. La garde du pin est `bell_collector_replays_fixture_bit_identical` (`collect.test.ts:96`, `PINNED_BELL_SHA = 0cfbed20…` `:79`, **identique dans le worktree -b3d** — -b3d ne re-pinne pas).
4. **Mécanisme d'événement commun** : `ScaledUiAmount` partout (`rebase-scan.ts:75` `data[0]===43` ; avis defi §1) ; ce qui change est l'**autorité** (partagée `S7vYFF…` chez xStocks, `ADR-T1aii:226` ; propre au mint ailleurs).
5. **Backpack Q0 non atteint** : la page lue (`FAITS…:30`) **ne donne aucune adresse de mint** ⇒ identité première main non établie ; PR-U-BACKPACK-MINTS maintenu.

## Décision

### D2-bis.1 — Registre multi-émetteur R1, **purement additif, `PINNED_BELL_SHA` inchangé**
`IssuerRef` + `ISSUERS` (**un seul émetteur en R1**, xStocks) ; `TokenRef` gagne `issuerId`, `underlying`, `instrumentClass`, `venueClass`, `enumerationStrategy` (`shared-authority`|`per-mint`|`none-observable`) — **DONNÉES seulement, aucune interface d'adaptateur**. Ancre d'identité = le **mint** : `address` **unique GLOBALEMENT par chaîne** (un mint = un compte on-chain, inémissible par deux entités) ; `symbol` **libre** (FWDI ×2 = deux mints, même ticker) ; `(issuerId, address)` = clé de lookup. `symbol` **reste la clé runtime+digest** en R1 ; re-clé du `symbol` pour une collision de ticker = item R2 groupé. `XSTOCKS` = **alias dérivé** (4 `TokenRef` caractère-pour-caractère). Les **6 sites** → sélecteur `solanaTokens(wanted)` (byte-identique à 1 émetteur). `UNDERLYING`/`POR_SOURCES`/`WRAPPERS` **dérivés à l'octet** (test d'égalité aux littéraux gelés). `quoteDec`/`baseDec` **lus par mint** (`pool.quoteDec`, subsume l'item -b1-bis-ii #8 pour le chemin `collect()` live). `issuer`/`issuers[]` dans **`sources` de la provenance, NON haché**. **Invariant du pin = diff base↔tip = 0** (base = pin de l'arbre de départ post-b3d-b, consignée au PLI — **jamais** « == 0cfbed20 » en dur, car -b3c/-b3d-b peuvent re-pinner d'ici là).

### D2-bis.2 — Séparation dure ÉTAT de qualification ≠ CODE résiduel
L'échelle Q0-Q5 est portée par **`IssuerRef.qualification {rung: 0..5, stop: string|null}`** = **donnée de registre PUBLIÉE et NON hachée** (`stop` = liste fermée d'États d'affichage, HORS `RESIDUAL_CODES`). **Aucun `defaultResiduals: Residual[]` sur `IssuerRef` en R1** (le type fermé `Residual` ne contient pas encore les codes R2 ⇒ typecheck rouge). Les codes de séance (D2-bis.3) sont R2.

### D2-bis.3 — Échelle Q0-Q5 (T-1a-iv) et R2 différé, **UN seul re-pin par soustraction**
| Gate | Artefact | Test non-LLM | Arrêt (État publié) | État public |
|---|---|---|---|---|
| Q0 identité première main | adresses publiées par l'émetteur + sha | relecture lecture-advisor | `identity_unpublished` + procurement | « planned — identity pending » |
| Q1 objet on-chain lu | `TokenRef` candidat (programme, décimales, extensions, autorité) quorum-2 keyless | adresse émetteur == on-chain + mutant | `identity_unconfirmed` | « planned » |
| Q2 prix observable | `discovery-<MINT>.json` : pool quote USD-stable ≥ seuil + règle g_t | calque `bell_founding_registry_equals_discovery_measure` | `price_unobservable`/`no_open_pool_found`/`permissioned_participants`/`no_reference_close_by_construction` | « planned — no observable price » |
| Q3 événement décodable (**R2**) | adaptateur + preuve replay==état (bits) ou « aucun mécanisme » | oracle bit-exact + mutant | `title_event_undecodable` (**code R2**) | « upcoming » |
| Q4 série mesurée | séries pinnées + PROVENANCE | rejeu bit-identique | « série fondatrice non définissable » (D2-bis.5) | « upcoming » |
| Q5 branché et servi | chemin `/bell/` + test d'intégration + cartographie | intégration + cartographie | — | **« built » (seul palier)** |

**R2 (adaptateur d'énumération d'événement + résiduels par classe)** = **différé au premier Q3 réel** (décision 85). Les codes de séance (`no_open_pool_found`, `permissioned_participants`, `transfer_fee_present`, `transfer_hook_unknown`, `mint_paused`, `confidential_amounts`, `corporate_action_offchain_unobservable`, `no_reference_close_by_construction`, `issuer_wind_down_declared`, `per_mint_authority_unscanned`, `multi_pool_fragmented`, `title_event_undecodable`) + la **re-clé éventuelle du `symbol`** du digest ⇒ **UN SEUL re-pin par soustraction**, tous les codes groupés (calque du re-pin par soustraction de `earliest_publish_utc`, `ADR-T1aii:306`, « option (a) déclarée »), avec **sonde indépendante** (`probe-subtraction`, `CHECKPOINT2-lot-t1a-ii-b3b:18`).

### D2-bis.4 — Lot T-1a-iv séparé (qualification Q0→Q2)
Ordre : **Backpack (Q0→Q2), Superstate (étapes 1-2), Remora (statut d'abord), PreStocks (ligne d'offre + `no_reference_close_by_construction`)**. **Méthode décision 86** : chaque Q0 = lecture sur place orchestrateur (navigateur interne puis externe) → FAITS daté → lecteur Sonnet 5 ; **aucun appel RPC/API avant lecture des conditions d'usage** ; **zéro crédit d'abord**, toute dépense Helius **après la sonde -b3d** sur **ledger DÉDIÉ** (AM-1). **Réutilise `enumerateUniverse`** (-iii-a1) — pas de dédoublement. Règle de définition de `g_t` (avis defi) : défini ssi vault USD-stable ∧ MIC de clôture ∧ pas de frais de transfert (ou corrigés) ∧ ni pause ni montants confidentiels ; sinon étiquette ou abstention typée.

### D2-bis.5 — Amendement de la doctrine D2 (fenêtre fondatrice → fenêtre courante par émetteur) — **QUESTION INVESTISSEUR ouverte**
La série fondatrice est calée jul-oct 2025 (`ADR-B0:60`, `pools.ts:50-52`) ; un émetteur né après (Backpack SPCX 2026-06-12) n'a **pas de Q4 par construction**. **Précédent** : ADR-T1aii D1-bis (décision 44) fait déjà « fenêtre par chaîne, pools nés après = depuis le premier fill, borne déclarée par pool ; seule la jambe Solana 2025 comparable à Cong » (`ADR-T1aii:61`). **Options** : (i) fenêtre courante par émetteur (bornes déclarées, non comparable à la fondatrice) ; (ii) exiger jul-oct 2025 (⇒ abstention Q4 permanente pour les émetteurs nés après) ; (iii) hybride (fondatrice pour xStocks + fenêtre courante étiquetée pour les autres). **Recommandation : (iii)**, calquée sur D1-bis. **À trancher par l'investisseur.**

### D2-bis.6 — Neutralité d'affichage + wording (avis marché Q4/Q5)
Ordre **alphabétique**, jamais par magnitude ; **aucun tri** par écart/abstention/résiduel ; **aucun agrégat par émetteur** ; **aucune couleur** ; **aucune phrase causale** ; étiquettes de classe d'instrument + venue ; **FWDI sur deux lignes** ; noms d'émetteurs licites (décision 69) sans affiliation/partenariat/endorsement ; pas de « droit de réponse » éditorial (défense = recalculabilité + errata daté `error_origin`). **Wording licite** : « One method, applied identically to any issuer's token » ; « At release: one issuer measured (xStocks, 4 symbols) » ; « issuer-agnostic by method; single-issuer by coverage today ». **Interdit** : « multi-issuer » au présent avant Q5 d'un second émetteur (décision 85) ; « supports/covers/coming soon » + tiers ; « issuer-neutral benchmark ». `gate:vocab` scope `apps/bell` (D5).

## Tuyaux (M018 D3 — entrée / sortie / état / test) — CA-11 durci : composition EXÉCUTÉE depuis l'artefact
| Tuyau (lot) | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test d'intégration non-LLM |
|---|---|---|---|---|
| `ISSUERS` → sélecteur → 6 sites de `main()` (R1) | `ISSUERS` (données committées `pools.ts`) | `solanaTokens(wanted)` consommé par `collect()`/`discover`/`rebase-scan`/`rebase-produce`×2/`rebase-crosscheck` (upcoming, servis à T-1b) | committé `pools.ts` ; **upcoming** | **`bell_registry_sites_consume_selector_end_to_end`** (composition `runMain` + mutant registre, sur stub ; **ne prétend pas au pin**) ; pin par garde existante `bell_collector_replays_fixture_bit_identical` |
| `ISSUERS` → cartes dérivées → digest (R1) | `ISSUERS`/`TokenRef` | `UNDERLYING`/`POR_SOURCES`/`WRAPPERS` → `collect()` → digest | committé ; **upcoming** | **`bell_registry_derived_maps_equal_frozen_literals`** (5 symboles) |
| `ISSUERS` → provenance (R1) | `issuerId`/`legalEntity` | `sources.issuers[]` (NON haché) → `/bell/*.json` (T-1b) | provenance ; **upcoming** | **`bell_provenance_carries_issuer_unhashed`** (absent du digest) |
| lecture sur place → identité → échelle (T-1a-iv) | pages émetteur (orchestrateur) + PR-U-\* + `enumerateUniverse` | `IssuerRef.qualification {rung, stop}` par émetteur | donnée non hachée ; **upcoming** | **`bell_issuer_qualification_state_is_unhashed`** ; `bell_universe_enumerates_from_issuer_list_and_onchain` (2ᵉ liste) |
| échelle Q0-Q5 → page plan (T-1b) | `IssuerRef.qualification` | `/bell/method` affiche l'état par émetteur | **item à déclencheur** (T-1b) | (assemblé T-1b) |
| trois conditions (b) → décision (avant G0 T-1b) | Q0+Q1+Q2 Backpack + recoupement -iii-a | décision investisseur bascule (b) | **item à déclencheur** | (décision hors code) |
| adaptateur d'événement + résiduels par classe (**R2**) | premier Q3 réel | codes de séance + re-clé `symbol` | **item à déclencheur (Q3)** | oracle bit-exact + re-pin par soustraction unique |

## Alternatives rejetées
- **Adaptateur d'événement de titre dès maintenant (R2 en R1)** : abstraction prématurée ⇒ R1 = données seulement, R2 déclenché par un Q3 réel (décision 85). Rejeté.
- **Étendre le lot -iii pour ajouter un émetteur** : -iii mesure/classe l'univers xStocks, ne qualifie pas un émetteur ⇒ **T-1a-iv séparé** (avis architecture §6). Rejeté.
- **`defaultResiduals: Residual[]` sur `IssuerRef` en R1** : le type fermé n'a pas les codes R2 ⇒ typecheck rouge ; et publier ces codes re-pinnerait avant le release. Rejeté (R2).
- **Codes de qualification dans `RESIDUAL_CODES`** : re-pin AVANT le release (contredit « R2 différé ») ⇒ `qualification` non hachée. Rejeté.
- **Re-clé du `symbol` du digest en R1** : casse le pin ⇒ groupé dans le re-pin unique de R2. Rejeté (R1).
- **Release (c) — attendre tous les émetteurs** : PreStocks n'atteint jamais Q4 ⇒ non borné (avis marché Q2). Rejeté ; scénario (a) retenu (décision 85).
- **Substituer le flux Pyth pour Superstate** : Pyth est le sous-jacent, pas le token (avis defi §Superstate). Rejeté.

## Conséquences
- **Positives** : registre extensible par (émetteur, mint) sans dette ; plan public honnête « qui inclut, pas exclut » (décision 85) ; `PINNED_BELL_SHA` inchangé au release ; un **seul** re-pin futur (R2, groupé) ; neutralité d'affichage opposable.
- **Négatives (assumées)** : Backpack Q0 non atteint aujourd'hui (adresse non publiée) ⇒ bascule (b) conditionnelle ; Superstate défini en droit mais **vide en fait** (0 pool) ; Remora [2nd] non corroboré ; PreStocks indéfini par construction ; les lectures on-chain de l'avis defi sont **[lu, mono-op]/[2nd]** à rejouer quorum-2 ; doctrine fenêtre courante ouverte (question investisseur).
- **Items formés (déclencheur + propriétaire ; zéro dette nue)** :
  | # | Item | Déclencheur | Propriétaire |
  |---|---|---|---|
  | 1 | **R1 registre** (D2-bis.1) — types + `ISSUERS` + alias + dérivations + 6 sites + pin inchangé | après fusion -b3d-b, avant G0 -b1-bis-ii | orchestrateur → worker |
  | 2 | **T-1a-iv qualification Q0→Q2** (D2-bis.3/4) | après R1 + -iii-a1 + sonde -b3d ; Q0 lançable maintenant | orchestrateur → worker + lecteur |
  | 3 | **R2 adaptateur + résiduels par classe + re-clé `symbol`** — **UN seul re-pin par soustraction** | **premier Q3 réel** d'un second émetteur | orchestrateur → worker |
  | 4 | **Doctrine fenêtre courante** (D2-bis.5) — trancher (i)/(ii)/(iii), amende D2 | checkpoint-1 T-1a-iv | **INVESTISSEUR** |
  | 5 | **Seuils d'admissibilité (b)** pré-enregistrés (solde vault, 30 j, liquidité comparable) | avant toute donnée Backpack | **INVESTISSEUR** → orchestrateur |
  | 6 | **PreStocks** — confirmer « ligne d'offre + `no_reference_close_by_construction` », jamais un écart | checkpoint-1 T-1a-iv | **INVESTISSEUR** |
  | 7 | **Juriste** (décision 79) — comparaison publique d'émetteurs nommés + canal de signalement | avant mise en ligne page plan (T-1b) | **INVESTISSEUR** → juriste |
  | 8 | **Recoupement sous-jacent (condition 3 de (b))** — MU ∈ univers xStocks élargi ? | phase A de T-1a-iii | orchestrateur → worker |
  | 9 | **Rejeu quorum-2 des lectures mono-op de l'avis defi** (FWDI/GLXY/TSLAr) | après PR-U-SOLANA-PUBLIC-RPC/RAYDIUM | orchestrateur → worker |
  | 10 | **item -b1-bis-ii #8** (`quoteDec:6`→pool) subsumé par R1 (chemin `collect()` live) | R1 | orchestrateur (consigner CLOS) |
  | 11 | **source ÉMETTEUR dans `pools.ts`** (item -b1-bis-ii #13) — inscrire au fil du registre R1 | R1 (marge R-25) | orchestrateur → worker |

## Sources
- **[lu, dépôt]** `pools.ts:23-30,40-42,55,56,90-99` ; `collect.ts:225,241-242,256-262,275,418,521,536,576-577,588` ; `supply.ts:66-68,93-99,104-106,181-184` ; `residuals.ts:48,61-65` ; `digest.ts:23-31,33,38,95-101` ; `rebase-scan.ts:75,230` ; `rebase-trajectory.ts:48-53` ; `rebase-produce.ts:95-96,102,112` ; `discover.ts:241` ; `collect.test.ts:79,96,368` ; worktree -b3d `collect.ts:297,444-447,624` + `rebase-crosscheck.ts:447` (tip `0dd13ca`) ; `ADR-B0:60` ; `ADR-T1aii:61,226,306,359,364` ; `CARTOGRAPHIE…passe2:114-124,159`.
- **[lu, première main, orchestrateur navigateur]** `FAITS-navigateur-2026-09-20.md` (Sunrise=Wormhole Labs ; Backpack SPCX/MU/SNDK/BOT/DRAM ; aucune adresse de mint ; Superstate allowlist + 5 actions ; PreStocks SPV/pas de clôture ; Remora cert invalide).
- **[conseil, re-vérifié]** avis Fable architecture/defi/marché (2026-09-20) — défauts corrigés : `rebase-crosscheck.ts:412`→**`:447`** ; « RESIDUAL_CODES haché `residuals.ts:61-65` » = **`newResidualCounts()`** (mécanisme juste, étiquette imprécise ; `RESIDUAL_CODES` est `:48`) ; échelle Q0-Q5 confond État de qualification et code résiduel.
- **[lu, mono-op / 2nd — à rejouer quorum-2]** lectures on-chain de l'avis defi (FWDI Backpack, GLXY Superstate, TSLAr Remora).
- **Décisions** : `CHANTIERS:228` (80), `:240-241` (81-82), `:244-245` (amend. 82), `:248-251` (83-84), `:253-255` (85-86).
