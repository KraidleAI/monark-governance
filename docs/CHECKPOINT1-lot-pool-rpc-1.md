# CHECKPOINT-1 (PLAN) — lot POOL-RPC-1

Avis du `validateur-humain`, modèle résolu **`claude-fable-5-1`** (R-1), instance séparée à contexte frais, 2026-09-21. **Persisté au format `docs/CHECKPOINT1-*` par le rédacteur `claude-opus-4-8[1m]` sur mandat de l'orchestrateur**, depuis l'avis relayé : résumé **`docs/CHANTIERS.md:426-427`** (ré-ouvert ce tour) + **texte intégral des corrections/rulings transmis en mission**. **À vérifier adversarialement par l'orchestrateur (R-21) avant consommation.** Artefact jugé : `docs/G0-lot-pool-rpc-1.md` au commit **`7476b32`**, sha256 **`e160118c779a643c3a607969e990598a6d5ee3f7c1b76b531ee66cec187ffc8a`** (recalculé conforme par le rédacteur ce tour, `sha256sum` local, sans réseau). Aucune écriture au dépôt, aucune action sortante ; `F:\Monark` en lecture seule (HEAD `af7109d`).

**Honnêteté de persistance (doc 03)** : les corrections C-1..C-8, N-1..N-5, R-L4 et les rulings Q1..Q4 + décisions orchestrateur ci-dessous sont **transmis intégralement** (register du validateur conservé). Les sections **« Vérification des faits »** et **« Checklist CA »** de l'avis original **n'ont PAS été relayées verbatim** : elles sont **reconstituées ci-dessous depuis les `fichier:ligne` que chaque correction rouvre** (marquées *reconstituée*), jamais fabriquées.

## Décision
**ACCEPTE-AVEC-CORRECTIONS** — bloquantes **C-1 à C-8** (à plier dans le G0 avant tout code) — **plus ESCALADE-INVESTISSEUR LÉGÈRE E-1**. Non bloquantes **N-1..N-5** et **R-L4** à plier aussi (ou item formé à déclencheur). Rulings **Q1..Q4** et décisions orchestrateur tranchées. **E-1 levée post-avis (voir §ESCALADE).**

## Vérification des faits (*reconstituée* depuis les corrections transmises)
Les renvois `fichier:ligne` du G0 source sont exacts sur pièce là où les corrections s'y appuient ; les défauts relevés sont d'**exhaustivité** et de **motif**, non d'inexactitude de ligne :
- Inventaire NON exhaustif : le consommateur **Bell jambe Ethereum** (`apps/bell/src/ethereum.ts:16,76-77` → `apps/bell/src/collect.ts:638`) importe `GET_LOGS_PROVIDERS` et le passe comme `ethCallProviders` ET `getLogsProviders`, sans jambe Chainstack ni garde de budget — **absent du G0** (C-1).
- Corrélation de quorum cachée : `eth-pokt.nodies.app` est une passerelle **adossée à Pocket** (`…\conf-src-2\06-nodies.md:5`, `scripts/census/burns-by-burner.mjs:18-19`) — le G0 les comptait comme 2 opérateurs distincts (C-2).
- Invariant erroné : le G0 vise `ukemi_sha` (`record.ts:211`), un **témoin de build** hors digest qui change à tout édit ; l'invariant réel de byte-identité est `book`/`book_digest`/`holders_digest` + `PINNED_DIGEST` (`ukemi-u4-scores.test.ts:20`) (C-4).
- Couture de test absente : `main()` non exportée (`record.ts:276`) ⇒ le test L-4 ne peut pas piloter le CLI (C-3).
- Ordre de pool non spécifié : `quorum2` sans round-robin (`rpc2.ts:169`) + Blast à **50,0 %** des eth_call U-4a (`docs/PLI-lot-u4a.md:81`) ⇒ l'ordre des listes est load-bearing (C-6).
- Preuve d'archive surinterprétée : sonde `eth_getLogs@B₀ = []` (1 bloc) ne prouve rien ; `CHANTIERS.md:409` sur-affirme (C-7, N-4).
- Sur-déclaration de branchement : le compteur de concordance est un instrument CLI à sortie terminale, dit « BUILT » à tort (R-L4).

