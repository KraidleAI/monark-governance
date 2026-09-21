# G0 (court) — GARDE-HELIUS-2b-ii — BROUILLON (migration du recorder Ukemi sous `@monark/rpc-guard` + grep CI)

> **BROUILLON worker DOCS** (R-20 : ne committe pas, ne déclenche aucun workflow). **Modèle résolu (R-1)** :
> `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni). 2026-09-21. Base présumée :
> `lot/etude-suite` APRÈS fusion de 2b-i (paquet, `798b4e9` sur `lot/garde-helius-2b`) + son pli. **Toute décision
> ci-dessous est « proposée » — l'orchestrateur tranche et vérifie adversarialement (R-21).** Chiffres : chaque nombre
> renvoie à `MESURES.md` (M-n) ; aucun chiffre de seconde main. Aucun réseau, aucune clé réelle, `fetch` bouchonné.

## 0. Plan qui fait foi (déjà approuvé) — ce brouillon n'ouvre RIEN de neuf sans le dire
Plan amont, non rouvert : `docs/G0-ADDENDUM-lot-garde-helius-2.md` (D4, D5, L-2-3, L-2-4, tuyaux, invariants) + son pli
C-1..C-7 (C-3 faits, C-4 job quotidien, C-5 « 2b », C-6 e2e) ; `docs/G0-COMPLEMENT-lot-garde-helius-2b.md` (D6 +
pli C-1..C-7) ; `docs/CHECKPOINT1-DELTA-lot-garde-helius-2b.md`. Amont livré : `docs/G1-lot-garde-helius-2b-i.md`
(moitié PAQUET, persisté au prochain commit ; §8 = **blueprint de 2b-ii**, repris ici) + `docs/G2-lot-garde-helius-2b-i.md`
+ `docs/CHECKPOINT2-lot-garde-helius-2b-i.md`. ADR : `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md`
(A-3/A-3bis/A-4/A-6, table des tuyaux), `docs/adr/ADR-U4b-calibration-episode-frais.md` (D4/D5, sha gelés).
Ce G0 court **complète** le blueprint 2b-i §8 (`docs/G1-lot-garde-helius-2b-i.md` §8, persisté au prochain commit —
cité « G1 2b-i » ci-dessous, jamais son chemin tmp) par ce que la mesure a ajouté (M-1..M-11) : baseline du grep,
ripple de signature `RpcError` cross-lot, scripts `u4-*.mjs`, label chainstack, point `data === "0x"`.

## 1. Objectif (une phrase)
Le **recorder Ukemi** (`apps/sentinel/src/ukemi/record.ts`) ne dépense plus AUCUN appel réseau hors de
`@monark/rpc-guard` : `makeDefaultCall`/`makeBudgetedCall`/`defaultCall`/`fetch` locaux SUPPRIMÉS ; `runRecorder`
construit `openGuardedClient(env, limits, ledgerDir, cycles, opts)` ; `rpc2.ts` ré-exporte la classe canonique et
importe le vocabulaire d'erreur unique du paquet ; le grep CI garde `apps/sentinel/src/ukemi/**` — de sorte que le
paquet, `upcoming` depuis 1a/2a, devienne enfin **branché** par un chemin servi (le recorder) couvert par un test
d'intégration non-LLM rejouant transport→classify→record.

## 2. Découpe (pourquoi 2b-ii existe) — couture PRÉ-DÉCLARÉE, activée sur R-25 mesuré
Le lot 2b complet dépassait le seuil R-25 (G1 2b-i §0 : paquet 352 mesuré + migration 800–945 estimé > 1150 en
central). Couture pré-déclarée (complément C-2 / addendum C-5 : « paquet : indice fermé + classe + data » /
« migration du recorder + grep »). **2b-i** (paquet) est fusionné/en pli. **2b-ii** = CE lot = la moitié MIGRATION,
consommatrice du paquet. Ordre de dépendance IMPOSÉ : le paquet d'abord (`rpc2.ts` ne peut importer
`RpcError`/`isResultLimit`/… qu'une fois exportés). Base APRÈS fusion 2a **et** 2b-i (jonction `node_modules` du
worktree résout `@monark/*` vers `F:\Monark` — `CHANTIERS.md:557` : 2b démarre après la fusion).

## 3. STOP transitif du GEL U-4b — **PAS de STOP** (preuve M-1)
La mission impose un STOP doctrinal SI `record.ts`/`rpc2.ts` sont importés (directement/transitivement) par l'un des
3 fichiers de score gelés (ADR-U4b D4) ou par les transitifs C-V-2. **Mesuré (M-1)** : NON.
- Fermeture transitive du gel = {`u4b-scores.mjs`, `u4b-reduce.mjs`, `record-u4b-calib.mjs`, `abi.ts`→`rpc.ts`(feuille),
  `wadray.ts`(feuille), `l1-split.ts`(feuille), `@monark/contracts`, `@monark/hikae`}. **Aucun** n'importe `record.ts`
  ni `rpc2.ts`.
- `record.ts`/`rpc2.ts` sont EN AVAL : `rpc2.ts` importe DEPUIS `rpc.ts` ; `record.ts` DEPUIS `rpc2.ts`. Leurs
  importeurs (M-1) sont apps/bell, book.ts, resume.ts, tests, et les scripts **U-4a** `u4-*.mjs` (NON gelés — les
  gelés sont `u4b-*`).
- `rpc.ts` (gelé C-3) est une FEUILLE (importe `node:crypto` seul) ⇒ ne remonte pas vers rpc2/record.
⇒ Modifier `record.ts`/`rpc2.ts` ne change NI le sha d'un fichier gelé NI la sortie d'un script gelé (ils ne les
importent pas). **Pas de STOP** ; **pas de demande de consultation advisor-defi/validateur ouverte sur ce point.**
Réserve DÉCLARÉE (non un STOP) : le prereg U-4b-1b (étape suivante, orchestrateur) gèle les sha ; comme `record.ts`/
`rpc2.ts` ne SONT PAS dans le gel, l'ordre 2b-ii↔prereg ne crée pas de conflit — à confirmer au commit du prereg que
la liste gelée reste M-10 (7 sha), sans `record.ts`/`rpc2.ts`.

## 4. Faits nouveaux [lu] (que la mesure a ajoutés au blueprint 2b-i §8)
1. **Baseline grep (M-4)** : `apps/sentinel/src/ukemi/**` porte AUJOURD'HUI 2 hits — `record.ts:92` (`fetch`),
   `record.ts:328` (`deps.env.CHAINSTACK_ETH_URL`) — EXACTEMENT ceux que la migration supprime ⇒ `ukemi/**` devient
   0 hit. `apps/sentinel/src/rpc.ts` (54/125) est HORS `ukemi/**`. Aucun `undici`/`child_process` en commentaire sous
   `ukemi/**` (pas de faux positif).
2. **Ripple de signature `RpcError` (M-3)** : la classe canonique `errors.ts:48` est `(op, message, code, detail, unit,
   data)` ≠ la locale `rpc2.ts:41` `(message, code, data)`. Le site **`apps/bell/src/ethereum.ts:67`** (lot 1b) construit
   l'ancienne signature ET importe `RpcError` de `rpc2.ts` ⇒ casse au typecheck dès que `rpc2.ts` ré-exporte la
   canonique (C-1(a)). Idem ~18 sites dans `ukemi.test.ts`, 1 dans `pool-rpc-1a.test.ts:121`. `BudgetExceededError`
   ne ripple PAS (signature inchangée).
3. **Scripts `u4-*.mjs` (M-6)** : `u4-oracle-path.mjs`/`u4-probe.mjs`/`u4-redraw.mjs` (U-4a, provenance, hors CI, NON
   gelés) importent `makeDefaultCall`/`makeBudgetedCall`/… de `record.ts` ⇒ leur suppression les casse SILENCIEUSEMENT.
4. **Label chainstack (M-9)** : la jambe Chainstack est aujourd'hui relabellée `archive-env` ; sous labels garde elle
   devient `chainstack` ⇒ les paires `--concordance-out` changent de clé (POOL-RPC-1a peut attendre l'ancienne).
5. **`data === "0x"` (M-8)** : conservée par `validateRevertData`, `isRpcRevert` VRAI, mais `revertKey` la traite comme
   absente ⇒ perte de concordance chainstack↔keyless sur les reverts sans raison (jamais un faux accord).

## 5. Livrables (périmètre FERMÉ) — L-n
| # | Fichiers | Contenu |
|---|---|---|
| **L-1 migration `record.ts`** | `apps/sentinel/src/ukemi/record.ts` | Suppr. `makeDefaultCall`/`makeBudgetedCall`/`defaultCall`/`backoffDelay`/`DefaultCallOpts` ; `runRecorder` construit `openGuardedClient(env, limits, ledgerDir, cycles, opts)` ; pool sur **labels** (`ETH_CALL_KEYLESS_LABELS`/`GET_LOGS_KEYLESS_LABELS` + `chainstack` **appended last**) ; args REQUIS `--ledger-dir`/`--cycle`/`--floor`/`--max-ru`/`--method-caps` (parser fail-closed, 3 méthodes listées) ; `--max-calls`/`--concordance-out` conservés ; **retry chez l'appelant SEUL** (`AbortError`/réseau, 429, ≥ 500 ; JAMAIS `RpcError`/`NonJsonBody`/autres 4xx/`BudgetExceededError`) ; journal `rpc_errors` construit dans le catch depuis `TransportError` (`e.detail` indice fermé + `e.data` validée, JAMAIS le corps) ; `onTransportError` → `errByOp` (moniteur 5 %) ; `finally` relâche **N** verrous demandés (keyless compris, y compris sur `BudgetExceededError`) par N `runCli unlock`. |
| **L-2 ré-exports `rpc2.ts`** | `apps/sentinel/src/ukemi/rpc2.ts` | Ré-exporte `RpcError`/`BudgetExceededError` du paquet (identité UNIQUE) ; IMPORTE `isResultLimit`/`isPlanLimited`/`isRpcRevert` (aucune 2ᵉ regex, classes locales SUPPRIMÉES) ; conserve `ConcordantRevertError` (consommé `book.ts:11`), `NoQuorumError`, `operatorOf`, `revertKey`, `makeUkemiPool`, `ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` (verrou d'ordre, M-10) ; assertion `operatorOf("nodies.app")===operatorOf("pocket.network")==="pocket"` (C-6(iv)). |
| **L-3 grep CI** | `test/rpc-guard-fetch-only-inside-client.test.ts` | Portée étendue à `apps/sentinel/src/ukemi/**` (0 hit hors allowlist) ; allowlist à **2 entrées** (`packages/rpc-guard/src/transport.ts` + `apps/sentinel/src/rpc.ts`, déclencheur **NARABI-OPS-1d**, décision 118) ; non-vacuité conservée ; skip résiduel = Bell (1b). Portée de `rpc.ts` à trancher (D-grep). |
| **L-4 tests imposés + mutants** | `apps/sentinel/test/**` + `packages/rpc-guard/test/**` | §9 (tests + mutants nommés). |
| **L-5 ripple + ADR** | 3 tests legacy, éventuels `u4-*.mjs`/`ethereum.ts`, ADR amendé | Absorber la ripple (M-2, M-3, M-6) ; amendement daté de l'ADR (tuyau 2b-ii, résidus, `"0x"`, C-GD-2 fermé) ; runbook N `unlock`. |

## 6. Décisions proposées — D-n (« proposé » ; l'orchestrateur tranche)

### D-1 (`record.ts`) — chemin unique gardé
Comme L-1. Shim `call: RpcCall` = tally NON-gatant (calls/byOperator/byMethod pour la provenance — `spent().byOperator`
est la DÉPENSE en unité, pas un compte d'appels). Câblage : `budgeted.call` remplacé par le `client.call` du garde ;
le `makeUkemiPool({ call, … })` reçoit le call gardé. **Décision à confirmer (DEV-2 G1 2b-i)** : `--max-ru`/`--method-caps`
REQUIS toujours, ou seulement quand `chainstack` est demandé (une course keyless-only n'a pas d'opérateur payant) —
`assertLimits` (`client.ts:70`) n'exige un run cap que pour un payant DEMANDÉ ⇒ proposé : **requis conditionnellement à
`CHAINSTACK_ETH_URL` présent**, `--floor`/`--ledger-dir`/`--cycle` toujours requis.

### D-2 (`rpc2.ts`) — vocabulaire et classe canonique uniques
Comme L-2. **Point dur (M-3)** : ré-exporter la classe canonique casse `apps/bell/src/ethereum.ts:67` (cross-lot 1b) et
~18 sites de `ukemi.test.ts`. Voir D-ethereum.

### D-3 (grep CI) — portée + allowlist + emplacement CI (M-4/M-5)
- **Portée (D-grep, à trancher)** : (a) `apps/sentinel/src/ukemi/**` SEUL (addendum L-2-4, mission) ⇒ `rpc.ts` jamais
  scanné ⇒ son entrée d'allowlist est **VACANTE** et la non-vacuité (G1 2b-i §8) (« scan rpc.ts seul ⇒ ≥ 1 hit »)
  **impossible** ; OU (b) `apps/sentinel/src/ukemi/**` ∪ {`apps/sentinel/src/rpc.ts`} (rpc.ts SCANNÉ et allowlisté ⇒
  allowlist porteuse, non-vacuité tenue ; `run.ts`/`timeline.ts` HORS portée jusqu'à NARABI-OPS-1d) ; OU (c)
  `apps/sentinel/src/**` (ADR A-6) — mais tire `run.ts`/`timeline.ts` en portée (à re-mesurer). **Proposé : (b)** — c'est
  la seule qui rend l'allowlist `rpc.ts` load-bearing tout en gardant `run.ts` hors portée ; réconcilie l'écart
  addendum L-2-4 (`ukemi/**`) vs ADR A-6 (`apps/sentinel/src/**`), à faire acter par l'orchestrateur.
- **Non-vacuité de PORTÉE (pas seulement d'allowlist)** : miroir du garde `assert.ok(pkgFiles.length > 5)` du test paquet
  (`:70`) — le test ukemi asserte `≥ 8` fichiers `ukemi/*.ts` scannés (M-13 : 8 aujourd'hui) sinon un chemin faux passe
  vert à vide. Nouveau `test(` ACTIF (C-6(i) « ACTIVE dès 2b ») : `ukemi_src_clean_and_allowlist_load_bearing` (miroir de
  `rpc_guard_package_src_clean_and_allowlist_load_bearing`) — 0 hit hors allowlist + non-vacuité de portée + allowlist
  porteuse (scan `rpc.ts` seul, allowlist vide ⇒ ≥ 1 hit). C'est à cela que « épingle la présence de l'étape » se ramène
  quand il n'y a PAS d'étape `ci.yml`.
- **Mutant « allowlist élargie sans déclencheur » (mécanique)** : rendre l'allowlist un `Map<path, trigger>` (chaque
  entrée NOMME son déclencheur) ; test asserte (i) chaque entrée a un `trigger` non vide, (ii) l'ensemble des chemins =
  exactement {`packages/rpc-guard/src/transport.ts`, `apps/sentinel/src/rpc.ts`→`NARABI-OPS-1d`} (ensemble FERMÉ) ⇒ une
  3ᵉ entrée sans déclencheur, ou un chemin non attendu, rougit.
- **Emplacement CI (M-5)** : le grep RIDE `npm test` (job **g3-verification**, `ci.yml:102`), collecté par le glob
  `package.json:16` `"test/*.test.ts"`. **Proposé** : NE PAS ajouter d'étape `run:` dédiée dans `ci.yml`, NI un pin
  `ci-gates` type `ci_runs_export_check` (le grep n'est pas une étape `run:`, contrairement à `export:check`/SBOM).
  ⇒ 2b-ii **ne touche pas `ci.yml`** (réduit la coordination avec LANG-GATE-CI — cf. §11). Assertion d'entrée/G1 :
  prouver que le glob collecte le fichier (M-5 : 30 `test/*.test.ts`).

### D-4 (conformité des TROIS classifieurs côté recorder) — M-7
Test imposé `ukemi_recorder_classifiers_are_single_source_conformant` : classes/prédicats LOCAUX supprimés de `rpc2.ts`,
IMPORTÉS de `@monark/rpc-guard` (`classify.ts`). Pour chaque corps mesuré {POCKET_5000, POCKET_10000, DRPC_FREE (M-7),
+ 1 HTML NonJsonBody, + 1 « Reverted … » sans « execution »} : `isResultLimit(hint)===isResultLimit(corps)`,
`isPlanLimited(hint)===isPlanLimited(corps)`, `isRevertText(hint)===isRevertText(corps)` (préséance plan : `getLogsVia`
benche DRPC_FREE, ne split pas). Mutant **« classe locale restaurée »** (rpc2.ts réintroduit un `RpcError` local ou une
regex locale) ⇒ ROUGE (identité `instanceof RpcError` cassée à travers la frontière ⇒ `ConcordantRevertError` ne se
forme plus ⇒ un test quorum rougit ; et/ou drift regex↔`ERROR_HINT_TOKENS`).

### D-"0x" (C-R-2(c), M-8) — DEUX options, l'orchestrateur décide
Fait : un revert chainstack à `data === "0x"` est CONSERVÉ (`validateRevertData:124`), `isRpcRevert` VRAI (`classify.ts:52`
ne benche que `undefined`), mais `revertKey:60` traite `"0x"` comme absent et retombe sur le message ⇒ sous D6,
`revertKey(chainstack)` (préambule à label `transport.ts:150`) ≠ `revertKey(keyless)` (message expurgé sans préambule
`transport.ts:145-146`) ⇒ **perte de concordance** chainstack↔keyless sur les reverts sans raison (jamais un FAUX
accord — labels différents). Effet NARROW (chainstack ajouté EN DERNIER — atteint seulement si un keyless de tête est benché).
**Le guard `!== "0x"` de `revertKey:60` est DÉLIBÉRÉ et load-bearing** : épinglé par `ukemi_revert_key_uses_data`
(`ukemi.test.ts:131-142`), sous-cas `mixed` (`:140-141`, commentaire `:137-139`) = **cas GHO réel mesuré (V-4)** où un
fournisseur rend `data "0x"` et l'autre AUCUNE data ; le guard route les DEUX sur le message ⇒ concordent ⇒ le livre
n'abstient pas un vrai fait on-chain. Toute option doit préserver ce cas keyless-vs-keyless.
- **Option 1 — bencher la jambe PAYANTE pour `"0x"`/absent (conservateur ; PRÉSERVE le test existant).** Étendre
  C-1(c) : « data utilisable » = `data !== undefined && data !== "0x"` pour le BANC payant. Concrètement `isRpcRevert`
  (`classify.ts:52`) → `if (e.unit !== "keyless" && (e.data === undefined || e.data === "0x")) return false;` (conserve
  « présente mais vide » dans `rpc_errors` ; l'alternative `validateRevertData` normalisant `"0x"→undefined` perd cette
  info dans le journal — proposé : la voie `isRpcRevert`). **Effet** : un revert chainstack sans raison est BENCHÉ
  (abstient la JAMBE, jamais le livre) ; le chemin keyless-vs-keyless est INCHANGÉ (le test `mixed :140` pilote des eps
  KEYLESS ⇒ reste VERT). Perd une concordance vraie possible chainstack+keyless sur un bare-revert (NARROW, chainstack
  en dernier). Miroir du résidu CA-7 déjà déclaré pour `undefined`. Cohérent avec la doctrine D6/C-1(c). Test neuf
  `paid_revert_with_empty_0x_data_is_benched` ; mutant « `"0x"` traité présent pour un payant » ROUGE. **Ne casse PAS
  `ukemi_revert_key_uses_data`.**
- **Option 2 — toucher `revertKey`/le message pour rendre le revert payant comparable au keyless.** Deux sous-variantes,
  chacune avec une régression DÉCLARÉE :
  - **2a (variante checkpoint-2 §6, narrow)** : comparer `"0x"` comme DONNÉE seulement quand LES DEUX côtés portent un
    champ `data` (chainstack `"0x"` ↔ keyless `"0x"` concordent par la donnée). **Ne casse PAS `mixed`** (un côté à data
    absente ⇒ retombe sur le message). Mais ne ferme le trou que si le keyless rend aussi `"0x"` (pas s'il rend data
    absente en face d'un chainstack `"0x"`) — fermeture PARTIELLE, complexité ajoutée.
  - **2b (retirer l'exception `!== "0x"` de `revertKey:60`)** : `"0x"` keyé comme donnée toujours. **CASSE
    `ukemi_revert_key_uses_data` :140-141 `mixed` en ROUGE** (eps[0] clé `"0x"` vs eps[1] clé message ⇒ désaccord ⇒
    abstient le fait GHO V-4) — **régression MESURÉE d'un comportement load-bearing**, pas seulement « couverture + risque ».
  - Toute variante ignorant le message perd la discrimination keyless (deux bare-reverts de causes différentes à data
    vide concorderaient faussement) ⇒ ré-ouvre le risque que C-1(c) ferme ; sûre seulement si un test épingle que les
    messages keyless à data vide ne portent pas de raison discriminante (fixtures actuelles ne l'établissent pas).
- **Observation (non un verdict)** : l'Option 1 prolonge la doctrine existante (payant sans data utilisable ⇒ banc) et
  ne touche AUCUN test existant ; l'Option 2 touche un guard load-bearing (2b rougit `ukemi_revert_key_uses_data` ; 2a
  est partielle). Le choix appartient à l'orchestrateur (couverture vs conservatisme). Résidu à déclarer quel que soit
  le choix (CA-7).

### D-label (M-9) — label publié de chainstack
- **Option A** : conserver le relabel `archive-env` (compat POOL-RPC-1a / fixtures env-indépendantes PROVENANCE-u3:46).
- **Option B** : adopter `chainstack` (label du garde, unité cohérente avec le ledger `chainstack.jsonl`).
Effet sur : `endpoints`, `calls_by_operator`, les paires `--concordance-out` (`tallyConcordance:289-291`), ET la ligne
META du cache `--resume` (`record.ts:358-360` écrit `providers: opLabels(...)`) — un cache écrit avec `archive-env` et
relu sous `chainstack` (M-9). **Proposé de trancher au G1 après lecture du réducteur POOL-RPC-1a** (quel label il
attend) ; défaut prudent = A (aucun consommateur de provenance ne casse), à confirmer.

### D-u4scripts (M-6) — scripts `u4-*.mjs` cassés silencieusement
- **Option (i)** migrer les 3 scripts sous le garde (R-25 +, et provenance U-4a à respecter — `u4-redraw` est un contrôle
  DÉJÀ exécuté) ; **(ii)** les ARCHIVER/retirer avec item formé (ils sont one-shot, hors CI, fixtures déjà pinnées) ;
  **(iii)** shim de compat déclaré. **Proposé** : (ii) archivage avec item formé + note de provenance (ils ne sont NI
  gelés NI en CI ; `u4-redraw` a rendu `all_match` le 2026-09-21) — zéro-dette (jamais un import cassé nu). À trancher.

### D-ethereum (M-3) — cross-lot `apps/bell/src/ethereum.ts:67`
Ré-exporter la classe canonique casse `ethereum.ts:67` (apps/bell = lot **1b**, pas 2b-ii). **Option (i)** 2b-ii corrige
`ethereum.ts:67` + `pool-rpc-1a-bell.test.ts` (ripple cross-lot déclarée, ~4-8 lignes : réordonner vers la signature
canonique) ; **(ii)** coordonner l'ordre avec 1b (mais 1b est `upcoming`) ; **(iii)** garder transitoirement un
`RpcError` local dans `rpc2.ts` — **REJETÉ** (contredit C-1(a) et le mutant « classe locale restaurée » ROUGE de D-4).
**Proposé** : (i) — ripple cross-lot minimale et DÉCLARÉE (jamais une casse silencieuse), inscrite au périmètre L-5. À
trancher (l'orchestrateur peut préférer coordonner avec 1b).

### D-keyless-cycle — convention de cycle pour une course keyless-only
`openGuardedClient` prend `cycles: Record<label, string>` ; ruling h : `cycles[keyless]` = cycle de l'opérateur PAYANT.
Une course keyless-only (pas de `CHAINSTACK_ETH_URL`) n'a pas de payant ⇒ convention à fixer (proposé : `--cycle`
s'applique à tous les opérateurs demandés ; pas de cap RU ; ledgers keyless coût 0 sous ce `<cycle>/`). À confirmer.

## 7. Tuyaux déclarés (règle Branchement)
| Pièce | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| recorder gardé (`record.ts`) | argv + env (`CHAINSTACK_ETH_URL` via le transport du garde, JAMAIS imprimé) → `openGuardedClient` | `<ledgerDir>/<cycle>/chainstack.jsonl` (+ `.head`/`.lock`) + ledgers keyless (coût 0) + artefacts recorder (book/filter JSON) inchangés | **`upcoming`** jusqu'au G7 de 2b-ii (voir tension registre ci-dessous) | `ukemi_record_spends_only_through_guard` (espion `globalThis.fetch` : tout `fetch` payant précédé de sa ligne ledger sur disque) via `runRecorder` réel |
| vocabulaire/classe (2b-i, `classify.ts`/`RpcError`) | `raise` du transport | `rpc2.ts` (ré-export + imports, `revertKey`, `getLogsVia`) + journal `rpc_errors` | branché à la fusion 2b-ii | conformité inter-paquets (D-4) |
| rapprochement servi | ledger produit par `runRecorder` | `runCli unlock` → `runCli reconcile` (mode `aggregate-calibration`) verdict + exit | servi | `ukemi_record_then_unlock_then_reconcile_end_to_end` |

**Le recorder devient consommateur SERVI du paquet** : le paquet passe **`built`** SEULEMENT au G7 de 2b-ii avec un test
d'intégration non-LLM rejouant transport→classify→record de bout en bout. **Tension à surfacer (non tranchée)** : la
mission dit « `built` au G7 de 2b-ii » ; l'addendum (tuyaux), le complément §5 CA-11 et le G7-2a (§20) disent « **branché**
à la fusion 2b + grep, `built` à la **première course RAPPROCHÉE**, `upcoming` au registre public jusque-là ». Proposé :
au G7 de 2b-ii, la règle Branchement est SATISFAITE (chemin servi + e2e non-LLM) ⇒ **branché** ; le flip du registre
public site/README/skill vers `built` reste l'acte de l'orchestrateur à la première course rapprochée. Deux sources
citées, choix à l'orchestrateur.

## 8. Invariants byte-identiques (M-10) — sha à vérifier AVANT == APRÈS au G1
```
scripts/census/u4b/u4b-scores.mjs   9ad20666af878c63…      apps/sentinel/src/ukemi/wadray.ts   7bee76fc96a9bc23…
scripts/census/u4b/u4b-reduce.mjs   a5e66cd387279f46…      apps/sentinel/src/ukemi/abi.ts      3376eb084f522cb2…
scripts/record-u4b-calib.mjs        5733daeb7c8ee40a…      packages/hikae/src/l1-split.ts      9206df9189d3eba6…
apps/sentinel/src/rpc.ts            0e232519a18aaa43…  (C-3, gelé — NON touché : hors ukemi/**)
```
+ `book_digest 034fbff9…` et `PINNED_DIGEST 267cd991…` INCHANGÉS (invariant FORT : la migration change la plomberie
transport/budget, PAS les octets du livre — `ukemi.test.ts` épingle `book_digest`) ; fixtures `u4/`+`u4b/` byte-identiques.
`record.ts`/`rpc2.ts` **changent** (attendu ; NON gelés). Oracle : `git diff --quiet <base> -- scripts` (scripts gelés
intacts) + recompute des 7 sha. `ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` restent exportés, ordre inchangé (verrou
`multi-operator.test.ts:298-301`, M-10).
**Dérive ATTENDUE (non un invariant, M-13)** : `ukemiSha(here)` (`record.ts:395/424`) hache `ukemi/**.ts` ⇒ migrer
`record.ts`/`rpc2.ts` change `ukemi_sha`. **AUCUN test ne l'épingle** (seul `apps/sentinel/test/fixtures/ukemi/PROVENANCE-weth-book.md:20`
l'ENREGISTRE, `8aae7bbe…`) ⇒ pas de rouge caché à l'oracle ; la provenance des courses futures portera un nouveau
`ukemi_sha` — dérive DÉCLARÉE, pas un invariant à figer.

## 9. Tests imposés (noms) et mutants (ROUGES) — repris du blueprint 2b-i §8 + ajouts mesurés
**Tests imposés** (addendum L-2-3/L-2-4 + complément §3 + pli C-5/C-6) :
`ukemi_record_spends_only_through_guard` ; `ukemi_record_requires_ledger_dir_cycle_and_method_caps` ;
`ukemi_record_budget_refusal_is_not_retried` (refus LEDGERÉ sur disque) ; `ukemi_record_resume_hits_cost_zero_ru` ;
`ukemi_budget_counts_http_attempts` (R retries d'appelant ⇒ **R+1 lignes** ledger sur disque) ;
`ukemi_record_then_unlock_then_reconcile_end_to_end` (mode `aggregate-calibration`) ;
conformité inter-paquets `isResultLimit/isPlanLimited/isRevertText` hint↔corps (fixtures M-7 + HTML) (D-4) ;
C-3 (un corps clé-base64 n'apparaît NI dans `rpc_errors` NI sur stderr) ; C-6(iii) retry ; C-6(iv) `operatorOf` ;
grep (`ukemi/**` 0 hit + allowlist à 2 entrées + non-vacuité + skip Bell).
**Mutants (ROUGES, restauration byte-exacte)** : `makeBudgetedCall` local restauré ; arguments rendus optionnels ;
retry avale le refus ; retry SOUS le tick (R retries ⇒ R lignes au lieu de R+1) ; **classe locale `RpcError`/regex locale
restaurée** (D-4, identité `instanceof` cassée) ; corps écrit dans `rpc_errors` ; `finally` ne relâche pas les keyless ;
allowlist élargie SANS déclencheur ; (+ selon D-"0x") mutant `"0x"` traité présent pour un payant.

## 10. R-25 estimé (M-2/M-3/M-6) + couture pré-déclarée
Ancres MESURÉES : `record.ts` 467 (réécrit ≈ 260 net, G1 2b-i §0) ; `rpc2.ts` 269 (ré-exports + imports + suppr. classes
locales ≈ 30-50) ; ripple des 3 tests : `ukemi-record.test.ts` 327 (17 usages supprimés), `ukemi-u4a.test.ts` 230
(**25 usages** — la plus lourde), `ukemi.test.ts` 355 (5 `defaultCall` + **~18 `new RpcError`** à réécrire à la signature
canonique, M-3) ; + ~15 tests imposés + e2e + conformité + grep.
- **Estimation migration ≈ 800–945** (concorde G1 2b-i §0 borne basse ~800 / centrale ~945 et `CHANTIERS:595`),
  **< 1150**. Borne basse ~800 = **retirer** les tests `makeDefaultCall`/`makeBudgetedCall` legacy (citer la couverture
  transport du paquet) plutôt que les réécrire ; centrale ~945 = réécrire.
- **Conditionnels non chiffrés par le G1 2b-i** (peuvent pousser vers/au-delà de 1150) : (a) C-G-1/C-G-3/C-R-3 si NON
  fermés par le pli 2b-i (~40-80 dans `packages/rpc-guard/test`, §11) ; (b) `ethereum.ts:67` + `pool-rpc-1a-bell.test.ts`
  (D-ethereum, cross-lot, ~4-8) ; (c) `u4-*.mjs` si migrés (D-u4scripts) ; (d) réécriture des ~18 `new RpcError` de
  `ukemi.test.ts` (M-3, sous-estimée par le G1 2b-i).
- **Seconde couture PRÉ-DÉCLARÉE (si R-25 mesuré au G1 > 1150)** : la migration est **atomique** — le mutant imposé
  « `makeBudgetedCall` restauré ⇒ rouge » FORCE la suppression, qui casse structurellement `ukemi-u4a.test.ts` au
  typecheck (G1 2b-i §0) ⇒ suppression + ripple non séparables sans laisser un mutant non prouvé. Levier prioritaire :
  **substitution de couverture** (retirer les tests legacy `makeDefaultCall`/`makeBudgetedCall`, citer la suite transport
  du paquet — borne basse ~800) AVANT toute scission de PR. Si > 1150 subsiste : **ESCALADE orchestrateur** (l'atomicité
  est une contrainte imposée, pas un choix worker). Le worker G1 MESURE (jamais n'estime) et rend `git diff --shortstat`
  verbatim (pathspec `ci.yml:65`).

## 11. Exigences d'ENTRÉE (M-11) — ordre et conditions
- **C-G-1 et C-G-3 (BLOQUANTES pour le G1 de 2b-ii, CONDITIONNELLES)** : la G2 2b-i les rend bloquantes à l'entrée de
  2b-ii (elles gardent le vocabulaire et `isRpcRevert` que 2b-ii branche au livre). C-G-1 = dériver les regex de
  `ERROR_HINT_TOKENS` OU test `error_vocabulary_regex_alternatives_are_all_hint_tokens` (drift regex↔table ⇒ découpe de
  plage manquée, jusqu'à 2^20 appels payants). C-G-3 = test `isRpcRevert(code≠3/-32000, msg revert)===false`.
  **Conditionnel** : SI le pli 2b-i en vol (git log) les FUSIONNE, elles sont satisfaites à l'entrée ; SINON le G1 de
  2b-ii les porte (et leur R-25 s'ajoute, §10-a). Divergence checklist/G0 si omises ⇒ escalade à ce moment-là.
- **C-R-3 (checkpoint-2, déclencheur « pli 2b-i OU G1 de 2b-ii au plus tard », CONDITIONNELLE)** : conformité complète
  (3 corps M-7 + « Reverted » sans « execution » (V12) + garde de code (V9=C-G-3)). Chevauche C-G-3 (V9) — mapper.
- **C-GD-2 (G7-2a « exigence d'entrée du G0 2b »)** : **FERMÉE structurellement par D6 de 2b-i** (payant ⇒ `closedHint`,
  aucun octet du corps, M2 ROUGE). À écrire « fermé, pas ouvert » — pas une exigence ouverte.
- **Ordre inter-lots** : la mission déclare **LANG-GATE-CI fusionné AVANT** (« `ci.yml` partagé »). Mesuré (M-5) : si
  2b-ii ne touche PAS `ci.yml` (D-3, grep = test in-suite), le couplage `ci.yml` est **évité** ⇒ l'ordre LANG-GATE-CI↔2b-ii
  se relâche. Proposé : inscrire l'ordre comme déclaré par l'orchestrateur, ET noter que 2b-ii peut ne pas éditer
  `ci.yml` (le grep ride `npm test`) — l'orchestrateur confirme s'il veut néanmoins une étape `ci.yml` (couplage à gérer).

## 12. Oracle (codes capturés DIRECTEMENT, hors pipe)
`npm run ci && npm run lint && npm run lint:ratchet` (+ `npm run lang:gate` par G1 2b-i) sur l'arbre fusionné.
Spécifiquement : suite verte (aucun `fail`) ; `book_digest 034fbff9` / `PINNED_DIGEST 267cd991` épinglés verts ;
7 sha gelés (M-10) AVANT==APRÈS + `git diff --quiet <base> -- scripts` ; `git diff --shortstat` (pathspec `ci.yml:65`
verbatim) pour R-25 ≤ 1150 (ou couture §10) ; tous les mutants (§9) ROUGES sur leur test nommé, restauration byte-exacte
sha256 ; grep `ukemi/**` = 0 hit hors allowlist + non-vacuité + skip Bell restant. Le worker rend `sha256sum` worktree
vs manifeste livré (ADR-C01).

## 13. Critères d'acceptation
CA-11 (durci) : le recorder gardé est **branché** à la fusion (test e2e `runRecorder → unlock → reconcile` non-LLM) ;
registre public `upcoming` jusqu'à la première course rapprochée (§7). CA-2 : la migration + les corrections C-G/C-R
foldées SUR le paquet sont du travail de couture pré-déclarée (aucune décision de valeur nouvelle — celles à valeur
sont RENVOYÉES à l'orchestrateur/investisseur : D-"0x", D-label, D-u4scripts, D-ethereum, portée grep, registre).
CA-7 : résidu D-"0x" déclaré (option retenue) ; C-GD-2 fermé ; résidus `.data` (clé partielle/base64 hex) nommés
(C-R-2(c)). CA-3 : amendement daté de l'ADR (tuyau 2b-ii, `"0x"`, C-GD-2 fermé, runbook N `unlock`). CA-9 : oracle
re-exécuté sur arbre isolé à `node_modules` résolvant `@monark/*` correctement (leçon jonction, G2 2b-i FM-3.3).

## 14. Items formés (zéro dette nue — chacun propriétaire + déclencheur)
1. **D-"0x"** : point de conception à trancher (2 options, §6) — propriétaire orchestrateur, déclencheur = ce G0.
2. **D-ethereum** : ripple cross-lot `apps/bell/src/ethereum.ts:67` (1b) — propriétaire orchestrateur, déclencheur =
   ré-export canonique de `rpc2.ts`.
3. **D-u4scripts** : `u4-*.mjs` cassés par la suppression — propriétaire orchestrateur, déclencheur = suppression
   `makeDefaultCall`/`makeBudgetedCall` ; jamais un import cassé nu (M-6).
4. **D-label** : label chainstack (`archive-env` vs `chainstack`) — déclencheur = lecture du réducteur POOL-RPC-1a au G1.
5. **Portée grep** (D-grep) : réconcilier addendum L-2-4 (`ukemi/**`) vs ADR A-6 (`apps/sentinel/src/**`) + vacuité de
   l'allowlist `rpc.ts` — déclencheur = ce G0.
6. **Registre built/upcoming** : tension mission vs addendum/G7-2a (§7) — déclencheur = G7 de 2b-ii.
7. **C-G-1/C-G-3/C-R-3** : exigences d'entrée conditionnelles au pli 2b-i (§11).
8. **DEV-2 / D-keyless-cycle** : `--max-ru` conditionnel + cycle keyless-only (§6 D-1/D-keyless-cycle).

## 15. Hors périmètre (déclaré)
Job quotidien Narabi (`run.ts`/`rpc.ts`, lot **NARABI-OPS-1d** ; résiduel Chainstack payant hors garde ACCEPTÉ temps 1,
décision 118, `CHANTIERS:550`) ; Bell (1b) sauf la ripple minimale `ethereum.ts:67` DÉCLARÉE (D-ethereum) ; prereg et
course U-4b-1b (étape suivante orchestrateur) ; quota mensuel / overage Chainstack (NON LU — procurement si une course
approche 16 M RU, A-5).

## 16. Risques (MAST) — résiduel
Casse silencieuse hors CI (`u4-*.mjs`, M-6) — contrée par item formé D-u4scripts (jamais un import cassé nu) ; ripple
cross-lot non déclarée (`ethereum.ts`, M-3) — contrée par D-ethereum au périmètre ; sous-estimation R-25 (`ukemi.test.ts`
`new RpcError`, M-3) — contrée par la mesure G1 + couture §10 ; drift regex↔vocabulaire (C-G-1) et garde de code (C-G-3) —
exigences d'entrée §11 ; faux accord de revert (`"0x"`, M-8) — D-"0x" (Option 1 = banc conservateur) ; casse du gel U-4b —
§3 (pas de STOP, prouvé) + invariants §8 ; vacuité d'allowlist (`rpc.ts` hors portée, M-4) — D-grep.

---
**R-1** : `claude-opus-4-8[1m]`. **R-20** : aucun commit, aucun workflow. **R-21** : écrit pour vérification
adversariale (chaque chiffre → `MESURES.md`). Aucune décision prise par le worker : « proposé » partout ; les
questions de valeur sont renvoyées à l'orchestrateur/investisseur.

## RULINGS ORCHESTRATEUR (2026-09-21, avant checkpoint-1 ; supersèdent les « proposé » ci-dessus sur ces points)
- **R-A `data === "0x"`** : **Option 1** — la jambe payante est BENCHÉE quand `data` est `"0x"` ou absente (prolonge D6 / C-1(c)) ; le guard `revertKey:60` et le test `ukemi_revert_key_uses_data` (sous-cas `mixed`, cas GHO V-4) sont CONSERVÉS. Option 2b rejetée : régression mesurée.
- **R-B portée du grep CI** : `apps/sentinel/src/ukemi/**` ∪ `apps/sentinel/src/rpc.ts` (alignée sur ADR A-6 ; l'entrée d'allowlist `rpc.ts` à déclencheur -1d devient non vacante). Test in-suite (job `g3-verification`), aucune étape `ci.yml` ; LANG-GATE-CI fusionne néanmoins AVANT (règle de conflit, coût nul).
- **R-C registre** : au G7 2b-ii le paquet est **BRANCHÉ** (consommateur servi + test d'intégration non-LLM transport→classify→record) ; il passe **`built`** à la première course RAPPROCHÉE (U-4b-1b), conformément à l'addendum §5 et au G7 2a. La formulation « built au G7 » de la mission est retirée.
- **R-D ripple `apps/bell/src/ethereum.ts:67`** : le typecheck de l'arbre fusionné doit rester vert ⇒ 2b-ii porte l'adaptation MINIMALE du site d'appel (signature seule, aucune migration Bell sous le garde, déclarée D-ethereum, comptée dans R-25) ; la migration Bell reste GARDE-HELIUS-1b.
- **R-E scripts `u4-*.mjs`** : item formé D-u4scripts (provenance U-4a, hors CI) ; déclencheur : U-7 (rejeu public) ou première réexécution ; propriétaire orchestrateur.
- **R-F exigences d'entrée C-G-1 / C-G-3 / C-R-3** : pliées dans 2b-i (`f4ecf14`, G2-delta en cours) ⇒ satisfaites si la G2-delta PASS ; C-GD-2 : « fermé structurellement par D6 ».
- **R-G transitivité** : mesure M-1 acceptée (aucun STOP doctrinal) — à re-vérifier par le validateur au checkpoint-1 (CA-9).
