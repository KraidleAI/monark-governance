> Persisté par l'orchestrateur `claude-fable-5-1` le 2026-09-23 depuis `F:/tmp/t1b-g0/RENDU.md` (sha256 24e7cb7622679b15ca0cd73c493bc2600482c1eb5dca8d90f62f541ed8ebab86). G0 par le worker Opus 5.5 ; checkpoint-1 ACCEPTE-AVEC-CORRECTIONS C-1..C-10 pliées (v2) ; rulings R-T1b-1..7 ; DNS posé 13:49Z ; décision 147 (E-2 close).

Modèle résolu : claude-opus-5-5[1m]

# RENDU — G0 du lot T-1b-backend (Bell : publication signée, clé Ed25519, service, Caddy, DNS) — worker, 2026-09-23

Ce rendu est une donnée brute destinée à l'orchestrateur, qui la vérifie adversarialement (R-21) avant de la consommer.
- **Aucun** code, déploiement ou clé.
- **Aucun** commit ni workflow (R-20).
- **Aucun** accès VPS.
- **Aucune** écriture dans `F:\Monark`.
- Livrables écrits par l'outil Write (A-13) sous `F:\tmp\t1b-g0\`.

## 0. Livrables

| Fichier | Rôle | sha256 |
|---|---|---|
| `F:\tmp\t1b-g0\ADR-T1b-backend.md` | ADR de cadrage (gabarit `templates/adr.md` étendu : tuyaux, dépendances, MAST, `error_origin`) | voir §6 (valeur finale après le pli de l'advisor) |
| `F:\tmp\t1b-g0\SPRINT-BACKLOG.md` | 12 tâches, critères falsifiables, tests nommés, mutants, R-25, ordre, actes investisseur, consultation, CA-1..CA-11 | voir §6 |
| `F:\tmp\t1b-g0\RENDU.md` | ce fichier | donné dans le message de rendu (un fichier ne peut porter sa propre empreinte) |

## 1. Journal (horloge `date -u`)

- **12:54:02Z — démarrage.** HEAD `lot/etude-suite` = `83b8904` (base de la mission), arbre propre.
- **12:54 → 13:08Z — orientation.** Lecture seule :
  - gabarits : `templates/adr.md`, `backlog-passe.md`, `checklist-revue-G2.md`, `mission-worker.md`, `journal-provenance.md` ;
  - code : `apps/bell/src/collect.ts`, `digest.ts`, `close.ts` (extraits), `apps/bell/scripts/bell-report.mjs`, `apps/sentinel/src/run.ts` (l.150-200, 340-375), `flow.ts:52` ;
  - `deploy/*` : 7 fichiers ;
  - runbooks : `docs/RUNBOOK-harness.md`, `RUNBOOK-sentinel.md` (titres + §4-6) ;
  - ADR : ADR-B0 (intégral), ADR-T1aii (l.1-60, 72-107, 300-345, 397-500), ADR-M013, ADR-M018 ;
  - CHANTIERS : sections C/E + décisions 54-80, 116-146 ;
  - lettre SEC v3 : `LETTRE-4-927-v3.md`, `RENDU-v3.md` §5-§11, `G2-TEXTE-v3.md` (items I-G2, C-G2-3) ;
  - cartographie : `CARTOGRAPHIE-TEMPS-1-COURSE-2026-09-23.md` (T1F), `ECARTS-…` (T1F-2 S-1..S-4) ;
  - états : `TABLEAU-DE-BORD.md` §1, §4-7, `ETAT-REPRISE.md` §0-1 ;
  - validateur : `~/.claude/agents/validateur-humain.md` (CA-1..CA-11 et amendements) ;
  - tests : `test/no-secret-in-repo.test.ts`, `test/no-cash-provider-name.test.ts` ;
  - `vocab-banned.json` ;
  - commit `70bb716` du lot BELL-ADV-1, depuis fusionné dans `adc3260` (`volume.ts`, `collect.ts:285-296`).
- **~13:08Z — advisor intégré n° 1** (après orientation, avant rédaction). Douze corrections, toutes appliquées :
  1. la scission a/b reposait sur « pas de npm sur Bell », formule auto-citée : remplacée par les vrais discriminants (décisions 121/125/135, B-verdict, 4 secrets, ledger, `BELL_HALTS_CSV`) et options A/B/C coûtées ;
  2. la timeline servie est un objet T-1b nouveau : amendement ADR-B0 D2, `error_origin` planificateur ;
  3. `earliest_publish_utc` : lecture de D1-quinquies (C-6 option a = placement dans le digest) et du G0 -b3b (« consommé par la liste blanche d'export T-1b ») avant de choisir l'option (ii) ;
  4. `provenance.json` est servi (`digest.ts:106`), `journal.json` non ; liste blanche fichier par fichier ;
  5. formes P1/P2 de l'éditeur ;
  6. frontière avec le site ;
  7. sources systemd et Node lues à la source ;
  8. porte I-G2-2 + ruling ESC-2 ;
  9. K-1 en consultation ;
  10. actes investisseur ;
  11. CA-6..11 étiquetés « engagements » ;
  12. auto-oracle, R-25 et A-13.
- **13:12:25Z — lecture D1-quinquies + G0 -b3b C-6.** Résultat : aucun texte ne fixe la granularité de la liste blanche.
- **13:1x-13:2xZ — sources primaires.**
  - Node v24 `crypto.md` et systemd `systemd.exec.xml` téléchargés dans le scratchpad (octets hachés, lignes citées).
  - RFC 8032, man7 `rename(2)`/`fsync(2)`, Caddy docs, MDN ACAO, systemd.io/CREDENTIALS et MAST v3 lus par WebFetch ou Firecrawl ([lu-WF]).
  - Deux refus, **non contournés** ; une source **amont** équivalente a été lue à leur place :
    - freedesktop.org **403** ⇒ XML source du man page, dépôt systemd sur GitHub ;
    - manpages.ubuntu.com **503** ⇒ même source XML.
    - Pour Node, le Markdown source de la documentation v24.x a été lu, les extraits HTML de l'outil étant tronqués.
- **13:24:52Z — HEAD passé à `9d28549`** pendant la mission.
  - `git log 83b8904..9d28549` = 6 commits (G7 UKEMI-REVERT-1, CHANTIERS, designer) ; `git diff --stat` : 0 fichier sous `apps/bell`, `deploy/`, ADR-B0/T1aii, `docs/sec-4927`.
  - CHANTIERS : ajouts en fin de fichier et ligne 1125 corrigée ⇒ les numéros de ligne cités (≤ 1133) restent valides.
  - Fait nouveau intégré : BELL-ADV-1 pli 1b committé `70bb716`, re-G2-delta lancé.
- **13:25 → 13:30Z — rédaction.** ADR puis Sprint Backlog, par l'outil Write.
- **13:30:35Z — auto-oracle.**
  - `node scripts/grep-forbidden.mjs <fichier>` depuis `F:\Monark` (lecture seule) : **exit 0** sur l'ADR et sur le backlog (« scanned 229 file(s) », contre 228 sans cible : la cible est comptée).
  - **Portée exacte** : une cible CLI reçoit les **motifs GLOBAL seuls** (`scripts/grep-forbidden.mjs:28,250-256`). Le scope `bell` (`verified` nu, `guarantee`, `partner`, `price band`, `±`) n'est **pas** appliqué par la CLI.
  - **Complément manuel** : `grep -n -i -E '\bverified\b|guarantee|\bpartners?\b|partnership|price[- ]?band|±|probabilit|confidence|\bscore'` sur l'ADR et le backlog = **4 occurrences**, toutes en négation ou en citation méta de mutant : ADR l.181 et l.495, backlog l.33 et l.38.
  - **Témoin négatif** : fichier `neg-control.md` du scratchpad, portant une phrase conforme au motif GLOBAL `guaranteed\s+(correct|…)` (littéral non reproduit ici) ⇒ **exit 1** (la gate rougit bien).
  - `git status --short` = 0 ligne (dépôt intact).
- **13:31:09Z — empreintes intermédiaires.** ADR `a8b2992f…`, backlog `1fffe711…` ; 0 octet CR dans les deux.
- **Après 13:31Z — advisor intégré n° 2, avant clôture.** Voir §7.
- **13:32 → 13:38Z — pli de l'avis n° 2**, dans l'ADR, le backlog et RENDU.
- **13:38:11Z — défaut d'outillage de ma part.** L'affichage `exit=$?` était faussé par un `$(basename …)` qui réinitialise `$?`. Relance à **13:38:42Z** avec capture correcte : ADR, backlog et RENDU **exit 0** ; témoin négatif **exit 1**. Le RENDU citait le littéral du témoin et rougissait réellement ; il est reformulé.
- **13:38:53Z — empreintes de la v1** de l'ADR et du backlog, figée à cette heure. Elle est conservée telle quelle dans `*.v1.md` ; le journal de la v2 est au §7-bis.

## 2. Décisions proposées par le G0 (détail dans l'ADR ; aucune n'est un verdict)

> **État v1 (13:31Z).** Les deltas v2 sont au §7-bis :
> - R-T1b-1..7 appliqués ; E-1 tranchée (R-T1b-5) ; E-2 close (décision 147) ; K-1 découplé (R-T1b-4) ;
> - `close_source` **non servi** (R-T1b-2), en plus d'`adv_source` ;
> - corrections C-1..C-10 pliées.
>
> Les puces ci-dessous décrivent la v1.

1. **Hôte et arbre.** VPS Bell `bell.monarkgate.tech`, arbre dédié `/opt/monark-bell`.
   - Contrôle d'empreinte par fichier livré ; empreintes de `/opt/monark-probe` inchangées avant/après.
   - **Aucun redéploiement harness** : SENTINEL-DEPLOY-GUARD-1 non déclenché, leçon CARTO-T1F-2 appliquée par construction (ADR §D1).
2. **Collecte.** Option **C** : le lot a publie des runs produits sur le poste opérateur ; le timer de collecte VPS devient le lot b (item **BELL-COLLECT-TIMER-1**, déclencheur conjonctif). Le report est une décision de périmètre, **signalée CA-2 (E-1)** et non tranchée (ADR §D2).
3. **Éditeur P1** : trois `.mjs` en built-ins ; duplication de `canonical`/`CLOSE_KEY` épinglée par test. P2 est liée au lot b (ADR §D3).
4. **Entrée.** Bundle de N ≥ 1 runs `runMain` ; neuf contrôles fail-closed (ADR §D4).
5. **Fichiers servis.**
   - Servis : `state.json` (enveloppe `runs[]`), `provenance.json` (projection **sans `adv_source`**, décision 69), `timeline.jsonl`, `pubkey.json`, immuables `states/` et `provenance/`.
   - Non servi : `journal.json` (ADR §D5).
6. **Timeline servie.** Objet `bell-timeline-v1` : une ligne par événement, signature Ed25519 sur la forme canonique sans `sig`, chaînage sur la ligne complète. Amendement ADR-B0 D2 (ADR §D6).
7. **`earliest_publish_utc`.** Refus du bundle entier, option (ii), qui préserve l'identité du `bell_sha` rejoué. PR-B-DBN n° 8 bloque la première publication (ADR §D7).
8. **Écritures.** tmp → `fsync` → `rename` → `fsync(rép.)`. Les immuables restent dans `staging/` (privé) jusqu'au point de commit (ajout privé), puis sont renommés dans `public/`. Invariants I-1 à I-3, dont : aucun fichier servi sans ligne commitée qui le cite (ADR §D8).
9. **Clé.**
   - Génération **après I-G2-2**, puis `LoadCredential` (≥ v247) et `PrivateNetwork=yes` avec un second verrou dans le code (imports).
   - Trois canaux publics concordants.
   - Rotation contre-signée ; révocation ; perte rapportée comme rupture.
   - Aucune période de rotation inventée (ADR §D9).
10. **Service et Caddy.** Unité oneshot sans timer ; Caddy `bell.monarkgate.tech` en `file_server` sans `browse`, ACAO `*`, sans journal d'accès (ADR §D10).
11. **CA.** `scripts/verify-bell.mjs`, 12 contrôles ; `tls.authorized` obligatoire (ADR §D11).
12. **Registre.** Registre public **inchangé**, Bell `upcoming` ; frontière site et export tabulée (ADR §D12).
13. **Amendements portés.** Dont la **décision 80** (« à inscrire dans l'ADR-B0 au G0 de T-1b ») et la ligne vocab du scope `bell` (ADR §D13).

## 3. Constats de première main (rejouables)

| # | Constat | Preuve |
|---|---|---|
| V-1 | La timeline du collecteur repart de `GENESIS` à chaque run et compte une ligne par symbole. | `sed -n '80,93p;255,275p' F:/Monark/apps/bell/src/collect.ts` |
| V-2 | `earliest_publish_utc` est « consumed by a T-1b export whitelist » ; aucune granularité fixée. | `sed -n '76,83p' apps/bell/src/digest.ts` ; `grep -n "liste blanche" docs/G0-lot-t1a-ii-b3b.md` |
| V-3 | L'enveloppe de provenance est « published too (T-1b, /bell/*.json) ». | `sed -n '104,108p' apps/bell/src/digest.ts` |
| V-4 | **Conflit décision 69** : `ADV_SOURCE = "massive-aggs-range-1-day-unadjusted"` est placé dans `provenance.sources`. Servi tel quel, il ferait rougir la forme `\bmassive\b` du test racine. | `git show adc3260:apps/bell/src/volume.ts \| sed -n '139,140p'` ; `git show adc3260:apps/bell/src/collect.ts \| sed -n '294,301p'` (v2 : commandes re-pointées sur l'arbre fusionné) ; `sed -n '28,33p' test/no-cash-provider-name.test.ts` |
| V-5 | Narabi copie ses fichiers publics par `copyFileSync` (non atomique au sens `rename(2)`). | `sed -n '356,362p' apps/sentinel/src/run.ts` |
| V-6 | Le scope vocab `bell` ne couvre que `apps/bell/src` en `.ts`. | `node -e 'console.log(JSON.stringify(require("./vocab-banned.json").scan.bell.dirs))'` |
| V-7 | K-1 est inscrit comme bloquant de T-1b ; son objet est la clé Narabi. | `sed -n '45p;84p' docs/CHANTIERS.md` ; `sed -n '52p' apps/sentinel/src/flow.ts` |
| V-8 | La décision 80 exige une inscription dans ADR-B0 « au G0 de T-1b ». | `sed -n '229p' docs/CHANTIERS.md` |
| V-9 | L'item (6) décision 69 a pour déclencheur « G0 T-1b ». | `sed -n '329,330p' docs/CHANTIERS.md` |
| V-10 | Node v24 : pour Ed25519, `algorithm` doit valoir `null` ou `undefined`. | scratchpad `node-v24-crypto.md` (sha `9646e88a…`) l.6229-6235 |
| V-11 | `LoadCredential=` : accès réservé à l'utilisateur de l'unité, **v247** ; `PrivateNetwork=` : loopback seul, « should not solely rely ». | scratchpad `systemd.exec.xml` (sha `44b89bff…`) l.3879-3887, 4015, 2054-2071 |

## 4. Ce que je n'ai pas pu établir (et ce qui est formé à la place)

1. **Les faits VPS actuels** (Caddyfile en place, version de systemd, npm, ufw) : aucun accès VPS (mission). Ils sont portés par les **contrôles sur place** du D-n (ADR §D11), [lu, docs] `CHANTIERS.md:123` en attendant.
2. **Le périmètre des sauvegardes Hostinger** : c'est un acte de l'orchestrateur (lecture sur place, I-G2-2). **Porte** de la génération de la clé.
3. **La sémantique « after 24 hours » de Databento** : PR-B-DBN n° 8, lecture sur place par l'orchestrateur. **Porte** de la première publication.
4. **Le `Content-Type` servi par Caddy v2.11.4 pour `.jsonl`** : mesuré au G1 en loopback et épinglé par la CA. Aucune affirmation n'est faite ici.
5. **L'existence d'une fenêtre de lecture d'une copie Narabi en cours** : hypothèse non mesurée. Item d'observation NARABI-COPY-ATOMIC-1, à router.
6. **Le schéma exact de `volume[]` après la fusion de BELL-ADV-1** : figé au G1, après le G7 BELL-ADV-1 (dépendance déclarée).

## 5. Items, escalades, consultation (propriétaire orchestrateur sauf mention ; aucun « dû » nu)

> **État v1.** En v2 (§7-bis) :
> - E-1 est **tranchée** (R-T1b-5) et E-2 **close** (décision 147) ;
> - la consultation K-1 est **tranchée** (R-T1b-4 : découplage) ;
> - BELL-ACCESS-LOG-1 est re-formé (déclencheur : décision 78) ;
> - items ajoutés : CLOSE-SOURCE-NAMING-1, JURISTE-ACTE-NOV-1 (investisseur), PUBLISH-LOCK-1 (mission §9) ; EXPORT-BELL-1 étendu à `report.test.ts:69` ;
> - le DNS est **fait** (13:49Z).

- **Items formés** :
  - BELL-COLLECT-TIMER-1 (lot b) ;
  - EXPORT-BELL-1 ;
  - BELL-ACCESS-LOG-1 ;
  - BELL-PROBE-1 ;
  - C-4-RENDER ;
  - NARABI-COPY-ATOMIC-1 (observation hors lot) ;
  - T-1b-site × 4 (`/bell/method`, `/bell/anchors/`, panneau + `bell_panel_reads_published_state`, `fleet.ts` Kane/PRODUCTS + collision du nom) ;
  - PR-B-8 MWCB re-formé (release Bell).
- **Escalades** (CA-2) :
  - **E-1** : report de la collecte VPS ;
  - **E-2** : exposition des fichiers de données avant le juriste (décision 79).
- **Rulings orchestrateur attendus** :
  - §D7 option (ii) ;
  - `close_source` servi ou non (§D5) ;
  - formule ESC-2 après I-G2-2 (§D9).
- **Consultation formée** (ADVISOR, canal 2) : K-1 couplé, découplé, ou réutilisation de la procédure. Texte complet en ADR § « Demande de consultation » et dans le backlog.
- **Actes investisseur nommés, non faits** :
  - DNS A `bell.monarkgate.tech` → adresse de l'hôte Bell ;
  - décision sur les sauvegardes ;
  - juriste (E-2) ;
  - lot b : clé ou compte Helius, pose des secrets, ruling sur le ledger.

## 6. Empreintes finales (recalculées après le dernier pli)

**Version v2**, courante : recalculée à 14:25:43Z ; fichiers figés depuis ; 0 octet CR dans chacun.

- `ADR-T1b-backend.md` (579 lignes) : `199490961a0e252bff86775ff21fef9e49a73528bf86c053ae4fb38ca9763bd4`
- `SPRINT-BACKLOG.md` (107 lignes) : `c2aae89361918f64e66ad2a073ca7fb0d3d1567f55f31b15804cca3545d7241b`
- `MISSION-G1-PR1.md` (331 lignes) : `fa1c51ea6d6808f20bdc91ffc903a33b101331dfeea5e170df1e9aa1003b3b2f`. Elle cite les deux empreintes v2 ci-dessus.

**Version v1**, conservée telle quelle, figée à 13:38:53Z :

- `ADR-T1b-backend.v1.md` (515 lignes) : `d32ed37e34f4278fb11275c2d9d6f0b3fd0262a0c1da19f78e567601d275d1ea`
- `SPRINT-BACKLOG.v1.md` (117 lignes) : `ab2f184e6892cb8900edbefd103cbe72e81cf5192b7666a2b52eae3233697867`

**Traçabilité** : ADR `a8b2992f…` et backlog `1fffe711…` avant le pli de l'avis n° 2 ; ADR v2 `bec168e2…` puis `0ef50242…` avant les corrections d'ancres et la source `NeedDaemonReload`.

`RENDU.md` : l'empreinte figure dans le message de remise (un fichier ne peut porter la sienne).

## 7. Advisor n° 2 (avant clôture)

- **Bloquant, plié.** §D8 était ambigu sur l'emplacement des immuables. Tranché : ils naissent dans `staging/` (privé) et sont renommés dans `public/` après le point de commit. Invariants I-1 à I-3 écrits, transitoire déclaré. Backlog S-3 aligné.
- **Précisions pliées** :
  - portée de l'auto-oracle : GLOBAL seul, avec le grep manuel du scope `bell` (§1) ;
  - « non contournés » pour les refus 403/503 (§1) ;
  - `residuals_total` retiré, et principe écrit : « l'éditeur enveloppe et signe, ne calcule aucun fait » (ADR §D5) ;
  - test décision 69 en second `test()` de `test/no-cash-provider-name.test.ts` (ajouté aux « Modifiés ») ;
  - clé du KAT bâtie en mémoire, sans exception dans la garde de secret ;
  - `bell-report.mjs:109` ajouté à la purge EXPORT-BELL-1 ;
  - contrôle `sudo -u caddy test -x` (traversée) ;
  - « analogue M013 T2 », le backend étant gaté directement par 62/101.
- **Aucun changement d'architecture ni d'option.** `PrivateNetwork=` reste cité sans version, faute de `version-info` propre dans la source.

## 7-bis. Pli du checkpoint-1 → v2 (2026-09-23, 14:00Z → 14:2xZ)

**Entrées lues.**
- Le checkpoint-1 `F:\tmp\cp1-t1b\CP1.md` : sha256 `d8f95c8a2f072ec5fe781a33ac7f1ab806ad5ee890e2c052cbe9e1121ff89767`, **recalculé = annoncé**, ACCEPTE-AVEC-CORRECTIONS C-1..C-10.
- `F:\tmp\t1b-g0\RULINGS-orchestrateur.md` : sha256 `1da85a27…e787`, rulings R-T1b-1..7.
- Deux messages de l'orchestrateur : rulings sur C-1..C-10 (~14:00Z) ; G7 BELL-ADV-1, base et worktree (~14:0xZ).
- Dépôt relu à `c0f905c` : G7 BELL-ADV-1 `adc3260` et docs ; `git status` = 0.

**Journal (horloge `date -u`).**
- **14:00:05Z** : lecture de CP1, sha vérifié.
- **14:06:06Z** : v1 conservées.
  - `ADR-T1b-backend.v1.md` = `d32ed37e34f4278fb11275c2d9d6f0b3fd0262a0c1da19f78e567601d275d1ea` ;
  - `SPRINT-BACKLOG.v1.md` = `ab2f184e6892cb8900edbefd103cbe72e81cf5192b7666a2b52eae3233697867`.
- **14:0x-14:1xZ** : sources nouvelles, lues à la source.
  - `systemctl.xml` (`caca7b87…`, l.349-359) ;
  - Caddy `import` [lu-WF] ;
  - ancres re-mesurées à `adc3260`.
- **14:14:54Z → 14:19:51Z** : écriture de l'ADR v2, du backlog v2 et de la mission ; gates.
- **~14:20Z** : `org.freedesktop.systemd1.xml` (`59cfeea5…`, l.2809-2811, `NeedDaemonReload`) ; ADR re-figé ; empreinte de la mission mise à jour.

**Diff résumé, correction par correction** (le détail est en ADR v2, section « Traçabilité »).

| Correction | Changement v1 → v2 | Où |
|---|---|---|
| **C-1** | Déviation de la décision 54 nommée : `.timer` et service de collecte au lot b ; `monark-bell.service` remplacé par `monark-bell-publish.service` ; motifs ; `error_origin` planificateur ; investisseur informé (décision 137) ; ligne d'amendement ADR-B0 D7/D8 + CHANTIERS `:119` | ADR §D2, §D13.2, §error_origin |
| **C-2** | BELL-ACCESS-LOG-1 re-formé, déclencheur **décision 78** (boîte de contact) ; **aucun journal d'accès** jusque-là ; forme RGPD rulée à ce moment-là (GO 147 pour les textes) ; conséquence : les signaux 78 se comptent à l'activation du journal | ADR §D10, §Conséquences |
| **C-3** | `runMain` à `--out` **réel hors dépôt** ; bundle = répertoire tel qu'écrit ; égalité profonde `runs[i]` ↔ `state.json` parsé ; `published_at` lu une fois, identique dans la ligne et l'enveloppe | ADR §D4, T-a ; backlog S-3 (e), S-5 (a-c) |
| **C-4** | Liste blanche **dérivée des types** (`GapEntryFilled ∪ GapEntryAbstained` par `Record<GapKey,true>` sous `tsc` ; `RESIDUAL_CODES`) et des sites de construction ; couverture par des sorties réelles de toutes les formes ; fixture E2E avec gap abstenu et `rebase_residuals` | ADR §D5 (tableau de dérivation) ; backlog S-2 (b-c), S-5 (d) |
| **C-5** | Configuration **réellement chargée** : fichier Caddy dédié remplacé en bloc, `import` depuis le Caddyfile principal s'il porte d'autres sites, sinon remplacement ; contrôle 11 (b) Caddy et (c) `systemctl cat` (un fragment, aucun drop-in) + `NeedDaemonReload=no` ; mutant « unité copiée modifiée » | ADR §D1, §D10, §D11, T-j ; backlog S-9, S-11 |
| **C-6** | `CLOSE_KEY` (non exporté, `digest.ts:38` @ `adc3260`) : égalité **double**, littéral extrait (méthode `report.test.ts:88`) + comportement sur un corpus de 14 noms | ADR §D3 ; backlog S-1 (b) |
| **C-7** | Constantes **valuées et motivées** : `MAX_RUNS=64`, 64 MiB ×2, `MAX_LINE_BYTES=1 MiB`, `CPUQuota=25%`, `MemoryMax=512M` + tas 448, `TasksMax=32`, `TimeoutStartSec=120` ; bornes injectables ; mutants à 2× la borne ; tailles **mesurées** au G1 | ADR § « Constantes » ; backlog S-2 (d), S-7 ; mission §5.4 |
| **C-8** | D-n : portes **G-a..G-e** avant l'étape 9, chacune avec sa **pièce** (FAITS PR-B-DBN n° 8 ; lecture hPanel + décision sur les sauvegardes ; `dig` + CHANTIERS:1157-1158 ; sha du bundle) ; JOURNAL citant chaque pièce ; oracle complet avant tout push | ADR §D11 ; backlog S-12 |
| **C-9** | Racine de confiance = **trousseau committé** (`--keyring`) ; clé servie = canal recoupé ; rupture de continuité acceptée seulement si la nouvelle clé est dans le trousseau fourni ; sans `--keyring` ⇒ « auto-cohérent seulement » ; test et mutant nommés | ADR §D9, §D11 ; backlog S-4, S-6 |
| **C-10** | URL canonique unique **`https://bell.monarkgate.tech/bell/pubkey.json`** (`public/bell/pubkey.json`) ; amendement ADR-B0 D8 et décision 78. **Interprétation déclarée** : le ruling fixe le chemin, pas l'hôte ; l'hôte Bell est retenu (sinon changement local vers T-1b-site) | ADR §D5, §D9, §D13.4 ; backlog S-8, S-9 |

**Rulings et faits intégrés.**
- R-T1b-1 : option (ii).
- R-T1b-2 : `close_source` **non servi** (la v1 le servait sauf ruling).
- R-T1b-3 : ESC-2 après I-G2-2.
- R-T1b-4 : K-1 découplé ; la consultation est **tranchée**.
- R-T1b-5 : E-1, option C.
- R-T1b-6 : sans objet (décision 147).
- R-T1b-7 : NARABI-COPY-ATOMIC-1 accepté. Le ruling écrit `apps/narabi/.../run.ts` ; le fichier réel est `apps/sentinel/src/run.ts:360`, et c'est lui qui est porté.
- DNS **levé** (13:49Z) ; E-2 **close** ; **JURISTE-ACTE-NOV-1** (entrée 14:05Z) ; G7 BELL-ADV-1 `adc3260` : porte levée.
- La branche et le worktree retirés ne sont plus cités (0 occurrence, grep).

**Observations hors lot formées en items** : `report.test.ts:69` (`:67` à `83b8904`) ajouté à la purge **EXPORT-BELL-1** ; nommage de la source de clôture = **CLOSE-SOURCE-NAMING-1** (T-1b-site, déclencheur G-b).

**Points non bloquants du CP1** : (i) couvert par C-in-8 ; (ii) `Content-Type` mesuré au G1 ; (iii) phrase « détectable par qui » (ADR §D6, RUNBOOK, `/bell/method`).

**Ajouts du rédacteur, déclarés** (non exigés par le CP1) :
- **C-in-10** : `bell_sha` en double dans un bundle ⇒ refus.
- **S-3 (f)** : la CLI ne lit la clé que dans `$CREDENTIALS_DIRECTORY`.
- **E-1 de la consigne** : verrou de publication hors PR-1, proposé comme item **PUBLISH-LOCK-1** (mission §9.11).

**Errata v1**, trouvés à la relecture des ancres (non relevés par le CP1) ; `error_origin` : rédacteur G0 :
- **E-v1-1** : `CLOSE_KEY` est à `digest.ts:33`, non `:32` ; `canonical` à `:23-31`, non `:22-30`, à `83b8904`.
- **E-v1-2** : l'enveloppe de provenance est à `collect.ts:258-264`, non `:287-296`, à `83b8904`.
- Contenu inchangé : seuls les numéros étaient faux.

**Ancres de tests corrigées pour `adc3260`** : `collect.test.ts:680-744` (précédent `runMain` hors ligne), `:770-817` (trajectoire), `:818-841` (`gate.residuals`) ; `close.ts:69-74`.

**Mission G1 PR-1** : `F:\tmp\t1b-g0\MISSION-G1-PR1.md`.
- Tâches S-1..S-3, R-25 ≈ 995, seam S-3 → PR-2.
- Base = pointe de `lot/etude-suite` lue par `git rev-parse` (≥ `adc3260`) ; worktree `F:\Monark-wt-t1b`, créé par l'orchestrateur.
- Consigne : A-1..A-13, D-1-bis, REVIEW-TAP-1, ceinture `env -u` × 8, `TEMP` et tout `--out` sous `F:\tmp\t1b-a1\`.
- Sans clé réelle, sans déploiement.

**Mission : ajouts après l'avis n° 3 de l'advisor.**
- Export nommé **`publishToDir`**, nom exact de l'ADR §D12 ; la liste de paramètres de l'ADR est indicative, écart déclaré dans la mission.
- Code de refus **`signing_key_not_in_keyring`** : trousseau créé au premier run (`valid_from_seq: 1`), clé chargée ≠ clé active ⇒ refus. Test `bell_publish_refuses_signing_key_not_in_keyring` et mutant. Ajout de la mission, déclaré.
- Estimation R-25 de la PR-1 : ≈ 840 (v1) → **≈ 995** (v2 : C-3, C-4, C-6, C-7, C-in-10, S-3 (f)). Seam S-3 → PR-2 si > 1 150.

**Verbatims des deux messages de l'orchestrateur** (re-lisibles par le checkpoint-2 ; **à persister** dans CHANTIERS ou dans `RULINGS-orchestrateur.md` v2, sha consigné). Seuls les deux noms retirés sont remplacés par `[retiré]`, sur consigne.
- **~14:00Z** : « Checkpoint-1 T-1b-backend rendu : ACCEPTE-AVEC-CORRECTIONS, liste fermée C-1..C-10 dans `F:\tmp\cp1-t1b\CP1.md` (sha256 d8f95c8a2f072ec5fe781a33ac7f1ab806ad5ee890e2c052cbe9e1121ff89767). Faits nouveaux à intégrer : DNS A `bell.monarkgate.tech` → adresse de l'hôte Bell, posé 13:49Z (porte DNS levée) ; décision 147 (GO juriste global, acte formel en novembre) → décision 79 levée, E-2 close, R-T1b-6 sans objet ; G7 BELL-ADV-1 en cours (fusion `adc3260`, oracle en vol). Applique C-1..C-10 dans `ADR-T1b-backend.md` et `SPRINT-BACKLOG.md` (mêmes fichiers, versions v2 ; garde les v1 en `*.v1.md` avec sha) avec ces rulings orchestrateur : **C-1** déviation de la décision 54 (`.timer` livré au lot b) journalisée nommément dans l'ADR, `error_origin` planificateur, investisseur informé par moi ; **C-2** BELL-ACCESS-LOG-1 : déclencheur = décision 78 (boîte de contact) ; ruling : AUCUN journal d'accès Caddy jusqu'à ce déclencheur (déjà la position de l'ADR) ; la forme RGPD sera rulée à ce moment-là, le GO 147 couvrant les textes ; **C-3..C-10** appliquées telles que formulées (S-5 `runMain` hors dépôt + deep-equality + `published_at` unique ; liste blanche dérivée des types + fixture E2E abstenue ; CA sha Caddyfile/`systemctl cat` == `git show <G7>` et RUNBOOK tranchant remplacement vs `import` — retiens REMPLACEMENT du Caddyfile dédié via `import` depuis le Caddyfile principal si l'hôte en a un, sinon remplacement ; `CLOSE_KEY` égalité de littéral ET comportementale ; constantes valuées et motivées ; étapes de porte explicites dans la D-n avec pièce probante ; racine de confiance = trousseau committé, `--keyring` absent ⇒ « auto-cohérent seulement » ; un seul chemin de clé publique : retiens `/bell/pubkey.json` servi ET référencé par ADR-B0/78 — amendement ADR-B0 à écrire). Ajoute les deux observations hors lot comme items formés (report.test.ts:67 → EXPORT-BELL-1 ; nommage source de clôture → T-1b-site). Puis découpe la mission G1 de la PR-1 (≈ 840 lignes : éditeur `.mjs` + tests, sans clé ni déploiement) en un fichier `MISSION-G1-PR1.md` prêt à lancer (consigne standard `docs/CONSIGNE-STANDARD-G1.md`, A-1..A-13, D-1-bis, REVIEW-TAP-1, ceinture `env -u` × 8, `--out` sous `F:\tmp`). Ne committe rien ; rends les sha des v2 et le diff résumé C par C. »
- **~14:0xZ** : « Fait nouveau : G7 BELL-ADV-1 ACCEPTÉ — fusion `adc3260` sur `lot/etude-suite`, oracle 7 × 0 (porte test 1 083 = 1 074 + 9 au rejeu), ADR-B0 §1 et ADR-T1aii §2 insérés (docs `lot/etude-suite` HEAD ≥ `adc3260`, docs commit suivant). La porte « G7 BELL-ADV-1 » du G1 PR-1 est levée : dans `MISSION-G1-PR1.md`, fixe la base du lot = pointe courante de `lot/etude-suite` (lue par `git rev-parse`, ≥ `adc3260`) et le worktree `F:\Monark-wt-t1b` (à créer par l'orchestrateur). Le worktree `[retiré]` et la branche `[retiré]` sont retirés : ne les cite plus. »

**Contrôles v2.**
- `grep-forbidden.mjs` exit 0 sur l'ADR v2, le backlog v2 et la mission (capture directe).
- Grep manuel du scope `bell` : l'ADR 3 et le backlog 2 occurrences, toutes en citation de mutant ou en négation ; la mission 1 (le motif de grep lui-même).
- 0 octet CR ; `git -C F:/Monark status --short` = 0.

## 8. Rejeu (R-21)

- **Gate** :

  ```
  cd F:/Monark && node scripts/grep-forbidden.mjs F:/tmp/t1b-g0/ADR-T1b-backend.md && node scripts/grep-forbidden.mjs F:/tmp/t1b-g0/SPRINT-BACKLOG.md
  ```

  Attendu : exit 0 ×2. Témoin négatif : un fichier portant une phrase conforme au motif GLOBAL `guaranteed\s+(correct|…)` ⇒ exit 1.
- **Empreintes** :

  ```
  sha256sum F:/tmp/t1b-g0/*.md
  tr -cd '\r' < <fichier> | wc -c        # attendu 0
  ```

- **Sources téléchargées** :
  - `curl -sS https://raw.githubusercontent.com/nodejs/node/v24.x/doc/api/crypto.md | sha256sum` (valeur au 2026-09-23 : `9646e88a…ba96b` ; la branche est mobile, donc re-hacher au rejeu) ;
  - `curl -sS https://raw.githubusercontent.com/systemd/systemd/main/man/systemd.exec.xml | sha256sum` (au 2026-09-23 : `44b89bff…d844` ; branche mobile).
- **Base du dépôt** :

  ```
  git -C F:/Monark log --oneline 83b8904..9d28549
  git -C F:/Monark diff --stat 83b8904 9d28549 -- apps/bell deploy docs/adr/ADR-B0-programme-bell.md docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md docs/sec-4927
  # v2 : base du G1 = adc3260 (G7 BELL-ADV-1) ; le commit de docs suivant ne touche ni le code Bell ni deploy/
  git -C F:/Monark diff --stat adc3260 c0f905c -- apps/bell deploy
  ```

  Attendu : 0 fichier pour les deux `diff --stat`. Constaté à 14:2xZ : sortie vide pour chacune.
