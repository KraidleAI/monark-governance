# G0 — Sprint backlog lot R1 « registre multi-émetteur » (Bell) : refonte ADDITIVE des données de registre (IssuerRef + ISSUERS, TokenRef étendu, clé (émetteur, mint)), `PINNED_BELL_SHA` INCHANGÉ, aucun second émetteur ajouté

Rédaction worker PLANIFICATEUR-RÉDACTEUR `claude-opus-4-8[1m]` effort max, 2026-09-21. **Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, non banni, effort max — vérifiable par l'orchestrateur). **R-20** : le worker ne committe pas, ne déclenche aucun workflow (l'orchestrateur porte). **R-21** : sortie vérifiée adversarialement — chaque `fichier:ligne` a été **OUVERT ET LU** dans `F:\Monark` (et `F:\Monark-wt-bellb3d` pour le worktree -b3d) ; les avis Fable du 2026-09-20 sont des **conseils, PAS des faits** (chaque citation d'avis re-vérifiée sur pièce ; défauts trouvés listés §12). **AUCUN appel réseau/RPC/API** ; aucune clé/URL ; aucun close ni prix en clair. Ce G0 est un **PLAN** : aucun code écrit, aucun contrat gelé, aucun commit.

**Cadre (décisions investisseur, `docs/CHANTIERS.md`)** : **décision 85** (`CHANTIERS:254`, verbatim « A ») — release = 4 xStocks **+ registre multi-émetteur R1** (après fusion -b3d-b, **avant** G0 -b1-bis-ii, **`PINNED_BELL_SHA` inchangé**) + plan public Q0-Q5 ; R2 (adaptateur) **différé au premier Q3 réel** ; wording jamais « multi-issuer » au présent avant Q5 d'un second émetteur. **Décision 80** (`CHANTIERS:228`) : tout symbole ajouté est mesuré et publié pour tous (biais de sélection déclaré) — R1 **n'ajoute aucun symbole**. **Décision 68** : toute DONNÉE de première main ; un article ne fournit qu'une MÉTHODE. **CA-11 durci** : un tuyau n'est « branché » que si un test d'intégration non-LLM EXÉCUTE la composition depuis l'artefact.

**Origine du plan** : trois avis Fable `claude-fable-5-1` (2026-09-20, `F:\PRODUITS\etude-2026-09-20\univers-bell\`) — architecture (R1 additif ≈ 330-375 l. sans re-pin [abs], R2 différé, échelle Q0-Q5, lot T-1a-iv séparé), defi (mécanique : `ScaledUiAmount` commun, clé (émetteur, mint) car FWDI existe deux fois), marché (valeur de position, neutralité d'affichage). **Les avis sont conseils** ; ce G0 corrige leurs défauts de faits (§12).

**Rattachement** : ADR-B0 (D2 faits i-iv ; D5 mutants/`gate:vocab` scope `apps/bell` ; D6 sources/coûts R-8 ; ESC-1 c close jamais republié) ; ADR-T1aii (D1-quater rebase `ScaledUiAmount` autorité partagée `S7vYFF…` ; **item registre -b1-bis-ii #8 « `quoteDec: 6` en dur → lire du `founding_pool` »**, `ADR-T1aii:359` ; **item #13 « source ÉMETTEUR dans `pools.ts` »**, `ADR-T1aii:364`) ; brouillon **ADR-B0 amendement D2-bis** (fichier séparé, porté par l'orchestrateur). Code : `apps/bell/src/pools.ts`, `collect.ts`, `supply.ts`, `discover.ts`, `rebase-scan.ts`, `rebase-produce.ts`, `residuals.ts`, `digest.ts` (tous lus).

> **PLI checkpoint-1 (worker RÉDACTEUR `claude-opus-4-8[1m]` effort max, 2026-09-21).** Le validateur `claude-fable-5-1` (2026-09-20 23:41→23:53 UTC, artefact `f5996a0`, sha256 `a767e9060e9a88537c4dfc9ebdfee36e31e94e747acf222703c56a6da1b9abfa` recalculé conforme, byte-identique au HEAD `2ca72e7`) a rendu **ACCEPTE-AVEC-CORRECTIONS** : bloquantes **B-R1-1..6**, non bloquantes **NB-R1-1..8** pliées en place (marqueurs `[cp1 …]`), table de traçabilité en fin de fichier. **Aucun code avant B-R1-1..6.** Chaque `fichier:ligne` **ré-ouvert et lu** (`F:\Monark` + `F:\Monark-wt-bellb3d`) ; la **liste R2 qui fait foi et le plan d'opérateurs vivent dans l'ADR D2-bis** (ce G0 y renvoie).

---

## 0. Objectif (une phrase)

Refondre les **DONNÉES de registre** de Bell d'un modèle mono-émetteur codé en dur (`XSTOCKS`) vers un modèle **multi-émetteur indexé par (émetteur, mint)** — `IssuerRef` + `ISSUERS`, `TokenRef` étendu, cartes `UNDERLYING`/`POR_SOURCES`/`WRAPPERS` **dérivées**, `quoteDec`/`baseDec` lus par mint (fail-closed) — **de façon purement additive**, avec **`PINNED_BELL_SHA` inchangé PAR R1 prouvé (chemin live inclus)**, **aucun second émetteur MESURÉ/servi ajouté** (**[cp1 B-R1-1]** Ondo/TSLAon, déjà présent dans les cartes, est structuré en `IssuerRef` rung-0 hors périmètre — §1.2), **aucune interface d'adaptateur** (R2 différé au premier Q3 réel), pour que la course fondatrice -b1-bis-ii et le lot de qualification T-1a-iv écrivent leurs séries avec `issuer` dès l'origine.

## 1. Périmètre et NON-périmètre

### 1.1 DANS le périmètre (données seulement)
| # | Élément | Détail (fichier:ligne mesuré) |
|---|---|---|
| P-a | **`IssuerRef` + `ISSUERS`** | nouveau type + constante. **[cp1 B-R1-1 — « UN seul émetteur » corrigé].** `ISSUERS = [xStocks, ondo]` = **DEUX entrées de registre, UN SEUL émetteur MESURÉ/servi au release** (xStocks = Backed Assets (JE) Ltd, 4 symboles Solana ; identité première main `pools.ts:88` + `docs/biblio/bell/L-lecture-xstocks-mints-emetteur-2026-09-20.md`). **Ondo** (`ONDO`/TSLAon, ERC-20, `pools.ts:105-108`) est inscrit comme `IssuerRef` avec `qualification { rung: 0, stop: <code fermé> }`, **libellé = verbatim décision 81** (« univers Ondo non établi de première main », hors périmètre release) — motif : `UNDERLYING`/`POR_SOURCES`/`WRAPPERS` portent DÉJÀ TSLAon (`collect.ts:275`, `supply.ts:98,105`), donc « un seul émetteur » était faux. Champs : `issuerId`, `legalEntity`, `identitySource`, `defaultInstrumentClass`, `defaultVenueClass`, `tokens` (réf.), `qualification {rung: 0..5, stop: QualificationStop \| null}` **[cp1 NB-R1-7 : `stop` = type FERMÉ, disjoint de `RESIDUAL_CODES`] (donnée publiée, NON hachée — §2.4)**. |
| P-b | **`TokenRef` étendu** | `TokenRef` (`pools.ts:23-30`) gagne `issuerId`, `underlying`, `instrumentClass`, `venueClass`, `enumerationStrategy` (`"shared-authority" \| "per-mint" \| "none-observable"`). **DONNÉES seulement** : `enumerationStrategy` ANNOTE comment un futur scan R2 énumérerait les événements de titre — **aucune interface d'adaptateur, aucun code de scan** (xStocks = `"shared-authority"`, autorité `S7vYFF…`, `ADR-T1aii:226`). |
| P-c | **Clé (émetteur, mint) ; unicité sur le MINT** | l'ancre d'identité est le **mint** — un compte, une chaîne d'autorité, **inémissible par deux entités** ⇒ `address` **unique GLOBALEMENT par chaîne**. **[cp1 NB-R1-1]** la clé d'unicité est **(chaîne, adresse NORMALISÉE)** — hex EVM insensible à la casse (`toLowerCase` : TSLAon `0xf6b1…` `pools.ts:106`), base58 Solana sensible à la casse ; + **intégrité référentielle** `TokenRef.issuerId ∈ ISSUERS` (mutant : orphelin ⇒ rouge). `symbol` **libre** (FWDI existe deux fois = **DEUX mints différents**, même ticker — **[cp1 NB-R1-3]** `FWDtiB5…` **Backpack [lu, mono-op — adresse 2nd via Solana Compass]** ; **FWDI Superstate [lu, FAITS]** (`FAITS…:8`, mint non publié) — « deux mints distincts » = inférence assumée, à rejouer quorum-2). `(issuerId, address)` = **clé de LOOKUP**, pas l'invariant. Invariant + mutant (§5). **`symbol` reste la clé RUNTIME et DIGEST en R1** (§2.6) — la re-clé du `symbol` pour une collision de ticker est un item R2 groupé. |
| P-d | **`XSTOCKS` alias dérivé** | `XSTOCKS` (`pools.ts:90-99`) devient un **alias dérivé** = les `TokenRef` de l'émetteur xStocks. **[cp1 B-R1-6]** l'alias est une **PROJECTION sur les SIX champs d'avant R1** (`symbol`, `chain`, `address`, `decimals`, `standard`, `source` — `pools.ts:23-30`), **ordre préservé** — **PAS « caractère-pour-caractère »** (le `TokenRef` étendu gagne 5 champs `issuerId`/`underlying`/`instrumentClass`/`venueClass`/`enumerationStrategy` ⇒ l'objet n'est plus identique ; seule la projection l'est). Load-bearing : l'oracle -iii-a1 `bell_universe_founding_mints_appear_and_satisfy_c1_c6` lit `XSTOCKS`/`pools.ts:90-99` (mêmes adresses, `decimals: 8`). |
| P-e | **Remplacement des sites d'itération** | les **6** sites `XSTOCKS.filter((t) => wanted.includes(t.symbol))` (liste exacte §2.3) → un sélecteur `solanaTokens(wanted)` sur l'ensemble multi-émetteur. En R1 (1 émetteur), `solanaTokens` rend exactement les 4 xStocks ⇒ comportement byte-identique. |
| P-f | **`UNDERLYING`/`POR_SOURCES`/`WRAPPERS` dérivés** | dérivés de `ISSUERS`/`TokenRef` **à l'OCTET près** : ils entrent dans le digest (`collect.ts:241-242` : `por`/`wrapper` dans `buildDigest` ; `UNDERLYING` via jointure halt `collect.ts:225`). Test d'égalité aux littéraux gelés (§5, garde le pin). |
| P-g | **`quoteDec`/`baseDec` lus par mint** | `buildSolanaSymbol` `collect.ts:521` code `quoteDec: 6` **en dur** ⇒ lire `pool.quoteDec`. **[cp1 B-R1-4]** `PoolRef.quoteDec` est **OPTIONNEL** (`pools.ts:55` `readonly quoteDec?: number`) ⇒ **FAIL-CLOSED sur `undefined` (JAMAIS `?? 6`)** : un pool sans `quoteDec` abstient/rougit, jamais un 6 par défaut (qui mal-échelonnerait le VWAP de 10^Δ) ; **test + mutant** (`quoteDec` retiré d'un pool ⇒ rouge). = 6 pour les 4 pools actuels ⇒ byte-identique. Subsume l'**item -b1-bis-ii #8** (`ADR-T1aii:359`) pour le chemin `collect()` live. `baseDec` = `tok.decimals` déjà lu par mint. |
| P-h | **`issuer` dans l'enveloppe de provenance NON hachée** | `issuer`/`issuers[]` voyage dans `sources` de la provenance (`collect.ts:256-262`, calque `close_source`/`cash_request_digest`), **jamais dans le digest haché** ⇒ pin inchangé. Précédent testé : `bell_close_source_named_in_provenance` (`collect.test.ts:368`). |

### 1.2 NON-périmètre (ce que R1 NE fait PAS)
- **N'ajoute AUCUN second émetteur MESURÉ/servi.** **[cp1 B-R1-1 — reformulé pour cohérence]** `ISSUERS = [xStocks, ondo]` **structure** une réalité PRÉ-EXISTANTE : TSLAon (Ondo) était **déjà** dans `UNDERLYING`/`POR_SOURCES`/`WRAPPERS` (`collect.ts:275`, `supply.ts:98,105`) avant R1. Ondo entre comme **`IssuerRef` rung-0, `tokens:[TSLAon]`, hors périmètre release** (décision 81) — **aucun symbole Ondo n'est mesuré/servi, aucun ajouté** (le pin ne bouge pas : `issuerId`/`qualification` non hachés ; les entrées TSLAon des cartes sont inchangées). Backpack/Superstate/Remora/PreStocks = **T-1a-iv** (fichier séparé), entrées `IssuerRef` à `tokens:[]`.
- **N'ajoute AUCUN nouveau code résiduel** ⇒ **aucun re-pin** (les codes nommés par l'avis defi — `no_open_pool_found`, `transfer_fee_present`, etc. — appartiennent à **R2**, un seul re-pin groupé, §2.4 + §9 Q-R2).
- **Aucune interface d'adaptateur d'événement de titre** (R2, différé au **premier Q3 réel**, décision 85).
- **Aucune g_t**, aucun close, aucun scan, aucun appel réseau (plan de refonte de données).
- **Ne re-clave PAS le `symbol` du digest** (item R2 pour une vraie collision FWDI, §2.6).
- **Ne publie rien** : Bell reste **`upcoming`** partout (aucun chemin servi ajouté ; §6).
- **[cp1 NB-R1-6]** le **défaut CLI en dur `"TSLAx"`** (`collect.ts:418` `argOf(argv, "--pools") ?? "TSLAx"`) est **HORS périmètre R1** (chaîne littérale d'un défaut opérateur, pas une donnée de registre) — laissé tel quel, mais **item formé à déclencheur** (déclencheur : G0 T-1b, où `--pools` devient explicite pour la course servie ; propriétaire orchestrateur) ; à ne pas confondre avec les 6 sites d'itération `XSTOCKS.filter` (§2.3).

## 2. Conception (données seulement)

### 2.1 `IssuerRef` + `ISSUERS`
Nouveau dans `pools.ts` (avant `XSTOCKS`). Un `IssuerRef` porte l'identité première main + la qualification publiée. En R1, `ISSUERS = [xStocks]`. La `qualification {rung, stop}` (§2.4) est **donnée de registre publiée** (page plan/méthode), **NON hachée** — elle ne passe **jamais** par `RESIDUAL_CODES` ni par le digest.

### 2.2 `TokenRef` étendu — champs DONNÉES
`issuerId` (⇒ `ISSUERS`), `underlying` (sous-jacent NMS), `instrumentClass`, `venueClass`, `enumerationStrategy`. Ces champs **ne sont pas sérialisés dans le digest** (vérifié : le digest ne porte que `gaps`/`volume`/`supply`/`por`/`wrapper`/`halt_census`/`residuals`, `digest.ts:95-101` + `collect.ts:241-242` ; `supplyEntries` vient du **readout runtime**, pas du `TokenRef`) ⇒ leur ajout **ne touche pas le pin**. `decimals` (load-bearing via `baseDec`) et l'ordre des 4 tokens sont **inchangés**.

### 2.3 Sites d'itération à remplacer — LISTE EXACTE (à re-mesurer dans l'arbre de départ post-b3d-b)
Mesuré `grep -n "XSTOCKS.filter" apps/bell/src` sur `F:\Monark` (main) ET `F:\Monark-wt-bellb3d` (worktree -b3d, tip `0dd13ca`) :

| Fichier | Site sur `main` (mesuré) | Site dans le worktree -b3d (mesuré) | Note |
|---|---|---|---|
| `collect.ts` | `:588` | `:624` | -b3d réécrit collect.ts (+50/−20) ⇒ décalé |
| `discover.ts` | `:241` | `:241` | **non touché par -b3d** ⇒ inchangé |
| `rebase-scan.ts` | `:230` | `:239` | -b3d +31 ⇒ décalé |
| `rebase-produce.ts` (site 1, branche `no_quorum`) | `:102` | `:108` | -b3d +10 (exporte `normalizeBody`) ⇒ décalé |
| `rebase-produce.ts` (site 2, boucle) | `:112` | `:118` | idem |
| `rebase-crosscheck.ts` | **absent** (fichier neuf -b3d-a) | **`:447`** | **PAS `:412`** (défaut de l'avis architecture, §12) |

**6 sites** post-fusion. **Le worker RE-MESURE les lignes dans son arbre de départ** (post-b3d-b) : elles bougent encore (le seam -b3d-b ajoute L-1 prod + L-5, `G0-b3d:83,196`). **Ne JAMAIS prendre les numéros d'un avis** (l'avis architecture cite `rebase-crosscheck.ts:412` — FAUX, réel `:447` dans le worktree ; ses numéros main seront périmés). Les 5 imports `import { XSTOCKS }` (`collect.ts:15`, `discover.ts:18`, `rebase-produce.ts:29`, `rebase-scan.ts:22`, `rebase-crosscheck.ts:33` worktree) restent valides (alias dérivé) ou pointent le sélecteur.

### 2.4 Séparation dure : ÉTAT de qualification ≠ CODE résiduel (empêche un re-pin avant le release)
**Constat mesuré** : `newResidualCounts()` (`residuals.ts:61-65`) itère `RESIDUAL_CODES` (`residuals.ts:48`) et produit l'objet `counts` **avec toutes les clés** ; `counts` entre dans le digest (`collect.ts:241-242`, `residuals: counts`) ; `canonical()` (`digest.ts:23-31`) sérialise **toutes** les clés (y compris à 0). **⇒ ajouter un code à `RESIDUAL_CODES` change le sha ⇒ re-pin.** Le release (scénario a) publie « le plan Q0-Q5 avec l'état de chaque émetteur » — si les libellés d'arrêt (`identity_unpublished`, `no_reference_close_by_construction`, …) entraient dans `RESIDUAL_CODES`, cela **re-pinnerait AVANT le release**, contredisant « R2 différé au premier Q3 réel ».
- **DONC** : l'échelle Q0-Q5 est portée par `IssuerRef.qualification {rung, stop}` = **donnée de registre non hachée**, publiée par la page plan/méthode. Le `stop` est une chaîne d'affichage (liste fermée d'États hors `RESIDUAL_CODES`).
- Les codes résiduels **de séance** = **R2**, un **seul re-pin groupé** (au premier Q3 réel), **JAMAIS en R1**. **[cp1 NB-R1-8]** la **liste R2 qui fait foi vit dans l'ADR D2-bis.3** (13 codes, `price_unobservable` inclus) — ce G0 n'en re-liste plus (les trois artefacts divergeaient 11/11/12). **⚠ collision `CLOSE_KEY` mesurée** : `no_reference_close_by_construction` matche `CLOSE_KEY` (`digest.ts:33`, via « reference ») ⇒ comme CLÉ de compteur il rougirait `assertNoClose` (`bell_residual_counter_passes_close_guard`, `collect.test.ts:562-572`) ⇒ **renommé à l'implémentation R2** (règle de migration, ADR D2-bis.2/.3). Comme VALEUR de `qualification.stop` (non hachée) il passe.
- **Corollaire** : **PAS de `defaultResiduals: Residual[]` sur `IssuerRef` en R1** — le type fermé `Residual` (`residuals.ts:49`) ne contient pas encore les codes R2 ⇒ typecheck rouge. (L'avis defi propose `defaultResiduals[]` : à différer à R2.)

### 2.5 Cartes dérivées à l'octet
`UNDERLYING` (`collect.ts:275`), `POR_SOURCES` (`supply.ts:93-99`), `WRAPPERS` (`supply.ts:104-106`) dérivées de `ISSUERS`/`TokenRef`. Comme `porEntries`/`wrapperEntries` entrent dans le digest (`collect.ts:241-242`) et `UNDERLYING` alimente la jointure halt (`collect.ts:225`, compteurs hachés) + `advVolumes` (`collect.ts:520`), la dérivation doit produire des structures **`canonical()`-égales aux littéraux actuels** (**5 symboles, TSLAon compris**). **[cp1 B-R1-1]** cohérence garantie par construction : TSLAon appartient à l'`IssuerRef` `ondo` (P-a), donc dériver depuis `ISSUERS = [xStocks, ondo]` reproduit exactement les 5 clés des littéraux `POR_SOURCES`/`WRAPPERS`/`UNDERLYING` (dont `TSLAon`). Garanti par test (§5, `bell_registry_derived_maps_equal_frozen_literals`).

### 2.6 `symbol` reste la clé runtime + digest
Tout le code est indexé par `symbol` (`wanted`, `POOLS.find` `collect.ts:589`, `trajectories[tok.symbol]` `:593`, tri du digest `digest.ts:96-97`). « (émetteur, mint), jamais le ticker » se matérialise en R1 comme **invariant d'unicité du registre** `(issuerId, address)` + `identitySource` (mutant agrégateur-seul), **pas** comme une re-clé du champ `symbol` du digest. La re-clé du `symbol` pour une vraie collision FWDI (deux émetteurs, même ticker) = **item R2 nommé**, groupé dans le re-pin unique de R2 (§9 Q-R2).

## 3. Séquencement — de quelle branche partir, quels conflits attendre

**Chaîne mesurée** : `lot/etude-suite` (tip `c7974ca`, décision 85/86) → **merge -b3d-a** (worktree `lot/t-1a-ii-b3d` tip `0dd13ca`, tout est -b3d-**a** ; -b3d-b **pas encore fait**) → **-b3d-b** (L-1 prod + L-5, seam attendu `G0-b3d:83,196`) → **merge -b3d-b** → **[R1 branche ICI]** → **G0 -b1-bis-ii**.
- **Partir de** : le tip de `lot/etude-suite` **après la fusion `--no-ff` du DERNIER sous-lot -b3d** (-b3d-b si le seam tire). **[cp1 B-R1-5 — Q1 RETIRÉE].** La dépendance de R1 n'est PAS seulement « `rebase-crosscheck.ts` (6ᵉ site) + `--max-credits`/`normalizeBody` » (= -b3d-a) : **-b3d-b porte L-5 qui touche `supply.ts`** (fermeture du résiduel `set_authority_unscanned`, `G0-b3d:80,182` « supply.ts fermeture résiduel … → -b3d-b ») — or **R1 RÉÉCRIT `supply.ts`** (`POR_SOURCES`/`WRAPPERS` dérivés). Si R1 partait après -b3d-a seulement, la fusion de -b3d-b entrerait en **conflit réel sur `supply.ts`**. Donc R1 part **après le dernier sous-lot -b3d**, inconditionnellement (la Q1 « -b3d-a suffit » du §9 est **RETIRÉE**). Nom de branche R1 proposé : `lot/t-1a-r1`.
- **Conflits de merge** : **ZÉRO** (R1 branche APRÈS la fusion de -b3d-b — l'avis architecture le dit, vérifié : les 6 sites vivent alors dans le même arbre). **MAIS** : les 4 sites de `main` sont **DÉPLACÉS** par -b3d (mesuré : `collect.ts` +50/−20, `rebase-scan.ts` +31, `rebase-produce.ts` +10, `rebase-crosscheck.ts` neuf) ⇒ **re-mesure obligatoire** (§2.3).
- **Conflits avec des lots EN VOL** (à nommer, pas à ignorer) :
  1. **-iii-a1** (T-1a-iii Phase A1, fichiers neufs `universe.ts`) : son oracle de calibration `bell_universe_founding_mints_appear_and_satisfy_c1_c6` lit `XSTOCKS`/`pools.ts:90-99` ⇒ l'**alias `XSTOCKS` de R1 est load-bearing** (préserver les 4 `TokenRef` caractère-pour-caractère). Coordonner l'ordre R1↔-iii-a1 (voir Q3).
  2. **-b3c** (corporate actions non-rebase + Ondo) : s'il touche `supply.ts`/`POR_SOURCES` **ou** ajoute le résiduel `por_daily_report_aggregate` (`CARTOGRAPHIE…passe2:159`) ⇒ **conflit réel** sur `supply.ts`/`residuals.ts` + **changement de pin**. D'où l'invariant du pin formulé en **diff base↔tip** (§5), jamais « == 0cfbed20 » en dur.
  3. **-b1-bis-ii** vient APRÈS R1 ; son item #8 (`quoteDec:6` → `founding_pool`, `ADR-T1aii:359`) chevauche P-g ⇒ R1 **subsume** #8 pour le chemin `collect()` live (à consigner dans l'ADR D2-bis, item CLOS).

## 4. Livrables, tuyaux, tests non-LLM, mutants

### 4.1 Livrables (liste fermée ; CA-11 durci)
| # | Fichier | Contenu | Test / oracle (nommé) |
|---|---|---|---|
| L-1 | `apps/bell/src/pools.ts` | `IssuerRef` + `ISSUERS` (1 émetteur) ; `TokenRef` étendu (5 champs données) ; `XSTOCKS` = alias dérivé ; sélecteur `solanaTokens(wanted)` ; `quoteDec` lu du pool | `bell_registry_unique_mint_address` ; `bell_xstocks_alias_equals_frozen_tokens` (4 `TokenRef` caractère-pour-caractère) ; `bell_registry_aggregator_identity_unconfirmed` |
| L-2 | `apps/bell/src/supply.ts` | `POR_SOURCES`/`WRAPPERS` **dérivés** de `ISSUERS` | `bell_registry_derived_maps_equal_frozen_literals` (POR/WRAPPERS/UNDERLYING `canonical()`-égaux aux littéraux gelés, 5 symboles) |
| L-3 | `apps/bell/src/collect.ts` (+ discover/rebase-scan/rebase-produce/rebase-crosscheck) | `UNDERLYING` dérivé ; **6 sites d'itération** → `solanaTokens(wanted)` ; `issuer`/`issuers[]` dans `sources` de la provenance (non haché) ; `quoteDec` du pool (fail-closed) | **[cp1 B-R1-3]** `bell_registry_sites_consume_selector_end_to_end` = **rejeu PAR MODE** (5 modes / 6 scénarios de stub, §4.2) ; **[cp1 B-R1-2]** `bell_registry_pin_unchanged_end_to_end` (pin sur le CHEMIN LIVE `runMain`, diff base↔tip=0) ; `bell_provenance_carries_issuer_unhashed` (issuer en provenance, absent du digest) ; garde existante `bell_collector_replays_fixture_bit_identical` (pin cœur pur) **inchangée** |
| L-4 | `apps/bell/test/*.test.ts` | tests + mutants nommés (§5) | (les tests ci-dessus) |
| L-5 | `apps/bell/**` + `docs/PLI-lot-t1a-r1.md` + prereg | PLI (R-25 par livrable mesuré `STAT=`, sha, invariant du pin, table des tuyaux) | ADR/PLI = docs |

### 4.2 Tuyaux (ADR-M018 D3 — entrée / sortie / état / test) — règle de Branchement
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| `ISSUERS` → sélecteur → sites d'itération | `ISSUERS` (données committées) | `solanaTokens(wanted)` consommé par les **6 sites de `main()`** (`collect.ts`/`discover.ts`/`rebase-scan.ts`/`rebase-produce.ts`×2/`rebase-crosscheck.ts` ; upcoming, servis à T-1b) | **upcoming** | `bell_registry_sites_consume_selector_end_to_end` (composition `runMain --pools TSLAx,SPYx` exécutée ; mutant : token retiré de `ISSUERS` ⇒ rouge) |
| `ISSUERS` → cartes dérivées → digest | `ISSUERS`/`TokenRef` | `UNDERLYING`/`POR_SOURCES`/`WRAPPERS` → `collect()` → digest | **upcoming** | `bell_registry_derived_maps_equal_frozen_literals` |
| `ISSUERS` → provenance | `ISSUERS.issuerId`/`legalEntity` | `sources.issuers[]` (provenance NON hachée) → `/bell/*.json` à T-1b | **upcoming** | `bell_provenance_carries_issuer_unhashed` |
| registre → course fondatrice | `ISSUERS`/`solanaTokens` | -b1-bis-ii écrit ses séries avec `issuer` | **item à déclencheur** | G0 -b1-bis-ii |

**CA-11 (branché prouvé, §6) — [cp1 B-R1-3, corrigé : `runMain` sort tôt par mode].** Mesuré : `runMain` a des **sorties précoces PAR MODE** (`collect.ts:572` `--rebase-scan`, `:575-577` `--rebase-produce`, `:582` `--discover`, puis `:588` collecte par défaut) ⇒ **une invocation de `runMain` n'exécute qu'UN site**. Le test de composition existant (calque `collect.test.ts:646` `bell_close_databento_replays_synthetic_fixture`) n'exerce donc **que le site collecte** (`:588`). `bell_registry_sites_consume_selector_end_to_end` doit être **UN rejeu PAR MODE** — **5 modes / 6 scénarios de stub**, chacun avec le mutant de registre :
1. **collecte** (défaut) → `collect.ts:588` ;
2. **`--rebase-scan`** → `rebase-scan.ts:239` (wt) ;
3. **`--rebase-produce`** → **DEUX scénarios** : quorum-OK → boucle `rebase-produce.ts:118`, quorum-raté (<2 opérateurs distincts) → branche `no_quorum` `:108` (`return` précoce, mutuellement exclusifs, wt) ;
4. **`--discover`** → `discover.ts:241` ;
5. **`--rebase-crosscheck`** → `rebase-crosscheck.ts:447` (wt) — exige un **stub gTfA `full` + `--max-credits`/`--max-pages`** ; **si jugé hors R-25 : site déclaré NON exécuté + item formé par site** (voie de repli explicitement admise).

Chaque mode : **mutant de registre** (retirer un token de `ISSUERS` ⇒ un symbole de moins construit ⇒ rouge) prouve que les 6 sites lisent `solanaTokens`. **Ce rejeu NE prétend PAS au pin** (stub synthétique) : le pin sur le chemin live est prouvé SÉPARÉMENT par `bell_registry_pin_unchanged_end_to_end` (B-R1-2), et le pin du cœur pur par `bell_collector_replays_fixture_bit_identical` (inchangé). Un test qui ne ferait que `grep` le source ⇒ insuffisant (leçon CARTO-B-8).

## 5. Invariants + mutants IMPOSÉS
| Invariant | Test | Mutant (rouge attendu) |
|---|---|---|
| **Unicité du MINT (`address` NORMALISÉE, par chaîne)** **[cp1 NB-R1-1]** | `bell_registry_unique_mint_address` ; `bell_registry_issuer_ref_integrity` | **même `address` normalisée deux fois ⇒ rouge** (hex EVM `toLowerCase`, base58 Solana casse-sensible) ; **même ticker sous deux émetteurs** = LICITE (FWDI ×2) ; **`issuerId` orphelin (∉ `ISSUERS`) ⇒ rouge** ; `(issuerId, address)` = clé de lookup |
| **Identité d'agrégateur seul ⇒ `identity_unconfirmed`** | `bell_registry_aggregator_identity_unconfirmed` | un `TokenRef` dont `identitySource` = agrégateur seul (pas de confirmation on-chain / pas de document émetteur) ⇒ `identity_unconfirmed` (exclu, publié) ; le marquer « confirmé » ⇒ rouge |
| **Pin INCHANGÉ — cœur pur (garde)** | `bell_collector_replays_fixture_bit_identical` (`collect.test.ts:83-96`, **existant, inchangé** — chemin `collect()` pur sur `tslaxInput`, `quoteDec:6` en dur `:52`, fixture réelle) | un octet du digest ⇒ rouge ; pin `0cfbed20…` du cœur pur inchangé |
| **[cp1 B-R1-2] Pin INCHANGÉ — CHEMIN LIVE** | `bell_registry_pin_unchanged_end_to_end` (**nouveau** ; `runMain` sur stub épinglé, calque `collect.test.ts:646`, traverse `buildSolanaSymbol` + les 6 sites) | invariant = **diff base↔tip = 0** sur le `bell_sha` du `state.json` produit ; constante **`PINNED_RUNMAIN_STUB_SHA` DISTINCTE de `0cfbed20`**, base = arbre de départ (post dernier -b3d), consignée au PLI par l'orchestrateur ; JAMAIS « == 0cfbed20 » en dur |
| **[cp1 B-R1-3] Les 6 sites consomment le sélecteur (CA-11)** | `bell_registry_sites_consume_selector_end_to_end` (**rejeu PAR MODE** : 5 modes / 6 scénarios de stub, §4.2 — **ne prétend PAS au pin**) | **mutant de registre par mode** : retirer un token de `ISSUERS` ⇒ le mode n'en construit qu'un ⇒ rouge (prouve que les 6 sites lisent `solanaTokens`) ; `--rebase-crosscheck` : site exécuté OU déclaré NON exécuté + item |
| **[cp1 B-R1-4] `quoteDec` fail-closed** | `bell_registry_quotedec_fail_closed` (**nouveau**) | un `PoolRef` sans `quoteDec` (optionnel `pools.ts:55`) ⇒ **abstient/rougit, jamais `?? 6`** ; mutant : défaut à 6 ⇒ rouge |
| **Cartes dérivées == littéraux gelés (5 symboles, TSLAon/Ondo compris)** | `bell_registry_derived_maps_equal_frozen_literals` | une valeur dérivée qui diffère d'un octet du littéral gelé (5 symboles) ⇒ rouge |
| **[cp1 NB-R1-2] Cohérence `underlying` sur les 3 déclarations** | `bell_registry_underlying_coherent` (nouveau) | pour un symbole, `TokenRef.underlying` == `PoolRef.underlying` (`pools.ts:56`) == `FoundingEntry.underlying` (`pools.ts:163`) ; divergence ⇒ rouge |
| **[cp1 B-R1-6] `XSTOCKS` alias == PROJECTION 6 champs** | `bell_xstocks_alias_equals_frozen_tokens` | l'alias projeté sur (`symbol`,`chain`,`address`,`decimals`,`standard`,`source`) qui perd/ré-ordonne/altère un des 4 `TokenRef` ⇒ rouge (protège l'oracle -iii-a1) — **projection, pas « caractère-pour-caractère »** |
| **`issuer` non haché** | `bell_provenance_carries_issuer_unhashed` | `issuer` présent en provenance MAIS absent du digest ; l'injecter dans le digest ⇒ le pin change ⇒ rouge |

**`gate:vocab` (D5)** : `apps/bell` reste sous le scan de vocabulaire — aucun terme nouveau introduit par R1 (`multi-issuer` au présent INTERDIT, décision 85 ; les libellés `instrumentClass`/`venueClass` sont des étiquettes de données, pas des revendications).

## 6. Ce qui reste `upcoming` (règle de Branchement)
**Tout.** R1 ne crée **aucun chemin servi nouveau** : les consommateurs du registre restent les **6 sites de `main()`** (`collect()`/scan/discover — upcoming, consommés aujourd'hui par tests non-LLM + smoke, servis à T-1b) + la course -b1-bis-ii (à venir). Bell reste **absent** de `fleet.ts`/README/site/skills/export (`CARTOGRAPHIE…passe2:114-124`). Bell n'est « built » qu'à T-1b. `fleet_register_built_set_is_frozen` **inchangé** (built == {Shōgen,Hikae,Ukemi,Narabi}) — R1 n'ajoute **aucun résiduel nouveau** ⇒ **aucun re-pin** ⇒ registre public exact dans les deux sens.

## 7. Estimation R-25 (MESURÉE, base + projection) et découpe
**Pathspec `STAT=`** (`.github/workflows/ci.yml:65`, `git diff --shortstat origin/main...HEAD` avec exclusions `docs/**/*.md`, `apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}`, `package-lock.json`). Base mesurée des fichiers touchés (`wc -l`, main) : `pools.ts` 179, `collect.ts` 653, `supply.ts` 196, `discover.ts` 255, `rebase-scan.ts` 250, `rebase-produce.ts` 176, `residuals.ts` 65.

**R-25 = code AJOUTÉ net** (pas la taille des fichiers), projection [abs] ×1,5 (facteur b1-bis mesuré, `G0-t1a-iii:129`) :
| Pièce | Brut [abs] | Note |
|---|---|---|
| `IssuerRef` + `ISSUERS` (1 émetteur, 4 tokens) | ~50-65 | données + commentaires de provenance |
| `TokenRef` +5 champs + commentaires | ~10-15 | données seulement |
| `XSTOCKS` alias + `solanaTokens(wanted)` | ~10-15 | |
| Dérivation `UNDERLYING`/`POR_SOURCES`/`WRAPPERS` | ~35-55 | ou littéraux + fonction de dérivation |
| Remplacement des 6 sites + `quoteDec` du pool + `issuer` en provenance | ~12-20 | net ~0 sur les sites (remplacement en place) |
| Tests + mutants **[cp1 ré-estimé]** (§5, ~9 tests) | **~280-360** | **dominant, RÉVISÉ à la hausse** : rejeu PAR MODE (5-6 compositions stub, B-R1-3), `bell_registry_pin_unchanged_end_to_end` (chemin live, B-R1-2), `bell_registry_quotedec_fail_closed` + mutant (B-R1-4), clé normalisée + intégrité référentielle (NB-R1-1), cohérence `underlying` ×3 (NB-R1-2), Ondo `IssuerRef` + `QualificationStop` fermé (B-R1-1/NB-R1-7) |
| Ondo `IssuerRef` (`tokens:[TSLAon]`, `stop` décision 81) + `QualificationStop` fermé | ~15-25 | **[cp1 B-R1-1/NB-R1-7]** |
| PROVENANCE | ~25 | |
| **Total brut** | **~440-590** | **×1,5 ≈ ~660-885** |

**[cp1 NB-R1-5 — borne réelle citée].** La borne CI est **`VIBEGATES_PR_LIMIT: "1205"`** (`.github/workflows/ci.yml:43`, ADR-M003 D9), **PAS « 1 100 »**. Estimation ×1,5 ≈ **~660-885** : **sous 1 205 mais la marge est mince** ⇒ **le seam R1-a/R1-b devient le CHEMIN ATTENDU** (pas seulement pré-déclaré), décidé par la mesure `STAT=` au gel : **R1-a** (`pools.ts`/`supply.ts` : types + `ISSUERS` (xStocks + Ondo) + alias + dérivations + `bell_registry_derived_maps_equal_frozen_literals` + `QualificationStop`) puis **R1-b** (remplacement des 6 sites + **[cp1 NB-R1-4]** `solanaTokens` **AVEC ses 6 consommateurs** (jamais orphelin) + `bell_registry_sites_consume_selector_end_to_end` (rejeu par mode) + `bell_registry_pin_unchanged_end_to_end` + `quoteDec` fail-closed + `issuer` provenance). **[cp1 B-R1-2]** le nom `bell_registry_pin_unchanged_end_to_end` (utilisé ici et §4.1/§5) est **LE** nom du test de pin sur le chemin live — nom unique, plus de « fantôme ». **R-25 ré-mesurée au gel** sous `STAT=`.

## 8. Risques (MAST) et contre-mesures
| Mode MAST | Menace | Contre-mesure |
|---|---|---|
| Abstraction prématurée | interface d'adaptateur d'événement en R1 | R1 = **DONNÉES seulement** ; `enumerationStrategy` = annotation, aucun code de scan ; R2 déclenché par un Q3 réel (décision 85) |
| Vérification incorrecte | re-pin silencieux (nouveau code résiduel, champ dans le digest) | séparation ÉTAT/CODE (§2.4) ; `issuer` non haché (§2.6, P-h) ; garde `bell_collector_replays_fixture_bit_identical` (pin) + `bell_registry_sites_consume_selector_end_to_end` (CA-11) |
| Dérive de spéc | « multi-issuer » au présent ; carte dérivée divergente | décision 85 (wording) ; `gate:vocab` ; `bell_registry_derived_maps_equal_frozen_literals` |
| Sur-déclaration (couverture) | « registre multi-émetteur » affiché comme servi | Bell `upcoming` (§6) ; CA-11 : registre branché seulement via composition exécutée (§6) |
| Isolation / dépendance non fusionnée | modifier `collect.ts` avant -b3d-b ; numéros de ligne périmés | R1 branche **après -b3d-b** ; **re-mesure** des 6 sites (§2.3) ; conflits en vol nommés (§3) |
| Terminaison prématurée | qualification traitée comme résiduel ⇒ re-pin avant release | `IssuerRef.qualification` = donnée publiée non hachée, **jamais** `RESIDUAL_CODES` (§2.4) |
| Rétention d'info inter-agents | numéros de ligne d'un avis pris pour vrais | chaque `fichier:ligne` **ouvert et lu** ; défauts d'avis listés §12 |

## 9. Questions (checkpoint-1)
- **Q1 (orchestrateur) — RETIRÉE [cp1 B-R1-5].** L'hypothèse « -b3d-a SUFFIT si le seam ne tire pas » est **FAUSSE** : **-b3d-b porte L-5 qui touche `supply.ts`** (`G0-b3d:80,182`), or R1 réécrit `supply.ts` ⇒ conflit réel si R1 part avant -b3d-b. R1 part **après la fusion du DERNIER sous-lot -b3d**, inconditionnellement (§3). Plus de choix à confirmer.
- **Q2 (orchestrateur)** — **Ordre R1 vs -iii-a1** : -iii-a1 (fichiers neufs) et R1 (registre) se croisent sur `pools.ts`/`XSTOCKS`. Recommandation : **R1 d'abord** (l'alias `XSTOCKS` préserve l'oracle -iii-a1), OU -iii-a1 lit d'emblée `solanaTokens`. Trancher pour éviter un double-remaniement de `pools.ts`.
- **Q3 (orchestrateur)** — **Chevauchement item -b1-bis-ii #8** (`quoteDec:6`→`founding_pool`) : R1 subsume-t-il #8 pour le chemin `collect()` live (recommandé, P-g), en laissant à -b1-bis-ii le chemin `founding_pool` de la course ? À consigner comme item CLOS dans l'ADR D2-bis.
- **Q4 (orchestrateur/validateur)** — **Valeur de base du pin** : consigner au PLI le `PINNED_BELL_SHA` **de l'arbre de départ R1** (post-b3d-b) comme base de l'invariant diff=0 (peut différer de `0cfbed20…` si -b3c/-b3d-b re-pinnent). Le worker le mesure au démarrage, ne le devine pas.
- **Q5 (orchestrateur)** — **Label légal `instrumentClass` xStocks** : l'avis defi dit « tracker de dette » ; l'établir depuis `docs/biblio/bell/L-lecture-xstocks-mints-emetteur-2026-09-20.md` (première main) ou marquer le champ « à confirmer au Q0 xStocks », le champ étant **données non load-bearing** pour la mesure R1.
- **Q-R2 (INVESTISSEUR, différé)** — **Re-clé du `symbol` du digest** pour une vraie collision FWDI (deux émetteurs, même ticker) : item R2 nommé, **groupé dans le re-pin unique de R2** ; ne se déclenche qu'avec un second émetteur mesuré (T-1a-iv Q3+). Aucune action R1.

---

## 10. Rôles et provenance
Prereg (invariant du pin base↔tip + `PINNED_RUNMAIN_STUB_SHA` + littéraux gelés + noms de tests) committé seul par l'orchestrateur avant le worker. Worker Opus 4.8 max : R1 (**seam R1-a/R1-b = chemin ATTENDU**, décidé par `STAT=` au gel, borne `1205` `ci.yml:43`) → G2 fraîche (instance séparée) → checkpoint-2 (re-exécution CA-9 : recompute du pin base↔tip, cœur pur ET chemin live) → G7 → fusion `--no-ff`. **Le worker ne committe jamais, ne déclenche aucun workflow (R-20)** ; sortie vérifiée adversarialement (R-21). `error_origin` assigné au G7.

---

## 11. PLI checkpoint-1 — table de traçabilité correction → section modifiée
| Correction (avis `claude-fable-5-1`, `f5996a0`) | Nature | Section(s) de ce G0 |
|---|---|---|
| **B-R1-1** TSLAon/ONDO, « un seul émetteur » | Ondo = `IssuerRef` `stop`=décision 81 ; `sources.issuers[]` = émetteurs mesurés | P-a, §2.5 |
| **B-R1-2** pin sur le chemin LIVE | `bell_registry_pin_unchanged_end_to_end`, `PINNED_RUNMAIN_STUB_SHA`, nom unique | §4.1, §4.2, §5, §7 |
| **B-R1-3** branchement des 6 sites | rejeu PAR MODE (5 modes / 6 scénarios), `--rebase-crosscheck` = exécuté OU item | §4.2, §5, L-3 |
| **B-R1-4** `quoteDec` fail-closed | jamais `?? 6` ; test + mutant (`pools.ts:55` optionnel) | P-g, §5 |
| **B-R1-5** séquencement | après le DERNIER -b3d (L-5 → `supply.ts`) ; Q1 RETIRÉE | §3, §9 Q1 |
| **B-R1-6** alias `XSTOCKS` | projection sur les 6 champs, ordre préservé | P-d, §5 |
| **NB-R1-1** clé normalisée + intégrité référentielle | (chaîne, adresse normalisée) + `issuerId ∈ ISSUERS` | P-c, §5 |
| **NB-R1-2** cohérence `underlying` ×3 | `TokenRef`==`PoolRef`==`FoundingEntry` testée | §5 |
| **NB-R1-3** regrade FWDI | Superstate [lu FAITS] ; Backpack [mono-op, 2nd] | P-c |
| **NB-R1-4** `solanaTokens` en R1-b avec consommateurs | jamais un sélecteur orphelin | §7 |
| **NB-R1-5** borne réelle | `VIBEGATES_PR_LIMIT: "1205"` (`ci.yml:43`), pas « 1 100 » | §7 |
| **NB-R1-6** défaut `"TSLAx"` `collect.ts:418` | hors périmètre + item formé à déclencheur | §1.2 |
| **NB-R1-7** `QualificationStop` fermé, disjoint | (porté par l'ADR D2-bis.2) | P-a |
| **NB-R1-8** UNE liste R2 qui fait foi | renvoi à l'ADR D2-bis.3 (13 codes) ; collision `CLOSE_KEY` mesurée | §2.4 |

**R-25 ré-estimé [cp1]** : brut ~440-590 ×1,5 ≈ **~660-885** (< 1 205, marge mince) ⇒ **seam R1-a/R1-b = chemin attendu**, ré-mesuré au gel sous `STAT=`.

**Persistance (R-20/R-21)** : worker RÉDACTEUR `claude-opus-4-8[1m]` effort max ; ne committe pas, ne déclenche aucun workflow ; chaque `fichier:ligne` **ouvert et lu** (`F:\Monark` + `F:\Monark-wt-bellb3d`).
