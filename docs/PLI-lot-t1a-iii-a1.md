# PRÉ-ENREGISTREMENT — lot Bell T-1a-iii-a1 (univers Solana élargi : identité de première main + `ScaledUiAmount`, ZÉRO Helius)

- **Rédacteur** : worker IMPLÉMENTEUR G1 `claude-opus-4-8[1m]` effort max, 2026-09-21. **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, non banni). **R-20** : le worker ne committe pas et ne déclenche aucun workflow ; l'orchestrateur committe CE pré-enregistrement **SEUL** avant tout appel, puis donne (ou non) le go de la course. **R-21** : sortie vérifiable adversarialement (code + tests offline verts, mutants rejoués RED, shas reproductibles).
- **Périmètre (G0 T-1a-iii, il FAIT FOI ; checkpoint-1 B-2/B-4/B-5/B-8/B-11, CONF-SRC-4)** : énumération de l'univers depuis l'API publique de l'émetteur xStocks **à ÉPUISEMENT**, filtre `deployments[].network` **côté client** (NB-2), confirmation on-chain « adresse émetteur == mint, `owner == Token-2022` » + lecture des extensions dont `ScaledUiAmount` et **son autorité**, sous **quorum-2 = `api.mainnet.solana.com` (keyless) + Chainstack Solana** (`CHAINSTACK_SOLANA_URL`, jamais imprimée). **PAS de liquidité, PAS de classement** (c'est -iii-a2). **ZÉRO crédit Helius.**
- **Ce tour = 100 % HORS LIGNE** : code + tests sur fixtures **synthétiques** + ce PLI. **Aucun appel réseau/RPC/API n'a été émis.**

## 1. Hypothèses falsifiables (SANS chiffre attendu issu d'un article — décision 68)
- **H1** — L'énumération à épuisement de `/public/assets` contient les **4 mints fondateurs** (`XSTOCKS`, `pools.ts:90-99`) à **adresse identique caractère-pour-caractère** ; ils satisfont C1 (owner Token-2022) sous quorum-2. *Falsifiée si un fondateur manque ou n'est pas Token-2022 ⇒ **STOP, aucun artefact** (l'énumérateur est cassé).*
- **H2** — Tout mint Solana listé par l'émetteur a `owner == Token-2022` on-chain. *Falsifiée par tout `identity_unconfirmed` (owner ≠ Token-2022, ou compte absent `value:null`) — **publié**, non caché.*
- **H3** — Une part (à MESURER, **aucune valeur attendue**) des mints Solana confirmés porte l'extension `ScaledUiAmount`, et une part (à MESURER) partage **une même autorité** (`authority == S7vYFF…` ⇒ trajectoire de rebase déjà énumérée par -b3a/-b3d ; `≠` ⇒ scan d'autorité dû). *Aucune répartition n'est pré-supposée ; le nombre est le résultat mesuré.*
- **H4** — Le quorum-2 est concordant sur l'identité de chaque compte (0 désaccord). *Falsifiée par tout `unverified` (désaccord) ou `no_quorum` (miss) ⇒ `scaled_ui_unread` fail-closed, jamais tranché.*
- **Défaut h / NB-6** — le **811** (compte produits publié, décision 82) est un compte, **jamais** « multi-chaîne » ; sa répartition Solana est le **résultat mesuré** de l'énumération (`counts.total_assets` / `counts.solana_assets`), jamais inférée.

