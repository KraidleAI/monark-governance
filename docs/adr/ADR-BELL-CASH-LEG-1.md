# ADR-BELL-CASH-LEG-1 — Réactivation de la jambe cash du collecteur Bell, étiquettes génériques de provenance, publication seq 2

- **Statut** : proposé (G0) — checkpoint-1 validateur dû AVANT tout code (R-22 : aucun régime court pour un lot backend tant que l'investisseur n'a pas ratifié de régime allégé).
- **Rattachement** : ADR-B0 (programme Bell, D2 fait (i) `g_t = ln(VWAP/close_ref)`, ESC-1 (c) inchangé), ADR-T1aii (collecteur, amendement -b3b : close Databento recoupé par Massive par jour de référence, jamais nommé — décision 69), ADR-T1b (éditeur/hôte, guard `url_or_key_shaped_string`), RUNBOOK-bell (étapes 9-13 : produce → publish → sync → upload), décision investisseur **165** (2026-09-24 01:07Z : source inchangée ; le reste de la décision est un dossier confidentiel `docs/juriste/`, non reproduit ici et non nécessaire aux agents de ce lot).
- **Motif** : depuis seq 1 (2026-09-23 21:35Z), `state.json` servi porte `no_close_ref` sur les 4 sessions (résidu = 4) : la jambe cash a été **coupée par configuration** (script de lancement `launch-q6-fast-<MINT>.sh` l.127 : `-u DATABENTO_API_KEY -u MASSIVE_API_KEY`), pas par défaut de code (`apps/bell/src/close.ts` : `readReferenceCloses`, `databentoGet`, cross-check `polygonGet`, `earliestPublishUtc` existent et sont testés). La page publique montre donc des abstentions là où le fait (i) est mesurable. Décision investisseur 164 : « toutes les données que le backend sert » sur les pages ⇒ le backend doit d'abord servir le fait (i).

