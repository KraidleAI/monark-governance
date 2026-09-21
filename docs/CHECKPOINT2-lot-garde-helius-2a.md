# CHECKPOINT-2 - GARDE-HELIUS-2a - avis du validateur-humain (verbatim, claude-fable-5-1, 2026-09-21, HEAD juge dd9148f)

# CHECKPOINT-2 — LIVRABLE — GARDE-HELIUS-2a, HEAD `dd9148f`

**Décision : ACCEPTE-AVEC-CORRECTIONS** (liste fermée C-V-1..C-V-6 ci-dessous). Le sous-lot est accepté comme paquet upcoming, il ne clôt pas le lot.

**Artefacts lus (blobs `git show dd9148f:`)**
- `packages/rpc-guard/src/{index,guarded,client,transport,tariff,reconcile}.ts` et les diffs de `ledger.ts` et `cli.ts`.
- L'amendement d'ADR A-1..A-5.
- `apps/sentinel/src/ukemi/{record.ts:100-130, rpc2.ts:268-269}`.
- `F:\tmp\garde2a\{RENDU-G1.md, mutants.mjs, DELIVERED.sha256}` et les FAITS Chainstack.
- La G2 parallèle n'a pas été lue.

**Intégrité**
- Manifeste : 21 blobs sur 21 identiques à HEAD.
- Six fichiers mutés pour mes rejeux, tous restaurés à l'identique du blob.
- HEAD est inchangé et `status --porcelain` vaut 0.
- Les jonctions `src` et `base` sont retirées ; le `node_modules` du worktree garde ses 218 entrées.
- Rejeux sous `F:\tmp\cp2-garde2a\{src,base,probes}`, avec `TEMP/TMP=F:/tmp`.
- Aucun réseau : `globalThis.fetch` est bouchonné, URL en `.invalid`, clés factices.

## Mesures re-exécutées
| Point | Rejeu | Résultat |
|---|---|---|
| (k) CI et lint | `npm run ci` sur copie ; `eslint packages/rpc-guard` ; `lint` et `lint:ratchet` sur copie et sur la base `5d177db` | 700 tests, 699 réussis, 1 skip (celui du lot 1b, déclaré), exit 0. eslint du paquet : 0. L'erreur eslint `apps/bell/test/rebase-crosscheck.test.ts:600` et le ratchet 70/69 existent déjà sur la base ; le fichier a le même sha avant et après, le diff n'ajoute rien. |
| (l) R-25 | pathspec simplifié | 656 (542 ajouts, 114 retraits), contre 647 environ annoncés avec le pathspec CI exact. Loin sous 1 205. |
| (j) périmètre | noms du diff ; sha base contre HEAD ; sha LF du gel U-4b | Rien hors `packages/rpc-guard` et l'ADR. `rpc.ts`, `record.ts`, `rpc2.ts` sont identiques à l'octet. Les 6 sha U-4b sont intacts. |
| (a) P3-floor | chemin public, `fetch` bouchonné | chainstack, floor 15 999 990 : 5 transports (5 × 2 RU = 10, soit 16 000 000 pile, cap inclusif), le 6ᵉ est refusé `cycle_cap`. helius, floor 7 999 990 : 1 transport. |
| (b) unités | sonde A, A2, A3 | `spent()` rend `{chainstack:10, helius:10}`, jamais sommés. Après 50 crédits helius, un cap de run chainstack à 4 RU laisse passer exactement 2 `eth_call`. `tariff_version` est par fichier (`chainstack-2026-09-21`, `helius-2026-09-21`, `keyless-0`). Un floor ou un cap de run manquant pour un opérateur payant lève une erreur et ne laisse aucun verrou. |
| (c) sous-ensemble | sonde C | L'env résout helius, la course demande `chainstack` et `drpc.org`. Aucun fichier helius n'est créé. Un `call("helius")` lève `BudgetExceededError unknown operator` sans aucun fetch. Opérateur non résolu ou `cycles` vide : erreur. |
| (d) multi-verrou | sonde D, 3 processus OS | proc1 tient `drpc.org`. proc2 demande `{chainstack, drpc.org}` : `LockHeldError`, 0 fetch, aucun `chainstack.lock` ni `.jsonl` laissé. proc3, chainstack seul, se construit. Le mutant « ledgers ouverts avant les verrous » rougit `prior_is_frozen_after_lock` ; le mutant « rollback retiré » rougit `multi_lock_…`. |
| (e) tarif | comparaison programmatique aux FAITS, points 4, 6, 7 | Les 8 méthodes Solana et les 19 noms EVM que ma regex a extraits valent 2 RU ; le 20ᵉ, `eth_simulateV1`, est vérifié par lecture de `tariff.ts:50`. Les préfixes `debug_`/`trace_`/`arbtrace_` et `eth_callMany` valent 2. Les 6 méthodes à 1 RU sont correctes. Une méthode inconnue est refusée. Les mutants « getLogs à 1 RU » et « inconnue vaut 1 » rougissent. |
| (f) transport | sonde F | Timeout à 60 ms : la ligne `attempted` est sur disque avant le fetch, l'erreur est `transport error … (AbortError)` sans URL ni clé, le hook reçoit `chainstack\|AbortError`. Deux défauts sont détaillés en C-V-2. |
| (g) rapprochement | sondes G et G2 | Mode agrégat nommé dans le résultat. Borne dure sur le total : +1 RU donne `hard:total`. Un snapshot à deux champs est refusé dans les deux modes. La fenêtre est propre à chaque opérateur. `runCli --mode aggregate` rend GO ; un mode invalide lève une erreur sans laisser de verrou. |
| (i) unité `"requests"` | grep | Aucun résidu dans le code. Le retrait est accepté, l'item D-3 est formé, déclencheur 1b. |
| Mutants | les miens, 14 au total | 10 rouges. Le mutant « abort retiré » est attrapé par annulation sur timeout du test, pas par une assertion. 4 survivent, détaillés en C-V-1, C-V-4 et au point (h). |

