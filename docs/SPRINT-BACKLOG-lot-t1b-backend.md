> Persisté par l'orchestrateur `claude-fable-5-1` le 2026-09-23 depuis `F:/tmp/t1b-g0/SPRINT-BACKLOG.md` (sha256 c2aae89361918f64e66ad2a073ca7fb0d3d1567f55f31b15804cca3545d7241b). G0 par le worker Opus 5.5 ; checkpoint-1 ACCEPTE-AVEC-CORRECTIONS C-1..C-10 pliées (v2) ; rulings R-T1b-1..7 ; DNS posé 13:49Z ; décision 147 (E-2 close).

# Sprint Backlog (v2) — MONARK Bell — lot T-1b-backend-a (éditeur signé, clé Ed25519, service, Caddy, CA)

Gabarit : `templates/backlog-passe.md`.

- **v2**. Le checkpoint-1 du validateur (`F:\tmp\cp1-t1b\CP1.md`, sha256 `d8f95c8a…9767`) a rendu **ACCEPTE-AVEC-CORRECTIONS C-1..C-10**. Les corrections sont pliées, avec les rulings R-T1b-1..7 et ceux de l'orchestrateur sur C-1..C-10 (~14:00Z).
- **Faits intégrés** : DNS posé (13:49Z), décision 147, G7 BELL-ADV-1 accepté (`adc3260`).
- **v1 conservée** : `SPRINT-BACKLOG.v1.md` (sha256 `ab2f184e…7867`).
- **Planificateur** : orchestrateur `claude-fable-5-1`. Rédaction : worker `claude-opus-5-5[1m]`, effort max.
- **Rattachement unique** : `F:\tmp\t1b-g0\ADR-T1b-backend.md` (v2), §D1-D13, § « Constantes », § « Tuyaux ».
- **Hors périmètre** (items à déclencheur) : collecte VPS et timer (BELL-COLLECT-TIMER-1, lot b ; déviation de la décision 54 journalisée, C-1), `apps/site` (T-1b-site), EXPORT-BELL-1.

## Règles communes (recopiées dans chaque mission G1)

