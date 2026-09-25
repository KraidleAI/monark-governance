# ADR-BELL-OTS-PRB : G0 de PR-B du lot BELL-OTS-ANCHOR-1 (plan de sprint, sans code)

- **Statut** : proposition G0, plan de sprint sans code, pour la vérification de l'orchestrateur (R-21) puis le checkpoint-1 du validateur-humain. Ce document n'écrit aucun code, ne committe rien et ne déclenche aucun workflow (R-20). Aucun appel réseau n'a servi à le rédiger (règle de mission).
- **Rédaction** : worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` déclaré à l'ouverture, R-1), effort max, contexte frais ; mission de l'orchestrateur `claude-fable-5-1` : `F:\tmp\ots-prb\mission-g0.md` (sha256 `8f74993c0c059c99509229d92bdad4c1f443cd6bcb21b3b1bf726e6ec6c35897`). Horloge `date -u` : 2026-09-24T23:49:16Z (ouverture), 2026-09-25T00:16:12Z et 00:23:38Z (mesures), 00:25:32Z (début de l'écriture).
- **Base lue** : worktree `F:\Monark-wt-prb`, branche `lot/bell-ots-prb`, HEAD `0e38b5d` (`git status --short` vide à 23:49:16Z ; `git merge-base --is-ancestor 0e38b5d HEAD` vrai). Pendant la rédaction, `lot/etude-suite` est passée à `3a15d3f` (commits `4cd09c7`, `3a15d3f`) : `git diff --stat 0e38b5d lot/etude-suite` = `docs/CHANTIERS.md` +4 (lancement de ce G0, Ukemi), sans effet sur ce plan. Toute référence `fichier:n` est lue à `0e38b5d`, niveau [lu] sauf mention contraire.
- **Exécute** : `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` (ci-après « ADR mère », sha256 `5bab9eeb63182179…`), section D9.3 (:268), sous les corrections C-1 à C-8, qui font foi (:359-374), l'amendement 198 (:381-384 ; l'erratum de :384, « lettre v4 l.43 (l.56 dans la v3) », commit `f1d01ad`, ne touche pas PR-B) et le ruling D8 de la décision 204 avec la ligne C-G2B-7b (:386).
- **Rattachement** : décisions 186 (`docs/CHANTIERS.md:1410`), 188 (:1426), 198 (:1439), 201 (:1447), 204 (:1454) ; entrée PR-A du journal (`docs/JOURNAL-PROVENANCE.md:398`) ; G1 de PR-A (`docs/G1-lot-bell-ots-anchor-1-pr-a.md`, ci-après « G1 PR-A ») ; G2 (`F:\tmp\ots-1\g2\G2-PR-A.md`, sha256 `699e8dc2…`), G2 de confirmation (`F:\tmp\ots-1\g2c\G2C-PR-A.md`, `b7755909…`), checkpoint-1 (`F:\tmp\ots-1\cp1\CP1-report.md`, `537a3cf1…`), journaux du checkpoint-2 (`F:\tmp\ots-1\cp2\logs\`).

## 0. Décisions proposées, une ligne chacune

- **D-B1 (périmètre)** : exécute D9.3 (:268) moins ce que PR-A a déjà livré (écart E-1, G1 PR-A:136) : parseur, `manifestEntries`, `bindPublicationAnchor`, synchro à deux registres, T-2 et l'assertion C-7 existent (§1.5) ; PR-B les **étend**, ne les réécrit pas.
- **D-B2 (`lines[]`, amendement de D5)** : exécute :206 et C-1 (:367) avec l'extension décidée par l'orchestrateur (`docs/CHANTIERS.md:1445`, SYNC-LINES-CHECK-1 étendu) : chaque entrée porte `{seq, kind, line_hash, prev_line_hash}` et, pour une ligne `publication` seulement, `state_sha256` et `provenance_sha256` (clés exactes par `kind`) ; schéma `monark-site-bell-served-v4`.
- **D-B3 (synchro liée à la chaîne)** : exécute :206 : `scripts/sync-bell-anchors.mjs` lit `lines[]` par `loadBellServed` et refuse, avant toute écriture, une ligne de registre au-delà de `lines[]`, au `line_hash` ou au `kind` étrangers à la ligne `seq`, ou dont le manifeste ne liste pas exactement les deux immuables de cette ligne (mutant G2-M7) ; la règle est une fonction pure `bindPublicationRowToLines` de `apps/site/lib/bell-anchors.ts`, partagée par la synchro, le chargeur et T-2.
- **D-B4 (aucun lien suivi)** : exécute le tuyau P-4 (:234) en fermant N-1 à N-3 (G1 PR-A:251-253) : la synchro refuse tout lien ou jonction sur chaque composant, depuis la racine du dépôt, de chaque chemin qu'elle lit (deux registres, manifestes, preuves, `bell-served.json`, manifeste de données) et du répertoire servi, avant le balai (`sync-bell-anchors.mjs:74`).
- **D-B5 (état)** : exécute :202 et C-1 (:367) : `publicationAnchorState(head, lines, bound)` pure dans `bell-anchors.ts`, règle (i) à (iv) de :202 appliquée telle quelle, `earliestHeight` et `via_seq` pris sur toutes les lignes comptées, `latestAnchoredSeq` calculé **et rendu** sur `/bell/anchors` (sinon sortie sans consommateur servi, règle Branchement) ; écart déclaré : la signature devient `(head, lines, bound)` au lieu de `(head, lines, rows)` (:202), parce que la fonction reçoit des lignes déjà liées par le chargeur, avec leurs entrées de manifeste et leur statut (conséquence d'E-2, G1 PR-A:137, et de PRB-BIND-IN-LOADER-1).
- **D-B6 (phrases d'état hors JSX)** : exécute D6 (:216-220) sous D8 (:245-258) : les phrases `none`, `pending`, `anchored` (et leurs variantes « par une ligne ultérieure ») sont produites par une fonction pure de `bell-anchors.ts`, rendues par `/bell` et `/bell/method` et lues par T-3b (une seule source, R-3) ; elles tombent ainsi sous G2 et checkpoint-2 (C-4, :370) ; la phrase `none` reste mot pour mot (:217).
- **D-B7 (chargeur)** : exécute :205 et C-4 (:370), avec PRB-BIND-IN-LOADER-1 : nouveau module autonome `apps/site/lib/bell-publications-load.ts` (built-ins Node et bibliothèque pure injectée, motif de `apps/site/lib/bell-served-load.ts:13` et `:449`) qui lit `publications.json` et ses fichiers servis et appelle `bindPublicationAnchor` puis `bindPublicationRowToLines` sur chaque ligne horodatée avant tout état ; `listedDigests` quitte `apps/site/lib/bell-anchors-load.ts` (plus aucun consommateur).
- **D-B8 (garde E-9 levée)** : exécute :205 (les pages remplacent le `.some`) et la correction des défauts latents de :52, par PRB-LOADER-GUARD-1 (G1 PR-A:156) : la garde lexicale de T-2 (`test/bell-anchors.test.ts:72-73`) est retirée dans le même changement que `publicationAnchorState`, le chargeur et T-3, jamais avant.
- **D-B9 (pages)** : exécute :205 et C-8 (:374) : `/bell` et `/bell/method` appellent `publicationAnchorState(` à la place du `.some` (`apps/site/app/bell/page.tsx:255`, `apps/site/app/bell/method/page.tsx:106`) ; `/bell/anchors` reçoit la section et la table des ancres de publication, sa description (`anchors/page.tsx:9`) et son libellé (`:22-24`) adaptés, la phrase « counter-verification run of the multiplier history » conservée.
- **D-B10 (tests)** : exécute :208-212 : T-1 sur objets construits (M-1 à M-7 bis, plus M-8 et M-9), T-2 étendu à `lines[]`, T-3a sur les fichiers servis réels et sur une copie temporaire à preuve synthétique « bloc », T-3b dans `scripts/assert-fleet-html.mjs` sur `/bell`, `/bell/method` et la table de `/bell/anchors` ; ré-épinglages en liste fermée (§1.7).
- **D-B11 (fixtures)** : exécute C-7 (:373) et ferme FIXTURE-GEN-VERSIONED-1 : aucun binaire nouveau ; T-1 n'a besoin d'aucune preuve (objets) ; la variante « bloc » de T-3a substitue le digest dans une copie temporaire de `test/fixtures/fixture-bell-seq2-block.ots` (motif MP-9, `test/bell-anchor-timeline.test.ts:99-101`), jamais écrite hors du répertoire temporaire.
- **D-B12 (régénération des données)** : exécute « `sync-bell-served.mjs` écrit aussi `lines` » (:206) : `apps/site/data/bell-served.json` v4 est régénéré par la synchro existante (six GET publics sur `https://bell.monarkgate.tech`, `scripts/sync-bell-served.mjs:58-64`), acte que l'orchestrateur confie explicitement (à lui-même ou au worker sous une mission qui autorise ces GET, précédent G1 PR-A:6), avant toute seq 3 (`bell-served-load.ts:526`) ; `lines[]` est contrôlé hors ligne au G1 et au G2 contre la copie durable (§1.1).
- **D-B13 (registre)** : exécute la règle Branchement de D7 (:239) : l'identifiant de T-3a s'ajoute à `served.integration_test` de Bell (`apps/site/lib/fleet.ts:354`) ; rien d'autre ne change dans le registre.
- **D-B14 (garde D8 étendue)** : exécute le ruling 204 (:386) : la garde D8 de `test/site-docs.test.ts:677-707` couvre aussi les trois pages Bell, la table nouvelle et les littéraux de `bell-anchors.ts` ; BELL-D8-PROVES-1 se règle dans la même édition de `/bell` (§3.2, choix à trancher).
- **D-B15 (OTS-REF-STRICT-1)** : proposition (b), qui exécute D3 (:167) selon le format que le registre prescrit déjà (`docs/bell-publications/ANCHORS.md:10`) : un `ots_ref` qui n'est pas un nom `.ots` doit être exactement `not timestamped at <ISO Z>` ; le parseur de course reste inchangé (registre gelé).
- **D-B16 (ordre de la mise à niveau)** : exécute §7 (:317) sous la décision 201 (`docs/CHANTIERS.md:1447`, « PR-B → upgrade preuve seq 2 ») : PR-B se clôt sur l'état recalculé (`pending` aujourd'hui, §1.1) avec l'item de mise à niveau nommé, sauf si l'orchestrateur place la mise à niveau avant l'oracle du G7 ; aucun test ne porte de littéral d'état, les deux ordres passent.
- **D-B17 (R-25)** : exécute :270 : estimation ascendante d'environ 570 lignes CODE (§2.2), sous le plafond CI de 1 205 (`.github/workflows/ci.yml:49`) : pas de découpage ; une coupe de repli PR-B1/PR-B2 est écrite (§2.3) pour le cas où la mesure du G1 dépasserait le seuil STOP de 1 150 (:270).

## 1. Contexte mesuré

### 1.1 Ce qui est servi aujourd'hui (non re-sondé : la mission interdit le réseau)

