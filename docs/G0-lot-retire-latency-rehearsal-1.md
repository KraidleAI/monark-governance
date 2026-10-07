# G0 de RETIRE-LATENCY-REHEARSAL-1 : la répétition chronométrée du retrait d'une ligne kata (ADR 0006 D6, « livré et mesuré ») : ce qui existe, ce qui manque, et sa construction

- **Demande** : item RETIRE-LATENCY-REHEARSAL-1, porteur l'orchestrateur MONARK, déclencheur « maintenant (R-a et R-b
  fusionnées) » (`docs/ETAT.md` l.685-688). D6 reste ouvert jusqu'aux deux mesures de latence au JOURNAL, une répétition et
  un cycle réel (`docs/ETAT.md` l.1321-1323 ; `docs/G7-lot-retire-path-rb.md` l.46). Mission de l'orchestrateur du
  2026-10-07 : ce G0, et RETIRE-RUNBOOK-1 (`docs/ETAT.md` l.692-694, déclencheur atteint), écrits, non exécutés.
- **Base** : worktree `F:/Monark-wt-retire-rehearsal`, branche `monark/retire-rehearsal-1`, à `07b7fc20` (tête du tronc au
  lancement).
  - Le tronc a avancé depuis à `c318aa54` (#215, SHORT-DIGEST-INVERSION-1). Les fichiers cités ici y sont identiques
    (`git rev-parse <tête>:<chemin>` comparé sur 23 fichiers), sauf deux :
    - `scripts/spec-publish.mjs` : l.284-297 réécrites à nombre de lignes égal (`short_digest` devient le plancher
      d'empreinte), 4 lignes en fin ; les numéros cités ici tiennent ;
    - `apps/harness/src/policy-guard.ts` : 2 lignes à l.105-106 ; `guardKataTable` passe de l.113 à l.115, sa boucle sur
      les listes de l.116 à l.118.
  - `recherches` est lu dans le clone du scratchpad, à `dbcb6d53`.
- **Zone** : `docs/RUNBOOK-harness.md` (section « Retire a kata row », ajoutée en fin de fichier, l.259-431 : aucune ligne au-dessus ne
  bouge, les tueurs de `test/surfaces-1-1-0.test.ts` qui visent l.186 et l.214 tiennent), `test/runbook-retire.test.ts`
  (neuf), ce G0. `docs/ETAT.md` n'est pas touché : l'orchestrateur y écrit au G7.
- **Auteur** : MONARK. Rédaction par un worker `claude-opus-5-5` (effort max) le 2026-10-07, horloge lue (`now.mjs`) à
  01:17 UTC au début, 01:43 (RUNBOOK), 01:46 (test), 01:53 (ce G0).
  - Aucun commit (R-20), aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`, rien écrit sur C:, aucun réseau, aucun
    hôte touché.
  - Les mesures sont faites dans trois copies `git archive 07b7fc20 | tar -x` sous le scratchpad (annexe A).
  - Écart à la consigne, déclaré : `--write --date` y a été lancé deux fois (M-2, M-3), jamais dans le worktree ni dans un
    dépôt git.

## 1. Sources (toutes [lu], sur place, dans cette session)

| Source | Lignes citées | sha256 |
|---|---|---|
| ADR 0006 v8.1, `recherches:decisions/0006-ADR-draft-wave2.md` | D6 l.189-191 ; tuyaux l.323 | `fe48c03a…` |
| ADR 0006, addendum 9, `recherches:decisions/0006-ADR-addendum-9-live-k-quarter-counts.md` | points 1, 5, 6 (l.8, l.12, l.13) | `8ae73cdb…` |
| Brouillon de G0 d'ENGINE-ROW-RETIRE-PATH-1, `recherches:coordination/pieces/2026-10-06-G0-retire-path/G0-ENGINE-ROW-RETIRE-PATH-1-brouillon.md` | §4.5 l.142-155 ; P-R4 l.197 ; R-1 l.201, R-4 l.204, R-6 l.206 ; Q-R1 l.222 | `14033044…` |
| Contrat 1.1.0, `recherches:kata/spec/CONTRACT-1.1.0.md` | l.441, l.447, l.449, l.488 | `ac8187fa…` |
| `docs/ETAT.md` | l.26-32, l.651-705, l.1313-1323 | `095b3f69…` |
| `docs/G0-lot-retire-path-rb.md` | l.31-35, l.64-71, l.78-86, l.157, l.159-165, l.176-183 | `a95119e7…` |
| `docs/G7-lot-retire-path-ra.md` ; `docs/G7-lot-retire-path-rb.md` | l.41-42 ; l.43-46 | `e20dfa58…` ; `0f371e39…` |
| `scripts/retire-latency.mjs` | l.4-12, l.15-25, l.41-57, l.62-72 | `caee0698…` |
| `scripts/spec-policy-tables.mjs` | l.4, l.10-17, l.25, l.100-110, l.127-218 | `e866f3cd…` |
| `scripts/spec-publish.mjs` | l.4-22, l.35, l.52-71, l.80-90, l.150-152, l.196-210, l.236-238, l.269-276, l.288-297, l.303-321 | `da46838b…` |
| `apps/harness/src/policy-retire.ts` | l.4, l.17, l.27-30, l.40-53, l.60-84 | `71bb678b…` |
| `apps/harness/src/policy-guard.ts` | l.88-100, l.112-116 | `61879f8a…` |
| `apps/harness/src/policy-wave2.ts` | l.16 | `4e45e071…` |
| `apps/harness/src/kata-path.ts` | l.38, l.43-48, l.76-94, l.111, l.115-129 | `21ef898d…` |
| `apps/harness/src/tools/gate.ts` | l.212, l.873-875, l.880-892, l.959, l.1042 | `7920ceac…` |
| `apps/harness/src/server.ts` | l.35-36, l.51-60 | `a52a4fa1…` |
| `scripts/verify-harness.mjs` | l.5-10, l.22-26, l.421 | `ada6925f…` |
| `scripts/oracle/run.mjs` | l.2 | `a0f99d21…` |
| `docs/RUNBOOK-harness.md` (base) ; `docs/RUNBOOK-vitrine.md` | §1 l.64-68, §3 l.112-116, §6 l.161-163, l.186-188, l.213-219, Update l.254-258 ; l.38-50 | `9dd2f3e6…` ; `31f26a9e…` |
| `test/surfaces-1-1-0.test.ts` ; `test/spec-1-1-0-release.test.ts` ; `test/spec-retire-path.test.ts` ; `test/harness-served.test.ts` | l.163-193, l.230-234 ; l.123-130 ; l.42-48, l.88-91 ; l.212-215 | `e817a402…` ; `fbe83a13…` ; `8ac90336…` ; `3143fc6a…` |
| `docs/JOURNAL-PROVENANCE.md` ; `docs/methode/REGLES-MISSION.md` | l.443-447 ; l.3, l.20 | `b58aedb6…` ; `093489db…` |
| `scripts/spec-publish-inputs.json` | releases `kata-wave1`, `contract-1.1.0` | `7b4a4c12…` |

Tous les sha256 sont pris sur `git show 07b7fc20:<chemin>` (gouvernance) ou sur le fichier du clone (`recherches`).

## 2. Constat, à la base `07b7fc20`

### 2.1 Ce qui existe pour un cycle chronométré

- **L'outil de mesure** (`scripts/retire-latency.mjs`) :
  - entrée fermée `retire-latency-v1` : `format`, `cycle` (`rehearsal` ou `real`), `instants` (T_a à T_g seulement), `mention`
    (l.9-10, l.41-44) ;
  - sept instants définis (l.15-23), chacun exactement `YYYY-MM-DDTHH:MM:SSZ` et réel (l.25, l.46-47), monotones (l.50) ;
  - plafond de 14 jours, refusé sans `mention` (l.24, l.51-52) ; objectif de 3 jours ouvrés, rapporté seulement (l.57) ;
  - refus nommés, sortie 1 (l.10-12, l.70-72) ; usage, sortie 2 (l.62) ;
  - ni horloge ni réseau : le rapport est une fonction de l'entrée (l.12).
- **L'écrivain daté** (`scripts/spec-policy-tables.mjs --write --date <YYYY-MM-DD>`, l.4, l.127-131) : un dossier
  `spec/contract-1.1.0-tables-<date>/` jamais réécrit (l.178-186), la liste en vigueur copiée quand une table écrite porte
  une ligne retirée (l.158-176), les entrées `governance` imprimées (l.188-193). Mesuré (M-3) : sur une copie où une table
  servie change, sortie 0, un fichier écrit, son entrée imprimée avec le sha256 du fichier (`493c1541…`), puis `--check`
  sortie 0.
- **La porte de publication** (`scripts/spec-publish.mjs`) : la release datée, ses lignes portées et `previous_commit`
  (l.52-71, l.150-152, l.196-207), la règle F-1 (l.303-321), `--verify` sur un clone neuf (l.22, l.272-276). Elle ne publie
  jamais (l.11) ; la poussée est l'acte de MONARK (acte 8 de T0 : `docs/JOURNAL-PROVENANCE.md` l.446).
- **Le déploiement et sa preuve** : RUNBOOK §1 et *Update* (l.64-68, l.254-258), §6
  `node scripts/verify-harness.mjs --out docs/deploy-CA-harness.json` (l.162), porte verte (l.213-219). La CA porte
  `checked_at` en millisecondes (`scripts/verify-harness.mjs` l.421 ; exemple `2026-10-06T05:42:44.278Z`,
  `docs/JOURNAL-PROVENANCE.md` l.445). Contre une cible http locale, une passe verte écrit `<out>.local` (l.25-26) ; le
  serveur route l'adresse locale sur MCP et le nom `api.` sur le miroir JSON (`apps/harness/src/server.ts` l.51-60), d'où
  `--api-host` (l.5-10).
- **Ce que porte un verdict servi** : tout verdict kata porte le `policy_table_sha256` de la table de sa classe, ligne ou
  non (`apps/harness/src/kata-path.ts` l.78, l.111) ; la cellule retirée répond `calib_retired` (l.38, l.84-94). Mesuré (M-4),
  sur la copie de M-3, par le miroir JSON en processus : le verdict de `btc-dir-1h` porte `493c1541…`, le sha256 du fichier
  daté. Aujourd'hui, sur le tronc, la même classe sert `c04ae292…`, le sha256 de `spec/contract-1.1.0/policy/btc-dir-1h.json`,
  qui est aussi l'exemple de CONTRACT l.488.

### 2.2 Ce qui manque, mesuré ou lu

1. **Aucune ligne retirée n'est servable aujourd'hui** [lu].
   - Les 32 tables kata sont servies sans ligne (`kata-path.ts` l.115-120), derrière un fil-piège qui refuse le chargement
     à la première ligne kata (l.122-129, appelé à `tools/gate.ts` l.1042).
   - Les points d'entrée HTTP et MCP ne passent jamais d'autres tables (`tools/gate.ts` l.873-875, l.959 ; test
     `entry_points_never_pass_policy_tables`).
   - Aucun chemin servi ne lit une liste : la garde lit la chaîne dans les tests seulement (R-a non servi,
     `docs/G7-lot-retire-path-ra.md` l.41-42 ; RETIRE-LISTS-E2A-PIPE-1, `docs/ETAT.md` l.651-654).
   - Conséquence : un « harnais local » (brouillon §4.5 l.152) ne sert une table synthétique qu'à travers un correctif du
     code servi.
2. **Sur le tronc, l'écrivain daté n'a rien à écrire** [mesuré, M-2] : `--write --date 2026-11-02` sort 1, « every served
   table is the file of its directory: no dated version to write » (`spec-policy-tables.mjs` l.173), rien écrit ; `--check`
   sort 0 (40 fichiers). La CLI lit `SERVED_POLICY_TABLES` (l.105, l.170) ; une table synthétique n'y entre que par le
   paramètre `tables` de l'API (l.167), comme dans les tests (`test/spec-retire-path.test.ts` l.42-48).
3. **`recompute_held` tient toute ligne calibrée** [lu] (`spec-publish.mjs` l.292, l.296), jusqu'à la partie 3 de
   VERIFIERS-LIST-F5A-1. Une ligne qu'on peut retirer est une ligne `region`, donc calibrée (`policy-guard.ts` l.93,
   l.100) : aucune table qui porte un retrait réel ne se publie avant cette partie. Une ligne de forme seule passe la porte
   mais pas la garde (`recompute` nul, `policy-guard.ts` l.100) : aujourd'hui aucune ligne n'est à la fois gardable et
   publiable, ce que le brouillon disait déjà pour le cycle réel (P-R4, l.197).
4. **Aucune sonde de T_g** [mesuré par recherche] : `git grep policy_table_sha256 07b7fc20 -- scripts` ne trouve que la
   définition de T_g (`retire-latency.mjs` l.22), deux commentaires (`spec-policy-tables.mjs` l.11, `spec-publish.mjs` l.17)
   et un champ nul de fixture (`gen-gate-decision-fixtures.mjs` l.25) ; `scripts/verify-harness.mjs` ne fait aucun appel
   kata.
5. **Deux tests rougissent par construction au premier dossier daté et à sa release** [mesuré] :
   - M-1 : une release datée ajoutée en dernier à `scripts/spec-publish-inputs.json` rougit `srf_runbook_vitrine_t0_order`
     par assertion (« act 8 publishes contract 1.1.0 with both roots », `contract-1.1.0-tables-2026-11-02` lu à la place de
     `contract-1.1.0`) : le test prend la dernière release pour celle de T0 (`test/surfaces-1-1-0.test.ts` l.231, l.234).
     Aucun item ne le portait : T0-ORDER-TEST-RELEASE-NAME-1 (§8).
   - M-3 : un dossier daté écrit pour une table servie changée laisse `--check` à 0, mais
     `published_tables_are_the_served_tables_byte_for_byte` rougit par assertion sur `btc-dir-1h` : le test ne lit que
     `contract-1.1.0/` (`test/spec-1-1-0-release.test.ts` l.123-127). Item existant SPEC-TABLES-TEST-PER-DIR-1
     (`docs/ETAT.md` l.682-684 ; Q-Rb-7, `docs/G0-lot-retire-path-rb.md` l.164).
6. **Aucun écrivain de liste, aucun écrivain des lignes portées** [lu] : la liste canonique et cumulative s'écrit à la
   main (`policy-retire.ts` l.40-49, l.82-83), son lecteur ne tourne que dans la garde ; les lignes `root: "previous"` de
   l'entrée de release aussi (SPEC-DATED-RELEASE-ENTRY-1, `docs/ETAT.md` l.679-681). La release `contract-1.1.0` compte
   47 entrées : la première release datée en porte au moins autant, à la main.
7. **`live:<k>` ne se publie pas** [lu ; mesuré par la vérification de R-b] : la porte de vocabulaire refuse « live »
   (`docs/G0-lot-retire-path-rb.md` l.31-35) ; RETIRE-CAUSE-VOCAB-1 (`docs/ETAT.md` l.689-691). Le lecteur refuse aussi
   `live:1` sur une liste datée avant 2027-01-01 (`policy-retire.ts` l.80 ; addendum 9 point 6).
8. **T_a d'une ligne `adr:` est une date, l'outil veut un instant** [lu] : « the date of the adr: line » (l.16) contre
   `YYYY-MM-DDTHH:MM:SSZ` (l.25, l.47).
9. **Le cycle réel de Q-R1 n'a ni T_a ni T_b** [lu] : Q-R1 nomme cycle réel « la première publication de tables datées
   (E-2a, vague 1) », qui mesure T_c → T_g (brouillon l.153, l.222 ; `docs/G0-lot-retire-path-rb.md` l.71). Une
   publication sans ligne retirée n'a ni déclencheur ni liste ; l'outil exige les sept instants (l.45-48). Question Q-RL-2.
10. **La CA est liée aux données du site** [lu] : `test/harness-served.test.ts` l.212-215 exige que `deploy_check` de
    `harness-served.json` égale la CA commitée ; une CA neuve commitée entraîne les actes 3 à 7 de l'ordre de T0
    (`docs/RUNBOOK-vitrine.md` l.44-48).
11. **La fenêtre de sonde** [mesuré, M-4] : un appel kata n'est reçu qu'avec un `produced_at` sur la grille de l'horizon
    (`kata-path.ts` l.46) et à 300 s au plus de l'horloge du serveur, après (l.47) ou avant (`tools/gate.ts` l.886 ; 300 s,
    l.212). Mesure : reçu à +1 s, +300 s et −300 s ; 400 `produced_at_stale` à +300,001 s ; 400 `produced_at_future` à
    −300,001 s. La fenêtre fait dix minutes autour de chaque instant de grille : T_g − T_f compte jusqu'à une heure d'attente
    sur une classe 1h, quatre sur une classe 4h.
12. **Un retrait fusionné est définitif ; une publication aussi** [lu] : une liste porte toutes les entrées de la
    précédente (`policy-retire.ts` l.82-83) ; un fichier publié n'est ni retiré ni réécrit (CONTRACT l.449 ;
    `spec-publish.mjs` l.203, l.207). Une répétition qui toucherait le tronc ou le dépôt public serait irréversible.

## 3. Construction de la répétition

### 3.1 Ce qu'on retire : trois options

| Option | Effet sur le miroir public et le dépôt de la spécification | Effet sur les tables servies | Ce qu'elle mesure | Faisable |
|---|---|---|---|---|
| (a) classe ou ligne synthétique | aucun en local. Poussée, elle resterait pour toujours (§2.2 point 12) et décrirait une ligne qui n'existe pas | aucun en production. Un serveur local ne la sert qu'avec un correctif du code servi (§2.2 point 1) : code jamais relu, fil-piège levé à la main | T_b → T_d par l'API (`datedFiles(root, date, tables)`, l.167), non par les commandes du RUNBOOK (la CLI lit `SERVED_POLICY_TABLES`, l.105) ; T_e → T_g sur un harnais corrigé : des analogues. L'oracle du bac à sable ne peut être vert : le correctif rougit les tests du fil-piège et de la clause kata | maintenant |
| (b) dossier daté jamais servi | aucun s'il reste dans un `--out` local. Poussé, il est définitif, et la carte `servedTableDirs` (l.139-150) fait correspondre la classe à un dossier que le harnais ne sert pas (CONTRACT l.488 ; brouillon R-6, l.206) | aucun | T_b, T_c et un T_d local, sur une table servie modifiée à la main (M-3), sinon l'écrivain refuse (M-2). T_e → T_g ne sont pas exercés : aucune empreinte servie ne change, T_g n'existe pas | maintenant, sans T_e → T_g |
| (c) ligne réelle de la vague 1 | en bac à sable, aucun. En vrai, un retrait public et définitif sur une cause sans décision : une fausse déclaration publique, exclue | en bac à sable, le serveur local sert la table retirée par le vrai chargeur | T_a → T_g, chaque commande du RUNBOOK, sur le chemin de référence ; publication et déploiement locaux | après le chargeur d'E-2a (sa branche suffit), la partie 3 de VERIFIERS-LIST-F5A-1, R25-REGISTRY-ROOT-1 PR 2, et les lots RH-1 et RH-2 (§5) |

### 3.2 Défaut : (c), en bac à sable, sur la branche du chargeur d'E-2a, cause `adr:`

Raisons :
1. Seule (c) mesure le chemin de référence : les commandes du RUNBOOK, le vrai chargeur, la vraie porte. (a) et (b)
   mesurent un autre code, ou s'arrêtent avant T_e.
2. Aucun effet public ni sur le tronc : tout reste dans un clone `--shared` sous `F:/tmp/`, sans `origin`, et la
   publication va dans un dépôt nu local.
3. La répétition est aussi, jouée une fois à la main, le test de composition que RETIRE-LISTS-E2A-PIPE-1 demande (liste →
   chargeur → écrivain → porte → verdict servi). E-2a l'automatise ensuite.
4. Le calendrier tient : vague 1 visée vers le 2026-10-20, vague 2 au 2026-11-16 (`docs/ETAT.md` l.26-32). D6 demande les
   deux mesures avant le service de la vague 2, et le cycle réel est celui d'E-2a.

Prix : le déclencheur « maintenant » n'est pas tenu par l'acte. Ce qui se fait maintenant : les lots RH-1 et RH-2. L'acte
de répétition attend la branche du chargeur. L'option (a), jouée maintenant comme répétition à blanc, reste possible sans
valeur pour D6 (Q-RL-1).

### 3.3 Le bac à sable

1. **Gouvernance** :
   - `git clone --shared` du dépôt à la tête de la branche d'E-2a, sous `F:/tmp/retire-rehearsal-<D>/gov` ;
   - branche `rehearsal/base` à cette tête, branche `rehearsal/retire` pour le lot ;
   - `origin` retiré : aucune poussée possible vers le dépôt source ;
   - jonctions `node_modules` par l'outil de `docs/methode/REGLES-MISSION.md` l.3 ;
   - tout git par `git -C <gov>`, jamais `GIT_DIR`.

   Les objets neufs vont dans le magasin du clone, le source n'est que lu par ses alternates ; aucun `gc` du source tant
   que le bac à sable vit.
2. **Spécification** : clone de `KraidleAI/monark-kata-spec` sans conversion de fin de ligne (`core.autocrlf=false` ;
   `docs/JOURNAL-PROVENANCE.md` l.446), à sa tête publiée, qui donne `previous_commit`. Puis un clone `--bare` local, qui
   sert de dépôt de publication de la répétition. C'est une lecture du dépôt public ; rien n'y est poussé.
3. **Preuves** : un dossier neuf `F:/tmp/retire-rehearsal-<D>/evidence/`. Chaque acte y dépose sa sortie ; la liste des
   sha256 est faite à la fin.
4. **Objet** :
   - une case `region` de `wave1.json`, d'une classe 1h dont la ligne passe le plancher d'empreinte de #215 (pas une
     dir-4h, retenue) (Q-RL-11) ;
   - cause `adr:decisions/rehearsal-retire-<D>.md`, fichier écrit dans le bac à sable seulement (la cause n'est contrôlée
     que dans sa forme, `policy-retire.ts` l.53 ; RETIRE-ADR-CAUSE-FILE-1).

### 3.4 Les sept instants : où, par quelle commande

Chaque instant est en UTC, à la seconde (l.25, l.47). Un instant de commit se lit par `git -C <dépôt> log -1 --format=%cI
<sha>` et se ramène en UTC ; une lecture d'horloge se fait par `date -u +%Y-%m-%dT%H:%M:%SZ` juste après la sortie de
l'acte (`docs/methode/REGLES-MISSION.md` l.3). L'outil RETIRE-INSTANTS-1 (§8) relit ces sources ; d'ici là, elles se
recopient à la main.

| Instant | Définition (`retire-latency.mjs`) | Répétition (bac à sable) | Cycle réel |
|---|---|---|---|
| T_a | déclencheur (l.16) | commit du fichier `decisions/rehearsal-retire-<D>.md` dans `rehearsal/retire` : instant du commit | `live:<k>` : E_k, 00:00Z (addendum 9 point 1) ; `adr:` : instant du commit de la ligne dans `recherches` (Q-RL-3) |
| T_b | liste engagée (l.17) | commit de la seule liste `apps/harness/data/kata/retire/retire-<D>.json` : instant du commit | idem, sur la branche du lot |
| T_c | table générée, garde CI verte (l.18) | `--write --date <D>` (sortie 0), `--check` (0), entrée de release écrite, commit ; puis `node scripts/oracle/run.mjs --role G1 --tree <gov> --base <sha>` (`scripts/oracle/run.mjs` l.2), qui dérive ses portes de la CI ; `date -u` à sa sortie verte | CI de la PR verte sur ce commit ; `date -u` au constat |
| T_d | dossier daté publié (l.19) | `spec-publish … --out <dir>` (0), copie dans le clone de la spécification, commit, poussée vers le dépôt nu local ; `date -u` au retour de la poussée ; puis `--verify <clone neuf du dépôt nu>` (0) | poussée vers le dépôt public ; `date -u` au retour ; `--verify` sur un clone neuf |
| T_e | PR du harnais fusionnée (l.20) | fusion `--no-ff` de `rehearsal/retire` dans `rehearsal/base` : instant du commit de fusion | instant du commit de fusion au tronc |
| T_f | déployé (l.21) | serveur local lancé depuis la fusion (`node apps/harness/src/server.ts`, RUNBOOK §3 l.113), sur l'écoute de `server.ts` l.35-36 ; puis `verify-harness` avec `--api` et `--mcp` sur cette écoute, `--api-host` au nom `api.` et `--out <evidence>/ca.json` (l.5-10) ; une passe verte en http écrit `ca.json.local` (l.25-26) ; T_f = son `checked_at`, coupé à la seconde | `checked_at` de la CA verte (RUNBOOK §6), coupé à la seconde |
| T_g | premier verdict servi au nouveau `policy_table_sha256` (l.22) | la sonde RETIRE-PROBE-1 contre le serveur local, sur la cellule retirée : instant de la réponse | la même sonde contre l'hôte `api.` |

La répétition joue les actes à la suite, par un seul orchestrateur : elle ne contient ni l'attente d'une G2 ni celle d'un
go. Le rapport donne chaque pas (`steps_ms`, l.55) ; le JOURNAL dit lesquels sont des attentes (oracle en file sous le
verrou d'hôte, fenêtre de sonde).

### 3.5 L'entrée de `retire-latency` et la ligne du JOURNAL

- **Entrée** : `docs/retire-latency/rehearsal-<D>.json`, une ligne `{"format":"retire-latency-v1","cycle":"rehearsal",
  "instants":{…},"mention":null}` (Q-RL-8). `mention` reste `null` tant que T_g − T_a ≤ 14 jours ; au-delà, elle nomme la
  ligne du JOURNAL qui consigne le dépassement (l.51-52).
- **Rapport** : `node scripts/retire-latency.mjs docs/retire-latency/rehearsal-<D>.json`, sortie 0 attendue ; sa sortie est
  gardée dans les preuves, avec son sha256.
- **Ligne du JOURNAL** (`docs/JOURNAL-PROVENANCE.md`, forme des lignes l.443-447) : « RETIRE-LATENCY-REHEARSAL-1 :
  répétition chronométrée du retrait (bac à sable, cycle `rehearsal`) ». Elle porte :
  - la tête de la branche d'E-2a et la tête publiée de la spécification ;
  - la classe, la case et la cause ;
  - les sept instants, avec la source de chacun (sha de commit, sortie, fichier) ;
  - le chemin et le sha256 de l'entrée ;
  - `total_ms`, le plafond (tenu ou non) et l'objectif (atteint ou non) ;
  - les attentes (§3.4) et les limites (§3.7) ;
  - le dossier de preuves et la liste de ses sha256.

  Elle dit en clair que D6 reste ouvert jusqu'au cycle réel.

### 3.6 Seconde répétition, `live:<k>`

Q-Rb-8 et m-7 (`docs/G0-lot-retire-path-rb.md` l.165) : une répétition sur une cause `adr:` n'exerce pas `live:<k>`. Le
lecteur n'a pas d'horloge : il compare E_k au jour de la liste (`policy-retire.ts` l.80). Une liste et un dossier datés
après 2027-01-01 (par exemple 2027-01-05) passent donc en bac à sable, avec des comptes qui font tirer le veto
(`policy-guard.ts` l.95) dans `LIVE_N_MAX` (`policy-wave2.ts` l.16). La porte de vocabulaire les refuse jusqu'à
RETIRE-CAUSE-VOCAB-1 (§2.2 point 7). Seconde répétition, même procédure, après cette décision (Q-RL-9) ; ses dates sont
fictives et ses instants réels.

### 3.7 Ce que la répétition ne mesure pas

- La publication et le déploiement sont locaux : ni réseau, ni hôte, ni Caddy, ni TLS ; T_d et T_f sont sous-estimés. Le
  cycle réel les mesure ; l'hôte de répétition est l'item RETIRE-REHEARSAL-STAGING-1 (décision du fondateur).
- Pas d'attente humaine (G2, go de l'investisseur) : le cycle réel la mesure (brouillon R-4, l.204).
- Le chargeur est celui d'une branche non relue : la mesure vaut pour son sha, nommé au JOURNAL.

## 4. Tuyaux (branchement)

- **Section du RUNBOOK et son test** :
  - entrée : `docs/RUNBOOK-harness.md` l.259-431 ; `INSTANTS` et `report` de `retire-latency.mjs`, `RETIRE_DIR`, le texte de
    l'écrivain (l.4, l.101, l.184), `parseArgs` et `versionDir` de `spec-publish.mjs` ;
  - sortie : le verdict de la CI ; état : aucun ;
  - test : `test/runbook-retire.test.ts`, trois tests, chacun avec son tueur. Vert sur le worktree ; rouge par assertion
    à la base (3 sur 3, « the harness runbook carries the retire section ») ; trois tueurs tirés un à un, trois tués par
    assertion, fichier restauré (M-5).
- **La répétition** :
  - entrées : la tête de la branche d'E-2a, la tête publiée de la spécification (lue), une case de `wave1.json` ;
  - sortie : la ligne du JOURNAL et `docs/retire-latency/rehearsal-<D>.json`. Elles sont lues par la clôture de D6, une
    décision de MONARK et de RECHERCHES avant le service de la vague 2. Ce n'est pas un chemin servi ;
  - état : le bac à sable et ses preuves sous `F:/tmp/retire-rehearsal-<D>/`, gardés ;
  - test : la répétition est le test de composition du chemin de retrait, joué une fois ; E-2a l'automatise
    (RETIRE-LISTS-E2A-PIPE-1).
- **RETIRE-PROBE-1** : entrée, l'entrée de classe, le fichier daté, l'URL ; sortie, le JSON de la sonde, lu par chaque
  cycle (T_g) et par RETIRE-INSTANTS-1 ; test hors ligne sur une écoute locale (§8).
- `retire-latency.mjs` et la sonde sont des outils de gouvernance : aucune revendication « built » dans un registre public
  (même règle que R-a, `docs/G7-lot-retire-path-ra.md` l.41-42).

## 5. Découpe en lots et R-25

Estimation à ±30 % ; R-25 compté comme au G0 de R-b (`git diff --shortstat <base> -- . ':(exclude,glob)docs/**/*.md'`, plus les fichiers
neufs), borne de 1 205 (CI), 1 150 dans la consigne.

| Lot | Contenu | R-25 | Quand |
|---|---|---|---|
| RH-0 (ce lot) | RETIRE-RUNBOOK-1 (section du RUNBOOK, docs exclus) ; `test/runbook-retire.test.ts` (73 lignes, mesuré) ; ce G0 (exclu) | **73** | maintenant |
| RH-1 | RETIRE-PROBE-1 (outil ~100, type ~12, test ~110) ; RETIRE-INSTANTS-1 (outil ~70, type ~8, test ~70) ; ajout de la G2 de #218 : le §8 du RUNBOOK pour le cycle `publication` (entrée T_c..T_g, `mention` nulle, refus `instant_out_of_cycle` et `mention_out_of_cycle`, ouverture de l'entrée citée l.8-10) et la forme publication de RETIRE-INSTANTS-1 ; `test/runbook-retire.test.ts` lit `CYCLES` et les codes de refus dans le script | **~370** (une PR, ou deux) | maintenant |
| RH-2 | SPEC-TABLES-TEST-PER-DIR-1 (~12) ; T0-ORDER-TEST-RELEASE-NAME-1 (~4) | **~20** | maintenant, avant toute release datée |
| RH-3 | RETIRE-REAL-CYCLE-SCOPE-1, selon la réponse de RECHERCHES à Q-RL-2 (outil ~15, type ~2, test ~25) | **~45** | avant la première publication datée d'E-2a |
| RH-4 | l'acte de répétition (§3) : l'entrée JSON (1 ligne), la ligne du JOURNAL (exclue) | **~1** | sur la branche du chargeur d'E-2a, après RH-1 et RH-2 |
| RH-5 | seconde répétition `live:<k>` (§3.6) | **~1** | après RETIRE-CAUSE-VOCAB-1 |

En méthode par parties (`docs/methode/REGLES-MISSION.md` l.20) : RH-1 à RH-3 forment une partie (une G2, puis un G7) ; RH-4
et RH-5 sont des actes de l'orchestrateur, consignés au JOURNAL.

## 6. Risques

- **R-1, contamination irréversible** : une liste fusionnée au tronc entrerait dans la chaîne pour toujours ; une poussée vers
  le dépôt public aussi (§2.2 point 12). Parade : bac à sable sans `origin`, dépôt nu local, aucune poussée hors de
  `F:/tmp/`.
- **R-2, fuite d'environnement git** (incident `3903d83`, TEST-GIT-ENV-ISOLATION-1). Parade : `git -C` seulement, aucun
  `GIT_DIR` ni `GIT_WORK_TREE`, contrôlé avant le premier acte.
- **R-3, clones Windows en CRLF** : les octets reportés changent, refus `input_digest` (`docs/JOURNAL-PROVENANCE.md` l.446).
  Parade : `core.autocrlf=false` à chaque clone.
- **R-4, cible mouvante** : la branche d'E-2a change après la répétition. Parade : sha nommé ; si le chargeur change, la
  mesure vaut pour l'ancien, ce que dit le JOURNAL.
- **R-5, attentes dans la mesure** : l'oracle sous le verrou d'hôte (file), la fenêtre de sonde (jusqu'à une heure en 1h).
  Elles font partie de la latence réelle ; le rapport les montre pas par pas.
- **R-6, port local occupé** sur la machine de l'orchestrateur (`server.ts` l.36) : le serveur ne démarre pas. Parade :
  contrôle avant T_e.
- **R-7, MAST** :
  - vérification incomplète : une répétition prise pour la clôture de D6. Parade : D6 exige les deux mesures, et la ligne
    du JOURNAL le dit ;
  - dérive entre spécification et exécution : des instants définis autrement d'un cycle à l'autre. Parade : la table §3.4,
    et le test du RUNBOOK qui épingle les instants au script.

## 7. Questions (défaut entre parenthèses)

- **Q-RL-1, MONARK décide, RECHERCHES relit** (Q-R1 et §4.5 du brouillon sont les siens) : quel objet pour la répétition ?
  ((c) : une ligne réelle de la vague 1, en bac à sable, sur la branche du chargeur d'E-2a, cause `adr:`, rien poussé ni
  déployé hors du bac à sable. (a), jouée maintenant comme répétition à blanc de T_b → T_d, n'a pas de valeur pour D6 ;
  (b) est écartée.)
- **Q-RL-2, RECHERCHES décide, MONARK code** : comment s'écrit le cycle réel de Q-R1, qui n'a ni T_a ni T_b (§2.2 point 9) ?
  (Une valeur de cycle fermée `publication` dans `retire-latency.mjs` : T_c à T_g seulement, T_a et T_b refusés, le plafond
  de 14 jours non applicable faute de T_a ; item RETIRE-REAL-CYCLE-SCOPE-1. Sans réponse, D6 attend un premier retrait réel :
  au plus tôt après 2027-01-01 pour `live:1`, et le service de la vague 2 avec lui.)
- **Q-RL-3, MONARK décide, RECHERCHES relit** : quel instant pour T_a sur une ligne `adr:` ? (L'instant du commit qui ajoute
  la ligne, en UTC. 00:00Z de sa date compterait jusqu'à un jour où la décision n'existait pas ; la date seule n'est pas un
  instant, l.25 et l.47.)
- **Q-RL-4, MONARK** : refaire un dossier daté avant sa publication se fait avec des commandes git qu'aucun script
  n'imprime ; ce sont les seules de la section qui ne viennent pas du code. (Celles de l'étape 9 du RUNBOOK : `git clean -n -d`, puis `-f -d`,
  sur le dossier non suivi ; `git rm -r` et l'entrée de release dans un même commit, sur la branche du lot ; jamais après
  T_d. Item RETIRE-REDO-MESSAGE-1 : l'écrivain les imprime.)
- **Q-RL-5, MONARK** : la sonde est-elle un outil neuf, ou un contrôle de plus de `verify-harness` ? (Un outil neuf : les 15
  contrôles sont comptés dans deux tests et dans le RUNBOOK (`test/surfaces-1-1-0.test.ts` l.163-193 ; RUNBOOK l.186-188,
  l.214), la CA s'écrit d'un seul passage, et la sonde attend une fenêtre de grille.)
- **Q-RL-6, MONARK** : faut-il avancer SPEC-TABLES-TEST-PER-DIR-1 et T0-ORDER-TEST-RELEASE-NAME-1 avant la répétition (lot
  RH-2) ? (Oui : sans eux, l'oracle du bac à sable ne peut être vert, et T_c n'existe pas ; E-2a en a besoin de même.)
- **Q-RL-7, MONARK** : RETIRE-INSTANTS-1 dans RH-1 ? (Oui : les instants git et la CA se relisent par outil ; l.47 refuse
  un instant mal écrit, pas un instant faux.)
- **Q-RL-8, MONARK** : où vit l'entrée de `retire-latency` ? (`docs/retire-latency/<cycle>-<YYYY-MM-DD>.json`, une ligne,
  commitée avec la ligne du JOURNAL qui cite son sha256 ; `node scripts/retire-latency.mjs` la rejoue.)
- **Q-RL-9, RECHERCHES** : la seconde répétition `live:<k>` peut-elle se jouer en bac à sable avec une liste et un dossier
  datés après E_1 (§3.6) ? (Oui, après RETIRE-CAUSE-VOCAB-1. Ses dates sont fictives, ses instants réels, et le JOURNAL le
  dit.)
- **Q-RL-10, FONDATEUR** : faut-il un hôte de répétition (dépense, compte) et un dépôt privé de répétition, pour mesurer
  T_d, T_f et T_g sur un vrai réseau ? (Non : le cycle réel d'E-2a mesure ces actes sur les vrais hôtes, sans dépense.
  L'item RETIRE-REHEARSAL-STAGING-1 en écrit le prix.)
- **Q-RL-11, MONARK** : quelle classe pour la répétition ? (Une classe 1h, dont une case `region` passe le plancher
  d'empreinte de #215, hors dir-4h. La sonde y attend au plus une heure.)
- **Q-RL-12, MONARK** : la publication de la spécification et le déploiement du cycle réel sont délégués à MONARK « quand il
  le faut ». La poussée du cycle réel vers le dépôt public de la spécification relève-t-elle de cette délégation ? (Oui,
  comme l'acte 8 de T0, `docs/JOURNAL-PROVENANCE.md` l.444-446. Rien ne touche ici ni argent, ni clé, ni compte, ni DNS, ni
  domaine, ni certificat, ni visibilité de dépôt, ni X.)

## 8. Items formés (règle zéro dette, registre PAROXYSME)

- **RETIRE-PROBE-1** (outil). Porteur : MONARK.
  - Déclencheur : avant la répétition (lot RH-1), au plus tard au G0 court d'E-2a.
  - Limite : aucune commande ne lit T_g (§2.2 point 4).
  - Construction : `scripts/retire-probe.mjs` et son `.d.mts`. Options `--api <url>`, `--api-host <nom>`, `--class`,
    `--cell`, `--table <fichier daté>`.
    - La requête kata vient de l'entrée de classe (alpha, nMin, plafond de tau, horizon) et de la table (seuils du côté) ;
      la sonde attend la fenêtre de grille suivante, borne `--max-wait`, et fait un seul appel.
    - Elle imprime un JSON fermé : instant de la réponse, statut, raison, `policy_table_sha256`, `policy_row_sha256`,
      sha256 attendu, égalité.
    - Sorties : 0 si égal (et `calib_retired` sur la cellule retirée) ; 1 refusé, par code ; 2 usage.
    - Test hors ligne sur une écoute locale du gestionnaire en processus, avec tueurs.
  - Prix : ~220 lignes.
- **RETIRE-INSTANTS-1** (outil). Porteur : MONARK.
  - Déclencheur : avec RETIRE-PROBE-1 (RH-1).
  - Limite : instants recopiés à la main (§3.4).
  - Construction : `scripts/retire-instants.mjs`, qui lit un fichier de preuves fermé :
    - T_a, T_b et T_e en sha de commit et dépôt ;
    - T_c et T_d en lectures d'horloge consignées ;
    - T_f en chemin de CA, coupé à la seconde ;
    - T_g en sortie de la sonde.

    Il écrit l'entrée `retire-latency-v1` et refuse toute source illisible.
  - Prix : ~150 lignes.
- **T0-ORDER-TEST-RELEASE-NAME-1** (test). Porteur : MONARK.
  - Déclencheur : avant la première entrée de release datée, celle de la répétition ou celle d'E-2a (RH-2).
  - Limite : M-1, le test de l'ordre de T0 lit la dernière release.
  - Construction : lire la release `contract-1.1.0` par son nom, celle que publie l'acte 8 (`test/surfaces-1-1-0.test.ts`
    l.231), avec un tueur.
  - Prix : ~4 lignes.
- **RETIRE-LIST-WRITER-1** (outil). Porteur : MONARK.
  - Déclencheur : le G0 d'E-2a, dont le chargeur lit les listes ; au plus tard le premier retrait réel.
  - Limite : la liste s'écrit à la main (§2.2 point 6).
  - Construction : `scripts/retire-list.mjs` écrit la liste datée suivante à partir de la précédente et des entrées neuves :
    triée, canonique, cumulative. Il la contrôle par `readRetireList` contre le registre épinglé, et imprime son sha256
    d'épingle.
  - Prix : ~160 lignes.
- **RETIRE-REDO-MESSAGE-1** (texte d'outil). Porteur : MONARK.
  - Déclencheur : le prochain lot qui touche `scripts/spec-policy-tables.mjs`, avec RETIRE-HEADER-WORDING-1.
  - Limite : Q-RL-4, le refus de l.184 ne nomme pas les commandes git.
  - Construction : le refus nomme `git rm -r -- spec/<dossier>` (suivi) et `git clean -f -d -- spec/<dossier>/` (non suivi) ;
    l'assertion du test de R-b qui lit ce message suit.
  - Prix : ~4 lignes.
- **RETIRE-REAL-CYCLE-SCOPE-1** (outil, sur décision). Porteur : RECHERCHES décide, MONARK code.
  - Déclencheur : avant la première publication datée d'E-2a.
  - Limite : §2.2 point 9.
  - Construction : celle de Q-RL-2.
  - Prix : ~45 lignes et une G2 de partie.
- **RETIRE-REHEARSAL-STAGING-1** (procurement, sur décision du fondateur). Porteur : FONDATEUR décide ; MONARK installe si
  l'item est pris.
  - Déclencheur : une mesure de T_d, T_f et T_g sur un vrai réseau, voulue avant le cycle réel.
  - Limite : §3.7, publication et déploiement locaux.
  - Construction : un second hôte, servi comme RUNBOOK §2-§5 sous un nom de répétition, et un dépôt privé de
    spécification de répétition.
  - Prix : un hôte de plus (montant à lire sur place chez l'hébergeur, non lu ici), un dépôt privé, une session
    d'installation.

Items existants, cités et non reformés :
- SPEC-DATED-RELEASE-ENTRY-1 (lignes portées : la répétition mesure leur écriture à la main) ;
- SPEC-TABLES-TEST-PER-DIR-1 (avancé dans RH-2, Q-RL-6) ;
- RETIRE-LISTS-E2A-PIPE-1, RETIRE-CAUSE-VOCAB-1, RETIRE-EVIDENCE-BIND-1, RETIRE-ADR-CAUSE-FILE-1, RETIRE-HEADER-WORDING-1 ;
- VERIFIERS-LIST-F5A-1 (partie 3) ;
- R25-REGISTRY-ROOT-1 PR 2 ;
- TEST-GIT-ENV-ISOLATION-1.

## 9. Ce que je n'ai pas fait

- Aucune répétition jouée, aucun bac à sable créé, aucun clone du dépôt public, aucun réseau, aucun hôte, aucune
  publication, aucun déploiement.
- Le chargeur d'E-2a n'est pas écrit : rien n'en est lu.
- Aucune série de marché lue ; `wave1.json` non lu.
- `--write --date` lancé deux fois, dans deux copies jetables sous le scratchpad (M-2, refusé sans écriture ; M-3, un dossier
  daté écrit dans la copie), jamais dans le worktree : écart à la consigne « jamais `--write` », déclaré ici.
- Aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`, aucun git qui écrit dans un dépôt, aucun commit, aucun
  workflow, aucun Python, rien écrit sur C:.

## Annexe A. Reproduction des mesures

Copies `git archive 07b7fc20 | tar -x` sous `F:/tmp/claude/F--Monark/a0cf3d1b-5446-43e6-b228-3b1feff36069/scratchpad/`,
`node_modules` en jonction vers celui du worktree. Node 24.21.0.

| Mesure | Copie | Acte | Sortie (sha256) |
|---|---|---|---|
| M-1 | `srf-probe` | témoin : `srf_runbook_vitrine_t0_order` vert (`control.txt` `095a48e6…`) ; puis une release `contract-1.1.0-tables-2026-11-02` ajoutée en dernier (entrées `d60e45d6…`) : rouge par assertion | `probe.txt` `53cdb928…` |
| M-2 | `srf-probe` | `node scripts/spec-policy-tables.mjs --write --date 2026-11-02` : sortie 1, rien écrit ; `--check` : sortie 0 | `write-date.txt` `05a15cad…` ; `check.txt` `125cedbf…` |
| M-3 | `srf-probe2` | `kataClassText` changé pour `btc-dir-1h` (`gate.ts` `1967aadb…`) ; `--write --date 2026-11-02` : sortie 0, fichier `493c1541…` ; `--check` : 0 ; `published_tables_are_the_served_tables_byte_for_byte` : rouge par assertion | `m2-write.txt` `2ef18cf2…` ; `m2-check.txt` `1bd2cd68…` ; `m2-test.txt` `fe795d73…` |
| M-4 | `srf-probe2` | `node probe-inproc.mts` (`681b0666…`) : miroir JSON en processus, `produced_at` à l'instant de grille, horloge à +1 s, +300 s, +300,001 s, −300 s, −300,001 s | `probe-inproc.txt` `beb87989…` |
| M-5 | `kill-probe` et `srf-probe` | `node killers.mjs` (`86f32bec…`) : trois tueurs, chacun seul, trois tués par assertion, fichier restauré ; base : 3 sur 3 rouges par assertion | `killers.out` `f1783349…` ; `base-runbook-retire.txt` `bc509e6a…` |

## 10. Décisions de MONARK (MONARK, 2026-10-07 02:0x UTC)

- **Relu par MONARK** : la section « Retire a kata row » du RUNBOOK (étapes 1 à 9, chaque commande contre son fichier), le test
  `test/runbook-retire.test.ts`, et ce G0 (§2, §3, §7, §8). Les lignes citées de `scripts/spec-publish.mjs` tiennent sur le tronc
  `2a46eeb8` : #215 n a changé ce fichier qu en place (l.284-297) et après l.321 (`git diff -U0 07b7fc20 2a46eeb8`).
- **Questions de MONARK : les défauts sont retenus.** Q-RL-1 ((c), en bac à sable ; RECHERCHES relit), Q-RL-3 (l instant du
  commit de la ligne `adr:` ; RECHERCHES relit), Q-RL-4, Q-RL-5 (un outil neuf), Q-RL-6 (RH-2 avancé), Q-RL-7, Q-RL-8, Q-RL-11 (une
  classe 1h qui passe le plancher) et Q-RL-12 (la poussée du cycle réel est dans la délégation, comme l acte 8 de T0).
- **Q-RL-2 et Q-RL-9** vont à RECHERCHES avec la G2 de ce lot.
- **Q-RL-10 (fondateur)** : le défaut « non » tient. Il n y a ni dépense ni compte. Le fondateur en est informé ; l item
  RETIRE-REHEARSAL-STAGING-1 garde le prix, à lire sur place si la question revient.
- **Écart du worker, déclaré** : `--write --date` a été lancé deux fois, dans des copies jetables hors de tout arbre git. La
  consigne disait de ne jamais lancer `--write`. Rien n a été écrit dans le worktree (`git status`). L écart est gardé comme mesure
  (M-2, M-3), et son `error_origin` ira au G7.

## 11. Décisions de RECHERCHES (`ff13e11`), pliées (MONARK, 2026-10-07 02:2x UTC)

- **G2 de #216 : APPROUVE**, relecture par sondage. Les étapes 1 à 3 du RUNBOOK ont été lues, et quatre citations vérifiées à
  `07b7fc20`.
- **Q-RL-2 : oui, cycle fermé `publication` (T_c à T_g).** D6 se prouve en deux segments mesurés, chacun pour ce qu il est :
  - le **segment de décision** (T_a → T_c) vient de la répétition de Q-RL-1, sur une vraie ligne de vague 1 en bac à sable, avec une
    cause `adr:` dont le T_a est réel ;
  - le **segment de mise en service** (T_c → T_g) vient du cycle `publication` d E-2a, en production réelle ;
  - le G7 de RETIRE-LATENCY-REHEARSAL-1 écrit que la somme des deux segments est sous 14 jours, et cite les deux records de
    `retire-latency.mjs`. Il ne présente jamais un cycle `publication` comme un retrait.
  
  RETIRE-REAL-CYCLE-SCOPE-1 (§8) porte la valeur `publication` dans `retire-latency.mjs`.
- **Item formé, RETIRE-LATENCY-FIRST-REAL-1** (PAROXYSME). Porteur : MONARK.
  - Déclencheur : le premier retrait réel, au plus tôt `live:1` le 2027-01-01, ou une cause `adr:` avant.
  - Objet : le mesurer de T_a à T_g d un seul tenant.
  - Au-delà de 14 jours, c est un écart à D6, ouvert en PAROXYSME.
- **Q-RL-9 : oui, après RETIRE-CAUSE-VOCAB-1, à trois conditions.**
  1. Le bac à sable ne peut rien pousser. Ses clones n ont pas d URL de push (`git remote set-url --push origin no-push`, ou aucun
     remote), et le G7 le montre (`git remote -v`).
  2. La liste et le dossier datés après E_1 n entrent ni dans un commit poussé ni dans une pièce publiée. Le JOURNAL dit « dates
     fictives, instants réels ».
  3. La répétition `live:<k>` éprouve la mécanique (le garde de date, `LIVE_N_MAX`, les comptes). Ce n est pas une preuve de
     latence pour D6 : seule la répétition `adr:` compte, au segment de décision.
- **Q-RL-1 (c) et Q-RL-3 : agréées.** Q-RL-3 est précisée : T_a est la date du committer du commit qui ajoute la ligne
  (`git log -1 --format=%cI`), jamais la date d auteur, qu un rebase garde ancienne. Le RUNBOOK le dit aux étapes 1, 2 et 5 (T_a,
  T_b et T_e), sans changer le nombre de ses lignes : les tueurs de `test/runbook-retire.test.ts` restent à l.300, l.366 et l.399.
