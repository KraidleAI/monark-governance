claude-opus-5-5

# G1 DOJO-LIVE-HEALTH-1 (lot PR-4c-1c) — journal (worker G1, modèle résolu `claude-opus-5-5`, effort max, 2026-10-07)

Mission reçue par message de l'orchestrateur (aucun fichier de mission), lue à 02:42 UTC (`now.mjs` : `2026-10-07T02:42:37Z`).
Worktree `F:/Monark-wt-dojo-health`, branche `monark/dojo-live-health-1`, HEAD = base `b9d327a4` (tronc), arbre propre à
l'ouverture. Livré : construit et testé, NON déployé (aucun SSH, aucun acte d'hôte, aucun commit, aucun workflow).

## 1. Lecture (sur pièce, avant toute écriture)

- `docs/adr/ADR-DOJO-PR-4.md` (sha256 `90487259…0858`) : PL-3 l.308-311 (forme, lieu, déclencheur), D-P8 l.280, PL-1 l.289
  (périmètre fermé de PR-4c-1c et ses trois tests nommés), PL-2 l.305 (DOJO-EDGE-CACHE-1 : `DYNAMIC` ou `BYPASS`, jamais `HIT`,
  « puis chaque jour par la sonde »), PL-4 l.319 et l.328 (DOJO-LIVE-HEALTH-1, DOJO-PROBE-VANTAGE-1), PL-5 l.336 (M-H1 à M-H8),
  l.292 (tuyau TU-8H), l.266 (rotation : repli jusqu'à la synchro suivante).
- Modèle : `scripts/probe-narabi.mjs` (`15da93f2…19c2`, égal au fichier déployé sur Bell, `docs/RUNBOOK-sentinel.md` ligne datée du
  2026-10-04), son `.d.mts`, `test/probe-narabi.test.ts` (l.181-195, l.430-468 : épingles d'unité), `deploy/monark-probe.service`
  (`985f8381…`) et `.timer` (`39335a1e…`) ; `deploy/monark-dojo-publish.service` (`d7f679d0…`) et `.timer` (`81e89324…`).
- Vérificateur : `apps/dojo/scripts/dojo-verify-cli.mjs` (`73195ecd…`, `urlSource` l.24-55, `replayOf` l.102-105) et
  `dojo-verify.mjs` (`e52271fa…`, `VERIFY_BOUNDS` l.44-45, `DOJO_VERIFY_REPORT_KEYS` l.37-38) ; enfant de la CA :
  `scripts/verify-dojo.mjs` l.31-38 et l.76-80 (`DOJO_CA_CHILD_ENV`, `DOJO_CA_TIMEOUT_MS`).
- DOJO-VERIFY-SCALE-1 : `docs/G1-lot-dojo-pr3b2a.md` l.318-356 et la ligne datée de `docs/adr/ADR-DOJO-PR-3.md` l.667 ; source
  primaire relue [lu] : `F:/tmp/methode/pr3b2/scale/results.jsonl` (sha256 `a0da0051…7443`, égal à la citation du journal) : la
  CLI `--url` à (N = 1 144, D = 365) : `user_cpu_ms` 585 328 + `system_cpu_ms` 1 609 = 586,9 s de CPU, 587,4 s écoulées, RSS 241 Mo ;
  à (10 000, 30) : 509,2 s de CPU, RSS 361 Mo ; machine de l'orchestrateur (facteur de l'hôte inconnu).
- `docs/RUNBOOK-dojo.md` (sections 10, 12, 14, 15 (0)-(1), 17, 20, 23, 24, Never), `docs/RUNBOOK-sentinel.md` l.601-688,
  `docs/RUNBOOK-bell.md` l.82, l.87-90 et l.578-584 (contrôle 12 de la CA de Bell : `probe.env` et `/opt/monark-probe` ;
  PROBE-SIM-UNIT-1), `docs/dojo/FAITS-webcrypto-ed25519-edge-cache-2026-09-30.md` C-1 à C-3, `docs/ETAT.md` l.112-113 et
  l.1491-1493, `docs/PAROXYSME-Dojo.md` l.95-98, l.310-317, l.340-349 ; inventaire
  `F:/PRODUITS/paroxysme-2026-10-06/inventaire/INVENTAIRE-Dojo.md` lignes DJ-L42, DJ-L110, N-04 (lecture seule) ; journal privé
  `F:/PRODUITS/dojo-mirror/JOURNAL-mise-en-service-2026-10-01.md` 2026-10-03 04:17 (DOJO-EDGE-CACHE-1 constaté : aucun bord).

## 2. Ce qui change (sha256 et lignes des fichiers livrés)

| Fichier | sha256 | Lignes |
|---|---|---|
| `scripts/probe-dojo-live.mjs` (neuf) | `cfed283bdf47dceb0d2cb6d4c9be5967c768ce9269fcc300cd87826e34335c64` | 311 |
| `scripts/probe-dojo-live.d.mts` (neuf) | `ec35f5adadbc004577fc136ce40df90d3a9fff96989293fa519813385ee66144` | 65 |
| `deploy/monark-dojo-probe.service` (neuf) | `b777304894b265c6cd83c9666967b373509ab64762c92389dc5e35f92126b992` | 39 |
| `deploy/monark-dojo-probe.timer` (neuf) | `c7a96751ae1337dd59ba4240c2d77c7fa981ec92896d13cd1a509e7aaff6567e` | 25 |
| `test/probe-dojo-live.test.ts` (neuf) | `1a13d4db0c712dfeee989349ae49c9c76f1bd4afcf88888c97d683ae6c8aeb85` | 421 |
| `docs/RUNBOOK-dojo.md` (section 25 neuve ; une phrase en 20 et en 23 ; une ligne au Never) | `ce90124297123384fe33f1d9a4e5c5b81584334f8443cb9f084ecd9931e73581` | 1 546 (+137, −2) |
| `scripts/dojo-deploy.mjs` (commentaire l.45-46 amendé sur place, Q-1 ; 62 lignes avant et après) | `cd036ebe645fff3f21c00edaaf42f20a6b8e4a4e24871a60eb93c6c099e24fd9` | 62 (+2, −2) |

- **La sonde** : une course = cinq étapes dans l'ordre, la première faute est la raison (en-tête l.5-23) : (1) transport des deux
  bases avant tout GET (`urlTransportAllowed` importé de `probe-narabi.mjs` : `insecure_url`, `bad_port`) et refus de
  `NODE_TLS_REJECT_UNAUTHORIZED=0` (calque de T-9 du vérificateur) ; (2) le cœur : `timeline.jsonl` lu de l'hôte puis par le
  mandataire, égaux à l'octet (sha256 et longueur), puis `lines/<lines_sha256 de la tête>.jsonl` de même ; tête = dernière ligne
  `snapshot` de la chronologie de l'hôte, lue ligne à ligne au fil du flux (une ligne en mémoire, borne `MAX_LINE_BYTES`) ; une
  différence attend `REREAD_DELAY_MS` (1 500 ms, motif `narabi-live.ts` l.256) et relit les deux une fois, seule la seconde lecture
  est jugée ; chaque GET borné par `VERIFY_BOUNDS` importé (un minuteur par GET sur en-têtes et corps, corps et totaux comptés,
  `redirect: "manual"`, 200 seul, règle de rejeu `replayOf` recopiée) ; (3) en-têtes du mandataire sur les deux fichiers :
  `Cache-Control` porte `no-store`, `cf-cache-status` absent, `DYNAMIC` ou `BYPASS`, valeur consignée ; (4) le vrai vérificateur,
  `node --max-old-space-size=448 <dojo-verify-cli.mjs> --url <hôte> --keyring <trousseau de l'arbre>`, enfant à environnement
  fermé (`VERIFIER_ENV`, égal à `DOJO_CA_CHILD_ENV` : jamais `SMTP_PASS`), tué à `VERIFIER_TIMEOUT_MS` ; sa ligne lue (rapport de
  succès aux clés `DOJO_VERIFY_REPORT_KEYS`, trousseau fourni, `detail` nul), son `timeline_sha256` égal à celui de l'hôte lu au
  cœur ; (5) fraîcheur : jour de la tête ≥ jour dû à `DEADLINE_UTC` (07:30). Quinze raisons fermées (`DOJO_LIVE_REASONS`), vingt
  clés fermées (`DOJO_LIVE_KEYS`) ; `/var/lib/monark-probe/dojo-live.json` écrit atomiquement ; courriel par `sendSmtp` importé
  (même `/etc/monark/probe.env`) sous l'automate anti-tempête de `probe-narabi.mjs` ; sortie 0 sain, 1 malsain ou courriel en échec,
  2 erreur d'usage (rien d'écrit).
