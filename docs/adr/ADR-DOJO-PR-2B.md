# ADR-DOJO-PR-2B : MONARK Dōjō, pièce 1, PR-2b — collecteur de l'historique rétroactif (G0 de lot, plan de sprint sans code)

- **Statut** : proposé (G0 de lot). Checkpoint-1 bref du validateur-humain dû sur ce document avant tout G1 de la série PR-2b (règle C-3 de l'ADR-mère : faits non confirmés ; décisions nouvelles D-4, D-7, D-9, D-12 (séparation `publish/` et `evidence/`, règle d'existence des lignes), D-13 (déclencheur de RECONCILE-WINDOW-1 déplacé, retour de `unlock`) et D-14 ; écarts É-2 à É-8). Ce document n'écrit ni code ni test, ne committe rien, n'émet aucun appel réseau ni RPC (R-20 ; règle de mission). **Checkpoint-1 bref tenu le 2026-09-26** : ACCEPTE-AVEC-CORRECTIONS (validateur-humain `claude-fable-5-1`, `F:/tmp/dojo/cp1d/CP1D-report.md`, sha256 `4fa57831c169d387a60e9515eba0d1531b0a040cb6a3dab614d5b57c2921b7ef`), liste fermée C-24 à C-31, écarts É-2 à É-8 acceptés ; C-24 est pliée dans l'ADR-mère (sixième pli) ; C-25 à C-31 le sont ici, récapitulées par l'amendement daté « Corrections checkpoint-1 bref », en fin de document, qui fait foi sur tout le texte antérieur.
- **Dates** : ouverture 2026-09-26T05:59:42Z (`date -u`) ; relevés hors ligne de 06:0x à 06:38Z ; début de l'écriture 06:39:08Z ; heure et sha256 du fichier final rendus hors du fichier · approbation : néant à ce jour · dernière modification : 2026-09-26.
- **Propriétaire de la décision** : l'orchestrateur `claude-fable-5-1` (planificateur) pour D-1 à D-14 ; le validateur-humain pour le checkpoint-1 bref ; l'investisseur pour le seul go des actes réseau (§7). Aucune question P-* nouvelle ne lui est posée.
- **Gate concerné** : G0 (doc 02).
- **Éléments affectés** : nouveaux `apps/dojo/src/history-read.ts`, `apps/dojo/src/history-build.ts`, `apps/dojo/src/history-collect.ts`, `apps/dojo/test/history-*.test.ts`, `apps/dojo/test/helpers/history-chain.ts`, `apps/dojo/test/fixtures/history/**` ; module de la liste de méthodes du Dōjō (créé par PR-2) ; lot rpc-guard distinct (`packages/rpc-guard/src/reconcile.ts`, `cli.ts`, `transport.ts`, D-13) ; hors dépôt, `F:/PRODUITS/dojo-mirror/history/`.
- **Rattachement** : ADR-DOJO-SNAPSHOT-1 (dite « l'ADR-mère »), gel 7 `9f50f1d`, sha256 `956a21d7604d852e28fcca843b26c866df3eaf327e783a1dc6985ced18b63bc1`, recalculé égal à l'ouverture sur le fichier de travail et sur `git show 9f50f1d:docs/adr/ADR-DOJO-SNAPSHOT-1.md`. Parties utilisées : D-2, D-4, D-5, D-6, D-7, D-8, D-10, D-16, D-18, T-22, §5 (TU-12), §6 (PR-2b), §7, §11, amendement « Cinquième pli » (fait foi pour PR-2b). ADR-M018 D3 (tuyaux).
- **Notation** : « D-n », « TY-n », « Q-n », « É-n » et « R-a » à « R-j » désignent les décisions, menaces, questions, écarts et relevés de ce document. Une décision, menace ou section de l'ADR-mère s'écrit « mère D-n », « mère T-n », « mère §n ». Les six tests `dojo_history_*` et les mutants M-Y1 à M-Y7 de mère §6 gardent leurs noms et leurs numéros.
- **Rédaction** : worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` déclaré à l'ouverture, R-1), effort max, contexte frais. Mission : message de l'orchestrateur `claude-fable-5-1` du 2026-09-26, sans fichier de mission (texte non haché ici) ; entrée du tronc `F:/Monark/docs/CHANTIERS.md:1589` (« Dōjō PR-2b : G0 lancé »).
- **Base lue** : worktree `F:/Monark-wt-dojo`, branche `lot/dojo-snapshot-1`, HEAD `9f50f1d`, `git status --short` vide à 05:59Z et à 06:39Z. `apps/dojo/` est absent (`git log --all -- 'apps/dojo/*'` ne rend aucun commit) : PR-1a, PR-1b-1, PR-1b-2 et PR-2 ne sont pas écrites. Tronc `F:/Monark` à `96026ae` (CHANTIERS l.1579-1589 lus).

## 0. Décisions, une ligne chacune

- **D-1 (périmètre)** : PR-2b collecte sous quorum helius + chainstack les transactions qui touchent les comptes de jetons du mint, de SIG0 à l'emplacement de la première énumération. Elle reconstruit les valeurs du jour de l'historique, du jour 1 au dernier jour de l'historique, et écrit un paquet hors dépôt. Elle ne signe, ne publie et ne sert rien ; elle n'appelle ni solana-foundation, ni `getAccountInfo`, ni `getProgramAccounts`.
- **D-2 (formes fermées)** : trois méthodes, `getSignaturesForAddress` (deux opérateurs), `getTransaction` (deux opérateurs) et `getTransactionsForAddress` (helius seul, `full`, `limit: 100`, `asc`). `encoding: "jsonParsed"`, `maxSupportedTransactionVersion: 1` et `commitment: "finalized"` sont passés explicitement. La liste fermée `DOJO_HISTORY_METHODS` est couverte par `assertMethodCapsCover` avant toute ouverture du client.
- **D-3 (algorithme)** : six phases déterministes, pseudo-code au §2 : index du mint, corps, pages par compte jusqu'au point fixe, reconstruction pure, contrôles, paquet.
- **D-4 (quorum des signatures)** : les index des deux opérateurs sont fusionnés. Une signature en échec chez les deux est exclue avant toute lecture de corps. Une signature réussie chez les deux, ou contestée (listée par un seul index, ou avec des champs différents), est lue chez les deux opérateurs. Les écarts d'index sont comptés et bornés.
- **D-5 (quorum des corps)** : une transaction est admise ssi les deux corps rendent la même clé de lecture. La clé réunit signature, emplacement, heure du bloc, erreur, rang (s'il est présent chez les deux), entrées du mint (compte, propriétaire, montant, programme), instructions d'offre sur le mint et types Token-2022 touchant le mint.
- **D-6 (transaction sans quorum)** : ses comptes, donc leurs adresses (mère C-9), sont sans valeur du jour de cette transaction au jour de la suivante admise sur le même compte, inclus. La collecte s'arrête si ses comptes sont inconnus, si elle touche l'offre, ou si la fenêtre ne se referme pas avant la première énumération.
- **D-7 (valeur du jour, ordre dans un emplacement)** : minimum du solde de l'adresse sur le jour (mère P-34), jour 1 = 0. Si toutes les transactions admises d'un emplacement portent un rang concordant, on prend les soldes exacts après chaque transaction. Sinon, pour toutes les adresses de cet emplacement, on prend une borne basse sur-additive : solde d'avant plus somme des baisses.
- **D-8 (contrôles, mère T-22)** : (i) offre, par transaction et par jour ; (ii) égalité, compte par compte, avec chacune des deux réponses de la première énumération ; (iii) chaînage des soldes de chaque compte ; (iv) création (SIG0) ; (v) jours monotones ; (vi) liste fermée des types d'instructions ; (vii) bornes d'écart. Tout échec arrête la collecte, sans paquet publiable.
- **D-9 (corps helius)** : `getTransactionsForAddress` par pages de 100 corps, soit 10 crédits par appel au barème du garde, égal à la facturation lue (H-4) à ce `limit`. `getTransaction` ne sert qu'aux compléments. La cohérence des deux sources helius est contrôlée.
- **D-10 (plafonds)** : écrits depuis le pic du 2026-09-19 (6 467 signatures), sans déduction des échecs. Garde ×10 : aucune ouverture si le plancher helius plus 10 fois le plafond de course helius dépasse 8 000 000. La phase C est plafonnée après la phase B. La collecte se fait en deux actes réseau.
- **D-11 (arrêt et reprise)** : tout plafond atteint ou tout contrôle en échec arrête la collecte sans appel de plus, et le paquet reste `partial`, non publiable. La reprise relit un journal chaîné et repart de la dernière unité close : page, corps, ou compte entier.
- **D-12 (paquet)** : `F:/PRODUITS/dojo-mirror/history/<AAAA-MM-JJ>/` compte deux parties. `publish/` contient les lignes `history/<sha256>.jsonl` à clés fermées `{day, address, class, day_value}`, un manifeste et un `SHA256SUMS` ; elle ne porte ni libellé d'opérateur ni secret, et n'est écrite qu'au statut `complete`. `evidence/` contient le journal, les réponses brutes compressées, les exécutions et les contrôles ; elle reste interne.
- **D-13 (dépendances)** : RECONCILE-WINDOW-1 (rapprochement borné à une course, décrit au D-13) et RPC-GUARD-HELIUS-HOST-1 forment un lot rpc-guard, à faire avant le G1 de PR-2b-3. DOJO-MINT-EXTENSIONS-1 ne bloque pas les G1 ; il bloque l'acte réseau.
- **D-14 (R-25)** : 1 787 lignes ascendantes, ≈ 3 538 au pire facteur mesuré (×1,98), réparties en quatre PR : PR-2b-1 (lecture, pure), PR-2b-2 (reconstruction et paquet, pure), PR-2b-3 (collecteur, phases A et B), PR-2b-4 (phase C, reprise, test d'intégration).

## 1. Contexte mesuré

### 1.1 Ce que l'ADR-mère fixe pour ce lot (gel 7, fait foi)

- **Valeur du jour d'une adresse** : plus petite lecture concordante. L'absence concordante d'un compte vaut 0 (mère C-1). Une lecture d'adresse n'est concordante que si tous ses comptes du mint le sont (mère C-9). Un jour manquant ne compte rien et ne remet rien à zéro (mère D-2, D-4).
- **Classe** : un propriétaire hors de la courbe Ed25519 est `program`, avec un score nul (mère D-6). La fonction pure `ownerClass` vient de PR-1a.
- **Lignes** : JSON canonique de Bell, tri par adresse en ordre d'octets, arbre de Merkle à préfixes 0x00 et 0x01 (mère D-7). La ligne signée `history` porte `history_first_day`, `history_last_day`, `history_sha256`, `history_lines_count` et `history_root` (mère D-8). Codes du vérificateur : `history_sha_mismatch`, `history_count_mismatch`, `history_not_sorted`, `history_root_mismatch`, `history_transition_mismatch` (mère D-10).
- **Mère D-18** : jour 1 = 2026-09-10.
  - (a) Découverte par `getSignaturesForAddress(mint)`.
  - (b) Pages de signatures de chaque compte découvert, fermés compris.
  - (c) `getTransaction` en `jsonParsed` : soldes avant et après, par compte, avec le propriétaire.
  - (d) Solde d'un propriétaire = somme de ses comptes après chaque transaction ; jour UTC = jour de `blockTime`.
  - Quorum sur les signatures et sur les soldes.
  - Une transaction sans quorum rend son compte, donc l'adresse, sans quorum de son jour au jour de la transaction suivante lue sous quorum sur le même compte, inclus.
  - Valeur d'un jour rétroactif = minimum du solde sur le jour (début du jour et après chaque transaction du jour ; 0 au jour 1).
  - Contrôles : (i) offre quotidienne, (ii) égalité avec la première énumération ; tout écart arrête la publication.
  - Fichier `history/<sha256>.jsonl`, clés fermées `{day, address, class, day_value}`, `day_value` à `null` pour un jour manquant, lignes triées par jour puis par adresse.
- **Mère §5 et §6** : tuyau TU-12. Tâche PR-2b : `apps/dojo/src/history.ts`, six tests `dojo_history_*`, mutants M-Y1 à M-Y7, checkpoint-1 bref avant le G1.
- **Mère §7** : PR-2b vient après PR-2 et SNAPSHOT-PROBE-3 ; elle est estimée à 500 lignes ascendantes, 990 à ×1,98. Borne CI 1 205 (`.github/workflows/ci.yml:49`), seuil STOP 1 150. Le pathspec de `ci.yml:82` compte les fichiers `apps/dojo/test/fixtures/**`.
- **Mère §11** :
  - RECONCILE-WINDOW-1 : avant le G1 de PR-2b, prérequis de `dojo_history_budget_stops_fail_closed`.
  - RPC-GUARD-HELIUS-HOST-1 : au prochain lot rpc-guard.
  - CHAINSTACK-AFTER-2 : à partir du 2026-09-27 02:00Z.
  - DOJO-MINT-EXTENSIONS-1 : propriétaire et déclencheur de SNAPSHOT-PROBE-1 (a).
  - BELL-TX-VERSION-1.
- **Cinquième pli, paramètres fermés** :
  - opérateurs helius + chainstack ; `maxSupportedTransactionVersion: 1` ; `jsonParsed` ;
  - `finalized` explicite (forme non essayée par la sonde, C-21 (e)) ;
  - pagination `before` par 1 000 jusqu'à SIG0 incluse ;
  - corps par `getTransaction` chez chainstack ; côté helius, `getTransaction` ou `getTransactionsForAddress`, au choix de ce G0 ;
  - plafonds depuis le pic du 2026-09-19 ;
  - mère D-18 (b) conservée, son coût non chiffré ;
  - aucun appel vers solana-foundation ;
  - garde ×10 conservée : plafonds de course au barème 1, garde de cycle dimensionnée ×10 (C-22).

### 1.2 Ce que la sonde a mesuré

Sources :
- `F:/Monark/docs/dojo/FAITS-probe-3-2026-09-26.md`, sha256 `de96f09244b6bcfdc7c6fc4d70efef6259b6172ac925cb27066b495cd5cef46c`, recalculé égal ;
- `F:/Monark/docs/dojo/FAITS-probe-3-lectures-2026-09-26.md`, sha256 `aa91583d58b321f5e3a3102f3b6947e1855a4e53b861b32f88ce9b08c36c6d38` ;
- sortie `F:/PRODUITS/dojo-mirror/probe-3/2026-09-26T0145Z/` : `sha256sum -c SHA256SUMS` rend 49 OK ; `derived.json` `e9b4a4fb…5514`, `run.json` `b830a369…04a4`, `calls.jsonl` `09bc13e5…42f3`, `SHA256SUMS` `e8ff845f…e28f`.

| Fait | Valeur | Source |
|---|---|---|
| SIG0 | `2rgTPbFoaXnx4w9J1SxqFLSZoFu7yBNcQBR3hkHqZkyR4EpnUo2TuWAYUuCgr3G6LMpB3Yw4fya3iCkSZqH86uoU`, slot 445 903 343, `blockTime` 1 789 049 406 (2026-09-10T14:10:06Z), quorum 3/3 sur l'empreinte complète | `derived.json` R1, R2 ; FAITS l.14-15 |
| Rien de plus ancien | A6 = A7 = `[]` ; A2 finie sur une page courte | `derived.json` R3 ; FAITS l.16 |
| Volume | N = 23 628 signatures en 24 pages (17 jours UTC, le 26/09 jusqu'à 01:45Z) ; 5 714 en échec (24,2 %) ; 0 doublon ; 0 `blockTime` nul | `derived.json` R4 |
| Pic | 2026-09-19 : 6 467 signatures ; moyenne N/17 = 1 389,9 ; rapport 4,65 | `derived.json` R4 `per_day_utc` ; arithmétique |
| Concordance | B1 à B4 : égalité d'ensemble et d'ordre, 0 différence | `derived.json` R5 |
| Méta | `owner` et `programId` présents chez les trois opérateurs ; `blockTime` partout | `derived.json` R6 |
| Tables d'adresses | une transaction (C2) n'atteint le mint que par table d'adresses, lue sur trois opérateurs : l'index des signatures couvre les adresses chargées | `derived.json` R7 ; mère C-18 |
| Inclusion | D1, D2 : 1 000 signatures chacun, sur helius et chainstack ; 0 absente de l'index du mint | `derived.json` R8 |
| Coût helius | +39 crédits, égal au compte du garde méthode par méthode : +10 gTFA à `limit: 1`, +3 `getTransaction`, +26 `getSignaturesForAddress` | FAITS l.29 |
| Coût chainstack | 16 RU comptés ; +15 lus (relevé partiel, stabilité due) | FAITS l.31 ; CHAINSTACK-AFTER-2 |
| Rapprochement servi | NO-GO doux : la fenêtre couvrait le cycle entier (79 303 lignes, 400 788 crédits comptés depuis le 19/09) | FAITS l.30 |
| Paramètres lus | voir le détail sous le tableau | FAITS lectures l.10-20 |

Détail des paramètres lus (FAITS lectures) :
- H-1 : `limit` de 1 à 1 000 ; `before` ; `until` ; `commitment` par défaut `finalized`.
- H-2 : V = 1.
- H-2b : `owner` et `programId` « may be omitted ».
- H-4 (gTFA) : `paginationToken` au format « slot:position » ; `limit` de 1 à 1 000 ; facturation « 10 credits per 100 returned transactions, rounded up; 10-credit minimum ».
- H-5 (chainstack) : `getSignaturesForAddress` toujours facturé en archive (2 RU) ; `getTransaction` en archive sous `firstAvailable + 5 000`.
- H-7 : `blockTime` est estimé, pondéré par le stake.

### 1.3 Relevés du rédacteur sur les réponses brutes de la sonde (sans réseau)

Ces relevés ne viennent ni d'un FAITS ni de `derived.json`. Ils sont lus par script sur des fichiers de la sortie de la sonde, tous listés dans son `SHA256SUMS`, et sont reproductibles : scripts et sorties sous `F:/tmp/claude/F--Shogen/90684fb2-4e7b-42e9-b820-f042dc4465f3/scratchpad/`, sha256 au §12. L'orchestrateur peut les rejeter sans toucher aux décisions qui ne s'appuient que sur le §1.2 ; chaque décision qui s'en sert le dit.

- **R-a (rang dans le bloc)**. Scripts `inspect-txindex.mjs`, `inspect-pages.mjs`.
  - Les neuf corps `getTransaction` (SIG0, C1 et C2, chacun chez trois opérateurs) portent `transactionIndex`, égal chez les trois (342, 1 694, 412).
  - La page lue (H-2) ne documente pas ce champ.
  - Les pages de signatures helius le portent (1 000/1 000). Chainstack le porte sur B1 (les 1 000 plus anciennes) mais pas sur B3, D1 ni D2 (pages récentes).
  - Le jeton de pagination de gTFA vaut `"445903343:342"` (emplacement:rang).
- **R-b (égalité des corps)** : une fois les clés triées, les corps helius et chainstack de SIG0, C1 et C2 sont égaux (0 différence). Le corps que rend gTFA pour SIG0 (A1) a le même sha256 canonique que A3 et A5 (`e062bdce…60dd`). Scripts `diff-bodies.mjs`, `diff-gtfa.mjs`.
- **R-c (formes `jsonParsed` vues)**. Script `inspect-bodies.mjs`.
  - `mintTo` : `{account, amount, mint, mintAuthority}`.
  - `transferChecked` : `{authority, destination, mint, source, tokenAmount}`.
  - `initializeAccount3` : `{account, mint, owner}`.
  - Les soldes de jetons d'un corps portent aussi d'autres mints (SOL enveloppé, USDC).
  - Un coffre chargé par table figure dans les soldes (C2, index 17, `source: lookupTable`).
- **R-d (création)**. Script `sig0-ext.mjs`.
  - Dans SIG0, `setAuthority` porte `authorityType: "mintTokens"` et `newAuthority: null` : l'autorité de frappe est retirée dans la transaction de création.
  - `getAccountDataSize` du compte associé ne demande que `extensionTypes: ["immutableOwner"]`.
  - `initializeMint2` ne porte aucune autorité de gel.
  - Ce corps ne dit rien de l'état actuel du mint (DOJO-MINT-EXTENSIONS-1).
- **R-e (recomptage des 24 pages)**. Script `pages-days.mjs`.
  - Les comptes par jour égalent `derived.json` R4 jour pour jour, et les échecs somment à 5 714.
  - Le 2026-09-19 compte 1 928 échecs, donc 4 539 transactions réussies.
  - 0 inversion d'emplacement, 0 inversion de `blockTime` d'un emplacement au suivant, 0 emplacement portant deux `blockTime`.
- **R-f (emplacements partagés)** : l'index helius du mint couvre 12 100 emplacements distincts, dont 2 937 portent au moins deux signatures. Dans chacun, `transactionIndex` décroît strictement (plus récent d'abord). Script `gzip-ratio.mjs`.
- **R-g (compression)** : gzip de niveau 9 réduit les corps de 231 315 à 44 755 octets (×5,17) et les pages de 5 494 522 à 1 790 733 octets (×3,07). Script `gzip-ratio.mjs`.
- **R-h (latences et tailles)**, d'après `calls.jsonl` :
  - corps de 13 705, 27 059 et 36 341 octets ;
  - `getTransaction` chez chainstack : 966, 137 et 162 ms ; chez helius : 136, 239 et 243 ms ;
  - pages helius du mint : 539 à 1 405 ms, médiane 581.
- **R-i (noms de clés)** : les 31 noms de clés des lignes et du manifeste publiable (D-12) passent `CLOSE_KEY` et `assertNoCloseLike` de `apps/bell/scripts/bell-chain.mjs` (0 coup). Script `names-closekey.mjs`.
- **R-j (règle de repli, mesure M-H1)** : grille exhaustive d'un emplacement à trois transactions sur deux comptes, soit 3 721 configurations à soldes jamais négatifs. Script `slot-rule.mjs`.
  - L'ordre exact est sur-additif (0 violation).
  - La borne basse appliquée à toutes les adresses de l'emplacement est sur-additive (0 violation) et ne dépasse jamais le vrai minimum (0).
  - Appliquée à la seule adresse combinée, ses parties gardant leur valeur exacte, la même borne viole la sur-additivité dans 899 configurations.

### 1.4 Code réutilisé, lu à `9f50f1d`

- **Garde** (`packages/rpc-guard`) :
  - `openGuardedClient(env, limits, ledgerDir, cycles, opts)` est le seul chemin payant. Il contrôle la configuration avant tout verrou, prend les verrous dans l'ordre et les relâche en cas d'échec (`guarded.ts:19-59`).
  - `RunLimits = {maxCalls, runCaps, methodCaps, cycleFloor}` (`client.ts:39-44`).
  - Une seule tentative par appel ; la reprise appartient à l'appelant (`client.ts:131-135`).
  - Refus possibles : `run_calls`, `run_credits`, `method_cap_unlisted`, `method_cap`, `cycle_cap` (`client.ts:107-121`).
  - Barème helius : 10 crédits pour `getTransactionsForAddress`, 1 pour `getSignaturesForAddress` et `getTransaction` (`tariff.ts:12-30`).
  - Barème chainstack : 2 RU pour les méthodes archivables Solana (`tariff.ts:54-57`, `:80-87`). `getTransactionsForAddress` n'y figure pas : le garde le refuse (`unknown_method`).
  - Plafonds de cycle : 8 000 000 crédits et 16 000 000 RU (`transport.ts:22-23`) ; délai de 30 s par tentative (`transport.ts:27`).
  - L'URL helius est le premier élément de `BELL_SOLANA_RPC` suivi de `?api-key=`, sans contrôle d'hôte (`transport.ts:93-99`).
  - Le rapprochement est fenêtré depuis la dernière ligne `reconciled` (`reconcile.ts:38-42`, `:57-66`). Le déverrouillage servi écrit une ligne chaînée `unlocked` (`lock.ts:39-44`, `cli.ts:38-44`).
  - Les 13 sources de `src/` ont les sha256 que la sonde épingle à `5b75cd2` (`probe-3.mjs:30-44`) : le garde n'a pas changé depuis la sonde.
- **Coût d'écriture du grand livre** : une ligne durable (la ligne, puis la tête par fichier temporaire et renommage) coûte p50 8,6 à 10,1 ms et en moyenne 14 à 24 ms sur un grand livre de 10 866 lignes, et l'écriture est synchrone (`docs/RUNBOOK-rpc-guard.md` §2 l.33-36, sha256 `ae0c283a…510c2e`).
- **Bell** :
  - `quorum2` (`apps/bell/src/quorum.ts:89-122`) ;
  - `withRetry` (`:135-163`) : reprise bornée des seules fautes transitoires, 4 essais, jamais sur une `BudgetExceededError`, une `RpcError` ou un 403 ;
  - `signaturesSetKey` (`:165-170`) ; `operatorOf` (`operators.ts:30-33`) ;
  - montage du garde et déverrouillage servi en `finally` (`collect.ts:710-719`, `:762-775`) ;
  - `getTransactionsForAddress` `full` paginé par `paginationToken` (`rebase-produce.ts:79-94`, `discover.ts:125-141`), tous deux à `limit: 1000`, comptés 10 crédits par appel (`rebase-crosscheck.ts:47-57`, `GTFA_PAGE_LIMIT = 1000` à `:65`).
- **Sonde** (`F:/PRODUITS/dojo-mirror/probe-3/probe-3.mjs`, sha256 `8d0a65a0…8da790`) :
  - formes `txp` et `a1Opts` (`:50-51`) ; liste fermée et plafonds (`:59-62`) ;
  - vue des clés `jsonParsed` avec tables (`:179-189`) ; soldes du mint par compte (`:190-199`) ; règle d'empreinte (`:287`) ;
  - formes de secrets et caviardage (`:159`, `:570`) ; refus d'écrire une sortie dans un dépôt (`:554`) ;
  - contrôle des verrous du répertoire de cycle et du répertoire canonique chainstack (`:549-552`) ;
  - transport simulé installé avant l'import du garde, avec pièges réseau (`:407`, `:421`, `:516`, `:595`), selon la technique de `packages/rpc-guard/test/harness.ts:37-45`.
- **Chaîne Bell** : `canonical` (`apps/bell/scripts/bell-chain.mjs:14-22`), `CLOSE_KEY` (`:24`), `assertNoCloseLike` (`:44-47`).

### 1.5 Écarts relevés

- **É-1 (FAITS l.17)** : le FAITS écrit « Plus récente : slot 450 528 736, `blockTime` 1 790 386 504 (2026-09-25T22:55:04Z) ». Or `new Date(1790386504000).toISOString()` rend `2026-09-26T01:35:04.000Z`, ce que confirment `derived.json` R4 (`per_day_utc["2026-09-26"] = 10`) et le corps C1 (même signature, même `blockTime`). Aucun chiffre de ce document ne dépend de l'heure écrite au FAITS. Item FAITS-PROBE3-L17-1.
- **É-2 (mère D-18, ordre dans un bloc)** : mère D-18 dit « un minimum sur un ensemble de soldes, indépendant de l'ordre des transactions d'un même bloc ».
  - C'est vrai pour un compte, dont les soldes après transaction sont absolus.
  - C'est faux pour une adresse dont deux comptes du mint sont touchés par deux transactions d'un même emplacement. Une vente sur X puis un achat sur Y donnent le chemin 100, 0, 100 ; l'ordre inverse donne 100, 200, 100 ; le minimum vaut 0 ou 100.
  - 2 937 emplacements sur 12 100 portent au moins deux signatures du mint (R-f).
  - Tranché par D-7 ; item ADR-SNAPSHOT-D18-ORDER-1.
- **É-3 (tarif de gTFA dans le garde)** :
  - Le garde compte 10 crédits par appel `getTransactionsForAddress`, quel que soit le nombre de corps rendus (`tariff.ts:13`, `:27`).
  - La page lue le 2026-09-26 facture le mode `full` « 10 credits per 100 returned transactions, rounded up » (H-4).
  - Bell appelle ce mode à `limit: 1000` (`rebase-produce.ts:84`, `discover.ts:131`) : une page pleine serait facturée jusqu'à 100 crédits pour 10 comptés.
  - Au 2026-09-26 01:46Z, le compteur `getTransactionsForAddress` du tableau de bord valait 3 690 280 crédits (FAITS l.29), contre 400 788 crédits comptés par le garde, toutes méthodes, depuis le 19/09 (FAITS l.30). Le début du cycle de facturation helius n'étant pas établi, cet écart ne mesure pas un sous-compte.
  - PR-2b s'en protège par `limit: 100` (D-9). L'écart de Bell devient un item formé, à trancher par mesure (GARDE-GTFA-FULL-TARIFF-1).
- **É-4 (mère, cinquième pli : « ≈ 4 900 corps » au pic)** : le taux d'échec moyen y est appliqué au jour de pic ; le recomptage donne 4 539 transactions réussies le 19/09 (R-e). Les plafonds de ce document ne déduisent aucun échec (D-10).
- **É-5 (mère §7 : PR-2b = 500 lignes)** : cette estimation précède la sonde. Ce G0 compte 1 787 lignes ascendantes (D-14), pour des postes que la sonde a rendus nécessaires : voie gTFA, pages par compte jusqu'au point fixe, rang et repli, fusion des index, reprise, garde ×10, contrôles (iii) à (vii), test d'intégration.
- **É-6 (mère §6 : méthodes « ajoutées à `DOJO_SOLANA_METHODS` »)** : `assertMethodCapsCover` exige qu'une course plafonne toutes les méthodes de sa liste (`bell-methods.ts:16-19`). Une liste commune obligerait la collecte quotidienne (PR-2) à plafonner des méthodes qu'elle n'envoie pas, et inversement. D-2 crée donc une liste propre à la course d'historique, dans le même module (précédent : la sonde, `probe-3.mjs:59`, `:600`).
- **É-7 (mère §11 : déclencheur de RECONCILE-WINDOW-1)** : l'ADR-mère le place « avant le G1 de PR-2b ». Son motif est le test `dojo_history_budget_stops_fail_closed`, que la coupe place dans PR-2b-3. D-13 propose donc « avant le G1 de PR-2b-3 » : PR-2b-1 et PR-2b-2 ne touchent ni le réseau ni le garde.
- **É-8 (mère D-18 : quorum des signatures)** : l'ADR-mère exige le « même ensemble de signatures par compte ». Or une signature listée par un seul index doit de toute façon être lue pour connaître les comptes qu'elle touche. D-4 l'admet si les deux corps concordent, et compte l'écart d'index. Ce raffinement est soumis au checkpoint-1 bref.

## 2. Décisions

### D-1 : périmètre

- **Dedans** :
  - lecture sous quorum de l'index des signatures du mint, des corps des transactions et des index par compte, fermés compris, jusqu'au point fixe ;
  - reconstruction des soldes par compte et par propriétaire ;
  - valeurs du jour de l'historique ;
  - contrôles (i) à (vii) ;
  - fichier de lignes, racine, manifeste et paquet hors dépôt ;
  - journal et reprise ;
  - contrôle préalable des plafonds (garde ×10, disque, verrous).
- **Dehors** :
  - la signature et la ligne `history` : PR-3a, publication de mère §6 ;
  - le service par l'hôte : PR-3b ;
  - le vérificateur de tiers : PR-1b-2 ;
  - la lecture de l'état du mint et l'énumération : PR-2, dont le paquet du premier jour lu est une entrée de ce lot ;
  - le point de départ public et le texte de méthode (mère P-35, DOJO-RETRO-TEXT-1) ;
  - tout appel vers l'opérateur sans clé.
- **Entrées fixes** :
  - le mint de `out/mint.txt` (sha256 `9b4e275a…decb`, épinglé par TU-3) ;
  - SIG0, son emplacement et son heure (§1.2), revérifiés à chaque exécution par D-8 (iv) ;
  - le paquet du premier jour lu de PR-2, haché dans le manifeste.

### D-2 : opérateurs, méthodes, formes fermées

| Phase | Opérateur | Méthode | Paramètres (liste fermée) | Coût au barème du garde |
|---|---|---|---|---|
| A | helius, chainstack | `getSignaturesForAddress` | `[MINT, {limit: 1000, commitment: "finalized"}]`, puis `[MINT, {limit: 1000, before: <dernière signature de la page précédente>, commitment: "finalized"}]` | 1 crédit ; 2 RU |
| B | helius | `getTransactionsForAddress` | `[MINT, {transactionDetails: "full", sortOrder: "asc", limit: 100, encoding: "jsonParsed", maxSupportedTransactionVersion: 1, commitment: "finalized"}]`, puis avec `paginationToken` | 10 crédits |
| B, C | chainstack ; helius (compléments) | `getTransaction` | `[signature, {encoding: "jsonParsed", maxSupportedTransactionVersion: 1, commitment: "finalized"}]` | 2 RU ; 1 crédit |
| C | helius, chainstack | `getSignaturesForAddress` | comme en A, sur un compte de jetons du mint | 1 crédit ; 2 RU |

- **Liste de méthodes** : `DOJO_HISTORY_METHODS = ["getSignaturesForAddress", "getTransaction", "getTransactionsForAddress"]`, couverte par `assertMethodCapsCover(methodCaps, DOJO_HISTORY_METHODS, "dojo/history")` avant `openGuardedClient` (É-6).
- **Ouverture du client** : `openGuardedClient` reçoit `cycles = {helius, chainstack}` seulement et `{network: "solana-mainnet"}` (précédents `collect.ts:719`, `probe-3.mjs:604`). L'opérateur sans clé n'est ni ouvert, ni verrouillé, ni appelé.
- **`maxSupportedTransactionVersion: 1`** : les valeurs documentées sont 0 et 1 (H-2). Le `2` de Bell (`apps/bell/src/rpc.ts:35`) n'est pas repris (BELL-TX-VERSION-1).
- **`commitment: "finalized"`** est passé explicitement aux trois méthodes. C'est le défaut documenté (H-1, H-2, H-4), mais la sonde ne l'a pas passé : les premiers appels du premier acte éprouvent la forme explicite (Q-12). Une `RpcError` de paramètres arrête la collecte sans donnée.
- **Statut de confirmation** : toute entrée de page doit porter `confirmationStatus: "finalized"`, ce que font toutes les entrées relevées (R-a). Toute autre valeur rend la signature contestée (D-4).
- **`limit: 100` pour gTFA** : à ce `limit`, la facturation lue (H-4) ne dépasse pas 10 crédits par appel, soit le compte du garde. Le collecteur refuse tout `limit` supérieur avant l'appel (mutant M-Y21).
- **Aucun `filters`** (pli, C-25) : la forme fermée de gTFA ne passe aucun `filters`, donc aucun `filters.status`, dont le défaut est `any` (FAITS cp1d L-1) : les pages rendent aussi les transactions en échec (Q-18).

### D-3 : algorithme (pseudo-code déterministe)

```
ENTRÉES (toutes hachées dans le manifeste ou le journal)
  MINT        ← out/mint.txt (TU-3)
  SIG0, SLOT0 ← §1.2, revérifiés par (iv)
  B1R         ← paquet du premier jour lu (PR-2) : first_read_day ; pour chaque réponse d'énumération de la première lecture
                qui en porte deux : E_e = context.slot et la liste (compte, propriétaire, montant) ; réponse jsonParsed du mint
  DAY1        = 2026-09-10 (1 788 998 400 / 86 400 = 20 706, probe-3.mjs:54) ; jour(t) = floor(blockTime(t) / 86 400)
  D_LAST      = first_read_day − 1 ; S_CUT = max_e E_e
  OPS         = (helius, chainstack), dans cet ordre ; jamais solana-foundation

PHASE A — index du mint (mère D-18 (a))
  pour op dans OPS :
    before ← ∅
    répéter :
      page ← appel(op, getSignaturesForAddress, [MINT, {limit: 1000, before?, commitment: "finalized"}])
      journal(A, op, page) ; IDX[op][MINT] ← IDX[op][MINT] ∪ page
      si |page| < 1000 : exiger que la plus ancienne entrée de IDX[op][MINT] soit SIG0 (page vide comprise),
                         sinon ARRÊT(creation_mismatch) ; sortir
      before ← dernière(page).signature
  (R, F, X) ← fusion(IDX[helius][MINT], IDX[chainstack][MINT], S_CUT)      # D-4

PHASE B — corps (mère D-18 (c))
  helius : pages gTFA [MINT, {transactionDetails: "full", sortOrder: "asc", limit: 100, encoding: "jsonParsed",
           maxSupportedTransactionVersion: 1, commitment: "finalized", paginationToken?}] depuis le début de l'historique,
           jusqu'à la première page dont le dernier corps a slot > S_CUT, ou un jeton absent ou vide, ou une page vide ;
           corps rangés par transaction.signatures[0] ; cohérence sur R contrôlée (D-9 ; pli, C-25)
  chainstack : pour s ∈ R, dans l'ordre (slot, signature) : getTransaction [s, {encoding: "jsonParsed",
           maxSupportedTransactionVersion: 1, commitment: "finalized"}]
  helius, compléments : pour s ∈ R absent des pages gTFA : getTransaction (même forme)
  toute faute transitoire : withRetry (quorum.ts:150-163), chaque essai étant un appel compté par le garde
  pour s ∈ R : ADMISSION(s) ← quorum_corps(corps[helius][s], corps[chainstack][s])      # D-5, D-6

PHASE C — pages par compte, fermés compris, jusqu'au point fixe (mère D-18 (b))
  COMPTES ← {compte des entrées du mint dans pre/postTokenBalances de tout corps lu, admis ou non, d'un opérateur ou de l'autre}
  CLOS ← ∅
  tant que COMPTES ∖ CLOS ≠ ∅ :
    a ← plus petit compte de COMPTES ∖ CLOS en ordre d'octets
    pour op dans OPS : paginer getSignaturesForAddress [a, {limit: 1000, before?, commitment: "finalized"}]
                       jusqu'à une page de moins de 1 000 entrées
    (R_a, F_a, X_a) ← fusion(IDX[helius][a], IDX[chainstack][a], S_CUT)
    NOUVEAUX ← R_a ∖ (R ∪ F) ; lire leurs corps chez les deux opérateurs (getTransaction) ; ADMISSION de chacun
    COMPTES ← COMPTES ∪ {comptes du mint vus dans ces corps} ; R ← R ∪ NOUVEAUX ; F ← F ∪ F_a ; X ← X + X_a
    CLOS ← CLOS ∪ {a}                                                        # unité de reprise (D-11)

PHASE D — reconstruction (pure, mère D-18 (d))
  T ← transactions ADMISES de slot ≤ S_CUT ; rang(t) = transactionIndex s'il est présent et égal chez les deux, sinon ∅
  emplacement s « ordonné » ⇔ toute t ∈ T de slot s porte un rang                        # D-7
  pour chaque compte a, ses transactions dans l'ordre (slot, rang), ou, dans un emplacement non ordonné, dans un ordre qui enchaîne :
    B_a ← 0 ; P_a ← ∅
    pour chaque t : exiger pre_a(t) = B_a et (B_a = 0 ou propriétaire_pre_a(t) = P_a),
                    sauf si une transaction sans quorum sur a s'intercale (fenêtre ouverte, D-6), sinon ARRÊT(chain_break)
                    B_a ← post_a(t) (0 si a est absent de post) ; P_a ← propriétaire_post_a(t)
  δ_O(t) = Σ montants des entrées post du mint de propriétaire O − Σ montants des entrées pre du mint de propriétaire O
  pour chaque propriétaire O et chaque emplacement s qui le touche, B_O(avant s) étant connu :
    s ordonné     : CAND_O(s) ← {B_O après chaque t de s touchant O, dans l'ordre des rangs}
    s non ordonné : CAND_O(s) ← {B_O(avant s) + Σ_{t ∈ s} min(δ_O(t), 0) ,  B_O(avant s) + Σ_{t ∈ s} δ_O(t)}
    B_O(après s)  ← B_O(avant s) + Σ_{t ∈ s} δ_O(t)
  pour d de DAY1 à D_LAST :
    si l'un des comptes de O ce jour-là est dans une fenêtre sans quorum couvrant d : m_d(O) ← null      # mère C-9, D-6
    sinon : m_d(O) ← min({B_O(début de d)} ∪ ⋃_{s : jour(s) = d} CAND_O(s)) ; B_O(début de DAY1) = 0, donc m_DAY1(O) = 0
  classe(O) ← ownerClass(O)                                                   # PR-1a, mère D-6

PHASE E — contrôles (i) à (vii) (D-8) ; tout échec : ARRÊT, statut partial, aucun publish/
PHASE F — paquet (D-12) : lignes {day, address, class, day_value} selon la règle d'existence ; tri (day, address en octets) ;
          canonical ; LF ; sha256 ; racine (PR-1a) ; manifeste ; SHA256SUMS
```

- **Les « comptes de O ce jour-là »** : les comptes dont O est propriétaire à un instant du jour d, selon les entrées admises, ainsi que ceux qu'un corps sans quorum nomme avec le propriétaire O.
- **Déterminisme** :
  - La sortie de `publish/` est une fonction des seuls corps admis et des entrées fixes.
  - L'ordre d'achèvement des appels concurrents ne change aucun octet : les réponses sont rangées par signature ou par compte, et les ensembles sont triés avant tout calcul.
  - Un rejeu hors ligne sur l'évidence rend `publish/` à l'octet près.

### D-4 : quorum des signatures (index)

`fusion(I_h, I_c, S_CUT)` prend chaque signature s de `I_h ∪ I_c` d'emplacement au plus S_CUT, d'un index ou de l'autre, et la classe ainsi :

| Cas | Classement | Lecture des corps |
|---|---|---|
| s dans les deux index ; `slot`, `blockTime` et le caractère nul de `err` égaux ; `err` nul ; `confirmationStatus` = `"finalized"` | réussie concordante, ajoutée à R | les deux opérateurs |
| s dans les deux index ; mêmes champs ; `err` non nul chez les deux ; `confirmationStatus` = `"finalized"` | échec concordant, ajouté à F | **aucune** : exclue avant toute lecture de corps (mère D-18, 24,2 %) |
| s dans un seul index, ou champs différents, ou statut autre que `finalized` | contestée, ajoutée à R, X ← X + 1 | les deux opérateurs ; le quorum des corps (D-5) décide |

- **Motif** : une signature contestée doit être lue pour connaître les comptes qu'elle touche, et la lire chez les deux opérateurs ne coûte qu'un appel de plus. Si ses deux corps concordent, les deux opérateurs servent la même transaction : l'admettre est sûr (É-8). Un opérateur qui invente une signature n'obtient pas de corps de l'autre et la transaction reste sans quorum ; un opérateur qui en omet une n'efface rien.
- **Clé de l'index** : elle exclut `transactionIndex`, absent des pages récentes de chainstack (R-a).
- **Bornes** : `X / |R|` et le nombre de transactions sans quorum ont des bornes déclarées au G1 de PR-2b-1 et consignées dans l'évidence. Leur dépassement arrête la collecte (D-8 (vii)).

### D-5 : quorum des corps (clé de lecture)

```
clé(corps) = sha256(canonical({
  signature : transaction.signatures[0],  slot,  blockTime,  err : meta.err,
  rang      : transactionIndex            # comparé seulement s'il est présent dans les deux corps
  mint      : [{compte, côté: "pre" | "post", propriétaire, montant, programme}
               pour chaque entrée de pre/postTokenBalances de mint = MINT, compte = accountKeys[accountIndex].pubkey,
               triée par (côté, compte)],
  offre     : [{type, montant} pour chaque instruction Token-2022 analysée, externe ou interne, de type mintTo,
               mintToChecked, burn ou burnChecked, portant info.mint = MINT, dans l'ordre des positions],
  types     : [types uniques et triés des instructions Token-2022 portant sur MINT ou sur l'un de ses comptes]
}))
```

- **Résolution des comptes** : un compte se résout par `accountKeys` en `jsonParsed`, qui liste les clés chargées par table avec `source: "lookupTable"`, sinon par les clés statiques suivies de `meta.loadedAddresses` (`probe-3.mjs:179-189`). Les entrées des autres mints sont ignorées (R-c).
- **Admission** : deux corps non nuls de même clé, avec `err = null`, donnent une transaction ADMISE. Deux corps de même clé avec `err ≠ null` donnent un échec concordant : exclu, sans effet sur les soldes, compté.
- **Rang** : présent dans un seul corps, il sort de la clé et la transaction n'a pas de rang. Présent dans les deux mais différent, il rend la clé différente, donc la transaction sans quorum (D-6).
- **Égalité du corps entier** : le sha256 canonique du corps entier est aussi comparé et compté dans l'évidence, sans décider de l'admission. Il est égal sur l'échantillon (R-b), mais un champ sans effet sur les soldes pourrait différer d'un opérateur à l'autre.
- **Propriétaire absent** : si `owner` manque d'une entrée du mint dans les deux corps (H-2b), le propriétaire vient du dernier propriétaire admis du compte ou de l'`initializeAccount*` admis qui l'a créé. À défaut, la collecte s'arrête.

### D-6 : transaction sans quorum

| Cas, après les reprises de `withRetry` | Comptes touchés | Suite |
|---|---|---|
| deux corps, clés différentes | union des entrées du mint des deux corps | fenêtre sans quorum ; ARRÊT si l'un des corps porte une instruction d'offre sur MINT |
| un corps, l'autre en faute ou `null` | entrées du mint du corps lu | fenêtre sans quorum ; ARRÊT si ce corps porte une instruction d'offre sur MINT |
| aucun corps (deux fautes) | inconnus | ARRÊT : les comptes à marquer sont inconnus |
| deux `null` pour une signature listée | — | ARRÊT : incohérence d'index (mère T-22) |

- **Fenêtre** :
  - Pour chaque compte a touché, la fenêtre va de `jour(s)` à `jour(t')` inclus, où t' est la première transaction admise touchant a après s. `jour(s)` est le plus petit des jours lus pour s, par l'index ou par un corps.
  - Pendant la fenêtre, tout propriétaire de a a `m_d = null` : ni contribution, ni remise à zéro (mère D-18 ; mère C-9 pour l'adresse). Ce sont le dernier propriétaire admis et tout propriétaire qu'un corps nomme.
  - Si aucune transaction admise ne touche a avant S_CUT, la fenêtre court jusqu'à D_LAST et le contrôle (ii) n'est pas vérifiable pour a : ARRÊT.
- **Motif de l'arrêt sur l'offre** : une frappe ou un brûlage inconnu fausserait le contrôle (i) sans qu'un jour manquant le signale.

### D-7 : valeur du jour ; ordre dans un emplacement ; jour 1

- **Règle** : m_d(O) est le minimum de l'ensemble formé du solde de O au début du jour d et des candidats de chaque emplacement du jour d qui le touche (mère P-34). Le solde au début de DAY1 est 0, donc m_DAY1(O) = 0 pour toute adresse (mère D-18 ; M8 (E2)). Un achat dans le jour fait valoir au jour le solde d'avant, et le lot naît le lendemain (M8 (E1)).
- **Emplacement ordonné** : toutes les transactions admises de l'emplacement portent un rang concordant. Les candidats d'une adresse sont alors ses soldes exacts après chacune de ses transactions, dans l'ordre des rangs. Pour une adresse à un seul compte, cet ensemble ne dépend pas de l'ordre.
- **Emplacement non ordonné** : il suffit qu'une transaction admise n'ait pas de rang. Pour **toutes** les adresses touchées, les candidats sont L_s(O) = B_O(avant s) + Σ_t min(δ_O(t), 0) et B_O(après s).
  - L_s est une borne basse : aucun ordre ne descend plus bas. Elle n'est donc jamais au-dessus du vrai minimum, et un ordre inconnu ne peut rien gagner.
  - Elle est sur-additive. Comme min(x + y, 0) ≥ min(x, 0) + min(y, 0), L_s(O) ≥ Σ_i L_s(O_i) pour tout découpage de O en adresses O_i.
  - La preuve d'invariance au fractionnement de mère D-16 (minimum sur des instants communs, M8) s'étend donc aux emplacements non ordonnés, **pourvu que la règle s'applique à l'emplacement et non à l'adresse**. La mesure M-H1 (R-j) le vérifie (0 violation) et montre que la règle appliquée par adresse viole (899 configurations).
- **Mesures (R-a, R-f)** : tous les corps lus portent un rang et le rang ordonne strictement les 2 937 emplacements partagés de l'index helius. Le repli est donc une défense : le collecteur compte les emplacements non ordonnés (Q-1).
- **Alternatives rejetées** :
  - marquer ces emplacements comme jours manquants : un jour manquant ne remet rien à zéro, et une vente faite dans un tel emplacement cacherait sa baisse (pli : contraire à mère P-29 bis, décision 228, une part vendue perd ses points) ;
  - prendre l'ordre le plus favorable : on pourrait viser un ordre, vente d'abord ;
  - lire l'ordre sur un seul opérateur : ce ne serait plus un quorum (mutant M-Y14).
- **Information de l'investisseur et déclencheur d'escalade** (pli ; rapport du checkpoint-1 bref §6 ; information et recommandation, aucune décision nouvelle) : dans un emplacement non ordonné (0 cas sur les 2 937 emplacements partagés relevés, R-f), un détenteur touché peut perdre jusqu'à la somme des baisses de l'emplacement : une vente puis un rachat dans le même bloc sur deux comptes compteraient comme la vente seule. Recommandation : garder la borne basse ; `null` est rejeté parce qu'il cacherait une baisse (mère P-29 bis, décision 228). Déclencheur d'escalade : compteur Q-1 non nul à l'acte 1 **et** un détenteur touché ⇒ effet mesuré présenté à l'investisseur **avant** toute publication, le fichier publié étant immuable. Une préférence de l'investisseur pour `null` serait une décision nouvelle, portée par une ligne datée.

### D-8 : contrôles de cohérence (mère T-22) et arrêt

| Contrôle | Règle | Échec |
|---|---|---|
| (i) offre | pour chaque t admise, Σ_a (post_a − pre_a) sur le mint = Σ frappes − Σ brûlages de t ; pour chaque jour d où aucun compte n'est dans une fenêtre sans quorum à la fin du jour, Σ_a B_a(fin de d) = offre(fin de d), l'offre partant de 0 avant SIG0 ; D_LAST doit être évaluable ; une frappe après SIG0 est une incohérence, car l'autorité de frappe est retirée à la création (R-d) | ARRÊT |
| (ii) énumération | pour chaque réponse e de la première énumération (B1R) : pour tout compte connu de la reconstruction ou de e, solde reconstruit à l'emplacement E_e (transactions de slot ≤ E_e) = montant de e (0 si absent de e, mère C-1), propriétaires égaux ; aucune fenêtre sans quorum ouverte à E_e | ARRÊT |
| (iii) chaînage | pour chaque compte, pre(t) = post de la transaction admise précédente (0 avant la première), propriétaire compris, hors fenêtre sans quorum ; dans un emplacement non ordonné, il doit exister un ordre qui enchaîne (chemin sur le multigraphe pre → post) | ARRÊT |
| (iv) création | SIG0 est la dernière entrée des deux index du mint ; son corps admis porte `initializeMint2` de MINT, 6 décimales, et la frappe de 10^15 unités de base (R2) | ARRÊT |
| (v) jours | `blockTime` non nul ; `jour` non décroissant en ordre d'emplacement ; un seul `blockTime` par emplacement (R-e : 0 exception sur 23 628) | ARRÊT |
| (vi) instructions | les types Token-2022 portant sur MINT ou ses comptes appartiennent à la liste fermée : types vus dans les corps de la sonde (R-c, R-d : `initializeMetadataPointer`, `initializeMint2`, `getAccountDataSize`, `initializeImmutableOwner`, `initializeAccount3`, `initializeTokenMetadata`, `updateTokenMetadataAuthority`, `mintTo`, `setAuthority`, `transferChecked`) et types nommés par H-3 ou par l'ADR-mère (`transfer`, `closeAccount`, `burn`, `burnChecked`, `mintToChecked`) ; tout autre type, ou une instruction Token-2022 non analysée, est consigné, et une ligne datée étend la liste. SIG0 passe (vi) : ses neuf instructions Token-2022 sont analysées, et l'instruction non analysée que note FAITS l.15 (inner[1][14]) relève du programme de lancement `6EF8…F6P`, non de Token-2022 (relevé `sig0-unparsed.mjs`) | ARRÊT |
| (vii) bornes | écarts d'index X, transactions sans quorum, emplacements non ordonnés et corps en échec des pages gTFA avec pre ≠ post sur le mint (Q-6), si les pages les rendent (compteur des corps en échec rendus, consigné ; Q-18 ; pli, C-25) : bornes déclarées au G1 de PR-2b-1 ; la borne de X, rapportée à la taille de R, est un chiffre sans source jusqu'à ce G1, où sa justification est due ; tout X > 0 est consigné dans le FAITS de l'acte, borne franchie ou non (pli, É-8) | ARRÊT au-delà |

- **Effet de l'arrêt** : aucun contrôle en échec n'est corrigé en ligne. L'arrêt laisse le statut `partial` avec son motif (D-11). Une correction de l'historique après publication exige une nouvelle ancre (mère D-18).
- **Transactions en échec** (conditionnel depuis le pli, C-25) : le contrôle (vii) sur les corps en échec vient d'une propriété de la voie gTFA, **si** ses pages rendent aussi les transactions en échec : c'est le cas au niveau documentaire, `filters.status` valant `any` par défaut et D-2 n'en passant aucun (FAITS cp1d L-1 ; Q-18), à confirmer par la première page de l'acte 0 (§7). Elles coûtent alors 0,1 crédit par corps à `limit: 100`, et leur égalité pre = post sur le mint teste l'hypothèse qui exclut ces transactions avant lecture (Q-6). Un compteur consigne le nombre de corps en échec rendus par les pages ; ces corps ne servent à rien d'autre.

### D-9 : corps helius par `getTransactionsForAddress`

- **Choix du G0 (cinquième pli)** : les corps helius des transactions du mint viennent des pages gTFA de 100 corps. `getTransaction` helius ne sert qu'aux compléments : corps absents des pages, signatures contestées, nouveaux corps de la phase C. Motifs :
  - 10 fois moins de crédits au barème : 0,1 crédit par corps au lieu de 1. La marge de cycle que doit tenir la garde ×10 tombe de 1 294 700 à 130 700 crédits pour J = 20 (§5).
  - Cent fois moins d'appels, donc cent fois moins de lignes durables au grand livre (§1.4).
  - Le corps gTFA est canoniquement égal au corps `getTransaction` (R-b).
  - La voie existe déjà dans Bell (`rebase-produce.ts:79-94`).
- **`limit: 100`, jamais plus** : sinon le compte du garde, 10 par appel, passerait sous la facturation lue (É-3).
- **Cohérence des deux sources helius** (réécrite au pli, C-25) : c'est un opérateur, pas un quorum. Elle s'écrit sur R (réussies et contestées, D-4), jamais sur F, pour les signatures d'emplacement au plus S_CUT : toute signature de R absente des pages gTFA est lue par `getTransaction` ; toute signature des pages absente de l'index est contestée ; une signature de F présente ou absente des pages n'est jamais demandée. Les écarts sont comptés (Q-11).
- **Rejeté** :
  - `getTransaction` helius pour tous les corps : 10 fois le coût au barème, 100 fois les appels (§5) ;
  - le filtre `status` de gTFA : lu au pli (FAITS cp1d L-1 : défaut `any`, valeurs `succeeded`, `failed` et `any`) ; D-2 n'en passe aucun, et les pages rendent donc les échecs, dont (vii) se sert (Q-18).

### D-10 : plafonds, garde ×10, débit

- **Notation** :
  - J = nombre de jours UTC du 2026-09-10 au jour de l'exécution, bornes comprises (la sonde : J = 17).
  - S(J) = 6 467 × J : borne haute des signatures du mint, soit le pic du 19/09 sans déduction des échecs (`derived.json` R4).
  - p(x, L) = ⌊x / L⌋ + 1 : pages pour x entrées à L par page, page terminale comprise. Pour N = 23 628, p = 24, comme A2.
- **Acte 0** (pli, C-26 ; §7, point 5 ; Q-F tranchée par l'orchestrateur, R-21, 2026-09-26) : helius, une page gTFA (10 crédits au barème), une page `getSignaturesForAddress` (1 crédit) et un `getTransaction(SIG0)` (1 crédit) ; chainstack, une page `getSignaturesForAddress` (2 RU) et un `getTransaction(SIG0)` (2 RU). Plafonds de course : 12 crédits helius et 4 RU chainstack, au plus quatre appels par opérateur, marge de reprise 0 (tout dépassement est un arrêt) ; garde ×10 comme ci-dessous.
- **Acte 1 (phases A et B)** :
  - helius : `runCaps.helius` = p(S, 1 000) + 10 × p(S, 100) + c_h, où c_h est le nombre de compléments `getTransaction` déclaré au go (aucun sur l'échantillon).
  - chainstack : `runCaps.chainstack` = 2 × (p(S, 1 000) + S).
  - `methodCaps` : `getSignaturesForAddress` ≥ p(S, 1 000) ; `getTransactionsForAddress` ≥ p(S, 100) ; `getTransaction` ≥ S. Le plafond est compté séparément par opérateur, `client.ts:92`.
  - `maxCalls` = 2 × p(S, 1 000) + p(S, 100) + S + c_h, plus une marge de reprise r déclarée au go. Les reprises de `withRetry` sont des appels comptés, mesurés par l'essai à blanc et par le premier acte.
- **Acte 2 (phase C, puis D à F)** : les nombres n_acc de comptes découverts et Σ c_a d'incidences admises sont lus dans l'exécution de l'acte 1.
  - Pages par opérateur ≤ n_acc + ⌈2 × Σ c_a / 1 000⌉. La marge ×2 sur les incidences couvre les transactions en échec, qui figurent aussi dans les listes par compte : leur part mesurée est 24,2 %, soit un facteur 1 / (1 − 0,242) ≈ 1,32 < 2.
  - Corps nouveaux : c_n, déclaré au go (R8 : aucun sur l'échantillon).
  - `runCaps.helius` = pages + c_n ; `runCaps.chainstack` = 2 × (pages + c_n).
- **Garde ×10 (C-22), contrôlée par le collecteur avant `openGuardedClient`, donc avant tout verrou** :
  - helius : `cycleFloor.helius` + 10 × `runCaps.helius` ≤ 8 000 000 (`transport.ts:22`), sinon refus.
  - chainstack : `cycleFloor.chainstack` + `runCaps.chainstack` ≤ 16 000 000 (`transport.ts:23`), sans facteur 10 : le barème lu (H-5) plafonne une requête à 2 RU, et le garde compte ce plafond.
  - Les planchers sont les relevés du tableau de bord du jour de l'acte, strictement positifs, comme pour la sonde (`probe-3.mjs:546`).
  - Le garde refuse de lui-même tout appel qui dépasserait un plafond de course ou de cycle au barème (`client.ts:113-118`).
- **Débit** :
  - Les écritures du grand livre sont synchrones et bornent le débit par le bas. Il y a ≈ 130 900 appels pour J = 20 et ≈ 261 800 pour J = 40 ; à 14 à 24 ms par ligne, cela fait 0,51 à 0,87 h et 1,02 à 1,75 h d'écriture.
  - En série, les corps chainstack coûteraient 4,9 à 34,7 h (J = 20) et 9,8 à 69,4 h (J = 40), aux latences de R-h.
  - La concurrence est donc bornée par un paramètre déclaré au G1 de PR-2b-3, fixé par l'essai à blanc et par les limites de plan lues sur place (DOJO-HISTORY-THROUGHPUT-1, Q-4).
- **Disque** : l'évidence brute compte S corps par opérateur. Aux tailles de R-h, c'est 3,55 à 9,40 Go non compressés pour J = 20 et 7,09 à 18,80 Go pour J = 40 ; compressés au rapport de R-g, ≈ 0,7 à 1,8 Go et ≈ 1,4 à 3,6 Go. Le collecteur refuse de partir si l'espace libre du volume de sortie est inférieur à deux fois la borne compressée (Q-5).

### D-11 : arrêt fail-closed et reprise

- **Arrêt sur plafond** : une `BudgetExceededError` (`run_calls`, `run_credits`, `method_cap`, `cycle_cap`) ou un refus du garde arrête la course sans appel de plus.
  - Les appels déjà en vol s'achèvent et sont journalisés.
  - Le collecteur écrit l'exécution (`evidence/runs/<stamp>/run.json` : plafonds, dépense par opérateur, motif, horloge) et le statut `partial` avec son motif.
  - Il n'écrit rien sous `publish/`.
  - Il déverrouille chaque opérateur par l'`unlock` servi en `finally` (`collect.ts:762-775`), puis consigne le sha256 de chaque ligne `unlocked`, fin de course au sens de RECONCILE-WINDOW-1.
  - Code de sortie non nul.
- **Arrêt sur durée** (pli, C-27) : une course bornée en durée (paramètre déclaré, §7 point 4) s'arrête à sa borne comme sur un plafond : aucun appel de plus, statut `partial` avec son motif, `unlock` servi ; la course suivante repart par la reprise décrite ci-dessous.
- **Arrêt sur contrôle** : même chose, motif nommé : `creation_mismatch`, `chain_break`, `supply_mismatch`, `enumeration_mismatch`, `no_quorum_unbounded`, `instruction_not_allowed`, `day_not_monotone`, `bound_exceeded`.
- **Journal** : `evidence/journal.jsonl`, en ajout seul. Chaque ligne porte son `seq`, le sha256 de la ligne précédente, la phase, l'opérateur, l'unité, la méthode, le sha256 des paramètres, le chemin et le sha256 non compressé de la réponse brute, sa taille et son issue. L'écriture est durable (ouvrir, écrire, `fsync`, fermer ; calque déclaré de `ledger.ts:56-59`, non exporté par le garde). La première ligne fixe les entrées : sha256 du paquet B1R, S_CUT, D_LAST, sha256 de `out/mint.txt`, sha256 des sources du collecteur.
- **Unités closes** :
  - phase A : une page d'un opérateur, avec son `before` ;
  - phase B : une page gTFA, avec son `paginationToken`, ou un corps (signature, opérateur) ;
  - phase C : un compte entier, clos seulement quand ses pages chez les deux opérateurs sont lues jusqu'à la page courte, fusionnées, et que ses nouveaux corps sont lus.
- **Reprise (nouvel acte, nouveau go, nouveaux plafonds)** :
  1. Le collecteur relit et vérifie la chaîne du journal. Il vérifie que chaque réponse brute citée existe et a le sha256 annoncé, sinon ARRÊT (`evidence_corrupt`).
  2. Il exige les mêmes entrées fixes, sinon ARRÊT : une reprise ne change pas la fenêtre.
  3. Il reconstruit l'état depuis les réponses brutes, jamais depuis une mémoire de processus.
  4. Il reprend :
     - la phase A au `before` de la dernière page close de chaque opérateur ;
     - la phase B au dernier `paginationToken` clos, et aux corps non clos ;
     - la phase C au plus petit compte non clos, **depuis sa première page** : les pages d'un compte non clos sont écartées. C'est « le dernier compte complet » de la consigne.
- **État repris** : l'union des unités closes (index, corps, comptes). La dépense cumulée est la somme des fenêtres de course du grand livre, consignée par exécution.

### D-12 : paquet d'historique

```
F:/PRODUITS/dojo-mirror/history/<AAAA-MM-JJ>/          # date UTC de la première exécution ; jamais écrasé ; hors de tout dépôt (probe-3.mjs:554)
  publish/                                            # écrit seulement au statut complete, en dernier ; lu par l'éditeur (PR-3a)
    history/<sha256>.jsonl                            # lignes canoniques, une par (jour, adresse), LF final
    manifest.json                                     # clés fermées ci-dessous
    SHA256SUMS                                        # des deux fichiers précédents, écrit en dernier
  evidence/                                           # interne, jamais copié vers l'hôte ; peut nommer les opérateurs
    journal.jsonl
    raw/<phase>/<opérateur>/<sha256>.json.gz          # réponse brute compressée, nom = sha256 non compressé, écrite en création exclusive
    runs/<stamp>/run.json  runs/<stamp>/checks.json  runs/<stamp>/SHA256SUMS
    status.json                                       # {status: "partial" | "complete", stop_reason}
```

- **Ligne** : `canonical({address, class, day, day_value})` de Bell (clés triées).
  - `day` : date UTC `AAAA-MM-JJ` ; son ordre lexical est chronologique.
  - `address` : le propriétaire, en base58.
  - `class` : `"holder"` ou `"program"`.
  - `day_value` : entier décimal en chaîne, en unités de base, ou `null` pour un jour manquant.
  - Les lignes sont triées par `day`, puis par `address` en ordre d'octets ; chacune se termine par LF.
  - Le nom du fichier est son sha256 ; la racine est l'arbre de mère D-7 sur les lignes sans LF.
- **Règle d'existence**, calque de mère D-7 (M-2) : la ligne (O, d) existe ssi m_d(O) = `null`, ou m_d(O) > 0, ou la dernière valeur définie de O avant d est > 0.
  - Le jour de sortie a donc sa ligne « 0 ». Le lendemain, l'adresse n'a plus de ligne tant qu'elle ne rentre pas.
  - Une adresse à pile non vide a une ligne chaque jour, `null` compris. Le vérificateur peut donc tenir les lots du jour 1 au dernier jour de l'historique (mère D-10, `history_transition_mismatch`).
- **Manifeste** : clés fermées, passées à `assertNoCloseLike` (R-i).
  - Identité : `schema` (`"dojo-history-bundle-v1"`), `status` (`"complete"`), `mint`, `program`, `decimals`.
  - Fenêtre : `history_first_day` (`"2026-09-10"`), `history_last_day`, `sig0`, `sig0_slot`, `window_slot_max`, `first_read_day`, `enumeration_slots` (les E_e triés, sans libellé).
  - Fichier : `history_sha256`, `history_lines_count`, `history_root`.
  - Comptes : `transactions_admitted`, `transactions_failed_excluded`, `transactions_without_quorum`, `token_accounts`, `addresses`, `missing_address_days`.
  - Contrôles : `supply_check`, `enumeration_check`, `chain_check` (chacun `"pass"`).
  - Liens : `collector_sha256` (des sources du collecteur) et `evidence_sha256sums_sha256` (lien vers l'évidence de l'exécution finale).
- **Sans libellé ni secret** : `publish/` ne porte aucun libellé d'opérateur, aucune URL, aucune forme de clé. C'est le calque de `dojo_bundle_carries_no_operator_label_and_no_secret` (mère §6, PR-2). Tout fichier de l'évidence passe le caviardage des formes de secret (`probe-3.mjs:159`, `:570`). Une seule forme trouvée dans `publish/` arrête le collecteur.
- **Remise à l'éditeur (PR-3a)** : l'éditeur ne lit que `publish/`. Il refuse un paquet dont le `SHA256SUMS` ne vérifie pas, dont le statut n'est pas `complete`, dont les lignes ne sont pas canoniques et triées, ou dont la racine recomputée diffère. Ces refus relèvent de la mission de PR-3a ; l'exigence lui est transmise par la ligne TU-12c du §3.

### D-13 : dépendances de gates

- **RECONCILE-WINDOW-1 (avant le G1 de PR-2b-3 ; É-7)**. Aujourd'hui, la fenêtre du rapprochement commence après la dernière ligne `reconciled` (`reconcile.ts:38-42`), c'est-à-dire, sans rapprochement antérieur, au début du cycle. D'où le NO-GO doux de la sonde : 79 303 lignes, 400 788 crédits, contre un delta de 39 (FAITS l.30). Changement, dans un lot rpc-guard distinct (amendement daté de ADR-GARDE-HELIUS-client-budgete-unique) :
  1. `runReconcile` (`reconcile.ts:68`) gagne un paramètre optionnel `window`. Absent, le comportement actuel reste octet pour octet. Avec `{courseEnd: <entry_sha256>}`, la fenêtre est formée des lignes `attempted` situées strictement après la dernière ligne `reconciled` ou `unlocked` qui précède la ligne désignée, et strictement avant celle-ci. La ligne désignée doit exister dans le cycle et porter `outcome: "unlocked"`, sinon NO-GO `course_end_unknown`, raison nouvelle, fail-closed. `repairedInWindow` (`:48-55`) prend la même borne de début. Les limites « hard » par méthode et la bande « soft » (`:77-111`) ne changent pas.
  2. La ligne `reconciled` d'un rapprochement de course porte une raison préfixée `course:<entry_sha256>`. Le mode actuel ne la prend pas pour borne : un rapprochement de course ne ferme donc pas la fenêtre d'une course Bell non rapprochée. Les grands livres existants n'ont aucune ligne de ce type ; leur comportement ne change pas.
  3. `cli.ts` (`:24-37`) gagne le drapeau optionnel `--course-end <sha256>` ; sans lui, rien ne change. `bin/rpc-guard.mjs` transmet déjà les drapeaux. La sous-commande `unlock` (`:38-44`) rend aussi, dans son résultat, le sha256 de la ligne `unlocked` qu'il écrit. Aujourd'hui il ne rend que `{exitCode: 0}` (`:43`), et la course devrait sinon relire la tête du grand livre.
  4. Tests :
     - `reconcile_course_window_isolates_one_course` : une course non rapprochée, puis une course bornée, donnent GO quand le delta égale le compte de la course, alors que le mode actuel rend NO-GO soft sur le même grand livre. C'est le cas de FAITS l.30.
     - `reconcile_course_end_must_be_an_unlocked_line`.
     - `reconcile_course_line_is_not_a_legacy_boundary`.
     - Les tests existants restent inchangés.
  5. Mutants : fenêtre qui déborde sur la course précédente ; `courseEnd` accepté sur une ligne autre que `unlocked` ; ligne `course:` prise pour borne par le mode actuel.
  6. Consommateur : le collecteur consigne le sha256 de sa ligne `unlocked` par opérateur (D-11) ; le rapprochement de l'acte la reçoit en `--course-end`.

  Limite déclarée : chainstack n'a qu'un total par jour et par réseau (mode `aggregate`, `reconcile.ts:10-20`). Le rapprochement d'une course chainstack ne vaut donc que si aucune autre course chainstack Solana n'est facturée entre les deux relevés, le relevé « après » attendant la mise à jour différée (FAITS l.31). Sinon il rend NO-GO `hard:total`, fail-closed ; l'item ouvert de `reconcile.ts:15-20` reste inchangé.
- **RPC-GUARD-HELIUS-HOST-1 (même lot)**. Son déclencheur, « prochain lot rpc-guard », est atteint par ce lot. Correctif : le premier élément de `BELL_SOLANA_RPC` doit être une URL https, sans userinfo ni requête, dont l'hôte relève du domaine `helius-rpc.com`, celui que la carte de Bell associe à helius (`apps/bell/src/operators.ts:15`). Sinon helius n'est pas résolu et l'ouverture échoue avant tout verrou. C'est un contrôle structurel calqué sur `resolveGetUrl` (`transport.ts:198-205`) ; l'hôte exact est lu au G0 du lot sans afficher la variable (A-7). Test : `helius_key_is_never_sent_off_host`. PR-2b ne porte aucun contrôle d'hôte propre ; la sonde en portait un faute de correctif.
- **Estimation du lot rpc-guard** : ≈ 145 lignes ascendantes, soit ≈ 287 à ×1,98 (D-14).
- **DOJO-MINT-EXTENSIONS-1 (SNAPSHOT-PROBE-1 (a))**. **Non bloquant pour les G1 de PR-2b-1 à PR-2b-4** : l'algorithme lit les montants bruts pre/post et les instructions d'offre, jamais la liste des extensions, et tout type d'instruction hors liste sur le mint arrête la collecte (D-8 (vi)). **Bloquant pour l'acte réseau** dont le paquet serait publiable, pour trois raisons :
  1. le contrôle (i) suppose que la somme des champs `amount` égale l'offre ; des frais de transfert retenus hors `amount`, ou des soldes confidentiels, le rendraient faux sans faute de lecture. Le corps de création ne montre ni l'un ni l'autre (FAITS l.15 ; R-d), mais l'état actuel du mint n'est pas lu (FAITS §5) ;
  2. mère D-4 fait s'abstenir un jour lu sur tout changement d'extension : l'historique doit partir du même contrôle ;
  3. H-3 : un `Transfer` sans le mint n'est refusé que si le compte source porte un crochet, des frais ou une pause. La liste des extensions dit donc si mère D-18 (b) peut trouver de tels transferts ; les pages par compte restent conservées dans tous les cas.

  Condition de l'acte : le paquet du premier jour lu (PR-2) porte la réponse `jsonParsed` complète du mint, et ses extensions sont exactement celles vues à la création (pointeur de métadonnées, métadonnées ; FAITS l.15). Toute autre extension fait refuser l'acte, avec une ligne datée.
- **Autres dépendances** :
  - PR-1a au G7 avant le G1 de PR-2b-1 (`ownerClass`, racine) ;
  - PR-2 au G7 avant le G1 de PR-2b-2 (format du paquet du premier jour lu, PR-2-BUNDLE-FOR-HISTORY-1) ;
  - PR-1b-1 et PR-1b-2 au G7 avant le G1 de PR-2b-4 (signataire de fixture et vérificateur du test d'intégration).
  - L'ordre de mère §7 est conservé (PR-2b après PR-2). PR-2b-1 ne dépend techniquement que de PR-1a ; l'avancer serait une ligne datée de l'orchestrateur.
  - FAITS-TOKEN-CREATION-1, FAITS-SOLANA-HISTORY-1, SNAPSHOT-PROBE-3 et P-34 sont levés (§1.2 ; décision 228).
  - FAITS-SOLANA-PUBLIC-RPC-TERMS-1 n'est pas une dépendance de ce lot, qui n'appelle pas l'opérateur sans clé. Elle reste une dépendance de PR-2, dont l'énumération alimente (ii).
  - CHAINSTACK-AFTER-2 ne bloque aucun G1 ; sa mesure calibre la bande « soft » chainstack du premier rapprochement de l'acte (mode `aggregate-calibration`, `reconcile.ts:29-31`).

### D-14 : R-25, estimation et découpage

Méthode de mère §7 : estimation ascendante, puis facteurs de dérive mesurés sur Bell, ×1,7 (planification) et ×1,98 (pire cas, compte CI). La borne CI est de 1 205, le seuil STOP de 1 150. Les `docs/**/*.md` sont exclus ; les `apps/dojo/test/fixtures/**` sont comptés (`ci.yml:82`).

| PR | Contenu | Ascendant | ×1,7 | ×1,98 | Dépend de |
|---|---|---|---|---|---|
| lot rpc-guard (hors série Dōjō) | RECONCILE-WINDOW-1 (+31 code), RPC-GUARD-HELIUS-HOST-1 (+14), tests (+100) | 145 | 247 | 287 | — |
| **PR-2b-1** lecture (pur) | `history-read.ts` ≈ 280 (clé de lecture, fusion des index, admission, chaînage, offre par transaction, (iv) à (vii)) ; tests ≈ 180 ; réducteur, sources et fixtures ≈ 87 | 547 | 930 | 1 083 | PR-1a, cp-1 bref de ce G0 |
| **PR-2b-2** reconstruction (pur) | `history-build.ts` ≈ 270 (fenêtres sans quorum, séries, rangs et repli, valeurs du jour, offre par jour, (ii), lignes, paquet) ; tests ≈ 260 | 530 | 901 | 1 049 | PR-2b-1, PR-2 |
| **PR-2b-3** collecteur A et B | `history-collect.ts` ≈ 260 (CLI, préconditions, garde ×10, montage, phases A et B, journal, dépôt brut, déverrouillage, liste de méthodes) ; tests ≈ 210 (chaîne simulée ≈ 120, budget, garde ×10, formes) | 470 | 799 | 931 | PR-2b-2, lot rpc-guard |
| **PR-2b-4** phase C, reprise, intégration | code ≈ 80 ; tests ≈ 160 (pages par compte, reprise, intégration, extensions de la chaîne simulée) | 240 | 408 | 475 | PR-2b-3, PR-1b-1, PR-1b-2 |
| **Total PR-2b** | | **1 787** | **3 038** | **3 538** | |

- **Écart avec l'ADR-mère** : elle estimait PR-2b à 500 lignes (É-5). La série Dōjō passe de 4 137 à 5 424 lignes ascendantes, ≈ 9 221 à ×1,7 et ≈ 10 740 à ×1,98, et compte douze PR au lieu de neuf.
- **Coupe de repli automatique au G1 (mère C-6)**, pour une PR qui mesurerait plus de 1 150 lignes au compte CI :
  - PR-2b-1 (marge 67) : (a) clé de lecture, fusion, admission ; (b) chaînage, offre, contrôles.
  - PR-2b-2 (marge 101) : (a) fenêtres, séries, valeurs du jour ; (b) (ii), lignes, paquet.
- **Ordre retenu contre le repli de l'ADR-mère** : l'ADR-mère prévoyait « signatures et transactions sous quorum, puis reconstruction ». La coupe retenue fait passer le pur avant le réseau : les noyaux purs se testent hors ligne sur fixtures et ne dépendent ni du lot rpc-guard ni du réseau.
- **Mesure au G1** : celle de mère §7 (`git diff --shortstat` depuis la base de fusion, avec le pathspec de `ci.yml:82` recopié mot pour mot).

## 3. Tuyaux (ADR-M018 D3)

| # | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test non-LLM | Au G7 de PR-2b-4 |
|---|---|---|---|---|---|
| TU-12a | chaîne Solana lue par helius et chainstack via `openGuardedClient` (collecteur, machine opérateur) | évidence : journal, réponses brutes | `…/history/<date>/evidence/` | `dojo_history_calls_have_the_closed_forms`, `dojo_history_budget_stops_fail_closed`, `dojo_history_resume_from_last_complete_unit` (chaîne simulée) | composé en test (chaîne simulée) ; servi au G7 de PR-3a puis de la pièce (pli, C-29) |
| TU-12b | évidence + paquet du premier jour lu (PR-2) + mint épinglé (TU-3) | `publish/` : lignes, manifeste, `SHA256SUMS` | `…/history/<date>/publish/` | `dojo_history_rebuilds_balances_from_transactions`, `dojo_history_matches_first_enumeration`, `dojo_history_lines_are_canonical_sorted_and_rooted` | composé en test (chaîne simulée) ; servi au G7 de PR-3a puis de la pièce (pli, C-29) |
| TU-12c | `publish/` → éditeur (PR-3a) | fichier servi `history/<sha256>.jsonl` et ligne signée `history` | hôte | `dojo_publish_history_before_the_first_snapshot` (PR-3a) | **absent** : tuyau annoncé par l'ADR-mère (PR-3a), non par ce lot ; déclencheur : G7 de PR-3a ; aucun consommateur servi avant lui, la pièce reste `upcoming` |
| TU-12d | fichier d'historique → vérificateur de tiers (PR-1b-2) | verdict | aucun | `dojo_verify_history_transition` (PR-1b-2) ; `dojo_history_collect_to_verify_end_to_end` (ce lot, par signataire de fixture) | composé en test ; servi au G7 de la pièce |
| TU-1h | paquet du premier jour lu (PR-2) → collecteur d'historique | fenêtre (D_LAST, S_CUT), réponses d'énumération pour (ii), mint `jsonParsed` pour l'acte | `F:/PRODUITS/dojo-mirror/bundles/` | `dojo_history_matches_first_enumeration` ; paquet du premier jour lu écrit par l'écrivain de PR-2 (sortie committée de son propre test) ou chargé par son lecteur, jamais construit à la main (pli, C-29) | dépend de PR-2 (PR-2-BUNDLE-FOR-HISTORY-1) |
| TU-rg | grand livre de course → rapprochement servi (`--course-end`) | code de sortie consommé par la procédure de l'acte | grand livre hors dépôt | `reconcile_course_window_isolates_one_course` (lot rpc-guard) ; `dojo_history_budget_stops_fail_closed` | branché au G7 du lot rpc-guard |

**Test d'intégration non-LLM** : `dojo_history_collect_to_verify_end_to_end` (PR-2b-4) rejoue la composition collecteur → paquet → vérificateur. Déroulé :
1. **Montage** : une chaîne simulée (§4, `history-chain.ts`) sert les trois méthodes par un `fetch` remplacé avant l'import du garde (`harness.ts:37-45` ; `probe-3.mjs:595`), avec des hôtes `.invalid` et des clés factices. Les pièges « aucune socket, aucune résolution DNS » sont armés. Le vrai `openGuardedClient` écrit dans un grand livre temporaire ; les plafonds viennent des formules du D-10, garde ×10 satisfaite.
2. **Collecte** : le CLI du collecteur s'exécute de bout en bout, avec le paquet du premier jour lu écrit par l'écrivain de PR-2 (sortie committée de son propre test) ou chargé par son lecteur, jamais construit à la main (pli, C-29).
3. **Assertions sur le paquet** :
   - code de sortie 0 et statut `complete` ;
   - `SHA256SUMS` vérifié ;
   - lignes égales à l'oracle recodé dans le test, calculé depuis les soldes de vérité de la chaîne simulée et jamais depuis le code du collecteur : minima du jour, jour 1 = 0, `null` sur la fenêtre de la transaction sans quorum simulée, classe `program` des propriétaires hors courbe ;
   - racine égale à celle que calcule PR-1a.
4. **Vérification** : une ancre et la ligne `history` sont signées par une clé éphémère (aide de fixture de PR-1b-1, `apps/dojo/test/helpers/dojo-fixture.ts`), puis `dojo-verify` (PR-1b-2) lit l'arbre servi. Attendus : `consistent_with_supplied_keyring` et contrôles d'historique verts.
5. **Mutations** : une `day_value` changée d'une unité dans une copie donne `history_sha_mismatch` ; la même avec le sha et le compte recalculés donne `history_root_mismatch` ; une ligne retirée donne `history_count_mismatch`.
6. **Limite déclarée** : l'éditeur (PR-3a) n'existe pas encore et le signataire de fixture le remplace. La composition servie complète est la condition de G7 de la pièce (mère §7).

**Règle Branchement** : la pièce reste `upcoming` (mère §5). La sortie de ce lot n'est consommée par aucun chemin servi avant le G7 de PR-3a (TU-12c) : c'est un tuyau formé avec déclencheur, pas un oubli.

- **Ligne datée du 2026-09-27 (corrections du G2 de PR-2b-2, C-G2-3 ; ajout seul)** : tuyau entrant de `historyBundle` au statut `complete`. `buildHistory` (PR-2b-2) tient (i) par jour, (ii), (iii) par `chainAccounts` et (v) ; il ne compose **pas** (i) par transaction et frappe après SIG0 (`checkSupply`), (iv) (`checkCreation`), (vi) (`checkInstructions`) ni (vii) (`checkBounds`), qui vivent dans `history-read.ts` (PR-2b-1). La composition de ces quatre contrôles, sur chaque transaction admise, **avant** tout appel de `historyBundle` au statut `complete`, est la charge du collecteur de PR-2b-3 (tout échec : statut `partial`, aucun `publish/`, D-8) ; elle est assertée par `dojo_history_collect_to_verify_end_to_end` (PR-2b-4 : une frappe après SIG0 dans la chaîne simulée ⇒ `partial`). `historyBundle` écrit `supply_check`, `enumeration_check` et `chain_check` à `pass` sur la foi de cette composition. Item **DOJO-HISTORY-CHECKS-COMPOSITION-1** (§8).

## 4. Tâches, tests nommés, mutants, fixtures

Tests non-LLM (`npm test`), sans réseau, sans clé committée. Les mutants s'appliquent sur copie, sont restaurés au sha256 et ne vont jamais dans l'index (mère §6).

### PR-2b-1 : lecture (`apps/dojo/src/history-read.ts`, pur)

- `dojo_history_quorum_on_signatures_and_balances` (mère) :
  - fusion des index : concordance, contestation et échec, sur les fixtures de pages ;
  - clé de lecture égale entre helius et chainstack pour SIG0, C1 et C2, et entre gTFA et `getTransaction` (R-b) ;
  - clé différente sur copie modifiée (propriétaire, montant, rang, instruction d'offre) ;
  - admission et sans-quorum selon la table du D-6.
  - Tue M-Y1, M-Y8, M-Y9.
- `dojo_history_excludes_failed_before_bodies` : F n'est jamais demandé ; une contestée est lue chez les deux. Tue M-Y10.
- `dojo_history_supply_moves_match_instructions` : SIG0, frappe de 10^15 égale à la somme des deltas ; brûlage synthétique ; frappe après SIG0 refusée (R-d). Tue M-Y4 (partie transaction).
- `dojo_history_chain_break_stops` : trou de solde entre deux transactions admises d'un compte ; ordre qui enchaîne dans un emplacement non ordonné. Tue M-Y13.
- `dojo_history_instruction_allowlist_stops` : un type hors liste et une instruction Token-2022 non analysée arrêtent la collecte. Tue M-Y19.
- `dojo_history_creation_and_day_monotonicity` : (iv) sur la fixture SIG0 ; `jour` de C2 = 2026-09-14, à 4 s de la borne ; `blockTime` décroissant refusé. Tue M-Y6.

### PR-2b-2 : reconstruction et paquet (`apps/dojo/src/history-build.ts`, pur)

- `dojo_history_rebuilds_balances_from_transactions` (mère) : fixtures de la sonde et événements synthétiques. Couvre transferts, fermeture de compte (0, mère C-1), propriétaire à deux comptes, changement de propriétaire, courbe de liaison et pool hors courbe (classe `program`). Tue M-Y2.
- `dojo_history_day_value_is_the_day_minimum` (mère) : solde du début du jour et après chaque transaction ; achat dans le jour ⇒ lot né le lendemain ; jour 1 = 0 ; cas M8 (E1) à (E4). Tue M-Y3, M-Y7.
- `dojo_history_supply_check_holds_each_day` (mère) : offre par jour hors fenêtres ; D_LAST évaluable. Tue M-Y4.
- `dojo_history_no_quorum_span_until_next_quorum_read` : fenêtre inclusive jusqu'au jour de la suivante admise ; propagation à l'adresse ; arrêt si la fenêtre reste ouverte à E. Tue M-Y11, M-Y12.
- `dojo_history_intra_slot_rule_is_superadditive` : emplacement ordonné exact ; non ordonné, borne L_s pour toutes les adresses. Grille recodée dans le test (motif M-H1) : la somme des parties ne dépasse jamais l'adresse combinée, et la valeur ne dépasse jamais le vrai minimum. Tue M-Y14, M-Y15.
- `dojo_history_matches_first_enumeration` (mère) : (ii) pour chaque réponse d'énumération ; compte absent = 0 ; compte de l'énumération inconnu de la reconstruction ⇒ arrêt. Tue M-Y4.
- `dojo_history_lines_are_canonical_sorted_and_rooted` : règle d'existence (ligne du jour de sortie, pas de ligne le lendemain, lignes `null`) ; tri ; `canonical` ; nom = sha256 ; racine égale à celle de PR-1a. Tue M-Y16.
- `dojo_history_bundle_carries_no_operator_label_and_no_secret` : `publish/` sans libellé d'opérateur, ni URL, ni forme de clé ; clés fermées passées à `assertNoCloseLike` ; statut `partial` ⇒ aucun `publish/`. Tue M-Y17, M-Y18.

### PR-2b-3 : collecteur, phases A et B (`apps/dojo/src/history-collect.ts`)

- `dojo_history_calls_have_the_closed_forms` : chaque requête vue par la chaîne simulée a l'une des formes du D-2. Aucun appel vers l'opérateur sans clé, aucune autre méthode, `limit` de gTFA égal à 100, `finalized` et V = 1 partout. Tue M-Y20, M-Y21, M-Y25.
- `dojo_history_x10_guard_refuses_before_any_lock` : plancher + 10 × plafond > 8 000 000 ⇒ refus, aucun fichier `.lock` créé, aucune ligne de grand livre. Tue M-Y22.
- `dojo_history_budget_stops_fail_closed` (mère) :
  - la course atteint un plafond au milieu de la phase B : aucun appel après la `BudgetExceededError`, statut `partial`, pas de `publish/`, `unlock` servi, sha256 des lignes `unlocked` consignés ;
  - le rapprochement servi en `--course-end`, avec des relevés simulés égaux au compte de la course, rend GO ; avec un relevé supérieur d'une unité, NO-GO `hard:<méthode>` ;
  - ce second point exige RECONCILE-WINDOW-1.
  - Tue M-Y23.
- `dojo_history_gtfa_matches_the_helius_index` (réécrit au pli, C-25) : un corps de R absent des pages gTFA est lu par `getTransaction` ; une signature des pages absente de l'index est contestée ; une signature de F, présente ou absente des pages, n'est jamais demandée ; les écarts sont comptés. Tue M-Y26.

### PR-2b-4 : phase C, reprise, intégration

- `dojo_history_per_account_pages_until_fixpoint` : un transfert sans le mint, visible seulement dans les index des deux comptes, est trouvé ; un compte fermé est paginé ; un compte découvert en phase C est paginé à son tour. Tue M-Y5.
- `dojo_history_resume_from_last_complete_unit` : arrêt simulé au milieu d'un compte, puis reprise. Les pages du compte non clos sont écartées et relues depuis la première ; une réponse brute altérée ⇒ `evidence_corrupt` ; entrées fixes différentes ⇒ refus. Le résultat est identique, à l'octet, à celui d'une exécution sans arrêt. Tue M-Y24.
- `dojo_history_collect_to_verify_end_to_end` : intégration, §3.

### Mutants (liste fermée ; chacun doit faire échouer le test nommé)

- **M-Y1** (mère) transaction admise sur le corps d'un seul opérateur.
- **M-Y2** (mère) compte fermé ignoré au lieu de valoir 0.
- **M-Y3** (mère) valeur du jour prise à la fin du jour, à un seul instant ou au maximum.
- **M-Y4** (mère) écart d'offre ou d'énumération publié au lieu d'arrêter.
- **M-Y5** (mère) pages par compte omises.
- **M-Y6** (mère) jour pris ailleurs que dans `blockTime`.
- **M-Y7** (mère) solde du début du jour omis du minimum.
- **M-Y8** signature d'un seul index écartée sans lecture des corps.
- **M-Y9** clé de lecture sans le propriétaire, ou sans le rang quand les deux corps le portent.
- **M-Y10** échec concordant lu, ou échec contesté exclu sans lecture.
- **M-Y11** fenêtre sans quorum close au jour de la transaction sans quorum.
- **M-Y12** fenêtre appliquée au compte seul (somme partielle de l'adresse).
- **M-Y13** rupture de chaînage tolérée.
- **M-Y14** rang d'un seul opérateur utilisé pour ordonner.
- **M-Y15** repli appliqué par adresse, ou repli optimiste (maximum sur les ordres).
- **M-Y16** ligne du jour de sortie omise, ou ligne « 0 » publiée pour une adresse sans pile.
- **M-Y17** paquet `partial` porteur de `publish/`.
- **M-Y18** libellé d'opérateur ou forme de clé dans `publish/`.
- **M-Y19** type d'instruction hors liste toléré.
- **M-Y20** appel vers l'opérateur sans clé, ou méthode hors liste.
- **M-Y21** `limit` de gTFA supérieur à 100 accepté.
- **M-Y22** garde ×10 retirée.
- **M-Y23** appel émis après une `BudgetExceededError`, ou statut `complete` après un arrêt.
- **M-Y24** compte non clos repris à sa dernière page, ou unité close sans vérification du sha256 brut.
- **M-Y25** engagement autre que `finalized`, ou V ≠ 1.
- **M-Y26** (reformulé au pli, C-25) corps de R absent des pages non complété, ou corps de F demandé.

### Fixtures dérivées de la sonde (PR-2b-1)

Le réducteur committé `apps/dojo/test/fixtures/history/reduce-probe3.mjs` lit les fichiers bruts, hors dépôt, seulement pour régénérer. Les sources et leurs sha256 sont épinglés dans `apps/dojo/test/fixtures/history/sources.json`. La CI lit les fichiers réduits, une ligne JSON chacun, qui gardent les champs lus par le code. Pour un corps : `slot`, `blockTime`, `transactionIndex`, `version`, `meta.err`, `pre/postTokenBalances` de tous les mints, instructions Token-2022 analysées, externes et internes, `accountKeys` (`pubkey`, `source`) et `signatures`. Pour une page : les entrées, telles quelles.

| Fichier de la sonde (sha256) | Fixture réduite | Ce qu'elle porte |
|---|---|---|
| `A3-chainstack-getTransaction.json` (`e062bdce…60dd`), `A5-helius-getTransaction.json` (`f4254e7e…c710`) | `sig0.chainstack.json`, `sig0.helius.json` | création : `initializeMint2`, `mintTo` 10^15 au compte `6tW6…YWo` de propriétaire `2v82…m6F` (hors courbe), `setAuthority` `mintTokens` → `null` ; jour 2026-09-10 ; pre vide |
| `A1-helius-getTransactionsForAddress.json` (`b6b08305…75bd8`) | `sig0.gtfa.json` | forme `{data, paginationToken: "445903343:342"}` ; corps canoniquement égal à A3 |
| `C1-chainstack-getTransaction.json` (`c97b29b2…4c10`), `C1-helius-getTransaction.json` (`75f864c0…b2a7`) | `c1.chainstack.json`, `c1.helius.json` | `transferChecked` du coffre `MeQM…kzd` (propriétaire `GhCG…hvg`) vers `BMAH…j9T` (propriétaire `BvZE…KTr`) ; entrées SOL enveloppé et USDC à filtrer ; clés par table |
| `C2-chainstack-getTransaction.json` (`3617b24d…fe29`), `C2-helius-getTransaction.json` (`ffc3cb0e…8585`) | `c2.chainstack.json`, `c2.helius.json` | 2026-09-14T00:00:04Z (borne de jour) ; mint atteint seulement par table (R7) ; coffre par table |
| `A2-p024-helius-getSignaturesForAddress.json` (`01601657…7c572`), `A6-chainstack-getSignaturesForAddress.json` (`4f53cda1…b945`, `[]`) | `mint-tail.helius.json` (les 100 plus anciennes, SIG0 en dernier), `mint-before-sig0.chainstack.json` | fin de l'historique ; page courte ; rien avant SIG0 |
| `B1-chainstack-getSignaturesForAddress.json` (`03d9fcca…508e`) | `mint-tail.chainstack.json` (les 100 plus anciennes) | ensemble égal à celui de helius ; porte `transactionIndex` |
| `B3-chainstack-getSignaturesForAddress.json` (`41238e72…f201`), `A2-p001-helius-getSignaturesForAddress.json` (`2534a43f…c0c5`) | `mint-head.chainstack.json`, `mint-head.helius.json` (100 entrées, `before = L[0]`) | ensembles égaux ; chainstack sans `transactionIndex` (R-a) : la clé d'index l'exclut |
| `D1-helius` (`92f3766e…f48d`), `D1-chainstack` (`cb42f2b4…5194`), `D2-helius` (`5cfa315d…0889`), `D2-chainstack` (`38ff4875…53be`) (`…-getSignaturesForAddress.json`) | `acct-6tW6.{helius,chainstack}.json`, `acct-MeQM.{helius,chainstack}.json` (100 entrées) | pages par compte incluses dans l'index du mint (R8) |
| `derived.json` (`e9b4a4fb…5514`) | `probe3-expect.json` | SIG0, `slot`, `blockTime` (R2, R4) attendus par (iv) |

- **Ligne datée du 2026-09-27 (corrections du G2 de PR-2b-1, C-G2-1 ; ajout seul, fait foi sur la colonne « Fixture réduite » de la table ci-dessus)** : aucune fixture, ni le réducteur, ni `sources.json`, ni le test ne nomment un opérateur ; les deux membres sont « a » (premier opérateur de `OPS`, D-3 l.231) et « b » (le second). Noms retenus, par identifiant d'appel de la sonde : `sig0.a.json` (A5), `sig0.b.json` (A3), `sig0.a-page.json` (A1, page `full`), `c1.a.json` et `c1.b.json` (C1), `c2.a.json` et `c2.b.json` (C2), `mint-tail.a.json` (A2-p024), `mint-before-sig0.b.json` (A6), `mint-tail.b.json` (B1), `mint-head.a.json` (A2-p001), `mint-head.b.json` (B3), `acct-6tW6.a.json` et `acct-6tW6.b.json` (D1), `acct-MeQM.a.json` et `acct-MeQM.b.json` (D2), `probe3-expect.json` (`derived.json`). Le réducteur résout chaque source par son identifiant d'appel **et** son sha256 dans `SHA256SUMS` ; `sources.json` porte, par fixture, `{call, member, source_sha256, rule, sha256, key}` et aucun nom de fichier de la sonde ; la correspondance fixture ↔ fichier de la sonde vit hors dépôt (`F:/tmp/dojo/pr2b1-evidence/members-pr2b1.tsv`, sha256 `d4ddf57648c9507946f08bc0b62938f3c2f322a2ff263800023012b5c45719e9`). **Sha256 commun déclaré** : sous les appels C1 et C2, membre b, deux fichiers de la sonde portent le même sha256 (`c97b29b2…4c10`, `3617b24d…fe29`), octets identiques, l'un d'eux venant du troisième opérateur que D-3 n'utilise jamais ; la fixture est la même quel que soit le fichier lu (le réducteur contrôle les deux et les liste sous `shared_sha256`). Contenus inchangés : 17 fichiers sur 17 égaux octet pour octet aux fixtures du G1, sha256 et clés de `sources.json` inchangés. `error_origin` : **G0** (cette table nommait les fichiers par opérateur) et **G1** (le conflit avec sa mission, « aucun fournisseur nommé », n'a pas été posé en question). Sources : rapport G2 `F:/tmp/dojo/g2-pr2b1/G2-report.md` (sha256 `e42da218a081e8ceb62927d50ca874ee97fb1348828c9f26a257a9a78c1a58a8`), C-G2-1 ; décision de l'orchestrateur (mission `F:/tmp/dojo/mission-corr-pr2b1.md`, sha256 `50853d4cecd28e70e8374ac7adb5ada8dbb6c4539398afc5767cebeb31147ef0` ; CHANTIERS du tronc, commit `bb4f8a5`).

**Chaîne simulée** (`apps/dojo/test/helpers/history-chain.ts`, PR-2b-3, étendue en PR-2b-4) :
- générateur congruentiel à graine fixe, qui produit une histoire du mint dans la forme réduite des fixtures ;
- événements couverts : création de comptes par `initializeAccount3`, `transferChecked`, `transfer` sans mint (visible seulement par les index des deux comptes), `closeAccount`, propriétaire à deux comptes, changement de propriétaire, brûlage, transactions en échec (pre = post), plusieurs transactions par emplacement avec rang et un emplacement sans rang, référence au mint par table seulement ;
- défauts injectés : un écart d'index chez un opérateur et une divergence de corps ;
- service de `getSignaturesForAddress` (`limit`, `before`, plus récent d'abord), `getTransaction` et `getTransactionsForAddress` (`full`, `asc`, `limit`, `paginationToken` « slot:rang »), par opérateur ;
- soldes de vérité après chaque transaction, qui servent d'oracle aux tests.

## 5. Budget et plafonds

Arithmétique sur `derived.json` R4 (pic 6 467, N = 23 628, 5 714 échecs, 17 jours), sur `transport.ts:22-23` et sur FAITS l.29 et l.31. Script `caps.mjs`, sortie `out-caps.txt` (§12).

**Par jour au pic** :

| Phase | helius | chainstack |
|---|---|---|
| A (index du mint) | 6,47 pages, soit 6,47 crédits | 6,47 pages, soit 12,93 RU |
| B (corps) | 64,67 appels gTFA, soit 646,7 crédits | jusqu'à 6 467 corps, soit 12 934 RU ; recomptage : 4 539 réussis le 19/09 (R-e) |
| Total par jour | ≈ 653 crédits ; ×10 ≈ 6 532 | ≈ 12 947 RU |

**Pour J jours** :

| J | S(J) | Pages A par opérateur | Appels gTFA | helius A+B (crédits) | ×10 exigé | chainstack A+B (RU) | Appels (A+B, deux opérateurs) |
|---|---|---|---|---|---|---|---|
| 17 (contrôle) | 109 939 | 110 | 1 100 | 11 110 | 111 100 | 220 098 | 111 259 |
| **20** | 129 340 | 130 | 1 294 | **13 070** | **130 700** | **258 940** | 130 894 |
| **40** | 258 680 | 259 | 2 587 | **26 129** | **261 290** | **517 878** | 261 785 |

- **Voie `getTransaction` pour les corps helius (rejetée, D-9)** : 129 470 crédits et 1 294 700 exigés par la garde pour J = 20 ; 258 939 et 2 589 390 pour J = 40.
- **Projection de la moyenne mesurée** (N/17 par jour, à titre indicatif, jamais un plafond) : pour J = 20, 27 798 signatures dont 21 075 réussies, soit ≈ 2 808 crédits et ≈ 42 206 RU ; pour J = 40, 55 595 et 42 151, soit ≈ 5 616 crédits et ≈ 84 414 RU.
- **Phase C (acte 2)** : non chiffrable depuis la sonde, qui n'a lu qu'une page de deux comptes (R8). La borne se fixe après l'acte 1 (D-10) : helius, n_acc + ⌈2 Σ c_a / 1 000⌉ crédits de pages plus c_n ; chainstack, le double en RU. Au moins une page par compte et par opérateur : le coût croît avec n_acc (Q-3).
- **Marges de cycle au relevé de la sonde** (valeurs du jour, jamais des faits pour l'exécution) : helius 8 000 000 − 3 738 119 = 4 261 881 crédits ; chainstack 16 000 000 − 282 530 = 15 717 470 RU. Pour J = 40, la garde ×10 de la voie retenue exige 261 290 crédits hors phase C, soit 6,1 % de la marge helius de ce jour ; la voie rejetée en aurait exigé 2 589 390, soit 60,8 %. Le plancher réel se relit le jour de l'acte (Q-17).
- **À l'atteinte d'un plafond** : D-11. L'arrêt n'appelle plus rien. Le paquet reste `partial` : aucun `publish/`, statut consigné. La reprise est un nouvel acte, sur un nouveau go ; elle repart de l'état décrit au D-11 (unités closes, compte non clos relu depuis sa première page).

## 6. Menaces (forme de l'audit Vernier : menace, mécanisme, parade, statut)

| # | Menace | Mécanisme | Parade | Statut |
|---|---|---|---|---|
| TY-1 | Index incomplet ou divergent | un opérateur omet ou ajoute une signature | fusion, lecture des contestées chez les deux, quorum de corps, borne sur X (D-4, D-8 (vii)) | neutralisé pour l'invention ; omission comptée |
| TY-2 | Transaction hors de l'index du mint | `transfer` sans le mint (H-3), fermeture, changement de propriétaire | pages par compte jusqu'au point fixe (mère D-18 (b)) ; chaînage (iii) | réduit ; coût non chiffré (Q-3, Q-10) |
| TY-3 | Ordre inconnu dans un emplacement | adresse à plusieurs comptes (É-2) | rang sous quorum ; sinon borne L_s pour toutes les adresses de l'emplacement (D-7, M-H1) | neutralisé : jamais au-dessus du vrai minimum, sur-additif |
| TY-4 | Sous-compte de facturation | gTFA `full` au-delà de 100 corps (É-3) ; tarif « archival » | `limit: 100` fermé ; garde ×10 ; rapprochement de course | neutralisé dans ce lot ; Bell : GARDE-GTFA-FULL-TARIFF-1 |
| TY-5 | Épuisement du cycle helius partagé avec Bell | deux courses sur un même cycle | plancher du jour ; garde ×10 ; plafond de cycle du garde ; verrous | fail-closed |
| TY-6 | Arrêt en cours | plafond, faute, coupure de courant | journal durable ; unités closes ; reprise ; statut `partial` (D-11) | neutralisé |
| TY-7 | Fuite d'un secret ou d'un libellé | réponse ou message porteur de la clé ; paquet copié vers l'hôte | séparation `publish/` et `evidence/` ; caviardage ; A-7 ; M-Y18 | neutralisé |
| TY-8 | Divergence de corps massive | opérateur dégradé | borne (vii), arrêt | fail-closed |
| TY-9 | Extension du mint qui sort des montants de `amount` | frais retenus, soldes confidentiels | condition de l'acte (D-13) ; (i) ; (vi) | ouvert jusqu'à DOJO-MINT-EXTENSIONS-1 |
| TY-10 | `blockTime` non monotone ou nul | estimation pondérée (H-7) | (v) ; recomptage : 0 inversion sur 23 628 (R-e) | neutralisé ; précision aux bornes non levée (H-7) |
| TY-11 | Disque plein | évidence de plusieurs Go | précondition d'espace (D-10) ; écritures durables | fail-closed |
| TY-12 | Course concurrente sur un opérateur | Bell ou une autre course chainstack ; l'acte tient les verrous `<cycleDir>/<op>.lock` du cycle partagé avec Bell pendant des heures (D-10 : 0,5 à 35 h pour J = 20) (pli, C-27) | verrous par opérateur (`LockHeldError`) ; contrôle du répertoire canonique chainstack (`probe-3.mjs:551-552`) ; courses bornées en durée placées entre deux courses Bell, ou pause de Bell déclarée par acte de l'orchestrateur (§7, point 4 ; C-27) | fail-closed pour la course qui trouve le verrou tenu : Bell échoue `LockHeldError` et manque sa ligne du jour ; le collecteur ne s'ouvre pas et n'émet aucun appel (pli, C-27) |

**MAST (pli, C-31 ; renvoi à mère §9, qui couvre la pièce)** : modes propres à ce lot, chacun avec sa contre-mesure déjà écrite. FM-1.1, spécification non suivie (« FM-1.2 » dans le rapport du checkpoint-1 bref, C-31) : le collecteur lit tous les corps par `getTransaction`, ou gTFA à `limit` supérieur à 100 ⇒ formes fermées du D-2, M-Y20 et M-Y21 (`dojo_history_calls_have_the_closed_forms`). FM-2.4, rétention d'information (« FM-2.x » dans le rapport) : une fixture réduite perd un champ lu plus tard ⇒ liste déclarée des champs gardés et sources épinglées dans `sources.json` (§4, fixtures). FM-3.1, terminaison prématurée : un arrêt déguisé en `complete` ⇒ M-Y23 (`dojo_history_budget_stops_fail_closed`). FM-3.3, vérification incorrecte : un oracle tiré du collecteur ⇒ oracle recodé depuis les soldes de vérité de la chaîne simulée (§3, test d'intégration).

## 7. Gates et ordre

1. **Ce G0**, puis checkpoint-1 bref du validateur-humain sur ce document (C-3), avant le G1 de PR-2b-1.
2. **Lot rpc-guard** (RECONCILE-WINDOW-1 et RPC-GUARD-HELIUS-HOST-1) : G0 (amendement daté), puis G1, G2, checkpoint-2 et G7. Il doit précéder le G1 de PR-2b-3.
3. **PR-2b-1, PR-2b-2, PR-2b-3, PR-2b-4**, dans cet ordre. Chacune passe par G1 (worker, journal G1 avec R-25 mesuré), G2 (relecteur frais, différent du générateur), checkpoint-2 et G7 (orchestrateur, fusion). Dépendances : D-13.
4. **Préconditions des actes 1 et 2** (DOJO-HISTORY-ACTE-1 ; actes de l'orchestrateur, go par action ; celles de l'acte 0 au point 5, pli) :
   - G7 de PR-2b-4 ;
   - paquet du premier jour lu (PR-2) portant le mint `jsonParsed` et les deux réponses de la première énumération ;
   - DOJO-MINT-EXTENSIONS-1 levé ;
   - lecture sur place des limites de plan et essai à blanc sur une copie du grand livre (DOJO-HISTORY-THROUGHPUT-1) ;
   - planchers relevés le jour même ; garde ×10 ; espace disque ;
   - aucun verrou tenu ;
   - verrous `<cycleDir>/<op>.lock` du cycle partagés avec Bell (pli, C-27) : chaque acte est découpé en courses bornées en durée (paramètre déclaré, reprise D-11 entre deux courses), placées entre deux courses Bell ; ou pause de Bell déclarée par acte de l'orchestrateur.
5. **Acte 0 (pli, C-26), puis acte 1 (phases A et B), puis acte 2 (phase C, puis D à F)**.
   - Acte 0, go par action, avant le go de l'acte 1 : une page gTFA de la forme fermée du D-2 (`full`, `limit: 100` ; 10 crédits au barème) ; une page `getSignaturesForAddress` à `commitment: "finalized"` explicite par opérateur (1 crédit helius, 2 RU chainstack) ; un `getTransaction(SIG0)` de la forme fermée du D-2 (`commitment: "finalized"` explicite, `maxSupportedTransactionVersion: 1`, `encoding: "jsonParsed"`) par opérateur (1 crédit helius, 2 RU chainstack ; Q-F tranchée par l'orchestrateur, R-21, 2026-09-26) ; `unlock` ; rapprochement `--course-end` par opérateur dès que RECONCILE-WINDOW-1 existe, sinon rapprochement par lecture du tableau de bord par l'orchestrateur, consigné ; FAITS daté. Préconditions : planchers relevés le jour même, garde ×10, aucun verrou tenu, C-27. Il tranche Q-2, Q-12 (pour les trois méthodes) et Q-18 pour 12 crédits helius au barème (10 + 1 + 1) et 4 RU chainstack (2 + 2), au plus quatre appels par opérateur, marge de reprise 0 : tout dépassement est un arrêt (le rapport du checkpoint-1 bref écrivait « ≈ 12 crédits »).
   - Actes 1 et 2 : chaque course est suivie d'un rapprochement servi par opérateur en `--course-end`. FAITS daté.
6. **Publication par PR-3a**, après la fin du sondage X (mère P-35) et avant le premier `snapshot` (mère P-36).

## 8. Registre des items

| Id | Nature | Objet | Déclencheur | Propriétaire |
|---|---|---|---|---|
| **RECONCILE-WINDOW-1** (mère §11) | correctif rpc-guard | changement précisé au D-13 : `window.courseEnd`, `--course-end`, ligne `course:` hors des bornes du mode actuel | avant le G1 de PR-2b-3 (É-7 : accepté au checkpoint-1 bref, rapport §3.3 ; ADR-mère, sixième pli (c)) | orchestrateur |
| **RPC-GUARD-HELIUS-HOST-1** (mère §11) | correctif rpc-guard | contrôle structurel de l'hôte helius (D-13) | atteint par le lot RECONCILE-WINDOW-1 | orchestrateur |
| **GARDE-GTFA-FULL-TARIFF-1** (nouveau ; précisé au pli, C-30) | mesure, puis correctif rpc-guard et Bell | le garde compte 10 crédits par appel gTFA quel que soit le nombre de corps (`tariff.ts:13`) ; le barème lu au pli (FAITS cp1d L-2) facture le mode `full` 10 crédits par 100 transactions rendues, minimum 10 (le mode `signatures`, 10 à forfait) ; Bell appelle `limit: 1000` (`rebase-produce.ts:84`, `discover.ts:131`), soit jusqu'à 100 crédits par appel pour 10 comptés ; ordre de grandeur mesuré le 2026-09-26 : ×10,33 (FAITS cp1d §4 : 3 690 270 crédits gTFA au tableau de bord, contre 35 724 appels × 10 = 357 240 au grand livre). Correctif à **deux nombres**, jamais un seul : **réservation avant appel** = 10 × ⌈limit / 100⌉, pire cas, fail-closed, nombre qu'utilisent la garde ×10 et les plafonds ; **grand livre après appel** = 10 × ⌈rendus / 100⌉, minimum 10. Mesure : rapprochement par méthode d'une course Bell gTFA bornée par `--course-end` | avant toute collecte Bell et avant le G1 de PR-2b-3 | orchestrateur |
| **PR-2-BUNDLE-FOR-HISTORY-1** (nouveau) | exigence transmise | le paquet quotidien de PR-2 porte, pour la première lecture, les deux réponses d'énumération (`context.slot`, liste compte, propriétaire, montant) et la réponse `jsonParsed` complète du mint (extensions) | G0 ou ligne d'amendement de PR-2, avant son G1 | orchestrateur |
| **ADR-SNAPSHOT-D18-ORDER-1** (nouveau) | correction de document | mère D-18 : « indépendant de l'ordre des transactions d'un même bloc » ne vaut que par compte (É-2) ; renvoi à D-7 | prochain pli de l'ADR-mère, ou checkpoint-1 bref de ce G0 ; **clos** par le sixième pli de l'ADR-mère (2026-09-26, point (a)) | orchestrateur |
| **FAITS-PROBE3-L17-1** (nouveau) | correction de document | FAITS-probe-3 l.17 : `blockTime` 1 790 386 504 = 2026-09-26T01:35:04Z (É-1) | prochaine édition du FAITS ou entrée de CHANTIERS | orchestrateur |
| **FAITS-TOKEN2022-PARSER-1** (nouveau) | lecture sur place | formes `jsonParsed` de `burn`, `burnChecked` et `mintToChecked` de Token-2022 (champs du montant et du mint), dans l'analyseur de la bibliothèque de statuts de transaction de l'implémentation de référence (Q-7) | avant le G1 de PR-2b-1 | orchestrateur, ou lecteur sur le texte |
| **DOJO-HISTORY-THROUGHPUT-1** (nouveau) | lecture sur place, puis mesure | limites de requêtes des plans helius et chainstack ; essai à blanc sur une copie du grand livre (débit des lignes durables) ; paramètre de concurrence (Q-4) | avant le go de l'acte 1 | orchestrateur |
| **DOJO-HISTORY-ACTE-1** (nouveau ; acte 0 et courses au pli, C-26, C-27) | acte réseau, go par action | acte 0 (§7 point 5, D-10 : une page gTFA, une page de signatures par opérateur, `unlock`, rapprochement ; tranche Q-2, Q-12 et Q-18), puis actes 1 et 2 (§7), plafonds du §5 recalculés pour J, préconditions (dont les courses bornées en durée entre deux courses Bell, ou la pause de Bell, C-27), rapprochements, FAITS daté | acte 0 : sur go, avant le go de l'acte 1 ; actes 1 et 2 : après le G7 de PR-2b-4 et le premier jour lu | orchestrateur, go de l'investisseur |
| **DOJO-MINT-EXTENSIONS-1** (mère) | lecture de première main | condition de l'acte (D-13) | celui de SNAPSHOT-PROBE-1 (a) | orchestrateur |
| **CHAINSTACK-AFTER-2** (mère) | lecture sur place | calibre la bande « soft » chainstack (D-13) | à partir du 2026-09-27 02:00Z | orchestrateur |
| **FAITS-SOLANA-ATOMICITY-1** (pli, C-28 ; formé et clos le 2026-09-26) | lecture sur place | une transaction en échec ne change aucun état de compte, frais exceptés (Q-6) : `https://solana.com/docs/core/transactions`, lue par l'orchestrateur le 2026-09-26 à 14:31Z (FAITS cp1d L-3) : « If any instruction fails, the entire transaction fails and all state changes are reverted. » ; « Fees are still charged on failure. » | clos par la lecture L-3 | orchestrateur |
| **DOJO-GTFA-TOKENACCOUNTS-1** (pli ; item-sonde, avis de l'agent advisor du 2026-09-26 14:45) | sonde, puis lecture | `filters.tokenAccounts` de gTFA (« token accounts owned by the address », défaut `none` ; FAITS cp1d L-1) n'est **jamais** un substitut de la phase C : point unique de découverte ; chainstack sans gTFA ; sémantique « owned by » variable dans le temps. Sonde d'environ 10 crédits : mode `signatures`, un propriétaire connu (`2v82…m6F`, propriétaire du compte `6tW6…YWo` de D1 ; CHANTIERS du tronc, 2026-09-26 14:45), `tokenAccounts: all` et `tokenTransfer.mint`, comparée à D1. À lire avant fermeture : le modèle de compte Solana (le mint ne possède aucun compte : connaissance, non lue sur place) | avant le G0 de PR-2b-4 | orchestrateur |
| **DOJO-HISTORY-ORDERED-HOLE-1** (ligne datée du 2026-09-27, corrections du G2 de PR-2b-1, C-G2-5 (b)) | règle à trancher | trou (transaction sans quorum) dans l'emplacement d'un groupe de transactions admises ordonnées d'un compte : `chainAccounts` ne libère que le pre de la première transaction du groupe ; une rupture sur une suivante arrête (`chain_break`), arrêt fail-closed, possiblement parasite (G2 §3.4). Arrêt déclaré, aucun code dans PR-2b-1 | G1 de PR-2b-3 | orchestrateur |
| **DOJO-HISTORY-UNORDERED-CIRCUIT-1** (ligne datée du 2026-09-27, corrections du G2 de PR-2b-1, C-G2-5 (c)) | règle à trancher | après une fenêtre sans quorum, un emplacement non ordonné dont les mouvements d'un compte forment un circuit, ou une boucle pre = post, arrête (`chain_break`) même quand la fin est unique (43 cas sur 3 000 au différentiel du G2, §3.2 ; 0 cas fail-open) ; fail-closed, aucun code. La borne des emplacements non ordonnés vaut 0 (Q-2, ligne datée en fin de document) : tout emplacement non ordonné arrête déjà par (vii) | avant toute ligne datée qui relève cette borne au-dessus de 0, ou au G1 de PR-2b-3, le premier atteint | orchestrateur |
| **DOJO-HISTORY-NOQUORUM-BLOCKTIME-1** (pli cp-2 de PR-2b-2, 2026-09-27, C-V-1) | règle (forme par défaut `day_not_monotone`) | un `NoQuorum` dont le couple (emplacement, `blockTime`) ne s'apparie pas est construit sans arrêt (mesuré au cp-2, 3 cas) ; la clause « `blockTime` non nul » de D-8 (v) n'est pas opposée au corps qui en manque ; inatteignable tant que la borne `noQuorum` vaut 0 | le premier atteint : relèvement de la borne `noQuorum` au-dessus de 0, ou G1 de PR-2b-3 (QC-2) | orchestrateur, puis G1 de PR-2b-3 |
| **DOJO-HISTORY-CHECKS-COMPOSITION-1** (ligne datée du 2026-09-27, corrections du G2 de PR-2b-2, C-G2-3) | tuyau formé | le collecteur appelle `checkSupply` ((i) par transaction, frappe après SIG0), `checkCreation` ((iv)), `checkInstructions` ((vi)) et `checkBounds` ((vii)) sur chaque transaction admise avant `historyBundle` au statut `complete` ; tout échec ⇒ `partial` (§3, ligne datée) | G1 de PR-2b-3 (composition) ; G7 de PR-2b-4 (assertion par `dojo_history_collect_to_verify_end_to_end`) | orchestrateur |

## 9. Ce que je ne sais pas (liste fermée ; chaque question avec ce qui la tranche)

- **Q-1** Le rang (`transactionIndex`) est-il toujours présent et concordant dans les corps des deux opérateurs ? La page lue ne le documente pas (H-2) ; relevé : 9 corps sur 9 (R-a).
  - Tranche : le compteur d'emplacements non ordonnés du premier acte (évidence) ; si ce compteur n'est pas nul, D-7 applique le repli.
- **Q-2** Facture-t-on 10 crédits par appel gTFA `full` à `limit: 100` ? H-4 [lu] le dit, et le barème lu au pli le confirme (FAITS cp1d L-2 : 10 crédits par 100 transactions complètes rendues, minimum 10) ; la mesure n'existe qu'à `limit: 1`.
  - Tranche : le rapprochement par méthode de l'acte 0 (pli, C-26 : une page, delta attendu 10), puis celui du premier acte (delta du tableau de bord = 10 × appels).
- **Q-3** Combien de comptes de jetons du mint, fermés compris (n_acc), et combien de signatures par compte ? C'est le coût de la phase C.
  - Tranche : l'exécution de l'acte 1 (fin de phase B). SNAPSHOT-PROBE-1 (b) ne donne que les comptes ouverts.
- **Q-4** Quel débit soutenable par opérateur (limites de plan, 429) et par le grand livre durable ? Le grand livre du cycle compte 79 303 lignes (FAITS l.30), quand la mesure du RUNBOOK portait sur 10 866.
  - Tranche : la lecture sur place des limites de plan, l'essai à blanc (transport simulé, copie du grand livre) et le journal du premier acte (DOJO-HISTORY-THROUGHPUT-1).
- **Q-5** L'espace libre du volume de sortie couvre-t-il l'évidence (≈ 0,7 à 3,6 Go compressés, D-10) ?
  - Tranche : la précondition d'espace du collecteur, puis la taille réelle consignée par exécution.
- **Q-6** Une transaction en échec peut-elle changer un solde de jeton ? C'est l'hypothèse de l'exclusion avant lecture des corps.
  - Tranche : la lecture sur place de la documentation Solana sur l'atomicité des transactions ; la mesure (vii) sur les corps en échec des pages gTFA, si elles les rendent (pli, C-25).
  - **Tranchée le 2026-09-26** (pli, C-28) par la lecture L-3 (FAITS-SOLANA-ATOMICITY-1, §8) : une transaction en échec ne change aucun état de compte, frais exceptés ; aucun solde de jeton ne bouge, et l'exclusion de F avant lecture des corps (D-4) est sûre ; (vii) reste un filet.
- **Q-7** Quelles sont les formes `jsonParsed` de `burn`, `burnChecked` et `mintToChecked` ? Seuls `mintTo` et `transferChecked` ont été vus (R-c) ; l'offre courante lue, inférieure à 10^15 unités de base (mère §1.2), fait attendre des brûlages.
  - Tranche : FAITS-TOKEN2022-PARSER-1 ; à défaut, (vi) arrête sur toute forme inconnue.
- **Q-8** `owner` est-il toujours présent ? H-2b le dit « may be omitted » ; il est présent sur tout l'échantillon (R6).
  - Tranche : le compteur du premier acte ; le repli du D-5 ; sinon arrêt.
- **Q-9** Les soldes de jetons listent-ils tout compte du mint présent dans `accountKeys`, inchangé ou chargé par table (C2 : oui pour un coffre par table) ?
  - Tranche : le chaînage (iii) à chaque exécution, car une entrée manquante qui change un solde rompt la chaîne.
- **Q-10** L'historique contient-il des transferts qui ne nomment pas le mint (H-3) ? R8 : 0 sur deux comptes × 1 000.
  - Tranche : la phase C (compte des signatures vues par compte et absentes de l'index du mint).
- **Q-11** gTFA(MINT) rend-il exactement l'index helius du mint sur toute la fenêtre ? R1 ne l'établit que pour SIG0.
  - Tranche : la cohérence contrôlée par D-9 à chaque exécution.
- **Q-12** `commitment: "finalized"` passé explicitement est-il accepté par les trois méthodes ? C'est documenté (H-1, H-2, H-4) mais non essayé (C-21 (e)).
  - Tranche : l'acte 0 (pli, C-26 ; Q-F tranchée par l'orchestrateur, R-21, 2026-09-26) pour les trois méthodes : `getSignaturesForAddress` et `getTransaction(SIG0)` chez les deux opérateurs, `getTransactionsForAddress` chez helius ; une `RpcError` de paramètres arrête sans donnée.
- **Q-13** Quelles sont les extensions actuelles du mint ?
  - Tranche : DOJO-MINT-EXTENSIONS-1, soit SNAPSHOT-PROBE-1 (a) et le contrôle du mint du paquet du premier jour lu.
- **Q-14** Le paquet de PR-2 portera-t-il les deux réponses d'énumération et le mint `jsonParsed` ?
  - Tranche : le G0 ou la ligne d'amendement de PR-2 (PR-2-BUNDLE-FOR-HISTORY-1).
- **Q-15** Quelle est la facturation chainstack réelle (+15 lus pour 16 comptés) ?
  - Tranche : CHAINSTACK-AFTER-2.
- **Q-16** Le garde sous-compte-t-il les appels gTFA `full` de Bell à `limit: 1000` (É-3) ?
  - Tranche : GARDE-GTFA-FULL-TARIFF-1 (rapprochement par méthode d'une course Bell bornée).
- **Q-17** Quelle est la marge de cycle helius le jour de l'acte, Bell consommant le même cycle ?
  - Tranche : le relevé du tableau de bord (plancher) le jour même ; la garde ×10 refuse si la marge manque.
- **Q-18** (pli, C-25) gTFA `full` rend-il les transactions en échec par défaut ? H-4 nommait `filters.status` sans ses valeurs ; A1 n'a rendu qu'une transaction réussie.
  - Réponse documentaire (FAITS cp1d L-1) : `filters.status` vaut `any` par défaut, donc oui ; D-2 ne passe aucun `filters.status`.
  - Tranche : la première page de l'acte 0 (§7, point 5), mesure de confirmation.

## 10. Alternatives rejetées

- **Corps helius par `getTransaction`** : 10 fois le coût au barème et 100 fois les appels (§5, D-9). Gardé pour les seuls compléments.
- **Corps d'un seul opérateur, index de l'autre** : pas de quorum sur les soldes (mère D-18).
- **Opérateur sans clé** (solana-foundation) : témoin sans appel (cinquième pli) ; ses conditions ne sont pas lues (FAITS-SOLANA-PUBLIC-RPC-TERMS-1).
- **Égalité stricte des index comme préalable** : une signature isolée doit de toute façon être lue pour marquer ses comptes, et l'écarter perd des jours sans rien protéger (D-4, É-8).
- **Égalité du corps entier comme clé de quorum** : fragile à un champ sans effet sur les soldes ; gardée comme mesure (D-5).
- **Toujours la borne basse** : perd l'exactitude quand le rang est connu.
- **Ordre le plus favorable** : exploitable (vente d'abord).
- **Emplacement ambigu mis en jour manquant** : cache une baisse (D-7).
- **Borne appliquée par adresse** : non sur-additive (899 violations, R-j).
- **Complétude par le seul chaînage, sans pages par compte** : ne voit pas un aller-retour de solde nul entre deux transactions de l'index, alors que le minimum du jour le verrait (mère D-18 (b) conservée).
- **Garder seulement les clés réduites, sans corps bruts** : perd la preuve ; l'évidence est compressée (R-g).
- **Une seule PR** : 1 787 lignes ascendantes, contraire à R-25 (D-14).
- **Coupe « réseau d'abord »** de l'ADR-mère : les noyaux purs se testent d'abord et ne dépendent pas du lot rpc-guard (D-14).
- **Liste de méthodes commune avec PR-2** : É-6.

## 11. Conséquences

- **Positives** :
  - le paquet est recomputable à l'octet depuis l'évidence ;
  - aucun appel hors de la liste fermée ;
  - le coût helius hors phase C reste de l'ordre de 13 070 crédits pour J = 20, 26 129 pour J = 40 ;
  - la garde ×10 tient avec une large marge ;
  - l'invariance au fractionnement de mère D-16 couvre aussi les emplacements non ordonnés (D-7) ;
  - la reprise après un arrêt ne perd qu'un compte au plus.
- **Négatives** :
  - quatre PR au lieu d'une ; série Dōjō à ≈ 10 740 lignes à ×1,98 ;
  - évidence de l'ordre du gigaoctet ;
  - durée de collecte de plusieurs heures, bornée par le grand livre et le débit des plans (Q-4) ;
  - phase C non chiffrée avant l'acte 1 ;
  - un emplacement non ordonné, s'il en existe, pénalise d'au plus la somme des baisses de l'emplacement.
- **Relations** :
  - exigences transmises à PR-2 (PR-2-BUNDLE-FOR-HISTORY-1) et à PR-3a (refus du D-12) ;
  - un correctif rpc-guard ;
  - un item sur le tarif de gTFA dans Bell (GARDE-GTFA-FULL-TARIFF-1) ;
  - une correction de phrase de l'ADR-mère (ADR-SNAPSHOT-D18-ORDER-1).
  - Aucune dette délibérée : chaque point ouvert est une question avec sa mesure (§9) ou un item formé (§8).

## 12. Sources et niveaux

- **[lu] ADR-mère** : `F:/Monark-wt-dojo/docs/adr/ADR-DOJO-SNAPSHOT-1.md`, gel 7 `9f50f1d`, sha256 `956a21d7604d852e28fcca843b26c866df3eaf327e783a1dc6985ced18b63bc1`, 824 lignes, lu en entier.
- **[lu] FAITS de la sonde** : FAITS-probe-3 (`de96f092…c46cef`, 42 lignes, lu en entier) ; FAITS lectures (`aa91583d…6d38`, 62 lignes, lu en entier). Les pages web qu'ils citent sont des lectures sur place de l'orchestrateur, [lu] pour lui et citées ici par leur ligne ; ce rédacteur n'a ouvert aucune page web.
- **[lu] Sortie de la sonde** (`F:/PRODUITS/dojo-mirror/probe-3/2026-09-26T0145Z/`, `SHA256SUMS` `e8ff845f3d0b3205e73c3a9135d6114fdb3e60ed35d4e4c8b16591eafa55e28f`, `sha256sum -c` : 49 OK) :
  - `derived.json` (`e9b4a4fbbaf9f04546cdf1c8a6544cb68a29e0a9456cf02f6e510cdd42ca5514`, R1 à R9 et SMID lus en entier) ;
  - `run.json` (`b830a369a84b3861a090d0f11d758c7bda018bde245112c54ad4fdd0b01204a4`) ;
  - `calls.jsonl` (`09bc13e54f7c14b6ff8e3503939b11da4ba421a0d95cbe129c6d3988afb642f3`) ;
  - fichiers bruts cités au §4, avec leurs sha256 du `SHA256SUMS` ;
  - `reconcile/*.json` (`ec7175c1…3915`, `1c30ae34…3671`, `e5aded0f…00f1`) ;
  - `probe-3.mjs` (`8d0a65a08d08d4898d647983ed8da333d1854ce5b91d521c76187c266c8da790`, extraits cités au §1.4).
- **[lu] Mission de la sonde** : `F:/tmp/dojo/mission-probe-3.md` (`450eebf7…48bd2`), l.27 seulement (borne ×10 de la sonde).
- **[lu] Code à `9f50f1d`** (sha256 recalculés) :
  - `packages/rpc-guard/src/` : `client.ts` `6553556c…d50f`, `guarded.ts` `a36fa005…7fab6`, `tariff.ts` `77d5876c…3b48`, `transport.ts` `64a84454…385e`, `ledger.ts` `625c759f…6cb`, `reconcile.ts` `6e62cd6a…5aa`, `cli.ts` `dccbe95f…7d20`, `lock.ts` `6655a9c8…244`, `bell-methods.ts` `a18b856b…935d`, `index.ts` `db2908e9…c5c8`, `errors.ts` `8622947f…c504`. Tous égaux aux épingles de `probe-3.mjs:30-44`.
  - `apps/bell/src/` : `quorum.ts` `5871b4b6…1d53`, `operators.ts` `8e76a6c9…a50e`, `rpc.ts` `b422791e…f92f`, `discover.ts` `c033ea4d…dca3`, `rebase-produce.ts` `25a64a65…60e9`, `rebase-crosscheck.ts` `15cc8773…1adb`, `collect.ts` `4eb82713…b829`.
  - `apps/bell/scripts/bell-chain.mjs` (l.14-47) ; `packages/rpc-guard/test/harness.ts` `9188c606…c6b3` ; `.github/workflows/ci.yml` `0f401ae2…949a` ; `docs/RUNBOOK-rpc-guard.md` `ae0c283a…510c2e` ; `docs/adr/ADR-M018-regle-branchement.md` `c505d4c8…9041` ; `out/mint.txt` `9b4e275a…decb`.
- **[lu] Gabarit** : corpus `templates/adr.md` (`ffface97bbf71d4f89dcb6b08b3cd443154cd6993dd5fa0c9af28a5f3286511e`), dont ce document suit la structure (statut, dates, propriétaire, gate, éléments affectés, contexte, décisions, sources, alternatives rejetées, conséquences), étendue par la mission.
- **[lu] Tronc** : `F:/Monark/docs/CHANTIERS.md` l.1579-1589 (à `96026ae`).
- **Relevés du rédacteur (§1.3)** : scripts sous `F:/tmp/claude/F--Shogen/90684fb2-4e7b-42e9-b820-f042dc4465f3/scratchpad/`, Node v24.15.0, sans réseau, entrées = fichiers de la sonde. Chaque ligne donne le sha256 du script, puis celui de sa sortie :

| Script | sha256 du script | Sortie | sha256 de la sortie |
|---|---|---|---|
| `inspect-bodies.mjs` | `144eb58b78abb04be0b7f45e2ef8163d23cdcb14e57dbe01370c9d455006e9da` | `out-inspect-bodies.txt` | `ce662643b63b387f14f6e58b04a4165ef11b9bc8452e3884a114c7e62cf93f1f` |
| `inspect-txindex.mjs` | `6d3bb0c2b016ca868bfb1f87dd370f7ff29392a2fff25ebfcb7050fdb215a909` | `out-inspect-txindex.txt` | `ea9127cf8b5f5ab099d17988fa51e20721035ee91d546d0761ada89381875f89` |
| `inspect-pages.mjs` | `3ece82889c1c8bc55a78c3f40a1354820e4a086ef2b0194d50d5b8fa3b0406ed` | `out-inspect-pages.txt` | `db646a719a094cc3b07b08b3efaf6124499a108d6a1c1b5ebaf35014e51226fd` |
| `diff-bodies.mjs` | `562e7445d6c0fa0941f72c76b83edc7e1e336e711ce473fe9ef867cb6d6b3c3d` | `out-diff-bodies.txt` | `0c4c5233a4406524a144b6c4aa1f7742aa38b884d1ec3975157021584600aad7` |
| `diff-gtfa.mjs` | `d4f6d3da7be1a90ecfca96f227b6d2f973329b3dbaf4482a68a2b6a90b260fcd` | `out-diff-gtfa.txt` | `eaf1e5f7b6d53e04da2b0170663d043f6011890bce6af7aab8b6976c6f844eae` |
| `gzip-ratio.mjs` | `aeed52e30c4fc464221b20637eeb26c77c824186f19594c1fdfac220e2d6a46a` | `out-gzip-ratio.txt` | `64e5848df337876e60c535308143ffd8d66d8a3e4ef23ad0124b584ce6010562` |
| `caps.mjs` | `c28f1376bd64aee83a0108626ee9cb5ecb89ab39c5408b86cae4a55e09c01d77` | `out-caps.txt` | `38fb7c40c8fea84a31eff45911489acd336b193fbe93e62f1b8f4dbf105db463` |
| `pages-days.mjs` | `f6aeb69115eac78c5e1208a12b5b3516df8d44fec3d045482d2c888c50a0a7d9` | `out-pages-days.txt` | `6954e830232eb50475e857acde57ca865ca0fc0a40c31e12c3a58adbf6c51a19` |
| `sig0-ext.mjs` | `2e08f4fe494451cacb43e412698a6e139ffc41d1db2825effefc983ac738646f` | `out-sig0-ext.txt` | `534b14325490274d7992772cab0cf8cb1fafad27b6424e2ec9557fa69084eec9` |
| `names-closekey.mjs` | `e82d67e636100998e40cbd237402b7a8074a0cb28755788a6f4b863deb0366cb` | `out-names-closekey.txt` | `2f8610111a11b71450733c0523e537752468c3cfad328e6d675e026b24b130eb` |
| `slot-rule.mjs` (M-H1) | `a80345c449bdc1080226a3e34f61381a7e11847bb71c9427ec6d0b4cf2cb6b65` | `out-slot-rule.txt` | `83a2b62702dcb13757ce530100f71e9eb212e7d6be43d56f1b2810e0535dcc52` |
| `sig0-unparsed.mjs` | `ff4e363cddeb7cc52f1a3246911b9ab87995758acf3cd0fce70798074790d0de` | `out-sig0-unparsed.txt` | `c1911411470efcc0945ba5ca289cd95fa45df4c0352d12137920a241caf287c7` |

- **Pour rejouer** : `node <script>` depuis n'importe quel répertoire. Les chemins d'entrée sont absolus ; aucun script n'écrit hors de sa sortie redirigée. Chaque script lit les fichiers de la sonde et n'appelle rien.
- **[2nd]** : aucun chiffre de seconde main n'est présenté comme un fait. Les étiquettes de rôle des comptes (courbe de liaison, pool) restent [2nd] via l'ADR-mère §1.2 et ne portent aucune décision de ce document : la classe vient de la courbe (mère D-6).
- **Chiffres** : chaque chiffre renvoie à une ligne de FAITS, à un champ de `derived.json`, à un champ d'un fichier de sortie de la sonde listé dans son `SHA256SUMS` (`calls.jsonl`, `run.json`), à une constante du code (fichier:ligne), à un relevé du §1.3 (script et sortie hachés), ou à l'arithmétique déclarée sur ces sources. Les trois dernières catégories ajoutent aux deux sources nommées par la mission : c'est un écart déclaré, que l'orchestrateur peut refuser.

## 13. Provenance

| Date | Objet | Modèle (identifiant résolu) | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-26 | G0 du lot PR-2b, `docs/adr/ADR-DOJO-PR-2B.md`, non committé, base `9f50f1d` | `claude-opus-5-5[1m]` | max | message de mission de l'orchestrateur ; ADR-mère gel 7 ; FAITS de la sonde ; sortie de la sonde ; code du dépôt | worker | orchestrateur (R-21), puis checkpoint-1 bref | sans objet (G0) |
| 2026-09-26 | Pli des corrections du checkpoint-1 bref (C-25 à C-31, D-7, É-8 et DOJO-GTFA-TOKENACCOUNTS-1 ici ; C-24 et décision 231 dans l'ADR-mère, sixième pli), même fichier, base `3a5e591`, non committé | `claude-opus-5-5[1m]` | max | mission `F:/tmp/dojo/mission-pli-pr2b.md` et message de l'orchestrateur (décision 231) ; rapport CP1D ; FAITS cp1d ; CHANTIERS du tronc (2026-09-26 14:45 et 15:0x) ; ADR-mère | worker | orchestrateur (R-21) | sans objet (G0) |

- **Horloge (`date -u`)** : 05:59:42Z (ouverture), 06:32:40Z (relevés), 06:39:08Z (début de l'écriture) ; l'heure du hachage final est rendue hors du fichier.
- **Commandes `git`, en lecture seule** : `log`, `status`, `show <sha>:<chemin>`, `branch -a`, `log --all -- <chemin>`. Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `git merge-tree --write-tree`, aucune commande `git` qui écrive.
- **Réseau** : aucun appel réseau, aucun appel RPC ; aucune page web ouverte.
- **Écritures** : rien écrit sur C: (le corpus y a seulement été lu). Un seul fichier touché dans le dépôt : celui-ci, non suivi, jamais commité. Il a été écrit d'un bloc par l'outil d'écriture de fichiers à partir de 06:39:08Z : un heredoc aurait dépassé la borne de lexage du harnais (HARNESS-BASH-8K-1). Il a ensuite été corrigé en place par l'outil d'édition, de 06:4xZ à 06:55Z, en treize éditions identifiables dans la liste qui suit (celle-ci comprise ; compte rectifié au pli, C-30) :
  - renvoi « D-15 » corrigé en « §4 » (§3) ;
  - `probe-3.mjs:545` corrigé en `:546` (D-10) ;
  - deux lignes du tableau du D-4 reformulées ;
  - condition de fin de la phase A (page vide comprise) ;
  - retour du sha256 `unlocked` par `unlock` (D-13, point 3), puis accord « La sous-commande » ;
  - trois barres obliques inverses, employées comme « moins ensembliste », remplacées par `∖` en deux éditions : le texte n'en porte plus aucune (HARNESS-BASH-BACKSLASH-1) ;
  - D-12 et D-13 ajoutées à la liste des décisions nouvelles du statut ;
  - note sur SIG0 et (vi) au D-8 ;
  - ligne `sig0-unparsed.mjs` au §12 ;
  - enfin ce paragraphe.
  Les scripts de relevé ont été écrits par heredoc de moins de 6 Ko dans le répertoire de travail de session.
- **Advisor** : consulté deux fois par l'outil intégré. Le premier appel, après l'orientation et avant l'écriture, a expiré (« The advisor timed out. Proceed without it. ») : indisponibilité consignée, non contournée. Le second, après l'écriture, a relevé trois points, tous appliqués après vérification sur pièces : la provenance des corrections en place (ce paragraphe), D-12 et D-13 au statut, et SIG0 face à (vi), vérifié par `sig0-unparsed.mjs`. C'est un conseil, jamais un verdict.
- **`error_origin` proposés, à assigner au G7** :
  - É-1 (heure du FAITS l.17) : orchestrateur (rédaction du FAITS) ;
  - É-2 (phrase de mère D-18) : rédacteur de l'ADR-mère, quatrième pli ;
  - É-3 (tarif de gTFA ; rectifié au pli, C-30) : non établi : lecture du 21/09 incomplète (FAQ pricing ; page de référence gTFA non lue) ou barème Helius changé (page credits : « metering starts on September 24, 2026 » pour les Parsed Events) ; ordre de grandeur mesuré le 2026-09-26 : ×10,33 (FAITS cp1d §4) ; à établir par GARDE-GTFA-FULL-TARIFF-1 ;
  - É-4 et É-5 : estimations antérieures à la sonde, aucune erreur ;
  - É-6 à É-8 : aucune erreur, raffinements soumis au checkpoint-1 bref.
- **Pli des corrections du checkpoint-1 bref (2026-09-26)** : rédacteur worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` déclaré à l'ouverture, R-1), effort max, contexte frais ; mission `F:/tmp/dojo/mission-pli-pr2b.md` (sha256 `045ca1474fc783c86226429c1d5cfefde92e51bcef47676469ca41b353a10325`), complétée par un message de l'orchestrateur (décision 231, ADR-mère seule) ; base `3a5e591`, `git status --short` vide à l'ouverture ; horloge `date -u` : 15:25:38Z (orientation), 15:28:40Z (ouverture du pli) ; fichiers touchés : `docs/adr/ADR-DOJO-SNAPSHOT-1.md` (sixième pli) et ce fichier ; éditions par remplacements exacts, tout ou rien (script Node écrit hors dépôt, `F:/tmp/claude/F--Monark/e03dd7cc-4452-4c79-9aa6-58827dad4d19/scratchpad/pli/apply.mjs`), appliquées sur copie puis recopiées ; `git diff --stat` : `ADR-DOJO-PR-2B.md` 67 insertions, 27 suppressions ; `ADR-DOJO-SNAPSHOT-1.md` 44 insertions, 19 suppressions ; `git` en lecture seule, aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun réseau, rien sur C: ; advisor intégré consulté avant les éditions et avant la remise ; sha256 après le pli rendu hors du fichier ; réviseur : orchestrateur (R-21).

## Corrections checkpoint-1 bref (amendement daté du 2026-09-26, fait foi)

- **Sources** : rapport du validateur-humain `claude-fable-5-1`, `F:/tmp/dojo/cp1d/CP1D-report.md` (sha256 `4fa57831c169d387a60e9515eba0d1531b0a040cb6a3dab614d5b57c2921b7ef`), verdict ACCEPTE-AVEC-CORRECTIONS sur ce document au commit `3a5e591`, liste fermée C-24 à C-31 (rapport §5) et information D-7 (rapport §6) ; lectures sur place de l'orchestrateur `docs/dojo/FAITS-cp1d-lectures-2026-09-26.md` (tronc `lot/etude-suite`, fichier committé à `5e2a3e8`, sha256 du blob `598a43e59ed616e64f140acbb6794513fe3c873d2ed1a00aff957ac0840b856a`), lectures L-1 à L-3 et §4 ; avis de l'agent advisor du 2026-09-26 14:45, retenu par l'orchestrateur (`F:/Monark/docs/CHANTIERS.md`, tronc `lot/etude-suite`, commit `54dfa51`, entrée « 2026-09-26 14:45 UTC » ; absente de la branche de ce document). Pli ouvert le 2026-09-26 à 15:28:40Z (`date -u`), en place, sans commit.
- **Règle de lecture** : cet amendement fait foi sur tout le texte antérieur ; chaque édition en place porte la mention « pli » ou renvoie à ce pli ; §1.1 et §1.5 restent la trace du G0 (état de l'ADR-mère au gel 7, écarts tels que relevés).

| Correction | Contenu retenu | Pliée dans | Preuve ou source |
|---|---|---|---|
| **C-24** (bloquante avant le G1 de PR-2b-1) | neuf points (a) à (i) de l'ADR-mère | ADR-mère, sixième pli (amendement daté en fin de document) | rapport §5 |
| **C-25** (bloquante avant le G1 de PR-2b-3) | cohérence gTFA ↔ index écrite sur R, jamais sur F (les trois phrases du validateur) ; (vii) sur les corps en échec conditionnelle (« si les pages les rendent »), avec compteur ; Q-18 : réponse documentaire L-1 (`filters.status` défaut `any`), D-2 ne passe aucun `filters`, mesure de confirmation à la première page de l'acte 0 ; M-Y26 reformulé | D-2 ; D-3 (phase B) ; D-8 ((vii), transactions en échec) ; D-9 (cohérence, rejets) ; §4 (test et mutant M-Y26) ; §9 (Q-6, Q-18) | FAITS cp1d L-1 |
| **C-26** | acte 0, go par action : une page gTFA `full` à `limit: 100`, une page `getSignaturesForAddress` et un `getTransaction(SIG0)` à `finalized` explicite par opérateur, `unlock`, rapprochement `--course-end` par opérateur dès que RECONCILE-WINDOW-1 existe, sinon par lecture du tableau de bord (orchestrateur, consigné) ; 12 crédits helius au barème (10 + 1 + 1) et 4 RU chainstack (2 + 2), au plus quatre appels par opérateur, marge de reprise 0 (Q-F, ligne datée ci-dessous) ; tranche Q-2, Q-12 (trois méthodes) et Q-18 | D-10 ; §7 (points 4 et 5) ; §8 (DOJO-HISTORY-ACTE-1) ; §9 (Q-2, Q-12, Q-18) | barème du garde (`tariff.ts:12-30`, `:54-57`) ; FAITS cp1d L-2 |
| **C-27** | verrous `<cycleDir>/<op>.lock` partagés avec Bell : courses bornées en durée (paramètre déclaré, reprise D-11 entre deux courses) placées entre deux courses Bell, ou pause de Bell déclarée ; fail-closed dit pour qui (Bell : ligne du jour manquée ; le collecteur ne s'ouvre pas) | D-11 (arrêt sur durée) ; §6 (TY-12) ; §7 (point 4) ; §8 (DOJO-HISTORY-ACTE-1) | rapport §5 ; D-10 (durées) |
| **C-28** | FAITS-SOLANA-ATOMICITY-1 formé et clos par L-3 (URL, 14:31Z, citation) ; Q-6 tranchée | §8 ; §9 (Q-6) | FAITS cp1d L-3 |
| **C-29** | TU-12a et TU-12b : « composé en test (chaîne simulée) ; servi au G7 de PR-3a puis de la pièce » ; TU-1h et test d'intégration : paquet du premier jour lu écrit par l'écrivain de PR-2 (sortie committée de son test) ou chargé par son lecteur, jamais construit à la main | §3 (table, déroulé point 2) | rapport §3.8 |
| **C-30** | `error_origin` de É-3 non établi, ordre de grandeur mesuré ×10,33, à établir par GARDE-GTFA-FULL-TARIFF-1 ; item à deux nombres (réservation avant appel 10 × ⌈limit / 100⌉ ; grand livre après appel 10 × ⌈rendus / 100⌉, minimum 10), déclencheur avant toute collecte Bell et avant le G1 de PR-2b-3 ; compte des éditions du §13 rectifié à treize | §8 ; §13 | FAITS cp1d L-2 et §4 |
| **C-31** | paragraphe MAST : FM-1.1 (« FM-1.2 » au rapport), FM-2.4 (« FM-2.x » au rapport), FM-3.1 et FM-3.3, chacun avec sa contre-mesure déjà écrite | fin du §6 | mère §9 |
| **DOJO-GTFA-TOKENACCOUNTS-1** (avis 14:45) | item-sonde : jamais un substitut de la phase C ; sonde d'environ 10 crédits ; déclencheur avant le G0 de PR-2b-4 | §8 | FAITS cp1d L-1 ; `calls.jsonl` de la sonde (D1 = compte `6tW6…YWo`) |
| **D-7** (rapport §6) | information et recommandation, aucune décision nouvelle ; déclencheur d'escalade (compteur Q-1 non nul à l'acte 1 et un détenteur touché ⇒ effet mesuré présenté à l'investisseur avant publication) ; `null` rejeté (mère P-29 bis, décision 228) | D-7 | rapport §2 (0 violation), §6 |
| **É-8** (avis 14:45) | borne sur X rapportée à R : chiffre sans source jusqu'au G1 de PR-2b-1, justification due ; tout X > 0 consigné dans le FAITS de l'acte, borne franchie ou non | D-8 (vii) ; ADR-mère, sixième pli (b) | avis de l'agent advisor (CHANTIERS, 14:45) |

- **Retouches hors de cette table, déclarées** : en-tête (Statut : checkpoint-1 bref tenu) ; §8, RECONCILE-WINDOW-1 (É-7 accepté, rapport §3.3) et ADR-SNAPSHOT-D18-ORDER-1 (clos par le sixième pli de l'ADR-mère, point (a)) ; §13 (provenance du pli).
- **Inchangé** : §0 ; §1 ; D-1, D-4 à D-6 et D-12 à D-14 ; §5 ; §10 à §12 ; l'estimation R-25 de D-14 (1 787 lignes ascendantes), non ré-évaluée par ce pli : la mesure du G1 fait foi (mère C-6).
- **`error_origin`** : É-3 rectifié au §13 (C-30) ; les autres inchangés.
- **Q-F tranchée par l'orchestrateur (R-21, 2026-09-26)** : l'acte 0 comprend aussi un `getTransaction(SIG0)` à `commitment: "finalized"` explicite (`maxSupportedTransactionVersion: 1`, `encoding: "jsonParsed"`) par opérateur ; Q-12 est tranchée pour les trois méthodes par l'acte 0 ; plafonds de l'acte 0 : 12 crédits helius (gTFA 10 + `getSignaturesForAddress` 1 + `getTransaction` 1) et 4 RU chainstack (`getSignaturesForAddress` 2 + `getTransaction` 2), au plus quatre appels par opérateur, marge de reprise 0 (tout dépassement est un arrêt). Éditions : §7 point 5, D-10 (acte 0), §9 Q-12, table de ce pli (C-26) ; rédacteur worker `claude-opus-5-5[1m]`, base `1dd71f9`, sans commit.

## Lignes datées des corrections du G2 de PR-2b-1 (2026-09-27, ajout seul, fait foi)

- **Sources** : rapport G2 de PR-2b-1 `F:/tmp/dojo/g2-pr2b1/G2-report.md` (relecteur `claude-opus-5-5[1m]`, sha256 `e42da218a081e8ceb62927d50ca874ee97fb1348828c9f26a257a9a78c1a58a8`), verdict CORRECTIONS D'ABORD, corrections C-G2-1 à C-G2-6 ; décisions de l'orchestrateur : mission du correcteur `F:/tmp/dojo/mission-corr-pr2b1.md` (sha256 `50853d4cecd28e70e8374ac7adb5ada8dbb6c4539398afc5767cebeb31147ef0`), CHANTIERS du tronc `lot/etude-suite`, commits `2b997af` (Q-1 à Q-8 du G1) et `bb4f8a5` (G2). Rédacteur : correcteur worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1), contexte frais, distinct du relecteur ; base `02884eb`, sans commit.
- **Q-2 (D-8 (vii), bornes ; ligne due avant le G1 de PR-2b-3, premier appelant de `checkBounds`)** : bornes retenues, entrée explicite de `checkBounds` (aucune valeur par défaut) : corps en échec des pages avec pre ≠ post sur le mint **0** (FAITS-SOLANA-ATOMICITY-1, FAITS cp1d L-3) ; emplacements non ordonnés **0** (déclencheur d'escalade du D-7 ; 0 sur 2 937 emplacements partagés, R-f) ; transactions sans quorum **0** (corps 9 sur 9 égaux, R-b) ; X rapporté à |R| **3 / 2 000**. Justification de la dernière : sur n = 2 000 entrées comparées sans écart (B1 et B3 contre la liste du premier opérateur, 0 contestation au sens complet de D-4, vérifié au G2 §4), le plus grand taux p qui garde une probabilité d'au moins 5 % d'observer 0 écart est 1 − 0,05^(1/2 000) = 0,0014967 ; 3 / 2 000 = 0,0015 ≥ 0,0014967. **Le seuil de 5 % est une convention déclarée, non une source.** Tout X > 0 est consigné dans le FAITS de l'acte, borne franchie ou non (É-8). Une borne ou un compteur qui n'est pas un entier naturel arrête (`read_malformed`, C-G2-2).
- **Q-6 (D-8 (vi) l.370 ; C-G2-5 (d))** : (vi) s'applique aux seules transactions **admises**. Un corps sans quorum relève de l'arrêt du D-6 (instruction d'offre sur MINT ⇒ ARRÊT, l.335-336) et n'est pas soumis à (vi) ; une instruction Token-2022 non analysée qu'il porterait, et qui pourrait cacher une frappe que l'arrêt d'offre du D-6 ne voit pas, est rattrapée par le contrôle (i) par jour à la fermeture de la fenêtre (D-8 (i), PR-2b-2 ; D_LAST doit être évaluable).
- **Q-7 (D-8 (iii) l.367, D-5 l.329 ; règles du journal G1 §4 point 9, confirmées au commit `2b997af`), précisions C-G2-5** :
  - (a) deux transactions admises d'un même emplacement **ordonné** au même rang : arrêt `read_malformed` (leur ordre dépendrait de l'ordre d'entrée, contraire au déterminisme de D-3) ; codé dans `chainAccounts`, testé dans les deux ordres d'entrée, sonde P-11 tuée ;
  - (b) trou dans l'emplacement d'un groupe ordonné : seule la première transaction du groupe est libérée ; arrêt déclaré ; item **DOJO-HISTORY-ORDERED-HOLE-1** (§8), déclencheur : G1 de PR-2b-3 ;
  - (c) circuit ou boucle pre = post dans un emplacement non ordonné après une fenêtre : arrêt même à fin unique, fail-closed, aucun code ; item **DOJO-HISTORY-UNORDERED-CIRCUIT-1** (§8) ;
  - (e) `meta.innerInstructions` à `null` se lit « aucune instruction interne » (`history-read.ts`, lecture du corps) ; assertion au test `dojo_history_instruction_allowlist_stops`.
- **Preuve des fixtures de pages** : la forme canonique (Q-3) trie les clés ; une page réduite n'est donc pas une sous-chaîne octet pour octet de la réponse brute. La preuve retenue est la **réduction indépendante des réponses brutes, 17 fixtures sur 17 égales** (G2 §3.2) ; pour les corps, le contrôle « sous-chaîne octet pour octet » des pièces gardées est admis.
- **`error_origin`** : C-G2-1 : G0 (table du §4) et G1 ; C-G2-2 à C-G2-4 et C-G2-6 : G1 ; C-G2-5 : G1 (règles non écrites au G0, posées en question Q-6 et Q-7 par le G1).

- **Acceptation G7 de PR-2b-1 (orchestrateur `claude-fable-5-1`, 2026-09-27, `date -u` 09:29Z)** : gel `eb5392a` ACCEPTÉ au checkpoint-2 (rapport `docs/CHECKPOINT2-lot-dojo-pr2b1.md`, sha `a51bd12f…` : R-25 747, 6/6, 62/62, 7/7 gates, test 42, 57/57 mutants, 17/17 fixtures réduites indépendamment, différentiel du chaînage 3 998 cas 0 fail-open, 0 opérateur nommé). Corrections en items (aucune reprise du gel) : **C-V-1** regex du test l.100 (`\.` devenu `.`, `error_origin` correcteur G1) → à corriger au G1 de PR-2b-2 s'il touche ce test, sinon lot suivant ; **C-V-2** `sources.json.probe_dir` = chemin local absolu (`error_origin` réducteur G1) → identifiant de sortie de sonde au prochain passage du réducteur, jamais un `sed` sur le gel ; **C-V-3** registre : QC-1 (sha partagés C1 et C2 sous le même appel ; A3/A4, A6/A7, B1/B2 séparés par l'appel), QC-2 (déclencheur confirmé ; symétrie : la borne `noQuorum` = 0 rend ORDERED-HOLE-1 et UNORDERED-CIRCUIT-1 inatteignables ensemble, les deux s'ouvrent au même moment), Q-8 (`error_origin` orchestrateur : mission citant un pli absent de la branche). Pièce `upcoming` jusqu'au G7 de PR-3a (TU-12c). Dérive ×1,37 au prochain pli de la mère. Suite : PR-2b-2 (G1 en cours sur ce gel).
## Lignes datées des corrections du G2 de PR-2b-2 (2026-09-27, ajout seul, fait foi)

- **Sources** : rapport G2 de PR-2b-2 `F:/tmp/dojo/g2-pr2b2/G2-report.md` (relecteur `claude-opus-5-5[1m]`, sha256 `3004f658fe7c92230731c44ba80a8be9b0e0d1362730b37b30d3581ebcf5a32f`), verdict CORRECTIONS D'ABORD, corrections C-G2-1 à C-G2-6, scénarios S1, S3', S4', S5, S6, S7 ; décisions de l'orchestrateur : mission du correcteur `F:/tmp/dojo/mission-corr-pr2b2.md` (sha256 `0a1e264fc089e6590c956b236deb14105e3e541e58deb26d61123942ff13b468`), CHANTIERS du tronc `lot/etude-suite`, commit `0e30841`. Rédacteur : correcteur worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1), contexte frais, distinct du relecteur ; base `eb5392a`, sans commit.
- **D-6 l.342 et D-3 l.290 (Q-7 reprise ; C-G2-1)** : « tout propriétaire de a » pendant la fenêtre se lit ainsi :
  - rendus `null` sur toute la fenêtre [jour(s), jour(t')] : le dernier propriétaire admis à l'entrée ; tout propriétaire qu'un corps sans quorum nomme pour a ; les propriétaires, pre et post, des entrées de a dans les transactions admises des emplacements [lo, hi] de la lecture sans quorum (leur ordre relatif à elle est inconnu) ; le propriétaire **côté pre** de la transaction t' qui ferme la fenêtre (état révélé : il a pu posséder a à tout instant de la fenêtre) ;
  - rendu `null` au **seul jour d1 = jour(t')** : le propriétaire **côté post** de t', qui ne possède a qu'à partir de t' (D-3 l.290 : « comptes de O ce jour-là »). L'annuler aussi de jour(s) à d1 − 1 cacherait ses ventes sur ses autres comptes, un jour `null` ne remettant rien à zéro (D-7 l.356, mère P-29 bis) : fichier publié immuable ;
  - précision du correcteur, déclarée : dans un emplacement de fermeture **ordonné**, t' est la première transaction admise sur a dans l'ordre des rangs ; les propriétaires des transactions suivantes de cet emplacement, pre et post, ne possèdent a qu'à partir de t' : `null` au seul jour d1. Dans un emplacement de fermeture **non ordonné**, l'ordre est inconnu : le côté pre de chaque transaction sur a est traité comme celui de t' (toute la fenêtre), le côté post au seul jour d1 ; sans effet tant que la borne des emplacements non ordonnés vaut 0 (Q-2, ligne datée du G2 de PR-2b-1).
  - Preuves : `history-build.ts` (`mark`, ensemble `atClose`) ; test `dojo_history_no_quorum_span_until_next_quorum_read`, scénarios S3' (vente à j4 publiée, ligne « 0 », lot sorti puis né à j6 ; `null` à j5 seul), S7 (propriétaire recréant a à la fermeture : `null` à j5 seul), S8 (côté pre révélé : toute la fenêtre) ; sondes P-02c, P-C1 à P-C4 et P-C7 tuées.
  - `error_origin` : **orchestrateur et G1** (lecture posée en Q-7 au G1 ; confirmation de l'orchestrateur sur un texte qui ne montrait pas la conséquence ; CHANTIERS `0e30841`).
- **D-8 (v) l.369 (C-G2-3, question tranchée par l'orchestrateur)** : (v) s'applique aussi aux corps **sans quorum** : un seul `blockTime` par emplacement, quel que soit le quorum, et `jour` non décroissant en ordre d'emplacement, corps admis et corps sans quorum confondus ; échec : ARRÊT `day_not_monotone`. Codé dans `buildHistory` (`checkDays` de PR-2b-1 sur les transactions admises et les couples (emplacement, `blockTime`) des `NoQuorum`) ; assertion : deux corps d'un même emplacement sur deux jours ⇒ `day_not_monotone` ; deux corps à deux emplacements ⇒ la fenêtre part du plus petit jour lu (D-6 l.341 ; sonde P-22 tuée, P-C5 tuée). Un `NoQuorum` dont un corps n'a pas de `blockTime` et dont les deux corps sont à deux emplacements différents ne laisse pas apparier son `blockTime` : question du correcteur (journal G1 de PR-2b-2, §16), fail-closed à trancher.
- **§3 et §8 (C-G2-3)** : tuyau de composition des contrôles (i) par transaction, (iv), (vi), (vii) avant `historyBundle` au statut `complete` : ligne datée du §3, item DOJO-HISTORY-CHECKS-COMPOSITION-1 du §8.
- **D-11 (C-G2-4 ; Q-6)** : `record_malformed` (refus de PR-2, levé par `readRecord` sur les enregistrements du premier jour lu) est un motif de `partial` (`DOJO_HISTORY_PARTIAL_REASONS`, 18 motifs) ; ce n'est pas un des 45 codes du vérificateur (mesuré). L'arrêt sur durée (C-27) reste à nommer au G1 de PR-2b-3 (Q-6).
- **`error_origin`** : C-G2-1 : orchestrateur et G1 ; C-G2-2 à C-G2-6 : G1 (tests, journal, liste des motifs, grille).

- **Lignes datées (orchestrateur, 2026-09-27, `date -u` 11:53Z) — PR-2b-2** : **D-7** : L_s négatif ⇒ arrêt fail-closed `bound_exceeded` (Q-2 du G1 ; les alternatives « plancher par adresse » et « somme des max(L_a, 0) » rejetées : l'une casse la sur-additivité, l'autre abaisse la valeur sous D-7) ; **D-12** : `eve.json` vit dans `publish/` et est énuméré par `publish/SHA256SUMS` (quatre fichiers ; chemins relatifs à `publish/`), conformément à la disposition d'ADR-DOJO-PR-2 D-7 (Q-4) ; **QC-1** : P-20 = mutant équivalent DÉCLARÉ tant que `history-read.ts` est gelé ; **QC-3** : précision D-6 confirmée (emplacement ordonné : seule la première transaction sur a ferme, les suivantes `null` à d1 seul ; non ordonné : pre `null` sur la fenêtre, post `null` à d1) ; **QC-4** : (v) sur les corps sans quorum = ses deux contrôles (un `blockTime` par emplacement ; jours non décroissants), confirmé ; QC-2 (couple sans quorum à un seul `blockTime` sur deux emplacements) → G1 de PR-2b-3, forme fail-closed `day_not_monotone` par défaut.

- **Ligne datée (orchestrateur, 2026-09-27, `date -u` 13:07Z) — G7 de PR-2b-2 (cp-2 ACCEPTE-AVEC-CORRECTIONS, rapport `F:/tmp/cp2-pr2b2/CP2-report.md` sha `c9c8094a…`)** : C-V-1 appliquée (item DOJO-HISTORY-NOQUORUM-BLOCKTIME-1 au §8, `error_origin` : correcteur G1 + orchestrateur — QC-2 posée en ligne datée sans mesure) ; C-V-2 consignée (`DELIVERED.sha256` cite l'ADR à 938 l., le gel en porte 940 : bloc l.939-940 ajouté par l'orchestrateur après livraison, ajout seul vérifié ; `error_origin` orchestrateur). Points 3-6 du validateur : pièce `upcoming` jusqu'au G7 de PR-3a ; R-25 637 = ×1,20 de 530 (au pli de la mère) ; `historyBundle` écrit les trois contrôles à `pass` sans condition (l.250-251) — seule garde = composition de PR-2b-3, **consigne portée au G1 de PR-2b-3 en vol** (preuve des quatre contrôles par le collecteur, assertée par `dojo_history_collect_to_verify_end_to_end`) ; QC-2, Q-6, Q-10, contrat `firstRead`, composition (i)/(iv)/(vi)/(vii) déjà dans la mission G1 de PR-2b-3. **Verdict G7 : PR-2b-2 ACCEPTÉE** au gel 2 ; fusion `--no-ff` dans `lot/etude-suite`.
