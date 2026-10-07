# G0 du lot HOST-ADDRESS-GATE-1 : les deux adresses d'hôte hors de l'arbre courant, et une porte qui refuse tout littéral d'adresse IP

RECHERCHES, 2026-10-07. Base `eb1beb01` (lot/etude-suite, fusion de #235). Demande : décision du fondateur, verbatim « Retirer + garde CI
(Recommandé) », relayée par MONARK (`recherches:coordination/messages/2026-10-07-MONARK-vers-RECHERCHES-decisions-fondateur-241-235.md`
§2) ; liste des fichiers, en noms seuls : pièce `recherches:coordination/pieces/2026-10-07-adresses-hote/ip-files.txt`.

- **Provenance** : worker `claude-opus-5-5`, effort max, horloge lue (`date -u`) à 18:33 UTC. Worktree neuf du scratchpad, branche
  `recherches/host-address-gate` ; `git add` par chemins ; poussé sans force. Node v24.21.0, Linux.
- **Confidentialité** : aucune adresse réelle n'est écrite ici, ni dans les messages de commit, le corps de la PR, les sorties gardées
  ou les pièces. On dit « adresse A » (le VPS du site) et « adresse B » (l'hôte Bell), ou on renvoie à `fichier:ligne`.
- **Historique** : il n'est pas réécrit (décision du fondateur). Les commits passés gardent les adresses ; seul l'arbre courant change.

## 1. Retrait : les 35 fichiers de la pièce

`deploy/Caddyfile.monark-harness`, `deploy/monark-bell-publish.service`, `docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md`,
`docs/BASCULEMENT-COMPTE.md`, `docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md`, `docs/CHECKPOINT1-lot-dojo-pr2-2-tick.md`,
`docs/CHECKPOINT1-lot-narabi-ops-1.md`, `docs/CHECKPOINT1-lot-t1b-backend.md`, `docs/ETAT-REPRISE.md`,
`docs/G0-ADDENDUM-lot-narabi-ops-1b-ii.md`, `docs/G0-lot-narabi-ops-1.md`, `docs/G0-lot-narabi-ops-1b.md`, `docs/G0-lot-t1b-backend.md`,
`docs/JOURNAL-PROVENANCE.md`, `docs/PASSATION-2026-09-24.md`, `docs/RUNBOOK-bell.md`, `docs/RUNBOOK-dojo.md`, `docs/RUNBOOK-harness.md`,
`docs/RUNBOOK-sentinel.md`, `docs/RUNBOOK-vitrine.md`, `docs/SPRINT-BACKLOG-lot-t1b-backend.md`, `docs/adr/ADR-DOJO-PR-2.md`,
`docs/adr/ADR-DOJO-PR-3.md`, `docs/adr/ADR-DOJO-SNAPSHOT-1.md`, `docs/adr/ADR-K1-attesteur-narabi.md`,
`docs/adr/ADR-M005-harnais-mcp-appelable.md`, `docs/adr/ADR-M007-calibrate-byo.md`, `docs/adr/ADR-T1b-backend.md`,
`docs/carto/flows-2026-09-24.json`, `docs/carto/graph-2026-09-24.json`, `docs/course-bell/FAITS-hostinger-backups-vps-bell-2026-09-23.md`,
`docs/course-bell/FAITS-vps-bell-precheck-2026-09-23.md`, `docs/dojo/FAITS-systemd-timer-2026-09-27.md`,
`docs/roster/FAITS-github-actions-billing-runners-2026-09-25.md`, `test/surfaces-1-1-0.test.ts`.

Mesuré à la base : 252 occurrences (A et B) dans ces 35 fichiers et nulle part ailleurs ; 134 sont des `root@<adresse>` de commandes SSH.

**Règle de remplacement** :

- A devient `monarkgate.tech` : le VPS du site (vitrine, harnais `mcp.` et `api.`, sentinelle), un seul Caddy
  (`deploy/Caddyfile.monark-harness` l.2-3 et l.11). B devient `bell.monarkgate.tech` : l'hôte Bell, nommé par son enregistrement A
  (RUNBOOK-bell étape 7).
- C'est la convention déjà posée par `docs/RUNBOOK-dojo.md` l.543-544 : l'hôte est nommé par son enregistrement A, jamais par son
  adresse, et sa clé d'hôte SSH est copiée sous ce nom une fois, à l'étape (0) l.546-572.
- Là où le texte a besoin de l'adresse elle-même (un enregistrement DNS « nom → adresse », un attendu « Address: … »), il prend une forme
  neutre : « l'adresse de l'hôte Bell », « l'adresse du VPS du site », ou `<address>` comme `docs/RUNBOOK-dojo.md` l.549-550. Un contrôle
  reste une comparaison entre deux lectures.
- Le résolveur public des commandes `nslookup` (quatre de ces fichiers) prend son nom, `one.one.one.one`.
- Remplacement en place : aucune ligne n'est ajoutée ni ôtée. Les renvois par numéro de ligne et les tueurs ancrés dans ces fichiers
  restent justes.

**Vérifié : rien ne lit l'adresse à l'exécution.**

- Les deux occurrences de `deploy/` sont des commentaires (l.6 et l.2), que Caddy et systemd ignorent.
- `scripts/verify-bell.mjs` (l.200) compare l'unité installée au blob du G7 qu'on lui donne, jamais à l'arbre courant.
  `scripts/verify-harness.mjs` ne lit pas le Caddyfile.
- L'occurrence de `test/surfaces-1-1-0.test.ts` (l.240) est l'empan attendu de l'acte 1 de `docs/RUNBOOK-vitrine.md` (l.42) : les deux
  changent ensemble.
- Lecteurs des fichiers touchés, rejoués au gel : `harness-deploy-config`, `bell-deploy-config`, `verify-bell`, `verify-dojo`,
  `bell-ops`, `bell-anchor-timeline`, `bell-method`, `dojo-collect-deploy`, `dojo-publish-deploy`, `probe-dojo-live`, `runbook-retire`,
  `retire-probe`, `retire-instants`, `verify-harness-liq`, `surfaces-1-1-0`, `export-public` (hors test 42), `probe-narabi-state`,
  `spec-retire-path`, `adr-m003-suffixes`, `dojo-served`, `dojo-chain`, `dojo-verify`, `keep-cause`.

**Épingles, contrôlées avant d'éditer** :

- Aucun des 35 fichiers n'est sous `tools/kata-recalc/**` ni dans `test/contracts-frozen.manifest.json`.
- Aucune ligne de `KraidleAI/monark-precommitments` (clone en lecture, `43472d7`) ne cite l'un d'eux, ni par chemin ni par sha256.
- Les sha256 cités ailleurs (onze fichiers, par exemple l'unité Bell dans le journal l.368) sont des relevés datés de ce qui a été lu
  ou déployé à un commit. L'historique les garde vérifiables : aucun n'est une épingle de l'arbre courant.
- Aucun fichier n'est donc refusé.

## 2. Les autres littéraux hors de la liste close

La porte refuse toute adresse hors de la liste. Hors des 35, l'arbre en porte encore, qui ne désignent aucun hôte à nous :

- **Réécrits en mots, en place** :
  - `docs/G1-lot-codeql-alerts-1.md` : l'adresse du registre et une adresse locale de poste ;
  - `docs/G2-DELTA-lot-narabi-ops-1b-i.md` : l'adresse de métadonnées en nuage et une IPv6 de lien local ;
  - `docs/G2-DELTA-lot-t1a-iii-a1.md` : une IPv6 d'essai ;
  - `docs/course-bell/FAITS-massive-host-2026-09-23.md` : les adresses d'un fournisseur tiers ;
  - `docs/G7-lot-l2-p1-b2.md` et `docs/G7-lot-spec-publish-pipeline-1.md` : les entrées privées des tests ci-dessous.
- **Tests, entrées d'adresse privée (RFC 1918) passées en adresses de documentation (RFC 5737)** : `test/l2-book.test.ts`,
  `test/public-text-deny.test.ts` et `test/spec-publish.test.ts`. Les règles visées refusent tout quadruplet pointé
  (`PRIVATE_FORMS`, `scripts/public-text-deny.mjs:118`), ou tout point et tout deux-points (`PLAIN`, `scripts/l2/book.mjs:27`) : le
  comportement est le même.

## 3. La porte

- `scripts/address-literals.mjs` et ses types `scripts/address-literals.d.mts` portent la règle. Elle vit dans un script, et non dans le
  test, pour que red-proof juge les tests (module neuf à la base) et tire leurs tueurs.
- `test/no-host-address.test.ts`, test racine : il tourne en CI dans `g3-verification` (`npm run test:main`, glob `test/*.test.ts`).
- Ni le script ni le test ne sont exportés (`WHITELIST_FILES` de `scripts/export-public.mjs` ; le `test/` racine n'est jamais exporté).
- **Lecture** : `git ls-files -z`, jamais le disque ; chaque fichier suivi sans octet NUL est lu comme texte, quelle que soit son
  extension (`deploy/*.service` et les Caddyfile en sont) ; un binaire est sauté.
- **Littéral** :
  - IPv4 : quatre octets décimaux (`net.isIPv4`), bornés (avant : ni lettre, ni chiffre, ni `_`, ni `.` ; après : ni lettre, ni
    chiffre, ni `_`, ni `.chiffre`) ;
  - IPv6 : suite maximale de chiffres hexadécimaux, de `:` et de `.` qui porte au moins deux `:` ; même borne de mot (un `:` seul en
    tête, séparateur d'étiquette, est ôté) ; points finaux ôtés ; `net.isIPv6`.
- **Liste close d'exceptions, chacune avec sa raison** :
  - (a) **plages**, par `BlockList` de Node, qui couvre toute graphie (IPv4-mapped, forme longue, mesuré sous Node 24) :
    - bouclage : 127.0.0.0/8 et `::1` ;
    - adresse non spécifiée : 0.0.0.0 et `::`, sa jumelle IPv6 (`::` est aussi le séparateur ` :: ` des textes et le `::` des regex) ;
    - documentation : 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (RFC 5737) et 2001:db8::/32 (RFC 3849).
  - (b) **littéraux listés un par un**, chacun avec son fichier, sa valeur et sa raison :
    - numéros qui ont la forme d'une adresse : des paragraphes de RFC 9162, de WHATWG HTML, d'ECMA-262 et des Baseline Requirements du
      CA/B Forum, deux clauses d'un texte de couverture, une version de V8 ;
    - formes de code : deux tranches Python de `tools/kata-recalc/report.py` (outil épinglé, non touché), la commande de workflow
      `add-mask` de GitHub Actions, la queue du bouclage écrit en pourcent-encodage ;
    - entrées-bornes du test de bouclage `test/retire-instants.test.ts` : les voisines immédiates des plages qu'il épingle (au-dessus et
      au-dessous de 127/8, au-dessus de 0/8 et de `::1`, une forme IPv4-mapped) et le haut de 0/8. Les remplacer affaiblirait ses bornes.
- Une entrée listée qui ne trouve plus son littéral dans son fichier rougit (garde non inerte, comme `byte-guard`).
- Le fichier de la porte ne porte que les littéraux de sa propre liste. Le test construit ses adresses à l'exécution : il n'a besoin
  d'aucune exemption.
- **Sortie rouge** : `chemin:ligne:colonne IPv4 x.x.x.x` (ou `IPv6 x:x::x`). Chaque groupe de chiffres devient `x` : aucun chiffre de
  l'adresse n'est imprimé. Le journal de CI d'un dépôt public est public ; la forme `a.b.x.x` de la demande y imprimerait un /16.

## 4. Rouge d'abord, tueurs, preuve rouge

- **Rouge d'abord** : le script et le test du lot, posés dans une copie jetable de l'arbre de la base, rougissent par assertion. La
  sortie nomme chaque `chemin:ligne:colonne` des adresses A et B et des autres littéraux, masqués. Après le retrait, vert. Comptes
  mesurés : section 6.
- **Tueurs** : un par test, sur les lignes clés du script : une plage ôtée ou élargie, la borne de mot IPv6, l'admission par fichier,
  le masque, le saut des binaires, la lecture par `git ls-files -z`. Ancrés et vérifiés par `verifie-ancres` et
  `every_killer_line_is_readable` ; liste exacte en section 6.
- **red-proof** (`--base eb1beb01 --draw n --seed s`) :
  - les tests de `test/no-host-address.test.ts` sont `new-module` ;
  - `srf_runbook_vitrine_t0_order` est F2P (l'empan suit le runbook) ;
  - trois adaptations non F2P sont déclarées : les tests de `l2-book`, `public-text-deny` et `spec-publish` qui portent les entrées
    changées. Les refus « green at base » sont attendus ; leurs tueurs sont tirés à la main au gel.

## 5. Effets opératoires (déclarés)

- **SSH par nom** : la première commande par nom vers `monarkgate.tech` demande la clé d'hôte sous ce nom. On la copie comme à l'étape
  (0) de RUNBOOK-dojo (empreinte égale à celle connue pour l'adresse), jamais par `accept-new`. MONARK vérifie de son côté, sur les
  hôtes, que SSH n'accepte que les clés.
- **`deploy/monark-bell-publish.service`** change d'une ligne de commentaire. Un contrôle Bell à un G7 postérieur à cette fusion attend
  l'unité réinstallée (RUNBOOK-bell étape 6). À un G7 antérieur, rien ne change.

## 6. Mesures

À remplir au gel : comptes rouges à la base, tueurs ancrés, red-proof, portes et taille R-25 (forme de la CI, hors `docs/**/*.md` ;
estimée sous 547, borne du lot, et sous 1 205, borne de la CI).

## Points pour MONARK

- **Q-1** : les entrées-bornes de `test/retire-instants.test.ts` sont des adresses hors des plages, non des numéros. Elles sont listées
  avec leur raison. Autre voie : les sortir du test, au prix de ses bornes.
- **Q-2** : `::` est admise avec 0.0.0.0, et les numéros de section ou de clause avec les numéros de version, comme lus de la décision.
