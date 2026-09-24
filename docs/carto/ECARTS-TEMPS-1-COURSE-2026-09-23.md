Modèle résolu : claude-opus-5-5[1m]

# ÉCARTS registre ↔ mesure = dettes formées — cartographie de clôture du temps 1 de la course Ukemi (HEAD `d0535cb`, 2026-09-23)

> Règle appliquée : CLAUDE.md global « Branchement » (2026-09-19) + « Dettes » (2026-08-05) : chaque écart est une **demande formée**
> (procurement) OU une **recherche de solutions** documentée, avec propriétaire et déclencheur ; jamais un « dû » nu.
> Worker `claude-opus-5-5[1m]`, lecture seule, aucun commit (R-20) ; sortie à vérifier par l'orchestrateur (R-21).
> Preuves rejouables : `F:\tmp\carto-t1\graph.json` (sha256 dans le rendu §8) et les scripts de `F:\tmp\carto-t1\work\`.
> Préfixe des items neufs : **CARTO-T1F-n** (distinct de CARTO-T1-n, baseline, et de CARTO-T1C-n, carto du 2026-09-22).
> Aucune pièce introuvable n'est en jeu : **0 demande de procurement** ; les 3 items neufs sont des vérifications sur place,
> des recherches de solutions ou une correction de registre interne.

## Tableau de synthèse

| Id | Écart (une ligne) | Forme | Propriétaire | Déclencheur |
|---|---|---|---|---|
| **CARTO-T1F-1** (majeur, déploiement) | le redéploiement harness `bb41b6d` (2026-09-23 00:54Z) a très probablement déployé le code sentinelle -1d sur le VPS, hors plan, hors journal, préconditions P-2/P-4 fausses et P-1 non tenue (inférence mesurée) | vérification sur place (5 contrôles discriminants V-1..V-5) puis ruling documenté parmi 3 options mesurées | orchestrateur | **immédiat** : avant le prochain créneau sentinelle utile (2026-09-24 00:30Z, 1ʳᵉ ligne publiée par le code -1d) et avant tout nouveau redéploiement harness |
| **CARTO-T1F-2** (structurel) | un seul arbre `/opt/monark-harness` pour deux unités ; le redéploiement harness n'exclut pas `apps/sentinel` et ni ses contrôles de digest ni sa CA ne couvrent la sentinelle | recherche de solutions (4 options, précédents du dépôt, critères) | orchestrateur | avant le prochain redéploiement harness, et au plus tard avant le 2ᵉ redéploiement §6-bis |
| **CARTO-T1F-3** (registre interne) | `docs/TABLEAU-DE-BORD.md` figé depuis 2026-09-22T20:28Z alors que son en-tête le déclare mis à jour « à CHAQUE événement » ; sa ligne -1d dit « EN COURS » | correction de registre interne | orchestrateur | prochaine édition des fichiers d'état (ruling T1F-1 ou G7 UKEMI-REVERT-1, au premier des deux) |

Items existants **rappelés et mis à jour** (non re-formés) en fin de fichier : CARTO-T1C-3/4/7/8/9/10/11, UKEMI-REVERT-1,
PROV-MODEL-1, K-1, UKEMI-CONC-1 (rendez-vous `built`), GARDE-FSYNC-1 I-1.

---

## CARTO-T1F-1 — le redéploiement harness `bb41b6d` = 2ᵉ redéploiement sentinelle **de fait** (non planifié, non journalisé)

### Faits mesurés (git objects + documents du dépôt ; aucune lecture en ligne)
1. **Un seul arbre, deux unités.** `deploy/monark-harness.service:50` exécute `/opt/monark-harness/apps/harness/src/server.ts` ;
   `deploy/monark-sentinel.service:39` exécute `/opt/monark-harness/apps/sentinel/src/run.ts` (oneshot : il relit ses sources à
   CHAQUE créneau du timer, `deploy/monark-sentinel.timer`). `docs/RUNBOOK-sentinel.md:26-28` : la sentinelle « rides inside the
   harness archive ».
2. **Le redéploiement harness expédie `apps/` entier.** `docs/RUNBOOK-harness.md:48` (« `apps/` and `packages/` ship **whole** ») et
   `:66` (liste `apps packages schemas fixtures package.json package-lock.json deploy scripts/verify-harness.mjs`) ; appliqué tel quel
   le 2026-09-23 00:54 UTC au SHA `bb41b6d` (`docs/JOURNAL-PROVENANCE.md:358`, `docs/CHANTIERS.md:946`).
3. **`bb41b6d` contient -1d.** `git merge-base --is-ancestor 3659181 bb41b6d` = vrai (fusion NARABI-OPS-1d à 2026-09-22 20:53:39Z ;
   `bb41b6d` à 2026-09-23 00:52:21Z, `TZ=UTC git log`). Fermeture SERVIE de la sentinelle (45 fichiers, `graph.json → reachability`) :
   `git diff --name-only c4981d0 d0535cb` sur ces fichiers = **17** (dont `run.ts`, `keyless-transport.ts` neuf, 12 fichiers
   `packages/rpc-guard/src/*`) ; `bb41b6d..d0535cb` = **0**. Sha256 attendus (`sentinel-sha.mjs`, blobs git, `eol=lf`) :
   `run.ts` E-5 `54619a40…` (= la valeur journalisée à `docs/JOURNAL-PROVENANCE.md:353` : méthode validée) → `bb41b6d`/HEAD `45557d6e…`.
4. **Le plan disait l'inverse.** `docs/adr/ADR-NARABI-OPS-1.md:224` : chemin servi en production = `c4981d0` « jusqu'au 2ᵉ
   redéploiement » ; `:249` : ce 2ᵉ redéploiement est « le seul autorisé par la décision 118 », SEULEMENT après course close + pli
   §11-1 + G2-delta + re-cp-2 + G7 ; `docs/RUNBOOK-sentinel.md:335-338` : préconditions P-1 (pli §11-1 fusionné), P-2 (clôture du temps 1
   et de la course U-4b-1b), P-4 (hors créneau : aucune fenêtre [créneau ; créneau + 35 min]). **00:54Z est DANS la fenêtre du créneau
   00:30** ; P-2 était fausse le 2026-09-23 00:54Z (course non close : temps 2 arrêté 10:43:31Z, `docs/CHANTIERS.md` @ `4a2f69f`
   l.1080) ; P-1 est **non tenue par inférence mesurée** : le pli §11-1 est la suppression du code mort de `rpc.ts`
   (`docs/adr/ADR-U4b-calibration-episode-frais.md:742-744`) et `rpc.ts` est toujours au sha gelé `0e232519…` (ADR-U4b `:74`) à `bb41b6d`
   comme à `d0535cb` (`git show <c>:apps/sentinel/src/rpc.ts | tr -d '\r' | sha256sum`) ; la fermeture sentinelle `3659181..d0535cb` = 0
   fichier ; `docs/CHANTIERS.md:871` place encore le 2ᵉ redéploiement « apres le pli §11-1 (post-course) ». `docs/CHANTIERS.md:858` (portée décision 137) liste le redéploiement harness et le 2ᵉ redéploiement sentinelle comme
   **deux actes distincts**.
5. **Rien ne l'a vu.** L'entrée de redéploiement contrôle les digests de `gate.ts`, `verify-harness.mjs`, `h5-e2e-trace.json`
   seulement (`JOURNAL-PROVENANCE.md:358`) ; la CA `scripts/verify-harness.mjs` porte 12 contrôles, **0 occurrence de « sentinel »**
   (grep) ; `docs/TABLEAU-DE-BORD.md:42` dit encore -1d « EN COURS — G7 à rendre » (CARTO-T1F-3). L'E-5 avait consigné l'effet
   **inverse** (déploiement sentinelle ⇒ fichiers harness réécrits sans redémarrage, `JOURNAL-PROVENANCE.md:355`) ; le sens
   harness ⇒ sentinelle n'est consigné nulle part.

### Comportement prédit par le code et prouvé par un test (si l'`EnvironmentFile` ne porte toujours que l'URL)
`run.ts:285` : `CHAINSTACK_CYCLE_ID` ou `CHAINSTACK_ETH_ORIGIN` absent ⇒ `unconfigured` avant toute ouverture ; `docs/RUNBOOK-sentinel.md:91`
avertit qu'un fichier « URL-only » produit exactement cet état. Test `sentinel_chainstack_url_alone_degrades_to_keyless`
(`apps/sentinel/test/sentinel-retry.test.ts:245`, **pass** dans l'oracle du clone) : exit 0, `chainstack=false`,
`chainstack_guard="unconfigured"`, **7** endpoints publics publiés, `line_hash` INCHANGÉ (endpoints hors champs hachés). Donc, si le
fait est confirmé : publication maintenue ; seule la provenance change (endpoints 8 → 7, `sentinel_sha` `a3ed49f4…` → `e73866a8…`) ;
**aucun appel Chainstack** de Narabi (le résiduel accepté 118 disparaît par dégradation) ; la sonde n'alerte pas
(`ADR-NARABI-OPS-1.md` item 8 : `chainstack_present:false` non alerté). Aucune surface publique n'affirme « 8 endpoints » ni
« Chainstack » (grep `README.md`, `apps/site/{lib,app,components}`, `skills` : 0 ; `/narabi` affiche l'UNION des endpoints,
`apps/site/lib/narabi-live.ts:376`) ⇒ **pas d'écart de registre PUBLIC** ; l'écart est de déploiement et de gouvernance.

### Conséquences sur des items dont le déclencheur est « 2ᵉ redéploiement »
- `ADR-NARABI-OPS-1.md:239` (FM-3.2/3.3 : liage verbatim des endpoints servis perdu, moitiés « chaîne vide » du garde non testées) :
  « aucun effet servi tant que le VPS exécute l'ancien code » — **prémisse caduque si confirmé**.
- `ADR-NARABI-OPS-1.md` items 7 (dérive d'origine), 8 (sonde muette sur `chainstack_present:false`), 10 (2ᵉ redéploiement).
- GARDE-FSYNC-1 (en vol) item I-1 (fsync du répertoire parent, déclencheur « avant le 2ᵉ redéploiement VPS ») : sans effet
  aujourd'hui (en `unconfigured`, la sentinelle n'écrit aucun ledger), mais la prémisse du déclencheur change.
- Preuve « pool L-1 + budget de rattrapage `built` » (`JOURNAL-PROVENANCE.md:357` : 8 endpoints dont chainstack) : décrit le code
  E-5, plus celui qui tourne.

### Vérification sur place (acte orchestrateur ; contrôles discriminants, aucun secret affiché)
| # | Contrôle | Attendu si le code -1d tourne | Attendu si E-5 tourne |
|---|---|---|---|
| V-1 | SSH lecture : `sha256sum /opt/monark-harness/apps/sentinel/src/run.ts` | `45557d6e12739449fdf679226b606aecb57d1abb1515ca7be672f0ee741df5db` | `54619a40252f842a77ccf6dedc89c129d5a11eba764cd5018ff5dafa1d7d0ef3` |
| V-2 | SSH lecture : `journalctl -u monark-sentinel --since "2026-09-23 00:50 UTC" -o cat` → JSON de fin | clé `chainstack_guard` présente (valeur `unconfigured` attendue), `chainstack:false` | pas de clé `chainstack_guard`, `chainstack:true` |
| V-3 | SSH lecture sans valeur : `grep -c '^CHAINSTACK_CYCLE_ID=' /etc/monark/sentinel.env` (un COMPTE, jamais le contenu) | 0 ⇒ `unconfigured` confirmé | — |
| V-4 | lecture sur place publique : dernières lignes de `https://monarkgate.tech/narabi/timeline.jsonl` | `sentinel_sha` `e73866a81bc8337a15d2d83d2798f47b3bd86d2f905eb8c1f1bd9d7e5748f286`, 7 endpoints | `sentinel_sha` `a3ed49f4edcd661eca3ba118488f9f277455ce35277dbd98218a611fa664582d`, 8 endpoints |
| V-5 | SSH lecture : `systemctl show monark-sentinel -p Result,ExecMainStatus` (et `systemctl is-failed monark-sentinel`) | `success` / `0` ⇒ code -1d en `unconfigured` (avec V-1 = `45557d6e…`) ; `exit-code` / `1` ⇒ **troisième issue** : import `@monark/rpc-guard` échoué sur l'hôte (ni `chainstack_guard` ni JSON de fin, unité en échec depuis le premier créneau après 00:54Z) — improbable (liens `@monark/*` dont `rpc-guard` présents à E-5, `JOURNAL-PROVENANCE.md:355`, et `npm ci` au redéploiement `bb41b6d`), mais seule issue que V-1..V-4 ne séparent pas | `success` / `0` |

Nuance V-4 : une ligne n'est écrite que si un jour est traité (`run.ts:352-362`) ; si la ligne du 2026-09-22 a été écrite par le tir
00:30-01:00Z AVANT 00:54Z, la première ligne du code -1d n'apparaît qu'au créneau 00:30Z du 2026-09-24 — V-1/V-2 tranchent dès maintenant.

### Recherche de solutions (ruling de l'orchestrateur ; options mesurées, aucune décidée ici)
| Option | Contenu | Pour (mesuré) | Contre (mesuré) |
|---|---|---|---|
| **R-a** restaurer les octets E-5 | ré-expédier l'arbre `c4981d0` | revient au plan écrit (ADR :224) | l'arbre est PARTAGÉ : une restauration complète réécrit aussi les fichiers du harness (processus en mémoire = `bb41b6d` jusqu'au prochain redémarrage — le couplage E-5 inverse) ; une restauration partielle (`apps/sentinel/src` seul) crée un hybride jamais testé (la fermeture sentinelle inclut `apps/harness/src/calibration.ts`, `packages/monark/src/*`, modifiés depuis `c4981d0`) |
| **R-b** accepter l'état de fait par D-n datée | la sentinelle tourne `bb41b6d` en `unconfigured` (keyless 7) ; le reste du §6-bis (clés de cycle, parent du ledger, dry-run, acceptation) reste soumis à P-1..P-3 | le code est G7-accepté (fusion `3659181`) ; mode testé (`sentinel-retry.test.ts:245`) ; 0 dépense Chainstack ⇒ aucune interférence avec le compte de la course (décision 121) | sert le résiduel FM-3.2/3.3 que l'ADR exigeait fermé AVANT (`ADR-NARABI-OPS-1.md:239`) ⇒ la D-n doit le nommer et dater son effet servi (liste `endpoints` publiée = `PUBLIC_ENDPOINTS`, test de longueur seulement) |
| **R-c** accélérer le pli §11-1 + G7 puis finir §6-bis | rend l'état planifié | ferme FM-3.2/3.3 | P-2 (clôture de course) resterait fausse : exige une dérogation datée à la décision 118 |
Critères de tranchage proposés : (i) l'état servi doit redevenir un état ÉCRIT (journal + ADR) ; (ii) aucun hybride non testé ;
(iii) aucun impact sur le compte Chainstack de la course ; (iv) le résiduel servi est nommé avec son test.

---

## CARTO-T1F-2 — un arbre de déploiement pour deux unités ; ni exclusion, ni contrôle de digest sentinelle au redéploiement harness

**Écart.** Cause structurelle de T1F-1 : `RUNBOOK-harness.md:48` impose `apps/` entier (validité de `npm ci` sur tous les workspaces) ;
`RUNBOOK-sentinel.md:26-28` en fait le canal de déploiement de la sentinelle ; aucune ligne des deux runbooks ne dit qu'un
redéploiement harness redéploie la sentinelle ; aucun test ni contrôle de CA ne lie « redéploiement harness » à « octets sentinelle
inchangés » (`scripts/verify-harness.mjs` : 12 contrôles, 0 « sentinel » ; digests contrôlés : 3 fichiers harness,
`JOURNAL-PROVENANCE.md:358`). C'est un tuyau `P-N7` (procédure → deux consommateurs) **présent sans test** (procédure, hors barème servi) au sens de la règle.

**Recherche de solutions** (options ancrées sur des précédents DU DÉPÔT, [lu] ; aucune affirmation externe) :
| Option | Mécanisme | Précédent dans le dépôt | Coût / risque mesuré |
|---|---|---|---|
| S-1 arbres séparés | `/opt/monark-sentinel` (archive + `npm ci` propres) ; l'unité sentinelle pointe dessus | la sonde tourne déjà depuis son propre arbre (`deploy/monark-probe.service:24`, `/opt/monark-probe`) ; la vitrine depuis `/opt/monark-app` (`docs/RUNBOOK-vitrine.md:3`) | la fermeture sentinelle (45 fichiers) inclut `apps/harness/src/calibration.ts` et 4 paquets : l'arbre dédié doit les porter ; 2ᵉ `npm ci` |
| S-2 garde de digest au redéploiement harness | le script de redéploiement calcule `sentinel_sha` (algorithme `run.ts:156-161`) de l'arbre expédié et de l'arbre en place ; s'ils diffèrent : refus sauf acte explicite journalisé | E-5 calculait les hachés attendus AVANT l'archive (`JOURNAL-PROVENANCE.md:353`) ; §6-bis étape (1) idem (`RUNBOOK-sentinel.md:342-346`) | faible ; n'empêche pas le couplage, le rend visible et bloquant |
| S-3 exclure `apps/sentinel` de l'archive harness | `git archive … ':!apps/sentinel'` | — | contredit `RUNBOOK-harness.md:48` (`npm ci` valide chaque workspace) ⇒ à mesurer avant d'être retenu |
| S-4 répertoire de release par SHA + lien symbolique par unité | chaque unité pointe une release figée | swap atomique de la vitrine (`/opt/monark-redeploy.sh`, `docs/TABLEAU-DE-BORD.md:41`) | refonte des deux runbooks |
Critères : (i) un redéploiement harness ne peut changer les octets exécutés par la sentinelle sans acte explicite journalisé ;
(ii) un contrôle non-LLM (test ou CA) le prouve ; (iii) aucun changement de manipulation de secret ; (iv) coût borné.
Propriétaire : orchestrateur. Déclencheur : avant le prochain redéploiement harness ; au plus tard avant l'exécution du §6-bis.

---

## CARTO-T1F-3 — `TABLEAU-DE-BORD.md` figé (registre interne)

**Écart.** `docs/TABLEAU-DE-BORD.md:3` : « Mis à jour par l'orchestrateur à CHAQUE événement … Dernière mise à jour :
2026-09-22T20:28Z » ; dernier commit qui le touche `153582f` (2026-09-22 20:29:10Z) ; **124** commits first-parent entre `153582f` et
`d0535cb` (`git rev-list --count --first-parent`) ; ligne `:42` : -1d « **EN COURS — chaîne de revue COMPLÈTE, G7 à rendre** » alors
que -1d est fusionné (`3659181`) et très probablement exécuté (T1F-1) ; ligne `:79` : « Clôture temps 1 … À VENIR » (juste). L'état
vivant est tenu dans `docs/ETAT-REPRISE.md`. Registre INTERNE (non public) : aucune surface publique n'en dépend.
**Forme** : correction de registre interne — soit mise à jour du TABLEAU, soit amendement de son en-tête qui désigne
`ETAT-REPRISE.md` comme état vivant (une seule source d'état courant). Propriétaire : orchestrateur. Déclencheur : prochaine édition
des fichiers d'état (ruling T1F-1 ou G7 UKEMI-REVERT-1, au premier des deux).

---

## Items EXISTANTS rappelés — état re-mesuré à `d0535cb` (non re-formés ; propriétaire orchestrateur ; déclencheurs inchangés sauf mention)

| Item | État mesuré | Fait nouveau (preuve) |
|---|---|---|
| CARTO-T1C-1 | **CLOS** | harness redéployé `bb41b6d`, CA 12/12 (`JOURNAL-PROVENANCE.md:358`) ; fermeture servie `bb41b6d..d0535cb` = 0 fichier |
| CARTO-T1C-2 | **CLOS** | exécution à `d0535cb` : description servie = clause registre-vide, sans phrase H-3 (`harness-runtime.out.json`) |
| CARTO-T1C-3 | ouvert | `apps/harness/README.md` : 0 ligne de diff depuis `7b99737` ; déclencheur U-4b-2b |
| CARTO-T1C-4 | ouvert, **renforcé** | le recorder réel du temps 1 a dépensé la jambe payante (52 048 RU, `CHANTIERS.md` @ `4a2f69f` l.1078) alors que l'AttestedBook se dit « keyless RPC quorum » (`README.md:117`) ; déclencheur G0 U-6 |
| CARTO-T1C-5 | **CLOS** | `u4b_chain_select_to_oracle_path` (`apps/sentinel/test/u4b-chain.test.ts:158`, fusion `8ed6226`) ; seul fichier important à la fois sélecteur et prober |
| CARTO-T1C-6 | **traité** | `graph.mjs` (AST) est l'outil primaire ; `carto.mjs` garde un angle mort de 15 arêtes (13 au 09-22), 0 arête en trop |
| CARTO-T1C-7 | ouvert, **grandi** | 10/15 fichiers `scripts/census/**` hors de toute racine CI (dont `u4b-hyp.mjs`, `u4b-probe-cutoff.mjs`, neufs) ; 0 lecture de clé hors racine ; la sonde (d) a son propre test B-5 (`u4b_probe_cutoff_script_is_keyless_clean_and_imports_closed`) |
| CARTO-T1C-8 / -10 / -11 | ouverts ; **déclencheur désormais identifié** | `apps/site` : 0 fichier modifié depuis `db14e8a` ; `deploy/` toujours absent de l'export (0 fichier sur 333). Fait postérieur au HEAD mesuré (`e5a329b`, docs seulement) : **décision 145** (charte Bell appliquée au site entier : index, narabi, ukemi, fleet, **bell, bell/method** ; livrables designer en local ; « site HORS gates (décisions 62/101) … registre live/upcoming exacts ») ⇒ le « prochain lot `apps/site` » qui déclenche T1C-8/-10/-11 est ce lot ; il doit aussi rejouer R-12 (Bell `upcoming` partout, décision 117 : 0 chemin servi Bell mesuré) et R-15 (les statuts ne doivent pas être recopiés en littéral — c'est exactement T1C-11). Question investisseur Q3 de `79f1505` (« Bell dans `PRODUCTS` de `lib/fleet.ts` ») : le gel `fleet_register_built_set_is_frozen` (`test/ci-gates.test.ts:800`) exige « exactly five products » (`:822`), tous `upcoming` (`:824`, ADR-M004 D14) et 12 `upcoming` au total (`:833`) ⇒ tout ajout rougit ce test et exige son amendement, avec le statut `upcoming` |
| CARTO-T1C-9 | ouvert, **récidive** | `d55fbb7` : « OTS entry timestamp corrected (07:14 UTC; PowerShell 'u' format printed local time labelled Z) » — même classe |
| UKEMI-REVERT-1 | lancé (`b07878f`, option A' de l'advisor) | composition manquante mesurée (paire P-U21) : le mécanisme « revert payant nu ⇒ banni ⇒ NoQuorum » est épinglé par 3 tests séparés (`paid_revert_with_empty_0x_data_is_benched`, `u4_oracle_path_paid_leg_is_metered_in_its_own_ledger`, `ukemi_budget_counts_http_attempts_and_caller_retry_is_scoped`) ; AUCUN ne compose la tolérance `description()` (`book.ts:82-92`, `prefetch.ts:46`) avec les DEUX opérateurs en revert sur la topologie de course — entrée pour son G0 |
| PROV-MODEL-1 | ouvert (reporté) | le brut du temps 1 porte `model: "claude-opus-4-8[1m]"` (constante `record.ts:410,455,488`) ; si UKEMI-REVERT-1 touche `record.ts`, son déclencheur « prochain lot recorder » est atteint |
| UKEMI-CONC-1 (rendez-vous `built`) | non atteint (état, pas dette) | ADR-U4b §4 (`:1950` sqq.) : `built` à la première course rapprochée « temps 2 à n > 1 » ; le temps 2 s'est arrêté après 182 appels (`CHANTIERS.md` @ `4a2f69f` l.1080) |
| K-1 | ouvert | `apps/sentinel/src/flow.ts:52` porte toujours `key: "deadbeef"` |
| GARDE-FSYNC-1 I-1 | lot en vol (`9ea2e8b`, non fusionné) | prémisse de déclencheur à relire si T1F-1 est confirmé (voir T1F-1) |

Aucun écart n'est une dette nue : chacun porte une forme, un propriétaire et un déclencheur.