## Checklist
- CA-6 : l'acceptation est conditionnée à un PASS de la G2.
- CA-7 : les écarts D-1 à D-6 sont formés correctement.
- CA-8 et CA-9 : conformes.
- CA-10 : R-25 tenu.
- CA-11 : le paquet reste `upcoming` ; aucun registre ne le déclare construit.
- Anti-close bis : non applicable, ce sont des constantes de documentation.

## Corrections (liste fermée)
- **C-V-1 (bloquant avant fusion) : le floor par opérateur n'est pas épinglé là où il agit.**
  - Mon mutant « floor du premier opérateur pour tous », posé en `guarded.ts:50`, survit.
  - Le mutant A5 du worker change `assertLimits` dans `client.ts`, c'est-à-dire la validation, pas le floor effectivement passé au ledger.
  - Un floor chainstack plus bas appliqué à helius sous-compte le prior, comme au C-V-1 du lot 1a.
  - Exigé : `two_paid_operators_…` passe par `openGuardedClient` avec des floors distincts et discriminants.
  - `error_origin` : worker. L'exigence était écrite dans mon C-2.
- **C-V-2 (bloquant avant le G1 de 2b, à plier ici ou en premier commit de 2b, à trancher avant) : le hook et les chemins d'erreur ne sont pas au niveau de `record.ts:100-124`.**
  - Mesuré : sur HTTP 429, le hook n'est pas appelé et le corps de la réponse est perdu. `getLogsVia` s'en sert pour découper une plage trop large sur HTTP 400.
  - Mesuré : une erreur JSON-RPC renvoyée en HTTP 200 donne `RESOLVED value=undefined`, sans exception ni hook.
  - Conséquence : deux fournisseurs en erreur seraient « concordants » sur `undefined`, et le moniteur 5 % ne verrait ni rate-limits ni reverts.
  - Exigé :
    - couvrir les quatre chemins : réseau, HTTP non-ok, corps non-JSON, erreur JSON-RPC ;
    - lever une erreur typée portant le code, nettoyée de toute URL ;
    - faire porter au hook le statut ou le code ;
    - écrire un test par chemin.
  - L'ADR A-3 affirme que le hook d'erreur remplace celui du recorder ; c'est mesuré faux.
  - `error_origin` : worker.
