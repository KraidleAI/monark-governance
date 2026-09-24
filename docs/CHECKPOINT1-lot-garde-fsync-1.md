# Checkpoint-1 GARDE-FSYNC-1 — APPROUVE-AVEC-CORRECTIONS (C-1..C-13)

Modèle résolu : claude-fable-5-1

# Checkpoint-1 — PLAN du lot GARDE-FSYNC-1 (durabilité du ledger de cycle rpc-guard sous perte d'alimentation)

## 1. Artefacts lus (lecture seule ; `git status` propre avant/après, HEAD `66f75c2`, aucune écriture, aucun réseau)

- Plan : verbatim de la mission G1 (transmis dans le prompt ; aucun fichier de plan/ADR de rattachement n'existe encore dans le dépôt — `grep GARDE-FSYNC-1` ne touche que `docs/CHANTIERS.md:865` et l'INCIDENT).
- `F:\Monark\docs\course-bell\INCIDENT-powercut-2026-09-22.md` (fait motivant, §1-4).
- `F:\Monark\packages\rpc-guard\src\ledger.ts` (sha `8e479732…`), `lock.ts` (`2cf722d1…`), `cli.ts`, `guarded.ts`, `index.ts`, `client.ts:17` (`Outcome`), `bin/rpc-guard.mjs`, `package.json`.
- Tests : `test/ledger.test.ts` (C-V-8 b/c), `test/ledger-recovery.test.ts` (1b0-D), `test/lock.test.ts`, `test/exports.test.ts` (set d'export fermé), `test/ledger-format-lock.test.ts`, `test/harness.ts`.
- `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` :140-142 (C-V-8), :448-456 (réserve C-G-5/E-1), :639-651 (1b0-D, modèle de menace).
- `apps/bell/src/rebase-crosscheck.ts:553-573` (C-B-5 α, sink Bell — hors périmètre, BELL-SHORTPAGE-1) et `:681`.
- `scripts/export-public.mjs:60` (`docs/**` non exporté), `scripts/lang-gate.mjs:6` (`docs` skippé), `.github/workflows/*.yml` (`runs-on: ubuntu-latest` uniquement), `docs/adr/ADR-U4b-calibration-episode-frais.md:394-402` (table des 9 gelés), `apps/sentinel/src/ukemi/rpc2.ts:199` (`Promise.all` split parallèle).
- Vérification Bash : `grep fsync` sur tout `*.ts` du dépôt = **0 occurrence** (la cause racine de l'INCIDENT §1 est confirmée sur pièces).

## 2. Checklist

### CA-1 (critères falsifiables ; reformulation une phrase par tâche)
1. « Chaque append de ligne et chaque réécriture de head/lock passent par un `fs` injecté, et une coupure entre deux appels laisse toujours un état que `openOperatorLedger` accepte ou soigne » — reformulable, testable par séquence d'opérations.
2. « `repair-tail` retire une queue NUL pure et ne fait rien d'autre » — reformulable, MAIS le sous-critère « réécrit le head = dernière entrée durable » est **contradictoire avec le point 1** (voir (a) ci-dessous) : sous l'ordre fsync du plan lui-même, un head EN AVANCE ne peut plus être produit par une coupure ; il ne peut plus être que la signature d'une troncature (`ledger.ts:121`). Le critère est donc mal posé tel quel.
3. « Tests `fs` injecté comptant fsync/rename » — un COMPTAGE ne falsifie pas le mutant « fsync avant write » annoncé par l'INCIDENT §4 ; il faut un journal de SÉQUENCE.
4. RUNBOOK + amendement ADR — reformulable.
5. R-25 < 600, anglais, 9 gelés intacts — falsifiable ; les 9 gelés (table ADR-U4b :394-402) ne comportent aucun fichier sous `packages/rpc-guard/` : hors périmètre par construction.
→ **correction** (C-1, C-3, C-7 ci-dessous).

### CA-2 (décision de valeur)
L'INCIDENT §4 formait le RUNBOOK comme **procédure manuelle** (« sauvegarde + sha, suppression de queue NUL, head = dernière entrée durable ») ; le plan en fait une **sous-commande servie** qui touche la pièce de tamper-evidence. C'est une extension de périmètre du propriétaire (orchestrateur), licite sous la règle Branchement, à **déclarer** dans l'amendement ADR ; pas une décision de valeur investisseur — **conforme sous condition C-12**, SAUF si l'orchestrateur maintient la réécriture d'un head en avance par défaut (alors ESCALADE, voir décision).

### CA-3 (ADR de rattachement, gates)
Plan (4) prévoit l'amendement ADR-GARDE-HELIUS (modèle de faute). Il doit porter aussi la table des tuyaux (règle Branchement) et le changement de posture éventuel de C-V-8 — **correction** (C-12). Aucun gate suspendu.

### CA-4 (fan-out)
Un worker G1 + relecteur G2 + validateur : pipeline standard, aucun fan-out à justifier — **n-a/conforme**.

### CA-5 (MAST)
Le plan verbatim ne nomme **aucun** mode d'échec — **correction** (C-13). Candidats évidents : hypothèse d'environnement non vérifiée (fsync win32 ; disque qui acquitte un flush sans l'honorer), vérification incomplète (comptage vs séquence), dérive de périmètre (`repair-tail` étendu aux lignes tordues, ou au head en avance), fin prématurée (coût déclaré « acceptable » sans mesure).

### CA-11 (tuyaux, composition exécutée depuis l'artefact réel)
Tuyau annoncé : ledger → head → `openOperatorLedger` → `repair-tail` → `unlock` → RUNBOOK. Trous :
- **`<op>.repair.jsonl` n'a pas de consommateur nommé** (précédent `attest` terminal, 2026-09-18) ;
- le test d'intégration doit partir d'un ledger **produit par `openGuardedClient` + `call`** (fetch patché comme `exports.test.ts:21`), puis d'une mutation octet reproduisant la signature de l'INCIDENT, et rejouer `repair-tail` → `unlock` → réouverture — pas d'un fichier fabriqué à la main (CA-11 durci) ;
- le `bin/rpc-guard.mjs` doit exposer `repair-tail` (le chemin servi est le bin, `cli.ts` en est le cœur testable).
→ **correction** (C-8, C-9).

### CA-6..CA-10 — n-a au checkpoint-1 (rappel pour le checkpoint-2 : rejeu des mutants sous `F:\tmp\cp2-garde-fsync-1\`, AM-2 ter).

### Anti-close — n-a (aucun prix, aucun close ; les ledgers de cycle ne portent que des comptes de crédits).

## 3. Jugements demandés

**(a) Sûreté de `repair-tail`.** Modèle de menace C-V-8 (ADR :644-646) : le sidecar défend contre un tamper PARTIEL du seul `.jsonl` ; qui écrit les deux fichiers gagne déjà. `repair-tail` ne change pas ce résultat pour un attaquant ayant accès au répertoire, MAIS il crée un chemin **servi et légitimé** qui, tel qu'écrit (« réécrit le head = dernière entrée durable »), normalise exactement l'état « head en avance » que `ledger.ts:121` refuse — et, point décisif : **sous l'ordre du plan (ligne → fsync → head tmp+fsync+rename), une coupure ne peut plus produire un head en avance**. Elle ne produit que (i) une queue NUL/partielle d'au plus une ligne avec head == dernière durable, ou (ii) un head en retard d'UNE entrée (déjà soigné, `ledger.ts:118`). La signature de l'INCIDENT (head AHEAD) est celle du code pré-lot. Conditions à exiger : strip NUL puis, si head disque == head recomputé → fin ; == pénultième → heal existant ; **toute autre divergence (dont head en avance) → REFUS** ; refus si 0 octet NUL retiré ; refus si la queue contient autre chose que NUL (ligne tordue = manuel, déclaré) ; `.bak` + sha journalisés ; ligne de réparation hors core ; acte orchestrateur + ancre.
Trou supplémentaire : après coupure le `.lock` est **tenu** (pid mort) et `unlock` jette avant de retirer le lock (`cli.ts:39-40`) ; `repair-tail` tourne donc sous verrou tenu sans `acquireLock` → course possible avec un écrivain vivant : refus si le pid du `.lock` est vivant.
Précision factuelle : avant réparation, `openOperatorLedger` jette **`malformed`** (`readEntries` :65-67, `trim()` n'ôte pas `\0`, `JSON.parse` échoue avant toute comparaison de head), pas « tail truncation » comme l'écrit l'INCIDENT §1 ; le test d'intégration doit asserter `/malformed/`.

**(b) Ordre fsync vs cas crash-in-window.** Ligne durable AVANT head : le cas `ledger.ts:13-14` reste couvert (head 1 en retard → heal) et n'est pas cassé. Deux points à traiter : le heal `ledger.ts:119` (`writeFileSync` nu) doit passer par le même tmp+fsync+rename (sinon mutant « heal non durable » survivant) ; un orphelin `<op>.head.tmp` (coupure entre fsync tmp et rename) doit être toléré/nettoyé à l'ouverture et testé. Cas head-absent (`ledger.ts:15-16`) : le plan est muet — décision explicite exigée (refus maintenu, ou réparation sous journal) + test.

**(c) Coût.** 3 opérations synchrones par ligne (fsync ligne + fsync tmp + rename) : Bell ~2 pages/s → négligeable a priori ; Ukemi `rpc2.ts:199` split parallèle avec fsync synchrones qui bloquent l'event loop → à **mesurer** (p50/p99 sur le volume réel `F:\monark-ledger`, seuil déclaré dans l'ADR), pas à qualifier d'« acceptable ».

**(d) Windows.** CI = `ubuntu-latest` seul (vérifié) : rien n'exerce win32. Résidu à déclarer par une sonde **mesurée** (Node `fsyncSync` sur un fd de répertoire win32 : résultat consigné, jamais supposé ; durabilité du rename NTFS ; création `openSync(wx)` du lock idem) dans l'ADR et le RUNBOOK.

**(e) MAST** : voir CA-5. **(f) CA-11** : voir ci-dessus. **(g)** anti-close n-a.

## 4. Décision : **APPROUVE-AVEC-CORRECTIONS** (liste fermée)

- **C-1 (bloquante)** — `repair-tail` ne réécrit JAMAIS un head en avance : après strip NUL, head == recomputé → fin ; == pénultième → heal existant ; autre → refus « tail truncation » inchangé. Si l'orchestrateur veut conserver une réécriture pour des ledgers pré-lot, c'est un changement de posture C-V-8 : mode explicite isolé et journalisé, OU **ESCALADE-INVESTISSEUR** (question : « accepte-t-on qu'un outil servi puisse normaliser un head en avance, état que le lot rend impossible par coupure ? »). Non accepté en silence par défaut.
- **C-2** — refus si 0 octet NUL retiré ; refus si la queue contient autre chose que des NUL (ligne tordue = manuel, déclaré RUNBOOK) ; refus si le pid du `.lock` est vivant ; comportement déclaré si `.lock` absent.
- **C-3** — sémantique du `.bak` : l'outil crée lui-même `<op>.jsonl.bak` (+ `.head.bak`), sha avant/après, refuse si un `.bak` existe déjà (ne jamais écraser la preuve) ; `.bak` et `<op>.repair.jsonl` fsyncés comme le reste. Champs minimaux du record : `iso`, `pid`, `reason`, `sha_before/after` (jsonl, head), `nul_bytes_removed`, `bak_path`, `bak_sha256`, `head_action` (`none|heal_penultimate`).
- **C-4** — heal `ledger.ts:119` unifié sur tmp+fsync+rename ; tolérance/nettoyage d'un orphelin `<op>.head.tmp` à l'ouverture, testé.
- **C-5** — cas head-absent : décision explicite dans l'ADR (refus maintenu par défaut recommandé) + test.
- **C-6** — le test d'intégration asserte `/malformed/` avant réparation (et l'INCIDENT §1 est amendé d'une ligne datée).
- **C-7** — `fs` injecté = journal de **SÉQUENCE** d'opérations (open/write/fsync/close/rename), mutants d'ordre rouges sur la séquence (« fsync retiré », « fsync avant write », « head avant ligne », « rename avant fsync tmp », « heal non durable ») ; aucun nouvel export (`exports.test.ts` set fermé), aucune valeur d'`Outcome` ajoutée (`client.ts:17`).
- **C-8** — composition CA-11 durcie : ledger produit par `openGuardedClient`+`call` → mutation octet (queue NUL ; variantes : NUL seul ; NUL + head cohérent = aucune réécriture ; ligne tordue + NUL = refus ; 0 NUL = refus ; head en avance post-strip = refus) → `openGuardedClient` jette `/malformed/` → `runCli repair-tail` → `runCli unlock` exit 0 → `openGuardedClient` réouvre, `verifyCycleLedger` vert ; `bin/rpc-guard.mjs` expose `repair-tail`.
- **C-9** — consommateur de `<op>.repair.jsonl` nommé dans la table des tuyaux (soit `reconcile` le lit et le reflète dans son verdict, soit consommateur humain RUNBOOK + ancre déclaré comme tel) ; l'ADR dit ce qui se passe au `reconcile` après réparation (lignes `attempted` perdues ⇒ Δ > `ledger_run` ⇒ NO-GO dur, C-V-7).
- **C-10** — coût mesuré : p50/p99 des 3 opérations par ligne sur `F:\monark-ledger`, seuil déclaré ; aucun adjectif.
- **C-11** — résidu Windows : sonde mesurée (fsync de répertoire win32, rename NTFS, lock `wx`), consignée ADR + RUNBOOK ; CI ubuntu déclaré comme ne couvrant pas win32.
- **C-12** — amendement ADR-GARDE-HELIUS : modèle de faute (perte d'alimentation ≠ crash processus), table des tuyaux (entrée/sortie/état/test), extension de périmètre « procédure manuelle → sous-commande servie » déclarée, et posture C-V-8 confirmée.
- **C-13** — modes MAST nommés avec contre-mesure (au moins les quatre de CA-5).

Rappel checkpoint-2 : rejeu des mutants et de la composition sous `F:\tmp\cp2-garde-fsync-1\` (AM-2 ter), sha des fichiers du dépôt avant/après + `git status`.

**AM-1 — ce que la checklist a attrapé** : (i) la réécriture du head en avance est, post-lot, le chemin de blanchiment d'une troncature (signature impossible par coupure) ; (ii) le verrou tenu post-coupure non traité par le plan (course avec écrivain vivant) ; (iii) l'erreur réelle pré-réparation est `malformed`, pas « tail truncation » ; (iv) comptage de fsync ≠ preuve d'ordre ; (v) `<op>.repair.jsonl` sans consommateur ; (vi) CI ubuntu seul ⇒ win32 jamais exercé.

Modèle résolu (R-1) : claude-fable-5-1.