- **Arbre de la sonde** (`DOJO_PROBE_TREE_PATHS`, 8 fichiers, `/opt/monark-dojo-probe`) : fermeture statique de la sonde et de la CLI
  du vérificateur (`bell-chain.mjs`, `dojo-chain.mjs`, `dojo-core.mjs`, `dojo-verify.mjs`, `dojo-verify-cli.mjs`,
  `probe-narabi.mjs`, la sonde) plus le trousseau committé ; les chemins par défaut du vérificateur et du trousseau sont relatifs à
  la sonde, donc les mêmes dans le dépôt et dans l'arbre.
- **Unités** : `monark-dojo-probe.service` (calque de `monark-probe` : utilisateur `probe`, `ProtectSystem=strict`, écriture sous
  `/var/lib/monark-probe` seule, `EnvironmentFile` requis ; plus `UnsetEnvironment` de l'unité de publication, FAITS-SYSTEMD-PUBLISH-1
  F-2) ; `monark-dojo-probe.timer` à 07:30, 09:30, 13:30 UTC, `AccuracySec=1s`, `RandomizedDelaySec=0`, `Persistent=true`.

## 3. Dimensionnement et calendrier (DOJO-VERIFY-SCALE-1 ; PL-3 « Lieu »)

- **Délai du vérificateur** : 586,9 s de CPU (pire CLI mesurée, [lu] ci-dessus) × 4 (`CPUQuota=25%` de l'unité, sémantique de la
  ligne datée) × 1,25, arrondi à la centaine supérieure : `VERIFIER_TIMEOUT_MS` = 3 000 000. Domaine couvert, celui de la ligne
  datée : N ≤ 10 000 à D ≤ 30 et N ≤ 1 144 à D ≤ 365.