- **C-V-3 (bloquant avant le script de course 2b) : la course d'étalonnage n'a pas de chemin dans le code.**
  - Le mode `aggregate` applique la bande de 0,5 % dès la 1ʳᵉ course. Le G2 du lot 1a l'avait lue ainsi dans la décision 113.
  - Sur un nœud qui classe par requête, avec un tarif compté à 2 RU partout, une course honnête sort donc en exit 1 avec la raison `soft`.
  - Seul un lecteur humain ou LLM de la raison pourrait alors dire « c'est attendu », ce que C-6 visait à supprimer.
  - Exigé : un mode nommé, par exemple `aggregate-calibration`, où la borne dure s'applique, l'écart souple est consigné et la sortie vaut 0. À défaut, un équivalent que le prereg puisse nommer.
  - `error_origin` : partagé planificateur et validateur. Mon C-1 disait « informative » sans dire comment le code de sortie le porte.
- **C-V-4 (non bloquant) : deux comportements corrects ne sont épinglés par aucun test.**
  - Le mutant « caps de run sommés entre opérateurs » survit. Le mutant A7 du worker vise `spent()`, pas le mètre.
  - Le mutant « `tariff_version` constante » survit.
  - Exigé : une assertion pour chacun.
  - `error_origin` : worker.
- **C-V-5 (non bloquant) : deux raisons de refus trompeuses.**
  - Un delta négatif en mode agrégat, par exemple un compteur journalier remis à zéro, donne NO-GO `soft`. Exigé : une raison propre.
  - `--mode` absent sur `--op chainstack` donne `per_method_mode_needs_by_method`. Exigé : exiger le flag, ou le dériver de l'opérateur.
  - `error_origin` : worker.
- **C-V-6 (éditorial).** Les lignes 97-102 de l'ADR portent encore `credits|requests|keyless` et « cap RU non-applicable-cette-course », ce qui contredit A-1 et A-2.

## (h) Verrou des keyless : mon avis, la décision te revient
- Depuis 1a, un keyless a désormais un ledger chaîné (`drpc.org.jsonl`, mesuré en sonde C). Deux processus qui écrivent sans verrou forkent la chaîne, et toutes les courses suivantes échouent à l'ouverture.
- Je suis donc **pour verrouiller tous les opérateurs demandés**. Le coût est que 2b devra relâcher N verrous en fin de course.
- Pour `cycles[label]` d'un keyless, il faut déclarer une convention dans l'ADR, par exemple le cycle de l'opérateur payant de la course.
- Mon mutant « keyless non verrouillé » survit : aucun test ne contraint l'arbitrage. Quelle que soit ta décision, une ligne de test doit l'épingler.

## (m) Où pré-enregistrer le protocole
Deux couches, toutes deux requises.
- **ADR A-4** porte les règles :
  - fenêtre d'une journée entière ;
  - double lecture de stabilité après le délai de mise à jour ;
  - aucun chevauchement avec un créneau Narabi ;
  - règle du résiduel.
- **Le prereg U-4b-1b** porte les instances : le jour, les heures de lecture, le floor, le chiffre du résiduel Narabi et le sha du journal du sentinel. Il est épinglé par sha et le script refuse de tourner sans lui (ADR-U4b D4).
- Un point à fixer par écrit : le résiduel soustrait est un **minorant** de la consommation Narabi. Un résiduel surestimé cacherait un contournement.

## AM-1
- **Attrapé :**
  - quatre survivants, face à un harnais de 23 mutants dont deux visaient la mauvaise ligne (A5) ou la mauvaise surface (A7) ;
  - deux affirmations de l'ADR contredites par le code : la parité du hook et la course d'étalonnage.
- **Manqué par moi :**
  - le transport qui rend `undefined` sur une erreur JSON-RPC date de 1a ; je ne l'ai vu à aucun de mes deux checkpoints-2 ;
  - mon checkpoint-1 delta demandait une bande « informative » et de « déclarer le hook » sans préciser ni le mécanisme de sortie ni les quatre chemins d'erreur. C-V-2 et C-V-3 en découlent.

**Frontière.** Si le G7 fusionne 2a en laissant C-V-1 à C-V-3 en simples « à faire », sans item formé ayant 2b pour déclencheur, c'est une divergence checklist/G7, donc ESCALADE-INVESTISSEUR. Aucune décision de valeur ici.