## Checklist (*non transmise verbatim* ; correspondance reconstituée)
CA-1 correction (C-1 inventaire, C-5 ADR) ; CA-5 correction (MAST caducs/manquants : C-6, C-8) ; CA-7 correction (items à déclencheur : C-7 sonde, C-8 registre, R-L4 concordance) ; CA-9 (indépendance) : la sonde L-5 reste acte orchestrateur (C-7) ; **CA-11 / Branchement : correction bloquante** (C-1 Bell, R-L4 « BUILT » retiré, C-8 registre honnête). *(Le détail CA-par-CA de l'avis n'a pas été relayé — reconstitution prudente, à confirmer par l'orchestrateur.)*

## Corrections — liste fermée

### Bloquantes (à plier au G0 avant tout code)
- **C-1. Inventaire : consommateur Bell oublié.** Ajouter `apps/bell/src/ethereum.ts:16,76-77` → `apps/bell/src/collect.ts:638` (importe `GET_LOGS_PROVIDERS`, le passe comme `ethCallProviders` ET `getLogsProviders` ; **pas de jambe Chainstack ni de garde de budget là**) avec son **tuyau** et son **test par injection**. Corriger **le fait 8 et le risque MAST 6** : décision 69 non déclenchée **car Pocket n'est pas un fournisseur de recoupement CASH** (et non « Pocket ≠ Bell », faux — Bell Ethereum le consomme). Oublis mineurs à inventorier : `apps/sentinel/test/ukemi-record.test.ts:96,149,172` (nomment drpc/mevblocker conservés ⇒ aucune édition) et la fixture historique `apps/sentinel/test/fixtures/narabi-timeline-2026-09-19.jsonl` (**jamais réécrite**).
- **C-2. Quorum corrélé {nodies, pocket}.** `eth-pokt.nodies.app` = passerelle adossée à Pocket (`…\conf-src-2\06-nodies.md:5`, `scripts/census/burns-by-burner.mjs:19`) ⇒ traiter **{nodies, pocket} comme UN opérateur** dans la distinctness de `rpc2.ts` (**jamais `rpc.ts`**), ligne d'ADR, **mutant « paire {nodies,pocket} seule ⇒ NoQuorum »**.
- **C-3. Couture du test L-4.** `main()` non exportée (`record.ts:276`) ⇒ **nommer la couture** (`runRecorder(argv, deps)` + `main` wrapper, fetch stubbé comme `ukemi-record.test.ts:20-28`) ; **mutant de câblage M-7c** (drapeau parsé mais sink non passé ⇒ ROUGE) ; **hook appelé AVANT le throw de désaccord** (`rpc2.ts:185`) ; **un HIT `--resume` contourne `basePool`** (`record.ts:324`).
- **C-4. Invariant CA-8/M-7.** L'invariant réel = `book` + `book_digest` + `holders_digest` et `PINNED_DIGEST` (`ukemi-u4-scores.test.ts:20`), **PAS `ukemi_sha`** (`record.ts:211`).
- **C-5. ADR de rattachement.** Nommer l'ADR (amendement **ADR-M012 + ADR-U1 D3**, ou **ADR-POOL-RPC-1**) portant tuyaux, **décisions 100 et 102**, ligne d'opérateur C-2, scission 1a/1b.
- **C-6. Charge eth_call + ordre.** Blast portait **50,0 %** des eth_call U-4a (`docs/PLI-lot-u4a.md:81`) ; `quorum2` sans round-robin (`rpc2.ts:169`) ⇒ **fixer l'ORDRE exact des deux listes**, **projeter la charge par opérateur pour U-4b (~280 k appels)**, **règle de politesse Pocket** (429/-32097 soutenu ⇒ `--exclude-operator pocket.network`, `record.ts:297-301`), **déclarer ce que le hook verra**.
- **C-7. Sonde L-5 re-spécifiée.** **Plafond chiffré** + mécanisme de garde nommé, **séquentielle, sans retry, arrêt sur 429/-32097, jamais via `getLogsRange`** ; **fenêtre récente = précondition de L-1** (comparer aux `burns`/`mints`/`supply_close` committés) ET **fenêtre ANCIENNE du domaine Ukemi pour L-3/Bell** ; **au plus UNE requête surdimensionnée** ; **`header not found` benche sans splitter** ; **URL Chainstack jamais imprimée** ; écrire **« archive eth_call : n = 2 »**, pas « qualifié ».
- **C-8. Plier la décision 102.** Tenderly **CONSERVÉ** + Pocket **AJOUTÉ** : L-3 = {drpc, mevblocker, tenderly, pocket} ; **branche C, « marge 0 », CA-7 et MAST 1 CADUCS** ; registre L-1 « **code + test ; wired à E-5** », **jamais BUILT** avant la première ligne publiée listant `pocket` sans llama ni blast ; **critère positif au first-run du RUNBOOK §6 + SHA de repli nommé**.

### Non bloquantes (à plier aussi, ou item formé avec déclencheur)
- **N-1.** Réconcilier les **deux projections R-25** (G0:143 vs G0:195) en UNE.
- **N-2.** Mentions **« 8 »** de `rpc.ts:57,65` (à mettre à jour après le pool à 7).
- **N-3.** Compteurs de concordance **agrégés par paire** plutôt que **~140 k appends**.
- **N-4.** Le plan a **raison contre `CHANTIERS.md:409`** (l'`eth_getLogs@B₀ = []`@1-bloc ne prouve pas l'archive de logs ; `:409` sur-affirme « OK »).
- **N-5.** **POOL-RPC-1b exigera un 2ᵉ redéploiement** sentinel = **demande de go, à déclarer**.

### R-L4 (compteur de concordance)
Le compteur est un **instrument câblé CLI à sortie terminale** ⇒ **RETIRER « BUILT / CA-11 satisfait »** ; **choisir et écrire l'une des deux issues** — **(1)** réducteur non-LLM en 1a avec **test de chaîne `args→main→jsonl→réducteur`** ; **(2)** « **câblé CLI, consommateur UPCOMING** » + item formé, déclencheur **fin U-4b ou J+30**. **Recommande ; l'orchestrateur tranchera.**

## Questions Q1..Q4 → RULINGS
- **Q1 (piggyback).** 1a **fusionne avec son G7 AVANT E-5** ; le SHA E-5 **doit en descendre** (`git merge-base --is-ancestor` écrit au journal) ; si 1a arrive après E-5 ⇒ **escalade** (la décision 92 couvre **UN** redéploiement).
- **Q2 (scripts lourds 1rpc).** **GEL** de `usde-full-pull.mjs` (et `u3-realized.mjs:365` par héritage) **avec note de tête**.
- **Q3 (fold hook en 1a).** **α conditionnel à C-3 / R-L4** (couture + issue) **sinon β** (report en 1b).
- **Q4.** *(Non ruled dans l'avis relayé — porté au G0 comme reco rédacteur « MAJ cosmétique en 1a si trompeuse », à confirmer par l'orchestrateur.)*

## Décisions orchestrateur (à écrire dans le G0)
- **U-4b n'attend PAS les 30 jours** (Pocket jamais seul ⇒ tout désaccord fail-close).
- **Cap Chainstack = UN rôle à la fois** (préserver la diversité de quorum).
- **E-1 (retrait Blast et LlamaRPC, un par un)** = **ESCALADE-INVESTISSEUR EN ATTENTE** : bloque l'**exécution** de L-1/L-2, **pas le plan**.

## ESCALADE-INVESTISSEUR
- **E-1 (retrait Blast/LlamaRPC).** *Rendue par le validateur* : escalade légère, l'investisseur confirme **un par un** le retrait de Blast API et de LlamaRPC ; bloque l'exécution de L-1/L-2, pas la rédaction du plan.
- **NOTE POST-AVIS (2026-09-21, orchestrateur) : E-1 LEVÉE par la décision investisseur 106** (`docs/CHANTIERS.md:436-437`, verbatim « retires les ») — **Blast API ET LlamaRPC retirés** (sentinel servi + Ukemi + scripts non gelés), « {nodies, pocket} = un opérateur » confirmé au niveau investisseur ; **L-1/L-2 débloqués**. Dans le G0 plié, E-1 est écrite « **levée par la décision 106 ; L-1/L-2 exécutables** », plus « EN ATTENTE ».

## AM-1 — ce que la checklist a attrapé (*reconstituée*)
Consommateur Bell (jambe Ethereum) branché mais absent de l'inventaire ; passerelle nodies adossée à Pocket comptée comme un 2ᵉ opérateur (corrélation de quorum) ; invariant de byte-identité visé sur `ukemi_sha` (témoin de build volatil) au lieu de `book_digest`/`PINNED_DIGEST` ; test de concordance sans couture pilotable (`main()` privée) et hook placé après le throw de désaccord (désaccords perdus) ; ordre de pool non fixé alors que `quorum2` n'a pas de round-robin et que Blast portait 50 % ; preuve d'archive getLogs (`[]`@1-bloc) surinterprétée et journal `:409` sur-affirmé ; compteur de concordance déclaré « BUILT » sans consommateur servi ; deux projections R-25 divergentes ; 2ᵉ redéploiement de 1b non déclaré.
