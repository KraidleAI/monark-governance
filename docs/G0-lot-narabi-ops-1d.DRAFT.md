# G0 — Sprint backlog lot NARABI-OPS-1d — BROUILLON (migration du chemin payant Chainstack de `apps/sentinel/src/rpc.ts` sous `@monark/rpc-guard` + 3 items -1c + second redéploiement)

> **BROUILLON worker DOCS** (R-20 : ne committe pas, ne déclenche aucun workflow). **Modèle résolu (R-1)** :
> `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni). 2026-09-21.
> Orchestrateur `claude-fable-5-1`. Base LECTURE SEULE : `F:\Monark`, `lot/etude-suite`, HEAD `8aedd03`.
> **Toute décision ci-dessous est « proposée » — l'orchestrateur tranche et vérifie adversarialement (R-21).**
> Chaque chiffre renvoie à `MESURES.md` (M-n) ; aucun chiffre de seconde main. Aucun réseau, aucun secret,
> aucun `.env` lu (noms de clés seuls). Les points de VALEUR/conception sont RENVOYÉS (liste §14, questions §16).

## 0. Plans qui font foi (déjà tranchés) — ce brouillon n'ouvre RIEN de neuf sans le dire
Amont, non rouvert : **décision 118** (« option B », `CHANTIERS.md:549-551`) qui CRÉE ce lot ; **décision 121**
(« A », cap Chainstack par compte, `:602-603`) ; **décision 119** (GO durable fermé, `:559-561`) ; décisions 92/109/117
(`:275,469,539`). ADR consommés : `docs/adr/ADR-NARABI-OPS-1.md` (exit-codes, tuyaux, budget -1c), `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md`
(D1-D6 + amendement 2a A-1..A-6 : A-4 rapprochement agrégat, A-5 overage désactivé, **A-6 allowlist `rpc.ts` à
déclencheur -1d**). Paquet consommé : `@monark/rpc-guard` (état 2b-i fusionné `8ba2cbc`) + son consommateur Ukemi
GARDE-HELIUS-2b-ii (qui AJOUTE l'entrée d'allowlist `rpc.ts` que CE lot retire — M-4). RUNBOOK : `docs/RUNBOOK-sentinel.md`
§6 (redéploiement par SHA nommé + rollback + Mode A). G7 amont : `docs/G7-lot-narabi-ops-1c.md` (3 items C-G2, sha E-5).

## 1. Objectif (une phrase)
Le seul chemin PAYANT du job quotidien Narabi — l'endpoint Chainstack ajouté au pool de `apps/sentinel/src/rpc.ts` —
ne dépense plus AUCUN appel réseau hors de `@monark/rpc-guard` : il est **ledgéré, plafonné et rapproché sous
l'opérateur `chainstack`** (comme la course Ukemi), le résiduel « payant hors garde accepté 118 » est CLOS, et le
VPS site est redéployé UNE seconde fois (motif unique autorisé par 118) — SANS changer la sortie servie (book,
timeline, `line_hash`), en respectant le gel U-4b de `rpc.ts` (ordre §12).

## 2. Contexte (résiduel 118, volume mesuré, 3 items -1c)
- **Le chemin payant** (M-3/M-6/M-7) : `rpc.ts` lit `env.CHAINSTACK_ETH_URL` (`:54`) et ajoute l'URL comme 8ᵉ endpoint
  du pool round-robin ; `defaultCall` (`:121-133`) fait le `fetch` brut. Chainstack reçoit `eth_getBlockByNumber` /
  `eth_getLogs` / `eth_call` (les 3 méthodes à **2 RU**, M-6). Volume (décision 118 CONFIRMÉE, M-7) : quelques
  appels/run, 4 créneaux/jour, borne haute ~640 RU/run même si TOUS les appels tombaient sur Chainstack — « très loin »
  du cap 16 M RU.
- **Ce que la migration branche** : le paquet `@monark/rpc-guard` gagne un 2ᵉ consommateur SERVI (après le recorder
  Ukemi 2b-ii) — le job quotidien — dont le ledger `chainstack.jsonl` sur le VPS devient une **source de vérité pour
  le rapprochement A-4 par compte** (décision 121 : le job Narabi compte dans le même plafond ; §6 tuyaux).
- **Les 3 items -1c** (M-15, exigences d'entrée du G0, `G7-lot-narabi-ops-1c.md:14-17`) : C-G2-1 (zéros de tête
  `MONARK_SENTINEL_BUDGET_S`), C-G2-2 (mutant G4 « mesure sur succès seulement » — test à durcir), C-G2-3 (qualificatif
  « pool sain » dans deux commentaires `run.ts`). C-G2-1 et C-G2-3 TOUCHENT `run.ts` (tension avec l'invariant, §5 D-runts).
- **Second redéploiement** : E-5 (premier redéploiement, -1c, décision 119) doit être ENREGISTRÉ avant ; -1d est le
  SECOND (décision 118 amende « un seul » pour ce seul motif). Contexte VPS : `Type=oneshot`, 4 créneaux, `sentinel`,
  `ReadWritePaths=/var/lib/monark-sentinel`, `TimeoutStartSec=300` (M-12).

## 3. Faits nouveaux [lu] mesurés (au-delà du blueprint 2b-ii) — voir M-n
1. **`rpc.ts` == la valeur de gel U-4b** au HEAD (M-1) ⇒ base -1d = après clôture de la course (ordre §12).
2. **L'entrée d'allowlist `rpc.ts` n'existe PAS au HEAD** (M-4) : elle est posée par 2b-ii ⇒ dépendance d'ordre dure.
3. **Divergence des pools keyless** (M-5) : le garde ne résout pas `publicnode.com`/`1rpc.io`/`blxrbdn.com` ⇒ router le
   keyless de Narabi par le garde = change inter-lots du paquet (D-route).
4. **La sonde déployée lit `chainstack_present` dans les `endpoints` publiés** (M-8) par domaine `chainstack.com`/
   `p2pify.com` ⇒ retirer la lecture de la clé de `rpc.ts` COLLISIONNE avec « aucun changement de sortie publiée »
   (D-published) — MÊME si `line_hash` est intact (M-11).
5. **Le verrou `wx` reste tenu après un kill** (M-9) ⇒ un kill `TimeoutStartSec` (SIGTERM) bloque le créneau suivant
   (D-lock) — le garde ré-ouvre la classe d'incident -1b/-1c s'il n'est pas géré.
6. **Écart de timeout 20 s (Narabi) vs 30 s (garde)** (M-10) ⇒ à re-passer à 20 s ou re-dériver la marge -1c.

## 4. Livrables (périmètre proposé) — L-n
| # | Fichiers | Contenu (proposé) |
|---|---|---|
| **L-1 migration du chemin payant** | `apps/sentinel/src/rpc.ts` (+ éventuel nouveau module top-level, D-route) ; `apps/sentinel/src/run.ts` ; `apps/sentinel/package.json` (dép workspace `@monark/rpc-guard`, compté R-25) | La jambe Chainstack passe par `openGuardedClient(env, limits, ledgerDir, {chainstack: <cycle>}, {timeoutMs:20000, onTransportError})` (M-16) ; `client.call("chainstack", method, params)` = 1 tentative, retry chez l'appelant (le pool `one()`/`quorumTwo` benche déjà) ; `env.CHAINSTACK_ETH_URL` n'est plus lu dans `rpc.ts` (le transport du garde le lit). `main()` ouvre le client garde UNE fois **enveloppé try/catch (D-degrade, BLOQUANT)** : tout throw à l'ouverture (verrou tenu, `ledgerDir` absent/corrompu, caps/floor manquants, ou `chainstack` non résolu de l'env, M-18) LAISSE TOMBER la jambe et publie sur les 7 keyless (ADR-NARABI-OPS-1 D3). `chainstack:` = `client !== undefined && client.operators().includes("chainstack")` (plus de `hasChainstack()` lisant la clé). **Relâche du verrou en `finally` + handler SIGTERM via `runCli(["unlock","--cycle",id,"--op","chainstack","--reason","sentinel-daily-end"], {ledgerDir, floor, readSnapshot})` EN PROCESS** (synchrone, viable en handler ; `runUnlock`/`releaseLock` non publics, M-16) — D-lock. `RunLimits` (caps + floor + method-caps) dérivés de l'env/constantes (D-caps). |
| **L-2 les 3 items -1c** | `apps/sentinel/src/run.ts` ; `apps/sentinel/test/sentinel-catchup-budget.test.ts` | C-G2-1 : trancher tolérer/refuser les zéros de tête + test (M-15). C-G2-2 : durcir le test (jour fautif = le plus lent) pour tuer le mutant G4. C-G2-3 : corriger les deux commentaires (« pool sain »/résiduel). |
| **L-3 retrait de l'allowlist `rpc.ts`** | `test/rpc-guard-fetch-only-inside-client.test.ts` | Retirer l'entrée `apps/sentinel/src/rpc.ts` (posée par 2b-ii) ; si 2b-ii a fait de l'allowlist un `Map<path, trigger>` à ENSEMBLE FERMÉ (ruling 2b-ii D-3), **mettre à jour l'ensemble fermé** (sinon le mutant « allowlist élargie sans déclencheur » rougit) ; élargir la portée à `apps/sentinel/src/**` (ADR A-6) ; `rpc.ts` = 0 hit après L-1 ; non-vacuité conservée. **Réserve D-route** : un module keyless raw-fetch en `apps/sentinel/src/` aurait besoin de SA propre entrée (motif keyless déclaré). |
| **L-4 tests + mutants** | `apps/sentinel/test/**` (+ éventuel `packages/rpc-guard/test/**` si D-caps ajoute une couture) | §8 (noms imposés + mutants ROUGES). |
| **L-5 ADR + RUNBOOK + deploy** | `docs/adr/ADR-NARABI-OPS-1.md` (amendement daté), `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` (A-1/A-4 « par compte », clause -1d résolue), `docs/RUNBOOK-sentinel.md` §6, `deploy/monark-sentinel.service` (si nouveau ReadWritePaths ledger) | Amendement : chemin payant sous garde, cap par compte (121), tuyau ledger VPS, résiduels (D-degrade, D-lock, D-floor), N `unlock`, second redéploiement + rollback. RUNBOOK : création du parent ledger (`install -d -o sentinel -g sentinel -m 0750`), **contrôle de résolution avant `restart`** (`sudo -u sentinel node -e "import('@monark/rpc-guard')"` depuis `/opt/monark-harness`), note « `--dry-run` écrit désormais de VRAIES lignes ledger write-ahead » (les appels sont faits) au §3. **Docs (ADR/RUNBOOK) EXCLUS du R-25** (M-17). Corriger : dérive « 8 free endpoints »/« ninth operator » de l'ADR D3 (code = 7 publics + Chainstack = 8ᵉ, M-5) ; le texte d'erreur `ensureCycleDir` dit `HELIUS_LEDGER_DIR` (`ledger.ts:65`) — impropre en contexte Narabi (item ADR). |

## 5. Décisions proposées — D-n (« proposé » ; l'orchestrateur/investisseur tranche)

### D-runts — interprétation de l'invariant « `run.ts` sha inchangé » (Q1)
**Fait** : le G7 -1c déclare -1d « le lot **qui touche `run.ts`/`rpc.ts`** et redéploie » (`G7-lot-narabi-ops-1c.md:14`) ;
et C-G2-1/C-G2-3 vivent DANS `run.ts` (M-15). ⇒ « `run.ts` sha inchangé » ne peut PAS être un gel d'octets (il se
contredirait). **Lecture proposée** : c'est l'invariant d'INTÉGRITÉ de déploiement (critère C-7 de -1c) — -1d produit
un NOUVEAU `run.ts` sha, l'épingle, et le redéploiement vérifie `déployé == archive` — **couplé à l'invariance de
SORTIE** (M-11 : book/timeline/`line_hash` intacts). Conséquence : **ne pas** forcer un garde en état de module lu par
`hasChainstack()`/`publishedEndpoints()` pour garder `run.ts` byte-identique — ce serait l'odeur « état de module »
que l'ADR C-4 a REJETÉE. Primaire = `main()` modifié minimalement (garde ouvert une fois, `call` passé, `chainstack:`
dérivé de `client.operators()`, `unlock` en `finally`). Variante byte-identique = renvoyée en Q1 (odeur déclarée).

### D-route — quel périmètre passe SOUS le garde (le keyless est le point dur, M-5)
- **(α) Payant SEUL sous le garde ; keyless en `fetch` brut.** Le pool `makeRpcPool` reçoit un `call` dispatcheur :
  URL Chainstack → `guard.call("chainstack", …)` ; 7 URL publiques → `fetch` keyless. **Effet** : petit, aucun change
  du paquet, aligné « migration du chemin PAYANT » (118). **MAIS** le `fetch` keyless doit quitter `rpc.ts` (sinon
  `rpc.ts:125` reste un hit ⇒ L-3 impossible) vers un nouveau module `apps/sentinel/src/keyless-transport.ts` (top-level,
  M-11) qui prend **sa** propre entrée d'allowlist (motif déclaré : keyless, aucun secret). L-3 devient « échange »
  d'entrée (`rpc.ts` → `keyless-transport.ts`), pas « suppression » nette.
- **(β) Tout (payant + keyless) sous le garde.** `rpc.ts` totalement propre, aucune entrée d'allowlist sentinel.
  **MAIS** le paquet doit résoudre `publicnode.com`/`1rpc.io`/`blxrbdn.com` (M-5) — change inter-lots partagé avec
  Ukemi, verrou d'ordre `ETH_CALL_KEYLESS_LABELS`, et les `endpoints` publiés deviennent des labels (D-published aggravé) ;
  et `maxCalls` compte ALORS les essais keyless aussi (`commit` incrémente `attempts` quelle que soit l'unité,
  `client.ts:124`) ⇒ le dimensionnement de `maxCalls` (D-caps) change (≈ tout le pool, pas seulement Chainstack).
- **Observation (non un verdict)** : (α) minimise le couplage mais laisse UNE entrée d'allowlist (déplacée) ; (β) rend
  `rpc.ts` nu mais élargit le paquet et la surface de provenance. Le choix appartient à l'orchestrateur.

### D-published — préserver `chainstack_present` de la sonde SANS lire la clé (M-8 ; collision)
La sonde DÉPLOYÉE (`c0027cb`) décide `chainstack_present` par le domaine d'un endpoint publié (`chainstack.com`/`p2pify.com`).
`line_hash` est intact (M-11), mais la VALEUR publiée du champ `endpoints` doit encore porter cette origine, or le
garde n'expose jamais d'URL. Options :
- **(a)** publier le label nu `chainstack` : **CASSE la sonde** (`providerOf("chainstack")="chainstack"` ∉
  `{chainstack.com,p2pify.com}` ⇒ `chainstack_present:false`) et le test `probe_chainstack_present_from_real_producer_line`.
  ⇒ REJETÉ sauf co-modification de la sonde (hors lot, déployée sur Bell).
- **(b)** une 2ᵉ clé env **NON secrète** `CHAINSTACK_ETH_ORIGIN` (schéma+hôte seul, aucune clé ⇒ HORS regex KEY, M-3),
  lue par `rpc.ts`/le module keyless, publiée verbatim comme endpoint redacté. **Effet** : sonde inchangée, `fetch`
  parti ; **risque de DÉRIVE** (origine ≠ hôte réel de `CHAINSTACK_ETH_URL` = mensonge de provenance) ⇒ épingler par un
  test que l'origine publiée == `providerOf` de l'URL du garde (couture inter-modules) ou déclarer le résiduel.
- **(c)** le garde expose un accesseur origine-seule (`originOf(op)` ou un champ `Resolved`) — change du paquet, nouvelle
  surface publique (contredit la minimalité C-V-2). **Proposé de trancher (Q2)** ; défaut prudent = (b) (aucun change de
  paquet, sonde intacte), résiduel de dérive déclaré.

### D-lock — cycle de vie du verrou face au oneshot tué (M-9 ; ré-ouvre l'incident)
Un kill `TimeoutStartSec` (SIGTERM) laisse `chainstack.lock` ⇒ créneau suivant `LockHeldError` ⇒ aucune publication.
**Faits techniques à NIVELER (doc 03) — chacun un item de vérification formé, propriétaire orchestrateur, déclencheur
= G1** : `TimeoutStartSec` envoie SIGTERM puis SIGKILL après `TimeoutStopSec` [abs, `systemd.service(5)` `KillSignal`/
`TimeoutStopSec` — à lire] ; la disposition SIGTERM par défaut de Node saute les `finally` [abs, docs Node « Signal
events » — à lire] ; systemd n'active qu'UNE instance d'une unité à la fois [abs, `systemd.unit(5)` fusion de jobs — à
lire ; le RUNBOOK a déjà modélisé cette prudence, `:160-161`]. Options :
- **(i)** `finally` + **handler SIGTERM** qui `unlink` le verrou synchronement (le run relâche même sur kill « propre ») ;
  un `SIGKILL` (rare, après `TimeoutStopSec`) échappe ⇒ combiner avec (ii).
- **(ii)** **reclaim au démarrage** gardé par la garantie systemd « une instance de `Type=oneshot` à la fois » : sur le
  VPS le SEUL écrivain de `chainstack.jsonl` est l'unique instance Narabi ⇒ le hasard C-9 « deux écrivains » est
  STRUCTURELLEMENT ABSENT ici. Un reclaim (verrou présent + aucun process vivant ⇒ `unlink`) est sûr SUR CET HÔTE mais
  **contredit l'intention fail-closed C-9 en général** ⇒ à déclarer honnêtement, borné à l'opérateur `chainstack` du
  sentinel, jamais un vol automatique côté Ukemi.
- **(iii)** réparation RUNBOOK seule sur alerte sonde (`runCli unlock --op chainstack --reason <fixe> --cycle <id>` +
  `--floor`). **Proposé** : (i) + (iii) primaire (le `finally`/SIGTERM couvre le cas normal ; le RUNBOOK couvre le
  SIGKILL) ; (ii) proposé en OPTION avec la tension C-9 déclarée (Q3). Note : `runUnlock` exige `reason` + `floor` (M-16) —
  le job pose une raison fixe (p. ex. `sentinel-daily-end`). Croissance du ledger : ~1 `unlocked` + N `attempted`/run,
  ~120 runs/cycle (borné, `unlocked` = 0 RU).

### D-caps — dimensionnement des caps (fail-closed, M-6/M-7/M-16)
`assertLimits` exige pour `chainstack` : `runCap>0`, `cycleCap` (=16 M, décision 115), `floor≤cap`, `methodCaps` non
vide. Proposé : `--method-caps` = `{eth_getBlockByNumber, eth_getLogs, eth_call}` (M-6) ; `maxCalls`/`runCaps.chainstack`
dérivés du pire cas (tous les appels sur Chainstack, ≤ 7 jours/run budgété, M-7) avec marge — **le G1 MESURE** le compte
par (méthode) sur un rejeu stubbé et fixe les caps (jamais devinés). Effet d'un cap touché en cours de jour : `refuse` ⇒
`BudgetExceededError` ⇒ `one()`/`quorumTwo` benchent Chainstack ⇒ le jour continue sur le quorum keyless (dégradation
GRACIEUSE, pas un jour arrêté, tant que ≥ 2 providers keyless répondent) ⇒ épinglé par un test (§8).

### D-degrade — l'ÉCHEC d'ouverture du garde ne doit JAMAIS tuer la publication keyless (BLOQUANT, M-18)
`openGuardedClient` JETTE à l'ouverture, AVANT tout RPC, dans plusieurs cas : verrou tenu (`LockHeldError`,
`guarded.ts:43`), `ledgerDir` absent (C-8, `ledger.ts:65`), ledger corrompu/tronqué (`ledger.ts:91-96`), caps/floor
manquants (`assertLimits`, `guarded.ts:37`), ou **`CHAINSTACK_ETH_URL` absent ⇒ « requested operator 'chainstack' is
not resolved from env »** (`guarded.ts:33`). Si `main()` ouvre le garde AVANT le pool sans garde, N'IMPORTE lequel
FATALe TOUT le run — y compris la publication keyless qui n'a rien à voir avec Chainstack. Cela CONTREDIT ADR-NARABI-OPS-1
D3 (« absent, la base keyless publie ») et son Risk « dégradation keyless silencieuse ACCEPTÉE plutôt que refus-de-démarrer ».
Chicanerie nommée : `main()` ne peut pas lire `env.CHAINSTACK_ETH_URL` pour décider s'il DEMANDE `chainstack` (ce serait
un hit grep), et `operatorLabels()` n'est PAS exporté (`transport.ts:186`, `index.ts`). **Proposé (D-degrade)** :
`try { client = openGuardedClient(...) } catch (e) { client = undefined; /* jambe Chainstack tombée */ }` ⇒ pool = 7
keyless, publication CONTINUE. `CHAINSTACK_ETH_ORIGIN` (D-published b) sert AUSSI de signal « configuré » sans lire la
clé. L'end-JSON gagne un champ à ENSEMBLE FERMÉ `chainstack_guard ∈ {ok, unconfigured, lock_held, ledger_error,
config_error}` (jamais un message). **Résiduel DÉCLARÉ** : un défaut de garde donne `chainstack_present:false` dans
`narabi.json` (fait ENREGISTRÉ par la sonde, `probe-narabi.mjs:360`) mais **la sonde n'ALERTE pas** dessus (ce n'est pas
un `reason` de l'ensemble fermé) ⇒ visible, silencieux par mail ; item formé (Q9). Test + mutant §8.

### D-ledger + D-floor — OÙ vit le ledger de cycle et COMMENT il partage le plafond par compte (LE POINT DUR, décision 121)
Le ledger `chainstack.jsonl` du garde est un fichier LOCAL par (cycle, opérateur) ; `ensureCycleDir` exige un parent
pré-existant (C-8, M-16). Sur le VPS : `MONARK_CHAINSTACK_LEDGER_DIR = /var/lib/monark-sentinel/ledger` (DÉJÀ sous
`ReadWritePaths`, M-12 ; PAS sous `public/`), créé au redéploiement `install -d -o sentinel -g sentinel -m 0750`. Le
cycle Chainstack est MENSUEL (2026-09-19 → 2026-10-19, décision 119/FAITS) ⇒ `cycle_id` + `floor` posés en clés NON
secrètes (`CHAINSTACK_CYCLE_ID`, `CHAINSTACK_CYCLE_FLOOR`, caps) dans `sentinel.env`, tournés par l'orchestrateur au
rollover mensuel (vs dérivé de la date = fragile). **Le point dur** (décision 121 : cap PAR COMPTE, tous réseaux,
**un seul ledger de cycle, floor lu au tableau de bord = somme des réseaux**) : le job Narabi tourne sur le VPS, les
courses Ukemi tournent depuis la machine de l'investisseur ⇒ **deux ledgers sur deux machines pour un seul plafond**.
Deux options, effets, SANS trancher :

- **Option 1 — ledgers LOCAUX par machine ; le plafond partagé est reconstitué par le FLOOR (mécanisme sanctionné par
  121).** Chaque garde ne voit que SON ledger + un `floor` importé. Le `floor` = la valeur lue au tableau de bord
  (somme des réseaux/machines) — c'est LITTÉRALEMENT ce que 121 prescrit (« floor lu sur le tableau de bord = somme des
  réseaux », M-13). Côté Ukemi (interactif) : A-4 lit le dashboard avant/après (déjà le protocole). Côté Narabi
  (oneshot, sans dashboard) : le `floor` est posé au redéploiement/rollover (statique ou rafraîchi à chaque redéploiement).
  **Effet** : aucune coordination inter-machines ; simple ; correspond au volume mesuré (M-7). **Résiduel DÉCLARÉ** : le
  `floor` de Narabi est PÉRIMÉ entre deux rafraîchissements — mais la dépense propre de Narabi est minuscule (M-7) et
  la VRAIE protection du plafond compte est (i) les courses Ukemi qui lisent le dashboard VRAI (incluant Narabi,
  décision 121 A-4) et fail-closent, (ii) l'overage DÉSACTIVÉ (A-5 : quota atteint ⇒ arrêt du service, pas de facture).
  Le rôle du garde Narabi est surtout de LEDGÉRER (attribution) + fail-closer sur ses propres caps, pas d'arbitrer le
  16 M en direct. Le rapprochement A-4 lit alors dans le ledger VPS le COMPTE D'ESSAIS exact par méthode ⇒ un
  MINORANT (essais × 1 RU, tarif PLANCHER), JAMAIS `credits_derived` (qui est un MAJORANT, tarif conservateur 2 RU,
  `tariff.ts:33-39`) — A-4 (iv) exige un minorant (« un résiduel surestimé cacherait un contournement »,
  `ADR-GARDE-HELIUS:241`) ; amélioration vs le minorant actuel « nombre d'appels du jour » (§6).
- **Option 2 — un ledger de cycle PHYSIQUEMENT partagé entre les deux machines** (montage réseau / synchro), pour que
  le garde applique le plafond compte en direct. **Effet** : lecture la plus littérale de « un seul ledger ». **Coûts/
  risques** : `openSync("wx")` (O_EXCL, M-9) n'est PAS garanti sur SMB/NFS ⇒ le verrou C-9 est CASSÉ (fork de chaîne
  possible — le hasard même que le verrou existe pour fermer) ; DEUX domaines d'administration (VPS site vs machine
  investisseur) ; le oneshot quotidien devient COUPLÉ à la disponibilité du montage ⇒ montage indisponible = job
  fail-closed = aucune publication = **la classe d'incident même que -1b/-1c a combattue**. ⇒ ré-introduit le risque.
- **Observation (non un verdict)** : la lettre de 121 (« un seul ledger de cycle ») penche pour l'Option 2, mais son
  MÉCANISME explicite (« floor lu au tableau de bord = somme des réseaux ») EST l'Option 1 pour le cas inter-machines.
  Choix de VALEUR/opérations ⇒ **renvoyé à l'orchestrateur/investisseur (Q4)**.

## 6. Tuyaux déclarés (règle Branchement) — « hors garde accepté 118 » → « gardé »
| Pièce | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| jambe Chainstack gardée (`rpc.ts`/`run.ts`) | env (`CHAINSTACK_ETH_URL` via le transport du garde, jamais imprimé ; caps/floor/cycle NON secrets) → `openGuardedClient` | `<ledgerDir>/<cycle>/chainstack.jsonl` (+ `.head`/`.lock`) sur le VPS ; ligne publiée + `state.json` INCHANGÉS (M-11) | **`upcoming`** jusqu'au 2ᵈ redéploiement ; **`built`** à la 1ʳᵉ ligne JOURNAL post-déploiement (`chainstack:true`, endpoints portant l'origine `chainstack.com`, ledger écrit) | `sentinel_chainstack_leg_writes_ledger_line_before_fetch` (espion `fetch` : tout appel payant précédé de sa ligne ledger sur disque) via `main` réel sur dir temporaire, transport bouchonné |
| ledger de cycle VPS → rapprochement A-4 | `client.call` (write-ahead) sur le VPS | l'orchestrateur lit (SSH lecture seule) le COMPTE D'ESSAIS Chainstack exact par méthode ⇒ MINORANT = essais × 1 RU plancher (JAMAIS `credits_derived`, majorant) pour soustraire le résiduel Narabi (A-4 (iv), décision 121) | ledger jsonl chaîné sur `/var/lib/monark-sentinel/ledger` | **acte MANUEL orchestrateur** (pas une surface servie) — à déclarer ; une surface servie serait HORS lot |
| second redéploiement | SHA de fusion nommé de -1d | l'unité `monark-sentinel.service` sur le VPS SITE | déployé après clôture temps 1 + course U-4b-1b | RUNBOOK §6 (rollback, `TimeoutStartUSec=5min`, sha `run.ts` déployé == archive, 1er run `chainstack:true`) |

**Conséquence 118** : la cartographie de clôture cesse de déclarer « payant, hors garde, accepté (118) » ⇒ « gardé,
ledgéré, rapproché par compte (121) ». Le rapprochement A-4 peut ALORS relâcher la contrainte « aucune fenêtre
chevauchant un créneau Narabi » (118) puisque le compte d'essais Narabi est ledgéré (minorant = essais × 1 RU plancher, pas
`credits_derived`) — à confirmer côté prereg (Q5).

## 7. Invariants (proposés)
- **Sortie servie inchangée** (M-11) : `hashedFields`/`lineHashOf` ne touchent NI `endpoints` NI `sentinel_sha` ⇒
  `line_hash`, chaîne `prev_line_hash`, `book_digest`, `PINNED_DIGEST`, format de ligne INCHANGÉS. Test : différentiel
  `timeline.jsonl`/`state.json` base↔HEAD byte-identique sur un jour normal (calque -1c `sentinel_normal_day_unchanged`).
- **`run.ts` sha** = intégrité de déploiement re-épinglée (nouveau sha, `déployé == archive`) + sortie invariante
  (D-runts/Q1), PAS un gel d'octets.
- **`sentinel_sha` dérive** (déclarée, non hashée, M-11) : tout nouveau module top-level la change ; un module en
  sous-dossier serait MANQUÉ ⇒ nouveaux modules AU NIVEAU SUPÉRIEUR.
- **Contrat -1c préservé** : `stopped != null ⇔ lag ≥ 1 ⇔ exit 1`, budget de rattrapage, `elapsed_ms`/`max_day_ms`
  INCHANGÉS ; la jambe gardée ne modifie ni `runDue` ni l'ordre write/exit.
- **La publication keyless n'est JAMAIS bloquée par un défaut de garde** (D-degrade) : tout throw d'ouverture ⇒ jambe
  Chainstack tombée, run keyless publié (ADR-NARABI-OPS-1 D3). Épinglé par un test + mutant (§8).
- **Timeout 20 s** (M-10) : la jambe Chainstack gardée passe `timeoutMs:20_000` (== `defaultCall`) OU la marge -1c est
  re-dérivée par amendement daté ; épinglé par un test.
- **Base = `rpc.ts` gelé** `0e232519…` (M-1) : au démarrage de -1d (après clôture de la course), `rpc.ts` porte encore
  cette valeur ; -1d la fait diverger volontairement (le gel n'est plus actif — ordre §12).
- **Aucune dépendance nouvelle (R-8)** ; aucun réseau en test ; `@monark/rpc-guard` déjà au workspace.

## 8. Tests imposés (noms) et mutants (ROUGES, restauration byte-exacte)
**Tests** :
`sentinel_chainstack_leg_writes_ledger_line_before_fetch` (espion `fetch` : ligne ledger sur disque AVANT le transport
payant, via `main` réel) ; `sentinel_chainstack_url_never_read_outside_guard` (`rpc.ts` ne lit plus `env.CHAINSTACK_ETH_URL`) ;
`sentinel_published_endpoints_keep_chainstack_provider` (la sonde `chainstackPresent(publishedEndpoints())` reste VRAIE —
D-published) ; `sentinel_line_hash_unchanged_under_migration` (M-11, différentiel byte-identique) ;
`chainstack_refusal_degrades_to_keyless_quorum_not_stopped_day` (cap touché ⇒ Chainstack benché ⇒ jour publié sur
keyless, pas d'arrêt — D-caps) ; `sentinel_chainstack_leg_uses_20s_timeout` (M-10) ; `sentinel_ledger_dir_must_pre_exist`
(C-8) ; `sentinel_run_releases_chainstack_lock_on_exit_and_sigterm` (D-lock) ;
`sentinel_guard_open_failure_degrades_to_keyless_and_publishes` (verrou tenu / ledger absent / `chainstack` non résolu ⇒
run keyless publié, `chainstack_guard` non-`ok`, exit inchangé — D-degrade) ; **items -1c** :
`sentinel_budget_leading_zero_is_<accepted|rejected>` (C-G2-1, selon Q6), `sentinel_max_day_ms_covers_the_slowest_faulting_day`
(C-G2-2 durci), plus le grep (`apps/sentinel/src/**` 0 hit hors allowlist + non-vacuité + entrée `rpc.ts` RETIRÉE).
**Mutants** : jambe payante remise en `fetch` brut (⇒ pas de ligne ledger ⇒ rouge) ; `env.CHAINSTACK_ETH_URL` relu dans
`rpc.ts` (⇒ hit grep) ; endpoint Chainstack publié en label nu (⇒ `chainstack_present` faux ⇒ rouge) ; `unlock` retiré du
`finally` (⇒ verrou tenu ⇒ 2ᵉ run `LockHeldError`) ; **`try/catch` d'ouverture du garde retiré (⇒ un défaut de garde
FATALe TOUT le run, keyless compris ⇒ rouge, D-degrade)** ; timeout remis à 30 s ; garde de budget C-G2-1 inversée ; jour
fautif du test C-G2-2 rendu non-max (⇒ mutant « succès seulement » re-survit).

## 9. R-25 estimé (ancres MESURÉES, M-17) + couture pré-déclarée
Ancres : `rpc.ts` 239 (jambe payante réécrite ≈ 30-60 net) ; `run.ts` 255 (câblage garde + 2 items -1c ≈ 20-40) ;
nouveau module keyless (D-route α ≈ 40-80) OU 0 (β/pas de module) ; grep test 82 (allowlist + portée ≈ 10-20) ;
tests+mutants ≈ 100-180 ; `deploy`/ADR/RUNBOOK = DOCS/deploy (ADR+RUNBOOK EXCLUS R-25, M-17 ; `deploy/*.service`
compté ≈ 2-6). **Projection ≈ 250-400** (`ins+del`, pathspec `ci.yml:65`) — sous 500. **Le G1 MESURE** (`git
diff --shortstat` verbatim) ; si > 500, **couture pré-déclarée** : (a) migration `rpc.ts`/`run.ts` + items -1c (chemin
servi) ; (b) durcissement lock/reclaim (D-lock ii) en sous-lot -1d-ii si l'option est retenue. Aucune séparation qui
laisserait un mutant non prouvé.

## 10. Oracle (codes capturés DIRECTEMENT, hors pipe)
`npm run ci && npm run lint && npm run lint:ratchet` sur l'arbre fusionné : suite verte (0 fail) ; `book_digest` /
`PINNED_DIGEST` / fixtures `narabi-timeline-*` verts ; différentiel `timeline.jsonl`/`state.json` base↔HEAD
byte-identique (jour normal) ; grep `apps/sentinel/src/**` 0 hit hors allowlist + non-vacuité + entrée `rpc.ts`
RETIRÉE ; tous les mutants (§8) ROUGES sur leur test nommé (restauration byte-exacte sha256) ; `git diff --shortstat`
(pathspec `ci.yml:65`) pour R-25 ; sha `run.ts`/`rpc.ts` recomputés et consignés (nouveaux). Le worker rend `sha256sum`
worktree vs manifeste (ADR-C01). CA-9 : oracle re-exécuté sur arbre isolé à `node_modules` résolvant `@monark/*`
(leçon jonction `mk-nm.ps1`/`rm-nm.ps1`, `CHANTIERS.md:596`).

## 11. Critères d'acceptation
CA-11 (branchement) : la jambe gardée est **branchée** au 2ᵈ redéploiement (chemin servi + test e2e non-LLM
transport→ledger→publication) ; registre public `upcoming`→`built` à la 1ʳᵉ ligne JOURNAL post-déploiement (chemin
servi réel). CA-2 : la migration + les 3 items -1c = couture pré-déclarée ; les points de VALEUR (D-published,
D-lock ii, D-ledger/floor, D-route β) sont RENVOYÉS (§16). CA-7 : résiduels déclarés (dérive d'origine D-published(b) ;
`floor` périmé Option 1 ; SIGKILL D-lock ; cap touché = dégradation gracieuse). CA-3 : amendements datés d'ADR
(NARABI-OPS-1 + GARDE-HELIUS A-1/A-4 « par compte » 121). CA-9 : indépendance de la re-exécution (arbre isolé).

## 12. Ordre (contraintes, chacune avec sa preuve)
1. **APRÈS la fusion de GARDE-HELIUS-2b-ii** : elle CRÉE l'entrée d'allowlist `rpc.ts` que -1d retire (M-4 ; au HEAD
   l'entrée n'existe pas). Preuve : `G0-lot-garde-helius-2b-ii.md:74,321`, ruling R-B.
2. **APRÈS l'enregistrement d'E-5** (1er redéploiement, -1c, décision 119) : -1d est le SECOND (décision 118 amende « un
   seul »). Preuve : `CHANTIERS.md:550`, `G7-lot-narabi-ops-1c.md:26`.
3. **APRÈS la clôture du temps 1** (Narabi + Ukemi ; décision 117/118 « déclencheur : clôture du temps 1 »). Preuve :
   `CHANTIERS.md:541,550`.
4. **APRÈS la clôture de la course U-4b-1b, PAS entre le commit du prereg et la clôture** (gel U-4b : `rpc.ts` figé à
   `0e232519…` ; Q10 = un commit touchant un fichier gelé ⇒ **ÉCART = STOP**, M-14). -1d MODIFIE `rpc.ts` ⇒ il fusionne
   APRÈS la clôture (le gel n'est plus actif ; le prereg aura recomputé ses sha à l'identique). Preuve :
   `PLAN-u4b-prereg.DRAFT.md:98,108,112-118`.
5. **AVANT tout prereg ultérieur qui re-gèlerait `rpc.ts`** (sinon re-STOP) — item à surveiller par l'orchestrateur.

## 13. Hors périmètre (déclaré)
- Le POOL keyless de Narabi sous le garde si D-route = (α) au-delà du module de transport keyless (le pool reste
  keyless en `fetch`, juste re-logé) ; le change de paquet `@monark/rpc-guard` (β) reste une décision renvoyée.
- La co-modification de la SONDE Bell (`scripts/probe-narabi.mjs`, déployée) si D-published = (a) — la sonde vit sur
  Bell, hors ce lot.
- Le rapprochement/course U-4b-1b (étape orchestrateur) ; la course de contre-vérification Bell (temps 2) ; toute mise
  en ligne du site (décision 101) ; tout achat / action de compte / go DNS.
- Le quota mensuel / prix d'overage Chainstack exact : NON LU (A-5 ; procurement si une course approche 16 M RU).
- Une surface SERVIE consommant le ledger VPS (au-delà de l'acte manuel orchestrateur A-4) : HORS lot (item §16).

## 14. Items formés (zéro dette nue — chacun propriétaire + déclencheur)
1. **D-ledger/D-floor** (le point dur) : 2 options (§5) — propriétaire orchestrateur/investisseur, déclencheur = ce G0 (Q4).
2. **D-published** : préserver `chainstack_present` sans lire la clé — propriétaire orchestrateur, déclencheur = ce G0 (Q2).
3. **D-lock (ii) reclaim** : tension avec C-9 — propriétaire orchestrateur, déclencheur = D-lock retenu (Q3).
4. **D-route** : (α) module keyless allowlisté vs (β) change de paquet — propriétaire orchestrateur, déclencheur = ce G0.
5. **ADR-GARDE-HELIUS A-1/A-4 « par compte »** (décision 121) — propriétaire orchestrateur, déclencheur = G1 -1d (ledger Chainstack VPS).
6. **Dérive doc ADR-NARABI-OPS-1 D3** (« 8 free endpoints »/« ninth operator » ≠ code 7+1 ; unité `:24`) — corrigée dans l'amendement -1d.
7. **Surface servie consommant le ledger VPS** (au lieu de l'acte manuel A-4) — propriétaire orchestrateur, déclencheur = besoin d'automatiser le rapprochement compte.
8. **Relâche de la contrainte « no-overlap » de 118** au rapprochement (le COMPTE D'ESSAIS Narabi étant ledgéré ⇒ minorant essais × 1 RU, jamais `credits_derived`) — propriétaire orchestrateur, déclencheur = prereg (Q5).

## 15. Risques (MAST) — résiduel
Fuite de clé (le vecteur C-1) — contrée : la clé ne vit QUE dans le transport du garde (allowlist unique) ; `rpc.ts`
ne lit plus `env.CHAINSTACK_ETH_URL` ; `no_secret_in_repo` inchangé. Panne de publication ré-ouverte par le verrou du
garde — contrée : D-lock (`finally`/SIGTERM + RUNBOOK) ; test `..._releases_..._lock_...`. **Panne de publication par
défaut d'ouverture du garde (verrou/ledger/config/`chainstack` non résolu) FATALant tout le run — contrée : D-degrade
(try/catch ⇒ jambe tombée, keyless publié) ; test + mutant ; résiduel : la sonde n'ALERTE pas sur `chainstack_present:false` (Q9).**
Mensonge de provenance
(origine publiée ≠ URL réelle) — contré : D-published(b) test de couture ou résiduel déclaré. Régression de la sortie —
contrée : M-11 (hash hors provenance) + différentiel byte-identique. Casse du contrat -1c — contrée : la jambe gardée ne
touche pas `runDue`. Cap sur-serré étranglant Narabi — contrée : dégradation gracieuse vers keyless + G1 mesure les caps.
Casse du gel U-4b — contrée : ordre §12 (fusion APRÈS clôture). Aucun gate suspendu (R-22).

## 16. Questions non couvertes (renvoyées à l'orchestrateur/investisseur — jamais tranchées par le worker)
- **Q1** — « `run.ts` sha inchangé » : intégrité de déploiement re-épinglée + sortie invariante (proposé, D-runts), ou gel d'octets littéral (alors les items -1c ne peuvent être foldés dans `run.ts`) ?
- **Q2** — D-published : (a) label / (b) `CHAINSTACK_ETH_ORIGIN` non secret / (c) accesseur du paquet ? (défaut prudent (b)).
- **Q3** — D-lock : (i)+(iii) seul, ou ajouter (ii) reclaim au démarrage (tension C-9 déclarée) ?
- **Q4** — D-ledger/D-floor (LE POINT DUR) : Option 1 (ledgers locaux + floor importé, mécanisme 121) ou Option 2 (ledger physiquement partagé, lettre 121 mais C-9/oneshot fragilisés) ?
- **Q5** — le rapprochement A-4 peut-il RELÂCHER la contrainte no-overlap de 118 une fois Narabi ledgéré (coordination avec le prereg) ?
- **Q6** — C-G2-1 : tolérer ou refuser les zéros de tête de `MONARK_SENTINEL_BUDGET_S` ?
- **Q7** — D-route : (α) payant seul (+ module keyless allowlisté) ou (β) tout sous le garde (change de paquet partagé) ?
- **Q8** — `MONARK_CHAINSTACK_CYCLE_ID`/`floor` : posés par l'orchestrateur au rollover mensuel, ou dérivés de la date ?
- **Q9** — un défaut de garde (D-degrade) donne `chainstack_present:false` (fait enregistré) mais la sonde n'ALERTE pas dessus : ajouter un `reason` à l'ensemble fermé de la sonde (co-modif Bell, hors lot) ou laisser en fait silencieux ?

---
**R-1** : `claude-opus-4-8[1m]`. **R-20** : aucun commit, aucun workflow. **R-21** : écrit pour vérification
adversariale — chaque chiffre → `MESURES.md` (M-n) ; aucune décision de valeur prise par le worker (« proposé »
partout ; questions §16). **R-22** : aucun gate suspendu.