## Contexte mesuré (2026-09-24 01:1x UTC)
- Clé Databento présente en scope User (longueur 32, jamais affichée, A-7) ; clé Massive/Polygon présente (recoupement interne, décision 69).
- Bundles opérateur existants `F:/course-bell/q6/{TSLAx (W3), AAPLx (W3), SPYx (W4)}/` : fills et VWAP par session valides, `gaps[].abstain = "no_close_ref"`, `journal.json` avec `faults[{provider:"databento.com", status:"HTTP 400"}]` (Q6-C09-DATABENTO-1 : 400 et non 401 sans clé — profil à expliquer par le worker : réponse de `hist.databento.com` à une requête sans `Authorization`).
- `provenance.json` servi (seq 1) : `faults[0].provider = "databento"` (relabellisé à la main avant publication : le guard `bell-publish.mjs:93-139` refuse les hôtes pointés, `BARE_LABEL`) — contradiction publique avec les Terms servis (« avoid any specific data provider's name », `bell-legal.json:55`) : **FAULTS-PROVIDER-NAME-1 (b)**.
- `close.ts:159` et `:170/:435` étiquettent les requêtes cash `provider: "databento.com"` / `"polygon.io"` (hôtes) ; `collect.ts:396` étiquette les fautes RPC par `providerOf(primary)` (étiquette nue : conforme).
- Page `/bell/method` : seuils « 1/5 % » ; code `digest.ts:76` : `exceed1/exceed2/exceed5` (**METHOD-THRESHOLDS-1**).

## Décision
### D1 — La jambe cash est réactivée (configuration + garde)
Les scripts de lancement de course ne retirent plus `DATABENTO_API_KEY` ni `MASSIVE_API_KEY` de l'environnement (les autres `-u` restent) ; les clés ne sont lues que par `close.ts` (`readCashKeys`), jamais journalisées. Un contrôle Q6 **C14 `close_ref_present`** exige, pour chaque session couverte d'un jour de référence disponible (J+1 ≥ 00:00 ET), un `gT` numérique et `abstain` absent ; C09 attend désormais `faults` cash **vides** (le profil « attendu rouge » de seq 1 est retiré). Le résidu `no_close_ref` reste légitime uniquement pour une session dont le jour de référence n'est pas encore publié par la source (offset `earliest_publish_utc = 16:00 ET + 24 h`, RUNBOOK G-b, inchangé).
### D2 — Étiquettes génériques de la jambe cash (provenance publiée ET journal)
`close.ts` étiquette les requêtes et fautes cash par des étiquettes nues **génériques** : `cash-close` (close consolidé), `cash-crosscheck` (recoupement), `adv-bars` (barres ADV). Aucun nom ni hôte de fournisseur n'apparaît dans `provenance.json`, `journal.json`, `state.json`, `timeline.jsonl` ni dans la vitrine (décision 69 + Terms). Le guard de l'éditeur reste inchangé (il refuse déjà les hôtes) ; un test unitaire nouveau `bell_cash_labels_are_generic` rougit si une étiquette cash contient un point, `databento`, `polygon` ou `massive` (mutant : `provider: "databento.com"` réintroduit ⇒ rouge). Le mapping étiquette → source vit dans cet ADR (privé), pas dans le code exporté.
### D3 — Publication seq 2
Re-collecte avec clé de TSLAx (W3 2026-09-16), AAPLx (W3), SPYx (W4) via les scripts de lancement corrigés (coût : Helius ≈ 25 k crédits mesurés à seq 1, plan Developer 10 M/mois ; Databento : `metadata.get_cost` (gratuit) exécuté et journalisé AVANT chaque `timeseries.get_range`, plafond 1 $ par course sinon abstention) ; contrôles Q6 13+1 PASS ; `produce` → `publish` seq 2 (RUNBOOK étapes 9-12, opérateur = orchestrateur, décision ESC-2 (a)) → `scripts/sync-bell-served.mjs` → `sync-bell-anchors.mjs` → upload vitrine. Seq 1 reste servi dans `states/1`, `provenance/1` (chaîne append-only, jamais réécrite).
### D4 — Seuils affichés dérivés du digest servi
La page `/bell/method` ne tape aucun seuil : la liste des seuils se dérive des champs `exceed<k>` présents dans `bell-served.json` (synchro depuis `state.json`) ; test `bell-method` : les seuils rendus = ensemble des `k` servis (mutant : champ `exceed2` retiré du JSON ⇒ « 2 % » disparaît). Si le workflow vitrine en cours (wf_ee092a8d-981, surface bell) l'a déjà fait, le lot ne le refait pas (vérifier le patch `/f/tmp/site5j/patch-bell.diff`).
### D5 — Scripts de lancement committés
Les scripts `launch-q6-fast-<MINT>.sh` (aujourd'hui dans `F:/tmp/q6course/`, volatils, identiques au mint près) sont committés en **un** script paramétré `apps/bell/ops/launch-q6.sh <MINT> <mode>` + `q6-controls.mjs` (déjà dans `apps/bell/scripts` ? sinon déplacé), sans aucune valeur de clé (test `bell_ops_scripts_carry_no_secret_shape`). Hors export public (`apps/bell/ops` ajouté à `export-exclude-*` si le whitelist walk l'attrape ; vérifier `export:check`).

## Tuyaux (règle Branchement)
| Tuyau | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test d'intégration non-LLM |
|---|---|---|---|---|
| close_ref → gap | `close.ts` (source cash, clé opérateur) | `collect.ts` `gaps[].gT` | bundle opérateur `F:/course-bell/q6/<MINT>/state.json` | Q6 C14 + test unitaire `gap` (close présent ⇒ gT, absent ⇒ `no_close_ref`) |
| bundle → servi | `bell-publish.mjs` (hôte, clé Ed25519) | `bell.monarkgate.tech/state.json`, `timeline.jsonl` seq 2 | `/var/lib/monark-bell/public` | CA `scripts/verify-bell.mjs` 12 contrôles (`docs/deploy-CA-bell.json` rejoué) |
| servi → vitrine | `scripts/sync-bell-served.mjs` | `apps/site/app/bell/*` | `apps/site/data/bell-served.json` + manifest | `test/bell-served.test.ts` (byte-exact vs servi), `test/bell-method.test.ts` (seuils) |

## Modes MAST
Dérive de spécification (afficher un close) : `assertNoClose` + guard `close_like_field` inchangés, test D2 ; vérification incorrecte (labels relabellisés à la main) : le relabel manuel est interdit — un bundle refusé par le guard est re-produit, jamais édité (RUNBOOK amendé) ; perte d'information (scripts volatils) : D5 ; secret-leak : A-7, test D5.

## Items formés (déclencheurs)
- LAUNCH-SCRIPTS-COMMIT-1 → ce lot (D5). Q6-C09-DATABENTO-1 → expliqué par le worker (400 vs 401) et clos par D1. FAULTS-PROVIDER-NAME-1 (b) → D2. METHOD-THRESHOLDS-1 → D4. BELL-VERIFY-SCHEDULE-1 (CA planifiée) → lot suivant, hors périmètre. LIC-DBN-1 → dossier `docs/juriste/` (propriétaire investisseur, rappels 2026-11-24 / 2026-12-10). ESC-1-REWRITE (forme binnée) → repli, déclencheur = avis juriste défavorable.
- Aucune dette nue ; aucun procurement nouveau.

## Oracle et R-25
Oracle : `npm run typecheck`, `lint`, `lint:ratchet` (plafond intact), `gate:vocab`, `lang:gate`, `export:check`, tests `apps/bell/test/*` + `test/verify-bell.test.ts` + `test/bell-served.test.ts`, `npm test` complet lancé **seul** par l'orchestrateur à l'intégration (HTTP-TEST-CRASH-1). R-25 < 1 205 (attendu ≈ 300). Worktree dédié `F:/Monark-wt-cashleg` (branche `lot/bell-cash-leg-1` sur `lot/etude-suite`).

## Points à trancher au checkpoint-1
1. D2 : étiquettes `cash-close` / `cash-crosscheck` / `adv-bars` — assez génériques et stables pour la chaîne append-only (elles seront dans `provenance.json` seq ≥ 2 pour toujours) ?
2. D3 : re-collecte (fills rejoués, ≈ 25 k crédits) vs re-gap post hoc à partir des bundles seq 1 (moins cher, mais un nouveau `bell_sha` calculé sur des fills non rejoués) — reco orchestrateur : re-collecte, un bundle = une course.
3. D1 : le C14 doit-il être bloquant pour la publication (aucun `no_close_ref` sur session couverte) ou seulement rapporté ? Reco : bloquant.