**Modèle résolu (R-1)** : `claude-fable-5-1`, effort high. Aucune écriture dans le dépôt. Sondes : `F:\tmp\cp2-garde2a\probes\{a-floor-units,c-subset-lock,e-tariff,f-transport,g-reconcile,g2-cli}.mts`.
# Re-acceptation GARDE-HELIUS-2a (pli c6a112d)

# RÉ-ACCEPTATION SUR PIÈCES — GARDE-HELIUS-2a, pli `c6a112d`

**Décision : ACCEPTE-AVEC-CORRECTIONS**, liste fermée à un item, C-R-1, bloquant. Un corps de réponse qui reprend l'adresse du fournisseur sans le préfixe `http(s)://` fait apparaître la clé dans le message d'erreur. Le pli a créé ce défaut et aucun test ne le couvre. Tout le reste est conforme.

**Artefacts lus (blobs `git show c6a112d:`)**
- Le diff `dd9148f..c6a112d` des 5 sources : `cli`, `errors`, `index`, `reconcile`, `transport`.
- Les tests modifiés et l'ADR aux lignes 102-103, 186, 207-217, 233-240.
- `F:\tmp\garde2a\DELIVERED.sha256`.
- La G2 et la G2-delta n'ont pas été lues.

**Intégrité**
- Manifeste : 22 blobs sur 22 identiques à HEAD.
- Six fichiers mutés pendant mes rejeux, tous restaurés à l'identique.
- HEAD `c6a112d`, `status --porcelain` à 0, jonction retirée.
- Le `node_modules` du worktree garde ses 218 entrées.
- Rejeux sous `F:\tmp\cp2-garde2a-r\{src,probes}`. Aucun réseau (`fetch` bouchonné, URL en `.invalid`), aucun `git` d'écriture, rien sur C:.

## Re-exécutions
| Objet | Résultat |
|---|---|
| `npm run ci` | 709 tests, 708 réussis, 0 échec, 1 skip (celui du lot 1b). eslint du paquet : 0. |
| `lint` et `lint:ratchet` | Inchangés par rapport à la base : 1 erreur `apps/bell/test/rebase-crosscheck.test.ts:600` et ratchet 70/69. Le pli n'ajoute rien. |
| R-25 contre `5d177db` | 857 avec mon pathspec, 853 annoncés (écart de pathspec), sous 1 205. |
| Périmètre | Rien hors du paquet et de la doc. `rpc.ts` et `record.ts` identiques à l'octet. Les 6 sha du gel U-4b sont intacts. |
| **Ex-survivant N5 (= A5)**, floor partagé à `guarded.ts:50` | ROUGE : `two_paid_operators_keep_separate_priors_and_units`. Le code n'a pas changé, seul le test manquait. |
| **Ex-survivant N3 (= V1)**, caps de run sommés | ROUGE : `run_caps_are_per_operator_at_the_meter`. |
| **Ex-survivant N14 (= V2)**, `tariff_version` constante | ROUGE : `ledger_stamps_tariff_version_per_operator`. |
| **Ex-survivant N13 (= V3)**, keyless non verrouillé | ROUGE : `keyless_operator_is_locked_when_requested`. La convention du cycle des keyless est à la ligne 186 de l'ADR. |
| **V6**, hook muet sur réponse HTTP non-ok | ROUGE : `transport_error_path_http_non_ok_keeps_body`. |
| Mes 7 mutants hors liste | Six sont ROUGES : X1 (erreur JSON-RPC qui redonne `undefined`), X3 (code RPC perdu), X4 (mode strict relâché en calibration), X5 (calibration sans borne dure), X7 (garde chainstack-agrégat retirée), X8 (corps non-JSON qui donne `undefined`). X6 (`negative_delta` retiré) en rougit deux. |
| **X2**, mon choix : les deux appels à `scrubUrls` de `raise` retirés | **SURVIT, 44/44.** Le nettoyage des URL n'est épinglé par aucune assertion. |
| Sonde transport, 8 cas | Les quatre chemins d'erreur lèvent une `TransportError` avec `.name` et `.code` (429, 400, 200, −32005, 3). Le hook reçoit `op|nom|code`. La ligne `attempted` est écrite avant le fetch. Un `result: null` donne bien `null`. Le corps d'un HTTP 400 est conservé pour le découpage de plage. Une URL complète reprise par le serveur devient `<url>`. |
| **Sonde 401, corps sans préfixe `http`** | **`leak=true`** : le message contient `chainstack.example.invalid/FAKEKEY-…` tel quel. |
| Sonde rapprochement | `aggregate-calibration` avec sur-compte de 50 % : GO, `calibration_soft:1000`, exit 0, `softDeviation=1000`, ligne consignée. Contournement en calibration : NO-GO `hard:total`, exit 1. Delta négatif : `negative_delta` dans les deux modes. Mode strict inchangé : NO-GO `soft`. CLI `--op chainstack` sans `--mode`, ou en `per-method` : erreur levée avant le verrou, aucun verrou laissé, 0 ligne ajoutée. |

