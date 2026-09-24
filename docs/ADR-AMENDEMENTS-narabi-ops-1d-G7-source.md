Modèle résolu : claude-opus-5-5[1m]

# NARABI-OPS-1d — amendements ADR/RUNBOOK prêts à insérer au G7 (docs seuls) — rendu worker

> **Provenance (CA-8).** Worker `claude-opus-5-5[1m]` (identifiant déclaré par l'environnement ; préfixe `claude-opus-5-5` = roster de la décision 133 et CONSIGNE A-1 à `de30eab` ; le prompt système de cette instance épinglait encore `claude-opus-4-8` — écart signalé à l'orchestrateur, non tranché ici), effort max, 2026-09-22 (horloge `date -u` : fin de rédaction ≈ 20:1x UTC). Lecture seule de `F:\Monark` : `lot/etude-suite` (HEAD `60b54c0`, puis `de30eab`, puis `153582f` pendant la rédaction — commits Bell/CHANTIERS/PLI/cartographie/TABLEAU-DE-BORD ; aucune des 4 cibles ni le prereg modifiés : `git diff --stat de30eab 153582f -- <4 cibles> docs/PLAN-u4b-prereg.md` vide ; aucun changement hors `docs/`) et `lot/narabi-ops-1d` @ `7daf8e5` par `git show`. **R-20** : aucun commit, aucun workflow, aucune écriture dans `F:\Monark`/`F:\Monark-wt-*` (`git hash-object` SANS `-w` uniquement ; `git status --porcelain` = 0 avant/après). **R-21** : chaque affirmation porte sa commande (§H). Une lecture web : WebFetch de la page publique `https://docs.chainstack.com/docs/request-units` (§G F-4). Outil advisor intégré : deux appels (avant rédaction, puis avant rendu), **deux timeouts** (indisponibilité consignée, non contournée ; demande formée §I). Aucune valeur d'environnement payante lue ni affichée.
>
> **Reprise après la coupure de courant (~20:3x UTC).** Fichier trouvé COMPLET sur disque (500 l., 78 864 octets, sha256 `89b655ca…`, dernière écriture 20:29:58 UTC, sections 0 à J présentes). Re-vérifié à 20:43 UTC : `lot/narabi-ops-1d` = `7daf8e5` ; `lot/etude-suite` = `3f6662f` (docs seuls depuis `f6442fe`) ; les 4 cibles et le prereg inchangés depuis `153582f` ; ancrages identiques (l. 181, 1025, 712, 327). Seul ajout : ce paragraphe.

## 0. Mode d'emploi, état lu, écarts déclarés

| Bloc | Livrable | Fichier cible (état @ `de30eab`) | Ancrage (`grep -n` reproduit) | Mode |
|---|---|---|---|---|
| A | (1) + (5) | `docs/adr/ADR-NARABI-OPS-1.md` — 181 l., sha256 `0b6e130e…` | `grep -n "assigned at G7" docs/adr/ADR-NARABI-OPS-1.md` → `181:assigned at G7.` (dernière ligne) | ajout APRÈS la l. 181 (fin de fichier) |
| B | (2) | `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` — 1025 l., `6fb6da45…` | `grep -n "Budget de cycle : sous RETRY_TRIES=6" <fichier>` → `1025:- Budget de cycle : …` (dernière ligne) | ajout après la l. 1025 |
| C | (3) | `docs/adr/ADR-U4b-calibration-episode-frais.md` — 712 l., `6863104a…` | `grep -n "l'orchestrateur folde/committe au G7" <fichier>` → `712:…` (dernière ligne) | ajout après la l. 712 |
| D-1 | (4) | `docs/RUNBOOK-sentinel.md` — 405 l., `8a0acac5…` | `grep -n "^## Déploiement de la sonde (Bell)" docs/RUNBOOK-sentinel.md` → `327:` | insertion AVANT la l. 327 (après « First-run acceptance », l. 319-325, et la ligne vide 326) |
| D-2 | (4) | `docs/RUNBOOK-sentinel.md` | l. 5, 17, 92, 199, 261 ; notes après l. 93 et l. 158 | remplacements EN PLACE (anglais de la phrase hôte conservé) |
| E | (5) | — | — | le paragraphe « preuve d'exécution SIGTERM » est le §A.5 du bloc A ; les traces sont DÉJÀ persistées (`docs/traces/narabi-ops-1d/`, `1d4f385`) |
| F | (6) | mission du pli §11-1 (+ item CHANTIERS) | — | liste fermée des co-édits, non destinée au dépôt telle quelle |