- **`TimeoutStartSec=3300`** : pire cas d'une course = 8 GET (deux fichiers, deux côtés, une relecture) × 30 s + 2 × 1,5 s + 3 000 s +
  30 s (échéance unique du courriel, `MAX_SMTP_DEADLINE_MS`) + 10 s de marge = 3 283 s, strictement sous 3 300 (épinglé par
  `dojo_probe_units_are_hardened` depuis les constantes exportées).
- **`MemoryMax=640M`** : l'enveloppe de la sonde (`monark-probe`, 128M) plus celle de son enfant vérificateur (l'unité de
  publication, 512M, tas 448 Mio) ; mesuré : crête du processus sonde au passage réel ci-dessous 77 532 Kio (Windows, ensemble de
  travail) ; crêtes de la CLI mesurées 241 et 361 Mo (sans plafond de tas : le plafond de 448 Mio n'a pas été mesuré sur la CLI ; s'il
  mordait, l'enfant sortirait en erreur, raison `verifier_refused`, jamais un vert).
- **Échéance** : dernier créneau de publication 06:30 + `TimeoutStartSec` 2 900 s + 1 s = 07:18:21 ; `DEADLINE_UTC` = 07:30 ; avant
  07:30 le jour dû est l'avant-veille, à partir de 07:30 la veille (motif `expectedLastDay`). Tirs 07:30, 09:30, 13:30 (échéance,
  +2 h, +6 h, forme de `monark-probe.timer`) : chaque course (≤ 3 301 s) tombe hors de toute course de publication (créneaux
  00:30 à 06:30 et leurs 2 900 s) et hors des courses de `monark-probe` (10:30, 12:30, 16:30, ≤ 120 s) : un seul travail lourd à la
  fois sur les 2 vCPU. Tout est lu des unités par `dojo_probe_timer_follows_the_publish_deadline`, jamais tapé.

