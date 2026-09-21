# MESURES — NARABI-OPS-1d (mesures reproductibles pour le G0 DRAFT)

> Worker `claude-opus-4-8[1m]` (effort max, Opus 5 banni), 2026-09-21. Base LECTURE SEULE : `F:\Monark`,
> branche `lot/etude-suite`, HEAD `8aedd03`. Aucun réseau, aucun secret lu, aucun `.env` lu (noms de clés
> seuls). Chaque `M-n` porte la commande/le `fichier:ligne` qui la reproduit. Aucun chiffre de seconde main.

## M-1 — `rpc.ts` figé au HEAD == valeur de gel U-4b
Commande (méthode prereg, `PLAN-u4b-prereg.DRAFT.md:98`) :
`git -C F:/Monark show HEAD:apps/sentinel/src/rpc.ts | tr -d '\r' | sha256sum`
Sortie : `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0`.
== valeur de gel `PLAN-u4b-prereg.DRAFT.md:108` (§2 rangée 7). ⇒ **le HEAD porte encore le `rpc.ts` gelé** : la
fenêtre de gel n'est pas ouverte ; -1d le modifie APRÈS la clôture de la course (voir M-14 et ordre §12 du DRAFT).

## M-2 — `run.ts` au HEAD == sha de production E-5
`git -C F:/Monark show HEAD:apps/sentinel/src/run.ts | tr -d '\r' | sha256sum`
Sortie : `54619a40252f842a77ccf6dedc89c129d5a11eba764cd5018ff5dafa1d7d0ef3`.
== sha E-5 de `docs/G7-lot-narabi-ops-1c.md:7` et `CHANTIERS.md:588` (fusion `c4981d0`). C'est la BASE de non-régression.

## M-3 — hits du grep `fetch_only` sur `apps/sentinel/src/*.ts` (niveau supérieur)
Regex du test (`test/rpc-guard-fetch-only-inside-client.test.ts:37-38`) :
`NET=/\bfetch\s*\(|node:https?|\bundici\b|\bchild_process\b/` ; `KEY=/\benv\.(CHAINSTACK_SOLANA_URL|BELL_SOLANA_RPC|CHAINSTACK_ETH_URL|HELIUS_API_KEY|POLYGON_API_KEY|DATABENTO_API_KEY)\b/`.
Mesuré sur les 7 fichiers de niveau supérieur (`edetector.ts, flow.ts, instrument.ts, rpc.ts, run.ts, timeline.ts, windows.ts`) :
**EXACTEMENT 2 hits, tous dans `rpc.ts`** — `rpc.ts:125 [net]` (`await fetch(url, …)`, `defaultCall`) ;
`rpc.ts:54 [key]` (`env.CHAINSTACK_ETH_URL?.trim()`, `chainstackUrl`). `run.ts`/`timeline.ts`/`windows.ts`/`flow.ts`/
`edetector.ts`/`instrument.ts` = **0 hit**. ⇒ élargir la portée à `apps/sentinel/src/**` (ADR A-6) ne flaggerait
QUE `rpc.ts` ; une fois `rpc.ts` nettoyé, la portée `apps/sentinel/src/**` est verte (sous réserve d'un éventuel
nouveau module keyless — voir D-route).

## M-4 — état ACTUEL de l'allowlist au HEAD (l'entrée `rpc.ts` n'existe PAS encore)
`test/rpc-guard-fetch-only-inside-client.test.ts` : `ALLOWLIST = new Set(["packages/rpc-guard/src/transport.ts"])`
(`:36`, **UNE** entrée) ; portée = `apps/bell/src/**` + `packages/*/src/**` (`:49-52`) ; `apps/sentinel/src/**`
**hors portée** ; test complet `fetch_only_inside_client` **SKIP-until-1b** (`:79`). ⇒ **l'entrée d'allowlist
`apps/sentinel/src/rpc.ts` que -1d doit RETIRER est AJOUTÉE par GARDE-HELIUS-2b-ii** (L-3 / ruling R-B,
`docs/G0-lot-garde-helius-2b-ii.md:74,321`), pas présente ici. Dépendance d'ordre dure (§12 du DRAFT).