- **Hôte Bell** (`https://bell.monarkgate.tech/timeline.jsonl`) : deux lignes, tête seq 2. Dernières lectures en ligne consignées, non rejouées ici : GET du rédacteur de l'ADR mère à 08:54:51Z (:38-43), mode de comparaison de l'outil PR-A à 14:48Z et 15:14Z (G1 PR-A:6, :69), rejeu R2 de la G2 à 15:53Z (`G2-PR-A.md:150`), chacun « the served bytes are the local ones ».
- **Copie durable de l'étape 13** (`F:/PRODUITS/bell-mirror/timeline-seq2-20260924T0841Z.jsonl`, mesurée ici en lecture seule) : 2 407 octets, sha256 `fba1824d9dc4a9218246dc9dd14107f89a6f14d2250c62a6cea0e3db7ccfd28b`, 0 octet CR. Recalcul hors ligne aux outils standard (`sed -n '<n>p' | tr -d '\n' | sha256sum`, `head -n 2 | sha256sum`) et lecture JSON des lignes : c'est le `lines[]` attendu en v4.

| seq | kind | line_hash | prev_line_hash | state_sha256 | provenance_sha256 |
|---|---|---|---|---|---|
| 1 | publication | `4a417cf02289b4968c17e7dc9f61c013bf04d62c77e541993a05a20a6965f47c` | 64 zéros (genèse) | `a828489f64f112c8026b7c38f3710b82af1c97245fdba10b16170e39aed7a240` | `4935a259b7d6c2ddd929b4ecd440b6918d103c76b8a42b364df1b505f041ea3b` |
| 2 | publication | `ef3b06f2ff93951e200a6559b42ab66df5ac4aa38b86d3aa763c118c766f6464` | `4a417cf0…f47c` (ligne 1) | `4564701add6e4231a67912ef45c7db640cd76dfe88302a96bc0e7722090508b9` | `ad8dd9b023bdfafade328d7ada5d17ae53d0de2133fcdf808237409d136fc39b` |

  Préfixe L1-L2 recalculé : `fba1824d…d28b`. Les mêmes valeurs figurent dans `apps/site/data/bell-served.json` (`first_record`, `head`) et dans les épingles de `test/bell-served.test.ts:68-78` et `:97-101`.
- **Vitrine** (`https://monarkgate.tech/bell/anchors`) : l'upload 17 (fusion PR-A `48e3561`) a mis en ligne `publications.json`, le manifeste `602ff93d…` et la preuve `abfaf787…` ; sondes depuis le VPS, 10 chemins sur 10 à 200 (`docs/JOURNAL-PROVENANCE.md:398`, lu, non rejoué). Uploads 18 à 20 depuis (`docs/CHANTIERS.md:1453`, `docs/JOURNAL-PROVENANCE.md:402`, `:404-405`, ce dernier exporté de `git archive 1f6ad42`). `git diff --stat 48e3561 0e38b5d` sur `apps/site/public/bell/anchors`, `apps/site/lib/bell-anchors.ts`, `apps/site/lib/bell-anchors-load.ts`, `scripts/sync-bell-anchors.mjs`, `apps/site/data/bell-served.json` et `docs/bell-publications` : vide ; `1f6ad42..0e38b5d` ne touche que `docs/CHANTIERS.md` et `docs/JOURNAL-PROVENANCE.md`. Le servi d'ancrage est donc, par inférence, celui du dépôt : 36 fichiers sous `apps/site/public/bell/anchors/` (compté ici).
- **Ce que les pages affirment aujourd'hui**, recalculé hors ligne avec le lecteur du dépôt (`readOtsProof`, `anchorStatus`, `manifestDigests`, `manifestEntries`) sur les fichiers servis du dépôt (2026-09-25 vers 00:1xZ) : registre de course 17 lignes, 16 preuves, 16 avec enregistrement de bloc, 1 sans preuve, 36 digests listés ; le `.some` des pages est faux, `/bell` rend « none: no anchor manifest lists the latest record's digests; it is signed and chained, not timestamp-anchored » (`page.tsx:364-366`), `/bell/method` ses deux variantes (`method/page.tsx:395-397`, `:491-493`).
- **Ce que PR-B changera sur ces mêmes données** : la ligne de registre seq 2 compte pour la tête (clé `timeline.jsonl#L2` = `ef3b06f2…` = `head.line_hash`, clé et valeur ; préfixe `fba1824d…` ; fichiers = immuables de la ligne 2) et sa preuve ne porte aucun bloc : état **`pending`**. La phrase servie passe de `none` à `pending` au premier build de PR-B, sans mise à niveau. C'est une affirmation publique nouvelle (§4.3, S-1).

### 1.2 Ce que le chargeur lit et ne lit pas