## 4. Tests et preuves (commandes, sorties)

- `node --test test/probe-dojo-live.test.ts` : 11/11 verts (≈ 6 s). Tests : les trois nommés par PL-1
  (`dojo_live_probe_compares_proxy_and_host`, `dojo_live_probe_runs_the_real_verifier`, `dojo_probe_timer_follows_the_publish_deadline`)
  et `dojo_live_probe_rereads_a_publication_race`, `dojo_live_probe_reads_the_proxy_headers`, `dojo_live_probe_reads_the_verifier_report`,
  `dojo_live_probe_names_each_transport_refusal`, `dojo_live_probe_mails_on_the_transition`, `dojo_live_probe_cli_contract`,
  `dojo_probe_units_are_hardened`, `dojo_probe_tree_is_the_import_closure`. Serveurs de boucle locale par `test/helpers/loopback.ts`,
  arbre signé à l'exécution (`dojoFixture`, `dojoSpreadFixture` pour la rotation), vrai vérificateur ; faux SMTP de boucle locale.
- Mutants M-H1 à M-H8 de PL-5, chacun tué : M-H1 (l.161), M-H2 (l.162), M-H3 (l.68), M-H4, M-H5 (l.190), M-H6 (l.191), M-H7 (l.220),
  M-H8 (l.256) ; les onze tueurs déclarés plus 24 mutations à la main (dont M-H4, secret passé à l'enfant, échéance avant la fin de
  publication, grille décalée, lignes et corps non bornés, redirection suivie, rappel le même jour, aucun courriel de reprise, bit
  levé sans livraison, rapport du trousseau servi, enfant jamais tué, unité sous `root`, fichier d'env optionnel, tir dans une
  course de publication, délai aléatoire, simulation sur l'enregistrement de production) : 24/24 tuées par assertion, fichier
  restauré (sha256 égal), dans un clone `git clone --shared` sous `F:/tmp/dojo-live-health/` (sorties `killers-final.jsonl`
  `199fbe4a…8bd`, `extras-final.jsonl` `af01c276…49d5`).
- **Preuve rouge** : `node scripts/red-proof.mjs --base b9d327a4 --gel F:/Monark-wt-dojo-health --repo F:/Monark --out
  F:/tmp/dojo-live-health/red-proof --draw 11 --seed 20261007` : exit 0, `red-proof OK: 11 judged, 0 unchanged, 11 killer(s) drawn`
  (11 `new-module` à la base : le module ajouté manque ; 11 tueurs tués) ; `RED-PROOF.json` sha256 `efd145dd…7000`, journal
  `15bad891…16c2e5`. Témoin à la main : le fichier de test seul sur la base, `ERR_MODULE_NOT_FOUND` de
  `scripts/probe-dojo-live.mjs` (TAP `ccc82b75…1fae`).
- `npx tsc --noEmit` : exit 0. `npx eslint test/probe-dojo-live.test.ts` : exit 0, 0 erreur (le `.mjs` et le `.d.mts` sont ignorés
  par `eslint.config.mjs`). `node scripts/lint-ratchet.mjs` : exit 0, 69/69. `node scripts/grep-forbidden.mjs` : exit 0.
  `node scripts/lang-gate.mjs` : exit 0. `node scripts/export-public.mjs --check` : exit 0.
- `node --test test/ci-gates.test.ts test/loopback-guard.test.ts test/loopback.test.ts` : 56/56 (la garde de boucle locale lit le
  fichier neuf). `test/probe-narabi.test.ts test/probe-narabi-state.test.ts` : 60/60 (fichiers inchangés).
  `test/probe-dojo-live.test.ts test/dojo-publish-deploy.test.ts test/dojo-collect-deploy.test.ts test/verify-dojo.test.ts` : 39/39
  (les tests qui lisent le RUNBOOK restent verts).
- **R-25, forme CI** (pathspecs de `ci.yml` l.100 et l.104, dans un clone `--shared`, `git add -A` puis `git diff --cached --shortstat
  b9d327a4`) : code 865 lignes (6 fichiers, 863 insertions, 2 suppressions ; 861 avant le pli de §9) ≤ 1 205 ; contenu 0 ≤ 8 000 ;
  le RUNBOOK et ce journal sont exclus (`docs/**/*.md`).
- **Passage réel en lecture seule** (03:29:39Z, depuis cette machine, GET seuls, sans configuration de courriel, `--out` sous
  `F:/tmp/dojo-live-health/smoke/`) : exit 0 en 7,8 s ; verdict `{"status":"healthy","reason":null,"side":null,"reread":false,
  "head_seq":8,"head_day":"2026-10-06","expected_day":"2026-10-05","lag_days":-1,"no_store":true,"cf_cache_status_timeline":null,
  "cf_cache_status_lines":null,"verifier_exit":0,"verifier_reason":null,"alerted":false,"alert_error":null}` ; enregistrement imprimé
  égal à l'écrit (sha256 `834c515c…b2be`) ; 0 adresse IPv4 dans les sorties. Octets de la sonde à ce passage : `998de41f…95f3`
  (le fichier livré n'en diffère que par le commentaire de la l.69).

## 5. Écarts à PL-3 (déclarés)

- **É-1, sortie** : PL-3 dit « sortie 1 ssi malsain » ; la sonde sort aussi 1 sur un courriel en échec (`alert_error`), calque du
  contrat de `probe-narabi.mjs` (en-tête l.9-12) : un envoi raté reste visible de systemd.
- **É-2, `cf-cache-status`** : PL-3 dit « jamais `HIT` » ; l'ensemble admis est celui de l'acte (PL-2 l.305, FAITS l.25) : absent,
  `DYNAMIC`, `BYPASS` ; `MISS`, `EXPIRED`, `STALE` et toute autre valeur rougissent aussi (plus strict, aucun bord aujourd'hui).
- **É-3, arbre sur l'hôte** : PL-3 ne fixe pas le lieu de l'arbre ; il vit dans `/opt/monark-dojo-probe`, hors de `/opt/monark-probe`
  que le contrôle 12 de la CA de Bell et `c10` hachent (`docs/RUNBOOK-bell.md` l.87-90) ; la CLI du vérificateur tourne donc sur
  l'hôte (PL-3 (ii)). Le commentaire de `scripts/dojo-deploy.mjs` l.45-46, qui disait « never on the host », est amendé sur place
  (Q-1 = oui, §9) : « … The verifier's CLI runs on the operator machine (A-8, CA-0, CA-1) and, for the daily probe of PR-4c-1c, on Bell
  from its own tree (DOJO_PROBE_TREE_PATHS), never from this one. »
- **É-4, unité** : `UnsetEnvironment` ajouté (liste de l'unité de publication) ; `MemoryMax` et `TimeoutStartSec` dimensionnés en §3,
  non recopiés de `monark-probe` (128M, 120 s).
- **É-5, relecture** : pas de relecture entre le cœur et le vérificateur ; une publication entre les deux donne
  `verifier_timeline_differs` pour cette course seule (jamais un vert sur deux arbres) ; le calendrier l'exclut hors d'un rattrapage
  au démarrage (`Persistent=true`) ou d'un acte manuel.
- **É-6, RUNBOOK** : section 25 dans `docs/RUNBOOK-dojo.md`, comme PL-1 l.289 ; `docs/RUNBOOK-sentinel.md` (déploiement de la sonde
  Narabi) inchangé.
- **É-7, vocabulaire** : les cinq fichiers neufs ne sont dans aucune portée de `vocab-banned.json` (`grep-forbidden` lit 348 fichiers
  avant et après le lot ; la sonde Narabi y est listée par une ligne d'ADR dans `scan.sentinel.files`). **Décision de MONARK
  (2026-10-07 03:4x UTC, Q-2 = non)** : aucune portée et aucune ligne d'ADR ; le courriel de la sonde est un message privé à
  l'opérateur, pas un texte public, et `dojo_live_probe_mails_on_the_transition` l'éprouve déjà contre les motifs globaux et
  `sentinel` de `vocab-banned.json` et la liste propre au courriel.

## 6. Items (registre PAROXYSME) et recherche due à ce G1

- **DOJO-PROBE-VANTAGE-1** (PL-4 l.328, déclencheur « G1 de PR-4c-1c », propriétaire orchestrateur ; DJ-L111, TY-13) — recherche de
  solution, formée ici : la sonde et les fichiers servis partagent Bell ; une panne de Bell, ou une sonde morte, se tait.
  (a) **Sonde miroir sur le VPS du site** (calque de la décision 57 inversée) : même arbre, mêmes unités, son propre `probe.env` ;
  prix : les actes (1) à (5) de la section 25 sur cet hôte, aucune ligne de code (les bases sont des drapeaux, les unités les mêmes),
  la charge d'un vérificateur par tir sur ce VPS (capacité non mesurée ici : règle des 80 % de (7) à l'acte) ; couvre Bell en panne
  et une des deux sondes morte (l'autre continue de veiller sur la page). (b) Battement de cœur chez un tiers : dépendance et coût
  neufs, non chiffrés (procurement si retenu). (c) Surveillance croisée des enregistrements : exige de servir `dojo-live.json`
  (surface neuve). Recommandation : (a). **Décision de MONARK (2026-10-07 03:4x UTC, Q-3) : (a)**, portée par l'item suivant.
- **DOJO-PROBE-MIRROR-1** (neuf ; porteur MONARK) — la sonde miroir sur le VPS du site, option (a) de DOJO-PROBE-VANTAGE-1 : le même
  arbre (`DOJO_PROBE_TREE_PATHS`) et les mêmes unités, son propre `probe.env`, déployés par les actes (1) à (5) de la section 25 du
  RUNBOOK sur cet hôte ; prix : aucune ligne de code, les actes, et la charge d'un vérificateur par tir sur ce VPS. **Déclencheur :
  avant le jour de l'annonce, après la mesure de sa charge sur ce VPS à l'acte** (durée d'une course simulée sous 80 % de
  `TimeoutStartSec`, règle de la section 25 (7) ; sinon STOP et DOJO-VERIFY-SCALE-1). Une fois en service, la panne de Bell et la mort
  d'une des deux sondes ne taisent plus la santé de la page (DJ-L111, TY-13).
- **Facteur de l'hôte** (DOJO-VERIFY-SCALE-1, existant) : mesuré à l'acte, règle des 80 % de `TimeoutStartSec` au RUNBOOK 25 (7).
- **Au-delà du domaine couvert** : DOJO-VERIFY-SCALE-1 et DOJO-PUBLISH-SCALE-1 (existants, DJ-L104) ; un dépassement donne
  `verifier_timeout` (fausse alarme, jamais un vert).
- **DOJO-VERIFY-URL-IDLE-MEASURE-1** (existant, DJ-L103) : la sonde s'appuie sur le rejeu unique de la CLI ; la mesure reste due.
- **Registre** (consigne pour l'orchestrateur, hors périmètre) : DJ-L42 et DJ-L110 : construction livrée (code et tests, TU-8H composé
  en test), servie à l'acte de la section 25 ; N-04 : le filet intérimaire reste dû jusqu'à l'activation du minuteur ; DJ-L111 :
  recherche formée ci-dessus. Registre `hold-snapshot` inchangé.

## 7. Questions à MONARK (tranchées le 2026-10-07 à 03:4x UTC ; §9)

- **Q-1** (amender le commentaire de `scripts/dojo-deploy.mjs` l.45-46, « never on the host ») : **oui**, sur place, sans ligne
  ajoutée ni retirée ; fait (É-3, §9).
- **Q-2** (une portée de `vocab-banned.json` pour les fichiers neufs) : **non**, aucune ligne d'ADR (É-7).
- **Q-3** (quand la sonde miroir) : **option (a), avant le jour de l'annonce, après la mesure de sa charge à l'acte** ; item
  DOJO-PROBE-MIRROR-1 (§6).

## 8. Provenance

Worker `claude-opus-5-5` (R-1), effort max ; heures par `node F:/claude-config/skills/monark-atelier/bin/now.mjs` (02:42 ouverture,
03:29 passage réel, 03:36 rédaction, 03:40 réception des décisions de MONARK, 03:44 pli de §9). `git` en lecture dans le worktree ;
écritures : les sept fichiers ci-dessus et ce journal ;
clones `--shared` et sorties sous `F:/tmp/dojo-live-health/` ; **aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`** ;
aucun SSH, aucun acte d'hôte, aucun commit, aucun workflow ; rien sur C: ; réseau : le seul passage réel (GET publics). Advisor intégré
consulté après l'orientation, avant l'écriture (arbre du vérificateur, isolement du secret, dimensionnement, calendrier, forme des
tests), puis avant la première remise ; conseil, jamais verdict, chaque point vérifié sur pièce.

## 9. Pli des décisions de MONARK (2026-10-07, reçues à 03:40 UTC, pliées à 03:4x UTC)

- **Q-1, `scripts/dojo-deploy.mjs` l.45-46** : amendé sur place, 62 lignes avant et après (`git diff --numstat` : 2 2), lignes de 156 et
  158 caractères (le plus long du fichier en compte déjà 158). **Écart à la formulation visée**, déclaré : la cible finissait par
  « never on this host » après « on Bell » ; or l'hôte de publication du Dōjō EST Bell (`docs/RUNBOOK-dojo.md` l.1 « MONARK Dojo on
  the Bell host » ; `deploy/monark-dojo-publish.service` l.2 « Orchestrator-deployed on the Bell host » ; ADR-DOJO-PR-4 l.310 « la
  sonde partage l'hôte des fichiers Dōjō ») : la phrase se serait contredite. Écrit « on Bell from its own tree
  (DOJO_PROBE_TREE_PATHS), never from this one » (cet arbre, `/opt/monark-dojo`, n'a pas la CLI : `DOJO_PUBLISH_TREE_PATHS`).
  « of scripts/probe-dojo-live.mjs » n'y tient pas sous 158 caractères ; le nom de la constante est unique dans le dépôt.
- **Tueurs qui visent ce fichier** (recherche `killer: scripts/dojo-deploy.mjs:` dans tous les tests : deux, de
  `test/dojo-publish-deploy.test.ts`) : `:52` (`apps/dojo/src/layout.ts`) et `:57` (`/etc/monark/dojo/signing-key.pem`) trouvent encore
  leur texte une fois sur leur ligne ; tirés à la main dans un clone `--shared` (`node_modules` en jonction vers
  `F:/Monark/node_modules` : le fichier de test charge `@monark/rpc-guard`), tués par assertion tous deux, fichier restauré
  (`killers-deploy.jsonl` `f9492b63…70fb1`).
- **Rejoués sur les fichiers finals** : les onze tueurs de la sonde, 11/11 tués par assertion (`killers-final2.jsonl` `199fbe4a…8bd`,
  identique au premier tir) ; `npx tsc --noEmit` exit 0 ; `node --test test/dojo-publish-deploy.test.ts test/dojo-collect-deploy.test.ts
  test/ci-gates.test.ts test/probe-dojo-live.test.ts` exit 0, 78/78 (14 + 9 + 44 + 11) ; `node scripts/lang-gate.mjs` exit 0 ; R-25 en
  forme CI : 865 ≤ 1 205, contenu 0 (§4).
- **Q-2** : É-7 ; **Q-3** : DOJO-PROBE-MIRROR-1 (§6), porteur MONARK.