## 2. Hôtes et méthodes admis (allowlists alimentées SEULEMENT par ce PLI / CONF-SRC-4)
- **Allowlist d'HÔTES** (`universe.ts` `assertHostAllowed`, refus AVANT l'envoi) : `api.xstocks.fi`, `api.mainnet.solana.com`, **et** tout URL dont `operatorOf(url) === "chainstack"** (l'hôte Chainstack est admis **par opérateur**, jamais par env brut : `CHAINSTACK_SOLANA_URL=https://evil/x` est refusé). **EXCLUS** (jamais dans la liste) : `api.mainnet-beta.solana.com` (CONF-SRC-5), publicnode, GeckoTerminal, CoinGecko. *Décision 89 : publicnode est conservé par l'investisseur pour les usages existants — hors périmètre de CE lot, qui reste voie (A).*
- **Allowlist de MÉTHODES RPC** (`assertMethodAllowed`) : **`getAccountInfo` seul** ; toute autre méthode ⇒ `BudgetExceededError` **avant l'envoi** (re-levée par `quorum2`, exit 1).
- **Tous les GET publics passent par `tick()` du même budget** (B-5).

## 3. Budget fail-closed (APPELS + débit), persistance, reprise sans double compte
- **Unité = APPELS** (leçon C-G2-1 : `makeBudgetedCall` compte des appels, pas des crédits). `--max-calls` requis, > 0. Réutilise `makeBudgetedCall` par **réduction de plafond** : compteur `0..(max−prior)`, `total() = priorCalls + calls()` (offset **M17**, pas de double compte).
- **Débit** : `--min-interval 286` ms ⇒ **≤ 3,5 appels/s logiques** ; le quorum-2 répartit sur 2 opérateurs ⇒ **≈ 1,75 req/s par opérateur** (bien sous les 40 req/10 s = 4 req/s de `api.mainnet.solana.com`, SYNTHESE fiche 05, [lu]). Non-production.
- **`Retry-After` honoré** sur 429 (parsé, borné 60 s), backoff déterministe sur 5xx/timeout. Les retries (≤ 4) **ne re-consomment pas** le budget mais attendent (débit serveur respecté).
- **403 ⇒ ARRÊT DUR** (`Fatal403Error`, sous-classe de `BudgetExceededError`, re-levée, exit 1). *Aligné sur « 403 = IP bloquée » (SYNTHESE fiche 05 `05-solana-rpc-public.md:8`, [lu]) : une IP bloquée ne se débloque pas par insistance ⇒ stopper, ne pas marteler.*
- **429-streak** : `--max-429-streak 5` confirmations 429 consécutives (après honneur du Retry-After) ⇒ **STOP exit≠0, ledger + brut persistés** (repli a1 pré-enregistré ; PAS le « top-N par vault » du G0 l.62, qui est -iii-a2).
- **Persistance & reprise (sans double compte)** : ledger `budget.json` (`{calls}`, canonique LF) **+ brut émetteur** persistés hors dépôt (écrits après chaque mint, en `finally`, et le brut avant l'oracle). **Absent ⇒ 0** ; **malformé/invalide ⇒ throw** (fail-closed ; jamais re-chaîner depuis genesis — **M15**). Le compteur ne **double-compte pas** à la reprise (offset `priorCalls`, `total()=priorCalls+calls()` — **M17**). Les DEUX mutants nommés de C-G2D-2 (M17, M15) sont implémentés et rejoués **RED**. **LIMITE déclarée — item formé `a1-bis` (jamais une dette nue)** : les **candidats confirmés ne sont PAS persistés** en a1 ; une reprise re-pagine et re-confirme sous le **plafond résiduel** — un STOP laissant des mints non confirmés n'est donc PAS repris à mi-course. **Déclencheur** : si un run s'arrête avec des mints non confirmés, l'orchestrateur (a) relance avec un plafond amendé (`--max-calls` neuf sur un ledger neuf), **ou** (b) `a1-bis` ajoute le skip-des-mints-déjà-confirmés depuis le brut + un artefact partiel (calque du rejeu-depuis-artefact C-G2D-2 de -b3d ; ~40 lignes + test + mutant, R-25 a la marge).

## 4. Critères d'arrêt (STOP dur, exit ≠ 0)
1. **Préflight** : hors `[api.mainnet.solana.com (solana-foundation), CHAINSTACK_SOLANA_URL (chainstack)]` distincts ⇒ STOP **avant toute page émetteur** (Chainstack absent inclus).
2. **Épuisement non prouvé** : `--max-pages` atteint **sans ancre de fin** ⇒ STOP (« ancre de fin + monotonie », **jamais « N pages »**). Ids dupliqués entre pages (serveur ignorant `page`) ⇒ STOP.
3. **Oracle de calibration** : un fondateur absent, ou à adresse différente, ou non Token-2022 ⇒ STOP, **aucun artefact** (le brut émetteur EST tout de même sauvé avant l'oracle).
4. **403** ⇒ arrêt dur ; **budget épuisé** ⇒ `BudgetExceededError` ; **429-streak** ⇒ STOP.

## 5. Ancre de calibration + preuve d'épuisement (pré-enregistrées)
- **Ancre** : les 4 fondateurs `XSTOCKS` (`pools.ts:90-99`), adresses lues au G0 (`L-lecture-xstocks-mints-emetteur-2026-09-20.md:81-88`), `TOKEN_2022_PROGRAM` (`pools.ts:69`). Date de lecture pré-enregistrée = **2026-09-21**.
- **Preuve d'épuisement** : page index monotone `0,1,2,…` ; **ancre de fin** = une page à **< `pageSize` éléments** (ou vide) ; **aucun id dupliqué** entre pages. Enregistrées dans le brut (`pages`).

## 6. Commande EXACTE de la course (proposée — l'orchestrateur donne le go après revue)
`CHAINSTACK_SOLANA_URL` est une variable **User** (`BASCULEMENT-COMPTE.md:81`), déjà en environnement, **jamais** passée en ligne de commande ni imprimée.

```
node apps/bell/src/universe-cli.ts \
  --out F:/PRODUITS/etude-2026-09-21/bell-univers-raws \
  --ledger F:/PRODUITS/etude-2026-09-21/bell-univers-raws/budget.json \
  --max-calls 2000 --min-interval 286 --page-size 100 --max-pages 20 --max-429-streak 5 \
  --date 2026-09-21
```

**Budget chiffré (pire cas borné par le compte publié 811, décision 82)** : pages `⌈811/100⌉ = 9` GET + confirmations `≤ 811 × 2 = 1 622` (quorum-2) = **≤ 1 631 appels logiques** ; `--max-calls 2000` laisse une marge fail-closed. **Durée projetée** ≈ `1 631 × 0,286 s ≈ 467 s (~7,8 min)` en sériel ; pire cas `2000 × 0,286 ≈ 572 s`. **Coût Helius = 0** (RU Chainstack consommés sur compte distinct, jamais le ledger -b3d).

## 7. Forme du brut et de l'artefact ; ce qui est committé / publié / jamais
- **Brut émetteur** (`issuer-assets-2026-09-21.json`, **HORS dépôt** sous `F:/PRODUITS/etude-2026-09-21/bell-univers-raws/`, sha-pinné, sauvé **AVANT** l'oracle) : `{schema, host, endpoint, pageSize, pages, assets:[…]}`. **Jamais committé** (clause anti-republication ToS Backed Finance AG, SYNTHESE fiche 04 §6, [lu]).
- **Artefact `universe-candidates-2026-09-21.json`** (HORS dépôt ; corps **canonique SANS horodatage** pour rejeu à l'octet) : construit **par ALLOWLIST DE CHAMPS** (jamais par strip) — chaque enregistrement ne porte QUE `{symbol, name, mint, network, mic, owner_program, decimals, extension_names, scaled_ui, scaled_ui_authority, scaled_ui_unread, identity_state}` + `counts:{total_assets, solana_assets, confirmed}`. **AUCUN champ de prix/valeur/volume/solde/`supply`/`multiplier`, aucun couple prix-dérivable** (`assertOnlyAllowedFields` + ceinture `assertNoClose`). `PROVENANCE-univers-solana.md` (envelope séparée : date, opérateurs **par domaine seul**, sha du brut + de l'artefact).
- **Committé ce tour** : ce PLI (par l'orchestrateur, SEUL, avant tout appel). **Code + tests + fixtures synthétiques** gelés dans le worktree (revue G2/G7). **Jamais committé** : brut, artefact, ledger (tous hors dépôt). **Rien** n'est ajouté à `pools.ts`/`XSTOCKS` ; **aucun** registre public (fleet/README/site/skills/export) touché — tout reste `upcoming`.

## 8. CA-11 durci (B-8) — composition exécutée depuis un FICHIER, rejeu à l'octet
- `bell_universe_cli_composes_from_file_to_artifact` : le **vrai point d'entrée CLI** (`runUniverse`) lit la réponse émetteur depuis un **fichier** (fixture synthétique) + réponses RPC stubées ⇒ écrit l'artefact ; budget/ledger persistés ; provenance sans URL Chainstack.
- `bell_universe_artifact_byte_exact_replay` : brut committable (fixtures) ⇒ artefact **byte-identique** au fixture gelé (`expected-universe-candidates.json`).
- `bell_universe_calibration_stop_writes_no_artifact` : fondateur manquant ⇒ **aucun artefact**, mais **brut sauvé** (ordre brut → oracle → artefact).

## 9. Attribution, limites (SYNTHESE, [lu]) et biais déclarés
- **RPC public `api.mainnet.solana.com`** (SYNTHESE fiche 05 `05-solana-rpc-public.md:7-8`, [lu]) : **40 req/10 s/IP par RPC unique** (+ 100 req/10 s/IP total), **non-production** (« not intended for production applications »), **403 = IP bloquée**, **429 = ralentir + lire `Retry-After`** ; aucune attribution requise. Équivalence `mainnet.solana.com`/`mainnet-beta` **non tranchée** (indice « Triton One » non vérifié, `:23`) ⇒ `mainnet-beta` **exclu** (PR-U-SOLANA-PUBLIC-RPC résiduel, mainteneur).
- **`api.xstocks.fi`** (SYNTHESE fiche 04 `04-xstocks.md:32,55,80`, [lu]) : endpoints publics sans clé ; **clause 6 anti-republication** (« you may not copy … reproduce, republish … the content ») ⇒ **ne conserver que les champs on-chain + identité**, brut hors dépôt, jamais collé (≤ 25 mots, NB-5). Ambiguïté de portée §5.1 (API dev documentée séparément) **non tranchée** ⇒ procurement PR-U-XSTOCKS-API-TOS.
- **Chainstack Solana** : opérateur distinct, exercé de première main (`PROVENANCE-rebase-course.md:57`) ; **RU consommés** (« 0 crédit Helius » ≠ « 0 coût ») ; portée ToS Chainstack pour cette campagne = **item formé (B-IV-2)**.
- **Biais déclarés** : `issuer_selection_bias` (xStocks d'abord = choix d'émetteur déclaré ; décision 80 : tout ajout publié pour tous) ; **énumération dépendante de l'API de l'émetteur** (l'ensemble vu dépend de `/public/assets`). **`scaled_ui_unread`** est un résidu fail-closed (jamais deviné). **Autorité `ScaledUiAmount`** enregistrée (informe le coût d'ajout, jamais un prix).
- **Secret** : `CHAINSTACK_SOLANA_URL` jamais imprimée ni écrite (`scrubSecret`, test par motif + contrôle par longueur) ; motif `no_secret_in_repo` `core.chainstack.com/<hex32>` déjà couvert ; aucune clé dans le dépôt.

## 10. Repli si la forme de l'API diffère (déclaré, non implémenté ce tour)
Si `/public/assets` (liste) ne portait pas `deployments[]` par actif (l'exemple L-lecture l.308 est **trimé**), repli **par-symbole** (`/public/assets/{symbol}`) — coût supérieur, **déclaré**, à ré-enregistrer avant exécution. `underlying.exchange.mic` est lu null-tolérant (`mic:null` si absent ; C2 est -iii-a2). Le filtre `deployments[].network` **côté client** reste load-bearing quel que soit le filtre serveur (NB-2).