## Checklist
- **CA-6** : l'acceptation reste conditionnée à un PASS de la G2-delta.
- **CA-7** : les items sont formés. Le chemin Narabi hors garde (décision 118) est inscrit dans l'ADR avec son déclencheur -1d.
- **CA-8** : conforme.
- **CA-9** : tout est re-exécuté par moi sur une copie fraîche, aux chemins indiqués plus haut.
- **CA-10** : R-25 tenu.
- **CA-11** : le paquet reste `upcoming`, son consommateur est 2b et aucun registre ne le déclare construit. Le protocole non-code a ses règles dans l'ADR A-4 (l.213-217 : fenêtre d'un jour entier, double lecture de stabilité, aucun chevauchement Narabi, résiduel pris comme minorant). Ses valeurs pour la course vont dans le prereg U-4b-1b, épinglé par sha. C'est ce que j'avais demandé.

## Correction (liste fermée)
- **C-R-1 (bloquant avant fusion) : la clé Chainstack peut fuir dans un message d'erreur.**
  - **Cause.** La clé Chainstack est un segment de chemin de `CHAINSTACK_ETH_URL`, et `scrubUrls` ne retire que les URL préfixées par `http(s)://`.
  - **Origine.** À `dd9148f` le corps du serveur n'était jamais repris dans le message. Le C-V-2 du pli le reprend désormais (« keep the body ») sans élargir le nettoyage : c'est une régression du pli. En 2b, ce message ira dans le journal `rpcErrors`, qui est écrit sur disque.
  - **Classe.** Même défaut que le C-V-3 du lot 1a, qui était bloquant.
  - **Exigé.**
    - `raise` a la map `urls` sous la main. Elle expurge du `detail`, pour l'opérateur concerné, l'URL complète, sa forme sans préfixe, son chemin et sa valeur `api-key` (calque `redactEndpoint`).
    - Un test nommé rejoue un corps qui reprend hôte et clé sans préfixe. Il doit rougir le mutant X2 et la sonde 401 (C-R-2 plié dedans).
  - **`error_origin`.** Partagé worker et validateur. Mon C-V-2 demandait une erreur « nettoyée de toute URL » alors que la menace est la clé, qui n'a pas la forme d'une URL.
  - **Clôture.** Une passe sur pièces limitée à rejouer X2 et la sonde 401 sur le pli, pas un checkpoint complet.

## AM-1
- **Attrapé :** le nettoyage des URL sans aucune assertion (X2), et la fuite de clé par un corps sans préfixe, régression née de « garder le corps ».
- **Manqué au tour précédent :** je n'avais pas testé un corps qui reprend la clé. Ma consigne, centrée sur les URL, a laissé passer une implémentation conforme à la lettre.

**Frontière.** Fusionner ce pli en laissant C-R-1 en simple « à faire » serait une divergence checklist/G7, donc une ESCALADE-INVESTISSEUR. Aucune décision de valeur ici.

**Modèle résolu (R-1)** : `claude-fable-5-1`, effort high. Sondes : `F:\tmp\cp2-garde2a-r\probes\{r-transport,r-reconcile}.mts`. Journaux : `F:\tmp\cp2-garde2a-r\{ci,lint,ratchet,eslint-pkg}.log`.