- **Entrées postérieures à la mission (19:16 UTC) consommées** : re-checkpoint-2 `1be4a34` (`docs/CHECKPOINT2-lot-narabi-ops-1d-re.md`), traces persistées `1d4f385` (`docs/traces/narabi-ops-1d/`), G2-delta `60b54c0` (`docs/G2-lot-narabi-ops-1d-delta.md` ; `docs/CHANTIERS.md:826-834` : **item §11-1 AMENDÉ par C-G2D-1** « déplacer le liage verbatim, ne pas le supprimer », C-G2D-2 formé), décision 136 (`de30eab` : CI GitHub sous accord préalable, traces Linux en docker local). Conséquences : livrable (5) — le chemin n'est plus à proposer, il existe ; livrable (6) — intègre C-G2D-1/C-G2D-2.
- **Langue** : français (consigne). ADR-NARABI-OPS-1 et le RUNBOOK sont rédigés en anglais : A et D-1 y ajoutent une section française calquée sur la FORME de leurs amendements (titre daté, puces, table de tuyaux) ; D-2 garde l'anglais de la phrase hôte (retouche minimale). `docs/` n'est pas exporté (`scripts/export-public.mjs:106-114`, liste noire structurelle ; aucune entrée `docs/` en liste blanche) : aucun gate de langue ne s'applique.
- **Numéros de ligne cités DANS les blocs** : code = blobs `7daf8e5` (l'arbre fusionné sera identique hors `docs/` : `git diff --name-only f6442fe de30eab -- . ':(exclude,glob)docs/**'` = vide) ; docs = `de30eab`. **Aucun chemin `F:\tmp` dans les blocs A-D.**
- **Encodage** : UTF-8, LF ; les 4 cibles sont LF (0 CR), dernier octet `\n` (mesuré). Chaque bloc s'insère précédé d'UNE ligne vide.
- **Constats hors mandat mais qui changent des formulations du G1 §11-§13** : §G (F-1..F-10). Aucun n'est tranché ici ; les blocs les intègrent sous forme d'hypothèse déclarée ou d'item formé, jamais de décision.

---

## A. `docs/adr/ADR-NARABI-OPS-1.md` — amendement daté (livrables 1 et 5)

Texte à insérer après la l. 181 (entre les clôtures `~~~~`, clôtures exclues) :

~~~~markdown
## Amendement daté 2026-09-22 (sous-lot NARABI-OPS-1d) — jambe payante Chainstack sous `@monark/rpc-guard` (route α), ledger de cycle local au VPS, correction du compte d'endpoints

> **Provenance.** Code : `lot/narabi-ops-1d` @ `e12f59f` (G1, worker `claude-opus-4-8[1m]`, rebasé sur `lot/etude-suite` @ `f6442fe`) + pli test-only `7daf8e5` (worker `claude-opus-4-8[1m]`). Revues : G2 `docs/G2-lot-narabi-ops-1d.md` (PASS-AVEC-CORRECTIONS) ; checkpoint-2 `docs/CHECKPOINT2-lot-narabi-ops-1d.md` (ACCEPTE-AVEC-CORRECTIONS) ; G2-delta `docs/G2-lot-narabi-ops-1d-delta.md` (PASS, relecteur `claude-opus-5-5[1m]`) ; re-checkpoint-2 `docs/CHECKPOINT2-lot-narabi-ops-1d-re.md` (ACCEPTE-AVEC-CORRECTIONS, forme) ; validateur-humain `claude-fable-5-1`. Texte : worker `claude-opus-5-5[1m]` (effort max), 2026-09-22 ; **inséré par l'orchestrateur `claude-fable-5-1` SEUL au G7** (R-20) ; réviseur = orchestrateur (R-21). Ordonnancement **(b)** (ruling C-V-0, `docs/CHANTIERS.md:783`) : fusion locale maintenant, `apps/sentinel/src/rpc.ts` GELÉ byte-identique (`0e232519…`, ADR-U4b D4) ; 2ᵉ redéploiement du VPS site SEULEMENT après le pli §11-1 (A.7). Les corps D1–D4, la table Tuyaux et les amendements antérieurs restent byte-identiques ; cet amendement les SUPERSÈDE sur les seuls points ci-dessous. Lignes de code citées : blobs `7daf8e5` (identiques à l'arbre fusionné hors `docs/`).

### A.1 Décision — route α (checkpoint-1 C-9 ; ruling 2026-09-22 04:3x UTC, `docs/CHANTIERS.md:670-674`)
- **La seule jambe payante (Chainstack) passe par `@monark/rpc-guard`.** `openChainstackLeg` (`apps/sentinel/src/run.ts:279-308`) ouvre `openGuardedClient(process.env, limits, <état>/ledger, { chainstack: CHAINSTACK_CYCLE_ID }, { timeoutMs: 20 000, network: "ethereum-mainnet" })` (`run.ts:295`). Le pool reçoit le LABEL `chainstack` (`run.ts:220`, `:324`) ; le répartiteur injecté `makeDispatchCall` (`run.ts:263-271`) envoie le label à `client.call` (une tentative, ligne de ledger écrite AVANT le transport ; le retry reste au pool, C-4) et chaque URL publique à `keylessCall`.
- **Les 7 endpoints publics restent keyless.** `apps/sentinel/src/keyless-transport.ts` (neuf) : `fetch` brut, calque comportemental de `rpc.ts:defaultCall`, timeout `KEYLESS_TIMEOUT_MS` = 20 s (`keyless-transport.ts:17`) ; 2ᵉ site `fetch` allowlisté du sentinel (rétractation : « route β », le pool keyless passe sous le garde).
- **Le sentinel ne lit plus la clé.** `run.ts` transmet `process.env` au garde et lit exactement six clés NON secrètes — `MONARK_SENTINEL_{BUDGET_S,DIR,J0}` et `CHAINSTACK_{CYCLE_ID,ETH_ORIGIN,CYCLE_FLOOR}` (test `sentinel_no_clock_env_is_read`) ; `CHAINSTACK_ETH_URL` n'est résolue que par le transport du garde (`packages/rpc-guard/src/transport.ts:106`). Le grep CI couvre `apps/sentinel/src/**` (test `sentinel_src_clean_and_allowlist_load_bearing` : `SENTINEL_ALLOW` à 2 entrées avec déclencheur, non-vacuité par entrée).
- **Ledger de cycle LOCAL au VPS (décision 121, option 1).** `/var/lib/monark-sentinel/ledger/<cycle>/chainstack.{jsonl,head,lock}` : sous le `ReadWritePaths` existant, hors `public/` (seul répertoire servi par Caddy), même `cycle_id` que la course Ukemi, lignes `attempted` estampillées `network:"ethereum-mainnet"`. Clause « par compte » : `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md`, amendement daté 2026-09-22 (NARABI-OPS-1d).

### A.2 Invariants
- **D-degrade (bloquant).** `chainstack_guard` ∈ {`ok`, `unconfigured`, `lock_held`, `ledger_error`, `config_error`} (`run.ts:236` ; classifieur fermé `run.ts:241-248`, jamais un message). `openChainstackLeg` ne lève jamais : tout échec d'ouverture ⇒ pool keyless à 7 endpoints, publication maintenue, code de sortie selon D1. `unconfigured` si `CHAINSTACK_CYCLE_ID` OU `CHAINSTACK_ETH_ORIGIN` est absent ou vide (`run.ts:285`) ; `config_error` si `CHAINSTACK_CYCLE_FLOOR` n'est pas un entier ≥ 0 (`run.ts:256` ; test `sentinel_chainstack_floor_malformed_is_config_error`) ; `ledger_error` si le parent du ledger manque (C-8 : jamais auto-créé). Le JSON de fin porte `chainstack` (= jambe ouverte) et `chainstack_guard` (`run.ts:350`).
- **D-caps (mesurés, jamais devinés).** 2 000 essais, 20 000 RU par run, 2 000 par méthode sur {`eth_getBlockByNumber`, `eth_getLogs`, `eth_call`} (`run.ts:230-232`) — au-dessus du mesuré G1 (un jour à pool dégradé, jambe forcée dans chaque quorum : 19 + 1 + 2 = 22 essais, 44 RU ; `run.ts:223-225`) et de la borne de stress G0 M-7 (~322 essais, ~644 RU ; test `sentinel_chainstack_caps_cover_the_g0_m7_stress_bound`), très en dessous du plafond compte (16 M RU). Plafond atteint ⇒ refus ⇒ la jambe est benchée ⇒ le jour se termine sur le quorum keyless (test `chainstack_refusal_degrades_to_keyless_quorum_not_stopped_day`).
- **D-lock.** (i) Relâche en `finally` (`run.ts:367-370`) et par le handler SIGTERM installé si la jambe est ouverte (`run.ts:320-321` ; arrêt `TimeoutStartSec`) — chemin public unique `runCli unlock` (`run.ts:305` : ligne `unlocked` chaînée, raison `sentinel-daily-end`, suppression du `.lock`). (iii) Après un SIGKILL : réparation `docs/RUNBOOK-sentinel.md` §6-bis. (ii) Reprise automatique au démarrage : non retenue (ruling Q3) — item A.8-4.
- **C-6.** L'origine Chainstack (`CHAINSTACK_ETH_ORIGIN` : schéma + hôte, non secrète) est publiée en 8ᵉ endpoint SSI la jambe s'est ouverte (`run.ts:327`) ; un run dégradé publie les 7 endpoints publics, sans origine.
- **M-10.** Même échéance de 20 s pour la jambe gardée et les endpoints keyless.
- **M-11.** `line_hash`, `prev_line_hash`, `book_digest` inchangés (`endpoints` et `sentinel_sha` hors `hashedFields`) ; `timeline.jsonl` n'est PAS byte-identique (dérive `endpoints`/`sentinel_sha` déclarée, DEV-3 du G1) — la comparaison porte sur `line_hash`.

### A.3 Correction du compte d'endpoints (dérive « ninth endpoint / 8 free providers »)
D3 (l. 37-46), D4 (l. 48-54) et l'amendement ADR-M012 D5 (l. 56-61) décrivent le pool de `ef1cd42`/`7480f49` (2026-09-20) : 8 URLs publiques, Chainstack en 9ᵉ endpoint — exact à la rédaction. **POOL-RPC-1a `5b9bc37` (2026-09-21, décision 106 : Blast API et LlamaRPC retirés, Pocket ajouté)** a ramené `PUBLIC_ENDPOINTS` à **7 URLs** (`apps/sentinel/src/rpc.ts:19-24`), soit **6 fournisseurs distincts** au sens de `providerOf` (`publicnode.com` porte deux alias) ; ce ripple n'a pas été reporté ici. Lecture de référence :

| Texte (ligne) | Lire |
|---|---|
| D3, l. 38-39 : « a **ninth endpoint** … not among the **8 free providers** » | **8ᵉ entrée** du pool : les 7 URLs publiques (6 fournisseurs) + la jambe Chainstack (label `chainstack`, `run.ts:324`), fournisseur distinct de tous les publics |
| D3, l. 46 : « the base **8-endpoint** pool » | le pool de base à **7** endpoints |
| D4, l. 49-50 : « the **8 public URLs** are published verbatim » | les **7** URLs publiques, publiées verbatim (`run.ts:327`) |
| Amendement ADR-M012 D5, l. 61 : « the key only ADDS a **ninth** operator » | ajoute une **8ᵉ** entrée (7ᵉ fournisseur distinct) |
| Amendement -1c, l. 123 : « `one()` may rotate **9 endpoints x 20 s = 180 s** per call » | **8 × 20 s = 160 s** par appel (7 × 20 s = 140 s si la jambe n'est pas ouverte) ; faux dès la rédaction (`5d177db` est postérieur à `5b9bc37`) |

- Le Contexte (l. 12 : « too few of the **8** free endpoints answered ») décrit l'incident du 2026-09-20, alors exact : NON corrigé.
- **Supersédé par A.1/A.2** : D3 « The URL is read ONLY in `main()` (via `poolEndpoints(env)`) » et D4 « redacted to its origin (`publishedEndpoints`) … (`defaultCall`) ». Depuis -1d, le sentinel ne lit aucune URL ; le 8ᵉ endpoint publié est `CHAINSTACK_ETH_ORIGIN` (valeur non secrète posée au déploiement, `docs/RUNBOOK-sentinel.md` §6-bis), jamais dérivé de l'URL à l'exécution ; `redactEndpoint` n'expurge plus que les erreurs KEYLESS (`keyless-transport.ts:28`) ; les erreurs de la jambe payante suivent le vocabulaire fermé du transport (ADR-GARDE-HELIUS, amendement 2b-i D6). `poolEndpoints`, `publishedEndpoints`, `hasChainstack` et `defaultCall` sont du code MORT dans `rpc.ts` (gelé) jusqu'au pli §11-1 (A.8-1). Pour la jambe payante, les contre-mesures « Risks » l. 151-156 qui les citent sont portées par l'e2e `sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock` (absence du marqueur de clé sur stdout et dans la ligne écrite).
- Même correction au `docs/RUNBOOK-sentinel.md` (l. 5, 17, 92, 199, 261 ; §6-bis) et, au pli §11-1, dans `deploy/monark-sentinel.service` (l. 20-25 et 34-35).
- `error_origin` (proposé, assigné au G7) : ripple POOL-RPC-1a non propagé à cet ADR ni au RUNBOOK = orchestrateur ; « 9 endpoints » de l'amendement -1c = rédacteur -1c.

### A.4 Tuyaux (règle Branchement : entrée / sortie / état / test)
| Pièce | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test d'intégration non-LLM |
|---|---|---|---|---|
| jambe Chainstack gardée (`run.ts` `openChainstackLeg`/`makeDispatchCall` ; `keyless-transport.ts`) | EnvironmentFile `/etc/monark/sentinel.env` : `CHAINSTACK_ETH_URL` lue par le seul transport du garde (`transport.ts:106`) ; `CHAINSTACK_{CYCLE_ID,ETH_ORIGIN,CYCLE_FLOOR}`, non secrètes (`run.ts:254`, `:280-281`) → `openGuardedClient` (`run.ts:295`) | `makeRpcPool` (`run.ts:329`) → ligne de `timeline.jsonl` + `state.json` → `/narabi/` (site) et sonde Bell (`chainstack_present`) ; lignes `<cycle>/chainstack.jsonl` ; `line_hash` inchangé (M-11) | ledger VPS `/var/lib/monark-sentinel/ledger/<cycle>/` ; **`upcoming`** jusqu'au 2ᵉ redéploiement ; **`built`** à la 1ʳᵉ entrée JOURNAL d'un run PUBLIANT post-déploiement (`chainstack:true`, `chainstack_guard:"ok"`, 8ᵉ endpoint == origine posée, ≥ 1 ligne `attempted` `network:"ethereum-mainnet"`, aucun `.lock` après `Deactivated`, tir de sonde suivant `healthy` et `chainstack_present:true`) | `sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock` (`run.ts` réel en sous-processus, seul `globalThis.fetch` bouchonné, garde et ledger réels) ; `sentinel_chainstack_leg_writes_ledger_line_before_fetch` (write-ahead) |
| D-lock (fin de run, SIGTERM, SIGKILL) | `leg.release()` en `finally` et handler SIGTERM (`run.ts:320-321`, `:367-370`) | `runCli unlock` (`run.ts:305`) → ligne `unlocked` chaînée + suppression du `.lock` ⇒ le créneau suivant ré-acquiert | `<cycle>/chainstack.lock` (contenu `{pid, iso}`, `packages/rpc-guard/src/lock.ts:25`) | `sentinel_run_re_acquires_lock_after_clean_exit` (toutes plateformes) ; `sentinel_run_releases_chainstack_lock_on_sigterm` (Linux, A.5) ; SIGKILL : acte manuel RUNBOOK §6-bis |
| ledger VPS → rapprochement A-4 (résiduel Narabi) | `client.call` write-ahead (une ligne `attempted` par essai, AVANT le fetch) | l'orchestrateur compte (SSH, lecture seule) les lignes `attempted` entre deux positions épinglées ⇒ résiduel A-4 (iv), sous l'hypothèse H-FACT (ADR-GARDE-HELIUS, amendement -1d) | jsonl chaîné + `.head`, VPS | aucun : acte manuel déclaré (item A.8-5) |
| 2ᵉ redéploiement (décision 118) | SHA de fusion NOMMÉ du pli §11-1 | `monark-sentinel.service` du VPS site | après A.7 (1)-(4) | `docs/RUNBOOK-sentinel.md` §6-bis (hachés, dry-run gardé, critères d'acceptation) |
| *(supersédé)* « env → `rpc.ts` pool » (table Tuyaux, l. 80) | — | — | chemin SERVI en production jusqu'au 2ᵉ redéploiement (VPS à `c4981d0`, `run.ts` `54619a40…`, `docs/JOURNAL-PROVENANCE.md:353-357`) ; retiré à la 1ʳᵉ entrée JOURNAL post-déploiement | — |

### A.5 Preuve d'exécution SIGTERM (C-V-1 du checkpoint-2 ; C-RV-1 du re-checkpoint-2)
Le test `sentinel_run_releases_chainstack_lock_on_sigterm` est un SKIP déclaré sur win32 (`process.kill` y est un arrêt dur, sans handler) : sa preuve d'exécution est Linux. `run.ts` (`45557d6e…`) et le bloc du test (`5a1f335e…`, extraction du `test(` au `});`) sont byte-identiques entre `e12f59f` (lot) et `7daf8e5` (pli). Traces persistées sous `docs/traces/narabi-ops-1d/` (commit `1d4f385`, index `README.md`) :
- **`e12f59f`, docker `node:24`, orchestrateur** — `docker-e12f59f-guard-trace.log` (`6e5904e8…` ; fichier de test 10/10, 0 skip, `ok 10 - sentinel_run_releases_chainstack_lock_on_sigterm` ; extrait commençant à `ok 2`) et `docker-e12f59f-mutant-V6.log` (`d212e62d…` ; V6 = `process.on("SIGTERM", …)` retiré, `run.ts:321` ⇒ `not ok 10`, 9/1).
- **`e12f59f`, GitHub Actions run `35763895313`** (PR #88, `ubuntu-latest`) — `ci-run-35763895313-e12f59f.extract.log` (`0ec00434…` ; `✔ sentinel_run_releases_chainstack_lock_on_sigterm`, 931/930/0/1).
- **`7daf8e5` (arbre exact), GitHub Actions run `35769452047`, job `106887215941`** — checkout `0f2c2d9` « Merge 7daf8e5 into f6442fe », arbre `4c946086…` == `7daf8e5^{tree}` (lu par le re-checkpoint-2 §3 (b)) — `ci-7daf8e5-g3.extract.log` (`9395c913…` ; `✔` à 18:47:33Z ; tally 933/932/0/1 lu par le re-checkpoint-2 §3 (b) et le G2-delta §7 T4, hors de l'extrait).
- **`7daf8e5`, docker `node:24`, validateur-humain** — `docker-linux2-7daf8e5.extract.log` (`c4faa7e5…` ; clone frais, `TMPDIR` hors arbre : suite complète 933/932/0/1, seul skip = artefacts e2 ; V6 ROUGE 11/1, message `the child exited after SIGTERM (the handler ran then process.exit)`, restauration `45557d6e`) et `docker-v6-linux-7daf8e5.extract.log` (`6abc0852…`). `docker-linux-7daf8e5.extract.log` (`7129f7ab…`) porte le fichier de test 12/12 (`ok 12`) mais AUSSI une suite complète 933/857/75/1 : premier rejeu avec `TMPDIR` DANS l'arbre, bruit d'environnement mesuré (re-checkpoint-2 §1, déviation (iii)), pas un défaut du lot.
- **Indépendamment** (G2-delta §7 T5) : docker `--network none --pull never --read-only` sur `git archive 7daf8e5`, 12/12, V6 rouge (`not ok 12`, 11/1).

**C-V-1 : CLOSE** (re-checkpoint-2 §3) par l'identité byte de `run.ts` et du test entre `e12f59f` et `7daf8e5` ET les rejeux Linux sur l'arbre exact ; les deux traces `e12f59f` seules ne l'auraient pas close (extraits antérieurs au pli, sans en-tête — CONSIGNE A-12). Le mécanisme de relâche (unlock, suppression du verrou, ré-acquisition) est prouvé sur toutes plateformes par `sentinel_run_re_acquires_lock_after_clean_exit` ; seule la livraison du signal est propre à Linux. Paragraphe réutilisable tel quel dans l'entrée G7 de `docs/JOURNAL-PROVENANCE.md` (C-RV-1).

### A.6 MAST — résiduel (libellés employés par le G1 §14, le checkpoint-2 CA-5 et le G2-delta)
- **FM-2.4 (test fabriquant son entrée)** — contré par A-8 : corps de forme réelle (`sentinel_chainstack_leg_consumes_real_form_bodies` ; seul `globalThis.fetch` bouchonné dans les e2e).
- **FM-3.3 (mesure sous clé ambiante)** — contré par A-7 : `env -u` des 8 clés payantes sur tout oracle et tout harnais ; conteneurs `paidkeys=0`.
- **FM-3.2/3.3 (vérification incomplète)** — **résiduel ACTIF jusqu'au pli §11-1** : liage verbatim de la liste `endpoints` servie perdu depuis `e12f59f` (C-G2D-1 : mutants type-valides G2D-6a/6b/7 survivants) ; moitiés « chaîne vide » du garde `unconfigured` non testées (C-G2D-2 : G2D-4/5 survivants). Aucun effet servi tant que le VPS exécute l'ancien code ; fermeture exigée AVANT le 2ᵉ redéploiement (A.8-1).
- **Fuite de clé** — la clé n'est lue que par le transport du garde ; `apps/sentinel/src/**` hors allowlist = 0 accès et 0 nom nu (grep `bareKeys`) ; l'e2e asserte l'absence du marqueur de clé sur stdout et dans la ligne écrite.
- **Panne de publication par le garde** — D-degrade (A.2).
- **Mensonge de provenance** (8ᵉ endpoint ≠ origine réelle de l'URL) — item A.8-7 : dérivation locale `new URL(URL).origin` et contrôle au 2ᵉ redéploiement (RUNBOOK §6-bis).
- **Verrou orphelin** (SIGKILL) — `lock_held` ⇒ keyless, jamais FATAL ; réparation RUNBOOK §6-bis ; item A.8-4.
- **Floor du VPS périmé** (option 1) — résiduel déclaré par l'amendement -1d de l'ADR-GARDE-HELIUS.
- Aucun gate suspendu (R-22).

### A.7 Ordonnancement (b) (C-V-0 ; décision 118)
- Fusion locale au G7 avec `rpc.ts` byte-identique (9 sha gelés AVANT == APRÈS : amendement -1d de l'ADR-U4b).
- 2ᵉ redéploiement du VPS site (le seul autorisé par la décision 118 ; go permanent de la décision 137, `docs/CHANTIERS.md:858` : « 2e redeploiement VPS sentinelle (apres pli §11-1) ») SEULEMENT après : (1) la clôture de la course U-4b-1b au sens du gel (A.8-1) ; (2) le pli §11-1 ; (3) son G2-delta et son re-checkpoint-2 ; (4) son G7 ; puis `docs/RUNBOOK-sentinel.md` §6-bis. Redéployer le SHA -1d avant le pli §11-1 est EXCLU (3ᵉ redéploiement hors décision 118, ou VPS ≠ archive : C-V-0 (c), escalade pré-formée non déclenchée).
- D'ici là, le VPS exécute `c4981d0` (`run.ts` `54619a40…`, `docs/JOURNAL-PROVENANCE.md:353-357`) : le chemin payant hors garde (résiduel 118) reste en production et la cartographie le déclare.

### A.8 Items formés (zéro dette nue : propriétaire + déclencheur)
1. **Pli §11-1 (amendé par C-G2D-1, `docs/CHANTIERS.md:829`)** — supprimer le code mort de `rpc.ts` et retirer l'entrée `apps/sentinel/src/rpc.ts` de `SENTINEL_ALLOW` ; co-éditer la liste fermée des textes qui présupposaient la suppression « au rebase » (C-V-4) ; **déplacer — ne pas supprimer — le liage verbatim de `endpoints` sur le chemin servi** (C-G2D-1) ; tests « chaîne vide » (C-G2D-2) ; injecter `keylessCall` dans le test d'erreur `apps/sentinel/test/sentinel-retry.test.ts:229`, qui repose aujourd'hui sur le défaut `defaultCall` ; trace Linux SIGTERM + V6 du pli par docker local (décision 136 ; en-tête CONSIGNE A-12). **Propriétaire** : orchestrateur → worker. **Déclencheur** : clôture de la course U-4b-1b AU SENS DU GEL — après le hors-ligne du prereg §(5e) (`docs/PLAN-u4b-prereg.md:310` : `u4b-reduce` → `u4b-scores` → `record-u4b-calib`, « sous la vérification des 9 sha »), dont deux scripts importent `rpc.ts` via `abi.ts:7` ; la clôture « sur les données » de la décision 129 ne suffit pas. Auto-armé : une fois le code mort supprimé, la non-vacuité par entrée rougit l'entrée `rpc.ts` restante. Garde : si le prereg d'une calibration suivante re-gèle `rpc.ts` avant ce pli ⇒ STOP (re-gel ou report).
2. **ADR-U4b D4** — AVANT == APRÈS pour -1d : amendement -1d de l'ADR-U4b (ce G7). Le sha APRÈS' de `rpc.ts` est recomputé au commit du pli §11-1 (amendement D4 daté alors).
3. **Amendements ADR-NARABI-OPS-1, ADR-GARDE-HELIUS, ADR-U4b et RUNBOOK** — ce G7 : CLOS à l'insertion.
4. **D-lock (ii), reprise d'un verrou orphelin au démarrage** — non retenue (ruling Q3 = (i)+(iii)). **Déclencheur** (proposé, calque de l'item Bell du ruling 2026-09-22 05:4x UTC) : première observation en production d'un `chainstack_guard: "lock_held"` sur le VPS. **Propriétaire** : orchestrateur.
5. **Surface servie consommant le ledger VPS** (au-delà de l'acte manuel A-4) — hors lot. **Déclencheur** (proposé) : premier rapprochement A-4 consommant le ledger VPS (coût de l'acte manuel alors mesuré ; décision d'automatiser). **Propriétaire** : orchestrateur.
6. **Relâche de la contrainte « aucune fenêtre chevauchant un créneau Narabi » (118)** — subordonnée à l'hypothèse H-FACT (ADR-GARDE-HELIUS, amendement -1d) ; le prereg U-4b-1b, gelé, la conserve. **Déclencheur** : prochain prereg Chainstack. **Propriétaire** : orchestrateur.
7. **Dérive d'origine** (`CHAINSTACK_ETH_ORIGIN` ≠ origine réelle de `CHAINSTACK_ETH_URL`) — fermée au 2ᵉ redéploiement (dérivation locale et contrôle, RUNBOOK §6-bis étapes (2), (4) et acceptation (b)) ; à refaire à chaque rotation. **Déclencheur** : rotation de clé ou d'URL. **Propriétaire** : orchestrateur.
8. **`chainstack_present:false` non alerté par la sonde** (Q9) — co-modification de la sonde Bell, hors lot. **Déclencheur** (proposé) : premier tir de sonde `chainstack_present:false` observé après le 2ᵉ redéploiement. **Propriétaire** : orchestrateur.
9. **Libellé du paquet** — `ensureCycleDir` nomme `HELIUS_LEDGER_DIR` (`packages/rpc-guard/src/ledger.ts:75`), impropre pour Narabi. **Déclencheur** : prochain lot touchant `ledger.ts`. Précaution : `classifyGuardOpenError` route sur le fragment « does not pre-exist » (`run.ts:246`) — le conserver, sinon `ledger_error` basculerait en `config_error` (les tests `sentinel_guard_open_error_classifier_is_a_closed_set` et `sentinel_guard_open_failure_degrades_to_keyless_and_publishes` rougiraient). **Propriétaire** : orchestrateur.
10. **2ᵉ redéploiement** — **Déclencheur** : G7 du pli §11-1 (A.7). **Procédure** : `docs/RUNBOOK-sentinel.md` §6-bis. **Propriétaire** : orchestrateur.
~~~~

---

## B. `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` — amendement daté (livrable 2)

Texte à insérer après la l. 1025 (niveau de titre calqué sur le dernier amendement du fichier, `# Amendement PROPOSÉ à ADR-GARDE-HELIUS — BELL-RETRY-1`, l. 975) :

~~~~markdown
# Amendement daté 2026-09-22 à ADR-GARDE-HELIUS — NARABI-OPS-1d : clause « par compte » (décision 121) au cas INTER-MACHINES (option 1) ; A-1 / A-4 ; déclencheurs A-6 / R-B

- **Provenance** : texte worker `claude-opus-5-5[1m]` (effort max), 2026-09-22, depuis `lot/etude-suite` @ `de30eab` et `lot/narabi-ops-1d` @ `7daf8e5` (lecture seule) ; **inséré par l'orchestrateur `claude-fable-5-1` SEUL au G7 de NARABI-OPS-1d** (R-20) ; réviseur = orchestrateur (R-21). Autorités : décision investisseur 121 (`docs/CHANTIERS.md:602-603`) ; ruling orchestrateur 2026-09-22 04:3x UTC, option 1 (`docs/CHANTIERS.md:672`). NARABI-OPS-1d ne modifie aucun fichier de `packages/rpc-guard/**` (`git diff --name-only f6442fe 7daf8e5` : 8 fichiers, aucun sous `packages/`).
- **Objet** : la clause 121 est écrite pour la dimension RÉSEAU (amendement 2b-ii, clause 121 (a)-(e)) et implémentée (1b0-B) sur un ledger par compte ET par machine. NARABI-OPS-1d ouvre une 2ᵉ machine (le VPS site) sur le même compte : cet amendement fixe la dimension INTER-MACHINES et amende A-1 / A-4 en conséquence. Avec lui, l'item de la décision 121 « ADR-GARDE-HELIUS A-1/A-4 à amender (clause « par compte ») » (`docs/CHANTIERS.md:603`) est clos — à acter par l'orchestrateur au G7.

## -1d-A — A-1 par compte : unité, tarif, plafond
- Le tarif (`chainstackRu`, `CHAINSTACK_TARIFF_VERSION = "chainstack-2026-09-21"`) et le plafond de cycle 16 M RU (décisions 115 et 121) sont ceux du COMPTE : identiques sur toute machine et tout réseau. La jambe Narabi du VPS ne mètre que `eth_getBlockByNumber`, `eth_getLogs` et `eth_call` (`CHAINSTACK_METHOD_CAPS`, `apps/sentinel/src/run.ts:232` ; `docs/G0-lot-narabi-ops-1d.MESURES.md:52`), toutes dans la liste fermée A-1 des méthodes EVM sensibles à l'âge : `credits_derived` = 2 RU par essai (tarif conservateur, MAJORANT de la consommation).
- Sur chaque machine, le plafond compte est tenu par le prior figé `max(floor, Σ credits_derived des lignes attempted de SON ledger)` (`packages/rpc-guard/src/ledger.ts:128`) et le refus `cycle_cap` (`packages/rpc-guard/src/client.ts:118`). Les plafonds de RUN de la jambe Narabi (2 000 essais, 20 000 RU, 2 000 par méthode ; `run.ts:230-232`) sont propres au VPS.

## -1d-B — Inter-machines : option 1 (un ledger LOCAL par machine ; plafond compte reconstitué par le floor)
- Un compte Chainstack, un `cycle_id` (le même que la course Ukemi), **deux ledgers physiques** : VPS site `/var/lib/monark-sentinel/ledger/<cycle>/chainstack.{jsonl,head,lock}` (job quotidien Narabi, lignes `network:"ethereum-mainnet"`) ; machine de l'investisseur `<--ledger-dir>/<cycle>/chainstack.*` (courses Ukemi et Bell). Le plafond PAR COMPTE est reconstitué par le **floor = total du compte lu au tableau de bord** (somme des réseaux, donc des machines ; décision 121), importé dans chaque garde : `CHAINSTACK_CYCLE_FLOOR` sur le VPS (posé au 2ᵉ redéploiement puis à chaque changement de période de facturation ; `run.ts:250-252`, `docs/RUNBOOK-sentinel.md` §6-bis), `--floor` pour une course (prereg §4).
- **Option 2 refusée** (un fichier de ledger physiquement partagé entre machines) : le verrou `chainstack.lock` tenu par une course Ukemi (plusieurs jours) rendrait la jambe Narabi noire (ruling 04:3x UTC) ; en outre `openSync("wx")` (O_EXCL) n'est pas garanti sur un montage SMB/NFS, donc le verrou C-9 serait cassé (`docs/G0-lot-narabi-ops-1d.DRAFT.md:174-178`).
- **Conséquences déclarées** :
  - (a) la conséquence de verrou de la clause 121 (d) et de 1b0-B (d) (« pas deux courses Chainstack simultanées ») vaut PAR FICHIER de ledger, donc par machine : le job Narabi et une course Ukemi ou Bell PEUVENT se chevaucher (c'est l'objet de l'option 1) ;
  - (b) chaque garde ne voit que son ledger et le floor importé. **Résiduel** : entre deux rafraîchissements le floor du VPS est périmé, son contrôle 16 M est donc optimiste. Bornes : plafonds de run Narabi (-1d-A) ; toute course lit le floor VRAI sur place avant de partir (décision 121, prereg §4) ; overage désactivé (A-5) : à quota atteint, Chainstack cesse de servir, la jambe Narabi est benchée et le jour passe au quorum keyless (D-degrade), jamais une facture ;
  - (c) le rapprochement reste PAR COMPTE (clause 121 (c)) ; `network` est informatif.

## -1d-C — A-4 (iv) : source du résiduel Narabi
- **Avant le 2ᵉ redéploiement** — dont la course U-4b-1b, prereg gelé §4 (iv) : INCHANGÉ (journal du sentinel). Cet amendement ne modifie pas le prereg.
- **Après le 2ᵉ redéploiement** : ledger VPS, jamais `credits_derived` (majorant). Résiduel = N × 1 RU, N = nombre de lignes `outcome:"attempted"` portant `network:"ethereum-mainnet"` ENTRE deux positions épinglées (nombre de lignes et contenu de `chainstack.head`) relevées aux instants des lectures before/after, **sans `chainstack.lock` présent** au relevé (aucun run en cours). Les lignes de ledger ne portent AUCUN horodatage (`CycleLedgerEntry`, `ledger.ts:27-42`) : la fenêtre se définit par positions épinglées, jamais par date (procédure : `docs/RUNBOOK-sentinel.md` §6-bis). Les lignes `unlocked` (fin de run, sans `network` : `cli.ts:39` ouvre le ledger sans réseau) et `refused` (jamais envoyées) ne comptent pas.
- **Hypothèse H-FACT (NON établie)** : « N × 1 RU ≤ consommation réelle » exige que chaque essai compté ait été facturé au moins 1 RU. Or le ledger écrit l'ESSAI avant le fetch, sans son issue (`Outcome` = `attempted | refused | reconciled | unlocked`, `client.ts:17`) : un essai qui n'atteint pas Chainstack (DNS, connexion, TLS) n'est pas facturable, et la tarification lue (FAITS-tarification-chainstack-2026-09-21, pts 1-11) ne dit rien des requêtes en échec. Marge : chaque requête facturée en archive (2 RU, FAITS pts 1 et 3) compense un essai non facturé ; le cas défavorable est un jour où Chainstack est majoritairement injoignable. **Tant que H-FACT n'est pas établie, le seul minorant garanti est 0 RU** : la contrainte (iii) (aucune fenêtre before/after chevauchant un créneau Narabi, décision 118) RESTE en vigueur. Item -1d-E.

## -1d-D — Déclencheurs A-6 (2a) et R-B (2b-ii) qui nommaient « NARABI-OPS-1d »
- **Élargissement du grep `fetch_only_inside_client` à `apps/sentinel/src/**` : FAIT par -1d** (`test/rpc-guard-fetch-only-inside-client.test.ts` : `sentinelScope` l. 79-83, `SENTINEL_ALLOW` à 2 entrées avec déclencheur l. 108-111, non-vacuité par entrée l. 176-180). Le test `ukemi_src_clean_and_allowlist_load_bearing` (cité ci-dessus l. 344 et l. 445) est RENOMMÉ `sentinel_src_clean_and_allowlist_load_bearing` (l. 148 à `f6442fe`, l. 159 à `7daf8e5`).
- **Rétractation de l'entrée `apps/sentinel/src/rpc.ts` : REPORTÉE au pli §11-1** (option (b)) : `rpc.ts` est au gel D4 de l'ADR-U4b ; -1d le laisse byte-identique (`0e232519…`) avec ses exports payants devenus MORTS. **Déclencheur** : clôture de la course U-4b-1b au sens du gel (ADR-NARABI-OPS-1, amendement -1d, A.8-1). Auto-armée : la non-vacuité par entrée rougit l'entrée dès que le code mort est supprimé.
- **Décision 118** : jusqu'au 2ᵉ redéploiement le VPS exécute `c4981d0` (`docs/JOURNAL-PROVENANCE.md:353-357`) ; la phrase A-6 « `rpc.ts` reste un chemin payant HORS garde en production » reste VRAIE jusque-là.

## -1d-E — Tuyaux et items formés
| Tuyau | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test d'intégration non-LLM |
|---|---|---|---|---|
| garde Narabi (VPS) | `openGuardedClient(process.env, limits, <état>/ledger, {chainstack: <cycle>}, {network: "ethereum-mainnet", timeoutMs: 20 000})` (`run.ts:295`) | `client.call` : ligne write-ahead puis transport ; `runCli unlock` en fin de run (`run.ts:305`) | ledger VPS (option 1) ; `upcoming` jusqu'au 2ᵉ redéploiement (ADR-NARABI-OPS-1, amendement -1d, A.4) | `sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock` (lignes `network:"ethereum-mainnet"` sur disque, garde réel) |
| ledger VPS → A-4 (iv) | lignes `attempted` du VPS | résiduel N × 1 RU, sous H-FACT | relevé manuel, SSH lecture seule | aucun (acte manuel déclaré) |

- **Item H-FACT** — choix non tranché, recherche de solutions : (1) lecture SUR PLACE, par l'orchestrateur, de la politique de facturation Chainstack des requêtes en échec (FAITS daté) — ne couvre pas les essais qui n'ont jamais atteint le serveur ; (2) journaliser l'issue de chaque essai payant (lot paquet : valeur d'`Outcome` ou attribut d'issue, ripple `verifyCycleLedger`) — seule voie qui rende le minorant exact ; (3) conserver la contrainte (iii) (statu quo). **Propriétaire** : orchestrateur. **Déclencheur** : avant le premier rapprochement A-4 consommant le ledger VPS, ou avant le prochain prereg Chainstack qui voudrait relâcher (iii).
- **Floor VPS périmé** — résiduel déclaré (-1d-B (b)). **Déclencheur de réévaluation** : une course Chainstack qui approche 16 M RU (A-5 : quota exact à procurer alors). **Propriétaire** : orchestrateur.
~~~~

---

## C. `docs/adr/ADR-U4b-calibration-episode-frais.md` — amendement D4 (livrable 3)

Texte à insérer après la l. 712 (niveau `##`, calqué sur l'amendement UKEMI-RETRY-1, l. 616) :

~~~~markdown
## Amendement daté 2026-09-22 (NARABI-OPS-1d, fusion option (b)) — D4 : `apps/sentinel/src/rpc.ts` AVANT == APRÈS ; la suppression du code mort est un item post-course

> **Provenance.** Texte : worker `claude-opus-5-5[1m]` (effort max), 2026-09-22 ; recompute LF depuis les blobs (`git show <c>:<f> | tr -d '\r' | sha256sum`, régime B) aux commits `9e095a0` (commit du prereg), `f6442fe` (base du lot), `7daf8e5` (pointe du lot) et `de30eab` (`lot/etude-suite` à la rédaction). **Insertion par l'orchestrateur `claude-fable-5-1` SEUL** (R-20) ; réviseur = orchestrateur (R-21). Corrige le texte PROPOSÉ au G1 §12 de NARABI-OPS-1d (« APRÈS = recomputé au commit du rebase -1d »), devenu faux par le report du gel (G2 C-G2-1 ; checkpoint-2 C-V-4 ; ruling C-V-0 option (b), `docs/CHANTIERS.md:783` et `:786`).

### 1. D4 — sha AVANT / APRÈS de la fusion NARABI-OPS-1d
Aucun fichier gelé ne bouge : `git diff --name-only f6442fe 7daf8e5` = 8 fichiers, aucun du gel. Les 9 valeurs sont identiques aux quatre commits cités :

| # | Fichier gelé | AVANT (`9e095a0` = `f6442fe`) | APRÈS (`7daf8e5` = arbre fusionné hors `docs/`) | État |
|---|---|---|---|---|
| 1 | `scripts/census/u4b/u4b-scores.mjs` | `2f9a31f6…f51445c0` | idem | inchangé |
| 2 | `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd3…57a6fac0` | idem | inchangé |
| 3 | `scripts/record-u4b-calib.mjs` | `5733daeb…1fbc31a3` | idem | inchangé |
| 4 | `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc…e4de2322` | idem | inchangé |
| 5 | `apps/sentinel/src/ukemi/abi.ts` | `3376eb08…c1ab2d66` | idem | inchangé |
| 6 | `packages/hikae/src/l1-split.ts` | `9206df91…8164ffa3` | idem | inchangé |
| 7 | `apps/sentinel/src/rpc.ts` | `0e232519…c1c65ca0` | idem | **inchangé — GELÉ ; exports payants devenus morts** |
| 8 | `packages/contracts/src/calib-digest.ts` | `3603265d…94c42380` | idem | inchangé |
| 9 | `scripts/census/u3-realized.mjs` (labeler) | `cb020425…5b41a1af` | idem | inchangé |

Valeur complète du sha #7 (AVANT == APRÈS) :
```
0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0  apps/sentinel/src/rpc.ts
```
**À recomputer sur le commit de fusion réel** (`git show <fusion>:<f> | tr -d '\r' | sha256sum`) — tout écart = STOP.

### 2. Contrainte d'ordre (§3 de l'amendement 2026-09-21, l. 121-136 ; prereg, « Préconditions dures » point 6)
- Lettre (`docs/PLAN-u4b-prereg.md:367` ; l. 127-129 ci-dessus) : « NARABI-OPS-1d NE fusionne PAS entre le commit du prereg -1b et la clôture de la course. Sinon `rpc.ts` change, le gel est rompu ». Sous l'option (b), -1d fusionne DANS cette fenêtre (prereg committé `9e095a0`, course non close) ; mais `rpc.ts` et les 8 autres fichiers gelés sont byte-identiques (§1), et aucun fichier de la fermeture d'imports des scripts de course n'est touché (`run.ts` et `keyless-transport.ts` ne sont importés que par `run.ts` et par des tests sentinel ; `git grep` sur `scripts apps packages` @ `7daf8e5`). L'objet protégé est intact : le gel n'est PAS rompu, aucun re-gel.
- **D-n à consigner** au PLI de la course U-4b-1b (le prereg, committé et lié par `--prereg-sha`, n'est PAS modifié) : « D-n (NARABI-OPS-1d, option (b), 2026-09-22) — fusion de `lot/narabi-ops-1d` @ `7daf8e5` pendant la fenêtre prereg → clôture, en écart à la LETTRE de la précondition 6 (`docs/PLAN-u4b-prereg.md:367`) ; 9 sha LF byte-identiques AVANT/APRÈS (ADR-U4b, amendement -1d §1) ; aucun fichier gelé ni aucune ligne de commande figée touchés. »
- La SUPPRESSION du code mort de `rpc.ts` (pli §11-1) reste soumise à la lettre de §3.

### 3. Item formé — pli §11-1 (post-course) et sha APRÈS' de `rpc.ts`
- Contenu, sur `rpc.ts` : suppression de `chainstackUrl` (l. 50-56), `poolEndpoints` (l. 58-64), `publishedEndpoints` (l. 66-72), `hasChainstack` (l. 74-78), `defaultCall` (l. 121-133) et du défaut `opts.call ?? defaultCall` (l. 145). Ne touche ni `TRANSFER_TOPIC` (l. 15 ; importé par `abi.ts:7`, gelé) ni `PUBLIC_ENDPOINTS`/`providerOf` (importés par le labeler `u3-realized.mjs:36`, gelé).
- **Déclencheur : clôture de la course U-4b-1b AU SENS DU GEL** — après l'exécution du hors-ligne du prereg §(5e) (`docs/PLAN-u4b-prereg.md:310` : « après la course ; sous la vérification des 9 sha par l'orchestrateur » ; `u4b-reduce` → `u4b-scores` → `record-u4b-calib`). `u4b-scores.mjs:37` et `u4b-reduce.mjs:19` importent `abi.ts`, qui importe `rpc.ts` (`abi.ts:7`) : modifier `rpc.ts` avant ces étapes romprait leur vérification (ÉCART = STOP). La clôture « sur les données » de la décision 129 ne suffit PAS.
- Au commit du pli : amendement D4 daté portant AVANT `0e232519…` / APRÈS' (recomputé). Si le prereg d'une calibration suivante a re-gelé `rpc.ts` entre-temps ⇒ STOP (re-gel et re-prereg, ou report). **Propriétaire** : orchestrateur.

*(ADR-U4b n'est pas dans le gel du prereg §2 ; les docs sont exclus du décompte R-25 — `ci.yml:65`. Ajout pur : aucune valeur de référence existante n'est éditée.)*
~~~~

---

## D. `docs/RUNBOOK-sentinel.md` (livrable 4)

### D-1. Nouvelle section, à insérer AVANT la l. 327 (`## Déploiement de la sonde (Bell) — sub-lot NARABI-OPS-1b-ii`)

~~~~markdown
## 6-bis. Second redéploiement (lot NARABI-OPS-1d, décision 118) — jambe Chainstack gardée, sur le timer VIVANT

Pré-enregistré au G7 de NARABI-OPS-1d (2026-09-22) ; implémente le G1 §13 et la correction C-5 du checkpoint-1 de -1d ; calque de l'E-5 (`docs/JOURNAL-PROVENANCE.md:353-357`) et du §6. **Ne pas exécuter avant P-1..P-4.** Tout se fait depuis le poste de l'orchestrateur, canal SSH habituel (`ssh -i ~/.ssh/monark_vps root@31.97.155.188`).

### Préconditions (toutes vraies, sinon STOP)
- **P-1** — Le pli §11-1 est fusionné (ADR-NARABI-OPS-1, amendement -1d, A.8-1) avec G2-delta PASS, re-checkpoint-2 ACCEPTE et G7 ; son **SHA de fusion NOMMÉ** est consigné dans `docs/JOURNAL-PROVENANCE.md` AVANT l'archive (décision 72). Jamais le SHA de fusion de -1d seul : UN seul second redéploiement (décision 118 ; option (b), C-V-0). Go permanent : décision 137 (`docs/CHANTIERS.md:858`, « 2e redeploiement VPS sentinelle (apres pli §11-1) ») — aucun go supplémentaire à demander.
- **P-2** — Clôture du temps 1 et de la course U-4b-1b (G1 -1d §4 ; décision 118).
- **P-3** — Valeurs lues, jamais devinées : `<CYCLE>` = le `cycle_id` Chainstack du compte pour la période de facturation courante, le MÊME que le `--cycle` des courses Ukemi (ruling 2026-09-22 04:3x UTC, option 1) ; `<FLOOR>` = total RU du COMPTE (somme des réseaux) lu SUR PLACE à la console Chainstack le jour même, entier sans séparateur (`run.ts:256` refuse tout autre format ⇒ `config_error`) et ≤ 16 000 000.
- **P-4** — Hors créneau : `systemctl is-active monark-sentinel.service` affiche `inactive`, et l'heure n'est dans aucune fenêtre [créneau ; créneau + 35 min] (00:30 / 03:30 / 06:30 / 09:30 UTC, `RandomizedDelaySec=1800`, `TimeoutStartSec=300`).

### Étapes
```bash
# (1) Hachés attendus — poste de l'orchestrateur, AVANT l'archive (calque E-5 : calculés depuis l'archive elle-même).
SHA=<SHA de fusion NOMMÉ du pli 11-1>
T=$(mktemp -d)
git archive --format=tar "$SHA" apps packages deploy | tar -x -C "$T"
( cd "$T" && sha256sum apps/sentinel/src/*.ts packages/rpc-guard/src/*.ts packages/rpc-guard/bin/rpc-guard.mjs \
    deploy/monark-sentinel.service deploy/monark-sentinel.timer ) > expected-nops1d.sha256
#     consigner le SHA et expected-nops1d.sha256 dans docs/JOURNAL-PROVENANCE.md.

# (2) Sauvegarde de rollback — VPS, AVANT toute écriture (calque E-5 /root/rollback-e5-20260921/).
B=/root/rollback-nops1d-$(date -u +%Y%m%d); install -d -m 0700 "$B"
tar czf "$B/monark-harness-tree.tgz" --exclude=monark-harness/node_modules -C /opt monark-harness
cp /etc/systemd/system/monark-sentinel.service /etc/systemd/system/monark-sentinel.timer "$B/"
cp -a /etc/systemd/system/monark-sentinel.service.d "$B/"
cp /var/lib/monark-sentinel/timeline.jsonl /var/lib/monark-sentinel/state.json "$B/"
cp -a /opt/monark-harness/node_modules "$B/node_modules.pre-nops1d"
sha256sum "$B/monark-harness-tree.tgz" "$B/timeline.jsonl" "$B/state.json"      # à consigner
#     /etc/monark/sentinel.env N'ENTRE PAS dans la sauvegarde (secret).
#     Relever le 8e endpoint publié par l'ancien code (une origine, non secrète) :
tail -1 /var/lib/monark-sentinel/timeline.jsonl | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const e=JSON.parse(s).endpoints;console.log(e.length, e[7] ?? "(pas de 8e endpoint)")})'

# (3) Parent du ledger — AVANT tout run ou dry-run gardé (C-8 : jamais auto-créé).
install -d -o sentinel -g sentinel -m 0750 /var/lib/monark-sentinel/ledger
stat -c '%a %U:%G' /var/lib/monark-sentinel/ledger        # attendu : 750 sentinel:sentinel
#     sous ReadWritePaths=/var/lib/monark-sentinel (unité inchangée) ; hors public/ (Caddy ne sert que .../public).
```
- **(4) EnvironmentFile : le secret et les trois clés NON secrètes en UNE écriture.** Les `cat >` des §4 et §6 (5) RÉÉCRIVENT le fichier : poster l'URL seule EFFACERAIT les clés de cycle (⇒ `chainstack_guard: "unconfigured"`, jambe noire, publication keyless). Depuis le shell LOCAL de l'orchestrateur (où vit `$CHAINSTACK_ETH_URL`, décision 43), par ssh STDIN ; jamais `cat` du fichier distant, jamais `set -x` :
```bash
ORIGIN=$(node -e 'process.stdout.write(new URL(process.env.CHAINSTACK_ETH_URL).origin)')   # schéma + hôte (= rpc.ts:redactEndpoint), jamais le chemin porteur de clé
printf '%s\n' "$ORIGIN"      # SEULE valeur affichée (non secrète) ; doit égaler le 8e endpoint relevé en (2)
printf 'CHAINSTACK_ETH_URL=%s\nCHAINSTACK_CYCLE_ID=%s\nCHAINSTACK_ETH_ORIGIN=%s\nCHAINSTACK_CYCLE_FLOOR=%s\n' \
  "$CHAINSTACK_ETH_URL" "<CYCLE>" "$ORIGIN" "<FLOOR>" \
  | ssh -i ~/.ssh/monark_vps root@31.97.155.188 \
      'umask 077; install -d -m 0750 -o root -g sentinel /etc/monark; cat > /etc/monark/sentinel.env; chown root:sentinel /etc/monark/sentinel.env; chmod 0640 /etc/monark/sentinel.env'
# Empreintes des DEUX côtés (même printf localement) — les deux hachés DOIVENT être identiques :
printf 'CHAINSTACK_ETH_URL=%s\nCHAINSTACK_CYCLE_ID=%s\nCHAINSTACK_ETH_ORIGIN=%s\nCHAINSTACK_CYCLE_FLOOR=%s\n' "$CHAINSTACK_ETH_URL" "<CYCLE>" "$ORIGIN" "<FLOOR>" | sha256sum
ssh -i ~/.ssh/monark_vps root@31.97.155.188 'sha256sum /etc/monark/sentinel.env'
```
- **(5) Expédition, `npm ci`, contrôle des hachés, unités** (calque §6 (1)-(3), (6), (8)) :
```bash
git archive --format=tar.gz "$SHA" apps packages schemas fixtures package.json package-lock.json deploy scripts/verify-harness.mjs \
  | ssh -i ~/.ssh/monark_vps root@31.97.155.188 "mkdir -p /opt/monark-harness && tar xzf - -C /opt/monark-harness"
ssh -i ~/.ssh/monark_vps root@31.97.155.188 'cat > /root/expected-nops1d.sha256' < expected-nops1d.sha256
# sur le VPS :
cd /opt/monark-harness && npm ci && chown -R monark:monark .
sha256sum -c /root/expected-nops1d.sha256            # TOUT « OK », sinon STOP (ré-expédier)
cp deploy/monark-sentinel.service deploy/monark-sentinel.timer /etc/systemd/system/
grep '^OnCalendar=' /etc/systemd/system/monark-sentinel.timer | cut -d= -f2- | \
  while read -r e; do systemd-analyze calendar "$e" || echo "STOP: invalid OnCalendar '$e'"; done
systemctl daemon-reload
systemctl show -p TimeoutStartUSec monark-sentinel.service    # attendu TimeoutStartUSec=5min
systemctl show -p EnvironmentFiles monark-sentinel.service    # attendu -/etc/monark/sentinel.env
sudo -u sentinel node -e 'import("@monark/rpc-guard").then(m => console.log(typeof m.openGuardedClient, typeof m.runCli))'   # depuis /opt/monark-harness ; attendu : function function
#     NE PAS redéposer le drop-in J0 (état non vide, j0Source: state). monark-harness NON redémarré (calque E-5) — consigner.
```
- **(6) Dry-run GARDÉ** (en `sentinel`, EnvironmentFile chargé par systemd ; le secret ne touche aucun shell) :
```bash
systemd-run --uid=sentinel --pipe --wait \
  -p EnvironmentFile=/etc/monark/sentinel.env \
  -p Environment=MONARK_SENTINEL_DIR=/var/lib/monark-sentinel \
  /usr/bin/env node /opt/monark-harness/apps/sentinel/src/run.ts --dry-run
ls /var/lib/monark-sentinel/ledger/<CYCLE>/                       # chainstack.jsonl + chainstack.head, AUCUN chainstack.lock
tail -1 /var/lib/monark-sentinel/ledger/<CYCLE>/chainstack.jsonl   # "outcome":"unlocked" … "reason":"sentinel-daily-end"
```
  Depuis -1d le dry-run OUVRE la jambe (`run.ts:319`, avant tout test de `--dry-run`) : il prend et relâche le verrou et écrit de VRAIES lignes de ledger (une ligne `unlocked` ; des lignes `attempted`, facturées, s'il y a un jour dû), sans rien écrire dans `timeline.jsonl`/`state.json`. La forme `sudo -u sentinel … --dry-run` du §3 ne charge PAS l'EnvironmentFile : elle rend `unconfigured` et ne teste que le pool keyless. **Attendu** (JSON de fin) : `chainstack: true`, `chainstack_guard: "ok"`, `exit_code: 0`, `dryRun: true`, « --dry-run: nothing written. ». **STOP** (corriger puis rejouer ; sinon rollback) selon `chainstack_guard` : `unconfigured` ⇒ `CHAINSTACK_CYCLE_ID` ou `CHAINSTACK_ETH_ORIGIN` absent ou vide (étape 4) ; `config_error` ⇒ `<FLOOR>` non entier ou > 16 000 000 ; `ledger_error` ⇒ parent absent ou droits (étape 3) ; `lock_held` ⇒ verrou orphelin (réparation SIGKILL ci-dessous).
- **(7) Armement** : `systemctl restart monark-sentinel.timer` puis `systemctl list-timers monark-sentinel.timer --no-pager`. Sous `Persistent=true` un run peut partir aussitôt (§6 (7)) : le consigner comme premier run.

### Acceptation (critères pré-enregistrés ; `journalctl -u monark-sentinel -n 40 --no-pager`)
- **(a) Tout run post-déploiement**, y compris « nothing due » : `exit_code 0`, `stopped null`, `chainstack true`, **`chainstack_guard "ok"`**, `elapsed_ms`/`max_day_ms` présents (`max_day_ms > 60000` ⇒ amendement -1c) ; unité `Deactivated successfully` ; **aucun `chainstack.lock`** après la désactivation ; dernière ligne du ledger `unlocked` / `sentinel-daily-end`. Un run « nothing due » ne tire en général pas la jambe : 0 ligne `attempted` y est normal (le `finalized()` d'un pool sain prend les deux premiers fournisseurs publics ; `rpc.ts:175-201`, ordre `run.ts:324`).
- **(b) Premier run PUBLIANT** (en général le créneau 00:30 UTC suivant) : la nouvelle ligne de `timeline.jsonl` porte `endpoints` = les 7 URLs publiques dans l'ordre de `rpc.ts:19-24`, puis en 8ᵉ la valeur `ORIGIN` postée à l'étape (4) (égale au 8ᵉ endpoint relevé à l'étape (2)) ; le ledger gagne **≥ 1 ligne `attempted` portant `"network":"ethereum-mainnet"`** (la rotation de `one()`, `rpc.ts:155-170`, atteint l'entrée `chainstack` au plus tard au 6ᵉ `blockTs` d'un pool sain ; un jour publié en fait des dizaines, `windows.ts:50-58`) ; le tir suivant de la sonde Bell rend `healthy`, `chain_ok`, `state_checked: true`, **`chainstack_present: true`**.
- **Consigner** dans `docs/JOURNAL-PROVENANCE.md` l'entrée (a), puis l'entrée (b) : cette dernière fait passer la jambe gardée `upcoming → built` (ADR-NARABI-OPS-1, amendement -1d, A.4), retire le chemin « env → `rpc.ts` pool », et la cartographie cesse de déclarer le résiduel 118.
- **STOP + rollback** : `sentinel FATAL` ; `chainstack_guard` ≠ `ok` non corrigeable ; `.lock` résiduel après `Deactivated` sans SIGKILL ; 8ᵉ endpoint ≠ `ORIGIN`. **STOP et enquête, sans rollback automatique** : run PUBLIANT à 0 ligne `attempted`.

### Rollback (calque E-5)
Ré-expédier le SHA déployé AVANT (dernière entrée de déploiement de `docs/JOURNAL-PROVENANCE.md` ; à la rédaction : `c4981d0`, E-5, l. 353-355) ou restaurer `"$B/monark-harness-tree.tgz"` ; `npm ci` ; recopier les unités sauvegardées ; `systemctl daemon-reload && systemctl restart monark-sentinel.timer` ; contrôler les hachés consignés pour ce SHA (E-5 : `run.ts` `54619a40…`, `.service` `d70f88cc…`, `.timer` `d84a08b5…`). L'EnvironmentFile à 4 clés reste compatible avec l'ancien code (il ne lit que `CHAINSTACK_ETH_URL` ; les clés de cycle sont ignorées) ; `/var/lib/monark-sentinel/ledger/` reste en place (ni lu ni servi par l'ancien code). Un rollback RÉ-OUVRE le résiduel 118 (chemin payant hors garde) : le consigner.

### Réparation après SIGKILL (D-lock iii)
Symptôme : `chainstack_guard: "lock_held"` au JSON de fin (le run publie en keyless, jamais FATAL).
```bash
systemctl is-active monark-sentinel.service           # DOIT être inactive ou failed — jamais activating : ne JAMAIS déverrouiller un run vivant
ls /var/lib/monark-sentinel/ledger/*/chainstack.lock  # exactement UN chemin, sinon STOP
LOCK=$(ls /var/lib/monark-sentinel/ledger/*/chainstack.lock); CYCLE=$(basename "$(dirname "$LOCK")")
cat "$LOCK"                                           # {pid, iso} (packages/rpc-guard/src/lock.ts:25), non secret : vérifier que ce pid n'existe plus (ps -p <pid>)
cd /opt/monark-harness && sudo -u sentinel /usr/bin/env node packages/rpc-guard/bin/rpc-guard.mjs unlock \
  --ledger-dir /var/lib/monark-sentinel/ledger --cycle "$CYCLE" --op chainstack --reason runbook-sigkill-unlock
echo "exit=$?"; test ! -e "$LOCK" && echo "lock released"
tail -1 "/var/lib/monark-sentinel/ledger/$CYCLE/chainstack.jsonl"   # "outcome":"unlocked" … "reason":"runbook-sigkill-unlock"
```
En `sentinel`, jamais root (un fichier de ledger appartenant à root ferait échouer les ajouts suivants ⇒ `ledger_error`). Si `unlock` échoue sur « head sidecar » ou « cycle ledger » (troncature, fail-closed C-V-8) : STOP, aucune réparation à la main, escalade orchestrateur.

### Lecture du ledger pour le rapprochement A-4 (SSH, LECTURE SEULE ; ADR-GARDE-HELIUS, amendement -1d, -1d-C)
Aux MÊMES instants que les lectures before/after du tableau de bord :
```bash
ssh -i ~/.ssh/monark_vps root@31.97.155.188 'd=/var/lib/monark-sentinel/ledger/<CYCLE>; if [ -e $d/chainstack.lock ]; then echo "RUN EN COURS: relire plus tard"; else wc -l < $d/chainstack.jsonl; cat $d/chainstack.head; echo; fi'
#   épingle = (N lignes, tête). Contrôle de chaîne : la ligne N porte "entry_sha256" == la tête relevée.
#   Compte entre deux épingles N1 < N2 (lignes attempted + network ethereum-mainnet) :
ssh -i ~/.ssh/monark_vps root@31.97.155.188 "sed -n '$((N1+1)),${N2}p' /var/lib/monark-sentinel/ledger/<CYCLE>/chainstack.jsonl" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const L=s.split("\n").filter(Boolean).map(l=>JSON.parse(l));console.log(L.filter(e=>e.outcome==="attempted"&&e.network==="ethereum-mainnet").length)})'
```
Résiduel A-4 (iv) = ce compte × 1 RU, **sous l'hypothèse H-FACT** (non établie : tant qu'elle ne l'est pas, 0 RU, et la contrainte « aucune fenêtre chevauchant un créneau » reste la règle) ; jamais `credits_derived`.

### Changement de période de facturation Chainstack
Période courante 19/09 → 19/10 (`docs/course-ukemi/FAITS-floor-chainstack-2026-09-22.md:25`) ; la suivante se lit sur place. À chaque bascule : réécrire `/etc/monark/sentinel.env` par l'étape (4) avec le nouveau `<CYCLE>` et le `<FLOOR>` lu sur place (`run.ts:250-252`) — aucun redémarrage (l'EnvironmentFile est relu à chaque run oneshot). À défaut, la jambe continue de ledgérer sous l'ancien cycle : publication intacte, attribution A-4 fausse.

### Installation neuve (§2-§4) après NARABI-OPS-1d
Si l'EnvironmentFile porte les clés de cycle, créer aussi le parent du ledger (étape (3)) avant le premier run ; le contrôle du §3 « must still be EMPTY (public/ only) » devient « public/ et ledger/ seulement ».

### Correspondance des lignes `run.ts` citées par les Modes A/B (§6)
Les références `run.ts:NNN` des l. 187-313 visent une version antérieure à -1c : elles ne correspondent ni au code déployé (`c4981d0`) ni à celui de -1d. Correspondance mesurée (`git show <c>:apps/sentinel/src/run.ts | grep -n`) :

| RUNBOOK (l.) | Cité | Énoncé visé | `c4981d0` (déployé) | `7daf8e5` (2ᵉ redéploiement) |
|---|---|---|---|---|
| 187 | `run.ts:180` | JSON de fin | :233 | :350 |
| 209, 212 | `:167` | `dueDays` | :220 | :335 |
| 209 | `:75`-`:92` | boucle de `runDue` | :119-143 | :126-150 |
| 210 | `:182`-`:191` | bloc d'écriture | :235-244 | :352-361 |
| 220, 252 | `run.ts:72`, `:72` | `let lo = DEPLOY_BLOCK` | :113 | :120 |
| 250, 257 | `run.ts:165` | contrôle `--day` = jour suivant | :218 | :333 |
| 272, 275, 278, 279, 313 | `:188` | `appendFileSync` (timeline privée) | :241 | :358 |
| 278, 279 | `:189` | écriture du `state.json` privé | :242 | :359 |
| 277, 279, 313 | `:190`, `:191` | copies publiques | :243, :244 | :360, :361 |
| 282 | `:104`-`:120` | `loadState` | :156-172 | :163-179 |
| 283, 285, 302 | `:111` | `JSON.parse` par ligne | :163 | :170 |
| 284, 302 | `:201` | garde de run (`sentinel FATAL`) | :254 | :375 |
| 287 | `:182` | garde `report.lines.length > 0` | :235 | :352 |
| 300-301 | `run.ts:162`, `:166`, `:181` | appel de `loadState`, 1ᵉʳ RPC `finalized()`, branche `--dry-run` | :215, :219, :234 | :330, :334, :351 |

Avec -1d, `openChainstackLeg` (`:319`) s'exécute AVANT `loadState` ; il n'appelle aucun RPC (lecture de l'env, fichiers, verrou) et, dans la forme de vérification du Mode B (`sudo -u sentinel … --dry-run`, sans EnvironmentFile), rend `unconfigured` sans toucher au ledger : le « network-free » de la l. 300 reste vrai. Re-pointage en place des l. 187-313 : item formé (propriétaire orchestrateur ; déclencheur : prochaine édition du RUNBOOK, au plus tard le 2ᵉ redéploiement).
~~~~

### D-2. Remplacements EN PLACE (minimaux, anglais conservé ; ancrage = contenu exact, `grep -n -F`)

| l. | Chaîne actuelle (exacte) | Remplacer par |
|---|---|---|
| 5 | `optional keyed 9th operator via out-of-repo EnvironmentFile` | `optional keyed 8th operator via out-of-repo EnvironmentFile` |
| 17 | `absent, the run falls back to the 8 public endpoints and stays fail-closed.` | `absent, the run falls back to the 7 public endpoints and stays fail-closed. Since NARABI-OPS-1d the same file also carries the non-secret CHAINSTACK_CYCLE_ID / CHAINSTACK_ETH_ORIGIN / CHAINSTACK_CYCLE_FLOOR (§6-bis step 4).` |
| 92 | `the run falls back to the 8 public endpoints,` | `the run falls back to the 7 public endpoints,` |
| 199 | `` `one()` may rotate 9 endpoints x 20 s) `` | `` `one()` may rotate 8 endpoints x 20 s) `` |
| 261 | `-> chainstack:false, the 8 public endpoints,` | `-> chainstack:false, the 7 public endpoints,` |

Ligne à AJOUTER après la l. 93 (fin du bloc « Post the OPTIONAL Chainstack key » du §4) ET après la l. 158 (fin du point (5) du §6), à l'identique :
```
#   (NARABI-OPS-1d) Once the -1d code is deployed (§6-bis) this file carries FOUR keys: post them TOGETHER with §6-bis step (4) — a URL-only `cat >` ERASES the cycle keys => chainstack_guard: "unconfigured".
```

---

## E. Trace C-V-1 (livrable 5)

- **Paragraphe** « preuve d'exécution SIGTERM » : §A.5 du bloc A (réutilisable tel quel dans l'entrée G7 de `docs/JOURNAL-PROVENANCE.md`, C-RV-1).
- **Chemin** : `docs/traces/narabi-ops-1d/` — DÉJÀ persisté par l'orchestrateur (commit `1d4f385`, `2026-09-22T20:31:01+01:00`, index `README.md`). Aucune recopie supplémentaire ; `docs/course-narabi/` NON créé (doublon). Correspondance vérifiée des pièces de la mission :

| Pièce de la mission (hors dépôt) | sha256 (tel quel) | Fichier persisté | sha256 (blob LF) | Relation mesurée |
|---|---|---|---|---|
| `linux-sigterm-trace.log` (CRLF, 25 l.) | `4ab8e38c5984a086…` | `docker-e12f59f-guard-trace.log` (24 l.) | `6e5904e883c2b5f8…` | CRLF→LF puis retrait de la seule ligne `# todo 0` (`diff` : `24d23 < # todo 0`) |
| `linux-sigterm-mutant-V6.log` (CRLF, 4 l.) | `aadab9687f89926c…` | `docker-e12f59f-mutant-V6.log` (4 l.) | `d212e62d07e2c8a4…` | identique après CRLF→LF (`sed 's/\r$//' … \| sha256sum` = `d212e62d…`) |
| `ci-88-sigterm-trace.log` (LF, 5 l.) | `0ec00434eaa4d47a…` | `ci-run-35763895313-e12f59f.extract.log` (5 l.) | `0ec00434eaa4d47a…` | identique octet pour octet |

- Normalisation git vérifiée sans écrire (`.gitattributes` : `* text=auto eol=lf`) : `git hash-object --path=docs/course-narabi/<f> <f>` == `sed 's/\r$//' <f> | git hash-object --stdin` pour les trois pièces.
- R-25 : les 78 lignes `.log` de `1d4f385` sont COMPTÉES par le pathspec `ci.yml:65` (seul `docs/**/*.md` est exclu) pour toute PR dont la plage contient ce commit ; la plage du lot (`f6442fe...7daf8e5` = 734) n'est pas affectée.
- « CI #88 » est un numéro de PR : les runs sont `35763895313` (`e12f59f`) et `35769452047` / job `106887215941` (`7daf8e5`) — CONSIGNE A-12, G2-delta O-3.

---

## F. Liste fermée des co-édits du pli §11-1 (livrable 6 ; C-V-4 + C-G2D-1 + C-G2D-2 + constats F-1, F-7, F-9, F-10)

Lignes : blobs `7daf8e5`. « Forcé » = un test ou `typecheck` rougit si l'édition est omise.

| # | Fichier | Lignes | Édition exigée | Source | Forcé ? |
|---|---|---|---|---|---|
| F-a | `apps/sentinel/src/rpc.ts` | 50-56, 58-64, 66-72, 74-78, 121-133 | supprimer `chainstackUrl`, `poolEndpoints`, `publishedEndpoints`, `hasChainstack`, `defaultCall` (avec leurs JSDoc) ; après suppression `rpc.ts` doit rendre 0 hit NET/KEY/KEY_BARE (seuls `:54` et `:125` portent aujourd'hui `CHAINSTACK_ETH_URL`/`fetch(` hors commentaires, avec `:50` en JSDoc) | G1 §11-1 | objet du pli |
| F-b | idem | 143-145 | retirer `opts.call ?? defaultCall` ET typer `call: RpcCall` REQUIS (`call?:` resterait silencieusement vert au `typecheck`) | G1 §11-1 + F-1 | `typecheck` si typé requis |
| F-c | idem | 3, 80 | commentaires périmés : l. 3 « optional keyed 8th operator via out-of-repo EnvironmentFile » (la jambe est désormais gardée dans `run.ts`) ; l. 80 « the default hits the public pool » (plus de défaut) | C-V-4 (texte) | non |
| F-d | `test/rpc-guard-fetch-only-inside-client.test.ts` | 109 | retirer l'entrée `apps/sentinel/src/rpc.ts` de `SENTINEL_ALLOW` (1 entrée restante : `keyless-transport.ts`) | G1 §11-1 | OUI (non-vacuité par entrée, l. 176-180) |
| F-e | idem | 10-12, 20, 41, 72-78, 105-107, 175 | textes périmés : portée d'avant -1d (« ukemi/** UNION rpc.ts », « RETRACTION TRIGGER = NARABI-OPS-1d », « run.ts/timeline.ts enter scope at -1d ») ; « rpc.ts allowlisted, so its env read is exempt » ; nom de test `ukemi_src_clean_and_allowlist_load_bearing` (renommé `sentinel_src_…`) ; « DELETED at the -1d rebase » ×3 | C-V-4 (texte) + F-9 | non |
| F-f | `apps/sentinel/test/sentinel-retry.test.ts` | 17 | retirer `publishedEndpoints, poolEndpoints` de l'import | G1 §11-1 | OUI (`typecheck`) |
| F-g | idem | 217-220 | liage verbatim sur `publishedEndpoints` (code mort depuis `e12f59f`) : supprimer SEULEMENT après F-k | C-G2D-1 | non (l'ordre n'est pas forcé) |
| F-h | idem | 221-222 | assertion `poolEndpoints` (« the pool gains the 9th endpoint ») : supprimer | G1 §11-1 | OUI |
| F-i | idem | 224-241 (229, 235) | `makeRpcPool({ endpoints: [...] })` SANS `call` ⇒ repose sur `defaultCall` : injecter `call: keylessCall` (`../src/keyless-transport.ts`) pour lier le chemin d'erreur keyless SERVI (`keyless-transport.ts:28`, même chaîne « HTTP <status> <origin> ») ; message l. 235 « raw url in defaultCall » → `keylessCall` | **F-1 (nouveau)** | OUI (`typecheck` avec F-b ; sinon l'assertion `msg.includes("rpc.example.test")` rougit, le message devenant « call is not a function ») |
| F-j | idem | 261-277 (266-269) | `pool9 = poolEndpoints(…)` : re-pointer sur la composition SERVIE `[...PUBLIC_ENDPOINTS, CHAINSTACK_LABEL]` (`run.ts:324`) ; messages « 8 public providers », « 9th endpoint » → 7 endpoints / 6 fournisseurs | G1 §11-1 + F-7 | OUI pour `poolEndpoints` ; non pour les messages |
| F-k | `apps/sentinel/test/sentinel-chainstack-guard.test.ts` + `sentinel-retry.test.ts:256` | 239-240, 265, 282, 301 ; constante `ORIGIN` l. 33 | e2e dégradés : `assert.deepEqual(written.endpoints, [...PUBLIC_ENDPOINTS])` ; e2e `ok` : ORIGIN NON canonique (hôte `*.chainstack.com` ≠ `https://ethereum-mainnet.core.chainstack.com`) et `assert.deepEqual(written.endpoints, [...PUBLIC_ENDPOINTS, ORIGIN])` ; mutants G2D-6a/6b/7 ROUGES | C-G2D-1 | non (à prouver par mutants) |
| F-l | `apps/sentinel/test/sentinel-chainstack-guard.test.ts` | nouveau test, frère de l. 289 | `CHAINSTACK_ETH_ORIGIN=""` et `CHAINSTACK_CYCLE_ID=""` ⇒ `unconfigured`, 7 endpoints, pas de `.lock` ; mutants G2D-4/5 ROUGES | C-G2D-2 | non |
| F-m | `apps/sentinel/test/pool-rpc-1a.test.ts` | 4-5 | « CA-6 (publishedEndpoints verbatim + redacted Chainstack) stays covered by the EXISTING sentinel_never_prints_endpoint_url » : re-pointer vers les tests de F-k | F-10 | non |
| F-n | `apps/sentinel/src/keyless-transport.ts` | 14-16, 19-20 | « the frozen rpc.ts:defaultCall » / « deleted from rpc.ts at the -1d rebase » → passé, avec la référence du pli (NB : édite `sentinel_sha`, M-11) | C-V-4 (texte) | non |
| F-o | `deploy/monark-sentinel.service` | 4-6, 20-25, 30-31, 34-35 | l. 6 « run.ts logs the host only » (la clé n'est lue que par le transport du garde ; `run.ts` publie l'origine NON secrète) ; l. 23-24 « 8 public endpoints », « ninth operator » → 7 / 8ᵉ ; l. 30-31 « ALL three absent => the run degrades » → cycle OU origine absent/vide ⇒ `unconfigured` (`run.ts:285`), floor absent ⇒ 0 (`run.ts:255`) ; l. 34-35 : retirer l'annotation de dérive (corrigée par l'amendement -1d) | C-V-4 (texte) + F-7 | non |
| F-p | harnais `mutants.mjs` (hors dépôt) | — | rejouer les 12 mutants + G2D-4/5/6a/6b/7 (A-11 : TAP, `byIntended`) ; vérifier l'unicité des `find` de `keyless_transport_delisted` et `env_key_read_in_run_ts` après le retrait de l'entrée ; trace Linux SIGTERM + V6 en docker local (décision 136, en-tête A-12) | A-11, A-12 | — |
| F-q | docs | — | ADR-U4b : amendement D4 daté AVANT `0e232519…` / APRÈS' ; ADR-NARABI-OPS-1 : acter la rétractation ; RUNBOOK : re-pointage des l. 187-313 (D-1) | ADR-U4b amendement -1d §3 | non |

- `apps/sentinel/src/run.ts` N'EST PAS touché par le pli §11-1 (golden `45557d6e…` attendu inchangé) : ses imports depuis `rpc.ts` (`run.ts:13` : `makeRpcPool`, `PUBLIC_ENDPOINTS`, `QuorumDisagreementError` ; `:14` types) survivent à la suppression.
- Aucun autre consommateur des exports supprimés : `git grep -n -E "\b(poolEndpoints|publishedEndpoints|hasChainstack|chainstackUrl|defaultCall)\b" 7daf8e5 -- . ':(exclude,glob)docs/**'` → `rpc.ts`, `sentinel-retry.test.ts` (l. 17, 217, 221, 222, 235, 268), des commentaires (`keyless-transport.ts:14/20`, grep test l. 75/109/169, `pool-rpc-1a.test.ts:4`) et des homonymes sans rapport (`ukemi.test.ts:51/160` = l'ancien `defaultCall` de `record.ts` ; `transport.ts:106-108` = variable locale).
- Appelants de `makeRpcPool` : tous injectent `call` SAUF `sentinel-retry.test.ts:229` (`run.ts:329` ; `pool-rpc-1a.test.ts:149` ; `sentinel-catchup-budget.test.ts:253/264/286` ; `sentinel-chainstack-guard.test.ts:136` ; `sentinel-retry.test.ts:229` (SANS) et `:275` ; `sentinel.test.ts:333/345/351/450/461/488/491/507`).

---

## G. Constats nouveaux (à arbitrer par l'orchestrateur ; aucun tranché ici)

- **F-1 — `sentinel-retry.test.ts:229` construit `makeRpcPool` SANS `call`** (repose sur `defaultCall`). Le G1 §11-1 affirmait « vérifié : `sentinel-retry`, `sentinel-catchup-budget`, `sentinel-chainstack-guard` et `run.ts` injectent TOUJOURS `call` » : faux pour ce site. Le test d'erreur (l. 224-241) lie donc aujourd'hui du code mort. Effet : co-édit F-i (forcé de toute façon). `error_origin` proposé : worker G1 (affirmation de vérification).
- **F-2 — L'option (b) contredit la LETTRE de la précondition 6 du prereg committé** (`docs/PLAN-u4b-prereg.md:367`) et de l'ADR-U4b §3 (l. 127-129) : fusionner -1d maintenant tombe dans la fenêtre prereg → clôture. L'objet protégé est intact (9 sha identiques aux 4 commits ; aucun fichier de la fermeture d'imports des scripts de course touché). Non relevé par G2, checkpoint-2 (C-V-0 jugeait (a) et (b) admissibles sans citer la précondition 6), re-checkpoint-2 ni G2-delta. Proposé : D-n au PLI de la course (texte au bloc C §2). Alternative : ordonnancement (a). Décision orchestrateur, AVANT le commit de fusion.
- **F-3 — Déclencheur du pli §11-1** : « clôture de la course U-4b-1b » doit s'entendre APRÈS le hors-ligne §(5e) sous vérification des 9 sha, car la décision 129 dissocie la clôture « données » du hors-ligne, et `u4b-scores`/`u4b-reduce` importent `rpc.ts` via `abi.ts:7`. Précision portée par A.8-1 et C §3.
- **F-4 — Minorant A-4 « essais × 1 RU »** : (i) les lignes de ledger n'ont pas d'horodatage ⇒ fenêtrage par positions épinglées (RUNBOOK §6-bis) ; (ii) H-FACT non établie : le ledger enregistre l'essai AVANT le fetch, sans issue ; un essai jamais parvenu à Chainstack n'est pas facturable. Lecture web (WebFetch, 2026-09-22 ≈ 19:4x UTC, résumé outillé, à relire sur place) de `https://docs.chainstack.com/docs/request-units` : réponse « SILENT on failed/error request billing » ; citation obtenue : « Each request is classified on its own. Full requests are 1 RU and archive requests are 2 RUs » [lu via outil — niveau à confirmer par lecture sur place]. Conséquence : la relâche no-overlap (G1 §11-6) est conditionnée ; item H-FACT (bloc B -1d-E).
- **F-5 — Critères du 1er run (G1 §13)** : un run post-déploiement « nothing due » ne tire en général pas la jambe (0 ligne `attempted`) et les lignes `unlocked` ne portent pas `network` (`cli.ts:39`). « ≥ 1 ligne ledger portant `network` » n'est donc exigible que d'un run PUBLIANT ⇒ critères (a)/(b) séparés (D-1).
- **F-6 — Pose de l'EnvironmentFile** : les `cat >` du RUNBOOK (§4, §6 (5)) réécrivent le fichier ; reposter l'URL seule effacerait les clés de cycle ⇒ `unconfigured` silencieux (visible au seul JSON de fin ; la sonde n'alerte pas `chainstack_present:false`, item A.8-8). D'où une écriture unique à 4 clés (D-1 étape 4) et deux notes en place (D-2).
- **F-7 — Recensement de la dérive « 8 publics / 9ᵉ »** au-delà du G1 (ADR l. 38-39/49/61) : aussi ADR l. 46 et l. 123 (-1c : « 9 × 20 s = 180 s », faux dès la rédaction, `5d177db` postérieur à `5b9bc37`), RUNBOOK l. 5/17/92/199/261, `.service` l. 23-24, messages de `sentinel-retry.test.ts` l. 218/222/266-267. Origine : POOL-RPC-1a `5b9bc37` (décision 106). ADR l. 12 (contexte de l'incident) est historique, pas une dérive.
- **F-8 — RUNBOOK Modes A/B** : références `run.ts:NNN` (l. 187-313) périmées depuis -1c (ne correspondent ni à `c4981d0` ni à `7daf8e5`) — table de correspondance dans D-1 + item formé.
- **F-9 — Renommage de test non tracé** : `ukemi_src_clean_and_allowlist_load_bearing` → `sentinel_src_clean_and_allowlist_load_bearing` ; l'ADR-GARDE-HELIUS (l. 344, 445) et un commentaire du test grep (l. 41) citent l'ancien nom. Tracé au bloc B -1d-D ; co-édit F-e.
- **F-10 — `pool-rpc-1a.test.ts:4-5`** revendique la couverture de CA-6 par `sentinel_never_prints_endpoint_url`, qui lie du code mort depuis `e12f59f` (même famille que C-G2D-1) — co-édit F-m.

---

## H. Vérifications reproductibles (commandes exécutées ; sorties relevées)

```bash
cd F:/Monark   # lecture seule
git rev-parse --short HEAD                 # de30eab (60b54c0 au début de la rédaction)
git status --porcelain | wc -l             # 0
# ancrages
grep -n "assigned at G7" docs/adr/ADR-NARABI-OPS-1.md                                      # 181:assigned at G7.
grep -n "Budget de cycle : sous RETRY_TRIES=6" docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md   # 1025:…
grep -n "l'orchestrateur folde/committe au G7" docs/adr/ADR-U4b-calibration-episode-frais.md       # 712:…
grep -n "^## Déploiement de la sonde (Bell)" docs/RUNBOOK-sentinel.md                           # 327:…
# cibles (blob LF @HEAD) : 0b6e130e… 181 l. | 6fb6da45… 1025 l. | 6863104a… 712 l. | 8a0acac5… 405 l. ; 0 CR ; dernier octet \n
# aucun changement hors docs/ depuis la base du lot
git diff --name-only f6442fe HEAD -- . ':(exclude,glob)docs/**'        # (vide)
git diff --name-only f6442fe 7daf8e5                                     # 8 fichiers (keyless-transport, run, 4 tests, service, grep test)
# 9 sha gelés, 4 commits
for f in scripts/census/u4b/u4b-scores.mjs scripts/census/u4b/u4b-reduce.mjs scripts/record-u4b-calib.mjs \
  apps/sentinel/src/ukemi/wadray.ts apps/sentinel/src/ukemi/abi.ts packages/hikae/src/l1-split.ts apps/sentinel/src/rpc.ts \
  packages/contracts/src/calib-digest.ts scripts/census/u3-realized.mjs; do
  for c in 9e095a0 f6442fe 7daf8e5 HEAD; do git show $c:$f | tr -d '\r' | sha256sum; done; done
#   => EQUAL x9 : 2f9a31f6…f51445c0 | a5e66cd3…57a6fac0 | 5733daeb…1fbc31a3 | 7bee76fc…e4de2322 | 3376eb08…c1ab2d66 |
#                 9206df91…8164ffa3 | 0e232519…c1c65ca0 | 3603265d…94c42380 | cb020425…5b41a1af
# compte d'endpoints (copie du blob rpc.ts @7daf8e5 dans le scratchpad, importée sous env -u des 8 clés, node v24.15.0)
#   => endpoints 7 providers 6 ["publicnode.com","drpc.org","mevblocker.io","1rpc.io","publicnode.com","blxrbdn.com","pocket.network"]
#   => providerOf("chainstack") = "chainstack" ; providerOf("https://ethereum-mainnet.core.chainstack.com") = "chainstack.com"
# datation de la dérive
git log --format='%h %cd' --date=iso-strict --reverse -S "may rotate 9 endpoints x 20 s)" -- docs/RUNBOOK-sentinel.md   # feca317 2026-09-21T14:28:16+01:00
git log --format='%h %cd' --date=iso-strict -1 5d177db ; git log --format='%h %cd' --date=iso-strict -1 5b9bc37          # 13:11:32+01:00 ; 06:54:15+01:00
git merge-base --is-ancestor 5b9bc37 5d177db && echo ancestor                                                          # ancestor
git show 7480f49:apps/sentinel/src/rpc.ts | sed -n '18,22p'      # 8 URLs publiques (llamarpc, blastapi présents) ; 5b9bc37 : 7 URLs + pocket
# traces
diff <(sed 's/\r$//' F:/tmp/nops1d/linux-sigterm-trace.log) <(git show HEAD:docs/traces/narabi-ops-1d/docker-e12f59f-guard-trace.log)   # 24d23 < # todo 0
sed 's/\r$//' F:/tmp/nops1d/linux-sigterm-mutant-V6.log | sha256sum      # d212e62d… == blob docker-e12f59f-mutant-V6.log
sha256sum F:/tmp/nops1d/ci-88-sigterm-trace.log                          # 0ec00434… == blob ci-run-35763895313-e12f59f.extract.log
git hash-object --path=docs/course-narabi/x.log F:/tmp/nops1d/linux-sigterm-trace.log   # == blob du contenu LF (sans -w : rien écrit)
git rev-parse '7daf8e5^{tree}'                                           # 4c946086cf4f379b113ce10fa92150d13ba63e00
awk '/^test\("sentinel_run_releases_chainstack_lock_on_sigterm/{f=1} f{print} f&&/^\}\);/{exit}' \
  <(git show 7daf8e5:apps/sentinel/test/sentinel-chainstack-guard.test.ts) | sha256sum   # 5a1f335e… (idem à e12f59f)
git show --numstat --format= 1d4f385                                      # 7 .log = 78 lignes ; README 14 ; PLI 1
# code (lignes citées)
git show 7daf8e5:apps/sentinel/src/run.ts | sed -n '220p;230,232p;236p;241p;256p;263p;279p;285p;295p;305p;319,321p;324p;327p;329p;350p;367,370p'
git show 7daf8e5:apps/sentinel/test/sentinel-retry.test.ts | sed -n '17p;229p;235p;268p'   # l. 229 : makeRpcPool({ endpoints: [...] }) sans call
git grep -n "makeRpcPool(" 7daf8e5 -- apps test                          # tous injectent call sauf sentinel-retry.test.ts:229
git grep -n -E "from ['\"][^'\"]*(/run|/keyless-transport)(\.ts)?['\"]" 7daf8e5 -- scripts apps packages   # run.ts + tests sentinel seulement
git show 7daf8e5:packages/rpc-guard/src/cli.ts | sed -n '36,42p'          # unlock : openOperatorLedger(…, op, deps.floor) — sans network
git show 7daf8e5:packages/rpc-guard/src/ledger.ts | sed -n '27,42p;128p;134p'   # pas d'horodatage ; prior ; network conditionnel
git show 7daf8e5:packages/rpc-guard/src/client.ts | sed -n '17p;118p'     # Outcome ; refus cycle_cap
git show 7daf8e5:packages/rpc-guard/src/lock.ts | sed -n '25p'            # {pid, iso}
git show f6442fe:test/rpc-guard-fetch-only-inside-client.test.ts | grep -n '^test("ukemi_src'      # 148
git show 7daf8e5:test/rpc-guard-fetch-only-inside-client.test.ts | grep -n '^test("sentinel_src'   # 159
grep -n -E "^### (Décision investisseur 118|Décision investisseur 121)" docs/CHANTIERS.md   # 549 ; 602
grep -n "Hors-ligne (offline, après la course" docs/PLAN-u4b-prereg.md   # 310
grep -n "NE fusionne PAS" docs/PLAN-u4b-prereg.md docs/adr/ADR-U4b-calibration-episode-frais.md      # 367 ; 127
```
Non re-vérifié par moi (cité tel que lu par le re-checkpoint-2 §3 (b)) : l'objet `0f2c2d9` (commit de fusion de PR GitHub, absent du dépôt local : `git cat-file -t 0f2c2d9` → « Not a valid object name ») et le tally 933/932/0/1 du run `35769452047` (hors de l'extrait persisté).

---

## I. Zéro dette — items formés par CE rendu (propriétaire + déclencheur)

1. **F-2 (option (b) vs lettre de la précondition 6)** — arbitrage orchestrateur (D-n du bloc C §2, ou ordonnancement (a)). Déclencheur : ce G7, AVANT le commit de fusion. Demande de consultation formée (canal 2, si l'orchestrateur la route vers l'ADVISOR) : « Problème : la fusion (b) de NARABI-OPS-1d tombe dans la fenêtre prereg → clôture interdite à la lettre par `docs/PLAN-u4b-prereg.md:367` / ADR-U4b §3, alors que les 9 sha gelés et la fermeture d'imports de course sont intacts. Tentatives : recompute des 9 sha à `9e095a0`/`f6442fe`/`7daf8e5`/`de30eab` (égaux) ; `git grep` des importeurs de `run.ts`/`keyless-transport.ts`. Options : (1) D-n consignée au PLI de course ; (2) ordonnancement (a) — fusion après clôture. »
2. **F-3 (déclencheur précis du pli §11-1)** — à acter par l'orchestrateur dans l'item §11-1 (CHANTIERS) ; déclencheur : ce G7.
3. **H-FACT** (bloc B -1d-E) — propriétaire orchestrateur ; déclencheur : avant le premier rapprochement A-4 consommant le ledger VPS, ou le prochain prereg Chainstack voulant relâcher (iii).
4. **Re-pointage des l. 187-313 du RUNBOOK** (F-8) — propriétaire orchestrateur ; déclencheur : prochaine édition du RUNBOOK, au plus tard le 2ᵉ redéploiement.
5. **Remplacements D-2** — propriétaire orchestrateur ; déclencheur : ce G7 (sinon, au plus tard avec F-q du pli §11-1).
6. **Lecture sur place de la page tarifaire Chainstack** (confirmation de F-4, WebFetch = résumé outillé) — propriétaire orchestrateur ; déclencheur : avec l'item H-FACT.
7. **Écart de roster du prompt de cette instance** (`claude-opus-4-8` affiché, `claude-opus-5-5[1m]` résolu) — propriétaire orchestrateur ; déclencheur : prochaine mise à jour des prompts de lancement (décision 133).

## J. Conformité

**R-1** : `claude-opus-5-5[1m]` (préfixe conforme à la décision 133 et à la CONSIGNE A-1 ; écart du prompt signalé, I-7). **R-20** : aucun commit, aucun workflow, aucune écriture dans `F:\Monark`/`F:\Monark-wt-*` ; seul fichier écrit : `F:\tmp\nops1d\ADR-amendements-G7.md` (+ une copie de lecture de `rpc.ts` et un fichier de test de heredoc dans le scratchpad de session). **R-21** : §H. **R-22** : aucun gate suspendu. **R-25** : docs seuls (exclus de `ci.yml:65`, hors `.log`). **P5** : aucun « dû » nu — §A.8, §B -1d-E, §I.
