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
