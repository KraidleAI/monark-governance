# ADR-BELL-OTS-ANCHOR-1 : ancrage OpenTimestamps des enregistrements publiés de Bell (timeline signée servie)

- **Statut** : PROPOSÉ (G0), à soumettre au checkpoint-1 (validateur-humain `claude-fable-5-1`). Ce document n'écrit aucun code, ne committe rien et n'émet aucun appel vers un calendrier (R-20). Tout acte (stamp, commit, push, upload) reste un acte de l'orchestrateur.
- **Rédaction** : worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` déclaré à l'ouverture, R-1), effort max, contexte frais, le 2026-09-24 : première lecture datée 08:54:51Z, dernière horloge relevée 09:21:26Z (`date -u`, avant la mise au propre finale). Mission : orchestrateur `claude-fable-5-1`, décision investisseur 186. Réviseurs : orchestrateur (R-21), puis checkpoint-1.
- **Base lue** : `e1a1e7e` ; tête relue à 09:21:26Z : `7224c79`, qui n'ajoute que la ligne 1418 de `docs/CHANTIERS.md` (`git diff --stat e1a1e7e 7224c79` : aucun autre fichier cité ici n'a changé).
- **Rattachement** : décision 186 (`docs/CHANTIERS.md:1405` : « 186 ancrage OpenTimestamps Bell : G0 formé après la publication seq 2 ») ; décision 124, option B, ancres de la course de contre-vérification (`docs/CHANTIERS.md:629-636`) ; décision 146, ruling Q2 : manifestes et preuves servis sous `/bell/anchors/`, statut lu du fichier (`docs/CHANTIERS.md:1133`) ; ADR-T1b-backend D5, D6, D9, D12 et tuyaux (`docs/adr/ADR-T1b-backend.md:176-226`, `:256-284`, `:359-371`, `:403-416`) ; ADR-B0, alternative rejetée « ancrage on-chain » (`docs/adr/ADR-B0-programme-bell.md:100`, reprise `docs/adr/ADR-T1b-backend.md:483`) ; ADR-BELL-CASH-LEG-1 (publication seq 2, item BELL-VERIFY-SCHEDULE-1, `docs/adr/ADR-BELL-CASH-LEG-1.md:38`) ; ADR-M018 D3, section Tuyaux obligatoire (`docs/adr/ADR-M018-regle-branchement.md:25-27`) ; limite de l'ancrage, D1-octies et décision 124(3) (`docs/course-bell/ANCHORS.md:12-13`, `docs/CHANTIERS.md:632`) ; RUNBOOK-bell étapes 9 à 13 et « Next publications » (`docs/RUNBOOK-bell.md:289-379`).
- **Engagement public qui motive le lot** : tweet de l'investisseur, texte transmis par la mission : « the anchoring layer comes next, so a record can be shown to exist at a point in time by anyone, without asking us ». Ce texte n'est pas dans le dépôt (item TWEET-186-PERSIST-1, §6).

## 0. Décisions proposées, une ligne chacune

- **D1 (quoi)** : à chaque nouvelle ligne de la timeline servie, horodater un **manifeste de publication** au format existant `<relpath> <sha256hex>`, qui liste la ligne signée elle-même (`timeline.jsonl#L<n>`, digest = son `line_hash`), le préfixe de la timeline jusqu'à elle (`timeline.jsonl#L1-L<n>`, digest = celui du miroir de l'étape 13) et les deux immuables qu'elle nomme. Les ancres de course restent un objet distinct.
- **D2 (quand)** : à chaque publication et à chaque ligne de clé, nouvelle étape 13 bis du RUNBOOK, sur la machine opérateur, jamais sur l'hôte Bell ; une seule ancre de rattrapage pour seq 2, qui couvre aussi seq 1.
- **D3 (où)** : registre séparé `docs/bell-publications/ANCHORS.md`, servi sous `/bell/anchors/` (fichiers `timeline-seq<n>-manifest.txt[.ots]`, `publications.json`) par extension de `scripts/sync-bell-anchors.mjs` ; le registre de course reste gelé.
- **D4 (tiers)** : vérification en six gestes avec des outils standard, le client ouvert et un nœud Bitcoin du choix du lecteur ; aucun logiciel, compte ni requête MONARK ; bornes écrites.
- **D5 (passage à « anchored »)** : état dérivé par une fonction pure `publicationAnchorState` : un manifeste dont l'entrée `timeline.jsonl#L<seq de la tête>` porte exactement le `line_hash` de la tête, dont la preuve atteste ce manifeste ET porte au moins un enregistrement de bloc Bitcoin. Le `.some` actuel sur `state_sha256`/`bell_sha` est retiré. Tests nommés, mutants nommés.
- **D6 (pendante puis mise à niveau)** : trois états affichés, `none`, `pending`, `anchored` ; jamais « anchored » tant que la preuve ne porte pas de bloc ; aucun délai chiffré ; la preuve pendante est sauvegardée durablement dès sa création.
- **D7 (tuyaux)** : sept tuyaux déclarés, chacun avec entrée, sortie, état, test et verdict câblé / fixture / absent.
- **D8 (vocabulaire)** : lexique fermé (anchored, pending, timestamp, block record, before) et formes interdites.
- **D9 (ordre)** : ancre de rattrapage procédurale d'abord, sans code (précédent décision 124, option B) ; puis PR-A (outil, registre, RUNBOOK) ; puis PR-B (dérivation et pages). R-25 estimé entre 450 et 600 lignes.

## 0 bis. Arbitrages de l'orchestrateur (2026-09-24 13:32 UTC, `claude-fable-5-1`, avant checkpoint-1)

| # | Point | Arbitrage |
|---|---|---|
| 1 | D3, où vivent les preuves | **registre séparé** `docs/bell-publications/ANCHORS.md`, servi sous `/bell/anchors/` par extension de `sync-bell-anchors.mjs` ; le registre de course reste gelé |
| 2 | D5, ce que la page lie | **le seul `line_hash` de la ligne la plus récente** (relpath et digest tous deux), « anchored » seulement avec un bloc Bitcoin dans la preuve ; les deux défauts actuels (`.some`, preuve pendante comptée) sont corrigés dans PR-B |
| 3 | D1, notation | `timeline.jsonl#L<n>` (ligne sans saut, = `line_hash`) et `timeline.jsonl#L1-L<n>` (préfixe avec sauts, = digest du miroir de l'étape 13) ; état et provenance immuables en plus |
| 4 | D9.1, ancre de rattrapage seq 2 | **posée dès que** (a) FAITS-OTS-REREAD-1 est faite par l'orchestrateur (lecture sur place d'opentimestamps.org, navigateur interne) et (b) le go investisseur pour ce nouvel usage sortant est reçu ; manifeste attendu sha256 `602ff93d…` (4 lignes, 457 octets) ; copie durable immédiate sous `F:/PRODUITS/bell-mirror/ots/` |
| 5 | régime de PR-B | pages au régime vitrine (146/183) ; **G2 + checkpoint-2 pour la fonction d'état `publicationAnchorState` et ses tests** (affirmation publique) |
| 6 | `lines[]` dans `bell-served.json` | **ajouté** (contrôle à la synchro que chaque ligne du registre appartient à la chaîne vérifiée) |
| 7 | TWEET-186-PERSIST-1 | texte versé par l'orchestrateur ; permalien demandé à l'investisseur ; la formule « at a point in time » sera précisée dans les textes servis en « before a Bitcoin block » (D8) |
| 8 | SEC-L56-ANCHOR-1 | item : la ligne 56 de la lettre v3 (non déposée) est corrigée avant tout dépôt, ou devient vraie par ce lot |

## 1. Contexte mesuré

### 1.1 Ce que la timeline servie engage