- `loadAnchors()` (`apps/site/lib/bell-anchors-load.ts:35-68`) lit `anchors.json` et les fichiers des lignes de course, re-hache chaque manifeste (`:42-43`) et relie chaque preuve (`:45-46`) ; il ne lit jamais `publications.json` : T-2 exige que le fichier ne contienne pas le mot « publications » (garde E-9, `test/bell-anchors.test.ts:72-73`). `listedDigests` (`:31-32`, `:38`, `:44`, `:66`) ne réunit que des digests de course.
- Contrefactuel mesuré (défauts latents (i) et (ii) de l'ADR mère :52) : si l'on ajoute à `listedDigests` les entrées du manifeste servi de seq 2, le `.some` devient vrai par `state_sha256` `4564701a…08b9`, d'une preuve pendante ; les pages diraient alors « an anchor manifest lists the latest record's digests ». La garde E-9 est ce qui l'empêche ; PR-B la lève avec la fonction d'état (D-B8).
- Il lit `process.cwd()/public/bell/anchors` (`:36`) et importe par l'alias `@/lib/bell-anchors` (`:9`) : un programme Node hors Next, tel `scripts/assert-fleet-html.mjs` (T-3b), ne peut pas l'importer tel quel (motif de D-B7).

### 1.3 Preuve de seq 2 : toujours pendante

- `docs/bell-publications/timeline-seq2-manifest.txt.ots` et sa copie servie : 805 octets, sha256 `abfaf787237a40b95ff02a93ec23faa51010ce90d867ccb93a1b1eb21387f4ca`, opération sha256, digest attesté `602ff93d60dbf10fe96b0b2cfcd5b8ff439d2d0019f4daa362e9dd6ad3f16946`, égal au sha256 du manifeste (457 octets). Lecture hors ligne par `readOtsProof` et `anchorStatus` du dépôt : 4 attestations `pending` (quatre URI de calendriers), **0 attestation Bitcoin**. Pendante au commit `0e38b5d`.
- Copie durable `F:/PRODUITS/bell-mirror/ots/` (listing, lecture seule) : 2 fichiers, `602ff93d…` et `abfaf787…`, aucun `.bak`, aucune copie mise à niveau.
- Les URI de calendriers désignent des opérateurs tiers ; aucune page ne les rend (`apps/site/components/bell/anchors-table.tsx:71-80` ne rend que des comptes) ; la table de PR-B suit la même règle.

### 1.4 Registre D3

- `docs/bell-publications/ANCHORS.md` : en-tête à neuf colonnes (:13-14) et **une** ligne (:15) : `2026-09-24T13:37:02Z`, seq 2, `publication`, `line_hash` `ef3b06f2…`, `prefix_sha256` `fba1824d…`, `manifest_sha256` `602ff93d…`, commit `694e98b`, `ots_ref` `timeline-seq2-manifest.txt.ots`. `apps/site/public/bell/anchors/publications.json` porte la même ligne (clés anglaises, sans note).
- La section « Format » du registre (:10) prescrit déjà `not timestamped at <date_u>` pour une ligne sans preuve : c'est le fondement de D-B15.

### 1.5 Ce que PR-A a déjà livré de D9.3 (écart E-1)

| Élément de D9.3 (:268) | État à `0e38b5d` | Preuve |
|---|---|---|
| parseur `parsePublicationAnchors` | livré | `apps/site/lib/bell-anchors.ts:274-297` |
| `manifestEntries` | livré | `:301-310` |
| liaison `bindPublicationAnchor` (écart E-2, jugé conforme, `G2-PR-A.md:76`) | livré | `:317-329` |
| synchro à deux registres, liaison avant écriture, feuille non régulière refusée | livré | `scripts/sync-bell-anchors.mjs:40-77`, `:57`, `:70` |
| T-2 | livré | `test/bell-anchors.test.ts:61-74` |
| assertion du répertoire source (C-7) | livré | `:77-85` |
| refus avant écriture (CM-13) | livré | `:89-98` |
| erreurs nommées du lecteur | livré | `:101-117` |
| `publicationAnchorState`, chargeur des publications, trois pages, table, T-1, T-3, `lines[]`, contrôle `lines[]` de la synchro | **absents** | `git grep` : 0 occurrence de `publicationAnchorState`, `bindPublicationRowToLines`, `latestAnchoredSeq` ; `lines` n'existe dans `bell-served-load.ts` que comme compte `timeline.lines` (:94, :365, :379, :536) |

Les sha256 à `0e38b5d` de `bell-anchors.ts` (`1e30ce63…`), de la synchro (`4bf6df19…`), de l'outil (`aa09e143…`) et de `test/bell-anchors.test.ts` (`5a21114f…`) égalent ceux que le G1 PR-A consigne après son pli (:22, :216-219) : le code de PR-A est intact.

### 1.6 Données du site (`bell-served.json` v3)

- Schéma `monark-site-bell-served-v3` (`apps/site/lib/bell-served-load.ts:19`), clés de premier niveau fermées (`:361-362`), sans `lines` ; `read_at` `2026-09-24T08:43:45.173Z` ; sha256 du fichier `d93c6878…4025`, égal à l'entrée du manifeste de données (`apps/site/data/manifest.sha256.json:9`) et à l'épingle `test/bell-served.test.ts:67`.
- Écrit par `buildBellServed` (`:449-548`) via `scripts/sync-bell-served.mjs` : six GET (`:58-64`), marche de toute la timeline sous le trousseau committé (`:459-460`), refus d'une ligne annulée ou d'une rotation en rupture (`:461-462`), faits de ligne par `lineFacts` avec `line_hash` recalculé (`:517-520`), liaison des corps lus au deploy check committé (`:524-527`).
- Une régénération hors ligne serait possible sauf pour une entrée : l'immuable d'état de seq 1 (`states/a828489f…a240.json`) n'est pas dans le miroir durable (`F:/PRODUITS/bell-mirror/immutables/` ne porte que les deux immuables de seq 2, listing). D-B12 retient donc la synchro réseau existante.

### 1.7 Sites de ré-épinglage et de garde (lignes à `0e38b5d`)

| Site | Aujourd'hui | Après PR-B |
|---|---|---|
| `test/bell-anchors.test.ts:72-73` | garde E-9 | retirée (D-B8) ; la liaison dans le chargeur est éprouvée par M-5 bis (T-3a) |
| `test/bell-anchors.test.ts:160-164` | épingle `anchored === false` | retirée, remplacée par T-3a (état recalculé, jamais un littéral) |
| `test/bell-anchors.test.ts:165-167`, `test/bell-served.test.ts:430` | regex `anchors.listedDigests` | `publicationAnchorState\(` |
| `test/bell-served.test.ts:67` | sha256 v3 | sha256 v4 |
| `test/bell-served.test.ts:86-112` | épingles de la tête et du premier enregistrement | plus `lines[]` = tableau du §1.1 |
| `test/bell-served.test.ts:142-155` (`NUMBER_PATHS`) | sans `lines` | plus `lines[].seq` |
| `test/bell-served.test.ts:159` (`SCANNED`) | pages, table de course, chargeurs | plus la table nouvelle, `bell-publications-load.ts`, `publications.json` (formes fournisseurs, ADR mère §5 :299) |
| `test/site-build-fleet.test.ts:1000` | `page.tsx` contient « not timestamp-anchored » | re-pointé vers `bell-anchors.ts` (phrase `none`) et contrôle que `/bell` rend par la fonction (conséquence de D-B6 ; écart à :212 « reste inchangé », point P-2 du §7) |
| `test/bell-anchors.test.ts:172-180` | phrase de course dans quatre fichiers | inchangé et vert (C-8) |
| `test/site-docs.test.ts:677-707` | garde D8 sur /docs, Building, panneau Shōgen | portée étendue (D-B14) |
| `apps/site/data/manifest.sha256.json:9` | sha256 v3 | sha256 v4 |

## 2. Découpage en tâches

Chaque tuyau est déclaré au sens de la règle Branchement (ADR-M018 D3 ; ADR mère D7 :227-239) : entrée (qui produit), sortie (qui consomme), état (où il vit) et test non-LLM qui rejoue la composition. Les lignes R-25 sont une estimation ascendante (aucun code écrit), à mesurer au G1 (§2.2).

### 2.1 Tâches

#### T-B1 · `lines[]` v4 dans les données du site (D-B2, D-B12 ; SYNC-LINES-CHECK-1, part données)

- **Fichiers** : `apps/site/lib/bell-served-load.ts` (`BELL_SERVED_SCHEMA` v4 ; type `BellServedTimelineLine` ; champ `lines` de `BellServedData` ; clé `lines` dans `obj(d, …)` de `:361-362` ; validation et contrôles croisés au chargement ; émission dans `buildBellServed` ; `$comment`) ; `scripts/sync-bell-served.mjs` (en-tête : v4, `lines`) ; `apps/site/data/bell-served.json` (régénéré, D-B12) ; `apps/site/data/manifest.sha256.json:9` ; `test/bell-served.test.ts`.
- **Règles du chargeur (fail-closed)** : `lines` est un tableau et `lines.length === timeline.lines` ; l'entrée d'indice i a `seq === i + 1` ; clés exactes `{seq, kind, line_hash, prev_line_hash}` plus `{state_sha256, provenance_sha256}` si et seulement si `kind === "publication"` ; `kind` dans la liste fermée de `apps/bell/scripts/bell-chain.mjs:102` ; `lines[0].prev_line_hash === BELL_GENESIS` ; `lines[k].prev_line_hash === lines[k - 1].line_hash` pour tout k ≥ 1 ; nombre d'entrées `publication` = `timeline.publications` ; `lines[first.seq - 1]` et `lines[head.seq - 1]` égaux aux faits de `first_record` et de `head` ; aucune entrée `publication` après `head.seq` (la tête est la dernière publication, C-1).
- **Tuyau** : entrée = timeline servie, marchée sous le trousseau committé par `buildBellServed`, que produit `sync-bell-served.mjs` ; sortie = `lines[]` ; consommateurs = la synchro (T-B2), le chargeur et les pages (T-B5, T-B6), T-2 et T-3a ; état = `apps/site/data/bell-served.json`, committé et haché par le manifeste de données ; composition rejouée par T-3a (tête et `lines[]` vers l'état) et par le test positif de la synchro (T-B3), qui lit `lines[]`.
- **Tests** : `bell_served_build_binds_the_latest_publication_not_the_first` étendu (sur la fixture signée à deux lignes, `lines[]` égale un recalcul) ; `bell_served_first_record_and_latest_publication_pinned` étendu (`lines[]` = tableau du §1.1) ; `bell_served_loader_is_fail_closed` étendu (copies hachées mutées).
- **Mutants à rougir** : L-1 `buildBellServed` n'émet pas `lines` ; L-2 `prev_line_hash` d'une entrée différent du `line_hash` de la précédente ; L-3 trou de `seq` ; L-4 `lines[head.seq - 1].line_hash` différent de `head.line_hash` ; L-5 entrée `publication` sans `state_sha256` ; L-6 entrée `key_rotation` avec `state_sha256` ; L-7 entrée `publication` après la tête ; L-8 `lines.length` différent de `timeline.lines`. Pour chacun, le chargement jette, donc `next build` rougirait.
- **Contrainte** : `sync-bell-served.mjs` refuse si un corps servi a changé depuis le deploy check committé (`bell-served-load.ts:526`) : régénérer avant toute seq 3 (décision 201).
- **R-25** : environ 85 lignes (chargeur et projection 33, en-tête du script 4, données régénérées 24, manifeste 2, tests 22).

#### T-B2 · Synchro liée à la chaîne et sans lien suivi (D-B3, D-B4, D-B15)

- **Fichiers** : `apps/site/lib/bell-anchors.ts` (type structurel minimal d'une entrée de `lines[]` ; `bindPublicationRowToLines(row, entries, lines)` à erreurs nommées ; une ligne dans `parsePublicationAnchors` pour D-B15) ; `scripts/sync-bell-anchors.mjs` (import de `loadBellServed` par URL de fichier, comme `:40` ; liaison à `lines[]` de chaque ligne du registre de publication, horodatée ou non, avant toute écriture ; fonction `noLinkOnPath(rel)` : `lstat` de chaque composant depuis la racine, répertoire réel pour chaque intermédiaire, fichier régulier pour la feuille, appliquée aux deux registres, à chaque preuve et manifeste (remplace `:57`), à `apps/site/data/bell-served.json` et au manifeste de données, et au répertoire servi avant `:73-74` ; en-tête).
- **Erreurs nommées** de `bindPublicationRowToLines` : « seq <n> is beyond the served lines (run the served-data sync first) » ; « line_hash is not that of line <n> » ; « kind is not that of line <n> » ; « the manifest's files are not those line <n> names » (publication : exactement `provenance/<provenance_sha256>.json` et `states/<state_sha256>.json` de l'entrée `seq` ; ligne de clé : aucun fichier). Une ligne non horodatée ne subit que les trois premiers contrôles.
- **Tuyau** : P-4 (:234) ; entrée = registre D3, manifestes et preuves (orchestrateur, étape 13 bis) et `lines[]` (T-B1) ; sortie = `apps/site/public/bell/anchors/{publications.json, timeline-seq*}` ; consommateurs = le chargeur des publications (T-B5), puis la table de `/bell/anchors` (T-B6) ; état = le répertoire servi du dépôt ; composition rejouée par le test positif (T-B3, C-V-1) et par T-2.
- **Mutants à rougir** (tests en T-B3) : S-1 `line_hash` de la ligne de registre différent de l'entrée `seq` ; S-2 `seq` au-delà de `lines[]` ; S-3 = G2-M7 (le manifeste liste l'état de seq 1, preuve refaite sur son digest, registre recalculé) : synchro exit 1 avant écriture et T-2 rouge ; S-4 `kind` différent ; S-5 à S-10 liens : B1 registre de publication en lien fichier, B2 registre de course en lien fichier, B3 `docs/bell-publications/` en jonction, B4 répertoire servi en jonction (cible extérieure intacte), B5 `docs/course-bell/` en jonction, B6 `bell-served.json` en lien : exit 1, sentinelle du servi intacte ; S-11 (D-B15) `ots_ref` « not timestmped at … » : erreur nommée du parseur.
- **R-25** : environ 30 lignes (bibliothèque 13, synchro 17).

#### T-B3 · Tests de la synchro (C-V-1, TEST-CPSYNC-SYMLINK-1, liens, T-2 étendu, erreurs nommées ; TMP-HYGIENE-1 pour ce fichier)

- **Fichier** : `test/bell-anchors.test.ts`.
- Une aide commune `syncRoot()` (R-3) copie dans un répertoire temporaire la synchro, `bell-anchors.ts`, `bell-served-load.ts`, les deux répertoires de registre, le servi, `bell-served.json` et le manifeste de données ; elle **refuse tout lien dans les sources copiées (`lstat` récursif) avant `cpSync`** (TEST-CPSYNC-SYMLINK-1) ; elle pose les manifestes de course aux octets de leurs lignes (motif de `:92`, aucun `git show`) ; le nettoyage est en `finally`.
- Nouveau test positif `bell_anchors_sync_rewrites_the_served_set_byte_for_byte` (C-V-1) : synchro exit 0, ensemble servi égal à celui du dépôt, nom par nom et sha256 par sha256 (36 fichiers à ce jour ; le checkpoint-2 de PR-A l'a mesuré à la main : `F:\tmp\ots-1\cp2\logs\served-before-sync.sha256` = `served-after-sync.sha256`, 36 lignes).
- Le test CM-13 (`:89-98`) passe sur `syncRoot()`, `rmSync` en `finally`.
- Nouveau test `bell_anchors_sync_follows_no_link` : B1 à B6 (S-5 à S-10), liens créés par `symlinkSync` (type `junction` pour un répertoire, `file` pour un fichier) ; si la plateforme refuse la création (EPERM), le cas est **sauté par son nom**, jamais un vert muet ; il doit tourner sous win32 (`core.symlinks=false`, `G2C-PR-A.md:31`) et sous ubuntu (CI).
- T-2 étendu : chaque ligne servie passe `bindPublicationRowToLines` avec le `lines[]` committé ; garde E-9 retirée (D-B8).
- Erreurs nommées étendues : S-1, S-2, S-3, S-4, S-11.
- **Résiduel déclaré** : la branche `git show` de la synchro (`sync-bell-anchors.mjs:59-61`) n'est pas exercée par `npm test` ; elle l'est par la synchro réelle de l'orchestrateur. Un test demanderait un dépôt jetable sous la règle TEST-GIT-ENV-ISOLATION-1 (`GIT_DIR` et `GIT_WORK_TREE` explicites vers le répertoire temporaire) : option d'environ 10 lignes, à la décision de l'orchestrateur.
- **R-25** : environ 55 lignes.

#### T-B4 · Fonction d'état et phrases (D-B5, D-B6)

- **Fichier** : `apps/site/lib/bell-anchors.ts` (reste pur, sans import).
- `publicationAnchorState(head, lines, bound)` : `head = {seq, line_hash}` est la dernière ligne `publication` (C-1) ; `lines` = `lines[]` ; `bound` = les lignes horodatées déjà liées par le chargeur, `{row, entries, status}` avec `status = anchorStatus(proof)`. Toute entrée de `seq > head.seq` qui n'est pas une ligne de clé fait jeter (:202 (ii)). Une ligne compte si (i) `row.seq >= head.seq` ; (ii) `lines[head.seq - 1].line_hash === head.line_hash` et, pour tout k de `head.seq + 1` à `row.seq`, `lines[k - 1].prev_line_hash === lines[k - 2].line_hash` ; (iii) l'entrée de clé exacte `timeline.jsonl#L<row.seq>` porte `lines[row.seq - 1].line_hash` (clé et valeur) ; (iv) la preuve atteste le manifeste (tenu par le chargeur avant l'appel). Résultat : `anchored` si une ligne comptée porte au moins une hauteur (`earliestHeight` = la plus petite sur toutes les lignes comptées, `via_seq` = la ligne qui la porte, départage par `seq` puis `date_u` croissants, `blockRecords` = nombre de hauteurs de cette preuve) ; sinon `pending` si une ligne compte (`via_seq` et `date_utc` de la plus ancienne dans l'ordre du registre, `seq` puis `date_u`) ; sinon `none`. `latestAnchoredSeq` = le plus grand `seq` d'une ligne liée dont la preuve porte un bloc, ou `null`.
- `publicationAnchorSentence(state)` : les phrases S-0 à S-3 du §4.3, nombres et dates rendus depuis l'état.
- **Tuyau** : entrée = lignes liées (T-B5), tête et `lines[]` (T-B1) ; sortie = état et phrase ; consommateurs = `/bell`, `/bell/method` (T-B6) et T-3b (T-B9) ; état = aucun, calculé à chaque build ; composition rejouée par T-3a et T-3b.
- **R-25** : environ 42 lignes.

#### T-B5 · Chargeur des publications (D-B7 ; PRB-BIND-IN-LOADER-1)

- **Fichiers** : `apps/site/lib/bell-publications-load.ts` (nouveau, autonome : `node:fs`, `node:path`, `node:crypto`, bibliothèque pure injectée comme les dépendances de `buildBellServed(input, deps)`) ; `apps/site/lib/bell-anchors-load.ts` (retrait de `listedDigests` à `:31-32`, `:38`, `:44`, `:66` ; l'appel à `manifestDigests` de `:44` reste comme contrôle de forme, fail-closed).
- `loadPublicationAnchors(publicDir, served, lib)` : lit `publications.json` ; pour chaque ligne horodatée : octets du manifeste, sha256, `readOtsProof`, `bindPublicationAnchor`, `manifestEntries`, `bindPublicationRowToLines`, `anchorStatus` ; rend les lignes (vue de table), les comptes (lignes, preuves, avec bloc, sans preuve) et `bound`. Toute incohérence jette : le build rougit.
- **Tuyau** : entrée = répertoire servi (T-B2) et `bell-served.json` (T-B1) ; sortie = lignes liées ; consommateurs = `publicationAnchorState` dans les pages, la table de `/bell/anchors`, T-3a et T-3b ; composition rejouée par T-3a (M-5, M-5 bis).
- **R-25** : environ 33 lignes (module 28, retrait 5).

#### T-B6 · Pages et table (D-B9 ; seul le texte au régime vitrine)

- **Fichiers** : `apps/site/app/bell/page.tsx` (`:255` remplacé par le chargeur et `publicationAnchorState(` ; le dd `:362-367` rend la phrase ; `:553-555` et `:585` renvoient au dd sans formuler d'état ; la ligne de statut `:640-643` couvre aussi les publications ; `:693-695` selon l'arbitrage de BELL-D8-PROVES-1) ; `apps/site/app/bell/method/page.tsx` (`:106` idem ; `:395-397` renvoi ; carte « Anchors of published records » dans la section `:471-508`, textes D4 et clés du manifeste rendues depuis les données ; le dd `:489-494` rend la phrase) ; `apps/site/app/bell/anchors/page.tsx` (`:9`, `:22-24`, section et table des publications, comptes, `latestAnchoredSeq`, format du manifeste de publication) ; `apps/site/components/bell/publication-anchors-table.tsx` (nouveau) ; `apps/site/COMPONENTS-PROVENANCE.md` (une entrée).
- **Contraintes** : aucun chiffre littéral en position rendue, seuls 256 et 25519 étant admis (`apps/site/test/honesty-lint.exempt.json` ; jeton `/\d+(?:[.,]\d+)*/g` de `apps/site/test/honesty-lint.ts:52`) : les clés `timeline.jsonl#L<n>` et `#L1-L<n>` sont rendues depuis les entrées du manifeste servi ; aucun URI de calendrier (comptes seulement) ; aucun vocabulaire de cuisine dans un fichier exporté, commentaires compris (`site_names_no_kitchen`, `test/site-build-fleet.test.ts:1158` ; cause du rouge de PR-A, G1 PR-A:15) ; « counter-verification run of the multiplier history » reste dans les quatre fichiers que `test/bell-anchors.test.ts:175` contrôle.
- **Tuyau** : P-5 (:235) et face servie de P-4 ; entrée = état et phrase (T-B4), lignes liées (T-B5) ; sortie = HTML de `/bell`, `/bell/method`, `/bell/anchors` ; consommateurs = le lecteur et le tiers (P-6) ; composition rejouée par T-3b.
- **Mutants à rougir** : M-6 une page rend un état calculé autrement (`.some` restauré, ou littéral) : T-3b et la ré-épingle source rougissent (le retrait de `listedDigests` fait en outre rougir `typecheck`) ; M-10 la page rend la phrase d'un autre état : T-3b ; M-11 la table rend un statut qui n'est pas lu de la preuve : T-3b (table).
- **R-25** : environ 181 lignes (`/bell` 25, `/bell/method` 38, `/bell/anchors` 46, table 70, provenance 2) ; plus 6 si BELL-METHOD-ANCHOR-1 est absorbé (§3.2).

#### T-B7 · T-1 `bell_publication_anchor_state_is_derived_strictly`

- **Fichier** : `test/bell-anchors.test.ts` (ou un fichier racine nouveau, choix du worker à déclarer).
- **Fixtures** : objets construits, aucune preuve binaire : tête seq 2 ; `lines[]` de trois entrées (publication 1, publication 2, `key_rotation` 3 chaînée) ; lignes liées avec `entries` et `status`.
- **Mutants nommés** (:209) : M-1 le manifeste ne liste que `states/<head.state_sha256>.json` : `none` ; M-2 attestations pendantes seules : `pending`, jamais `anchored` ; M-3 `#L<n>` porte le `line_hash` d'une autre ligne : `none` ; M-3 bis bonne valeur sous `#L<k>`, k différent de `row.seq` : `none` ; M-4 `row.seq < head.seq` : `none` pour la tête, `latestAnchoredSeq` inchangé ; M-7 ligne `key_rotation` de seq 3, reliée, ancrée, aucune ligne de registre pour la tête : `anchored`, `via_seq` 3 ; M-7 bis `prev_line_hash` de l'entrée 3 altéré : `none`. Ajouts : M-8 une entrée `publication` après la tête : jette ; M-9 deux lignes comptées à hauteurs différentes : `earliestHeight` = la plus petite, `via_seq` = celle qui la porte ; en `pending`, la plus ancienne.
- **R-25** : environ 45 lignes.

#### T-B8 · T-3a `bell_publication_anchor_composes_served_head_to_rendered_claim` et ré-épinglages

- **Fichiers** : `test/bell-anchors.test.ts`, `test/bell-served.test.ts:430`.
- **Données réelles** : le test part de `bell-served.json` (tête, `lines[]`) et du répertoire servi, recalcule **lui-même** l'état attendu (sha256 par `node:crypto`, analyse des entrées du manifeste recodée, égalité relpath et digest, chaînage `prev_line_hash`, hauteurs lues par le lecteur structurel) et exige l'égalité avec `publicationAnchorState` appliquée aux lignes de `loadPublicationAnchors` ; aujourd'hui `pending` (§1.1).
- **Copie temporaire « bloc »** : le servi recopié, la preuve de seq 2 remplacée par la fixture « bloc » au digest substitué (D-B11) : `anchored`, `via_seq` 2, hauteur de la fixture ; même égalité ; rien d'écrit hors du temporaire (C-7).
- M-5 un octet du manifeste servi changé (dans la copie) : le chargeur jette ; M-5 bis chargeur sans `bindPublicationAnchor` : le cas M-5 rougit.
- Ré-épinglages : `:160-164` retiré ; `:165-167` et `test/bell-served.test.ts:430` deviennent `publicationAnchorState\(`.
- **R-25** : environ 42 lignes.

#### T-B9 · T-3b dans `scripts/assert-fleet-html.mjs`

- **Fichiers** : `scripts/assert-fleet-html.mjs` et `scripts/assert-fleet-html.d.mts` ; un test racine qui pilote les fonctions pures sur HTML synthétique (motif de `assertUkemiBody`, `test/site-ukemi.test.ts:66`, `:177-179`) ; `test/site-build-fleet.test.ts:1000` re-pointé (D-B6).
- `assertBellAnchorBody({html, expected})`, pure, sur `renderedBody`, `extractMain` et `mainCorpus` existants (`:225`, `:326`, `:337`) : la phrase de l'état calculé est présente ; les amorces des autres états sont absentes (`not timestamp-anchored` ; `the proof is pending: it records calendars` ; `the proof file records Bitcoin block`). `assertBellPublicationsTable` : pour chaque ligne servie du registre de publication, son `manifest_sha256` (attribut `title`, lu par `mainCorpus`) et son libellé de statut sont présents.
- `main()` importe `bell-served-load.ts`, `bell-publications-load.ts` et `bell-anchors.ts` par URL de fichier (aucun alias), calcule état et phrase comme les pages, lit `apps/site/.next/server/app/bell.html`, `bell/method.html` et `bell/anchors.html` ; un fichier absent donne exit 1, jamais un saut. Toujours lancé par le job `g3-site` (`.github/workflows/ci.yml:205-206`). Le script est exporté et lancé par le workflow public dérivé (`scripts/export-public.mjs:71-75`) : l'extension n'importe que des modules exportés de `apps/site` et reste en anglais (`lang:gate`).
- **Mutants à rougir** : M-6, M-10, M-11 (T-B6) ; la phrase présente seulement dans la charge RSC (motif de `assert-fleet-html.mjs:1-6`).
- **R-25** : environ 48 lignes.

#### T-B10 · Registre, gardes, balayages

- `apps/site/lib/fleet.ts:354` (plus l'identifiant de T-3a ; `test/ci-gates.test.ts:1059-1081` exige qu'il nomme un `test(` sous `test/`) ; `test/site-docs.test.ts:690-700` (portée D8 : plus les trois pages Bell, la table, les littéraux de `bell-anchors.ts`) ; `test/bell-served.test.ts:159` (`SCANNED`).
- **R-25** : environ 9 lignes.

#### T-B11 · Procédures (0 ligne R-25)

- `docs/RUNBOOK-bell.md`, « Next publications » (`:456-463`) : ordre deploy check committé, puis `sync-bell-served` (v4, manifeste de données et épingle), puis étape 13 bis, puis `sync-bell-anchors` (qui refuse une ligne au-delà de `lines[]`), puis build et upload. La phrase « Until item BELL-SITE-SEQ2-1 lands … `docs/deploy-CA-bell.json` stays seq 1 » (`:461-463`) est périmée (item livré à l'upload 16, `docs/CHANTIERS.md:1422`) et réécrite. Étape 13 bis, point 6 (`:451`) : une mise à niveau ne demande pas `sync-bell-served` (même tête). `docs/RUNBOOK-vitrine.md:9` (étape 0) : les deux registres et l'ordre des deux synchros.
- D-B12 (régénération) et rejeu déclaré au G1 : `lines[]` committé égal au recalcul hors ligne depuis la copie durable (§1.1).
- Rendu des autres pages (RENDER-FINGERPRINT-NONDET-1) : la balise `<meta name="next-size-adjust" content=""/>` est retirée avant hachage, comme à l'oracle du pli G2 de PR-A (`docs/CHANTIERS.md:1448`), et deux builds sont déclarés. Fondement lu dans le code installé : Next 16.3.4 (`F:/Monark/node_modules/next/package.json`) émet cette balise vide dans la tête initiale, après les métadonnées, quand `appUsingSizeAdjustment` est vrai (`dist/esm/server/app-render/app-render.js:1137-1147`, sha256 `dd453bbe…`) : elle ne porte aucun contenu de page.
- Mesures hors CI sur les trois pages Bell : 375 px (`F:\tmp\site-docs-1\g2\tools\mobile375.mjs`, sha256 `b6bac979…`) et liens (`links.mjs`, `dda562c3…`).

### 2.2 Total R-25

| Tâche | Lignes (estimation) |
|---|---|
| T-B1 `lines[]` v4 | 85 |
| T-B2 synchro | 30 |
| T-B3 tests de la synchro | 55 |
| T-B4 état et phrases | 42 |
| T-B5 chargeur | 33 |
| T-B6 pages et table | 181 |
| T-B7 T-1 | 45 |
| T-B8 T-3a et ré-épinglages | 42 |
| T-B9 T-3b | 48 |
| T-B10 registre et gardes | 9 |
| **Total** | **environ 570** (bande de ± 30 % : 400 à 740 ; plus 12 si BELL-METHOD-ANCHOR-1 et SYNC-MANIFEST-WRITE-1 sont absorbés) |

- Sous le plafond CI de 1 205 (`.github/workflows/ci.yml:49`) et le seuil STOP de 1 150 (ADR mère :270) : **pas de découpage**. CONTENT (`ci.yml:86`) attendu à 0 (aucun fichier sous `apps/site/app/docs`, `apps/site/components/docs`, `apps/site/app/roadmap`).
- Mesure au G1 : `git diff --shortstat <base de fusion avec lot/etude-suite> -- <pathspec de ci.yml:82 recopié mot pour mot>`, puis l'`awk` de `:90` ; fichiers non suivis ajoutés par `git add -N` dans une **copie** de l'index (`GIT_INDEX_FILE`), l'index réel jamais touché (méthode du G1 PR-A:117) ; les `.ots` comptent 0 ; `docs/**/*.md` exclus ; `.d.mts`, `apps/site/COMPONENTS-PROVENANCE.md` et `bell-served.json` comptés.
- Écart déclaré à l'ADR mère : D9.3 estimait PR-B à 300-400 lignes et le lot à 530-680 (:268, :270). PR-A a pris 431 lignes (`docs/JOURNAL-PROVENANCE.md:398`) en absorbant parseur, synchro, T-2 et C-7 ; PR-B ajoute les items absorbés, T-3b, la table et le module de chargement : lot total estimé à environ 1 000 lignes sur deux PR, chacune sous le plafond.

### 2.3 Coupe de repli (seulement si le G1 mesure plus de 1 150)

- **PR-B1** = T-B1, T-B2, T-B3 et la partie « ordre des synchros » de T-B11 (environ 170 lignes) : aucune page, aucune phrase publique ne change ; la garde E-9 reste ; `bell-anchors-load.ts`, les pages, `assert-fleet-html.mjs` et `fleet.ts` ne sont pas touchés.
- **PR-B2** = T-B4 à T-B10 (environ 400 lignes) : état, chargeur, pages, T-1, T-3 ; PRB-LOADER-GUARD-1 y est levé ; dépend de PR-B1 (`lines[]`).

### 2.4 Ordre d'exécution

T-B1, régénération D-B12 (les tests épinglés en dépendent), T-B2, T-B3, T-B4, T-B5, T-B7, T-B8, T-B6, T-B9, T-B10, T-B11. Un seul état gelé du worktree ; commits par l'orchestrateur seul (R-20) ; tout pli de code par un worker (FOLD-BY-WORKER-1, §3.2).

## 3. Absorption des items

### 3.1 Les items ouverts de PR-A (`docs/JOURNAL-PROVENANCE.md:398`)

L'entrée annonce « Items ouverts (10) » puis nomme douze items, plus « upgrade de la preuve seq 2 après bloc Bitcoin » et BELL-OTS-NODE-VERIFY-1 : quatorze, tous traités ci-dessous (écart de compte au §7.1).

| # | Item (source) | Disposition | Motif |
|---|---|---|---|
| 1 | PRB-LOADER-GUARD-1 (G1 PR-A:156) | **absorbé** par T-B3, T-B5 et T-B8, dans un même changement (D-B8) | déclencheur « PR-B » |
| 2 | SYNC-LINES-CHECK-1 étendu (G1 PR-A:157 ; `docs/CHANTIERS.md:1445`) | **absorbé** par T-B1 (données), T-B2 (synchro), T-B3 (S-3 = G2-M7 rouge dans la synchro et dans T-2) | l'amendement de D5 est D-B2 |
| 3 | RENDER-FINGERPRINT-NONDET-1 (G1 PR-A:162) | **absorbé** par T-B11 (méthode du G1 et du G2 de PR-B : balise retirée, deux builds) ; la lecture de documentation que l'item demande est remplacée par la lecture du code installé (§7.1, point 5) | déclencheur « prochaine affirmation « rendu identique » (G1 et G2 de PR-B) » |
| 4 | FIXTURE-GEN-VERSIONED-1 (G1 PR-A:163) | **absorbé** par T-B7 (objets) et T-B8 (substitution de digest en temporaire) : ni générateur versionné, ni binaire nouveau | seconde option de l'item |
| 5 | OTS-REF-STRICT-1 (G1 PR-A:164) | **décision de l'orchestrateur** ; proposé (b) (D-B15), alors absorbé par T-B2 (S-11) ; si (a), clos par décision avec le résiduel nommé (seuls C-7 et T-2 voient une faute de frappe, `G2-PR-A.md:190`) | l'item est une décision de conception |
| 6 | PRB-BIND-IN-LOADER-1 (G1 PR-A:165) | **absorbé** par T-B5 (liaison avant tout état) et T-B8 (M-5 bis) | déclencheur « PR-B » |
| 7 | SCRIPTS-STATIC-COVERAGE-1 (G1 PR-A:166) | **hors PR-B**, déclencheur inchangé « prochain lot d'outillage CI » | `checkJs` sur `scripts/` touche tous les scripts, sujet distinct (R-25 : un seul sujet) ; PR-B garde `node --check` de ses trois `.mjs` dans l'oracle (§5) |
| 8 | TMP-HYGIENE-1, fusionné avec O-MP-1 (G1 PR-A:167 ; `docs/adr/ADR-U4b-calibration-episode-frais.md:992`) | **absorbé pour les fichiers que PR-B touche** (T-B3 : `finally` dans `test/bell-anchors.test.ts` ; `test/bell-served.test.ts` nettoie déjà en `finally`, `:241-243`, `:362-364`, `:471-473`) ; **reste ouvert** ailleurs, déclencheur inchangé | liste candidate mesurée par `grep` (fichiers à `mkdtempSync` sans `rmSync`), heuristique, non confirmée comme résidu réel : `apps/bell/test/{bell-publish-validate,bell,collect,discover,rebase-produce,report,rebase-crosscheck}.test.ts`, `apps/bell/test/helpers/bell-served.ts`, `packages/atelier/test/atelier.test.ts`, `test/bell-caddy.ts` ; `test/bell-anchor-timeline.test.ts` nettoie en fin de corps, sans `finally` |
| 9 | SYNC-LSTAT-PATH-1 (G1 PR-A:251) | **absorbé** par T-B2 et T-B3 (B1, B2, B3, B5, B6) | déclencheur « G0 de PR-B » |
| 10 | TEST-CPSYNC-SYMLINK-1 (G1 PR-A:252) | **absorbé** par T-B3 (`syncRoot()` refuse tout lien avant `cpSync` ; `finally`) | idem |
| 11 | SYNC-SERVED-JUNCTION-1 (G1 PR-A:253) | **absorbé** par T-B2 (répertoire servi contrôlé avant le balai `:73-74`) et T-B3 (B4, cible extérieure intacte) | idem |
| 12 | C-V-1, test positif de P-4 dans `npm test` (`docs/CHANTIERS.md:1452`) | **absorbé** par T-B3 | idem |
| 13 | Mise à niveau de la preuve de seq 2 après bloc Bitcoin (G1 PR-A:160 ; ADR mère D6 :225, C-6) | **hors PR-B** : procédure P-3, acte de l'orchestrateur ; déclencheur : la fenêtre opérateur où `ots upgrade` rend « complete » (copie durable déjà faite, §1.3) ; placée après PR-B par la décision 201 ; peut précéder le G7 de PR-B (D-B16) | à la mise à niveau : commit de la preuve, `sync-bell-anchors`, `npm test` (T-3 recalcule `anchored`), build, `assert-fleet-html`, upload, sondes |
| 14 | BELL-OTS-NODE-VERIFY-1 (ADR mère :306 ; amendement 198 :383-384) | **hors PR-B**, déclencheur inchangé : « avant tout retrait de la clause « not checked against a node here » d'une surface servie » | décision de coût de l'investisseur et go réseau ; PR-B introduit la clause dans toute phrase `anchored` (S-2, S-3) et T-3b en exige la présence |

Inchangés, sans déclencheur dans PR-B : BELL-VERIFY-SCHEDULE-1, Q6-ANCHOR-1, ANCHOR-TOOL-COMMIT-1, COURSE-ANCHORS-TEMPLATE-ROWS-1 (ADR mère §6 :305-311).

### 3.2 Items d'autres lots dont le déclencheur tombe sur PR-B (hors liste de la mission ; propositions, décision de l'orchestrateur)

| Item (source) | Déclencheur écrit | Pourquoi PR-B le déclenche | Proposition |
|---|---|---|---|
| BELL-D8-PROVES-1 (ADR mère :386 ; `docs/CHANTIERS.md:1463`) | prochaine édition de `/bell` | PR-B édite `/bell` | (a) reformuler `page.tsx:694-695` (P-B5, §4.3), recommandé : la phrase retire aussi « and when », que l'ADR mère réfute (D4 :187 : `published_at` est l'horloge de l'hôte) ; (b) épingler une troisième forme dans `D8_ALLOWED` (`test/site-docs.test.ts:681`, précédent de la décision 204). Choix de l'investisseur (§7.2, P-5) |
| BELL-METHOD-ANCHOR-1 (`docs/CHANTIERS.md:1469`) | prochaine édition de `/bell/method`, avec DOCS-LINKS-GATE-1 | PR-B édite `/bell/method` | absorber le correctif dans T-B6 (environ 6 lignes) : sur `/bell/method` (`:580`), le lien de `BellContact` (`apps/site/components/bell/contact.tsx:18`, `#request-a-symbol`) vise une section rendue par `/bell` seul (`apps/site/components/bell/request-section.tsx:12`, `page.tsx:752`) ; mesure par `links.mjs` ; DOCS-LINKS-GATE-1 reste une porte d'outillage |
| BELL-MOBILE-375-1 (`docs/G1-lot-site-docs-1.md:401`) | prochaine édition de `/bell` | idem | hors PR-B (mise en page, sujet distinct), avec non-régression mesurée au G1 (`scrollWidth` de `/bell` ≤ 496, `docs/G1-lot-site-docs-1.md:366`) ; déclencheur à re-former |
| SYNC-MANIFEST-WRITE-1 (`docs/CHANTIERS.md:1422`) | prochaine synchro | D-B12 relance `sync-bell-served` | absorber pour ce seul script (T-B1, environ 6 lignes : écrire l'entrée du manifeste de données au lieu de l'imprimer, `sync-bell-served.mjs:82`) ; les autres synchros restent sous l'item |
| SVG-OVERFLOW-GATE-1, DOCS-LINKS-GATE-1, RENDERED-VOCAB-GATE-1, et CHAINLINK-NAME-ADR-1 qui s'y joint (`docs/G1-lot-site-docs-1.md:399-400`, `:403` ; `docs/CHANTIERS.md:1463`) | prochain lot site | PR-B est un lot site ; NAV-APPLICATIONS-1 en était déjà un, sans disposition consignée (`docs/JOURNAL-PROVENANCE.md:404-405` et `docs/CHANTIERS.md:1473-1477` lus) | hors PR-B (portes d'outillage CI, sujet distinct) ; T-B9 couvre pour les pages Bell une part de RENDERED-VOCAB-GATE-1 (balayage du HTML construit) ; déclencheurs à re-former |
| TEST-GIT-ENV-ISOLATION-1 (`docs/CHANTIERS.md:133`) | avant la prochaine G2 qui rejoue `verify-bell` | la G2 de PR-B rejoue `npm test` complet, dont `test/verify-bell.test.ts:210-221` | lot dédié (amendement de la décision 21) avant la G2 de PR-B, ou mission G2 sous la règle « jamais `GIT_DIR`, copie `git archive` » et déclencheur re-daté |
| VALIDATEUR-NO-WRITE-TREE-1 (`docs/CHANTIERS.md:135`) | avant le prochain checkpoint-2 | PR-B a un checkpoint-2 | précondition du checkpoint-2 de PR-B (acte de l'orchestrateur) |
| FOLD-BY-WORKER-1 (`docs/CHANTIERS.md:1469`) | prochain pli SITE | tout pli de PR-B | règle : tout pli de code de PR-B par un worker |
| EXPORT-GITIGNORED-FILES-1 (`docs/CHANTIERS.md:1463`) | avant le prochain upload | upload de PR-B | export depuis l'arbre commité (`git archive`), comme aux uploads 19 et 20 |

## 4. Régime (C-4) et phrases publiques

### 4.1 Sous G2 et checkpoint-2 (tout le chemin d'affirmation hors texte JSX), liste fermée

1. `apps/site/lib/bell-anchors.ts` (`bindPublicationRowToLines`, `publicationAnchorState`, `publicationAnchorSentence` et ses phrases, la ligne de D-B15) ;
2. `apps/site/lib/bell-publications-load.ts` (nouveau) ;
3. `apps/site/lib/bell-anchors-load.ts` (retrait de `listedDigests`) ;
4. `apps/site/lib/bell-served-load.ts` (schéma v4) ;
5. `scripts/sync-bell-anchors.mjs`, `scripts/sync-bell-served.mjs` ;
6. `scripts/assert-fleet-html.mjs`, `scripts/assert-fleet-html.d.mts` ;
7. `apps/site/data/bell-served.json`, `apps/site/data/manifest.sha256.json` ;
8. `apps/site/lib/fleet.ts` (une ligne ; registre, T2 au sens d'ADR-M013 :20) ;
9. `apps/site/COMPONENTS-PROVENANCE.md` ;
10. `test/bell-anchors.test.ts`, `test/bell-served.test.ts`, `test/site-docs.test.ts`, `test/site-build-fleet.test.ts` et le test pilote de T-3b ;
11. dans `apps/site/app/bell/page.tsx`, `apps/site/app/bell/method/page.tsx`, `apps/site/app/bell/anchors/page.tsx` et `apps/site/components/bell/publication-anchors-table.tsx` : **toute ligne qui n'est pas du texte** (imports, appels, conditions, expressions rendues), c'est-à-dire le câblage de l'affirmation.

### 4.2 Au régime vitrine (décisions 146 et 183)

Les seuls nœuds de texte et attributs visibles littéraux des quatre fichiers du point 11 ci-dessus. Aucune phrase d'état n'y figure : les états sont rendus depuis la fonction (D-B6) ; les renvois de `/bell` (`:553-555`, `:585`) et de `/bell/method` (`:395-397`) ne formulent aucun état.

### 4.3 Phrases publiques proposées (anglais)

Phrases d'état, produites par `publicationAnchorSentence` (régime G2 et checkpoint-2) ; `{…}` est rendu depuis l'état, jamais écrit en source :

- **S-0 `none`** (mot pour mot, D6 :217, rendu aujourd'hui par `page.tsx:366`) : « none: no anchor manifest lists the latest record's digests; it is signed and chained, not timestamp-anchored »
- **S-1 `pending`** (D6 :218) : « submitted for a timestamp on {date_utc} UTC; the proof is pending: it records calendars, no Bitcoin block yet »
- **S-1v `pending` par une ligne ultérieure** (variante grammaticale de D6 :220) : « submitted for a timestamp on {date_utc} UTC through a later line of the same chain (line {via_seq}), which carries this record's line by its hash; the proof is pending: it records calendars, no Bitcoin block yet »
- **S-2 `anchored`** (D6 :219, plus « before », que D8 :249 exige) : « anchored: the proof file records Bitcoin block {earliestHeight}{, the earliest of {blockRecords}}; the record's line and every line before it existed before that block; read from the file when this page was built, not checked against a node here » (le segment « , the earliest of … » seulement si `blockRecords` > 1)
- **S-3 `anchored` par une ligne ultérieure** (D6 :220) : « anchored through a later line of the same chain (line {via_seq}), which carries this record's line by its hash: the proof file records Bitcoin block {earliestHeight}{, the earliest of {blockRecords}}; the record's line and every line before it existed before that block; read from the file when this page was built, not checked against a node here »

Texte JSX (régime vitrine) :

- **P-M1** (`/bell/method`, texte D4 :191 accepté au checkpoint-1 ; deux précisions proposées : « For each timestamped line » au lieu de « After each new line », et « for a publication ») : « Anchors of published records. For each timestamped line of the timeline, a manifest lists the line's hash, the hash of the timeline up to that line and, for a publication, the digests of the two files the line names. The manifest's SHA-256 is submitted to OpenTimestamps. The proof is pending first; once a calendar has included it in a Bitcoin block, the proof file records that block. »
- **P-M2** (`/bell/method`, D4 :193 et C-3 :369, mot pour mot) : « Check one yourself. Download the manifest and its proof. Hash line n of the timeline without its line feed: it must equal the manifest's line digest. Hash the first n lines with their line feeds: it must equal the manifest's prefix digest. Hash the manifest: it must equal the digest the proof carries. Run an open OpenTimestamps client on the proof against a Bitcoin node of your choice: it names the block before which the manifest existed. No MONARK account, key or software is needed for that check; the files are public, any copy serves. The signature check is a separate step. »
- **P-M3** (`/bell/method`, D4 :195, mot pour mot) : « Bound. An anchor shows that the line, and every line before it, existed before that block. It does not show that the facts are true, when the record was published, when its data was collected, or that no other line was ever timestamped. A pending proof depends on a calendar until it records a block. »
- **P-M4** (`/bell/method`, conventions de D1 :114, clés rendues depuis le manifeste servi) : « In a manifest, the line key hashes that one line without its line feed: its digest is the line's hash. The prefix key hashes every line from the first to that one, each with its line feed. The served manifest of line {seq} carries {lineKey} and {prefixKey}. »
- **P-M5** (`/bell/method:472`, libellé) : « anchors · public timestamps of the run's manifests and of the published records »
- **P-M6** (`/bell/method:395-397`, renvoi) : « The latest published record's timestamp status is read from its proof file (anchors, below). »
- **P-B2** (`/bell:553-555`, renvoi) : « The latest record's timestamp status is read from its proof file (served, above). »
- **P-B3** (`/bell:584-585`) : « These anchors timestamp the logs of that counter-verification run; the published records have their own register at {ANCHORS_ROUTE}. »
- **P-B4** (`/bell:641`, ligne de statut) : « one manifest and one timestamp proof per boundary of the counter-verification run of the multiplier history, and one per timestamped line of the published timeline; the registers rendered, the status read from each proof file »
- **P-B5** (`/bell:694-695`, option (a) de BELL-D8-PROVES-1 ; « A signature attests origin, not truth. » reste inchangé, ruling R-a) : « The signature shows who published the record and that it is intact; the publication time it carries is the publishing host's clock. It does not show that the underlying fact is correct — recomputing it from the public inputs is how you check that. »
- **P-A1** (`/bell/anchors:9`, description) : « The MONARK Bell anchors: the register of the counter-verification run of the multiplier history, one line per boundary, and the register of the published records, one line per timestamped line of the timeline; each manifest and each OpenTimestamps proof served beside it, the status of each line read from its proof file. »
- **P-A2** (`/bell/anchors:22-24`, libellé) : « /bell/anchors · manifests, proofs and two registers · the counter-verification run of the multiplier history of {mints}, one line per boundary · the published records, one line per timestamped line of the timeline »
- **P-A3** (`/bell/anchors:28-33`, ajout au chapeau) : « The published records have their own register below: one row per timestamped line of the timeline. »
- **P-A4** (`/bell/anchors`, libellé de la section nouvelle) : « published records · one line per timestamped line of the timeline · status read from the proof file, not from a node »
- **P-A5** (`/bell/anchors`, texte de la section) : « Each row timestamps the manifest of one line of the timeline served by the Bell host: the line's hash, the hash of the timeline up to that line and, for a publication, the digests of the two files the line names. What a row shows: that the line, and every line before it, existed before the Bitcoin block its proof records. What it does not show: that the facts are true, when the record was published, or when its data was collected. A pending proof records calendars only and depends on them until it records a block. »
- **P-A6** (`/bell/anchors`, comptes, motif de `:36-37`) : « {rows} lines in the register · {proofs} proof files · {withBlock} with a Bitcoin block record · {withoutProof} without proof »
- **P-A7** (`/bell/anchors`, `latestAnchoredSeq`) : « latest line whose proof records a Bitcoin block: {latestAnchoredSeq} », ou « … : none yet »
- **P-A8** (table) : en-têtes « date · UTC », « line », « kind », « line hash », « timeline up to the line », « manifest digest », « commit », « manifest · proof », « timestamp status · read from the proof » ; cellules : « block record » puis « earliest block {h} · {n} block record(s) · {c} calendar record(s) pending » ; « pending » puis « {c} calendar record(s), no block yet » ; « not timestamped » puis « no proof file for this line ».
- **P-A9** (`/bell/anchors`, carte de format) : « Publication manifest timeline-seq<n>-manifest.txt » ; « one line "<relpath> <sha256hex>" per entry · sorted by <relpath> in byte order · LF line ends · no trailing space · one final LF · lower-case hex digests · <relpath> relative to the Bell host's root · a publication: its state and provenance files, the prefix key and the line key · a key line: the prefix key and the line key »

### 4.4 Contrôle de chaque phrase contre D8 (ruling 204) et contre les portes

| Règle (source) | S-0 à S-3 | P-M1 à P-M6 | P-B2 à P-B5 | P-A1 à P-A9 |
|---|---|---|---|---|
| « proves », « prove », « proof that » à propos d'un fait (D8 :258 ; regex de `test/site-docs.test.ts:677`) | aucun | aucun (« proof » nom du fichier) | aucun ; P-B5 retire « proves » et « prove » | aucun |
| « anchored » seulement avec un bloc Bitcoin dans la preuve (D8 :249, D5) | S-2 et S-3 seulement, rendues pour l'état `anchored`, qui exige une hauteur | « anchor » dans un énoncé de méthode (P-M3) ; aucun enregistrement dit ancré | aucun | aucun (« block record », pas « anchored ») |
| « not checked against a node here » tant que BELL-OTS-NODE-VERIFY-1 est ouvert (C-2 :368) | présente dans S-2 et S-3 | sans objet (aucune affirmation d'état) | sans objet | libellé P-A4 « not from a node » |
| aucun délai (D6 :221) | aucun | aucun | aucun | aucun |
| aucune probabilité (D8 :258) | aucune | aucune | aucune | aucune |
| jamais « verified by Bitcoin », jamais « at a point in time » (D8 :258) | absents | absents | absents | absents |
| « before » seule relation temporelle (D8 :255) | S-2, S-3 | P-M2, P-M3 | sans objet | P-A5 |
| mots probatoires nus « verified », « proven », « certified » (`test/public-surfaces-honesty.test.ts:41`) | absents | absents | absents | absents |
| vocabulaire du site (`vocab-banned.json`, portée `site` : « guarante », « confidence », « predicts », « accuracy », noms d'opérateurs) | absents | absents | absents | absents |
| chiffres en position rendue (honesty lint) | nombres et dates depuis l'état | « SHA-256 » (256 admis) ; clés depuis les données | aucun | « sha256hex » (256 admis) ; comptes depuis les données |
| noms de fournisseurs (règle de mission ; formes de `test/bell-served.test.ts:158`) | aucun | « OpenTimestamps » (nom du protocole et du client ouverts, déjà servi `anchors/page.tsx:9`, `:29`, libellé autorisé par la décision 124 cité par l'ADR mère :87) ; aucun opérateur de calendrier | aucun | idem P-M |

Le cas « anchor » sans clause de nœud (P-M3) est un énoncé de méthode déjà accepté au checkpoint-1 (D4 :195) ; la clause est portée par la seule affirmation d'ancrage d'un enregistrement (S-2, S-3). Lecture à confirmer (P-10, §7.2).

## 5. Oracle attendu au G7

Hygiène de toute commande : `env -u` des huit variables payantes et des variables `GIT_*`, `TEMP`, `TMP` et `TMPDIR` sous `F:/tmp`, `NEXT_TELEMETRY_DISABLED=1`, jamais `GIT_DIR`, jamais `env` affiché ; copies `git archive` pour la G2 et le checkpoint-2.

1. **Portes** (exit 0) : `npm run gate:vocab`, `npm run typecheck`, `npm run lint`, `npm run lint:ratchet` (69/69 ou écart déclaré), `npm run lang:gate`, `npm run export:check` ; `node --check` de `scripts/sync-bell-anchors.mjs`, `scripts/sync-bell-served.mjs` et `scripts/assert-fleet-html.mjs` (résiduel SCRIPTS-STATIC-COVERAGE-1).
2. **`npm test` complet** : 0 échec ; total = base plus les tests nouveaux (T-1, T-3a, C-V-1, liens, pilote de T-3b) ; sauts = ceux de la base mesurée sur le même arbre et la même machine, plus les sauts nommés du test de liens s'il y en a ; T-2, C-7, CM-13, erreurs nommées et `site_names_no_kitchen` verts.
3. **Build et T-3b** : `npm run build -w @monark/site` exit 0, puis `node scripts/assert-fleet-html.mjs` exit 0 avec, pour `/bell` et `/bell/method`, l'état calculé, sa phrase présente et les amorces des autres états absentes, et, pour `/bell/anchors`, chaque ligne servie présente avec son statut lu.
4. **Mutants** (appliqués à une copie, restaurés au sha256, jamais dans l'index du dépôt) : T-1 : M-1, M-2, M-3, M-3 bis, M-4, M-7, M-7 bis, M-8, M-9 ; T-3 : M-5, M-5 bis, M-6, M-10, M-11 ; `lines[]` : L-1 à L-8 ; synchro : S-1 à S-11 (S-3 = G2-M7), CM-13 toujours rouge ; C-V-1 : une synchro qui omet `publications.json` fait rougir le test positif. Chacun rouge, puis arbre restauré.
5. **Rejeu hors ligne** : `lines[]` committé = recalcul depuis `F:/PRODUITS/bell-mirror/timeline-seq2-20260924T0841Z.jsonl` (tableau du §1.1) ; `buildBellServed` du dépôt sur la fixture à deux lignes rend un `lines[]` égal à un recalcul.
6. **Rendu** : les pages autres que `/bell`, `/bell/method` et `/bell/anchors` identiques à la base après retrait de la balise `next-size-adjust`, deux builds déclarés (T-B11).
7. **Export réel** (`node scripts/export-public.mjs --out <temp>`) : 0 `.ots` hors `apps/site/public/bell/anchors/`, 0 `fixture-*`, 0 `test/` racine ; la table et `bell-publications-load.ts` exportés ; les synchros non exportées ; `assert-fleet-html.mjs` exporté ; sha256 de `EXPORT-MANIFEST.json` consigné.
8. **R-25** mesuré (§2.2) : CODE ≤ 1 205, CONTENT = 0.
9. **Hygiène du diff** : formes de la clause anti-close (ADR mère §5 :299) et formes fournisseurs de `test/bell-served.test.ts:158` sur le diff, `publications.json` et les fichiers nouveaux compris ; 0 TODO ou FIXME nu (R-13) ; aucun vocabulaire de cuisine sous `apps/site`.
10. **Mesures hors CI** : 375 px sur les trois pages Bell (`scrollWidth` de `/bell` ≤ 496, aucune régression ailleurs) ; 0 lien cassé sur les trois pages (BELL-METHOD-ANCHOR-1 selon sa disposition).
11. **Sondes servies après l'upload** (orchestrateur, depuis le VPS si le poste reste sans HTTPS, précédent de l'upload 17) : `/bell` et `/bell/method` portent la phrase de l'état calculé au build, et elle seule ; `/bell/anchors` porte la section des publications et la ligne de seq 2 ; `publications.json`, `timeline-seq2-manifest.txt` (`602ff93d…`) et la preuve servis égaux au commit ; 0 nom de fournisseur ; 0 forme D8.
12. **Condition de G7 propre au lot** (ADR mère §7 :317) : T-3 vert sur les données réelles ; si la mise à niveau a précédé l'oracle, état `anchored` servi avec sa clause ; sinon, lot clos en état `pending` affiché, avec l'item de mise à niveau nommé et son déclencheur (jamais « anchored » par anticipation). Tuyaux P-4 (consommateur : `/bell/anchors`) et P-5 (pages) servis ; `served.integration_test` de Bell porte T-3a (CA-11).

## 6. MAST : modes d'échec résiduels

Identifiants tels qu'employés par l'ADR mère §4 (:280-293) ; adoption comme checklist de risque résiduel lue dans le corpus (doc 06 §6.4, `06-framework-agents.md:267-271`) ; article MAST (arXiv:2503.13657) non relu : niveau [2nd] via le corpus (doc 06 :82).

| Mode | Menace résiduelle dans PR-B | Contre-mesure |
|---|---|---|
| FM-1.1 spécification non suivie | « anchored » servi d'une preuve pendante ; `.some` réintroduit | M-2 ; T-3a (état recalculé) ; T-3b (phrase rendue = phrase de l'état) ; M-6 |
| FM-1.2 rôle non suivi | le worker régénère les données par le réseau sans mandat, ou committe | D-B12 (acte confié explicitement) ; R-20 |
| FM-1.3 répétition d'étape | synchro rejouée sur un servi en jonction (balai d'une cible extérieure) ; `.bak` laissé après une mise à niveau | D-B4 (B4) ; C-7 rougit sur un `.bak` (G1 PR-A:113) |
| FM-1.4 perte d'historique | `bell-served.json` v3 écrasé sans trace | sha256 avant et après au G1 ; l'historique git fait foi |
| FM-1.5 condition de fin ignorée | G7 prononcé sur un « anchored » attendu mais non servi | §5, point 12 ; aucun littéral d'état dans un test |
| FM-2.2 clarification non demandée | écarts D6/D8, phrases hors JSX, module nouveau, BELL-D8-PROVES-1 tranchés en silence | §7.2, points P-1 à P-12 |
| FM-2.3 dérive de tâche | absorber 375 px, portes de liens et de SVG, `checkJs` | §3.1 et §3.2 : hors PR-B, déclencheurs à re-former |
| FM-2.4 rétention d'information | la phrase servie passe de `none` à `pending` sans être annoncée | §1.1, §4.3 (S-1) ; validation visuelle (décision 183) |
| FM-2.6 écart raisonnement / action | « complete » lu comme vérifié | clause « not checked against a node here » dans S-2 et S-3, exigée par T-3b |
| FM-3.1 terminaison prématurée | oracle lancé avant la régénération v4 | la synchro refuse (schéma v3) ; épingles de T-B1 |
| FM-3.2 vérification absente ou incomplète | test de liens sauté sur une plateforme sans droit de lien ; branche `git show` non testée ; `.mjs` hors `tsc` et `eslint` | saut nommé et CI ubuntu ; résiduel déclaré (T-B3) ; `node --check` |
| FM-3.3 vérification incorrecte | T-3b calcule l'attendu avec la fonction même des pages | T-3a indépendant (sha256, entrées, chaînage recodés) ; T-1 sur objets construits à la main |

Résiduel sémantique nommé : S-0 dit « no anchor manifest lists the latest record's digests » ; sous D5, l'état `none` signifie « aucune ligne de registre ne compte pour la tête », ce qui n'est pas exactement la même chose (le cas M-1, un manifeste qui listerait `states/<head.state_sha256>.json` sans la ligne, rendrait `none` alors qu'un digest de l'enregistrement serait listé). Sans effet aujourd'hui : aucun digest de la tête n'est listé par un manifeste de course (§1.1), et `bindPublicationAnchor` refuse un manifeste de publication qui n'a pas exactement ses quatre entrées. Garder S-0 mot pour mot (D6 :217) ou la reformuler est le point P-1 bis du §7.2.

## 7. Ce que je n'ai pas pu confirmer, où j'ai cherché, et points à trancher au checkpoint-1

### 7.1 Non confirmé

1. **État servi en ligne ce jour** (hôte Bell, vitrine) : non sondé, la mission interdit le réseau ; inféré de `docs/JOURNAL-PROVENANCE.md:398` (sondes de l'upload 17), de `:404-405` (upload 20 depuis `git archive 1f6ad42`) et de `git diff --stat 48e3561 0e38b5d` (vide sur l'ancrage et les données Bell).
2. **Bloc Bitcoin pour l'engagement de seq 2** : inconnu ; seule la preuve committée est lue (pendante, §1.3).
3. **Rapport écrit du checkpoint-2 de PR-A** : aucun fichier `.md` sous `F:\tmp\ots-1\cp2\` (listing : `export/`, `logs/`, `npm-logs/`, `outside/`, `replay/`, `scripts/`, `tmp/`, `tree/`) ; constats pris de `docs/CHANTIERS.md:1452`, `docs/JOURNAL-PROVENANCE.md:398` et des journaux : `logs/sync-positive.log` (« 18 register lines, 17 with a proof, 34 files written »), `logs/served-before-sync.sha256` = `served-after-sync.sha256` (36 lignes identiques), `logs/prop-kill-cp2.log`, `logs/gates-summary.txt` (six portes à 0).
4. **`lstat` d'une jonction sous Windows** (`isSymbolicLink()` vrai ou non) : non mesuré ici ; la garde D-B4 exige un répertoire réel par composant, à mesurer au G1 sous win32 et en CI ubuntu (la G2 de confirmation a mesuré que le code actuel suit B3 et B5, `G2C-PR-A.md:82`).
5. **Documentation Next 16 sur le rendu des métadonnées** (demandée par RENDER-FINGERPRINT-NONDET-1) : non lue (réseau) ; remplacée par le code installé [lu] (T-B11). Si l'orchestrateur exige la documentation, demande de lecture formée pour un lecteur : source primaire, la documentation officielle de Next.js 16 sur l'API `metadata` et sur la balise `next-size-adjust` liée à `next/font` ; tentative faite, lecture du code installé `app-render.js:1137-1147` ; usage, fonder « retirer la balise » contre « N builds ».
6. **R-25** : estimé, non mesuré (aucun code).
7. **G2-M7 qui passe la synchro et T-2** : mesure de la G2 (`G2-PR-A.md:191`, `:202`) et de la G2 de confirmation (`G2C-PR-A.md:69`), non rejouée ici.
8. **Compte des items** : la mission et `docs/CHANTIERS.md` (entrée « 2026-09-25 00:0x UTC » de `lot/etude-suite`, lue par `git diff`) disent « 13 » ; `docs/JOURNAL-PROVENANCE.md:398` écrit « Items ouverts (10) » puis nomme douze items et deux autres : quatorze traités (§3.1), aucun supprimé.
9. **Liste candidate de TMP-HYGIENE-1** : heuristique de `grep`, non confirmée comme résidu réel.

Règle d'arrêt : aucune contradiction structurante entre l'ADR mère et le code livré, après deux relectures. Les écarts E-1, E-2 et E-14 sont déclarés et jugés conformes (G1 PR-A:136-149 ; `G2-PR-A.md:76-84`). Les numéros de ligne cités par l'ADR mère ont glissé (par exemple `page.tsx:254` devenu `:255`, `test/bell-anchors.test.ts:97-100` devenu `:160-164`, `ci.yml:174-175` devenu `:205-206`), sans contradiction. Une attribution de l'ADR mère est imprécise : pour M-6 (« le `.some` restauré dans une page : T-3a rougit », :209), T-3a vérifie la fonction, pas la page ; le rouge vient de T-3b et de la ré-épingle source (T-B6). Écart de signature déclaré (D-B5) : :202 écrit `publicationAnchorState(head, lines, rows)` ; ce plan propose `(head, lines, bound)`, lignes déjà liées par le chargeur, conséquence d'E-2 et de PRB-BIND-IN-LOADER-1.

### 7.2 Points à trancher au checkpoint-1 (propositions ; rien n'est tranché ici)

- **P-1** : D6 :219 donne une phrase `anchored` sans « before », que D8 :249 exige (« toujours avec « before » ») ; proposé : S-2 et S-3 ajoutent « the record's line and every line before it existed before that block ».
- **P-1 bis** : garder S-0 mot pour mot (D6 :217, recommandé, épinglé) ou la reformuler vers la sémantique de D5 (§6, résiduel sémantique).
- **P-2** : phrases d'état hors JSX (D-B6) ; conséquence : la ré-épingle `test/site-build-fleet.test.ts:1000` est re-pointée, alors que :212 la dit inchangée ; alternative : phrases en JSX et T-3b qui les recopie (duplication, R-3).
- **P-3** : module nouveau `bell-publications-load.ts` au lieu de « l'extension de `bell-anchors-load.ts` » (C-4 :370), même régime ; motif : l'alias de `bell-anchors-load.ts:9`, que `assert-fleet-html.mjs` ne résout pas.
- **P-4** : régime du texte JSX : ADR-M013 :20 classe en T2 « une phrase publique nouvelle sur le moteur (… méthode) » ; C-4 (:370) place ce texte au régime vitrine pour ce lot. Lecture proposée : C-4 fait foi pour ce lot, et les phrases sont soumises ici avant tout code.
- **P-5** : BELL-D8-PROVES-1, (a) reformuler (P-B5) ou (b) troisième forme dans `D8_ALLOWED` ; choix de l'investisseur (précédent de la décision 204).
- **P-6** : OTS-REF-STRICT-1, (a) ou (b) (D-B15, recommandation (b)).
- **P-7** : D-B12, qui régénère `bell-served.json` et sous quel mandat réseau.
- **P-8** : D-B16, mise à niveau avant ou après le G7 de PR-B (décision 201 contre la condition préférée de §7 :317).
- **P-9** : les deux précisions au texte D4 accepté (P-M1) et la variante grammaticale de D6 :220 (S-1v, S-3).
- **P-10** : « OpenTimestamps » dans les phrases (nom du protocole, déjà servi) face à la règle de mission « pas de nom de fournisseur » ; et « anchor » sans clause de nœud dans un énoncé de méthode (P-M3).
- **P-11** : items tiers du §3.2 : absorptions proposées (BELL-METHOD-ANCHOR-1, SYNC-MANIFEST-WRITE-1), re-formations (BELL-MOBILE-375-1, portes du prochain lot site, TEST-GIT-ENV-ISOLATION-1).
- **P-12** : `latestAnchoredSeq` rendu sur `/bell/anchors` (sinon sortie sans consommateur) ; `listedDigests` retiré.

## 8. Provenance

| Date | Objet | Modèle (identifiant résolu) | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-25 | G0 de PR-B, `docs/adr/ADR-BELL-OTS-PRB.md`, non committé, base `0e38b5d` | `claude-opus-5-5[1m]` | max | mission `F:\tmp\ots-prb\mission-g0.md` ; ADR mère et documents de PR-A | worker | orchestrateur (R-21), puis checkpoint-1 | sans objet (G0) |

- **Horloge** (`date -u`) : 2026-09-24T23:49:16Z (ouverture), 2026-09-25T00:16:12Z, 00:23:38Z, 00:25:32Z (début de l'écriture) ; l'heure du hachage final est rendue hors du fichier.
- **Lu dans le worktree, à `0e38b5d`** [lu] : `docs/adr/ADR-BELL-OTS-ANCHOR-1.md` en entier (386 lignes, sha256 `5bab9eeb63182179…`) et son historique (`git log`, `git show f1d01ad`, `git diff 0e70fae^1 0e70fae`) ; `docs/JOURNAL-PROVENANCE.md:393-405` (`ef00ddc1…`) ; `docs/CHANTIERS.md`, lignes 133, 135, 1410, 1422, 1426, 1432, 1439, 1440, 1445, 1447, 1448, 1451 à 1454, 1463, 1465 à 1477, et une recherche de `OTS` (`27cfaf86…`) ; `docs/G1-lot-bell-ots-anchor-1-pr-a.md` en entier (`42f05779…`) ; `docs/G1-lot-site-docs-1.md:355-404` ; `docs/bell-publications/ANCHORS.md` (`e97cd35b…`), `timeline-seq2-manifest.txt` et sa preuve ; `docs/RUNBOOK-bell.md:440-463` et la liste de ses sections ; `docs/RUNBOOK-vitrine.md:1-20` ; `docs/adr/ADR-M013-vitrine-regimes.md:18-51` ; `apps/site/lib/bell-anchors.ts` en entier (`1e30ce63…`) ; `apps/site/lib/bell-anchors-load.ts` en entier (`819206a2…`) ; `apps/site/lib/bell-served-load.ts` (lignes 1-260 et 290-548, `b44941d4…`) ; `scripts/sync-bell-anchors.mjs` (`4bf6df19…`), `scripts/sync-bell-served.mjs` (`019a3094…`) et `scripts/anchor-bell-timeline.mjs` (`aa09e143…`) en entier ; `scripts/assert-fleet-html.mjs` (1-40, 340-447 et liste des fonctions ; `fcbd28b0…`) ; `scripts/export-public.mjs:54-108` (recherche) ; `test/bell-anchors.test.ts` en entier (`5a21114f…`) ; `test/bell-served.test.ts` (55-175, 199-250, 262-340, 406-440 ; `da6fc06c…`) ; `test/verify-bell.test.ts` (1-25, 200-236) ; `test/site-build-fleet.test.ts:985-1003` et `:1146-1180` ; `test/site-docs.test.ts:40-100` et `:674-708` ; `test/public-surfaces-honesty.test.ts:30-50` ; `test/ci-gates.test.ts` (recherches `integration_test`, `WIRING_TEST_ROOTS`) ; `apps/site/app/bell/page.tsx` (1-30, 228-262, 340-372, 540-600, 625-648, 684-700 ; `a4db1cf8…`), `method/page.tsx` (84-110, 380-400, 468-520, 550-562 ; `ac9c1806…`), `anchors/page.tsx` en entier (`86d98d5f…`) ; `apps/site/components/bell/anchors-table.tsx` en entier (`085d0381…`), `contact.tsx:1-30`, `request-section.tsx` (recherche) ; `apps/site/lib/fleet.ts:334-357` ; `apps/site/test/honesty-lint.ts` (en-tête et motifs), `honesty-lint.exempt.json` ; `vocab-banned.json` (portée `site`) ; `apps/site/tsconfig.json` ; `.github/workflows/ci.yml:40-105` et `:183-206` ; `package.json` (scripts) ; `apps/site/data/bell-served.json` (tête, premier enregistrement, schéma, par `node -e`) et `manifest.sha256.json` (recherche).
- **Lu hors du worktree** (lecture seule) : la mission ; `F:\tmp\ots-1\g2\G2-PR-A.md` en entier (`699e8dc2…`) ; `F:\tmp\ots-1\g2c\G2C-PR-A.md` en entier (`b7755909…`) ; `F:\tmp\ots-1\cp1\CP1-report.md:60-86` (`537a3cf1…`) ; `F:\tmp\ots-1\cp2\logs\` (journaux cités au §7.1) et `scripts\` ; `F:\tmp\ots-1\g2\belt.sh` et `F:\tmp\ots-1\cp2\scripts\belt.sh` ; `F:\PRODUITS\bell-mirror\` (listing, sha256, lignes de la timeline) ; `F:\tmp\site-docs-1\g2\tools\` (sha256 de trois outils) ; `F:\Monark\node_modules\next\package.json` et `dist/esm/server/app-render/app-render.js:1120-1152` ; corpus `06-framework-agents.md:82` et `:267-271`. Une sortie trop longue a été écrite par le harnais sous `C:\Users\KACIMI\.claude\projects\…\tool-results\`, puis relue ; aucune écriture de ma part sur C:.
- **Mesures exécutées** : `node` en lecture seule, sous `env -u` des huit variables payantes et de `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` : lecture des deux preuves de seq 2 et du manifeste ; recalcul des comptes et du `.some` (§1.1, §1.2) ; `sed`, `head`, `tr` et `sha256sum` sur la copie durable. Aucun appel réseau, aucun `ots`, aucune écriture hors de ce fichier.
- **Advisor** (canal intégré, R-26) : une consultation après l'orientation (retenu : périmètre moins E-1, état `pending` au build, `lines[]` comme amendement, options de régénération, répertoire paramétré pour le chargeur, liste fermée des ré-épinglages, table sans URI, substitution de digest, portabilité des tests de liens, quatorze items, items tiers, R-25 ascendant ; non retenu : la régénération hors ligne comme voie principale, parce que l'immuable d'état de seq 1 manque au miroir durable, §1.6) ; une seconde avant la clôture, sur le fichier écrit (retenu : la référence de l'ADR mère ajoutée à D-B8, l'écart de signature de D-B5 déclaré, l'issue de chaque consultation consignée ici, le format du rendu final ; l'advisor a lui-même retiré son avis antérieur selon lequel toutes les entrées de `buildBellServed` existaient hors ligne).
- **Écriture** : une première écriture par un heredoc du shell a échoué au lexage (« unexpected EOF while looking for matching `'' »), rien n'a été écrit (vérifié par `ls`) ; ce fichier est écrit par l'outil d'écriture de fichiers (même piège que `G2C-PR-A.md:103`).
- **`error_origin` proposés, à assigner au G7** : compte « (10) » de `docs/JOURNAL-PROVENANCE.md:398` pour quatorze items : orchestrateur (journal) ; phrase `anchored` de D6 sans « before » et attribution de M-6 à T-3a : rédacteur du G0 mère ; phrase périmée de `docs/RUNBOOK-bell.md:461-463` : lot BELL-SITE-SEQ2-1 (RUNBOOK non mis à jour à l'upload 16) ; déclencheurs « prochain lot site » passés par NAV-APPLICATIONS-1 sans disposition : orchestrateur.
