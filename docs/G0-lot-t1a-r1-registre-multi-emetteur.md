# G0 — Sprint backlog lot R1 « registre multi-émetteur » (Bell) : refonte ADDITIVE des données de registre (IssuerRef + ISSUERS, TokenRef étendu, clé (émetteur, mint)), `PINNED_BELL_SHA` INCHANGÉ, aucun second émetteur ajouté

Rédaction worker PLANIFICATEUR-RÉDACTEUR `claude-opus-4-8[1m]` effort max, 2026-09-21. **Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, non banni, effort max — vérifiable par l'orchestrateur). **R-20** : le worker ne committe pas, ne déclenche aucun workflow (l'orchestrateur porte). **R-21** : sortie vérifiée adversarialement — chaque `fichier:ligne` a été **OUVERT ET LU** dans `F:\Monark` (et `F:\Monark-wt-bellb3d` pour le worktree -b3d) ; les avis Fable du 2026-09-20 sont des **conseils, PAS des faits** (chaque citation d'avis re-vérifiée sur pièce ; défauts trouvés listés §12). **AUCUN appel réseau/RPC/API** ; aucune clé/URL ; aucun close ni prix en clair. Ce G0 est un **PLAN** : aucun code écrit, aucun contrat gelé, aucun commit.

**Cadre (décisions investisseur, `docs/CHANTIERS.md`)** : **décision 85** (`CHANTIERS:254`, verbatim « A ») — release = 4 xStocks **+ registre multi-émetteur R1** (après fusion -b3d-b, **avant** G0 -b1-bis-ii, **`PINNED_BELL_SHA` inchangé**) + plan public Q0-Q5 ; R2 (adaptateur) **différé au premier Q3 réel** ; wording jamais « multi-issuer » au présent avant Q5 d'un second émetteur. **Décision 80** (`CHANTIERS:228`) : tout symbole ajouté est mesuré et publié pour tous (biais de sélection déclaré) — R1 **n'ajoute aucun symbole**. **Décision 68** : toute DONNÉE de première main ; un article ne fournit qu'une MÉTHODE. **CA-11 durci** : un tuyau n'est « branché » que si un test d'intégration non-LLM EXÉCUTE la composition depuis l'artefact.

**Origine du plan** : trois avis Fable `claude-fable-5-1` (2026-09-20, `F:\PRODUITS\etude-2026-09-20\univers-bell\`) — architecture (R1 additif ≈ 330-375 l. sans re-pin [abs], R2 différé, échelle Q0-Q5, lot T-1a-iv séparé), defi (mécanique : `ScaledUiAmount` commun, clé (émetteur, mint) car FWDI existe deux fois), marché (valeur de position, neutralité d'affichage). **Les avis sont conseils** ; ce G0 corrige leurs défauts de faits (§12).

**Rattachement** : ADR-B0 (D2 faits i-iv ; D5 mutants/`gate:vocab` scope `apps/bell` ; D6 sources/coûts R-8 ; ESC-1 c close jamais republié) ; ADR-T1aii (D1-quater rebase `ScaledUiAmount` autorité partagée `S7vYFF…` ; **item registre -b1-bis-ii #8 « `quoteDec: 6` en dur → lire du `founding_pool` »**, `ADR-T1aii:359` ; **item #13 « source ÉMETTEUR dans `pools.ts` »**, `ADR-T1aii:364`) ; brouillon **ADR-B0 amendement D2-bis** (fichier séparé, porté par l'orchestrateur). Code : `apps/bell/src/pools.ts`, `collect.ts`, `supply.ts`, `discover.ts`, `rebase-scan.ts`, `rebase-produce.ts`, `residuals.ts`, `digest.ts` (tous lus).

---

## 0. Objectif (une phrase)

Refondre les **DONNÉES de registre** de Bell d'un modèle mono-émetteur codé en dur (`XSTOCKS`) vers un modèle **multi-émetteur indexé par (émetteur, mint)** — `IssuerRef` + `ISSUERS`, `TokenRef` étendu, cartes `UNDERLYING`/`POR_SOURCES`/`WRAPPERS` **dérivées**, `quoteDec`/`baseDec` lus par mint — **de façon purement additive**, avec **`PINNED_BELL_SHA` inchangé prouvé**, **aucun second émetteur ajouté**, **aucune interface d'adaptateur** (R2 différé au premier Q3 réel), pour que la course fondatrice -b1-bis-ii et le lot de qualification T-1a-iv écrivent leurs séries avec `issuer` dès l'origine.

## 1. Périmètre et NON-périmètre

### 1.1 DANS le périmètre (données seulement)
| # | Élément | Détail (fichier:ligne mesuré) |
|---|---|---|
| P-a | **`IssuerRef` + `ISSUERS`** | nouveau type + constante ; **UN seul émetteur en R1** (xStocks = Backed Assets (JE) Ltd), identité première main établie (`pools.ts:88`, `docs/biblio/bell/L-lecture-xstocks-mints-emetteur-2026-09-20.md`). Champs : `issuerId`, `legalEntity`, `identitySource` (méthode d'établissement d'identité), `defaultInstrumentClass`, `defaultVenueClass`, `tokens` (réf.), `qualification {rung: 0..5, stop: string \| null}` **(donnée publiée, NON hachée — §2.4)**. |
| P-b | **`TokenRef` étendu** | `TokenRef` (`pools.ts:23-30`) gagne `issuerId`, `underlying`, `instrumentClass`, `venueClass`, `enumerationStrategy` (`"shared-authority" \| "per-mint" \| "none-observable"`). **DONNÉES seulement** : `enumerationStrategy` ANNOTE comment un futur scan R2 énumérerait les événements de titre — **aucune interface d'adaptateur, aucun code de scan** (xStocks = `"shared-authority"`, autorité `S7vYFF…`, `ADR-T1aii:226`). |
| P-c | **Clé (émetteur, mint) ; unicité sur le MINT** | l'ancre d'identité est le **mint** — un compte Solana, une chaîne d'autorité, **inémissible par deux entités** ⇒ `address` **unique GLOBALEMENT par chaîne** ; `symbol` **libre** (FWDI existe deux fois = **DEUX mints différents**, même ticker — `FWDtiB5…` Backpack ; Superstate a le sien — avis defi §2 + `FAITS…:28`). `(issuerId, address)` = **clé de LOOKUP**, pas l'invariant. Invariant + mutant (§5). **`symbol` reste la clé RUNTIME et DIGEST en R1** (§2.6) — la re-clé du `symbol` pour une collision de ticker est un item R2 groupé. |
| P-d | **`XSTOCKS` alias dérivé** | `XSTOCKS` (`pools.ts:90-99`) devient un **alias dérivé** = les `TokenRef` de l'émetteur xStocks. Load-bearing : l'oracle de calibration de -iii-a1 lit `XSTOCKS`/`pools.ts:90-99` ⇒ l'alias doit préserver les 4 `TokenRef` **caractère-pour-caractère** (mêmes adresses, `decimals: 8`). |
| P-e | **Remplacement des sites d'itération** | les **6** sites `XSTOCKS.filter((t) => wanted.includes(t.symbol))` (liste exacte §2.3) → un sélecteur `solanaTokens(wanted)` sur l'ensemble multi-émetteur. En R1 (1 émetteur), `solanaTokens` rend exactement les 4 xStocks ⇒ comportement byte-identique. |
| P-f | **`UNDERLYING`/`POR_SOURCES`/`WRAPPERS` dérivés** | dérivés de `ISSUERS`/`TokenRef` **à l'OCTET près** : ils entrent dans le digest (`collect.ts:241-242` : `por`/`wrapper` dans `buildDigest` ; `UNDERLYING` via jointure halt `collect.ts:225`). Test d'égalité aux littéraux gelés (§5, garde le pin). |
| P-g | **`quoteDec`/`baseDec` lus par mint** | `buildSolanaSymbol` `collect.ts:521` code `quoteDec: 6` **en dur** ⇒ lire `pool.quoteDec` (`pools.ts:55`, = 6 pour les 4 pools ⇒ byte-identique). Subsume l'**item -b1-bis-ii #8** (`ADR-T1aii:359`) pour le chemin `collect()` live. `baseDec` = `tok.decimals` déjà lu par mint. |
| P-h | **`issuer` dans l'enveloppe de provenance NON hachée** | `issuer`/`issuers[]` voyage dans `sources` de la provenance (`collect.ts:256-262`, calque `close_source`/`cash_request_digest`), **jamais dans le digest haché** ⇒ pin inchangé. Précédent testé : `bell_close_source_named_in_provenance` (`collect.test.ts:368`). |

### 1.2 NON-périmètre (ce que R1 NE fait PAS)
- **N'ajoute AUCUN second émetteur** (ISSUERS ne contient que xStocks). Backpack/Superstate/Remora/PreStocks = **T-1a-iv** (fichier séparé).
- **N'ajoute AUCUN nouveau code résiduel** ⇒ **aucun re-pin** (les codes nommés par l'avis defi — `no_open_pool_found`, `transfer_fee_present`, etc. — appartiennent à **R2**, un seul re-pin groupé, §2.4 + §9 Q-R2).
- **Aucune interface d'adaptateur d'événement de titre** (R2, différé au **premier Q3 réel**, décision 85).
- **Aucune g_t**, aucun close, aucun scan, aucun appel réseau (plan de refonte de données).
- **Ne re-clave PAS le `symbol` du digest** (item R2 pour une vraie collision FWDI, §2.6).
- **Ne publie rien** : Bell reste **`upcoming`** partout (aucun chemin servi ajouté ; §6).

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
- Les codes résiduels **de séance** nommés par l'avis defi (`no_open_pool_found`, `permissioned_participants`, `transfer_fee_present`, `transfer_hook_unknown`, `mint_paused`, `confidential_amounts`, `corporate_action_offchain_unobservable`, `no_reference_close_by_construction`, `issuer_wind_down_declared`, `per_mint_authority_unscanned`, `multi_pool_fragmented`) = **R2**, un **seul re-pin groupé** (au premier Q3 réel), **JAMAIS en R1**.
- **Corollaire** : **PAS de `defaultResiduals: Residual[]` sur `IssuerRef` en R1** — le type fermé `Residual` (`residuals.ts:49`) ne contient pas encore les codes R2 ⇒ typecheck rouge. (L'avis defi propose `defaultResiduals[]` : à différer à R2.)

### 2.5 Cartes dérivées à l'octet
`UNDERLYING` (`collect.ts:275`), `POR_SOURCES` (`supply.ts:93-99`), `WRAPPERS` (`supply.ts:104-106`) dérivées de `ISSUERS`/`TokenRef`. Comme `porEntries`/`wrapperEntries` entrent dans le digest (`collect.ts:241-242`) et `UNDERLYING` alimente la jointure halt (`collect.ts:225`, compteurs hachés) + `advVolumes` (`collect.ts:520`), la dérivation doit produire des structures **`canonical()`-égales aux littéraux actuels** (5 symboles, TSLAon compris). Garanti par test (§5, `bell_registry_derived_maps_equal_frozen_literals`).

### 2.6 `symbol` reste la clé runtime + digest
Tout le code est indexé par `symbol` (`wanted`, `POOLS.find` `collect.ts:589`, `trajectories[tok.symbol]` `:593`, tri du digest `digest.ts:96-97`). « (émetteur, mint), jamais le ticker » se matérialise en R1 comme **invariant d'unicité du registre** `(issuerId, address)` + `identitySource` (mutant agrégateur-seul), **pas** comme une re-clé du champ `symbol` du digest. La re-clé du `symbol` pour une vraie collision FWDI (deux émetteurs, même ticker) = **item R2 nommé**, groupé dans le re-pin unique de R2 (§9 Q-R2).

## 3. Séquencement — de quelle branche partir, quels conflits attendre

**Chaîne mesurée** : `lot/etude-suite` (tip `c7974ca`, décision 85/86) → **merge -b3d-a** (worktree `lot/t-1a-ii-b3d` tip `0dd13ca`, tout est -b3d-**a** ; -b3d-b **pas encore fait**) → **-b3d-b** (L-1 prod + L-5, seam attendu `G0-b3d:83,196`) → **merge -b3d-b** → **[R1 branche ICI]** → **G0 -b1-bis-ii**.
- **Partir de** : le tip de `lot/etude-suite` **après la fusion `--no-ff` de -b3d-b** (qui inclut -b3d-a : `rebase-crosscheck.ts`, `--max-credits`, `normalizeBody` exporté). Nom de branche R1 proposé : `lot/t-1a-r1`.
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
| L-3 | `apps/bell/src/collect.ts` (+ discover/rebase-scan/rebase-produce/rebase-crosscheck) | `UNDERLYING` dérivé ; **6 sites d'itération** → `solanaTokens(wanted)` ; `issuer`/`issuers[]` dans `sources` de la provenance (non haché) ; `quoteDec` du pool | `bell_registry_sites_consume_selector_end_to_end` (CA-11 : composition `runMain` sur stub, mutant registre, §6) ; `bell_provenance_carries_issuer_unhashed` (issuer en provenance, absent du digest) ; garde existante `bell_collector_replays_fixture_bit_identical` (pin) inchangée |
| L-4 | `apps/bell/test/*.test.ts` | tests + mutants nommés (§5) | (les tests ci-dessus) |
| L-5 | `apps/bell/**` + `docs/PLI-lot-t1a-r1.md` + prereg | PLI (R-25 par livrable mesuré `STAT=`, sha, invariant du pin, table des tuyaux) | ADR/PLI = docs |

### 4.2 Tuyaux (ADR-M018 D3 — entrée / sortie / état / test) — règle de Branchement
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| `ISSUERS` → sélecteur → sites d'itération | `ISSUERS` (données committées) | `solanaTokens(wanted)` consommé par les **6 sites de `main()`** (`collect.ts`/`discover.ts`/`rebase-scan.ts`/`rebase-produce.ts`×2/`rebase-crosscheck.ts` ; upcoming, servis à T-1b) | **upcoming** | `bell_registry_sites_consume_selector_end_to_end` (composition `runMain --pools TSLAx,SPYx` exécutée ; mutant : token retiré de `ISSUERS` ⇒ rouge) |
| `ISSUERS` → cartes dérivées → digest | `ISSUERS`/`TokenRef` | `UNDERLYING`/`POR_SOURCES`/`WRAPPERS` → `collect()` → digest | **upcoming** | `bell_registry_derived_maps_equal_frozen_literals` |
| `ISSUERS` → provenance | `ISSUERS.issuerId`/`legalEntity` | `sources.issuers[]` (provenance NON hachée) → `/bell/*.json` à T-1b | **upcoming** | `bell_provenance_carries_issuer_unhashed` |
| registre → course fondatrice | `ISSUERS`/`solanaTokens` | -b1-bis-ii écrit ses séries avec `issuer` | **item à déclencheur** | G0 -b1-bis-ii |

**CA-11 (branché prouvé, §6)** : le registre n'est « branché » que si les **6 sites de `main()`** le consomment via une **composition EXÉCUTÉE** — `bell_registry_sites_consume_selector_end_to_end` pilote `runMain` (mode collecte par défaut, `--max-calls` fourni, **RPC stubé synthétique offline**, calque `collect.test.ts:645`) et prouve par **mutant de registre** (retirer un token de `ISSUERS` ⇒ un symbole de moins construit ⇒ rouge) que les sites lisent `solanaTokens`. **Ce test NE prétend PAS au pin** (le stub synthétique ne produit pas `0cfbed20…`) : le pin reste prouvé par la garde `bell_collector_replays_fixture_bit_identical` (chemin `collect()` pur, inchangé). Un test qui ne ferait que `grep` le source ⇒ insuffisant (leçon CARTO-B-8).

## 5. Invariants + mutants IMPOSÉS
| Invariant | Test | Mutant (rouge attendu) |
|---|---|---|
| **Unicité du MINT (`address`, par chaîne)** | `bell_registry_unique_mint_address` | **même `address` deux fois, quel que soit l'émetteur ⇒ rouge** (un mint = un compte on-chain, inémissible par deux entités) ; **même ticker sous deux émetteurs** = LICITE (FWDI ×2 = deux mints distincts) ; `(issuerId, address)` = clé de lookup |
| **Identité d'agrégateur seul ⇒ `identity_unconfirmed`** | `bell_registry_aggregator_identity_unconfirmed` | un `TokenRef` dont `identitySource` = agrégateur seul (pas de confirmation on-chain / pas de document émetteur) ⇒ `identity_unconfirmed` (exclu, publié) ; le marquer « confirmé » ⇒ rouge |
| **Pin INCHANGÉ (garde)** | `bell_collector_replays_fixture_bit_identical` (`collect.test.ts:96`, **existant, inchangé** — chemin `collect()` pur sur `tslaxInput`, fixture réelle) | un octet du digest ⇒ rouge ; la valeur du pin est celle **de l'arbre de départ de R1** (consignée au PLI), invariant = **diff base↔tip = 0**, JAMAIS « == 0cfbed20 » en dur (si -b3c/-b3d-b re-pinnent d'ici là, la base change, l'invariant tient) |
| **Les 6 sites consomment le sélecteur (CA-11)** | `bell_registry_sites_consume_selector_end_to_end` (nouveau, calque `collect.test.ts:645` sur **stub RPC synthétique** — **ne prétend PAS au pin** : le stub ne produit pas `0cfbed20…`) | **mutant de registre** : retirer un token de `ISSUERS` ⇒ `runMain --pools TSLAx,SPYx` n'en construit qu'un ⇒ rouge (prouve que les 6 sites lisent `solanaTokens`) |
| **Cartes dérivées == littéraux gelés** | `bell_registry_derived_maps_equal_frozen_literals` | une valeur dérivée qui diffère d'un octet du littéral gelé (5 symboles) ⇒ rouge |
| **`XSTOCKS` alias == 4 tokens gelés** | `bell_xstocks_alias_equals_frozen_tokens` | l'alias qui perd/ré-ordonne/altère un des 4 `TokenRef` ⇒ rouge (protège l'oracle -iii-a1) |
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
| Tests + mutants (§5, 6 tests) | ~180-240 | dominant |
| PROVENANCE | ~25 | |
| **Total brut** | **~320-435** | **×1,5 ≈ ~480-655** |

**< 1 100 avec marge ⇒ 1 seul lot attendu** (l'estimation [abs] de l'avis architecture, 330-375, est cohérente sur le cœur, sous-compte les tests). **Seam PRÉ-DÉCLARÉ** (obligatoire si `STAT=` au gel > 1 100) : **R1-a** (`pools.ts`/`supply.ts` : types + `ISSUERS` + alias + dérivations + `bell_registry_derived_maps_equal_frozen_literals`) puis **R1-b** (remplacement des 6 sites + `bell_registry_pin_unchanged_end_to_end` + `quoteDec`/`issuer`). **R-25 ré-mesurée au gel** sous `STAT=`.

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
- **Q1 (orchestrateur)** — **Ordre R1 vs -b3d-b** : le worktree n'a que -b3d-**a** (tip `0dd13ca`) ; -b3d-b n'existe pas encore. R1 doit partir **après la fusion de -b3d-b** (décision 85, prise telle quelle). **Mais la dépendance DURE de R1 est seulement « `rebase-crosscheck.ts` (6ᵉ site) + `--max-credits`/`normalizeBody` exporté dans l'arbre » = -b3d-a SUFFIT** : si le seam -b3d-b ne tire pas (R-25 -b3d ≤ 1 205), R1 peut partir après -b3d-a. Confirmer le déclencheur exact.
- **Q2 (orchestrateur)** — **Ordre R1 vs -iii-a1** : -iii-a1 (fichiers neufs) et R1 (registre) se croisent sur `pools.ts`/`XSTOCKS`. Recommandation : **R1 d'abord** (l'alias `XSTOCKS` préserve l'oracle -iii-a1), OU -iii-a1 lit d'emblée `solanaTokens`. Trancher pour éviter un double-remaniement de `pools.ts`.
- **Q3 (orchestrateur)** — **Chevauchement item -b1-bis-ii #8** (`quoteDec:6`→`founding_pool`) : R1 subsume-t-il #8 pour le chemin `collect()` live (recommandé, P-g), en laissant à -b1-bis-ii le chemin `founding_pool` de la course ? À consigner comme item CLOS dans l'ADR D2-bis.
- **Q4 (orchestrateur/validateur)** — **Valeur de base du pin** : consigner au PLI le `PINNED_BELL_SHA` **de l'arbre de départ R1** (post-b3d-b) comme base de l'invariant diff=0 (peut différer de `0cfbed20…` si -b3c/-b3d-b re-pinnent). Le worker le mesure au démarrage, ne le devine pas.
- **Q5 (orchestrateur)** — **Label légal `instrumentClass` xStocks** : l'avis defi dit « tracker de dette » ; l'établir depuis `docs/biblio/bell/L-lecture-xstocks-mints-emetteur-2026-09-20.md` (première main) ou marquer le champ « à confirmer au Q0 xStocks », le champ étant **données non load-bearing** pour la mesure R1.
- **Q-R2 (INVESTISSEUR, différé)** — **Re-clé du `symbol` du digest** pour une vraie collision FWDI (deux émetteurs, même ticker) : item R2 nommé, **groupé dans le re-pin unique de R2** ; ne se déclenche qu'avec un second émetteur mesuré (T-1a-iv Q3+). Aucune action R1.

---

## 10. Rôles et provenance
Prereg (invariant du pin + littéraux gelés + noms de tests) committé seul par l'orchestrateur avant le worker. Worker Opus 4.8 max : R1 (1 lot, seam R1-a/R1-b si `STAT=` > 1 100) → G2 fraîche (instance séparée) → checkpoint-2 (re-exécution CA-9 : recompute du pin base↔tip) → G7 → fusion `--no-ff`. **Le worker ne committe jamais, ne déclenche aucun workflow (R-20)** ; sortie vérifiée adversarialement (R-21). `error_origin` assigné au G7.