- GET `https://bell.monarkgate.tech/timeline.jsonl` à 2026-09-24T08:54:51Z : 200, 2 lignes, 2 407 octets, `Last-Modified: Thu, 24 Sep 2026 08:41:22 GMT`, `Cache-Control: no-cache`. SHA-256 du corps : `fba1824d9dc4a9218246dc9dd14107f89a6f14d2250c62a6cea0e3db7ccfd28b`, égal au digest du miroir seq 2 consigné (`docs/JOURNAL-PROVENANCE.md:389`).
- Pour chaque ligne, SHA-256 des octets servis sans le LF final = `line_hash` : ligne 1 `4a417cf02289b4968c17e7dc9f61c013bf04d62c77e541993a05a20a6965f47c`, ligne 2 `ef3b06f2ff93951e200a6559b42ab66df5ac4aa38b86d3aa763c118c766f6464` (égaux à `docs/JOURNAL-PROVENANCE.md:369`, `:387` et à `apps/site/data/bell-served.json:15`, `:28`). Recalcul fait deux fois : avec les outils standard (`sed -n '2p' timeline.jsonl | tr -d '\n' | sha256sum`) et avec `lineHash` du dépôt (`apps/bell/scripts/bell-chain.mjs:50-51`) ; `canonical(ligne) === octets servis` est vrai pour les deux lignes ; 0 octet CR dans le corps.
- Pourquoi c'est vrai par construction : l'éditeur écrit et sert `canonical(line) + "\n"` (`apps/bell/scripts/bell-publish.mjs:310`, ajout durable `:255-256`, copie publique `:229`) ; `line_hash` est `sha256(canonical(ligne complète))` (`bell-chain.mjs:50-51`) calculé sur la ligne qui porte déjà `sig` (`bell-publish.mjs:307-309`, puis `:290`). Le « digest de la ligne signée entière » demandé par la mission est donc exactement `line_hash`.
- Préfixes : `head -n 1 timeline.jsonl | sha256sum` = `8dfd2b78c4ba06c61165b13f29929526b50339228a458e0c13a214281211b0ad`, égal au miroir seq 1 (`docs/JOURNAL-PROVENANCE.md:371`) ; `head -n 2` = `fba1824d…d28b`, égal au miroir seq 2 (`:389`).
- Chaînage : le `prev_line_hash` de la ligne 2 vaut le `line_hash` de la ligne 1 (mesuré) ; la marche refuse toute rupture (`bell-chain.mjs:132`, `:152`) et impose `seq` = numéro de ligne (`:130-131`). Un digest de la ligne n engage donc aussi les lignes 1 à n-1.
- Immuables (GET entre 08:55:14Z et 08:55:17Z) : `states/4564701a…08b9.json` (14 070 o), `provenance/ad8dd9b0…c39b.json` (1 202 o), `states/a828489f…a240.json` (5 326 o), `provenance/4935a259…ea3b.json` (510 o) ont chacun un SHA-256 égal à leur nom ; `/state.json` et `/provenance.json` sont octet pour octet ceux de la tête ; en-têtes des immuables : `Cache-Control: public, max-age=31536000, immutable`, `Access-Control-Allow-Origin: *`.

### 1.2 Ce que le site affirme aujourd'hui, et comment il le calcule