## M-5 — divergence des pools keyless (garde vs Narabi)
Garde (`packages/rpc-guard/src/transport.ts:34-35,38-44`), keyless ETH résolus en labels (5) :
`drpc.org, mevblocker.io, nodies.app, pocket.network, tenderly.co`.
Narabi `PUBLIC_ENDPOINTS` (`apps/sentinel/src/rpc.ts:19-24`), 7 URL → `providerOf` (6 providers distincts) :
`publicnode.com` (×2 alias : `ethereum-rpc.` + `ethereum.`), `drpc.org`, `mevblocker.io`, `1rpc.io`,
`blxrbdn.com`, `pocket.network`.
- **Communs** : `drpc.org`, `mevblocker.io`, `pocket.network`.
- **Dans le garde, ABSENTS de Narabi** : `nodies.app`, `tenderly.co`.
- **Dans Narabi, ABSENTS du garde** : `publicnode.com`, `1rpc.io`, `blxrbdn.com`.
⇒ router le keyless de Narabi PAR le garde exige d'AJOUTER `publicnode.com/1rpc.io/blxrbdn.com` au paquet
`@monark/rpc-guard` (change inter-lots, partagé avec Ukemi ; verrou d'ordre `ETH_CALL_KEYLESS_LABELS`). Voir D-route.

## M-6 — les 3 méthodes Chainstack de Narabi sont toutes à 2 RU
Narabi appelle Chainstack (comme 8ᵉ endpoint du pool) via : `eth_getBlockByNumber` (`finalized`, `blockTs` —
`rpc.ts:219,224`), `eth_getLogs` (`windowFlow` — `rpc.ts:206`), `eth_call` (`supplyAt` — `rpc.ts:234`). Les TROIS
∈ `CHAINSTACK_AGE_SENSITIVE_EVM` (`packages/rpc-guard/src/tariff.ts:45-51`) ⇒ `chainstackRu(m)=2` (`tariff.ts:73`).
Aucune méthode 1 RU, aucune méthode hors table. ⇒ `--method-caps` = exactement `{eth_getBlockByNumber, eth_getLogs, eth_call}`.

## M-7 — volume d'appels par run (borne + timing)
Motif d'appels (`rpc.ts` + `windows.ts`) : par RUN `finalized()` = `quorumTwo` (`rpc.ts:219`, ≥ 2 appels, 2
providers). Par JOUR dû : `windowBounds` = **2** recherches binaires `firstBlockAtOrAfter` (`windows.ts:68-69`),
chacune `≈ log2(hi−lo)` itérations de `blockTs` (= `one()`, un endpoint) ; `windowFlow` = `quorumTwo` `eth_getLogs`
(2 + découpes de plage) ; `supplyAt(close)` + `supplyAt(open)` = 2× `quorumTwo` `eth_call` (2 chacun).
Le 1ᵉʳ jour cherche sur `[DEPLOY_BLOCK=18_571_358, finalized]` (`run.ts:21,113`) ≈ `log2(~4 M) ≈ 22` × 2 ≈ **~44
`blockTs`** ; les jours suivants se resserrent (`lo` = `to_block+1`, `run.ts:139`). Timing mesuré : **D = 25,481 s
pour UN jour dû** (T=3, `CHANTIERS.md:287`, JOURNAL merge `9b178f3`). Chainstack n'est QU'UN endpoint sur 8 ⇒ sur
pool sain il reçoit ~1/8 des appels `one()` ; sur pool libre EN PANNE (scénario de l'incident 2026-09-20) il peut
recevoir la majorité. **Borne haute (tous les appels sur Chainstack, ≤ 7 jours/run budgété)** : `~46 appels/jour ×
2 RU × 7 ≈ ~640 RU/run` — **« très loin » du cap 16 M RU (décision 118 CONFIRMÉE)**. **Le compte EXACT par (endpoint,
méthode) est à MESURER au G1** (instrumenter le stub `call` d'un rejeu, p. ex. `apps/sentinel/test/sentinel-retry.test.ts`,
compteur par `(url, method)`), jamais deviné ⇒ dimensionnement des caps au G1.

## M-8 — la sonde DÉPLOYÉE lit `chainstack_present` dans les `endpoints` publiés
`scripts/probe-narabi.mjs:106` : `CHAINSTACK_PROVIDERS = ["chainstack.com","p2pify.com"]` ; `:110`
`chainstackPresent(endpoints) = endpoints.some(e => CHAINSTACK_PROVIDERS.includes(providerOf(e)))`. La sonde décide
donc de la présence Chainstack par le **domaine enregistrable** d'un endpoint publié. Aujourd'hui `run.ts:213`
publie `publishedEndpoints()` = 7 URL publiques + `redactEndpoint(chainstackUrl)` = **origine** (`rpc.ts:69-72`,
`https://<hôte>.core.chainstack.com`) ⇒ `providerOf → chainstack.com` ⇒ `chainstack_present:true`. Déployée
`c0027cb` (`ADR-NARABI-OPS-1` tuyau 3) ; épinglée `probe_chainstack_present_from_real_producer_line`.
⇒ **Si `rpc.ts` cesse de lire la clé, plus rien dans le sentinel ne peut produire l'origine `chainstack.com`** (le
garde n'expose JAMAIS d'URL). COLLISION avec « aucun changement de sortie publiée » (voir D-published).