- **Base et worktree.** Base de chaque PR = **pointe courante de `lot/etude-suite`**, lue par `git rev-parse` au lancement (≥ `adc3260`, G7 BELL-ADV-1 acquis). Worktree **`F:\Monark-wt-t1b`**, créé et retiré par l'orchestrateur ; le worker ne crée ni ne supprime de worktree et n'écrit jamais dans l'index de `F:\Monark`.
- **Modèle et roster** : `claude-opus-5-5`, effort `max` explicite, R-1 en tête. Mono-agent par PR, aucun fan-out (CA-4). Consigne standard `docs/CONSIGNE-STANDARD-G1.md` (sha256 `543c23c5…`) intégrale : A-1..A-13, B, C, D, D-1-bis, E, F, G-1, REVIEW-TAP-1.
- **Environnement.**
  - Ceinture sur chaque oracle, test ou mutant (A-7) :

    ```
    env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY
    ```

  - `TEMP`/`TMP` sous `F:\tmp\t1b-a<n>\os-tmp`.
  - Tout `--out` et tout rendu sous `F:\tmp\t1b-a<n>\` ; rien sur `C:`.
  - Aucun réseau hors loopback. Littéraux synthétiques seulement (amendement anti-close).
- **Invariant de périmètre** : `git diff --stat <base>..<tête> -- apps/site README.md skills schemas packages/contracts apps/bell/src apps/sentinel deploy/monark-harness.service deploy/monark-sentinel.service deploy/monark-sentinel.timer deploy/monark-probe.service deploy/monark-probe.timer` = **0 ligne**.
- **R-25** : mesuré avec le pathspec **verbatim** de `.github/workflows/ci.yml:65` (A-5). `docs/**/*.md` est exclu ; `deploy/`, `scripts/`, les tests et le JSON comptent. Cible ≤ 1 150 par PR (CI 1 205).
- **Chaîne par PR** : G1 → G2 ‖ checkpoint-2 (régime B, décision 116) → G7 sur l'arbre fusionné, oracle complet (A-3).
- **Entrées des tests (CA-11 durci, A-8)** : toute entrée est une **sortie réelle** de `runMain` hors ligne (précédent `collect.test.ts:680-744` @ `adc3260`) écrite dans un **`--out` réel hors dépôt** (`assertOutsideRepo`), ou de `collect()` réel. Pour un refus, cette sortie est **mutée d'un seul champ**. Jamais un `state.json` écrit à la main.

## Product Backlog → Sprint Backlog (12 tâches, dans l'ordre)

| # | Tâche (une phrase) | Critères d'acceptation (falsifiables) | Tests non-LLM nommés | Mutants attendus (rouges, tués par le test visé — A-11) | R-25 est. | PR / ADR |
|---|---|---|---|---|---|---|
| **S-1** | Écrire `apps/bell/scripts/bell-chain.mjs` (built-ins seuls) : forme canonique, garde anti-close, hash de ligne, Ed25519, modèle de trousseau. | (a) `canonical()` donne un octet pour octet égal à `digest.ts:28-36` (@ `adc3260`) sur un corpus fixé ; (b) **C-6, égalité DOUBLE avec `CLOSE_KEY` (`digest.ts:38`, non exporté)** : (i) littéral extrait du source (précédent `report.test.ts:88`) égal au littéral `.mjs` ; (ii) même verdict (lève / ne lève pas) entre `assertNoClose` exporté et la garde `.mjs`, sur un corpus de noms à valeur numérique : `close`, `closeRef`, `ref_price`, `pRef`, `reference`, `prev`, `adv`, `share_volume`, `volume_ref`, `no_close_ref`, `no_adv`, `prev_line_hash`, `adv_period` (objet), `close_source` (chaîne) ; (c) KAT RFC 8032 §7.1 TEST 1, clé **bâtie en mémoire** depuis la graine publiée (aucun littéral `"d":`) ; (d) imports ⊆ {`node:crypto`, `node:fs`, `node:path`, `node:url`}. | `bell_chain_canonical_equals_digest_canonical`, `bell_chain_close_key_equals_digest` (deux assertions), `bell_chain_ed25519_rfc8032_kat`, `bell_scripts_import_allowlist_no_network` | ordre des clés inversé ⇒ (a) ; `(?<!no_)adv` retiré de la copie ⇒ (b)(i) ET (b)(ii) ; lookbehind conservé dans le littéral mais contourné dans le code ⇒ (b)(ii) ; `sig` inclus dans l'octet signé ⇒ (c) ; `import "node:https"` ⇒ (d) | ≈ 280 | PR-1 ; §D3, §D6 |
| **S-2** | Écrire la validation fail-closed du bundle dans `bell-publish.mjs` (C-in-1..10) et la liste blanche **dérivée des types** (C-4). | (a) chaque cas invalide ⇒ exit 1, `bell/publish: <raison>`, empreinte du répertoire d'état inchangée ; (b) **liste blanche des gaps = `keyof GapEntryFilled ∪ keyof GapEntryAbstained`** (`digest.ts:66-98`), prouvée par un test `.ts` à `Record<GapKey, true>` (exhaustivité imposée par `tsc`, excédent refusé) comparé au runtime à la liste `.mjs` ; `residuals` = `RESIDUAL_CODES` (`residuals.ts:55`) ; autres objets selon leurs sites de construction (ADR §D5) ; (c) **couverture** : les sorties réelles de `collect()` portant **toutes** les formes de gap (abstenue, `rebase_residuals`, `cash_cross`, `earliest_publish_utc`) et les deux formes de `volume` passent C-in-2 ; (d) **bornes valuées (C-7)** : `MAX_RUNS=64`, `MAX_INPUT_FILE_BYTES=64 MiB`, `MAX_PUBLIC_STATE_BYTES=64 MiB`, `MAX_LINE_BYTES=1 MiB`, injectables ; entrée à **2× la borne abaissée** ⇒ refus nommé ; (e) `adv_source` et **`close_source`** absents de la projection de provenance (R-T1b-2) ; (f) C-in-10 : `bell_sha` en double dans un bundle ⇒ refus. | `bell_publish_refuses_bell_sha_mismatch`, `bell_publish_refuses_unknown_state_field`, `bell_publish_refuses_close_like_field`, `bell_publish_refuses_unpublishable_session`, `bell_publish_refuses_url_or_key_shaped_string`, `bell_publish_refuses_broken_run_timeline`, `bell_publish_requires_exactly_one_pending_bundle`, `bell_publish_refuses_duplicate_run_in_bundle`, `bell_publish_provenance_projection_is_declared`, `bell_publish_whitelist_equals_collector_types`, `bell_publish_whitelist_covers_all_collector_gap_shapes`, `bell_publish_bounds_refuse_at_twice_the_bound` | retrait de chaque contrôle ⇒ son test rouge ; champ optionnel (p. ex. `rebase_residuals`) retiré de la liste ⇒ `…_covers_all_collector_gap_shapes` rouge ; clé ajoutée au type sans la liste ⇒ `tsc` rouge ; `close_source` laissé dans la projection ⇒ rouge ; borne ignorée ⇒ rouge | ≈ 450 | PR-1 ; §D4, §D5, §D7, § « Constantes » |
| **S-3** | Implémenter la ligne `bell-timeline-v1`, sa signature, l'ordre d'écriture durable et la reprise. | (a) ordre §D8 observé par la couture durable : `staging/` → ajout privé (commit) → `rename` des immuables dans `public/` → `public/timeline.jsonl` → courants, chaque `rename` suivi d'un `fsync` du répertoire ; (b) panne injectée après chaque étape ⇒ **I-1..I-3** tiennent au redémarrage ; (c) queue privée déchirée non servie ⇒ troncature journalisée ; toute autre incohérence ⇒ refus ; (d) même bundle deux fois ⇒ une seule ligne ; (e) **C-3** : une seule lecture d'horloge par publication ; `published_at` de la ligne == celui de l'enveloppe ; (f) la CLI lit la clé privée **uniquement** dans `$CREDENTIALS_DIRECTORY/bell-signing-key` (`LoadCredential`, ADR §D9) ; absente ⇒ exit 1 sans rien écrire ; aucune autre lecture d'environnement ni de chemin de clé (calque B-4). | `bell_publish_crash_between_steps_never_serves_unbound_state`, `bell_publish_torn_private_tail_truncated_only_if_unserved`, `bell_publish_refuses_corrupt_existing_timeline`, `bell_publish_same_bundle_twice_is_idempotent`, `bell_publish_dir_fsync_after_rename`, `bell_publish_published_at_single_clock_read` (horloge injectée rendant une valeur différente à chaque appel : égalité + un seul appel), `bell_publish_cli_reads_key_only_from_credentials_directory` | immuable écrit directement dans `public/` avant le commit ⇒ (b) ; `fsync` de répertoire omis ⇒ (a) ; troncature d'une ligne servie ⇒ (c) ; deux lectures d'horloge ⇒ (e) ; variable d'environnement de repli lue pour la clé ⇒ (f) | ≈ 265 | PR-1 ; §D6, §D8 |
| **S-4** | Écrire `apps/bell/scripts/bell-verify.mjs` (bibliothèque + CLI ; fichier ou URL ; https ou http loopback ; aucune redirection ; tailles bornées) avec **le trousseau fourni pour racine (C-9)**. | Rejette : ligne du milieu altérée ; signature retirée ou de clé hors trousseau ; `state.json` non lié à la tête ; `bell_sha` faux ; redirection ; http hors loopback. **Racine = `--keyring`** : une clé servie absente du trousseau fourni ⇒ refus. **Sans `--keyring`** : état rendu « auto-cohérent seulement », jamais un succès sans qualificatif. | `bell_verify_detects_middle_line_tamper`, `bell_verify_rejects_removed_or_wrong_signature`, `bell_verify_rejects_state_not_bound_by_head`, `bell_verify_recomputes_each_run_bell_sha`, `bell_verify_refuses_redirect_and_offloopback_http`, **`bell_verify_trust_root_is_supplied_keyring_not_served_pubkey`**, `bell_verify_without_keyring_reports_self_consistent_only` | recalcul limité à la dernière ligne ⇒ rouge ; `key_id` inconnu accepté ⇒ rouge ; redirection suivie ⇒ rouge ; **clé servie acceptée comme racine ⇒ rouge** ; libellé de succès nu sans trousseau ⇒ rouge | ≈ 390 | PR-2 ; §D6, §D9, §D11 |
| **S-5** | Prouver la composition de bout en bout (CA-11 durci) et les gardes du texte servi. | (a) **C-3** : `runMain` hors ligne, `--out` **réel hors dépôt** (répertoire temporaire ; `assertOutsideRepo` passe) → bundle = **ce répertoire tel qu'écrit** → `bell-publish` → serveur loopback appliquant les en-têtes lus dans `deploy/Caddyfile.monark-bell` → `bell-verify --keyring` en HTTP : vert ; (b) **égalité profonde** (`deepStrictEqual`) entre chaque `runs[i]` servi et le `state.json` **parsé** du run (la re-sérialisation change les octets, pas la valeur) ; (c) `published_at` identique entre ligne et enveloppe ; (d) la fixture produit au moins **un gap abstenu** et **un `rebase_residuals`** par `runMain` (couture `--rebase-trajectory`, précédent `collect.test.ts:770-817` @ `adc3260`) ; si la couture ne le permet pas, par `collect()` réel, avec écart déclaré (D-n) ; (e) gate vocab (global + scope bell) = 0 hit sur le texte servi ; (f) formes décision 69 = 0 hit ; (g) `aggregate()` identique sur `runs[]` servis et sur le D9. | `bell_publish_consumes_real_runmain_output_end_to_end`, `bell_served_files_pass_vocab_gate`, `no_cash_cross_provider_name_on_bell_served_files` (**second `test()` de `test/no-cash-provider-name.test.ts`**, littéraux à source unique), `bell_report_aggregate_equals_on_served_bundle` | `verified` nu injecté ⇒ rouge ; forme fournisseur injectée dans la provenance servie ⇒ rouge ; octet de `state.json` altéré ⇒ rouge ; `runs[i]` servi différent du run ⇒ rouge ; entrée écrite à la main ⇒ refus G2 | ≈ 265 | PR-2 ; §Tuyaux T-a..T-g |
| **S-6** | Implémenter rotation, révocation, perte et `--generate-key`. | (a) rotation doublement signée ⇒ vérifie ; sans `sig_new` ⇒ refus ; (b) clé révoquée à `seq ≥ revoked_from_seq` ⇒ invalide ; (c) **perte (`continuity:"broken"`) acceptée seulement si la nouvelle clé est dans le trousseau fourni (C-9)** ; rupture rapportée ; (d) `--generate-key` n'imprime que la partie publique, refuse d'écraser, écrit en 0600 (assertion POSIX, déclarée sous win32). | `bell_key_rotation_cross_signed_verifies`, `bell_revoked_key_lines_after_revocation_rejected`, `bell_key_loss_break_accepted_only_if_new_key_in_supplied_keyring`, `bell_keygen_prints_public_only_refuses_overwrite` | `sig_new` facultatif ⇒ (a) ; révocation ignorée ⇒ (b) ; rupture acceptée hors trousseau ⇒ (c) ; `d` imprimé ou écrasement ⇒ (d) | ≈ 190 | PR-2 ; §D9 |
| **S-7** | Écrire `deploy/monark-bell-publish.service`. | `User=bell`, `PrivateNetwork=yes`, `LoadCredential=bell-signing-key:/etc/monark/bell/signing-key.pem`, `ProtectSystem=strict`, `ReadWritePaths` **égal à** `/var/lib/monark-bell`, `UMask=0022` ; **valeurs (C-7)** : `CPUQuota=25%`, `MemoryMax=512M`, `--max-old-space-size=448` dans `ExecStart`, `TasksMax=32`, `TimeoutStartSec=120` ; ni `EnvironmentFile` ni `[Install]`. | `bell_deploy_config_publish_unit_least_privilege_offline` | `PrivateNetwork` retiré ⇒ rouge ; `EnvironmentFile` ajouté ⇒ rouge ; `ReadWritePaths=/` ⇒ rouge ; valeur d'un plafond changée ⇒ rouge | ≈ 115 | PR-3 ; §D10 |
| **S-8** | Écrire `deploy/Caddyfile.monark-bell`. | `bell.monarkgate.tech` ; `root` == `/var/lib/monark-bell/public` ; `file_server` sans `browse` ; ACAO `*` ; `nosniff` ; cache `immutable` sur `states/*` et `provenance/*`, `no-cache` ailleurs ; ni `reverse_proxy` ni `log` ; **`/bell/pubkey.json` servi par le même `root`** (C-10), sans route spéciale. Le serveur loopback de S-5 lit ses en-têtes dans ce fichier. | `bell_caddyfile_serves_public_dir_only_no_browse_cors` | `browse` ajouté ⇒ rouge ; `root` élargi ⇒ rouge ; ACAO retiré ⇒ rouge | ≈ 105 | PR-3 ; §D10 |
| **S-9** | Écrire la CA `scripts/verify-bell.mjs` (12 contrôles). | Chacun des 12 contrôles, mis seul en échec en loopback, donne exit ≠ 0 et est nommé. `VERIFY OK` seulement si tous passent. `tls.skipped` ne satisfait jamais le go-live. **Contrôle 3** : `/bell/pubkey.json` == trousseau committé. **Contrôle 5** : racine `--keyring` (C-9). **Contrôle 11 (C-5)** : (a) arbre == `git show <G7>` ; (b) Caddyfile chargé (dédié importé ou remplacé) == `git show <G7>:deploy/Caddyfile.monark-bell`, et une seule ligne `import` en mode import ; (c) `systemctl cat` : un fragment, aucun drop-in, corps == `git show <G7>:deploy/monark-bell-publish.service`, et `NeedDaemonReload=no`. | `verify_bell_ca_checks_named_and_fail_closed` | contrôle 11 ou 12 retiré ⇒ rouge ; **unité copiée modifiée ⇒ rouge** ; drop-in présent ⇒ rouge ; `NeedDaemonReload=yes` ⇒ rouge ; exit 0 sur échec ⇒ rouge | ≈ 360 | PR-3 ; §D1, §D11 |
| **S-10** | Étendre `no_secret_in_repo` (JWK privée) et le scope vocab `bell` (`apps/bell/scripts/*.mjs`). | JWK privée plantée (`"d":`) ⇒ rouge ; KAT vert **sans aucune exception** dans la garde ; `verified` nu planté dans `apps/bell/scripts` ⇒ rouge ; dépôt à 0 hit. | `bell_no_secret_in_repo` (étendu), `bell_vocab_scope_covers_scripts` | motif JWK retiré ⇒ rouge ; scope retiré ⇒ rouge | ≈ 50 | PR-3 ; §D9, §D13.7 |
| **S-11** | Rédiger `docs/RUNBOOK-bell.md` et le texte des amendements (§D13.1-8). | Chaque étape nomme sa commande, sa sortie attendue et son retour arrière. **Portes G-a..G-e avant l'étape 9**, chacune avec sa pièce (C-8). Clé après G-c. **Installation de Caddy (C-5)** : Caddyfile en place consigné (sha + contenu), puis `import` d'un fichier dédié remplacé en bloc (si l'hôte porte d'autres sites) ou remplacement (défaut du paquet seul) ; `caddy validate` ; `reload`. Traversée `sudo -u caddy test -x`. Phrase « détectable par qui » (§D6). Rien n'affiche la clé : 0 `cat` du fichier de clé, 0 `set -x`. | `bell_runbook_never_prints_private_key` (hygiène, pas une preuve de branchement) | étape `cat /etc/monark/bell/signing-key.pem` ⇒ rouge | 0 (docs) | avec PR-3 ; §D9-D11, §D13 |
| **S-12** | Exécuter l'événement D-n (acte orchestrateur) après G-a..G-e. | **Portes avec pièce (C-8)** : G-a (G7 des 3 PR : docs + SHA) ; G-b (PR-B-DBN n° 8 : **FAITS daté**, lecture sur place) ; G-c (I-G2-2 : **lecture hPanel consignée + décision investisseur sur les sauvegardes** + ruling ESC-2) ; G-d (DNS : `CHANTIERS.md:1157-1158` + `dig +short` rejoué = adresse de l'hôte Bell) ; G-e (premier bundle : **sha256** + références de course). Ensuite : contrôles sur place (`systemctl --version` ≥ 247, traversée caddy…), arbre au SHA G7, clé, trousseau committé, unité, Caddy, `scp` du bundle, publication, CA `VERIFY OK` avec `tls.authorized:true`, empreintes de la sonde inchangées, JOURNAL **citant chaque pièce**. Le commit du trousseau et du JSON de CA passe l'**oracle complet avant tout push**. Registre public inchangé. | CA live `scripts/verify-bell.mjs` ; `curl -sI https://bell.monarkgate.tech/state.json` = 200 ; `curl -sI https://bell.monarkgate.tech/bell/pubkey.json` = 200 | n/a : un contrôle rouge ou une pièce manquante = D-n refusé | ≈ 80 | après PR-3 ; §D11 |

**Totaux R-25 v2**, à mesurer au G1 :

| PR | Tâches | Estimation |
|---|---|---|
| PR-1 | S-1 + S-2 + S-3 | ≈ 995 |
| PR-2 | S-4 + S-5 + S-6 | ≈ 845 |
| PR-3 | S-7 + S-8 + S-9 + S-10 (+ S-11, docs) | ≈ 630 |
| D-n | S-12 | ≈ 80 |

Toutes ≤ 1 150. **Seam pré-déclaré** : si PR-1 dépasse 1 150, S-3 passe en tête de PR-2 ; jamais un dépassement rendu (A-5).

## Sprint Backlog — ordre, portes, faisabilité

- **Ordre** : S-1 → S-2 → S-3 (PR-1, **lançable maintenant** : porte G7 BELL-ADV-1 levée) → S-4 → S-5 → S-6 (PR-2) → S-7 → S-8 → S-9 → S-10 + S-11 (PR-3) → S-12 (D-n).
- **Portes du D-n** : G-a..G-e (ADR §D11). DNS levée (13:49Z) ; E-2 close (décision 147).
- **Faisabilité** :
  - aucune dépendance nouvelle (R-8) ;
  - sources [lu] ou [lu-WF] ; aucun procurement ouvert ;
  - précédents : couture durable `DURABLE_FS`, serveur loopback de la sonde, extraction de littéral `report.test.ts:88`.
- **Réduction** : aucun fan-out (doc 06 §6.2).
- **Limites déclarées** :
  - `rename` win32 (ADR-T1aii D1-nonies §6) ; les tests win32 ne tiennent aucun lecteur ;
  - mode 0600 asserté sous POSIX seulement.

## Actes investisseur (v2)

- **Faits** : DNS A `bell.monarkgate.tech` → adresse de l'hôte Bell (acte délégué, 13:49Z) ; décision 147 (juriste).
- **Restent** :
  - décision sur les sauvegardes après la lecture I-G2-2 (G-c) ;
  - lot b : clé ou compte Helius et pose des secrets ;
  - JURISTE-ACTE-NOV-1 (acte formel en novembre ; non bloquant).
- **Escalades ouvertes : aucune.** E-1 tranchée (R-T1b-5), E-2 close (147).

## Consultation K-1 — TRANCHÉE (R-T1b-4 : découplage ; le validateur concourt)

Amendement CHANTIERS `:45`/`:84` au G7 (ADR §D13.8).

## Risques MAST du sprint

Table des 14 modes : ADR §MAST. Les dominants :

- **Spécification** : liste blanche dérivée des types (C-4) ; constantes valuées (C-7).
- **Désalignement** : entrées = sorties réelles de `runMain`/`collect()` ; égalité profonde (C-3).
- **Vérification** : racine de confiance hors hôte (C-9) ; configuration chargée prouvée (C-5) ; double égalité `CLOSE_KEY` (C-6). Checkpoint-2 (Fable) qui rejoue un mutant du vérificateur, puisque G1 et G2 sont de même famille.

## Approbation du plan : CA-1..CA-11 (v2, après checkpoint-1)

| Critère | État après checkpoint-1 (`CP1.md`) | Ce que la v2 fournit |
|---|---|---|
| **CA-1** | CONFORME, avec précisions C-4, C-6, C-7 | précisions pliées dans S-1, S-2, S-7 (valeurs, dérivation, double égalité) |
| **CA-2** | CONFORME sous condition C-1 ; E-2 portée | C-1 journalisée (ADR §D2, §D13.2) ; E-1 tranchée (R-T1b-5) ; E-2 close (147) |
| **CA-3** | CONFORME | ADR v2 ; backend gaté par 62/101 ; analogue M013 T2 |
| **CA-4** | CONFORME | inchangé |
| **CA-5** | CONFORME + résiduel « même famille » | ajouté (ADR §MAST, FM-3.3) |
| **CA-6..CA-10** *(engagements, checkpoint-2)* | engagements notés | inchangés ; items v2 : BELL-ACCESS-LOG-1 re-formé (décision 78), CLOSE-SOURCE-NAMING-1, EXPORT-BELL-1 (+ `report.test.ts:69`), JURISTE-ACTE-NOV-1 |
| **CA-11** | CONFORME avec C-3, C-4, C-5, C-9 | S-5 (a)(b)(c)(d) ; S-2 (b)(c) ; S-9 contrôle 11 (b)(c) ; S-4/S-6 racine `--keyring` |

- Le checkpoint-1 est **rendu** : ACCEPTE-AVEC-CORRECTIONS C-1..C-10.
- Ce backlog v2 est la preuve de pliage consignée pour l'émission des missions G1.
- Le verdict G7 reste à l'orchestrateur (R-20).

**Amendement daté 2026-09-23 (décision 155, lot BELL-HOST-ROOT-1)** : S-8 porte en plus `@home path /` + `redir @home https://monarkgate.tech/bell 302` (seule forme admise par le modèle fermé) ; contrôle 7 de la CA : `/` ⇒ 302 vers cette URL. Voir ADR-T1b-backend, amendement du 2026-09-23.