- `/bell` (`apps/site/app/bell/page.tsx:254`) et `/bell/method` (`apps/site/app/bell/method/page.tsx:106`) calculent `anchored = [head.state_sha256, ...runs.map((r) => r.bell_sha)].some((d) => anchors.listedDigests.includes(d))`.
- `listedDigests` réunit les digests de tous les manifestes des lignes qui ont un fichier de preuve (`apps/site/lib/bell-anchors-load.ts:40-44`, `:66`), **quel que soit l'état Bitcoin de la preuve**.
- Rendu, branche négative : « none: no anchor manifest lists the latest record's digests; it is signed and chained, not timestamp-anchored » (`page.tsx:367`) ; branche positive : « an anchor manifest lists the latest record's digests » (`page.tsx:366`) ; mêmes branches à `page.tsx:554-556`, `:586` et `method/page.tsx:395-397`, `:491-493`.
- Mesure (rejeu du lecteur du dépôt `readOtsProof`/`anchorStatus`/`manifestDigests` sur les fichiers commités, 2026-09-24 vers 08:56Z) : 17 lignes au registre, 16 preuves, 16 avec au moins un enregistrement de bloc, 36 digests listés ; aucun des digests de la tête (`line_hash`, `state_sha256`, `provenance_sha256`, les trois `bell_sha`) ni le `line_hash` de seq 1 n'est listé. D'où `anchored === false`, épinglé par `test/bell-anchors.test.ts:97-100`.
- Page servie `https://monarkgate.tech/bell/anchors` (GET 2026-09-24T08:55:24Z, 200, 64 387 o) : « 17 lines in the register · 16 proof files · 16 with a Bitcoin block record · 1 without proof ».
- Trois défauts latents de ce calcul (aucun n'est actif aujourd'hui, puisque rien n'est listé) : (i) `.some` : un seul `bell_sha` listé suffirait à dire que « the latest record's digests » sont listés, alors que la tête porte trois runs (`bell-served.json:36` et suivantes) ; (ii) une preuve seulement pendante suffirait ; (iii) la liaison porte sur l'état et les runs, pas sur la ligne signée (ni `provenance_sha256`, ni la signature, ni la chaîne).

### 1.3 Les ancres existantes (course de contre-vérification)

- Registre `docs/course-bell/ANCHORS.md` : titre « Bell course counter-verification (C-F-4, décision 124 = option B) » (l.1) ; format déclaré « freezable » (l.6) ; énumérations fermées `boundary` et `mint` (l.30-31), `boundary` fermée aussi dans le code, qui jette sur toute autre valeur (`apps/site/lib/bell-anchors.ts:20-21`, `:73`) ; 17 lignes réelles (l.37-55), dont une non horodatée pour collision de nom (l.43) ; deux lignes gabarit restées au milieu du tableau (l.40-41), sautées par le parseur (`bell-anchors.ts:72`).
- Nature : ces ancres horodatent les têtes des ledgers de la course de contre-vérification de l'historique des multiplicateurs (décision 124, `docs/CHANTIERS.md:631`), pas les enregistrements publiés. Les pages le disent (`apps/site/app/bell/anchors/page.tsx:22-24`, `:28-33`) et un test l'épingle (`test/bell-anchors.test.ts:108-116`).
- Procédure réelle : `F:\course-bell\go1\anchor.sh` (hors dépôt, 32 lignes, lu localement) : manifeste trié en LF (l.8), `ots stamp` par l'invocation figée (l.9-10), date relevée après le stamp (l.11), commit du manifeste et de la preuve (l.12-13), ligne du registre insérée après la dernière ligne commençant par `| 2026-`, gabarits compris (l.28, cause des lignes l.40-41 du registre), commit puis **push** (l.32). Le script committe et pousse lui-même.
- Collision de la l.43 : le client crée `<fichier>.ots` en création exclusive, `open(..., 'xb')` (`otsclient/cmds.py:204`, client installé) ; un second stamp du même nom échoue.
- Mises à niveau observées (bornes de nos passes d'upgrade, pas des délais de confirmation) : 15 sur 15 le 2026-09-23 à 07:14Z (`docs/CHANTIERS.md:1027-1029`) ; 16 sur 16 à l'entrée D-n de 23:2x-23:3xZ (`docs/JOURNAL-PROVENANCE.md:374`).
- Publication : `scripts/sync-bell-anchors.mjs` copie manifestes et preuves des lignes réelles vers `apps/site/public/bell/anchors/`, fail-closed (l.44-64), vide d'abord le répertoire servi (l.67), écrit `anchors.json` (l.69) ; `test/bell-anchors.test.ts:28-53` exige que ce répertoire contienne exactement `anchors.json` et les fichiers des lignes (l.52).
- Item volatil Q6-ANCHOR-1 (`F:/tmp/q6course/PRECONDITIONS.md:239`) : les courses Q6, celles qui ont produit seq 1 et seq 2, n'ont été ancrées à aucune frontière. Il est versé au §6.

### 1.4 Outillage OpenTimestamps (mesuré sur la machine opérateur)

- `command -v ots` : code 1 (absent du PATH) ; `pip show opentimestamps-client` sous le Python système : « Package(s) not found ».
- Venv dédié `F:\MONARK SUITE\ots\venv\` : `pip show` (métadonnées locales) donne `opentimestamps-client 0.7.2`, `opentimestamps 0.4.5`, `python-bitcoinlib 0.12.2` ; `ots.exe --version` rend `v0.7.2` (code 0) sous l'invocation figée GO1-F (`docs/CHANTIERS.md:743`) avec le shim `ssl.dll` (`docs/course-bell/FAITS-opentimestamps-2026-09-22.md:27`) ; roues `F:\MONARK SUITE\ots\dl\opentimestamps_client-0.7.2-py3-none-any.whl` sha256 `84e604d7…b7ba` et `opentimestamps-0.4.5-py3-none-any.whl` `a4912b3b…26b5` (identiques à FAITS l.26).
- `ots --no-cache info mint_resume-AAPLx-2-manifest.txt.ots`, hors ligne : première ligne « File sha256 hash: ff6b2dba… » (égal à `docs/course-bell/ANCHORS.md:49`), puis `BitcoinBlockHeaderAttestation(968195)` et trois `PendingAttestation`, comme le lecteur du dépôt.
- **Conclusion** : l'outil est présent et épinglé, ce n'est **pas** un procurement. Il n'existe que sur la machine opérateur (Windows, shim DLL), ce qui borne D2. Ce qui manque est un **nœud Bitcoin** ou un équivalent pour que MONARK exécute lui-même `ots verify` : jamais fait (`docs/CHANTIERS.md:1029` : « `ots verify` contre un nœud reste à faire »). Item BELL-OTS-NODE-VERIFY-1 (§6).
- Code du client lu localement (installé) : `otsclient/cmds.py` sha256 `c20e8f770ae76e5d646d83ddf33c5c6edd15d12f07fd4610bc035b4601b53d25`, `otsclient/args.py` `9e853680b40d1b5890e258a62ece167ca932e3dc72230de67dcf493ccdab1a0a`, `opentimestamps/core/notary.py` `2d39368c0d3f12a7ecbc731752a6edb7ec8548087eecd5cb3f7bfaa5da4646a1`. Faits utiles :
  - le stamp ajoute un nonce aléatoire de 16 octets par fichier (`cmds.py:171-177`) : la preuve pendante est la seule trace du chemin ; un `.ots` pendant perdu est une ancre perdue, sans reconstruction possible ;
  - calendriers par défaut (`cmds.py:184-189`), au moins 2 réponses exigées (`args.py:180-182`), délai de 5 s par calendrier (`args.py:176-178`) ;
  - « complete » signifie qu'une attestation Bitcoin est présente, sans la vérifier (`cmds.py:211-219`, commentaire FIXME du code) : le « Timestamp complete » d'un upgrade n'est pas une vérification ;
  - `verify` met d'abord la preuve à niveau auprès des calendriers de ses attestations pendantes (`cmds.py:385-387`, `:268-318`), puis contrôle chaque attestation Bitcoin contre un nœud par RPC (`cmds.py:409-421`, `args.py:131-146`), dans l'ordre des hauteurs croissantes, et s'arrête au premier succès (`cmds.py:389-397`, `:435-438`) ; nœud injoignable : « Could not connect to local Bitcoin node » (`cmds.py:417-419`) ; avec `--no-bitcoin`, le client imprime la hauteur et la racine de Merkle à comparer à la main (`cmds.py:403-406`, `args.py:60-62`) ; `--bitcoin-node URL` (`args.py:77-79`) ; `-d DIGEST` vérifie un digest sans le fichier (`args.py:204-206`, `cmds.py:454-463`) ; le succès imprime une date au jour près, en heure locale (`cmds.py:431-434`) ;
  - vérifier une attestation, c'est comparer le digest engagé à `hashMerkleRoot` de l'en-tête du bloc, puis lire `nTime` de cet en-tête (`notary.py:276-287`) ; en cas de réorganisation, la racine ne correspond plus et la vérification échoue (docstring `notary.py:245-252`) ;
  - `-b/--btc-wallet`, stamp par portefeuille local, existe (`args.py:169-170`) et n'est pas utilisé : aucun portefeuille, aucune clé, aucun frais de transaction côté MONARK.

### 1.5 Faits lus sur les sources primaires OpenTimestamps

- `https://opentimestamps.org/`, GET du rédacteur à 2026-09-24T09:08:14Z, 200, 26 109 o, sha256 `28df6bbf…c789` : « A timestamp proves that some data existed prior to some point in time. » ; « …servers are free to use and they don't require any registration or api key. » Aucun lien « Terms » ni « Privacy » dans le texte de la page. Ces trois points reconfirment `docs/course-bell/FAITS-opentimestamps-2026-09-22.md:7`, `:8`, `:13` (lecture sur place de l'orchestrateur le 2026-09-22 à 02:39 UTC, `:3`). Un GET de worker n'est pas une lecture sur place (item FAITS-OTS-REREAD-1).
- README du client officiel, `https://raw.githubusercontent.com/opentimestamps/opentimestamps-client/master/README.md`, GET à 2026-09-24T08:55:50Z, 200, 199 lignes, sha256 `458e56ef…ad2b` : l.13-14 « to *verify* timestamps you need a local Bitcoin Core node (a pruned node is fine) » ; l.49-50 « It takes a few hours for the timestamp to get confirmed by the Bitcoin blockchain » (énoncé qualitatif des auteurs, non mesuré par nous, jamais recopié sur le site) ; l.66 « Incomplete timestamps are ones that require the assistance of a remote calendar to verify » ; l.136-138 les clients futurs vérifieront les preuves passées « provided that the relevant calendar data is available ».

### 1.6 Engagements publics en attente

- Tweet (mission) : « a record can be shown to exist at a point in time by anyone, without asking us ». Un horodatage montre une existence **avant** un instant (source primaire, §1.5), pas « à » un instant ; « sans nous demander » ne tient qu'une fois la preuve mise à niveau (§1.5, README l.66). Le texte public de ce lot le borne (D8).
- Lettre SEC 4-927 v3, brouillon interne marqué « NOT FOR FILING » (`docs/sec-4927/LETTRE-4-927-v3.md:1`) : l.56 « Each publication carries a digest of its content, published and anchored to a public timestamp » est **faux aujourd'hui** (aucune publication n'est ancrée, §1.2) ; l.63 est l'objet de Q6-ANCHOR-1 (item SEC-L56-ANCHOR-1, §6).
- Libellé public autorisé par la décision 124 : « chain head timestamped independently (OpenTimestamps) » (`docs/CHANTIERS.md:635`).

## 2. Décisions

### D1 : quoi ancrer

| # | Objet | Ce qu'il engage | Recalculable par un tiers | Verdict |
|---|---|---|---|---|
| O1 | `line_hash` de la ligne n | la ligne signée entière, signature comprise : `state_sha256`, `provenance_sha256`, `runs[]` (bell_sha, fenêtre, records) et, par `prev_line_hash`, toutes les lignes antérieures | oui : `sed -n 'np' timeline.jsonl \| tr -d '\n' \| sha256sum` (mesuré, §1.1) | **retenu, cœur** |
| O2 | `state_sha256` seul | l'enveloppe d'état de la seule publication n ; ni provenance, ni signature, ni chaîne | oui | rejeté comme cœur (trop faible) ; gardé comme ligne de commodité |
| O3 | digest du bundle opérateur (`73b5d555…`, `docs/JOURNAL-PROVENANCE.md:386`) | des fichiers jamais servis : `journal.json`, provenance complète avec `close_source`/`adv_source` (NOT_SERVED, `bell-publish.mjs:62`) | non | **rejeté** : invérifiable par un tiers ; engagement sur du contenu non servi (décision 69 ; esprit d'ESC-1 (c), « aucun engagement/hash du close », `docs/adr/ADR-B0-programme-bell.md:74`) |
| O4 | digest du préfixe, lignes 1 à n | toutes les lignes jusqu'à n, octet pour octet | oui : `head -n n timeline.jsonl \| sha256sum` ; c'est le digest du miroir consigné à l'étape 13 | **retenu**, second chemin de recalcul, même force qu'O1 |
| O5 | une ancre par ligne, chacune isolée | O1 répété n fois | oui | rejeté : O1 sur la tête couvre déjà les lignes antérieures |
| O6 | horodater directement les octets de la ligne, sans manifeste (digest de la preuve = `line_hash`) | = O1 | oui : `ots verify -d <line_hash>` | alternative valide, rejetée pour l'uniformité : le lecteur de preuves, le registre et la méthode publique (« télécharger le manifeste et sa preuve ») reposent sur un manifeste (`bell-anchors.ts:99-110`, `anchors/page.tsx:99-107`) ; `manifestDigests` refuserait une ligne JSON (fail-closed) ; O4 serait perdu |

**Décision.** Le manifeste `timeline-seq<n>-manifest.txt` suit les règles du format existant (`docs/course-bell/ANCHORS.md:17-22` : une ligne `<relpath> <sha256hex>` par objet, triées par relpath en ordre d'octets, LF, un LF final, aucun espace de fin, hex en minuscules). Les relpaths sont relatifs à la racine servie `https://bell.monarkgate.tech/`. Pour une ligne `publication`, quatre lignes :

```
provenance/<provenance_sha256>.json <provenance_sha256>
states/<state_sha256>.json <state_sha256>
timeline.jsonl#L1-L<n> <sha256 des octets des lignes 1 à n, chacune avec son LF>
timeline.jsonl#L<n> <sha256 des octets de la ligne n sans son LF, soit son line_hash>
```

Pour une ligne `key_rotation` ou `key_revocation`, qui ne nomme aucun immuable (`bell-chain.mjs:102`, ADR-T1b D6 `:216-219`), seulement les deux lignes `timeline.jsonl#…`.

- **Pourquoi `#L…` et pas `timeline.jsonl` seul** : le fichier servi grandit à chaque publication (append-only, `bell-publish.mjs:255-256`, `:229` ; « none that deletes », `docs/RUNBOOK-bell.md:319-320`). Une ligne `timeline.jsonl <digest>` se lirait comme « le fichier actuel » et cesserait de correspondre dès seq n+1 : un lecteur conclurait à une altération qui n'existe pas. Le fragment `#L…` est la convention d'URL pour une ligne de fichier ; il désigne des octets qui ne changent plus.
- **Deux conventions à écrire aussi sur `/bell/method`** : `#L<n>` hache la ligne n **sans** son LF (c'est `line_hash`, le digest natif de la chaîne) ; `#L1-L<n>` hache les lignes 1 à n **avec** leurs LF (sortie de `head -n`, digest du miroir). Commandes en D4.
- **Manifeste attendu pour le rattrapage de seq 2** (valeurs servies du §1.1 ; construit dans le scratchpad du rédacteur, hors dépôt) : 4 lignes, 457 octets, LF seuls, accepté par `manifestDigests` du dépôt, trié par relpath, **sha256 `602ff93d60dbf10fe96b0b2cfcd5b8ff439d2d0019f4daa362e9dd6ad3f16946`**. Son contenu exact :

```
provenance/ad8dd9b023bdfafade328d7ada5d17ae53d0de2133fcdf808237409d136fc39b.json ad8dd9b023bdfafade328d7ada5d17ae53d0de2133fcdf808237409d136fc39b
states/4564701add6e4231a67912ef45c7db640cd76dfe88302a96bc0e7722090508b9.json 4564701add6e4231a67912ef45c7db640cd76dfe88302a96bc0e7722090508b9
timeline.jsonl#L1-L2 fba1824d9dc4a9218246dc9dd14107f89a6f14d2250c62a6cea0e3db7ccfd28b
timeline.jsonl#L2 ef3b06f2ff93951e200a6559b42ab66df5ac4aa38b86d3aa763c118c766f6464
```

- **Relation avec les ancres de course** : objets, courses et registres distincts (D3). Les ancres de course horodatent les têtes de ledger de la contre-vérification (décision 124) ; les ancres de publication horodatent les enregistrements publiés et signés. Aucune ne remplace l'autre. En particulier, une ancre de publication ne dit rien du moment où la course Q6 qui a produit l'enregistrement a tourné : Q6-ANCHOR-1 reste ouvert (§6).
- **Rejet « ancrage on-chain » inchangé** (`docs/adr/ADR-B0-programme-bell.md:100`, `docs/adr/ADR-T1b-backend.md:483`) : son motif était « clé chaude + gaz ». Un stamp OpenTimestamps n'envoie qu'un hash à des calendriers publics ; aucune clé, aucun portefeuille ni frais côté MONARK (`-b/--btc-wallet` non utilisé, `args.py:169-170`) ; la transaction Bitcoin est celle des calendriers, qui ne font pas une transaction par horodatage (README l.49-50). C'est une précision, pas un amendement du rejet ; la décision 124 a déjà adopté ce mécanisme.

### D2 : quand, et sur quelle machine

| # | Option | Verdict |
|---|---|---|
| Q1 | à chaque nouvelle ligne de timeline (publication, rotation, révocation), dans la fenêtre opérateur du RUNBOOK : nouvelle étape 13 bis, juste après le miroir de l'étape 13, avant `sync-bell-served`, `sync-bell-anchors` et l'upload | **retenu** |
| Q2 | minuterie sur la machine opérateur, qui horodate la tête courante | retenu comme **filet** seulement (upgrade des preuves pendantes, détection d'une tête non ancrée), rattaché à BELL-VERIFY-SCHEDULE-1 ; jamais d'écriture dans le dépôt |
| Q3 | sur l'hôte Bell, dans ou à côté de l'unité de publication | **rejeté** |
| Q4 | par lots, une ancre pour plusieurs publications | rejeté |

- **Contre Q3** : l'unité tourne sous `PrivateNetwork=yes` (`docs/adr/ADR-T1b-backend.md:265`) alors qu'un stamp est un appel sortant ; l'hôte n'a que les built-ins de Node (« No `npm` on this host: built-ins only », `docs/RUNBOOK-bell.md:111`), l'arbre installé est de deux fichiers contrôlés par la CA (`docs/RUNBOOK-bell.md:23-24`, contrôle 11) : y ajouter Python et un paquet tiers relève de R-8 et change la CA ; la ligne directrice de BELL-VERIFY-SCHEDULE-1 est « timer sur une machine opérateur, pas sur l'hôte Bell » (`docs/PASSATION-2026-09-24.md:47`).
- **Contre Q4** : chaque heure de retard recule la borne ; un stamp coûte un hash et quelques secondes (1,70 s à l'essai à blanc, `FAITS-opentimestamps-2026-09-22.md:28`) ; la cadence de publication est faible (acte opérateur, `docs/RUNBOOK-bell.md:6-7`).
- **Rattrapage** : une seule ancre, sur seq 2, couvre seq 1 (chaînage mesuré, §1.1). Borne à écrire partout : posée après le 2026-09-24 vers 09Z, elle montre que les lignes 1 et 2 existaient avant son bloc ; elle ne dit rien des instants `published_at` (2026-09-23T21:35:52.438Z et 2026-09-24T08:41:21.864Z, `apps/site/data/bell-served.json:14`, `:27`), qui restent l'horloge de l'hôte. La règle « non rattrapable » de la décision 124 (`docs/CHANTIERS.md:633`) visait l'intervalle d'un tirage ; ici l'objet est une ligne qui ne change plus : un stamp tardif reste vrai, il est seulement plus faible.
- **Étape 13 bis** (acte orchestrateur, machine opérateur, jamais un worker) :
  1. `node scripts/anchor-bell-timeline.mjs --seq <n> --mirror-sha <digest de l'étape 13> [--line-hash <valeur imprimée à l'étape 10>]` (outil de PR-A, D9) : GET de `/timeline.jsonl` et des deux immuables, marche de la chaîne sous le trousseau committé (même `walkTimeline` que `scripts/sync-bell-served.mjs:70-76`), exige que le digest du préfixe 1 à n égale celui du miroir et, si fourni, que `lineHash(ligne n)` égale la valeur de l'étape 10 ; écrit le manifeste en LF, relit ses octets, imprime son sha256 et la commande `ots` exacte ; fail-closed. L'outil n'appelle jamais `git` et ne lance pas `ots` (moins de code, pas de sous-processus ; l'invocation reste la forme figée GO1-F).
  2. `ots stamp` par l'invocation figée (`docs/CHANTIERS.md:743`). Moins de 2 calendriers joignables (`args.py:180-182`) : pas de preuve ; nouvel essai dans la même fenêtre ; sinon ligne « not timestamped at <date_u> » ; la ligne suivante de la timeline couvrira celle-ci.
  3. Copie immédiate de la preuve pendante vers le miroir durable `F:/PRODUITS/bell-mirror/ots/`, sha256 consigné au JOURNAL : elle porte le nonce (`cmds.py:171-177`).
  4. Contrôle octets committés = octets horodatés : `git cat-file blob :docs/bell-publications/timeline-seq<n>-manifest.txt | sha256sum` égal au « File sha256 hash » d'`ots info` (les `.txt` sont `text=auto eol=lf`, `.gitattributes:2` ; les `.ots` `binary`, `:12`).
  5. Ligne du registre, commit, push : orchestrateur (R-20).
  6. Plus tard : `ots upgrade` (même invocation), commit de la preuve mise à niveau (l'historique git de l'`.ots` fait foi, ruling GO1-D, `docs/CHANTIERS.md:743`), `sync-bell-anchors`, build, upload.
- **Lignes de clé** : l'étape 13 bis s'applique aussi à la ligne `key_rotation` ou `key_revocation` d'un incident de clé (RUNBOOK « Key incidents », étape R5, `docs/RUNBOOK-bell.md:400-402`) : l'horodatage borne l'instant d'une rotation et rend visible une rotation antidatée.

### D3 : où vivent les preuves

| # | Option | Verdict |
|---|---|---|
| L1 | étendre `docs/course-bell/ANCHORS.md` avec `boundary = publication` | rejeté |
| L2 | registre séparé `docs/bell-publications/ANCHORS.md`, mêmes conventions, servi au même endroit | **retenu** |
| L3 | servir les preuves sur l'hôte Bell (`/anchors/<seq>.ots`) | rejeté |

- **Contre L1** : le registre de course se déclare « freezable » (`ANCHORS.md:6`) ; son énumération `boundary` est fermée et le parseur jette sur toute autre valeur (`bell-anchors.ts:20-21`, `:73`) ; ses pages disent « one line per boundary of the counter-verification run of the multiplier history » (`anchors/page.tsx:22-24`, épinglé par `test/bell-anchors.test.ts:108-116`) : une ligne `publication` rendrait ces phrases fausses ; les colonnes `mint`, `entry_sha256`, `ledger_sha256` n'ont pas de sens pour une ligne de timeline ; `openMints` et `hasFinal` sont propres à la course (`bell-anchors-load.ts:55-65`).
- **Contre L3** : l'éditeur est le seul écrivain de `public/`, dans un ordre durable (ADR-T1b D8 ; `bell-publish.mjs:224-237`) et la CA contrôle l'ensemble servi (`docs/RUNBOOK-bell.md:332-337`) ; déposer des fichiers à la main y mettrait deux écrivains ; le site sert déjà les preuves de course (décision 146 Q2).
- **Format du registre L2** (une ligne par ancre, neuf colonnes, aucune ligne gabarit dans le tableau) :

| date_u | seq | kind | line_hash | prefix_sha256 | manifest_sha256 | commit | ots_ref | note |
|---|---|---|---|---|---|---|---|---|

  - `date_u` : `date -u +%Y-%m-%dT%H:%M:%SZ`, relevé après le stamp (même règle que `anchor.sh:11`) ;
  - `seq`, `kind` ∈ {`publication`, `key_rotation`, `key_revocation`} : ceux de la ligne n (`bell-chain.mjs:102`) ;
  - `line_hash`, `prefix_sha256` : les digests des entrées `#L<n>` et `#L1-L<n>` du manifeste, affichables sans lire le manifeste ; le parseur exige l'égalité avec le manifeste ;
  - `manifest_sha256` : sha256 des octets du manifeste, égal au digest de la preuve ;
  - `commit`, `ots_ref` : comme le registre de course (`ANCHORS.md:59-60`) ; un `ots_ref` qui n'est pas un nom `.ots` marque une ligne non horodatée (même règle, `bell-anchors.ts:76-77`) ;
  - `note` : texte opérateur, jamais rendu.
- **Noms de fichiers** : `timeline-seq<n>-manifest.txt` et `timeline-seq<n>-manifest.txt.ots` ; un nouveau stamp de la même ligne prend `timeline-seq<n>-<k>-manifest.txt` (k ≥ 2), jamais un écrasement (`cmds.py:204`, incident `ANCHORS.md:43`). Les préfixes `timeline-seq` et `probe_end`/`mint_*`/`final` ne peuvent pas entrer en collision.
- **Servi** : `sync-bell-anchors.mjs` lit les deux registres, copie les fichiers des deux, écrit `anchors.json` (inchangé) et `publications.json` ; le balai (`sync-bell-anchors.mjs:67`) et l'ensemble exact du test (`test/bell-anchors.test.ts:52`) couvrent les deux.
- **Second canal, hors de nos hôtes** : l'export public livre `apps/site` entier (`scripts/export-public.mjs:54`) ; le clone local du miroir public porte 33 fichiers sous `apps/site/public/bell/anchors/` (mesuré ; l'état poussé sur GitHub n'est pas relu ici, §8). Chaque synchronisation du miroir publie donc manifestes et preuves dans l'historique d'un tiers. Côté opérateur : `F:/PRODUITS/bell-mirror/ots/`.

### D4 : vérification par un tiers, sans nous

**Ce qu'il lui faut** : (a) les octets de la timeline : `https://bell.monarkgate.tech/timeline.jsonl`, ou toute copie antérieure (la sienne, un miroir) ; (b) le manifeste et sa preuve : `https://monarkgate.tech/bell/anchors/<nom>`, le miroir public, ou toute copie ; (c) le client ouvert OpenTimestamps ; (d) un nœud Bitcoin de son choix (README l.13-14 : Bitcoin Core, élagué admis) ou, à défaut, l'en-tête du bloc tiré d'une source qu'il choisit (repli `--no-bitcoin`, `cmds.py:403-406`). Aucun logiciel, compte, clé ni requête MONARK.

**Gestes** (ligne n) :
1. `sed -n '<n>p' timeline.jsonl | tr -d '\n' | sha256sum` : égal au digest de `timeline.jsonl#L<n>` (mesuré sur seq 1 et seq 2, §1.1).
2. `head -n <n> timeline.jsonl | sha256sum` : égal au digest de `timeline.jsonl#L1-L<n>`.
3. `sha256sum timeline-seq<n>-manifest.txt` : égal au `manifest_sha256` du registre ; `ots info timeline-seq<n>-manifest.txt.ots` affiche « File sha256 hash: » avec la même valeur (sortie mesurée, §1.4).
4. `ots verify timeline-seq<n>-manifest.txt.ots`, manifeste à côté, avec un nœud (`--bitcoin-node URL`, `args.py:77-79`) : succès « Success! Bitcoin block <h> attests existence as of <date> » (`cmds.py:431-434`, date au jour près). Sans nœud : `ots --no-bitcoin verify …` imprime la hauteur et la racine de Merkle à comparer à l'en-tête de ce bloc (`cmds.py:403-406`). La vérification compare le digest engagé à `hashMerkleRoot` et lit `nTime` (`notary.py:276-287`).
5. Dans la ligne n : `state_sha256` et `provenance_sha256`, puis GET `/states/<sha>.json` et `/provenance/<sha>.json`, `sha256sum` égal au nom (mesuré, §1.1) ; ces digests figurent aussi dans le manifeste.
6. Origine, contrôle séparé de l'horodatage : signature de la ligne sous le trousseau committé, `bell-verify.mjs --keyring` (ADR-T1b D9, C-9).

**Ce que cela montre** : les octets de la ligne n, et par `prev_line_hash` ceux des lignes 1 à n-1, existaient avant le bloc h.

**Ce que cela ne montre pas** : que les faits sont vrais (la signature atteste l'origine, pas la vérité, `docs/adr/ADR-T1b-backend.md:224-225`) ; l'instant de publication (`published_at` est l'horloge de l'hôte ; le temps du bloc n'en est qu'une borne supérieure : un `published_at` postérieur au temps du bloc signalerait une horloge d'hôte en avance) ; le moment de la collecte (Q6-ANCHOR-1) ; qu'aucune autre ligne n n'a jamais été horodatée (un horodatage établit une existence, pas une unicité ; c'est la chaîne signée et les copies antérieures qui rendent une réécriture détectable, `docs/adr/ADR-T1b-backend.md:226`). « Sans nous demander » ne vaut que pour une preuve mise à niveau : une preuve pendante dépend d'un calendrier tiers (README l.66) et `ots verify` contacte alors ces calendriers (`cmds.py:385-387`, `:268-318`). Si le bloc cessait d'appartenir à la chaîne après une réorganisation, la vérification échouerait et le dirait (`notary.py:245-252`).

**Texte proposé pour `/bell/method`** (anglais ; aucun chiffre littéral hors « SHA-256 », seuls 256 et 25519 sont admis en source de page, `apps/site/test/honesty-lint.exempt.json:8-9` ; toute valeur rendue depuis les données) :

> **Anchors of published records.** After each new line of the timeline, a manifest lists the line's hash, the hash of the timeline up to that line, and the digests of the two files the line names. The manifest's SHA-256 is submitted to OpenTimestamps. The proof is pending first; once a calendar has included it in a Bitcoin block, the proof file records that block.
>
> **Check one yourself.** Download the manifest and its proof. Hash line n of the timeline without its line feed: it must equal the manifest's line digest. Hash the first n lines with their line feeds: it must equal the manifest's prefix digest. Hash the manifest: it must equal the digest the proof carries. Run an open OpenTimestamps client on the proof against a Bitcoin node of your choice: it names the block before which the manifest existed. No MONARK software, account or request is involved.
>
> **Bound.** An anchor shows that the line, and every line before it, existed before that block. It does not show that the facts are true, when the record was published, when its data was collected, or that no other line was ever timestamped. A pending proof depends on a calendar until it records a block.

### D5 : passage de « not timestamp-anchored » à « anchored »

**Liaison** (fonctions pures dans `apps/site/lib/bell-anchors.ts`) :
- `manifestEntries(text)` : couples (relpath, digest), même grammaire que `manifestDigests` (`bell-anchors.ts:99-110`), fail-closed ; `manifestDigests` reste tel quel pour la course.
- `parsePublicationAnchors(markdown)` : lignes réelles du registre D3 ; jette si `line_hash` ou `prefix_sha256` diffèrent des entrées du manifeste.
- `publicationAnchorState(head, rows)`, avec `head = {seq, line_hash}`, rend `{state: "none"}`, `{state: "pending", date_utc}` ou `{state: "anchored", date_utc, earliestHeight, blockRecords}`. Une ligne compte si et seulement si : (i) `row.seq === head.seq` ; (ii) le manifeste servi porte l'entrée `timeline.jsonl#L<head.seq>` dont le digest est `head.line_hash` (clé ET valeur) ; (iii) la preuve atteste le digest du manifeste (déjà exigé au chargement, `bell-anchors-load.ts:45-46`). État `anchored` si une ligne comptée porte au moins une hauteur (`anchorStatus(proof).bitcoinHeights.length > 0`, `bell-anchors.ts:243-251`) ; `pending` si des lignes comptent sans hauteur ; `none` sinon. Accessoire : `latestAnchoredSeq`, le plus grand `seq` d'une ligne `anchored`, pour dire jusqu'où les lignes antérieures le sont quand la tête ne l'est pas encore.
- Source de `head` : `apps/site/data/bell-served.json` (`head.seq`, `head.line_hash`), écrit par `sync-bell-served.mjs` après la marche de la chaîne sous le trousseau committé ; `line_hash` y est recalculé (`apps/site/lib/bell-served-load.ts:518`).
- Deux calculs se rencontrent ici : `head.line_hash` est recalculé par recanonicalisation de la ligne parsée, alors que l'entrée `#L<n>` du manifeste est le sha256 des octets servis bruts. Leur égalité est mesurée sur seq 1 et seq 2 (§1.1) et tient par construction (`bell-publish.mjs:310` sert exactement `canonical(line)`). Si un intermédiaire altérait les octets servis (par exemple une conversion en CRLF), les deux digests divergeraient et l'état tomberait à `none` : l'écart va dans le sens sûr, jamais vers un « anchored » indu.
- Pages : `/bell` (`page.tsx:254`, `:363-367`, `:554-556`, `:586`) et `/bell/method` (`method/page.tsx:106`, `:395-397`, `:491-493`) remplacent `.some(... listedDigests.includes ...)` par `publicationAnchorState(...)`. Le texte négatif actuel reste mot pour mot dans la branche `none` (épinglé : `test/site-build-fleet.test.ts:1000`).
- **Option recommandée, contrôle à la synchro** : `sync-bell-served.mjs` écrit aussi `lines: [{seq, kind, line_hash}]` pour toutes les lignes marchées (schéma v4, re-épinglage du manifeste de données) ; `sync-bell-anchors.mjs` refuse alors toute ligne du registre dont le `line_hash` n'est pas celui de la ligne `seq` de la chaîne vérifiée. La même liste permet de dire qu'une ligne ultérieure ancrée couvre la tête (chaînage). Sans cette option, l'appartenance à la chaîne d'une ligne de registre antérieure à la tête n'est vérifiée qu'une fois, par l'outil d'ancrage au moment du stamp : résiduel déclaré.

**Tests** (non-LLM, oracle `npm test`, sauf T-3b) :
- **T-1 `bell_publication_anchor_state_is_derived_strictly`** (unitaire, fixtures). Mutants nommés : **M-1** le manifeste ne liste que `states/<head.state_sha256>.json` : état `none` (le `.some` d'aujourd'hui aurait dit « lists ») ; **M-2** preuve aux seules attestations pendantes : `pending`, jamais `anchored` ; **M-3** `#L<n>` porte le `line_hash` d'une autre ligne : `none` ; **M-4** `row.seq` différent de `head.seq` : `none` pour la tête, `latestAnchoredSeq` inchangé ; **M-5** un octet du manifeste servi changé : le chargement jette (existant, `bell-anchors-load.ts:43`) ; **M-6** le `.some` restauré dans une page : T-3a rougit. Preuves de fixture : octets construits hors ligne au format que lit le lecteur (magic, version, opération sha256, digest, une attestation), déclarées fixtures (le lecteur lit une structure, il ne vérifie pas contre un nœud, `bell-anchors.ts:15-16`).
- **T-2 `bell_publication_anchors_served_register_matches_source`** : extension de `test/bell-anchors.test.ts:28-53` au registre D3 : servi = source, preuves octet pour octet, manifestes qui hachent vers leur digest, preuve qui atteste ce digest, colonnes `line_hash`/`prefix_sha256` égales aux entrées du manifeste ; ensemble exact du répertoire servi (`:52`) étendu à `publications.json` et aux fichiers `timeline-seq*`.
- **T-3 `bell_publication_anchor_composes_served_head_to_rendered_claim`** (intégration, règle Branchement), en deux moitiés : **T-3a** (`npm test`) part de `bell-served.json` (tête) et des fichiers servis (registre, manifestes, preuves), recalcule l'état **dans le test** (sha256 et égalité relpath/digest recodés, pas importés), et exige l'égalité avec `publicationAnchorState` ; **T-3b** (après `next build`, extension de `scripts/assert-fleet-html.mjs`, précédent `assertUkemiBody`, `scripts/assert-fleet-html.mjs:8-11`, lancé par `.github/workflows/ci.yml:174-175`) exige dans le corps rendu de `/bell` et `/bell/method` la phrase de l'état calculé, et elle seule. T-3 remplace l'épingle `anchored === false` (`test/bell-anchors.test.ts:97-100`) : jamais un littéral `true` ou `false`, l'état est recalculé.
- **Ré-épinglages déclarés** : `test/bell-anchors.test.ts:101-103` et `test/bell-served.test.ts:430` (regex `anchors.listedDigests`) deviennent `publicationAnchorState(` ; `test/site-build-fleet.test.ts:987-1000` reste inchangé (le registre `apps/site/lib/fleet.ts:340` ne dit jamais « anchored digest » ; la page garde « not timestamp-anchored » dans sa branche `none`).

### D6 : preuve pendante, puis mise à niveau

- **Affichage** (au build, lu du fichier) :
  - `none` : texte actuel, « … signed and chained, not timestamp-anchored » ;
  - `pending` : « submitted for a timestamp on <date_utc>; the proof is pending: it records calendars, no Bitcoin block yet » ; jamais « anchored » ;
  - `anchored` : « anchored: the proof file records Bitcoin block <h>, the earliest of <k>; read from the file when this page was built, not checked against a node here ».
- **Aucun délai chiffré** sur le site ; c'est déjà la règle (« No confirmation delay is quoted here », `anchors/page.tsx:109-110`). La phrase « a few hours » du README (l.49-50) n'est ni recopiée ni employée comme fait. Cas observés, qui sont des bornes de nos passes d'upgrade et non des délais de confirmation : ancres de course posées le 2026-09-22 entre 14:07Z et 22:09Z (`ANCHORS.md:37-51`), toutes avec bloc au plus tard le 2026-09-23 à 07:14Z (`docs/CHANTIERS.md:1027-1029`) ; `mint_resume-SPYx-2` posée le 2026-09-23 à 16:42:03Z (`ANCHORS.md:55`), avec bloc au plus tard à l'entrée D-n de 23:2x-23:3xZ (`docs/JOURNAL-PROVENANCE.md:374`).
- **« Complete » n'est pas « vérifié »** : le client déclare une preuve complète dès qu'elle porte une attestation Bitcoin, sans la contrôler (`cmds.py:211-219`). D'où « read from the file, not checked against a node here » tant que BELL-OTS-NODE-VERIFY-1 est ouvert, et jamais « verified ».
- **Décalage assumé** : le site est statique ; après un upgrade, l'état affiché ne change qu'à la reconstruction suivante (synchro, build, upload). Une page peut dire `pending` d'une preuve déjà complète : c'est exactement ce que dit « when this page was built ».
- **Reprise** : une preuve encore pendante à la publication suivante est couverte par l'ancre suivante (chaînage) ; on n'efface jamais une preuve pendante (elle peut encore se compléter) et on ne lui prête aucun autre état. Calendriers indisponibles (moins de 2 sur 4, `args.py:180-182`) : ligne `not timestamped at <date_u>` (convention de la course, `FAITS-opentimestamps-2026-09-22.md:17`), nouvel essai à la fenêtre suivante.
- **Mise à niveau** : acte orchestrateur, invocation figée, commit de la preuve mise à niveau, synchro, upload. Filet : BELL-VERIFY-SCHEDULE-1 étendu (machine opérateur, fenêtre quotidienne) pour `ots upgrade` des preuves pendantes et la détection d'une tête non ancrée ; la minuterie dépose dans `F:/PRODUITS/bell-mirror/ots/` et signale ; elle n'écrit jamais dans le dépôt.

### D7 : tuyaux (ADR-M018 D3)

| Tuyau | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test non-LLM | Au 2026-09-24 |
|---|---|---|---|---|---|
| P-1 timeline servie → manifeste | GET `https://bell.monarkgate.tech/timeline.jsonl` et immuables, outil `anchor-bell-timeline.mjs` | `timeline-seq<n>-manifest.txt` | `docs/bell-publications/` (committé) | test de l'outil sur la fixture à deux lignes déjà utilisée par `sync-bell-served`, puis rejeu contre `bell-served.json` (tête) | **absent** |
| P-2 manifeste → preuve pendante | client `ots` épinglé (machine opérateur), calendriers publics | `.ots` pendant | `docs/bell-publications/` et `F:/PRODUITS/bell-mirror/ots/` | T-2 (digest de la preuve = digest du manifeste, au moins une attestation) ; l'appel aux calendriers n'est pas rejouable hors ligne (déclaré ; précédent `test/bell-anchors.test.ts:55-73`) | **absent** pour les publications ; câblé (procédural) pour la course |
| P-3 pendante → mise à niveau | `ots upgrade` (orchestrateur ; filet BELL-VERIFY-SCHEDULE-1) | `.ots` avec enregistrement de bloc, nouveau commit | idem | T-1 (M-2), T-2 | **absent** (publications) |
| P-4 registre → servi | `scripts/sync-bell-anchors.mjs` étendu | `apps/site/public/bell/anchors/{publications.json, timeline-seq*}`, puis `https://monarkgate.tech/bell/anchors` | dépôt, hôte vitrine | T-2 | câblé pour la course (`test/bell-anchors.test.ts:28-53`) ; **absent** pour les publications |
| P-5 servi + tête → affirmation | `loadAnchors()` étendu et `bell-served.json` | phrases de `/bell` et `/bell/method` | build | T-1, T-3a, T-3b | câblé mais **défectueux** (`.some`, pendante comptée, liaison sur l'état, §1.2) |
| P-6 servi → tiers | fichiers servis, client ouvert, nœud du tiers | vérification du tiers | aucun | gestes 1, 2, 3 et 5 rejoués hors ligne par T-3a ; le geste 4 (nœud) n'est pas rejouable dans l'oracle (déclaré) | **fixture** tant que BELL-OTS-NODE-VERIFY-1 est ouvert |
| P-7 export → miroir public | `scripts/export-public.mjs` (liste blanche `apps/site`, `:54`) | dépôt public GitHub | historique du miroir | `export:check` (existant) | câblé par construction, aux seules synchronisations du miroir |

**Règle Branchement** : l'ancrage des publications n'est pas une pièce du registre public, c'est une propriété de Bell. Il ne devient une affirmation de page qu'avec P-5 en état `anchored` sur la tête ET T-3 vert. Le texte de `fleet.ts` (`:340-356`) ne change pas ; seul T-3 s'ajoute à `served.integration_test` de Bell quand P-4 et P-5 sont servis (CA-11). Un tuyau absent au G7 est un item avec déclencheur, jamais un oubli (ADR-M018 D3).

### D8 : vocabulaire public

**Règles existantes qui s'appliquent** : scope `site`, `guarante` sous toute forme, négation comprise (`vocab-banned.json:54`) ; « verified », « proven », « certified » nus (`test/public-surfaces-honesty.test.ts:41`) ; noms d'opérateurs et formes fournisseurs (`vocab-banned.json`, scope `site` ; `test/bell-served.test.ts:158`) ; Terms, mots à éviter : « guarantee », « verified », « partner », « live » nu, « SLA » (`apps/site/data/bell-legal.json:11`, `:16`, `:21`, `:36`, `:46`) ; registre : jamais « anchored digest » (`test/site-build-fleet.test.ts:987-997`) ; chiffres : seuls 256 et 25519 admis en source de page (`apps/site/test/honesty-lint.exempt.json:8-9`).

**Lexique fermé proposé** :

| Mot | Sens sur Bell | Condition |
|---|---|---|
| anchored, anchor | une preuve OpenTimestamps qui porte au moins un enregistrement de bloc Bitcoin, pour un manifeste qui liste la ligne dont on parle | état `anchored` (D5) ; toujours avec « before » et, sur les pages, « read from the file, not checked against a node here » |
| pending | preuve qui ne porte que des enregistrements de calendriers | état `pending` |
| timestamp (nom), submitted for a timestamp | l'acte de soumettre un digest à OpenTimestamps | n'implique pas de bloc |
| not timestamp-anchored | aucune preuve pour la ligne dont on parle | état `none` (texte actuel conservé) |
| block record | l'attestation Bitcoin telle qu'elle figure dans le fichier | lue, non vérifiée |
| attestation | terme du format OpenTimestamps, toujours sous la forme « Bitcoin attestation » ou dans le libellé de statut | jamais « attested » seul à propos d'un fait ; « attests origin » reste réservé à la signature (ruling R-a, `docs/CHANTIERS.md:1207`) |
| before (a block) | la seule relation temporelle affirmée | jamais « at » |
| independently | licite pour l'horodatage (décision 124, `docs/CHANTIERS.md:635`) | jamais pour la vérité des faits |

**Formes interdites, en plus des gates** : « at a point in time » (la formule du tweet ; la source dit « existed prior to some point in time ») ; « proves » ou « proof that » à propos d'un fait (le nom « proof » pour le fichier reste admis) ; « tamper-proof », « trustless », « permanent » ; « anchored at publication » ; tout délai (« within hours ») ; « verified by Bitcoin » ; toute probabilité (réorganisation comprise).

### D9 : ordre de livraison, découpage, R-25

1. **Tout de suite, sans code** (précédent décision 124, option B, « procédural, sans code », `docs/CHANTIERS.md:629-631`) : ancre de rattrapage de seq 2 par l'orchestrateur, en deux temps découplés. **(a) Dès le go, indépendamment du ruling D3** : manifeste D1 écrit à la main (sha256 attendu `602ff93d…6946` ; ce digest ne dépend pas de l'emplacement du fichier), stamp, copie immédiate de la preuve pendante et du manifeste vers `F:/PRODUITS/bell-mirror/ots/`, sha256 au JOURNAL. **(b) Après le ruling D3 du checkpoint-1** : emplacement dans le dépôt (`docs/bell-publications/` si L2 est retenu), ligne de registre, commit ; seule la colonne `commit` attend. Rien n'est servi tant que PR-B n'existe pas (le chargeur actuel ne lit aucun registre de publication) : aucune affirmation prématurée n'est possible. Gain : la borne de seq 1 et seq 2 est posée au plus tôt ; attendre le code, ou même le checkpoint-1, la recule d'autant. Préalables de (a) : FAITS-OTS-REREAD-1 et le go (voir « Points à trancher »).
2. **PR-A**, régime complet (G1, G2, checkpoint-2) : `scripts/anchor-bell-timeline.mjs` (outil du dépôt source, non exporté, sans `git`, sans sous-processus), registre D3 et sa section format, RUNBOOK (étape 13 bis, « Next publications », « Key incidents » R5), tests P-1. Environ 200 à 250 lignes.
3. **PR-B** : parseur, état, chargeur, trois pages, table, synchro, T-1 à T-3, option `lines[]`. Environ 250 à 350 lignes. Régime recommandé : procédure vitrine (décision 146) pour le texte des pages, mais G2 pour `bell-anchors.ts` (fonction d'état) et ses tests, parce qu'ils portent l'affirmation publique.

R-25 estimé en tout : 450 à 600 lignes (hors cet ADR et hors fichiers binaires), sous le seuil STOP de 1 150 et le plafond CI de 1 205 rappelés par `docs/adr/ADR-BELL-CASH-LEG-1.md:60`.

## 3. Alternatives rejetées (récapitulatif)

O2 comme cœur, O3, O5, O6 (D1) ; Q3, Q4 (D2) ; L1, L3 (D3) ; liaison `.some` sur `state_sha256`/`bell_sha` (D5) ; « anchored » affiché sur une preuve pendante (D6) ; délai chiffré sur le site (D6) ; minuterie qui committe (D2, D6) ; outil versionné qui appelle `git` (D2).

## 4. MAST (checklist de risque résiduel)

Source : corpus, doc 06 §6.4 (lu) ; identifiants tels qu'employés par `docs/adr/ADR-T1b-backend.md:524-541` ; article MAST (arXiv:2503.13657) non relu par ce rédacteur, niveau [2nd] via le corpus, qui l'a vérifié le 2026-08-19. Les gloses sont celles du rédacteur.

| Mode | Menace dans ce lot | Contre-mesure |
|---|---|---|
| FM-1.1 (spécification non suivie) | la page dit « anchored » sur une preuve pendante, ou sur `state_sha256` seul | D5 strict ; M-1, M-2 |
| FM-1.2 (rôle non suivi) | un worker lance le stamp, committe ou pousse | outil sans `git` ; stamp et commit = acte orchestrateur (R-20) |
| FM-1.3 (répétition d'étape) | un nouveau stamp écrase une preuve | noms `-<k>` ; création exclusive du client (`cmds.py:204`) |
| FM-1.4 (perte d'historique) | preuve pendante perdue (nonce) ; outil hors dépôt volatil (précédent `anchor.sh`) | sauvegarde durable immédiate (D2.3) ; outil versionné (PR-A) |
| FM-1.5 (condition de fin ignorée) | lot déclaré fini avec la seule ancre pendante | G7 exige T-3 vert sur une ancre réelle en état `anchored`, sinon l'item nommé |
| FM-2.2 (clarification non demandée) | registre de course étendu en silence (L1) ; délai inventé | D3 tranché au checkpoint-1 ; aucun délai |
| FM-2.3 (dérive de tâche) | le lot « ancre » aussi les courses Q6 | Q6-ANCHOR-1 reste un item séparé |
| FM-2.4 (rétention d'information) | le site tait la borne « before » ou le fait que `published_at` n'est pas couvert | textes D4 et D8 |
| FM-2.6 (écart raisonnement / action) | « complete » lu comme « vérifié » | `cmds.py:211-219` cité ; « not checked against a node here » |
| FM-3.1 (terminaison prématurée) | G7 prononcé avant la mise à niveau | condition de G7 ci-dessus |
| FM-3.2 (vérification absente ou incomplète) | aucun `ots verify` contre un nœud | BELL-OTS-NODE-VERIFY-1 ; formulation bornée d'ici là |
| FM-3.3 (vérification incorrecte) | un test qui relit la fonction même de la page | T-3a recode sha256 et l'égalité relpath/digest |

## 5. Anti-close et décision 69

- Le lot n'ajoute aucune valeur au servi : il publie des relpaths et des digests. Les objets listés sont exclusivement des octets déjà servis, déjà passés par le garde `close_like_field` (C-in-4, `bell-publish.mjs:119-120`) et par la projection sans `close_source`/`adv_source` (NOT_SERVED, `bell-publish.mjs:62`). Aucun engagement sur un fichier non servi (O3 rejeté) : ESC-1 (c) tenu (`docs/adr/ADR-B0-programme-bell.md:53`, `:74`).
- Aucun nom de fournisseur de données : les preuves nomment des calendriers d'horodatage (URI des attestations pendantes, `notary.py:140-218`), pas des sources de données ; le site n'en rend que des comptes (`apps/site/components/bell/anchors-table.tsx:71-80`) ; les `.ots` sont binaires et hors des scans de texte.
- À rejouer au G2 : les formes de la clause anti-close sur le diff du lot (précédent `docs/adr/ADR-T1b-backend.md:592`) ; les formes fournisseurs de `test/bell-served.test.ts:158` étendues à `publications.json`.

## 6. Items formés (aucun « dû » nu)

| Id | Nature | Objet | Déclencheur | Propriétaire |
|---|---|---|---|---|
| **Q6-ANCHOR-1** (versé depuis `F:/tmp/q6course/PRECONDITIONS.md:239`, fichier volatil) | recherche de solution | La lettre v3 dit que chaque début, fin et reprise « of a run » est ancré (l.63). Les courses Q6 (seq 1, seq 2) n'ont été ancrées à aucune frontière et ne peuvent plus l'être (décision 124, « non rattrapable », `docs/CHANTIERS.md:633`). Options : (a) ancrer les frontières des courses Q6 futures (seq ≥ 3) : amendement daté de l'énumération `boundary`, outil versionné sur `F:/course-bell/q6/<MINT>` ; (b) borner la phrase de la lettre aux tirages de la contre-vérification, comme le site le fait déjà (`test/bell-anchors.test.ts:108-116`). Reco : (b) pour la lettre ; (a) décidé au G0 de la prochaine course Q6. L'ancrage des publications de ce lot ne remplit pas Q6-ANCHOR-1 | avant I-v3-6 (rejeu des harnais de la lettre) | orchestrateur |
| **BELL-OTS-NODE-VERIFY-1** | recherche de solution | Exécuter nous-mêmes `ots verify` contre un nœud (jamais fait, `docs/CHANTIERS.md:1029`). Options : (a) nœud Bitcoin Core élagué sur une machine opérateur (README l.13-14 ; disque, bande passante et durée de synchronisation non lus ici, à lire sur la documentation Bitcoin Core avant tout choix) ; (b) `--bitcoin-node URL` vers un nœud tiers (confiance déplacée ; conditions d'usage à lire sur place) ; (c) `--no-bitcoin` et comparaison de l'en-tête de bloc tiré de deux sources indépendantes. Appel sortant : go investisseur. D'ici là, toute phrase publique garde « not checked against a node here » | avant la première phrase publique « anchored » servie, et avant le dépôt de la lettre SEC | orchestrateur, puis chercheur |
| **BELL-VERIFY-SCHEDULE-1** (existant, étendu) | code (lot) | ajouter, sur la machine opérateur : `ots upgrade` des preuves pendantes, détection d'une tête non ancrée ; jamais d'écriture dans le dépôt | lot BELL-VERIFY-SCHEDULE-1 (`docs/adr/ADR-BELL-CASH-LEG-1.md:38`) | orchestrateur |
| **TWEET-186-PERSIST-1** | procédure | verser dans `docs/thread/` le texte exact et le permalien du tweet cité ; introuvable dans le dépôt (`grep -rn "anchoring layer\|without asking us\|shown to exist" docs/` : 0 résultat) ; sa formule « at a point in time » dit plus que ce que montre un horodatage (« before ») | prochain commit docs de l'orchestrateur | orchestrateur |
| **SEC-L56-ANCHOR-1** | texte | lettre v3 l.56, « published and anchored to a public timestamp » : vraie seulement si la tête est en état `anchored` (D5) au jour du dépôt ; sinon la phrase est bornée | I-v3-6 | orchestrateur |
| **ANCHOR-TOOL-COMMIT-1** | procédure | l'outil des ancres de course `F:\course-bell\go1\anchor.sh` vit hors dépôt et committe/pousse lui-même : le verser en outil versionné sans `git` (règle D2) ou le déclarer clos avec la course | ligne `final` de la course de contre-vérification | orchestrateur |
| **COURSE-ANCHORS-TEMPLATE-ROWS-1** | docs | deux lignes gabarit au milieu du tableau de course (`docs/course-bell/ANCHORS.md:40-41`), dues à la règle d'insertion d'`anchor.sh` (l.28) ; inoffensives pour le parseur (`bell-anchors.ts:72`), trompeuses à la lecture | ligne `final` de la course | orchestrateur |
| **FAITS-OTS-REREAD-1** | lecture sur place | la lecture sur place du 2026-09-22 couvrait l'usage « course » ; avant le premier stamp de publication, relecture par l'orchestrateur (navigateur) d'`opentimestamps.org`, consignée et datée ; le GET du rédacteur (09:08:14Z) reconfirme les faits 1, 2 et 7 mais n'est pas une lecture sur place | avant l'ancre de rattrapage (D9.1) | orchestrateur |

## 7. Oracle attendu au G7

`gate:vocab`, `typecheck`, `npm test` (T-1, T-2, T-3a et les ré-épinglages), `lint`, `lint:ratchet`, `lang:gate`, `export:check`, build du site, `scripts/assert-fleet-html.mjs` (T-3b), honesty-lint. Condition de G7 propre à ce lot : T-3 vert sur une ancre réelle en état `anchored` pour la tête servie, ou, à défaut, lot clos en état `pending` affiché avec l'item nommé et son déclencheur (jamais « anchored » par anticipation).

## 8. Ce que je n'ai pas pu confirmer, et où j'ai cherché

- Texte exact et permalien du tweet : `grep` dans `docs/` (0 résultat) ; seul le texte transmis par la mission (TWEET-186-PERSIST-1).
- État poussé du miroir public sur GitHub : non relu (GitHub hors de la liste des GET autorisés) ; seul le clone local `F:\monark-public-mirror` est mesuré (33 fichiers sous `apps/site/public/bell/anchors/`).
- Temps des blocs 968149 à 968305 inscrits dans les preuves : non lus (ni nœud, ni explorateur autorisé) ; le site n'affiche que des hauteurs, jamais un temps de bloc, et ce lot n'en ajoute pas.
- Délais de confirmation : non mesurés ; seules des bornes de nos passes d'upgrade (D6).
- Pages servies `/bell` et `/bell/method` : non relues en ligne (hors liste des GET autorisés) ; lues dans le dépôt à `e1a1e7e`, déployé d'après `docs/CHANTIERS.md:1417` (upload 16, `3428dfa`).
- Conditions d'usage d'OpenTimestamps : aucune page de conditions trouvée sur l'accueil (absence reconfirmée à 09:08:14Z) ; pas de lecture sur place au navigateur (acte orchestrateur, FAITS-OTS-REREAD-1).
- Taille disque et durée de synchronisation d'un nœud élagué : non lues (BELL-OTS-NODE-VERIFY-1).
- `ots verify` lui-même : non exécuté (appel réseau non autorisé à ce rédacteur ; aucun nœud disponible).
- Article MAST : non relu ; niveau [2nd] via le corpus (§4).

## 9. Points à trancher au checkpoint-1 (recommandations)

1. **D3** : registre séparé `docs/bell-publications/ANCHORS.md` (reco) ou extension du registre de course gelé.
2. **D5** : clé de liaison stricte sur le `line_hash` de la tête (reco) ou sur `state_sha256` ; attestation Bitcoin exigée pour « anchored » (reco : oui).
3. **D1** : notation `#L<n>` et `#L1-L<n>` (reco) ou autre ; présence des deux immuables dans le manifeste (reco : oui, commodité).
4. **D9.1** : ancre de rattrapage procédurale avant tout code (reco : oui ; stamp et copie durable dès FAITS-OTS-REREAD-1 et le go, sans attendre ce checkpoint ; emplacement et commit après le ruling du point 1).
5. **PR-B** : procédure vitrine pour le texte des pages, G2 pour la fonction d'état et ses tests (reco).
6. **Option `lines[]`** dans `bell-served.json` (reco : oui).

## 10. Sources et niveaux

- [lu] dépôt `F:\Monark` à `e1a1e7e` (tête `7224c79`) : chaque fichier cité avec sa ligne.
- [lu] hors dépôt, lecture locale : `F:\course-bell\go1\anchor.sh` ; `F:\tmp\q6course\PRECONDITIONS.md:239` ; code du client installé `F:\MONARK SUITE\ots\venv\Lib\site-packages\otsclient\cmds.py`, `args.py` et `opentimestamps\core\notary.py` (sha256 au §1.4) ; clone `F:\monark-public-mirror`.
- [lu] GET du rédacteur : `https://bell.monarkgate.tech/timeline.jsonl` (08:54:51Z) ; immuables et fichiers courants (08:55:14Z à 08:55:17Z) ; `https://monarkgate.tech/bell/anchors` (08:55:24Z) ; README du client (08:55:50Z) ; `https://opentimestamps.org/` (09:08:14Z).
- Interprétation déclarée de la liste des GET autorisés : « pages de documentation OpenTimestamps » = l'accueil `https://opentimestamps.org/` et le README du client officiel (dépôt `opentimestamps/opentimestamps-client`), servi par `raw.githubusercontent.com`. Ce second hôte n'est pas littéralement dans la liste de la mission ; un seul GET, en lecture seule.
- [lu] corpus : doc 06 §6.4 (MAST comme checklist).
- [2nd] article MAST, via le corpus.
- Mesures : commandes reproductibles citées au §1 ; aucun chiffre de seconde main.

## 11. Provenance

Généré par `claude-opus-5-5[1m]` le 2026-09-24, mission de l'orchestrateur `claude-fable-5-1` (décision 186) ; lecture seule du dépôt ; une seule écriture (ce fichier) ; GET publics limités à la liste autorisée ; aucune exécution réseau d'`ots` (seulement `--version` et `info`, hors ligne). Une consultation de l'advisor intégré avant la rédaction (conseil, pas verdict ; intégrée : relpaths non ambigus, ré-épinglages nommés, aucun délai présenté comme fait, outil sans `git`). Réviseurs : orchestrateur (R-21), validateur-humain (checkpoint-1). `error_origin` proposés, à assigner au G7 : liaison `.some` et preuve pendante comptée (défaut latent de `page.tsx:254` et `method/page.tsx:106`) : génération, lot vitrine B38/B39 (`test/bell-anchors.test.ts:75-78`) ; lettre v3 l.56 en avance sur le fait : rédaction de la lettre v3.

- **Ruling D8 (2026-09-24 19:09 UTC, décision investisseur 204 « on laisse proves »)** : D8 vise les affirmations d'ancrage (un horodatage qui « prouve » un fait, « at a point in time », « verified by Bitcoin »). La phrase fondatrice de Shōgen, « An attestation proves what a source said, never that the source is right » (et sa forme « An attested testimony proves what was said » du panneau Fleet, antérieure), reste permise : elle affirme l'origine, jamais la vérité. Les deux formes exactes sont épinglées dans `test/site-docs.test.ts` (`D8_ALLOWED`) ; tout autre « proves » reste interdit. Clôt FLEET-PANEL-D8-1.