## M-9 — le verrou du garde reste TENU après un crash (fail-closed)
`packages/rpc-guard/src/lock.ts:20` : `openSync(<cycleDir>/<op>.lock, "wx")` (création EXCLUSIVE) ; fd fermé aussitôt
(`:25`, le verrou = l'EXISTENCE du fichier) ; en-tête `:4-6` : « **A stale lock after a crash STAYS held
(fail-closed) ; release is the EXPLICIT served `unlock`** ». `EEXIST ⇒ LockHeldError` (`:22`). `runUnlock(ledger, op,
reason)` (`:38`) appende `outcome=unlocked` puis `unlink`. ⇒ un kill `TimeoutStartSec` (SIGTERM) d'un run Narabi
laisse `chainstack.lock` ⇒ le créneau suivant `LockHeldError` AVANT toute lecture de ledger. Voir D-lock.

## M-10 — écart de timeout (20 s vs 30 s)
`rpc.ts:123` : `AbortController` à **20_000 ms** par appel. `transport.ts:25` : `DEFAULT_TIMEOUT_MS = 30_000`.
Le résiduel A′ de -1c chiffre `one()` à « 9 endpoints × 20 s » (`ADR-NARABI-OPS-1:123`, `RUNBOOK-sentinel.md:199`).
⇒ router Chainstack par le garde à 30 s changerait l'arithmétique de marge -1c. Passer `opts.timeoutMs: 20_000`
sur la jambe Chainstack (le garde l'accepte, `transport.ts:52,84`) OU déclarer + re-dériver. Invariant + test (§8).

## M-11 — `line_hash`/book/timeline sont HORS provenance (invariant fort)
`apps/sentinel/src/timeline.ts:53` : « Hashed fields = fact+score+state ; **the last three are provenance
(outside the hash)** » ; `:64` `endpoints, node_version, sentinel_sha` listés APRÈS `line_hash` ; `hashedFields`
(`:94`) + `lineHashOf` (`:104-105`). ⇒ changer `endpoints` (label/origine) ou `sentinel_sha` **ne change PAS
`line_hash`** ⇒ chaîne `prev_line_hash` et `book_digest` INCHANGÉS. **Nuance** : la VALEUR du champ `endpoints`
publié fait quand même partie de la ligne SERVIE (JSON), et la sonde la lit (M-8) — « sortie publiée » ≠ « hash »
(voir D-published). `sentinelSha` (`run.ts:149-153`) = `readdirSync` **non récursif** des `*.ts` de niveau
supérieur ⇒ tout nouveau module de niveau supérieur CHANGE `sentinel_sha` (dérive DÉCLARÉE, non hashée) ; un
module en SOUS-DOSSIER serait MANQUÉ par `sentinel_sha` (trou de provenance ⇒ garder les nouveaux modules au
niveau supérieur).

## M-12 — surface de déploiement (unités systemd, noms de clés seuls)
`deploy/monark-sentinel.service` : `Type=oneshot` (`:15`) ; `User=sentinel`/`Group=sentinel` (`:38-39`) ;
`ProtectSystem=strict` (`:41`) ; `ReadWritePaths=/var/lib/monark-sentinel` (`:44`, SEUL chemin inscriptible) ;
`EnvironmentFile=-/etc/monark/sentinel.env` (`:26`, `-` = optionnel, `root:sentinel 0640`) ; `TimeoutStartSec=300`
(`:36`) ; `MemoryMax=512M` (`:49`). `deploy/monark-sentinel.timer` : 4 `OnCalendar` (`00:30/03:30/06:30/09:30 UTC`,
`:16-19`) + `RandomizedDelaySec=1800` (`:22`) + `Persistent=true` (`:23`). `sentinel.env` porte les NOMS de clés
seuls (jamais lu ici) ; aujourd'hui `CHAINSTACK_ETH_URL` (RUNBOOK-sentinel.md:82-90).

## M-13 — décisions investisseur (verbatim, `docs/CHANTIERS.md`)
- **92** (`:275`) : E-5 « oui pour le redéploiment » ACCORDÉ ; amendée par 118 (« un seul redéploiement » levé pour -1d).
- **109** (`:469`) : « Redéployer avec ce résiduel » — l'atténuation `run.ts` = lot séparé (devenu -1c).
- **117** (`:539-541`) : « OK, on fait comme ça » — release en 2 temps (temps 1 = Narabi + Ukemi).
- **118** (`:549-551`) : « **option B** » — chemin payant Chainstack de `rpc.ts` HORS garde temps 1 (résiduel ACCEPTÉ,
  « quelques appels par run, 4 créneaux/jour, très loin du cap 16 M RU ») ; migration = **NARABI-OPS-1d** APRÈS le
  temps 1, G0/ADR propre + **second redéploiement** (92 amendée pour ce seul motif) ; l'allowlist CI porte `rpc.ts`
  en 2ᵉ entrée à déclencheur -1d ; le rapprochement Chainstack interdit toute fenêtre chevauchant un créneau du job ;
  la cartographie de clôture DÉCLARE ce chemin « payant, hors garde, accepté (118) ».
- **119** (`:559-561`) : « vous avez mon GO dés maintenant, peu importe le cout » — GO DURABLE fermé (E-5 + course
  U-4b-1b sans nouveau go) ; NE lève PAS les plafonds (16 M RU reste un garde anti-bug fail-closed).
- **121** (`:602-603`) : « **A** » — cap Chainstack 16 M RU **PAR COMPTE**, tous réseaux ; **un seul ledger de
  cycle, une seule clé de cycle, floor lu sur le tableau de bord = somme des réseaux** ; opérateur `chainstack`
  unique par compte, `network` = attribut de journal, jamais un 2ᵉ plafond ; A-4 lit le total du compte ET la ligne
  `ethereum-mainnet` (le job Narabi compte dans le même plafond) ; ADR-GARDE-HELIUS A-1/A-4 à amender (« par compte »).

## M-14 — gel U-4b + ordre (prereg Q10)
`docs/PLAN-u4b-prereg.DRAFT.md` : `rpc.ts` figé à `0e232519…` (§2 rangée 7, `:108,110`) — « **VALEUR À FIGER
(nouvelle)** », aucune valeur ADR (ajout addendum GARDE-HELIUS-2 C-3). Fermeture transitive du gel (`:112-118`) :
`{u4b-scores, u4b-reduce, record-u4b-calib, wadray, abi, rpc, l1-split}` ; `rpc.ts` est une FEUILLE (n'importe que
`node:crypto`) ; `abi.ts` importe `rpc.ts` (`TRANSFER_TOPIC`, constante littérale). **Q10** (`:98`) : un commit
ultérieur touchant un fichier gelé ⇒ **ÉCART = STOP**. ⇒ -1d (qui MODIFIE `rpc.ts`) ne peut fusionner ENTRE le
commit du prereg U-4b-1b et la clôture de la course ; il fusionne APRÈS la clôture (le prereg re-recompute alors les
sha à l'identique — plus de gel actif).

## M-15 — les 3 items -1c (exigences d'entrée du G0, `docs/G7-lot-narabi-ops-1c.md:15-17`)
- **C-G2-1** : `budgetMsFromEnv` (`run.ts:41-48`) teste `/^\d+$/` ⇒ `"0180"` PASSE, `Number("0180")=180` ⇒ **zéros de
  tête TOLÉRÉS** aujourd'hui ; item = documenter la tolérance OU la refuser, avec test. (L'unité de production ne
  pose pas la clé, `run.ts:43` ⇒ refuser est à faible risque.)
- **C-G2-2** : `sentinel_max_day_ms_covers_a_faulting_day` ne tue pas le mutant « mesure sur succès seulement » (G4
  survivant). Le code est correct : `maxDayMs` est mesuré dans le `finally` (`run.ts:140-142`), donc un jour fautif
  EST couvert ; le mutant survit parce que le jour fautif du test n'est PAS le plus lent ⇒ **durcir le test** (jour
  fautif à ≥ 2× le STEP du plus lent jour sain).
- **C-G2-3** : commentaires `run.ts` (bloc budget `:25-29` + doc `runDue`) énoncent la réduction du Mode A sans le
  qualificatif « pool sain »/résiduel (l'ADR et le RUNBOOK, eux, sont exacts). **Commentaires seuls.**
⇒ **C-G2-1 et C-G2-3 TOUCHENT `run.ts`** — d'où la tension avec « `run.ts` sha inchangé » (voir D-runts §5, Q1).

## M-16 — signatures du garde consommées (2a/2b-i, `packages/rpc-guard/src/`)
`openGuardedClient(env, limits: RunLimits, ledgerDir, cycles: Record<label,string>, opts?: {timeoutMs?, onTransportError?})`
(`guarded.ts:19-25`, `index.ts:7`). `RunLimits = {maxCalls, runCaps: Record<label,number>, methodCaps:
Record<method,number>, cycleFloor: Record<label,number>}` (`client.ts:39-44`). `assertLimits` : un opérateur payant
DEMANDÉ exige `runCap>0`, `cycleCap`, `floor≤cap`, `methodCaps` non vide (`client.ts:64-76`). `client.call(op,
method,params)` = **1 tentative** (ligne write-ahead + transport), pas de retry (`client.ts:131-135`, C-4) ;
`client.operators()` (`client.ts:130`). `ensureCycleDir` exige un parent PRÉ-EXISTANT (`ledger.ts:64-65`, C-8).
Cap : `CHAINSTACK_CYCLE_CAP_RU=16_000_000` (`transport.ts:21`). Ledger par (cycle, opérateur) :
`<ledgerDir>/<cycle>/chainstack.jsonl` + `.head` + `.lock` (`ledger.ts:2-3`). Le transport (`transport.ts`) est le
SEUL lecteur de `env.CHAINSTACK_ETH_URL` et le SEUL site `fetch` (allowlist CI unique).

## M-17 — ancres de comptage (R-25)
`wc -l` : `apps/sentinel/src/rpc.ts` = **239** ; `apps/sentinel/src/run.ts` = **255** ;
`test/rpc-guard-fetch-only-inside-client.test.ts` = **82** ; `packages/rpc-guard/src/guarded.ts` = 57 ;
`packages/rpc-guard/src/client.ts` = 139. Fichiers de test sentinel existants (`apps/sentinel/test/`) :
`sentinel.test.ts, sentinel-retry.test.ts, sentinel-catchup-budget.test.ts, pool-rpc-1a.test.ts` (+ ukemi-*).
Pathspec R-25 (`ci.yml:65`) : `git diff --shortstat origin/BASE...HEAD -- .` avec exclusions `docs/**/*.md`,
`package-lock.json`, `fixtures/**`. ⇒ **les docs (ADR, RUNBOOK, ce G0) sont EXCLUS** du R-25 ; seuls comptent le
code (`rpc.ts`, `run.ts`, nouveaux modules, tests) + `deploy/*` + `.github`.

## M-18 — surface d'ÉCHEC d'ouverture du garde (fonde D-degrade)
`openGuardedClient` JETTE à l'ouverture, AVANT tout RPC, dans : verrou tenu ⇒ `LockHeldError` (`guarded.ts:43`) ;
`cycles` vide (`guarded.ts:28`) ; **opérateur demandé non résolu de l'env ⇒ `« requested operator 'chainstack' is not
resolved from env »`** (`guarded.ts:33`) — le cas « `CHAINSTACK_ETH_URL` absent » ; `assertLimits` (caps/floor
manquants, `guarded.ts:37`) ; `ensureCycleDir` parent absent (`ledger.ts:65`, C-8) ; ledger présent + head absent /
head ≠ recomputé (`ledger.ts:91-96`, C-V-8). Chicanerie : `main()` ne peut décider s'il DEMANDE `chainstack` qu'en
lisant `env.CHAINSTACK_ETH_URL` (hit grep KEY) OU via `operatorLabels(env)` — qui **n'est PAS exporté** (`index.ts`
n'exporte que `openGuardedClient`, `transport.ts:186` le garde interne). ⇒ D-degrade enveloppe l'ouverture d'un
try/catch et publie sur keyless (ADR-NARABI-OPS-1 D3 : « absent, la base keyless publie » — Risk « dégradation keyless
silencieuse ACCEPTÉE »). `commit` incrémente `attempts` quelle que soit l'unité (`client.ts:124`) ⇒ sous D-route (β),
`maxCalls` compte aussi les essais keyless. La sonde ENREGISTRE `chainstack_present` mais ne l'ALERTE pas (ce n'est pas
un `reason` de l'ensemble fermé, `probe-narabi.mjs:360`) ⇒ un défaut de garde est visible dans `narabi.json`, silencieux
par mail (résiduel D-degrade, Q9).
