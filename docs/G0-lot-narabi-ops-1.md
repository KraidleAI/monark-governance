# G0 — Sprint backlog lot NARABI-OPS-1 : retry du sentinel, troisième opérateur RPC, sonde externe
Orchestrateur `claude-fable-5-1`, 2026-09-20. Base : `lot/etude-suite` HEAD ≥ `90b1198`. Branche `lot/narabi-ops-1`, worktree `F:\Monark-wt-narabiops`. Origine : incident ops Narabi 2026-09-20 (CHANTIERS §E) — run 00:44 UTC arrêté sur `no_quorum` (publicnode 403), jour 2026-09-19 en retard de 4 h jusqu'à relance manuelle. Cadre : ADR-M012 D5 (timer quotidien, `Persistent=true`, « un jour manqué est un retard, jamais un saut »), ADR-U1 D3 (quorum = deux opérateurs distincts, `providerOf`), décision 43 (Chainstack ETH provisionné, `CHAINSTACK_ETH_URL`), décision 46 (tout se teste en local avant livraison), ADR-B0 D8 (Bell : sonde externe, latence de publication publiée). Régime site : **T0** (aucune surface publique ; `fleet.ts`, README, site intacts). Isolation : `apps/sentinel/src/{rpc,run}.ts` + tests, `deploy/monark-sentinel.{service,timer}`, `scripts/probe-*.mjs`, `docs/RUNBOOK-sentinel.md` — aucun fichier partagé avec U-3 (`fixtures/ukemi/u3`, `scripts/census`) ni Bell (`apps/bell`) ; **un lot `apps/harness` = non concerné**.

## Objectif (une phrase)
Qu'un incident RPC transitoire ne coûte plus une journée d'affichage à Narabi : le run réessaie dans la journée, un opérateur payé (Chainstack) entre dans le quorum, et une sonde indépendante du VPS constate « dernière ligne = J−1 » chaque matin — le tout rejoué en local avant tout déploiement, et hérité par le sentinel Bell.

## Faits mesurés (2026-09-20, VPS `31.97.155.188`, journal systemd)
1. Run 00:44:27 UTC : `stopped: "fetch_error:2026-09-19:supplyAt: quorum needs >= 2 live endpoints from 2 providers (last: HTTP 403 https://ethereum.publicnode.com)"`, `lag: 1`, `processedDays: []` — **et exit status 0** (« Deactivated successfully »). Conséquence : `Restart=on-failure` n'aurait **pas** déclenché ; le retry exige un code de sortie non nul quand `lag > 0` et `stopped != null`.
2. Relance manuelle 04:58 UTC : ligne 2026-09-19 écrite, T = 2, lag 0 ; données identiques (bloc archive), seul le retard change.
3. Pool actuel `rpc.ts:20-22` : 8 endpoints gratuits, 7 opérateurs (`providerOf` fusionne les deux publicnode) ; le service tourne sous l'utilisateur `sentinel`, sans variable d'environnement de clé.

## Livrables (liste fermée)
| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| L-1 | `apps/sentinel/src/run.ts` | code de sortie **1** si `stopped != null && lag > 0` (le run a été empêché de rattraper), **0** sinon (à jour, ou en attente de finalité — `stopped == null`) ; message inchangé ; le JSON de fin porte `exit_code` | `sentinel_run_exits_nonzero_when_lagging_on_fetch_error` (run offline avec fetch stubbé 403 ⇒ exit 1) ; mutant : exit 0 forcé ⇒ rouge |
| L-2 | `deploy/monark-sentinel.timer`, `deploy/monark-sentinel.service` | timer : `OnCalendar=*-*-* 00:30,03:30,06:30,09:30 UTC` (quatre créneaux ; les runs suivants sont des no-op « nothing due » quand la ligne est écrite — idempotence prouvée par L-4) ; service : `Restart=no` (oneshot ; le retry est porté par le timer, pas par systemd, pour rester lisible dans le journal) ; `EnvironmentFile=-/etc/monark/sentinel.env` (fichier `root:sentinel 0640`, **absent du dépôt**, contient `CHAINSTACK_ETH_URL`), commentaire de provenance | `ci-gates` : test `sentinel_timer_has_retry_slots` (les 4 `OnCalendar` présents ; mutant : un seul créneau ⇒ rouge) ; `sentinel_service_reads_env_file` |
| L-3 | `apps/sentinel/src/rpc.ts` | pool = 8 gratuits **+ `process.env.CHAINSTACK_ETH_URL` si défini** (opérateur `chainstack.com`, `providerOf` étendu : `*.chainstack.com` et `*.p2pify.com` = un opérateur, calque `apps/bell/src/operators.ts`) ; **jamais imprimé** : toute erreur portant l'URL est réduite à `HTTP <status> <hostname>` (calque C-10 Bell) ; quorum inchangé (2 opérateurs distincts, fail-closed) ; ordre : Chainstack en tête du round-robin (fiable), gratuits ensuite | `sentinel_quorum_accepts_chainstack_as_distinct_operator` ; `sentinel_never_prints_endpoint_url` (mutant : message brut ⇒ rouge) ; `no_secret_in_repo` vert |
| L-4 | `apps/sentinel/test/sentinel-retry.test.ts` | rejeu **local** de la journée du 2026-09-20 : run 1 (fetch stubbé : publicnode 403, autres 503 ⇒ `no_quorum`, exit 1, 0 ligne) → run 2 (fetch stubbé sain) ⇒ ligne 2026-09-19 écrite, T = 2, chaîne intacte, digest = celui publié (`ec4ce67e…` line_hash de 09-18 comme `prev`) → run 3 ⇒ « nothing due », exit 0, 0 ligne (idempotence) | ce test EST l'oracle de décision 46 (test local avant livraison) ; mutant : run 3 réécrit une ligne ⇒ rouge |
| L-5 | `scripts/probe-narabi.mjs` (+ `deploy/monark-probe.timer/.service` **pour le VPS Bell**, hôte distinct = sonde externe) | GET `https://monarkgate.tech/narabi/timeline.jsonl`, vérifie : dernière `day` = J−1 UTC (après 10:00 UTC), chaîne `prev_line_hash` continue, `line_hash` recomputé sur la dernière ligne ; sortie JSON `{ok, last_day, lag_days, checked_at}` écrite dans `/var/lib/monark-probe/narabi.json` + exit 1 si `lag_days > 0` ; **alerte** = item formé (canal à choisir par l'investisseur : mail, Discord webhook, ou simple page `/status`) ; latence de publication (`checked_at − 00:30 UTC`) conservée comme fait | `probe_narabi_detects_lag` (fixture : timeline à J−2 ⇒ exit 1 ; à J−1 ⇒ exit 0 ; mutant : recompute du `line_hash` sauté ⇒ rouge sur fixture altérée) |
| L-6 | `docs/RUNBOOK-sentinel.md` (+ section « sonde »), `docs/adr/ADR-NARABI-OPS-1.md` | procédure : déploiement du timer 4 créneaux, `EnvironmentFile` posé **par l'orchestrateur depuis sa variable d'environnement sans l'afficher** (`ssh … "umask 077; cat > /etc/monark/sentinel.env"` alimenté par `printf` local), vérification par longueur ; sonde sur le VPS Bell ; **tuyaux** : timer → run → timeline (existant) ; env → rpc.ts (nouveau, état = fichier hors dépôt) ; timeline publiée → sonde → `narabi.json` (nouveau, état = VPS Bell) → alerte (item formé) ; héritage Bell (T-1b) déclaré | doc ; lang-gate (anglais dans `deploy/`, `scripts/`) |

## Critères d'acceptation
1. `npm run ci` = base (421) + ≥ 6 tests ; `gate:vocab` (§F) ; lint 0 ; ratchet 69/69 ; lang-gate 0 ; export:check 0 ; `no_secret_in_repo` vert.
2. Mutants ≥ 6 rouges, restauration sha-exacte.
3. **Rejeu local complet de l'incident (L-4) vert** avant tout déploiement ; le déploiement lui-même (VPS site + VPS Bell) est **hors lot**, exécuté par l'orchestrateur après fusion, consigné en JOURNAL avec la sortie du premier run de chaque timer.
4. R-25 ≤ 500 (cible ; plafond 1 205) sous la pathspec UNION.
5. CA-11 : aucun composant nouveau déclaré built ; la sonde est un outil d'exploitation (non registre) ; `fleet.ts` intact.
6. Aucune URL/clé dans le dépôt ni dans un message d'erreur (test L-3).

## Hors périmètre
Alerte (canal) ; page `/status` ; Bell (`apps/bell`) ; harness.

## Tuyaux (ADR-M018 D3)
Voir L-6. Sonde : entrée = timeline publiée ; sortie = `narabi.json` sur le VPS Bell ; consommateur = alerte (item formé) ; état `upcoming` jusqu'à l'alerte.

## Risques (MAST)
Retry qui réécrit une ligne (contre-mesure : L-4 idempotence) ; clé Chainstack dans un log (L-3) ; sonde sur le même hôte que le sentinel (interdit : VPS Bell) ; `Restart=on-failure` sur un oneshot à exit 0 (L-1 corrige la cause) ; timer à 4 créneaux ⇒ 4 lectures RPC par jour (coût : 3 no-op = 2 appels `finalized` chacun, négligeable).

## Rôles
Checkpoint-1 validateur avant tout code. Worker Opus 4.8 max (G1, offline, fetch stubbé) → G2 fraîche → checkpoint-2 → G7 → fusion → déploiement orchestrateur (JOURNAL).

---
## Amendement checkpoint-1 (2026-09-20, validateur `claude-fable-5-1`, APPROUVÉ-AVEC-CORRECTIONS C-1..C-11 — `docs/CHECKPOINT1-lot-narabi-ops-1.md`, pliées ici, font foi)
- **C-1 (bloquant, secret)** : `run.ts:160` publie `prov.endpoints` verbatim dans chaque ligne servie sur monarkgate.tech (`narabi-snapshot.ts:23`) ⇒ avec Chainstack dans le pool, **la clé serait publiée sur le site**. Règle : `endpoints` publié sous forme **expurgée** (hôte seul, jamais chemin/query ; `PUBLIC_ENDPOINTS` gratuits inchangés) ; `sentinel_never_prints_endpoint_url` asserte sur **l'erreur, la ligne écrite et stdout** ; mutant URL brute dans la ligne ⇒ rouge.
- **C-2** : syntaxe `OnCalendar=*-*-* 00:30,03:30,06:30,09:30 UTC` **invalide** ⇒ quatre lignes `OnCalendar=` (ou `*-*-* 00,03,06,09:30:00 UTC`) ; `systemd-analyze calendar` dans le runbook ; le test compte 4 expressions. `Persistent=true` ⇒ un seul run au reboot.
- **C-3** : `providerOf` **byte-identique** (importé sous contrat par Bell `operators.ts`/`quorum.ts` et `ukemi/rpc2.ts`, hors isolation) ; pas de fusion p2pify (une seule URL Chainstack) ; « Chainstack en tête » retiré (`quorumTwo` fait tourner `rr`) — texte : « troisième opérateur distinct dans la rotation ».
- **C-4** : URL Chainstack lue dans `main()` (ou `poolEndpoints(env)` appliqué seulement quand `opts.endpoints` est absent) ; le JSON de fin porte `chainstack: boolean`.
- **C-5** : `EnvironmentFile=-` conservé (une unité qui ne démarre plus ne publie rien, sans alerte à ce jour) + `systemctl show -p EnvironmentFiles` au runbook ; commentaires « no key » (`monark-sentinel.service` l.4, `no-secret-in-repo.test.ts` l.4) mis à jour.
- **C-6 (test du code de sortie)** : mécanisme nommé — sous-processus `node --import <stub fetch> run.ts` (ou CLI exportée) ; stub **méthode-conscient** (seul `eth_call` échoue ; `finalized()` doit réussir, sinon FATAL pré-existant sans exercer L-1) ; trois cas : `no_quorum` ⇒ exit 1 / 0 ligne ; rattrapage partiel ⇒ **1 ligne écrite ET exit 1** ; `due = []` ⇒ exit 0 ; `--dry-run` déclaré.
- **C-7 (fixture)** : la ligne 2026-09-19 est absente du dépôt (snapshot arrêté à 09-18) ⇒ fixture `apps/sentinel/test/fixtures/narabi-timeline-2026-09-19.jsonl` (3 lignes, `curl` du site) + PROVENANCE sha256 ; oracle L-4 = tous les champs hachés + `line_hash` de la ligne 3 ; bruts non nécessaires (`attest`/`step` purs, stub dérivé de la ligne publiée).
- **C-8 (sonde)** : `line_hash` **non importable** sur le VPS Bell (`@monark/sentinel` privé, `timeline.ts` importe hikae/harness) ⇒ la sonde n'utilise que des built-ins Node et **duplique l'ordre des 31 champs hachés** ; test `probe_line_hash_equals_sentinel_lineHashOf` sur les lignes committées ; créneau ≥ **10:30 UTC** (jitter du dernier créneau) ; utilisateur dédié + `ReadWritePaths` ; registre `upcoming`.
- **C-9** : MAST + « secret dans la provenance publiée », « dérive de l'ordre de hash dupliqué ».
- **C-10** : `ADR-NARABI-OPS-1` amende ADR-M012 D5 (« sans clé ») par référence datée ; sémantique des codes de sortie ; table des tuyaux avec déclencheurs.
- **C-11** : R-25 mesuré à mi-G1 ; si > 500, L-5 (sonde) devient le pli `NARABI-OPS-1b`.
- Relayé à l'investisseur (non bloquant) : canal d'alerte de la sonde (déclencheur `upcoming → built`) ; pose du secret par l'orchestrateur via stdin SSH, vérifiée par `sha256sum` des deux côtés, jamais `cat` distant.
