# PAROXYSME-Harnais : registre intérimaire des limites du Harnais (la porte) et du moteur 1.1.0 avec ses katas

- **Objet** : versement intérimaire (a′) du plan de route PAROXYSME v3 (§4.1 A, §6 « Transition ») : la pièce `built` Harness reçoit son
  registre, et les limites du moteur 1.1.0 et des katas y sont versées (« Harnais avec les limites du moteur », plan §4.1 A).
- **Règle** (règles « Dettes » et « PAROXYSME » de l'investisseur ; décision 251 rappelée par `docs/PAROXYSME-Dojo.md`) : une limite
  déclarée n'est jamais une fin ; elle mène à un item, à une campagne, puis à une décision. Ici, chaque entrée ouverte porte un item, un
  porteur et un déclencheur ; ce qui ne se reproduit pas tel quel à la tête va à un doute nommé (§7).
- **Provenance** : écrit par PAROXYSME (`claude-opus-5-5`, effort max) le 2026-10-07 à partir de 17:1x UTC, tâche 1 du tableau MONARK ↔
  PAROXYSME. Sources : les inventaires validés du Harnais et du Moteur (dossier d'étude du 2026-10-06), la couverture de
  `CHANTIERS-CANDIDATS.md` §4 et les fenêtres du plan v3 §4 (chemins et empreintes au §8). Relecture : une G2 par une instance neuve ;
  contrôle par diff, fusion et ligne d'ETAT : MONARK. Versé au tronc par #242, fusion `1df4e44f` (ETAT l.181-186 à `5437cd0d`).
  Décisions de MONARK pliées le 2026-10-07 (PR `paroxysme/registres-decisions-1007`), à partir de 20:0x UTC, par un worker de
  PAROXYSME (`claude-opus-5-5`, effort max) ; sources du pli : ETAT à `5437cd0d`, MSG et MSG2 (§8). Constats de la G2 de ce pli
  (instance neuve) pliés le 2026-10-07 à partir de 21:0x UTC par un worker de PAROXYSME (`claude-opus-5-5`, effort max). Second tour :
  constats d'une relecture par lentilles reproduits à `beea9834` et pliés le 2026-10-08 à partir de 01:20 UTC (`date -u`) par un worker
  de PAROXYSME (`claude-opus-5-5`, effort max) : parties touchées : en-tête, §1, PX-Harness-04, -22, -24, -26, MK-C13, §7 (doutes 2 et
  3), §8 ; pli réparé à 03:05 UTC (`date -u`) par un worker de PAROXYSME (`claude-opus-5-5`, effort max) après vérification adverse : PX-Harness-22, MK-C13.
- **Bases** : l'inventaire du Harnais est mesuré à `d8fe354c` et lit ETAT à `57a131fc` (INV-H l.9) ; celui du Moteur prend tout à
  `57a131fc` (INV-M l.12). Toutes les ancres du versement sont à la tête `87b821b0` de `lot/etude-suite` (relue par `git ls-remote`
  le 2026-10-07 à 17:1x UTC). Elles sont reportées par l'outil `reanchor.mjs` (pièce de la boîte PAROXYSME), puis relues à la tête par
  `git show 87b821b0:<fichier> | sed -n` : la version du commit `d2332e2` ne vérifiait pas qu'une ligne existe (G2, constat 38) ; la
  version corrigée (commit `a55a62d`, cas rouge puis vert) refuse une ligne hors du fichier. Ce qui a bougé est nommé au §7, doute 7.
  Le pli des décisions cite ETAT à `5437cd0d` (« ETAT l.N à `5437cd0d` », relu par `git show 5437cd0d:docs/ETAT.md | sed -n`), MSG
  (« MSG l.N ») et MSG2 (« MSG2 l.N ») ; le second tour cite aussi MSG3 (« MSG3 l.N », message `0c8fb24`, §8).
- **Préséance** : `docs/ETAT.md` l.7-11 ; ETAT prime. Un item nommé hors d'ETAT et du code n'est pas compté comme formé : il est écrit
  « à former » et porté par son chantier.
- **Labels** : aucun ne change (`built` du Backbone et du Harness, `README.md:94`, `:96` ; aucune ligne kata servie,
  `docs/public-notes/v0.9.0.md:26`) ; `apps/site/lib/fleet.ts` n'est pas touché par ce versement.

## 0. Comment lire ce registre

- **Une entrée par limite**, ouverte par le préfixe `- **`, sur quatre lignes logiques (limite ; source, touche et nature ; item, porteur
  et déclencheur ; état et suite), coupées en lignes de 160 caractères au plus avec un retrait (forme de `docs/PAROXYSME-Dojo.md` §0).
- **Étiquettes** : celles des inventaires, inchangées : `PX-Harness-nn` et `C-nn` (inventaire du Harnais), `MK-Lnn` et `MK-Cnn`
  (inventaire du Moteur) ; `HT-nn` numérote les limites trouvées à la tête (§5). Ce sont des numéros de ligne de registre, jamais des
  items, et aucune n'apparaît dans un champ « item ».
- **Champs** : limite (25 mots au plus) ; source (fichier et ligne à `87b821b0`) ; touche (texte public que la limite qualifie) ; nature ;
  item ; porteur ; déclencheur ; état ; suite.
- **Natures** (celles des inventaires) : T théorie · M mesure · D donnée · P dépendance · Dr droit · C capacité ; « texte » : une phrase
  publique.
- **Item, porteur, déclencheur** (règles acceptées par MONARK, message `07d99e2` de la boîte, qui répond à `d4b3d07`) :
  - un item formé à ETAT est cité avec sa ligne à la tête, et garde le porteur et le déclencheur qu'ETAT lui écrit ;
  - une limite que `CHANTIERS-CANDIDATS.md` §4 rattache à un chantier prend ce chantier pour item de porteur (`PXC-nn`, sa partie, et
    l'item que la partie forme) ; porteur : PAROXYSME, qui porte les chantiers (TABLEAU de la boîte, décision de MONARK du 2026-10-07),
    MONARK gardant l'ordre et l'attribution ; déclencheur : la partie et sa fenêtre au plan v3 §4 ;
  - les deux sont écrits quand les deux existent.
- **Fenêtres du plan v3 §4** : F1 = §4.1, semaine du 2026-10-07 ; F2 = §4.2, du 2026-10-14 au service de la vague 1 (vers le
  2026-10-20) ; F3 = §4.3, du 2026-10-21 au 2026-11-16 ; F4 = §4.4, du 2026-11-17 au 2026-12-31 ; F5 = après le 2026-12-31, avec ligne
  d'attente datée au versement (plan §4.4, dernier alinéa).
- **États** : `ouvert` ; `changé` (l'état à la tête diffère de l'inventaire, dit en suite) ; `clos (preuve : …)`.
- **Abréviations** : ETAT = `docs/ETAT.md` ; ADR-CM = `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` ; CC = `CHANTIERS-CANDIDATS.md` ;
  PLAN = `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` ; INV-H et INV-M = inventaires du Harnais et du Moteur (lignes du fichier) ; C, K, 0005,
  0006, addN, A-2, F9, FORMAT = sources du dépôt de RECHERCHES (`kata/spec/CONTRACT-1.1.0.md`, `kata/spec/KATA-SPEC.md`,
  `decisions/0005-…`, `decisions/0006-…` et ses addenda, `decisions/0004-ADR-amendment-A-2-import-guard.md`,
  `decisions/0006-F-W2-9-serial-dependence-finding.md`, `kata/registry/FORMAT.md` ; INV-M §0) ; « rapport de la vague 1 » =
  `kata/registry/wave1-report.md` du même dépôt. Toutes sont citées par la ligne que l'inventaire a lue, non relues ici (§7, doute 1).

## 1. Dettes : limites sans item, sans porteur ou sans déclencheur

- **Aucune.** Les trois dettes de déclencheur du versement (PX-Harness-28 ; HOST-REDEPLOY-GUARD-1 et HOST-HARNESS-PREV-1, dites par
  PX-Harness-22) sont re-formées par MONARK, avec porteur et déclencheur (entrées du §2). Le déclencheur de F-K-7 (MK-L15) attendait
  une décision au G0 court d'E-2a, accepté sans qu'elle soit consignée à ETAT ; non compté au versement, il est re-porté par MONARK (ETAT l.260
  à `5437cd0d` ; §7, doute 9).
- **Question formée à MONARK.** La re-formation à ETAT de SENTINEL-DEPLOY-GUARD-1 (PX-Harness-04) et de SYNC-CHECK-MODE-1
  (PX-Harness-26) avait pour déclencheur le prochain point d'étape (PX-STD-ORPHAN-1, PLAN l.541, l.897-898) ; il est passé sans acte,
  et les deux restent absents d'ETAT à `5437cd0d` (§7, doute 3). Re-port à demander à MONARK dans la demande de fusion de #245 (porteur
  de la demande : PAROXYSME ; de la ligne d'ETAT : MONARK ; échéance proposée : son commit d'ETAT de cette fusion, MSG3 l.9-10) ; autre
  route, au choix de MONARK : PXC-01 partie 2 (CC l.97).
- Toutes les entrées ouvertes des §2, §3 et §5 portent un item, un porteur et un déclencheur atteignable, jugé à la lecture de chaque
  entrée. De ces trois champs, l'oracle (§7, doute 5) ne contrôle que la présence : non vides et non « aucun » (`verify-registres.mjs`
  l.6, commit `d97d838`) ; il ne juge pas qu'un déclencheur est atteignable : MK-L15 lui avait échappé, comme le point d'étape passé
  de PX-STD-ORPHAN-1 (§7, doute 3).

## 2. Harness : limites ouvertes, changées ou nouvelles (28, INV-H §3)

- **PX-Harness-01** · « Version servie 0.4.0 sous la release publique v0.9.0 ; la règle du code (bump avec le tag) n'est pas tenue. »
  source : `apps/harness/src/version.ts:5-7`, `:22` ; `apps/site/data/harness-served.json:5`, `:126-132` ; `docs/JOURNAL-PROVENANCE.md:447` ·
    touche : `README.md:65`, `:285` ; `SECURITY.md:27-30` ; `apps/site/app/docs/integrators/page.tsx:68` · nature : C
  item : PXC-16 HARNESS-NEXT-1, partie 2 (HARNESS-VERSION-ALIGN-1, à former ; question Q-H1 à la partie 1) · porteur : PAROXYSME ;
    republication au registre MCP : le fondateur (acte de compte, par MONARK) · déclencheur : Q-H1 en F2 ; release de textes servis (F3)
  état : ouvert (aggravé à T0) · suite : octets servis déplacés (OpenAPI, notes datées, CA, synchro) ; aucune release pendant le service
    d'une vague (PLAN §4, contrainte (iv))
- **PX-Harness-02** · « Le README dit six contrats (« six today ») là où trois autres lignes en disent huit. »
  source : `README.md:175` contre `:20`, `:94`, `:245` ; `packages/contracts/package.json:6` (quatre contrats énumérés) ·
    touche : `README.md:175` (critère de maturité) · nature : texte
  item : PXC-02 PUBLIC-SENTENCES-2 : README-CONTRACT-COUNT-1 (à former) au noyau, partie 1 ; `package.json:6` à la partie 2 · porteur :
    PAROXYSME · déclencheur : tâche 2 du TABLEAU (ADR de PXC-02 et noyau, F1) ; partie 2 en F3 ; publication : release du miroir (acte)
  état : ouvert · suite : même limite que MK-L36 ; un seul bornage
- **PX-Harness-03** · « (a) Le README décrit un corps 500 à quatre champs que le serveur ne rend pas ; (b) la forme du 500 de transport n'est pas gelée. »
  source : `apps/harness/src/http.ts:108`, `:114` ; `apps/harness/src/server.ts:174` ; C l.518 ; `docs/G7-lot-transport-500-schema-1.md:76` ·
    touche : `README.md:258` (contrat ToolError) · nature : T/C
  item : (a) PXC-02 noyau, partie 1 (README l.258 décrit le 500 servi, PLAN §5.1) ; (b) PXC-16 partie 3 (TRANSPORT-ERROR-DEF-1, à former :
    `$defs/TransportError`) · porteur : PAROXYSME · déclencheur : (a) tâche 2 du TABLEAU (F1) ; (b) bascule 1.2.0 après le 2026-11-16 (F4)
  état : ouvert · suite : (b) suit la politique de version de PX-Harness-25
- **PX-Harness-04** · « La sentinelle tourne dans l'arbre du harnais ; redéployer le harnais change sa fermeture d'exécution sans garde ni témoin. »
  source : `deploy/monark-sentinel.service:18`, `:39` ; `apps/sentinel/src/timeline.ts:16` ; `apps/sentinel/src/run.ts:155-161` ;
    `docs/JOURNAL-PROVENANCE.md:445` · touche : `README.md:66`, `:119-120` · nature : C/P · ⚑B
  item : SENTINEL-DEPLOY-GUARD-1 (absent d'ETAT à `5437cd0d` ; sa re-formation par PX-STD-ORPHAN-1 attendait le point d'étape, passé
    sans acte ; re-port à demander à MONARK : §1 ; §7, doute 3) ; construit par PXC-05 partie 1, PR 2 · porteur : PAROXYSME (chantier ;
    la demande de re-port) ; MONARK (ligne d'ETAT, RUNBOOK-HARNESS-SENTINEL-DIFF-1) · déclencheur : PR 2 fusionnée avant le SHA nommé
    d'E-2a (F1-F2) ; re-port : le commit d'ETAT de MONARK à la fusion de #245 (proposé, MSG3 l.9-10), ou PXC-01 partie 2 (F3, CC l.97)
  état : ouvert (réalisé à T0) · suite : sinon commande de diff de la fermeture avant le déploiement de la vague 1 (PLAN §4 (iv))
- **PX-Harness-05** · « Aucune sonde continue de `mcp.` et `api.` : ni disponibilité ni latence de queue mesurées. »
  source : `docs/RUNBOOK-harness.md:157-214` (CA au déploiement seulement) ; `deploy/monark-probe.service:9`, `:24` ;
    `.github/workflows/ci.yml:18-19` · touche : `README.md:61` (« Everything below is live ») · nature : M/C
  item : PXC-05 SERVED-CONTROL-1, partie 3 (HARNESS-LIVE-PROBE-1, à former ; Chandra-Toueg et Dean-Barroso [lu], INV-H l.112-113) ·
    porteur : PAROXYSME ; acte sur l'hôte : MONARK sous go · déclencheur : partie 3 de PXC-05 (F3)
  état : ouvert · suite : la même sonde porte la mesure de MK-L40 et la veille de PX-Harness-23
- **PX-Harness-06** · « Point d'accès public sans compte ni admission par client ; disponibilité sous abus : aucune borne revendiquée. »
  source : `deploy/monark-harness.service:20-29`, `:62-72` ; `deploy/Caddyfile.monark-harness:10-17` ; `apps/harness/src/server.ts:38-44` ·
    touche : `README.md:61`, `:294` · nature : C/T
  item : PXC-16 partie 1 (recherche HARNESS-ADMISSION-1, à former : 429 et `Retry-After`, seau à jetons ou limite de Caddy) · porteur :
    PAROXYSME ; lectures sur place (RFC 6585, RFC 9110, documentation Caddy) : MONARK · déclencheur : partie 1 de PXC-16 (F2)
  état : ouvert · suite : prix estimé par l'inventaire : 2,5 j-h (INV-H l.39) ; la partie qui construit est fixée par l'ADR de PXC-16
    (§7, doute 8) ; R-8 si une dépendance entre
- **PX-Harness-07** · « Provenance du servi non publiée : rien ne relie le processus servi au source public, hors empreintes de surface. »
  source : `docs/JOURNAL-PROVENANCE.md:445`, `:447` ; `apps/harness/src/http.ts:58-59` ; `docs/public-notes/v0.9.0.md:3` ·
    touche : `README.md:61` ; `apps/site/app/docs/verify/page.tsx:67` · nature : T/C
  item : PXC-11 THIRD-PARTY-1, partie 2 (HARNESS-SERVED-PROVENANCE-1, à former : commit public et empreinte du verrou servis, contrôlés par
    la CA ; SLSA v1.2, in-toto) · porteur : PAROXYSME · déclencheur : partie 2 de PXC-11 (F3)
  état : ouvert · suite : ordre des actes de release écrit par l'ADR de PXC-11
- **PX-Harness-08** · « Aucun vérificateur côté lecteur d'une décision : la recomputation du §11 de la spécification reste une procédure en prose. »
  source : C l.14, l.451-497 ; `README.md:217-234` ; `apps/site/app/docs/verify/page.tsx:169` ·
    touche : `apps/site/app/docs/verify/page.tsx:67` ; `README.md:61` · nature : C/T
  item : PXC-11 partie 2 (GATE-VERIFY-CLI-1, à former : implémentation indépendante du §11, sans `@monark/hikae`, oracle des vecteurs) ·
    porteur : PAROXYSME · déclencheur : partie 2 de PXC-11 (F3)
  état : ouvert · suite : aucune
- **PX-Harness-09** · « La CA engagée (15 contrôles) ne joue sur l'hôte servi ni le chemin kata, ni le refus 1.0.0, ni `policy_table_sha256`. »
  source : `docs/deploy-CA-harness.json:4` (15 contrôles, 2026-10-06T05:42:44.278Z) ; `scripts/verify-harness.mjs:20`, `:152-153` (18 au
    code, `4c16ea0`, #225) ; `docs/RUNBOOK-harness.md:159`, `:186-188`, `:214`, `:481` · touche : `README.md:179-180` (critère 4) · nature : M
  item : CA-1-1-0-CHECKS-1 (inventaire ; construit au code) par PXC-05, partie 2, volet kata (F2) ; à ETAT : KATA-CA-PUBLISHED-TABLES-1
    (l.824-827) et la précondition (xii) de T_f(c) (l.110-112 : `harness-served.json` doit dire 18 contrôles) · porteur : MONARK (CA
    engagée, acte d'hôte ; précondition (xii)) ; RECHERCHES (KATA-CA-PUBLISHED-TABLES-1) ; PAROXYSME (volet kata de PXC-05 p2) ·
    déclencheur : la première CA engagée à 18 contrôles, au prochain déploiement (MONARK, `07d99e2`) ; KATA-CA-PUBLISHED-TABLES-1 : avant T_f(c)
  état : changé (preuve partielle : essai de MONARK du 2026-10-07 sur le tronc `8411a2d4`, 18 sur 18, `checked_at` 12:56:15Z, non engagé,
    §7 doute 6) · suite : la CA engagée reste à 15 contrôles jusqu'aux actes 2 à 6 de la release L (`07d99e2`)
- **PX-Harness-10** · « Jauge de demande D8 indécidable telle que déployée : le journal ne voit pas l'outil appelé sous `/mcp`. »
  source : `docs/adr/ADR-M015-phase-portefeuille.md:150-151`, `:154` ; `deploy/Caddyfile.monark-harness:26-28` ;
    `docs/adr/ADR-M006-skills-distribution.md:49` · touche : garde de Genkan (`README.md:43`) · nature : M
  item : PXC-16 partie 1 (HARNESS-DEMAND-J30-1, à re-former ; question Q-H2 : propriétaire unique Harness du comptage par classe) ·
    porteur : PAROXYSME ; lecture du journal sur l'hôte : MONARK · déclencheur : lecture D8 le 2026-10-18 (J+30), en F2
  état : changé (D8 datée, absente d'ETAT) · suite : absorbe PX-Narabi-15 sous Q-H2 (INV-H l.99) ; Dwork-Roth est libre (PLAN §7.1) :
    lecture, pas procurement
- **PX-Harness-11** · « La fenêtre « après » de la mesure BYO-400 contient deux changements servis ; les 400 de B-0 et B-1 ne sont plus attribuables. »
  source : ETAT l.1458-1463 ; ETAT l.1570 (étape 4, 2026-10-04T07:44:08Z) ; `docs/JOURNAL-PROVENANCE.md:445` (bascule 1.1.0) ;
    `SECURITY.md:46-48` · touche : aucune · nature : M
  item : HARNESS-BYO-400-RATE-1 (ETAT l.1458-1463 ; côté MONARK, l.1544) ; amendement en trois sous-fenêtres, écrit (ETAT l.1607-1614
    à `5437cd0d` : texte de PAROXYSME, retenu tel quel) · porteur : MONARK (lecture sur l'hôte, MSG l.58-59) · déclencheur : la lecture le
    2026-10-10 après 22:34 UTC (ETAT l.1462-1463)
  état : changé (par T0 ; amendement écrit) · suite : sous-fenêtres [03 22:33:46Z, 04 07:44:08Z), [04 07:44:08Z, 06 05:42Z), [06 05:42Z,
    10 22:34Z) (INV-H l.44) ; la borne de la relance de T0 se lit à la seconde dans le journal du service (ETAT l.1612-1613 à `5437cd0d`) ;
    compte par code impossible sans PX-Harness-10
- **PX-Harness-12** · « Le harnais ne déclare aucune annotation d'outil MCP, que le SDK servi accepte ; la prémisse de l'ADR est fausse. »
  source : `apps/harness/src/tools/registry.ts:141-147` ; `docs/adr/ADR-M005-harnais-mcp-appelable.md:159` ; SDK `@modelcontextprotocol`
    2.0.0 [lu] (INV-H l.45) · touche : `README.md:65` ; `skills/monark/SKILL.md:9` · nature : P/C
  item : PXC-16 partie 2 (HARNESS-TOOL-ANNOTATIONS-1, à former ; test sur `tools/list`) · porteur : PAROXYSME ; go du fondateur (octets de
    `tools/list` déplacés) · déclencheur : release de textes servis (F3)
  état : changé · suite : réserve du SDK à écrire : un client ne décide pas sur l'annotation d'un serveur non fiable (INV-H l.45)
- **PX-Harness-13** · « Révision MCP négociée « 2025-11-25 » contre 2026-07-28 nommée par l'ADR, écart déclaré « annotation seule ». »
  source : `docs/adr/ADR-M005-harnais-mcp-appelable.md:113-114`, `:188-189` ; `fixtures/h5-e2e-trace.json` ; SDK [lu] (INV-H l.46) ·
    touche : aucune · nature : P
  item : PXC-16 partie 1 (MCP-PROTOCOL-REVISION-1, à former) · porteur : PAROXYSME ; lecture sur place de la révision : MONARK (PLAN §7.2) ·
    déclencheur : partie 1 de PXC-16 (F2)
  état : ouvert · suite : la propriété sans état est mesurée (INV-H l.46)
- **PX-Harness-14** · « `Host` illisible rend un 500 ; flux sans écouteur `error` ; corps ajouté à un corps commencé. »
  source : `apps/harness/src/server.ts:168`, `:172-175` ; `docs/G7-lot-transport-500-schema-1.md:120` (N-6) ·
    touche : `README.md:258` (forme des 500) · nature : C
  item : PXC-16 partie 1 (HARNESS-TRANSPORT-CATCH-1, nommé au G7, absent d'ETAT : à porter à ETAT par MONARK, PXC-01) · porteur :
    PAROXYSME ; inscription à ETAT : MONARK · déclencheur : partie 1 de PXC-16 (F2)
  état : ouvert · suite : ligne de changement servi si un octet servi bouge
- **PX-Harness-15** · « Résidus de la projection des schémas laissés par défaut, et gel profond des constantes ouvert ; « laisser » demande l'option B datée. »
  source : ETAT l.1190 ; `docs/G7-lot-schema-projection-fail-closed-1.md:153-168` ; `docs/G7-lot-transport-500-schema-1.md:77` ·
    touche : `README.md:274-277` (schémas fermés) · nature : C
  item : DYNAMIC-ELSEWHERE-1, NESTED-ID-ELSEWHERE-1, DEFINITIONS-KEYWORD-1, UNKNOWN-KEYWORD-OBJECTS-1 (ETAT l.1190, défaut « laisser ») et
    N-5 de C′ (gel profond des constantes, G7 l.168, à former) ; option B et N-5 par PXC-16 partie 1 · porteur : PAROXYSME · déclencheur :
    partie 1 de PXC-16 (F2), ou le premier lot qui touche `apps/harness/src/schema-projection.ts`, le premier des deux
  état : ouvert · suite : option B ≈ 14 lignes de code et 23 de test (G7 l.158-167, somme des quatre) ; N-5 sans prix au G7 ; aucun octet servi
- **PX-Harness-16** · « Des imitations ASCII hors réduction passent la garde des noms BYO ; homoglyphes non ASCII par appel direct ; faux refus déclarés. »
  source : `docs/G7-lot-d-3.md:94-96` ; ADR-CM l.182 (B-10), l.231-232 ; ETAT l.1538-1542, l.1553-1555 · touche : `skills/monark/SKILL.md:72` ;
    codes `byo_*` (C §13) · nature : C/T
  item : BYO-LOOKALIKE-RESIDUAL-1 et BYO-HOMOGLYPH-1 (ADR-CM l.231-232 ; nommés à ETAT l.1542, l.1555) · porteur : RECHERCHES (ADR-CM
    l.231-232 ; ETAT l.1538-1542) · déclencheur : RESIDUAL : (a) le plan de CM-4 (B-14 élargit le motif kata réservé), (b) plus tôt, une
    imitation résiduelle observée dans un appel BYO réel ou rapportée par un tiers (non tiré) (ADR-CM l.231) ; HOMOGLYPH : tout
    élargissement du motif `^[ -~]+$` de `schemas/prediction.schema.json`, ou tout consommateur de `runGate` hors des points d'entrée
    HTTP et MCP (ADR-CM l.232)
  état : ouvert · suite : prix de HOMOGLYPH : ≈ 60 lignes de code et 80 de test, une ligne B neuve, go du fondateur (ADR-CM l.232) ;
    BYO-ASCII-LOOKALIKE-1 est construit (B-10, ADR-CM l.182) ; PXC-16 en porte la lecture de UTS #39 (F2) ; même limite que MK-L31
- **PX-Harness-17** · « Le chemin kata est servi sans aucune ligne : 32 classes s'abstiennent toujours. »
  source : C l.503 ; `apps/harness/src/tools/gate.ts:231-238` ; `docs/G7-lot-retire-path-ra.md` (Mesures) · touche : `skills/monark/SKILL.md:72` ;
    description servie de `gate` · nature : D/C
  item : chemin des vagues à ETAT : E-2a (G0 court accepté, l.107-109) ; RETIRE-LISTS-E2A-PIPE-1 (l.947-955) ; KATA-CLAUSE-COMMITTED-STATE-1
    (l.807-811) ; VERIFIERS-LIST-F5A-1 (l.567-590) ; SHORT-DIGEST-INVERSION-1 (l.599-613) ; RETIRE-LATENCY-REHEARSAL-1 (l.1020-1024) ·
    porteur : RECHERCHES (lots d'E-2a, RETIRE-LISTS-E2A-PIPE-1, KATA-CLAUSE-COMMITTED-STATE-1) ; MONARK (VERIFIERS-LIST-F5A-1, ligne Z-3,
    RETIRE-LATENCY-REHEARSAL-1) · déclencheur : RETIRE-LISTS : le lot b1 d'E-2a (l.951-952) ; KATA-CLAUSE : le premier chargement d'une ligne
    kata engagée (l.811) ; VERIFIERS : la première table publiée dont une ligne porte `recompute` (l.569-571) ; REHEARSAL : maintenant (l.1022)
  état : changé (R-b fusionnée, l.1764-1766 ; plancher d'empreinte construit, l.605-613 ; R25-REGISTRY-ROOT-1 PR 2 faite, l.1129-1133) ·
    suite : vague 1 vers le 2026-10-20, vague 2 visée au 2026-11-16 (ETAT l.26-32) ; go de service distinct (Q-F5) ; vague 2 : FORMAT-W2
    figé, reste sa ligne P0-2 (MONARK, go du fondateur, ETAT l.844-849)
- **PX-Harness-18** · « La porte ne recompute pas la valeur kata et ne contrôle pas les barres derrière `features_digest`. »
  source : C l.343 · touche : spécification publiée, §9 · nature : T/P
  item : KATA-INPUT-RECOMPUTE-1 (ETAT l.747-749) ; PXC-13 K8-CALLER-INPUT-1, partie 3 · porteur : RECHERCHES (spécification et code),
    MONARK (version et déploiement), selon ETAT · déclencheur : le G0 de la prochaine version du contrat (ETAT l.748-749), en F4
  état : changé (item formé à ETAT depuis l'inventaire) · suite : prix écrit à ETAT : une version du contrat, 3 à 5 j
- **PX-Harness-19** · « Les lignes kata ne sont pas recomputables par un tiers : scores ni publiés ni tenus ; séries non redistribuables. »
  source : C l.490-495 ; A-2 l.135 ; ETAT l.242-245 · touche : C §11 ; `apps/site/app/docs/verify/page.tsx:67` · nature : D/Dr
  item : PXC-11 partie 3 (formée à ETAT l.231-234 à `5437cd0d` pour l'attaquant « A » ; KATA-THIRD-PARTY-RECALC-1, à former, CC l.375,
    l.394, nommé KATA-ROW-PUBLIC-RECOMPUTE-1 par INV-H l.52 : un seul item, un seul propriétaire au versement, CC l.658) ; partiel :
    VERIFIERS-LIST-F5A-1 (ETAT l.567-590) · porteur : PAROXYSME ; droit de publication des scores dérivés : le fondateur (PLAN §7.3) ·
    déclencheur : partie 3 de PXC-11 (F3), le droit d'abord
  état : ouvert · suite : Q-B (v) (« oui », 2026-10-07, ETAT l.55-56 à `5437cd0d`) couvre le service public d'un étalonnage, pas la
    redistribution des séries ni la publication des scores (PLAN l.893) ; même construction que MK-L11
- **PX-Harness-20** · « Le retrait d'une ligne servie attend la clôture du trimestre ; premier retrait `live:` après le 2027-01-01. »
  source : addendum 9 §6-§7 ; ETAT l.533-542, l.956-971 · touche : aucune aujourd'hui ; bornera la vague 1 servie · nature : T/M
  item : PXC-10 CM-5-RETIRE-1, partie 2 (KATA-ANYTIME-RETIRE-1, à former, nommé ANYTIME-RETIRE-1 par INV-H l.53 : un seul item) ; à ETAT :
    CM-5-PLAN-1 (l.533-537), RETIRE-EVIDENCE-BIND-1 (l.965-967), RETIRE-ADR-CAUSE-FILE-1 (l.968-971), RETIRE-CHILD-ROW-1 (l.956-964) ·
    porteur : PAROXYSME (partie 2) ; CM-5-PLAN-1 : RECHERCHES (c3 et c4), oracles d'hôte à MONARK (l.534-537) ; les trois RETIRE-* :
    MONARK · déclencheur : partie 2 de PXC-10 (F4) ; CM-5-PLAN-1 : T0, atteint, G0 de CM-5 écrit (l.538, l.543) ; EVIDENCE : le premier
    retrait `live:`, pas avant le 2027-01-01 ; ADR-CAUSE : la première liste à cause `adr:` ; CHILD-ROW : le G0 court d'E-2b (l.961-962)
  état : changé (partage de CM-5 daté, ETAT l.535-537 ; déclencheur de RETIRE-CHILD-ROW-1 changé, l.961-964) · suite : même construction
    que MK-L21
- **PX-Harness-21** · « Un appel tardif de 300 s au plus est servi ; rien ne vérifie qu'il est fait sans information sur le mouvement. »
  source : `apps/harness/src/tools/gate.ts:212`, `:237` ; ADR-CM l.328, l.331 · touche : clause kata servie (`gate.ts:237`) · nature : M
  item : LATE-CALL-WINDOW-1 (ETAT l.775-778 ; ADR-CM l.331, ligne datée (15)) ; DECIDED-AT-1 se rouvre avec lui (ETAT l.828-831) ; PXC-13
    partie 2 (F3) pour l'ADR K-8 · porteur : MONARK (la mesure, acte d'hôte) ; RECHERCHES (le texte si la borne change) ; PAROXYSME
    (PXC-13 p2) · déclencheur : le service de la vague 1 (ADR-CM l.331)
  état : changé (qui mesure et qui écrit : ligne datée (15) de l'ADR-CM ; prix à ETAT l.740-741 : mesure 0,25 j, version 3 à 5 j si la
    borne change) · suite : même limite que MK-L16
- **PX-Harness-22** · « Hygiène de l'hôte : garde de redéploiement procédurale, arbres et sauvegardes accumulés. »
  source : ETAT l.1259-1261, l.1464-1473, l.902-905 ; PLAN l.478-480, l.589-590 · touche : aucune · nature : C
  item : HOST-REDEPLOY-GUARD-1 (ETAT l.1259-1261 ; ligne datée, ETAT l.1401-1404 à `5437cd0d`) : garde de procédure au runbook du
    prochain déploiement du harnais (release L, sous Q-20), garde mécanique en PXC-05 partie 2 ; HOST-HARNESS-PREV-1 (l.1464-1473 ; ligne
    datée, ETAT l.1625-1627 à `5437cd0d`) : la suppression, acte du fondateur porté par MONARK (ETAT l.274-275 à `5437cd0d`), et la suite
    (garde de nettoyage) en PXC-05 partie 3 ; SITE-SEND-PRUNE-1 (l.902-905) : PXC-05 partie 3 (ETAT l.255 à `5437cd0d`) · porteur : MONARK
    (items d'ETAT, runbook, actes d'hôte, question au fondateur) ; le fondateur (toute suppression) ; PAROXYSME (parties de PXC-05) ·
    déclencheur : REDEPLOY : le prochain déploiement du harnais, la release L (ETAT l.1403 à `5437cd0d`), sous l'autorisation Q-20
    (ETAT l.64-66 à `5437cd0d`) ; garde mécanique : p2 (F2-F3) ; PREV : la question, que MONARK pose au fondateur à son prochain point
    d'étape avec lui, au plus tard avant le déploiement de la release L (MSG2 l.6-8) ; garde de nettoyage : p3 (F3) ; PRUNE : PXC-05 p3 (F3)
  état : changé (REDEPLOY et PREV : déclencheurs d'ETAT, l.1261 et l.1469, passés à T0 sans acte, `docs/JOURNAL-PROVENANCE.md:445` ;
    REDEPLOY : dette de MONARK, re-formée par sa ligne datée, ETAT l.1401-1404 à `5437cd0d` ; PREV : la ligne datée (ETAT l.1625-1627 à
    `5437cd0d`) dit la construction « acte du fondateur, porté par MONARK avec la liste relevée » et place la suite en PXC-05 p3, sans déclencheur neuf (ETAT
    l.1620 à `5437cd0d` garde « le prochain déploiement du harnais ») ; le déclencheur de PREV est fixé par MONARK en MSG2 l.6-8, non écrit
    à ETAT à `5437cd0d`) · suite : avant tout acte, le SHA servi est relu et comparé à la base attendue (ETAT l.1403-1404 à `5437cd0d`) ;
    PLAN l.478-479 plaçait la garde de procédure en PXC-05 p1 ; ETAT prime ; la réponse du fondateur sur PREV sera écrite verbatim sous
    l'item à ETAT (MSG2 l.8)
- **PX-Harness-23** · « Aucun audit planifié des dépendances de l'arbre servi ; l'audit ne tourne qu'en CI de PR. »
  source : `.github/workflows/ci.yml:18-19`, `:243-244` ; `apps/harness/package.json:12` (SDK 2.0.0 épinglé) · touche : `SECURITY.md:27-30` ·
    nature : P
  item : PXC-05 partie 3 (HARNESS-DEP-WATCH-1, à former, avec la sonde continue) · porteur : PAROXYSME · déclencheur : partie 3 de PXC-05 (F3)
  état : ouvert · suite : la sonde est celle de PX-Harness-05 ; CI-WORKFLOWS-SET-1 si la veille passe par GitHub Actions
- **PX-Harness-24** · « Le commentaire du journal d'accès dit « route, hôte, méthode, statut » ; `SECURITY.md` dit qu'il garde l'adresse du client. »
  source : `deploy/Caddyfile.monark-harness:27-28` ; `SECURITY.md:46-47` · touche : `SECURITY.md:43-48` ; `README.md:294` · nature : Dr/texte
  item : PXC-02 partie 2 (commentaire aligné) ; PXC-18 JURISTE-DROIT-1, partie 1 (avis, sous-question au dossier juriste) · porteur :
    PAROXYSME ; FAITS sur les champs du journal de Caddy : MONARK (lecture sur place) ; JURISTE-ACTE-NOV-1 (formé à ETAT l.252-253 à
    `5437cd0d`) : le fondateur, par MONARK · déclencheur : parties en F3 ; l'acte du juriste en novembre 2026 (ETAT l.253 à `5437cd0d` ;
    PLAN §7.3)
  état : ouvert · suite : aucun avis au point d'accès (l'avis de `/bell/privacy` vise « this website », INV-H l.57)
- **PX-Harness-25** · « Une seule version parlée, préavis nul pour 1.1.0 : sans règle écrite, la version suivante cassera les appelants le jour même. »
  source : C l.20, l.584 ; `docs/public-notes/v0.9.0.md:8` · touche : spécification §15 · nature : Dr/T
  item : PXC-16 partie 1 (question fermée Q-H3 : préavis, recouvrement, ou préavis nul écrit) ; PXC-18 partie 2 (mise par écrit de la
    décision, format P-26) · porteur : PAROXYSME (la question) ; le fondateur (la décision, par MONARK) · déclencheur : la question en F2 ;
    la décision avant la release de textes servis (PLAN l.595-596, l.889), en F3 ; l'écrit en F4
  état : ouvert · suite : la décision précède la bascule 1.2.0
- **PX-Harness-26** · « La capture servie du site n'a pas de mode `--check` : un redéploiement sans synchro n'est vu par aucun contrôle non-LLM. »
  source : `scripts/sync-harness-served.mjs` (aucun `--check`) ; `test/harness-served.test.ts:210` · touche : `README.md:70` · nature : M/C · ⚑B
  item : SYNC-CHECK-MODE-1 (absent d'ETAT à `5437cd0d` ; sa re-formation par PX-STD-ORPHAN-1 attendait le point d'étape, passé sans
    acte ; re-port à demander à MONARK : §1 ; §7, doute 3) ; construit par PXC-05 partie 1, PR 1 · porteur : PAROXYSME (chantier ; la
    demande de re-port) ; MONARK (ligne d'ETAT) · déclencheur : PR 1 de PXC-05 partie 1 (F1, tâche 4 du TABLEAU ; après la décision
    P-28) ; re-port : le commit d'ETAT de MONARK à la fusion de #245 (proposé, MSG3 l.9-10), ou PXC-01 partie 2 (F3, CC l.97)
  état : ouvert · suite : si le débit ne tient pas, la PR 1 glisse après le service de la vague 1 (PLAN §4.0)
- **PX-Harness-27** · « Le skill ne renvoie pas aux fichiers Bell que le README promet aux agents ; note kata 15m absente d'ETAT. »
  source : `docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md:299` (R-11) ; `docs/G7-lot-surfaces-1-1-0.md:107` · touche : `README.md:238-243` ;
    `skills/monark/SKILL.md:72` · nature : C/texte
  item : PXC-02 partie 2 (skill) ; R-11 et SKILL-KATA-15M-NOTE-1 à re-former à ETAT par PXC-01 (CC l.96-99) · porteur : PAROXYSME ; lecture
    sur place des listes publiques (registre MCP, ClawHub) : MONARK ; republication : le fondateur (acte de compte) · déclencheur :
    partie 2 de PXC-02 (F3) ; re-formation : PXC-01 partie 2 (F3)
  état : ouvert · suite : aucune
- **PX-Harness-28** · « La garde de port des tests est lexicale : nom calculé, alias, `PORT=0`, dgram lui échappent. »
  source : ETAT l.482-485 · touche : aucune · nature : C
  item : LOOPBACK-GUARD-RUNTIME-1 (ETAT l.482-485) · porteur : RECHERCHES (ETAT l.485 ; ETAT l.622 à `5437cd0d`) · déclencheur : le G0 du
    prochain lot qui ajoute un test à socket sous `apps/harness/test/`, au plus tard le G0 court d'E-2b (ligne datée de MONARK, ETAT
    l.623-624 à `5437cd0d`)
  état : changé (l'ancien déclencheur, « après CM-3c », ETAT l.485, était atteint sans acte : C′ 3c-4a et 3c-4b fusionnés, ETAT l.103-104 ;
    re-formé par MONARK) · suite : garde d'exécution chargée par `--import` ; prix mesuré à son G0 (ETAT l.485)

## 3. Moteur 1.1.0 et katas : limites ouvertes (40, INV-M §3)

- **MK-L01** · « L'énoncé par calibration ne vaut que sous points CALIB échangeables, « assumed, not shown ». »
  source : 0005 l.94 ; 0006 l.71 ; F9 l.97-103 ; C l.500 · touche : aucune aujourd'hui (aucune ligne kata servie) · nature : T
  item : KATA-EXCH-TEST-1 (ETAT l.762-765) · porteur : RECHERCHES (recherche, C2 CONFORMAL-PX-1, ETAT l.763) ; PXC-09 partie 1 n'en est que
    la campagne de lecture (porteur PAROXYSME), sans second propriétaire de l'item · déclencheur : avant le G0 court de la vague 2 (ETAT
    l.763) ; campagne en F3
  état : changé (item formé à ETAT depuis l'inventaire) · suite : le test borne le temps d'exposition, il ne prouve pas l'échangeabilité ;
    prix à ETAT : recherche 2 j, puis son lot, 2 à 3 j (l.739, l.764)
- **MK-L02** · « Aucun énoncé à échantillon fini sous dépendance sérielle à α 0,01 aux tailles kata ; la borne de couplage est vide. »
  source : F9 l.36, l.47, l.49-57, l.109-111 · touche : phrase servie proposée (F9 l.99) · nature : T
  item : F-W2-9a, F-W2-9b, F-W2-9c (ETAT l.753-761) ; PXC-09 partie 2 · porteur : RECHERCHES ; MONARK pour le suivi en ligne de 9c (ETAT
    l.760) ; PAROXYSME (PXC-09 p2) · déclencheur : 9a : une demande de lignes au niveau du tampon (l.754) ; 9b : le premier ADR qui la
    propose, avec sa table de puissance (l.757) ; 9c : la mise en place du suivi en ligne (l.760) ; PXC-09 p2 en F4
  état : changé (formés à ETAT) · suite : prix à ETAT : 9a 5 à 8 j, plus une version du contrat de 3 à 5 j si la classe est servie
    (l.738-739) ; 9b 2 à 3 j (l.758) ; 9c 1 à 2 j (l.760)
- **MK-L03** · « Stationnarité de la CALIB au service non établie : calibrée sur 2022-23, servie fin 2026. »
  source : F9 l.20, l.117 ; 0006 l.36, l.178, l.243 · touche : textes de la vague 2 (0006 l.34-38) · nature : T/M
  item : PXC-09 partie 1 (campagne) et PXC-10 partie 2 (surveillance valide à tout instant) ; vetos existants · porteur : PAROXYSME ·
    déclencheur : campagne en F3 ; partie 2 de PXC-10 en F4
  état : ouvert · suite : voir MK-L21 et KATA-EXCH-TEST-1
- **MK-L04** · « Sélection par admission : conditionnellement à l'admission, la part d'échecs peut dépasser δ. »
  source : add2 l.18, l.22 ; add3 l.34-35 ; 0006 l.186 · touche : C §7 l.236 (`miss_bound`) · nature : T
  item : PXC-09 partie 3 (KATA-SELECTIVE-1, à former : FCR de Benjamini-Yekutieli, Thm 4 [lu]) · porteur : PAROXYSME · déclencheur :
    partie 3 de PXC-09 (F4)
  état : ouvert · suite : aucune
- **MK-L05** · « Multiplicité : énoncé par case, aucune règle de famille à l'admission ; les échecs peuvent tomber ensemble. »
  source : 0005 l.101, l.112 ; 0006 l.27 ; add2 l.26 · touche : pied de page de la note de version (0005 l.101) · nature : T
  item : PXC-09 partie 3 (famille) ; F-W2-4 à re-former à ETAT par PXC-01 (CC l.96-99) · porteur : PAROXYSME · déclencheur : partie 3 de
    PXC-09 (F4) ; re-formation : PXC-01 partie 2 (F3)
  état : ouvert · suite : déclencheur de F-W2-4 (deux lectures : « K ≥ 20 cellules », CC l.334-335 ; « calib_attempt 2 », INV-M
    l.337) : la lecture tranchée, écrite à sa re-formation par PXC-01 p2 (F3) (ETAT l.260-261 à `5437cd0d`) ; lecture par RECHERCHES
    (INV-M l.337), décision de l'investisseur (CC l.334-335) portée par MONARK, selon la proposition retenue (MSG l.44-45)
- **MK-L06** · « Position tenue : l'énoncé vaut par fenêtre ; sur cent fenêtres renouvelées ou plus, la borne de Boole est vide. »
  source : 0006 l.229 ; 0005 l.131 ; F9 l.84, l.102 · touche : textes des tampons à P4 · nature : T
  item : F-W2-9a (ETAT l.753-755) ; PXC-09 partie 2 · porteur : RECHERCHES (ETAT l.754) ; PAROXYSME (PXC-09 p2) · déclencheur : une demande
    de lignes au niveau du tampon (ETAT l.754) ; PXC-09 p2 en F4
  état : changé (formé à ETAT) · suite : classe neuve et ADR
- **MK-L07** · « Direction : énoncé du côté seul, coûts exclus ; un COMMIT de direction ne borne aucun mouvement. »
  source : 0005 l.43, l.96, l.131 · touche : textes de P4 · nature : T
  item : PXC-17 DOMAINE-PX-2, partie 2 (ADR de coûts : F-K-5 à re-former à ETAT, PXC-01) · porteur : PAROXYSME · déclencheur : partie 2 de
    PXC-17, après le service de la vague 2 (F4)
  état : ouvert · suite : déclencheur de F-K-5 passé sans acte
- **MK-L08** · « Vague 1 : aucune case de direction ouverte ; après son service, la porte ne sert une région que sur 2 des 280 cases. »
  source : rapport de la vague 1 l.8-10 ; 0006 l.15, l.25 · touche : 0005 l.137 ; `docs/public-notes/v0.9.0.md:26` · nature : C/T
  item : PXC-17 partie 2 (ADR de direction : F-K-2, F-K-4, F-K-6 à re-former à ETAT, PXC-01) · porteur : PAROXYSME · déclencheur : partie 2
    de PXC-17 (F4)
  état : ouvert · suite : déclencheurs morts réécrits atteignables
- **MK-L09** · « Vetos et retrait binomiaux supposent des ratés indépendants ; le texte prévu sous-énonce le taux sous grappes. »
  source : 0006 l.37, l.181-185, l.306-307 · touche : texte servi de la vague 2 (0006 l.37) · nature : T
  item : W2-MKL09-ADDENDUM-1 (ETAT l.766-767) ; F-W2-9b (ETAT l.756-758) ; PXC-09 partie 2 · porteur : RECHERCHES (ETAT) ; PAROXYSME
    (PXC-09 p2) · déclencheur : ADDENDUM : avant le G0 court de la vague 2 (l.767) ; 9b : le premier ADR qui la propose (l.757) ; p2 en F4
  état : changé (formé à ETAT) · suite : prix de l'addendum : 0,25 j (l.767) ; textes de Q-B avant le G0 court d'E-2a (PLAN §4.1 B)
- **MK-L10** · « Vague 2b : six simplifications « accepted » ; 2b est différée et refusée par la garde. »
  source : 0006 l.24, l.296-303 ; `apps/harness/src/policy-guard.ts:43` · touche : rapport 2b, à venir · nature : T/D
  item : PXC-17 partie 1 (campagne courte avant P0-2b) ; partiel : FAITS-FUNDING-HOURS-1 (ETAT l.1750) · porteur : PAROXYSME ·
    déclencheur : campagne D1 en F3, D2 à D4 en F4
  état : ouvert · suite : aucune
- **MK-L11** · « Recalcul par un tiers impossible : séries privées et non redistribuables ; scores ni publiés ni tenus. »
  source : ETAT l.242-245 ; C l.490-494 ; A-2 l.158-162 ; 0005 l.32 · touche : C §11 (l.451, bornée par l.490) · nature : D/Dr
  item : PXC-11 partie 3 (formée à ETAT l.231-234 à `5437cd0d` pour l'attaquant « A » ; KATA-THIRD-PARTY-RECALC-1, à former (CC l.375,
    l.394 ; INV-M l.148 : recette publique de reconstitution, ou preuve vérifiable du calcul)) · porteur : PAROXYSME ; droit de publication des scores
    dérivés : le fondateur (PLAN §7.3) · déclencheur : partie 3 de PXC-11 (F3), le droit d'abord
  état : ouvert · suite : Q-B (v) ne couvre que le service public d'un étalonnage (PLAN l.893) ; même item que PX-Harness-19
- **MK-L12** · « Un seul vérificateur, dans la même organisation que le générateur ; identité sans signature. »
  source : `apps/harness/src/policy-guard.ts:24`, `:100-104` ; K l.74 · touche : C §11 l.493 · nature : P/T
  item : VERIFIERS-LIST-F5A-1 (ETAT l.567-590) pour les champs et les ulps ; PXC-11 partie 5 (KATA-VERIFIER-EXTERNAL-1, à former) ·
    porteur : VERIFIERS : partie 1 (lot 1f) RECHERCHES, partie 2 MONARK (course) et RECHERCHES (code de 2a), partie 3 RECHERCHES (l.588-590) ;
    PAROXYSME et un tiers (partie 5) · déclencheur : VERIFIERS : bloquant à la première table publiée dont une ligne porte `recompute`
    (l.569-571) ; partie 5 de PXC-11 : F5
  état : changé (partage 80/20 des parties, ETAT l.588-590) · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` ;
    partie placée après le 2026-12-31 (PLAN l.617-618)
- **MK-L13** · « La garde d'import ne recalcule pas `qhat`, `misses`, `k_obs` des bandes ; CALIB-SEQ-IMPORT-1 chiffré puis non adopté. »
  source : A-2 l.100, l.158-164 ; add8 l.13, l.23 · touche : C §11 l.490-494 · nature : T/C
  item : CALIB-SEQ-IMPORT-1, à re-former à ETAT par PXC-01 (CC l.98-99 ; deux formes, INV-M l.231 : suites scellées hors dépôt, ou raison
    écrite datée) ; PXC-11 · porteur : PAROXYSME (PXC-01 p2 ; PXC-11) ; MONARK (ligne d'ETAT) · déclencheur : PXC-01 partie 2 (F3) ;
    construction : partie fixée par l'ADR de PXC-11 (F3, §7, doute 8)
  état : ouvert · suite : compatibilité avec 0006 l.196 (blocage « Choix » de l'item, INV-M l.150 ; l'item a deux formes, INV-M l.231) :
    à trancher par l'ADR de PXC-11, qui couvre cette limite par « CALIB-SEQ-IMPORT-1 réformé » (CC l.377-378) ; porteur : PAROXYSME ;
    échéance : cette ADR, avant le code de la partie 2 de PXC-11 (F3, PLAN l.603) ; PXC-01 p2 réinscrit l'item avec son déclencheur
    (CC l.98-99)
- **MK-L14** · « Empreintes 0/1 inversibles : la règle « 30 points au plus » ignorait `misses` ; modèle de menace non écrit ; pas de contrôle au serveur. »
  source : C l.361, l.401 ; `scripts/spec-publish.mjs:284-297` ; `apps/harness/src/policy-digest-floor.ts:28` ;
    `apps/harness/src/policy-guard.ts:105-106` ; ETAT l.599-613 · touche : C §10 l.361 · nature : Dr/T
  item : SHORT-DIGEST-INVERSION-1 (ETAT l.599-613 : plancher exact de 2^128 « construit, « upcoming » jusqu'au chargeur d'E-2a », l.613) ;
    E2A-DIGEST-FLOOR-TEST-1 (tuyau, l.621-632) ; SHORT-DIGEST-SPEC-TEXT-1 (l.696-703) ; pour l'attaquant « A », l'item formé à ETAT
    sous le nom de la partie, PXC-11 partie 3 (ETAT l.231-234 à `5437cd0d` : engagement à clé des empreintes de suite publiées, option (e)
    du G0 §3, l.379, qui généralise DIR-4H-DIGEST-COMMIT-1 ; prix à chiffrer à son G0) ; la même partie porte KATA-THIRD-PARTY-RECALC-1
    (CC l.375, l.394), à former · porteur : RECHERCHES (SHORT-DIGEST, code du tuyau au partage 80/20, l.629-630 ;
    texte de la révision datée) ; MONARK (brouillon du texte, l.702) ; PAROXYSME (PXC-11 p3) · déclencheur : TUYAU : atteint (wave1.json
    versé, l.631-632), le test se construit avec E-2a ; SPEC-TEXT : avant la première publication datée de lignes kata (l.702) ; PXC-11 p3
    en F3
  état : changé (construit au code, non servi : G1 et G7 verts, `docs/G7-lot-short-digest-floor.md:49-50` ; mesure des 280 lignes et
    modèle de menace, `docs/G0-lot-short-digest-inversion-1.md:143`, `:237-247`) · suite : restes : HT-01, HT-02, FLAT-CAP-NEXT-WAVE-1
    (l.681-683), DIGEST-FLOOR-ATTACKER-COST-1 (l.684-686), BAND-AUX-DIGEST-W2-1 (l.693-695) ; pour l'attaquant « A », qui recalcule la
    suite depuis les données publiques et la spécification, aucune règle de longueur ni de plancher ne change rien ; seule une
    non-publication ou un engagement à clé le ferait (`docs/G0-lot-short-digest-inversion-1.md:245-246`)
- **MK-L15** · « K-8 : le serveur ne vérifie ni que `yhat` sort du kata déclaré, ni les barres derrière `features_digest`. »
  source : C l.343 ; `apps/harness/src/kata-path.ts:59`, `:75`, `:96` ; K l.78 · touche : C §9 ; K §7 ; `docs/public-notes/v0.9.0.md:26-31` ·
    nature : T/C
  item : F-K-7 (ETAT l.743-746) ; PXC-13 partie 1 (décision F-K-7 et phrase K-8 du texte de ligne) · porteur : MONARK (ETAT l.744) ;
    PAROXYSME (PXC-13 p1) · déclencheur : F-K-7 : une ligne datée sous l'item avant le service de la vague 1 (ETAT l.260 à `5437cd0d`) ;
    PXC-13 p1 avant la vague 1 servie (F2)
  état : changé (formé à ETAT ; décision F-K-7, « pas à E-2a, limite servie par S-K8 » (l.744-745), attendue au G0 court d'E-2a,
    accepté (ETAT l.107), non consignée à ETAT ; déclencheur re-porté par MONARK, §7 doute 9) · suite : la construction suit
    KATA-INPUT-RECOMPUTE-1 (PX-Harness-18) ; prix de la décision : 0,1 j (l.746)
- **MK-L16** · « Fenêtre de retard ]t, t + 300 s] : un appel tardif n'est dans l'énoncé que fait sans information. »
  source : ADR-CM l.328, l.331 ; `apps/harness/src/kata-path.ts:47` · touche : C §9 l.312 ; `apps/harness/src/tools/gate.ts:237` · nature : T
  item : LATE-CALL-WINDOW-1 (ETAT l.775-778) ; PXC-13 partie 2 (ADR K-8) · porteur : MONARK (mesure) ; RECHERCHES (texte) (ADR-CM l.331) ;
    PAROXYSME (PXC-13 p2) · déclencheur : le service de la vague 1 (ADR-CM l.331) ; PXC-13 p2 en F3
  état : changé (ligne datée (15) de l'ADR-CM ; prix à ETAT l.740-741) · suite : même limite que PX-Harness-21
- **MK-L17** · « Horloge du serveur non attestée : grille, retard et futur lisent une horloge dont la dérive n'est pas publiée. »
  source : C l.79 ; `apps/harness/src/kata-path.ts:47` · touche : C §3 l.79, §9 l.312 · nature : T/P
  item : SERVER-CLOCK-BOUND-1 (ETAT l.750-752) ; PXC-13 partie 2 · porteur : MONARK, hôte (ETAT l.751) ; PAROXYSME (PXC-13 p2) ·
    déclencheur : la forme avant le G7 d'E-2a ; la construction avec la release suivante (ETAT l.751-752) ; PXC-13 p2 en F3
  état : changé (formé à ETAT) · suite : prix à ETAT : 0,5 j (l.752)
- **MK-L18** · « Clés répétées hors contrat : deux corps différents donnent le même `request_sha256`. »
  source : C l.28, l.32, l.51 · touche : C §2 l.28 · nature : C
  item : PXC-16 partie 3 (REQUEST-DUP-KEY-1, à former ; RFC 7493 à lire sur place) · porteur : PAROXYSME · déclencheur : bascule 1.2.0 (F4)
  état : ouvert · suite : un refus neuf passe par une révision datée ou par 1.2.0 (C l.582)
- **MK-L19** · « L'écriture canonique écrit les nombres « comme JavaScript » ; le `json.dumps` de Python n'est pas conforme. »
  source : C l.33-41 ; FORMAT l.36 · touche : C §2 l.41 · nature : C
  item : PXC-11 partie 4 (CANON-JCS-1, à former : écart à RFC 8785 déclaré, vecteurs croisés) · porteur : PAROXYSME · déclencheur :
    partie 4 de PXC-11 (F4)
  état : ouvert · suite : identité de RFC 8785 à établir (PX-IDENT-C0BIS-1)
- **MK-L20** · « Identité au bit non promise entre plateformes : `ln` diffère d'un ulp sur 5 256 rapports sur un million. »
  source : K l.72-74 ; 0006 l.295 ; add1 l.64 · touche : K §6 l.72 · nature : T/C
  item : PXC-11 partie 4 (KATA-CR-LIBM-1, à former ; CORE-MATH, IEEE 754-2019, Muller et al. détenus) · porteur : PAROXYSME ·
    déclencheur : partie 4 de PXC-11 (F4)
  état : ouvert · suite : mutualisé avec REPRO-3P-1
- **MK-L21** · « Aucun retrait par les données vivantes avant le 2027-01-01 ; la lecture mensuelle reste en rapport. »
  source : add9 l.13-14 ; 0006 l.183, l.191 ; ETAT l.1760-1766 · touche : textes de la vague 2 (0006 l.38) · nature : M/T
  item : PXC-10 partie 2 (KATA-ANYTIME-RETIRE-1, à former : e-processus ou martingale conforme) ; CM5-MONTHLY-GAP-1 (ETAT l.538-542) ·
    porteur : PAROXYSME (PXC-10 p2) ; CM5-MONTHLY-GAP-1 : MONARK avec RECHERCHES (l.540-541) · déclencheur : partie 2 de PXC-10 (F4) ;
    CM5-MONTHLY-GAP-1 : un « non » à Q-CM5-9, au plus tard le G0 court d'E-2b (l.541-542)
  état : changé (CM5-MONTHLY-GAP-1 formé à ETAT depuis l'inventaire) · suite : Ramdas et al. 2023, Howard et al., Waudby-Smith et Ramdas
    sont libres (PLAN §7.1) : lecture sur place avant tout chercheur (CC PXC-10, l.351-353)
- **MK-L22** · « Pas de surveillance par clé kata ; l'`evidence_sha256` des retraits dépend du relevé de CM-5. »
  source : ETAT l.533-537, l.965-967 ; ADR-CM l.67 ; `apps/harness/src/policy-retire.ts:15` · touche : 0005 l.114, l.131 · nature : C/M
  item : CM-5-PLAN-1 (ETAT l.533-537) ; RETIRE-EVIDENCE-BIND-1 (ETAT l.965-967) ; PXC-10 partie 1 · porteur : RECHERCHES (CM-5, c3 et c4) ;
    MONARK (oracles d'hôte ; RETIRE-EVIDENCE-BIND-1) · déclencheur : T0, atteint ; le premier retrait `live:` (ETAT l.966-967)
  état : changé (G0 de CM-5 écrit par RECHERCHES ; partage daté, ETAT l.535-537) · suite : partie 1 de PXC-10 après la mesure de R-b (F3)
- **MK-L23** · « Une cause de retrait `adr:` n'est contrôlée que dans sa forme ; rien ne la lie à un fichier ni à son sha256. »
  source : ETAT l.968-971 ; `apps/harness/src/policy-retire.ts:51-53` · touche : C §10 l.441-447 · nature : T/C
  item : RETIRE-ADR-CAUSE-FILE-1 (ETAT l.968-971) ; PXC-10 partie 2 · porteur : MONARK (ETAT l.970) ; PAROXYSME (PXC-10 p2) · déclencheur :
    la première liste qui porte une cause `adr:` (ETAT l.970-971) ; PXC-10 p2 en F4
  état : ouvert · suite : aucune
- **MK-L24** · « Recalibration non servable au-delà de l'essai 2 ; la cause `epoch:` est refusée sans journal épinglé. »
  source : `apps/harness/src/policy-guard.ts:57-58`, `:92-93` ; `apps/harness/src/policy-retire.ts:51-53` ; ETAT l.956-964 ·
    touche : C §10 l.441-447 · nature : C
  item : PXC-10 partie 3 (KATA-RECALIB-PATH-1, à former) ; partiel : RETIRE-CHILD-ROW-1 (ETAT l.956-964), EPOCH-EVENTS-1 (ETAT l.1743) ·
    porteur : PAROXYSME (PXC-10 p3) ; MONARK (RETIRE-CHILD-ROW-1, l.959) · déclencheur : partie 3 de PXC-10 (F4) ; RETIRE-CHILD-ROW-1 : le
    G0 court d'E-2b, avant son premier déploiement (ligne datée, l.961-962)
  état : changé (déclencheur de RETIRE-CHILD-ROW-1 changé ; son cas 2 se ferme avec RETIRE-READER-WAVE2-1, l.962-964) · suite : cas 1 et 3
    restent
- **MK-L25** · « Empreintes P0 sans horodatage tiers ; « never withdrawn » ne tient que par le propriétaire du dépôt de la spécification. »
  source : 0005 l.127, l.161 ; C l.441, l.449, l.587 · touche : C §10 l.449, §15 l.587 · nature : Dr/P
  item : PXC-15 LOG-TIME-2, partie 3 (ancrage OpenTimestamps des empreintes P0 et du manifeste de chaque version) · porteur : PAROXYSME ;
    acte du fondateur (revenir sur Q-7) · déclencheur : Q-7 avant le 2026-11-16 (PLAN §7.3), puis partie 3 de PXC-15
  état : ouvert · suite : réemploi d'ADR-BELL-OTS-ANCHOR-1
- **MK-L26** · « Aucune classe kata n'a de sujet attesté : `attested` est toujours refusé, la jointure attest → gate est dormante. »
  source : C l.85 ; 0005 l.121 ; ADR-CM l.189-191 · touche : `apps/harness/src/tools/gate.ts:234` · nature : T/P
  item : PXC-08 SHOGEN-SEAM-1, partie 3 (ATTEST-KATA-SUBJECT-1, à re-former à ETAT par PXC-01) · porteur : PAROXYSME, avec le mainteneur
    Shōgen · déclencheur : partie 3 de PXC-08, après CM-4 (F5) ; re-formation : PXC-01 partie 2 (F3)
  état : ouvert · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` (PLAN l.617-618) ; couture au registre Shōgen
- **MK-L27** · « Une seule plateforme, quatre symboles, 1h et 4h ; le 24h est silencieux par construction. »
  source : 0005 l.118-121, l.147-148, l.195, l.199, l.202-203 ; 0006 l.230 ; ETAT l.245 · touche : C §9 l.296-301 ;
    `docs/public-notes/v0.9.0.md:26` · nature : D/Dr
  item : F-K-1 (nommé à ETAT l.254-255, sans déclencheur) ; PXC-18 partie 2 (Coinbase bloqué par ses conditions) et PXC-17 partie 3 (portée) ·
    porteur : MONARK (F-K-1, ETAT l.254-255) ; PAROXYSME (chantiers) ; le fondateur pour tout symbole ou plateforme neuf (0006 l.25) ·
    déclencheur : PXC-18 partie 2 (F4) ; PXC-17 partie 3 (F5)
  état : ouvert · suite : F-K-8 et F-K-9 absents d'ETAT, à re-former par PXC-01 ; ligne d'attente datée (P-25) pour la partie en F5 :
    ETAT l.270-273 à `5437cd0d` (PLAN l.617-618)
- **MK-L28** · « Base juridique des données : l'usage est dit couvert par des accords dont les textes sont attendus. »
  source : ETAT l.246-247, l.33-34, l.136-137 · touche : rapport public de la vague 1 · nature : Dr
  item : PXC-18 partie 1 ; DATA-ACCORDS-TEXTS-1 et DATA-LICENCE-KATA-1 (items du plan et des chantiers, PLAN l.893 ; CC l.581-582) ·
    porteur : le fondateur (textes, accord écrit) ; PAROXYSME (dossier) · déclencheur : avant le service public des lignes kata (PLAN l.893)
  état : changé (Q-B (v) : « oui », le 2026-10-07, ETAT l.55-56 à `5437cd0d`) · suite : à `87b821b0`, ni DATA-ACCORDS-TEXTS-1 ni
    DATA-LICENCE-KATA-1 ne sont à ETAT ; à `5437cd0d`, DATA-ACCORDS-TEXTS-1 y est nommé, sa demande « reste ouverte » (ETAT l.56-57 à
    `5437cd0d`), sans porteur ni déclencheur écrits, et DATA-LICENCE-KATA-1 reste absent (§7, doute 3)
- **MK-L29** · « Contre-vérification USDT/USD retirée (API payante) ; Kraken ne vérifie que dans un sens. »
  source : add6 l.8, l.14-18 · touche : rapport de la vague 2 · nature : D/P
  item : PXC-18 partie 2 (décision de dépense, format P-26) · porteur : le fondateur (dépense) ; PAROXYSME (question fermée) · déclencheur :
    partie 2 de PXC-18 (F4)
  état : ouvert · suite : aucune dépense engagée par ce registre
- **MK-L30** · « Stock passé non vu épuisé après la vague 3 : plus aucun mois non vu. »
  source : 0006 l.197-201, l.309 · touche : aucune · nature : D
  item : PXC-17 partie 3 (KATA-FORWARD-PLAN-1, à former : calibrations pré-enregistrées sur données futures) · porteur : PAROXYSME ; acte du
    fondateur · déclencheur : partie 3 de PXC-17 (F5)
  état : ouvert · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` (PLAN l.617-618)
- **MK-L31** · « Garde des noms BYO : imitations résiduelles et faux refus déclarés de la famille `<s>-dlr-<h>`. »
  source : ADR-CM l.231-232 ; `docs/G7-lot-d-3.md:93-96` ; ETAT l.1539-1542 · touche : C §13 l.540-543 · nature : C
  item : BYO-LOOKALIKE-RESIDUAL-1 et BYO-HOMOGLYPH-1 (ADR-CM l.231-232) · porteur : RECHERCHES (ADR-CM l.231-232) · déclencheur : une
    imitation résiduelle observée dans un appel BYO réel ou rapportée par un tiers ; tout élargissement du motif ASCII de
    `schemas/prediction.schema.json`, ou tout consommateur de `runGate` hors HTTP et MCP (ADR-CM l.232)
  état : ouvert · suite : même limite que PX-Harness-16
- **MK-L32** · « Hors contrat : le code rendu quand une requête est invalide sur deux points, la forme des `issues`, les messages. »
  source : C l.515, l.562-563 · touche : C §13 · nature : C
  item : PXC-16 partie 3 (ERROR-ORDER-SPEC-1, à former : publier l'ordre des contrôles) ; épingle par PXC-02 (zone RECHERCHES) · porteur :
    PAROXYSME · déclencheur : bascule 1.2.0 ou révision datée (F4)
  état : ouvert · suite : l'ordre est déjà épinglé par T-15
- **MK-L33** · « Énumérations jamais produites, `residual` toujours vide, `scores` jamais envoyé, deux codes sans requête servie. »
  source : C l.129, l.138-139, l.185-187, l.226 ; `docs/G7-lot-d-3.md:66-70` · touche : C §5, §6, §13 · nature : C
  item : PXC-16 partie 3 (élagage à la version suivante, ou épingle « jamais produit ») · porteur : PAROXYSME · déclencheur : bascule 1.2.0 (F4)
  état : ouvert · suite : Q-D3-1 couvre le seul cas ukemi
- **MK-L34** · « Paramètres déclarés, non dérivés d'un critère (α, δ, niveaux, `tail_frac`, 300 s, quatre essais, SHORT_N 30). »
  source : 0005 l.95-98 ; 0006 l.45 ; C l.237 ; `scripts/spec-publish.mjs:288` · touche : C §7, §9 · nature : T
  item : PXC-09 partie 1 (KATA-PARAM-BASIS-1, à former ; Kiyani et al. 2025) · porteur : PAROXYSME · déclencheur : partie 1 de PXC-09 (F3)
  état : ouvert · suite : `SHORT_N` vaut encore 30 à la tête (`spec-publish.mjs:288`), à côté du plancher 2^128 ; partie choisie ici (§7,
    doute 8)
- **MK-L35** · « Une silence d'une calibration plus ancienne remplace une région plus récente (« the safe side »). »
  source : 0006 l.30-33, l.293 · touche : texte servi (0006 l.33) · nature : T
  item : PXC-09 partie 3 (règle qui combine les deux calibrations à δ ajusté, à former) · porteur : PAROXYSME · déclencheur : partie 3 de
    PXC-09 (F4)
  état : ouvert · suite : partie choisie ici (§7, doute 8)
- **MK-L36** · « Incohérence publique : six contrats à une ligne du README, huit à trois autres. »
  source : `README.md:20`, `:94`, `:175`, `:245` · touche : `README.md:175` · nature : C (texte)
  item : PXC-02 partie 1, noyau (README-CONTRACT-COUNT-1, à former) · porteur : PAROXYSME · déclencheur : tâche 2 du TABLEAU (F1)
  état : ouvert · suite : même limite que PX-Harness-02
- **MK-L37** · « La chaîne des essais n'est écrite que dans le code du générateur ; sa tête reste hors décision. »
  source : INV-M l.174 (message G0 des vérificateurs l.29-31) · touche : FORMAT l.9, l.44 · nature : M
  item : TRIAL-HEAD-WRITTEN-1, par SHORT-DIGEST-SPEC-TEXT-1 (ETAT l.696-703) ; TRIAL-HEAD-PUBLIC-REPLAY-1 (ETAT l.724-729) · porteur :
    RECHERCHES (texte), MONARK (brouillon) (ETAT l.701-702) ; RECHERCHES, avec E-2a (l.727-728) · déclencheur : avant la première
    publication datée de lignes kata (l.702) ; REPLAY : la première publication datée de lignes kata, après #221 (l.728)
  état : changé (porté à ETAT par la révision datée de la spécification) · suite : section 8 de KATA-SPEC ; la partie 1 de PXC-11 est
    retirée par le plan (PLAN l.456, l.471)
- **MK-L38** · « L'indépendance de l'implémentation de contrôle est « declared by its author ». »
  source : K l.74 · touche : K §6 l.74 · nature : T
  item : PXC-11 partie 5 (implémentation tierce en salle blanche, avec journal d'accès) · porteur : PAROXYSME ; un tiers · déclencheur :
    partie 5 de PXC-11 (F5)
  état : ouvert · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` (PLAN l.617-618)
- **MK-L39** · « L'outil de vérification Python tourne hors CI. »
  source : ETAT l.591-598 · touche : aucune · nature : C
  item : VERIFIER-TOOL-CI-1 (ETAT l.591-598) · porteur : RECHERCHES (ETAT l.595) · déclencheur : après la fusion de l'outil figé, avant le
    gel de c1a de CM-5 (ETAT l.595-596)
  état : changé (formé à ETAT le 2026-10-07, l.597-598) · suite : prix à ETAT : ≈ 55 lignes (l.596) ; la partie 1 de PXC-11 est retirée par
    le plan (PLAN l.456, l.471)
- **MK-L40** · « « Public and unauthenticated, with no availability commitment. » »
  source : `apps/site/app/docs/integrators/page.tsx:56-57` · touche : même ligne · nature : C
  item : PXC-05 partie 3 (mesure par la sonde continue) ; PXC-16 partie 2 (objectif publié) · porteur : PAROXYSME · déclencheur : partie 3
    de PXC-05 et partie 2 de PXC-16 (F3)
  état : ouvert · suite : même famille que PX-Harness-05 et -06

## 4. Limites closes (avec preuve)

### 4.1 Harness (18, INV-H §4)

- **C-01** · « README du harnais en retard. » · clos (preuve : `apps/harness/README.md:14-36` ; `7439b0e8`, `d94a8810`, `fd5bda12`)
- **C-02** · « Classe `btc-dir-15m` servie sur une calibration synthétique. » · clos (preuve : ETAT l.1570 ;
  `docs/deploy-CA-harness.json:49-53`, `gate_retired_call`)
- **C-03** · « B-0 : BYO `set` acceptant `tau` au-delà des candidats. » · clos (preuve : ETAT l.1535-1536, arbre `6da4504d` déployé)
- **C-04** · « S-11 : noms BYO imitant une classe ou une clé commise. » · clos (preuve : même déploiement ; résidu en PX-Harness-16)
- **C-05** · « S-6 : corps d'erreur sans code stable. » · clos (preuve : `apps/harness/src/http.ts:90-106` ; `apps/harness/src/openapi.ts:84-95` ; C §13)
- **C-06** · « S-15 : sortie HTTP non validée. » · clos (preuve : `apps/harness/src/http.ts:110-115`, 500 `output_invalid`)
- **C-07** · « S-10 : `produced_at` futur ou non RFC 3339 accepté. » · clos (preuve : `docs/deploy-CA-harness.json:56-60`, `gate_future_call`)
- **C-08** · « S-1 : `alpha` et `nMin` choisis par l'appelant. » · clos (preuve : table F-7, ADR-CM l.167-177 ; `gate.ts:137`, `:161`)
- **C-09** · « S-8 : texte liq « calibré » servi aux strates s1 à s3. » · clos (preuve : ADR-CM l.303 ; C l.507)
- **C-10** · « TRANSPORT-500-SCHEMA-1. » · clos (preuve : ETAT l.1184-1186, #168) ; reste PX-Harness-03 (b)
- **C-11** · « SCHEMA-PROJECTION-FAIL-CLOSED-1 et voisins. » · clos (preuve : ETAT l.1187-1190, #180) ; restes en PX-Harness-15
- **C-12** · « 413 absent de `/openapi.json`. » · clos (preuve : `apps/harness/src/openapi.ts:91`)
- **C-13** · « EXPORT-HARNESS-413-LOAD-1. » · clos (preuve : ETAT l.475-481, #127)
- **C-14** · « LOOPBACK-PORT0-HELPER-ONLY-1, LOOPBACK-CLOSEDPORT-RACE-1. » · clos (preuve : ETAT l.467-474) ; reste PX-Harness-28
- **C-15** · « Skill sans classes kata ; RUNBOOK « 13 of 13 ». » · clos (preuve : `skills/monark/SKILL.md:72` ; à la tête,
  `docs/RUNBOOK-harness.md:186` et `:214` disent 18 contrôles)
- **C-16** · « DEMO-HASH-STALE-1. » · clos (preuve : `skills/monark/DEMO.md:87-88`, test `demo_md_cites_the_current_byo_trace_digest`,
  `test/byo-demo-probe.test.ts:204` ; à ETAT, ligne datée de MONARK, « clos au code », ETAT l.1758-1760 à `5437cd0d`)
- **C-17** · « Actes de T0 : CONTRACT-1-1-0, NOTICE-1-1-0, SPEC-1-1-0-RELEASE. » · clos (preuve : `docs/JOURNAL-PROVENANCE.md:444-447` ;
  `docs/public-notes/v0.9.0.md:3`, `:62`)
- **C-18** · « SERVED-PENDING-1. » · clos (preuve : `docs/JOURNAL-PROVENANCE.md:445`, promus et retirés à T0)

### 4.2 Moteur (13, INV-M §4)

- **MK-C01** · « Rang split flottant et scores infinis. » · clos (preuve : C l.114, l.224, l.228-232 ; ADR-CM l.252 ;
  `apps/harness/src/policy-marginal.ts:37`)
- **MK-C02** · « Lecture des seuils de compartiment. » · clos (preuve : C l.337-341 ; `apps/harness/src/kata-path.ts:75`)
- **MK-C03** · « Bord servi h* ou fl(q̂·σ̂). » · clos (preuve : add3 l.54 ; C l.272-275 ; `apps/harness/src/kata-path.ts:96`)
- **MK-C04** · « `region_degenerate` atteignable par une bande kata. » · clos (preuve : add3 l.41 ; `apps/harness/src/policy-guard.ts:110-111`)
- **MK-C05** · « Taille de l'effet K-2. » · clos (preuve : add3 l.34-35, mesurée 0,0534, SE 0,0042)
- **MK-C06** · « Interface de la garde `class-policy-v2`. » · clos (preuve : add8 §1 ; `apps/harness/src/policy-wave2.ts:26-42` ; ADR-CM l.300)
- **MK-C07** · « Phrase fausse de 0006 D3. » · clos (preuve : add2 l.12-22)
- **MK-C08** · « F-W2-9 dû avant P3. » · clos comme constat (preuve : `decisions/0006-F-W2-9-serial-dependence-finding.md`, dépôt de
  RECHERCHES) ; ses suites : MK-L02
- **MK-C09** · « DECIDED-AT-1. » · clos par raison écrite (preuve : ETAT l.828-831) ; se rouvre avec MK-L16
- **MK-C10** · « Borne du `n_test` d'un retrait `live:<k>`. » · clos (preuve : `apps/harness/src/policy-wave2.ts:16` ;
  `apps/harness/src/policy-retire.ts:79` ; ETAT l.1760-1763) ; non servie avant E-2a
- **MK-C11** · « Outils de T0 : SPEC-PUBLISH-PREVIOUS-BLOBS-1, TEMPLATE-MARKERS-SOURCE-1. » · clos (preuve : ETAT l.784, l.791-806)
- **MK-C12** · « Ordre des opérations du terme EWMA. » · clos (preuve : K l.5, l.42)
- **MK-C13** · « LIQ-BAND-EXACT-GUARD-1. » · clos (preuve : `apps/harness/src/policy-marginal.ts:53-59`, `:67` ; ETAT l.1540-1542
  forme l'item ; à ETAT, ligne datée de MONARK, « clos au code », ETAT l.1694-1698 à `5437cd0d` (relevé au registre d'Ukemi, N12 ;
  ETAT y cite l.52-58, commentaire de la l.52 compris))

## 5. Limites marquées PAROXYSME apparues à ETAT depuis les inventaires

Commande (à la tête, sans réseau) : `git diff -U0 57a131fc 87b821b0 -- docs/ETAT.md | grep '^+' | grep PAROXYSME` : dix lignes
ajoutées, huit limites, un bloc et une ligne de suite (ETAT l.1102-1103). Le bloc « Limites déclarées des textes figés de R4 v2 »
(ETAT l.730-778) porte des items déjà rattachés aux entrées MK-L01, MK-L02, MK-L06, MK-L09, MK-L15, MK-L16, MK-L17, PX-Harness-18 et
PX-Harness-21, et NARABI-POLICY-TEXT-REV-1 (registre Narabi). DOJO-PROBE-UID-BOUNDARY-1 (ETAT l.1889) touche la sonde Narabi et celle
du Dōjō : registre Narabi. Les sept autres sont ici.

- **HT-01** · « Les quatre tables dir-4h ne peuvent être servies sans divulguer des suites sous 2^128. »
  source : ETAT l.614-620 · touche : aucune (tables retenues) · nature : T/C
  item : DIR-4H-DIGEST-COMMIT-1 (ETAT l.614-620) · porteur : RECHERCHES (spécification), puis MONARK (code) · déclencheur : avant tout service
    d'une table dir-4h, ou avant le pré-enregistrement de cellules de direction d'une autre vague
  état : ouvert · suite : prix à ETAT : contrat 1.2.0, régénération du registre, outil du vérificateur, ligne d'A-2, plus une nouvelle
    ligne Z-3 et son état à T-12 (ligne datée l.618-620)
- **HT-02** · « Les bornes du double comptage et de l'union sont des minorants : elles peuvent retenir une ligne au compte exact suffisant. »
  source : ETAT l.687-692 · touche : un texte qui écrirait « exact » sans réserve · nature : T
  item : DIGEST-FLOOR-FLAT-EXACT-1 (ETAT l.687-692) · porteur : MONARK, avec RECHERCHES pour la preuve · déclencheur : une ligne `sign-set`
    d'une vague future entre la borne et le compte f = 0, ou un texte qui écrirait « exact » sans réserve
  état : ouvert · suite : sans effet sur la vague 1 (marge d'au moins 210 bits sur les dir-1h, ETAT l.691-692)
- **HT-03** · « Rien ne lie à la porte la ligne entière d'une ligne publiée ; les colonnes de décision ne sont lues qu'en présence ou en compte. »
  source : ETAT l.652-662 · touche : aucune · nature : C/T
  item : VERIFIER-REPORT-DECISION-DIGEST-1 (ETAT l.652-662) · porteur : RECHERCHES (spécification), code au partage 80/20 · déclencheur :
    avant une release datée dont les tables ne sortiraient pas de l'écrivain, ou avant le rapport de la vague 2
  état : ouvert · suite : couverte d'ici là par la garde et SPEC-TABLES-TEST-PER-DIR-1 (ETAT l.660-661)
- **HT-04** · « La tête de la chaîne des essais ne se recalcule des seuls fichiers publiés qu'avec le lieu, refusé en prose. »
  source : ETAT l.724-729 · touche : aucune · nature : M
  item : TRIAL-HEAD-PUBLIC-REPLAY-1 (ETAT l.724-729) · porteur : RECHERCHES, avec E-2a · déclencheur : la première publication datée de
    lignes kata, après #221
  état : ouvert · suite : prix à chiffrer à son G0 ; voir MK-L37
- **HT-05** · « Un client MCP coupe la description de la porte à 2 048 unités : la fin de la clause d'honnêteté n'est pas vue. »
  source : ETAT l.812-823 · touche : description servie de `gate` · nature : C/texte
  item : GATE-DESC-CLIENT-CUT-1 (ETAT l.812-823) · porteur : MONARK (la décision) ; RECHERCHES (recherche et construction) · déclencheur :
    avant T_f(c)
  état : ouvert · suite : les épingles de `apps/harness/test/gate-liq.test.ts` l.376-380 bougent avec ce lot
- **HT-06** · « Un dossier daté ne change que des tables dont les lignes citent un seul rapport ; un retrait mixte prend deux cycles. »
  source : ETAT l.1075-1084 · touche : aucune · nature : C
  item : DATED-DIR-MULTI-REPORT-1 (ETAT l.1075-1084) · porteur : RECHERCHES (code), G2 MONARK · déclencheur : avant la première liste de
    retrait après c′, et avant RETIRE-LIST-WRITER-1
  état : ouvert · suite : voie (a) ou (b), le choix est à MONARK (ETAT l.1082-1083)
- **HT-07** · « Le premier retrait réel est mesuré de T_a à T_g ; au-delà de 14 jours, c'est un écart à D6. »
  source : ETAT l.1101-1103 · touche : aucune · nature : M
  item : RETIRE-LATENCY-FIRST-REAL-1 (ETAT l.1101-1103) · porteur : MONARK · déclencheur : ce premier retrait réel (`live:1` au plus tôt le
    2027-01-01, ou une cause `adr:` avant)
  état : ouvert · suite : voir MK-L21, PX-Harness-20

## 6. Renvois : limites d'autres pièces exécutées dans `apps/harness` (INV-H §5, INV-M §8)

- PX-Shogen-2, -3, -4, -5 et PX-Hikae-10 (clé `attested`, outil `attest`) : registre Shōgen (exception datée) et registre Hikae.
- PX-Hikae-4 et X-9 (`alpha` et `nMin` imposés sur les clés engagées, INV-M l.305), PX-Hikae-6 (`remaining_budget` renvoyé tel
  qu'envoyé), PX-Hikae-9 (clos au servi, C-02), PX-Hikae-11 (`region_degenerate`) : registre Hikae.
- PX-Ukemi-11, -12 (`calibrate`), PX-Ukemi-1, -7, -8, -9, -10 et -14 (textes liq servis ; INV-M l.306-307) : registre Ukemi.
- PX-Narabi-1 (texte stable-run servi) : registre Narabi ; PX-Narabi-15 (comptage par classe) : absorbé par PX-Harness-10 sous Q-H2.
- E-14 (q̂ liq nul rend `under_calib`, INV-M l.308) : registre Hikae (N18), partagé avec Ukemi.

## 7. Doutes nommés (ce qui ne se reproduit pas tel quel à la tête)

1. **Sources hors du tronc.** Les lignes de C, K, 0005, 0006, addN, A-2, F9, FORMAT, du rapport de la vague 1, du message G0 des
   vérificateurs, des fichiers du SDK sous `node_modules` (INV-H l.45-46), des textes de Chandra-Toueg et de Dean-Barroso (INV-H l.112-113)
   et de PX-IDENT sont celles que les inventaires ont lues ; elles ne sont pas relues ici. Les enregistrements d'oracle G1 et G7 du
   plancher (`5463028a…`, `ef3ef079…`, message `07d99e2` l.15) sont sur l'hôte de MONARK : non revérifiables ici.
2. **DEMO-HASH-STALE-1.** Levé : MONARK a écrit la clôture à ETAT (ETAT l.1758-1760 à `5437cd0d`) ; C-16. Reste une ancre : ETAT
   l.1759 à `5437cd0d` situe l'empreinte aux « l.86-87 » de `skills/monark/DEMO.md`, reprises du relevé de PAROXYSME (INV-H l.84, puis
   C-16 versé ; ETAT l.1758 à `5437cd0d`) ; elle est à la l.88, comme le dit ETAT l.1755 à `5437cd0d`
   (`git show 87b821b0:skills/monark/DEMO.md | sed -n 88p` ; tueur de `test/byo-demo-probe.test.ts:203`). Erratum (« l.86-87 » devient
   « l.87-88 ») à demander à MONARK dans la demande de fusion de #245 (porteur de la demande : PAROXYSME ; de la ligne d'ETAT : MONARK ;
   échéance proposée : son commit d'ETAT de cette fusion, MSG3 l.9-10).
3. **Items absents d'ETAT à la tête `87b821b0`** (`grep -c` nul), et qui les re-forme :
   - PX-STD-ORPHAN-1 (MONARK, prochain point d'étape, PLAN l.541, l.897-898) : SENTINEL-DEPLOY-GUARD-1, SYNC-CHECK-MODE-1. Ce point est
     passé sans acte pour eux : les décisions que le PLAN y place (l.886) sont rendues le 2026-10-07 (ETAT l.49-57 à `5437cd0d`) ; au
     « Point du 2026-10-07 au soir » (ETAT l.173 à `5437cd0d`), MONARK re-porte F-K-7 et NARABI-L-2 (ETAT l.254, l.260, l.265-269 à
     `5437cd0d`) et, par une ligne datée du même soir, HOST-REDEPLOY-GUARD-1 (ETAT l.1401-1404 à `5437cd0d`), pas ces deux items
     (`grep -c` = 0 à `5437cd0d`) ; PX-STD-ORPHAN-1 n'est pas étendu (MSG l.85, réponse sur PX-Hikae-1 à -11). Re-port à demander à
     MONARK dans la demande de fusion de #245 (porteur de la demande : PAROXYSME ; de la ligne d'ETAT : MONARK ; échéance proposée : son
     commit d'ETAT de cette fusion, MSG3 l.9-10) ; autre route, au choix de MONARK : PXC-01 partie 2 (CC l.97) ;
   - PXC-01 partie 2 (CC l.96-99, F3) : F-W2-4, F-K-2, F-K-4, F-K-5, F-K-6, F-K-8, F-K-9, CALIB-SEQ-IMPORT-1, ATTEST-KATA-SUBJECT-1,
     R-11, SKILL-KATA-15M-NOTE-1, HARNESS-TRANSPORT-CATCH-1, HARNESS-DEMAND-J30-1 ;
   - le fondateur : DATA-ACCORDS-TEXTS-1 et DATA-LICENCE-KATA-1 (PLAN l.893) ;
   - MONARK, ligne de RUNBOOK : RUNBOOK-HARNESS-SENTINEL-DIFF-1 (PLAN §4.1 A, avant le déploiement de la vague 1) ;
   - à `5437cd0d`, le même `grep -c` reste nul, sauf pour F-W2-4 (ETAT l.260-261 à `5437cd0d` : sa re-formation par PXC-01 p2, décision
     de MONARK) et DATA-ACCORDS-TEXTS-1 (ETAT l.55-57 à `5437cd0d` : Q-B (v) « oui », la demande des textes « reste ouverte », sans
     porteur ni déclencheur écrits).
4. **Items neufs non marqués PAROXYSME.** ETAT gagne d'autres items depuis `57a131fc` (par exemple RETIRE-CAUSE-VOCAB-1,
   RETIRE-REHEARSAL-STAGING-1) ; ils ne sont pas des limites des inventaires et ne sont repris ici que là où une entrée les cite. La
   recartographie de PXC-01 partie 2 les prendra.
5. **Contrôle mécanique.** `verify-registres.mjs` (pièce de la boîte PAROXYSME, commit `d97d838`) vérifie : chaque id d'inventaire est une
   entrée, une seule fois, ou un doute nommé et épinglé dans l'outil ; aucun champ item, porteur ou déclencheur vide ou « aucun » ; chaque entrée close a sa
   preuve ; aucune ligne de plus de 160 caractères, aucune adresse ; le diff porte exactement les six fichiers ; chaque item marqué
   PAROXYSME ajouté à ETAT est cité dans un champ item. Il sortait en code 1 sur une tête partielle (`788fba1`, un seul registre) et sort
   en code 0 sur la tête qui porte les six (`6e6c878`). Sa version `1fd31ee` prenait 7 lignes par entrée : elle sortait 1 sur `0967bef`
   (MK-L14, plus longue) ; `d97d838` prend les entrées entières (cas rouges puis verts, pièce de la boîte) et sort 0 sur la branche. Il est
   provisoire jusqu'à `scripts/paroxysme/registry.mjs` (PXC-01 partie 1).
6. **Essai de CA de MONARK.** La preuve partielle de PX-Harness-09 (pièce `ca-trial-18.json`, sortie sha256 `28aaa41b…`, tronc
   `8411a2d4`) est dans la boîte de RECHERCHES ; elle n'est pas relue ici.
7. **Ancres qui ont bougé à la tête** (ordre de mission : « ligne qui a bougé à la tête » va en doute).
   - Texte changé : `docs/RUNBOOK-harness.md` l.157-214, dont l.159, l.186, l.214 (15 → 18 contrôles, `4c16ea0`), et
     `scripts/spec-publish.mjs` l.284-297 (plancher 2^128, `c4dbfc5`), relus aux entrées PX-Harness-05 (inchangée : la CA ne tourne
     qu'au déploiement), PX-Harness-09, C-15 et MK-L14.
   - Même texte, autre numéro : 40 des 44 plages d'ETAT (`57a131fc` → `87b821b0`) ; `apps/harness/src/policy-guard.ts` l.108-109 →
     l.110-111 ; `scripts/verify-harness.mjs` l.274-404 → l.285-415 (INV-H l.42, non cité ici).
   - Items d'ETAT qui ont gagné des lignes après la plage citée (relus en entier jusqu'à la puce suivante) : CM-5-PLAN-1 (l.535-537),
     VERIFIERS-LIST-F5A-1 (l.588-590), SHORT-DIGEST-INVERSION-1 (l.605-613), FORMAT-W2 (l.835-849), RETIRE-LISTS-E2A-PIPE-1 (l.951-955,
     porteur et déclencheur changés), RETIRE-CHILD-ROW-1 (l.961-964, déclencheur changé), R25-REGISTRY-ROOT-1 (l.1133-1142, fait),
     chemin de retrait (l.1764-1768, R-b fusionnée).
   - Outil : la version `d2332e2` de `reanchor.mjs` sortait `same` ou `unchanged-file` pour une ligne hors du fichier ; la version
     `a55a62d` la refuse (`OUT-OF-RANGE`, cas `reanchor-cases.mjs` rouge puis vert) et ne trouve aucune ancre de ce registre hors bornes.
8. **Parties que les fiches ne fixent pas**, choisies ici et à fixer par l'ADR du chantier : MK-L13 (PXC-11), MK-L34 (PXC-09 p1), MK-L35
   (PXC-09 p3), MK-L40 (PXC-16 p2), PX-Harness-06 (PXC-16, partie qui construit), garde BYO (lecture de UTS #39 en PXC-16 p1).
9. **Déclencheurs proposés à MONARK.** Levé : tous tranchés par MONARK. LOOPBACK-GUARD-RUNTIME-1 : ETAT l.623-624 à `5437cd0d`
   (PX-Harness-28) ; HOST-REDEPLOY-GUARD-1 : ETAT l.1401-1404 à `5437cd0d` ; HOST-HARNESS-PREV-1 : ETAT l.1625-1627 à `5437cd0d`, la
   question au fondateur datée par MSG2 l.6-8 ; SITE-SEND-PRUNE-1 : ETAT l.255 à `5437cd0d` (les trois, PX-Harness-22) ; lignes
   d'attente datées (P-25) de MK-L12, MK-L26, MK-L27, MK-L30, MK-L38 : ETAT l.270-273 à `5437cd0d` ; F-K-7 (MK-L15 ; même item que N8
   du registre de Hikae, sous lequel MONARK a retenu ce déclencheur, MSG l.44) : une ligne datée sous l'item avant le service de la
   vague 1, ETAT l.260 à `5437cd0d`, encore à écrire (porteur : MONARK, ETAT l.744) ; à `5437cd0d`, `grep -n F-K-7` rend l.260, l.392
   et l.882, et l'item (ETAT l.882-885 à `5437cd0d`) n'a pas de ligne datée.

## 8. Ligne PAROXYSME et sources

**Ligne PAROXYSME (2026-10-07, décisions de MONARK pliées, puis la G2 du pli ; 2026-10-08, second tour).** Harnais : 28 limites
ouvertes (dont 2 ⚑B : PX-Harness-04, -26) et 18 closes. Moteur : 40 limites ouvertes et 13 closes. Limites neuves à ETAT : 7 ici (§5,
mesurées à `87b821b0`). Aucune dette (§1) : les trois dettes de déclencheur du versement sont re-formées par MONARK (PX-Harness-28 :
ETAT l.623-624 à `5437cd0d` ; PX-Harness-22 : ETAT l.1401-1404 à `5437cd0d`, ETAT l.1625-1627 à `5437cd0d` et MSG2 l.6-8), et le
déclencheur de F-K-7 (MK-L15), dont la décision attendue au G0 court d'E-2a n'est pas consignée à ETAT, est re-porté (ETAT l.260 à
`5437cd0d`) ; toutes les entrées ouvertes ont un item, un porteur et un déclencheur atteignable, jugé à la lecture (l'oracle n'en
contrôle que la présence, §1). Deux demandes à MONARK dans la demande de fusion de #245 (échéance proposée : son commit d'ETAT de
cette fusion, MSG3 l.9-10) : le re-port de SENTINEL-DEPLOY-GUARD-1 et de SYNC-CHECK-MODE-1, dont le point d'étape est passé sans acte
(§1 ; §7, doute 3), et l'erratum de l'ancre d'ETAT l.1759 à `5437cd0d` (§7, doute 2). Doutes 2 (la clôture) et 9 levés (§7).

Fichiers du tronc cités, à `87b821b0` (lignes, sha256) :

| Fichier | Lignes | sha256 |
|---|---|---|
| `.github/workflows/ci.yml` | 269 | `636a5ac4950a93399a04a36eccdd7c330a3267210bd7f68df9fddf35b449597b` |
| `README.md` | 353 | `6324c8b220ccb5378d5458ca883190b7241b0d3cdbc1e42d9f1697051e58b5ad` |
| `SECURITY.md` | 50 | `429ac43ffb6f954d10da504515a767634ca46ff24a2f7e41124a763fbd88b596` |
| `apps/harness` | 8 | `2651c7cdf9bb99b8c32d0ddc24ad2eed242dbfa4a15cd8a962acaca6f4b55382` |
| `apps/harness/README.md` | 134 | `733479970acb68981dab5b3146f08ead3c4fdd4bbd8f3e1068d91c66a28baa7c` |
| `apps/harness/package.json` | 18 | `81f3fb23f1238575d435defc2c5428f031025ee08dd3bb3febd550a2dd449625` |
| `apps/harness/src/http.ts` | 117 | `621f0658f56b6c35d3606c478d0fa27654f5ffc0870545f57a598e5a221c576a` |
| `apps/harness/src/kata-path.ts` | 129 | `21ef898d8ed34b1d4d5fcd3d4550f41e047f2c79b5f8b692c3a9ba3e4de9644f` |
| `apps/harness/src/openapi.ts` | 113 | `7ef37cd342198e22b9b5afca466ca8f9f9626e8b3f4115bf900fbc63eb332d44` |
| `apps/harness/src/policy-digest-floor.ts` | 136 | `2d639b2bacbff554492e8615a6c1eef178e0b57cc4a4ed8a30c3cfa36f88035a` |
| `apps/harness/src/policy-guard.ts` | 136 | `daa6c63d844cca8a769e5f1783b3c0102731c7febba619982f24c5eeca5e53d8` |
| `apps/harness/src/policy-marginal.ts` | 68 | `62be1778e9dbdd7a5cdd6cf5c626bbc7b96063dfa2bb0f2265d3965dc32d06b0` |
| `apps/harness/src/policy-retire.ts` | 85 | `71bb678be2df0384262c150c59387a0cb4241bd1f9580e30c92ae6e1cb7c8d01` |
| `apps/harness/src/policy-wave2.ts` | 64 | `4e45e07156c7acd4d1fb27e74a1f924c30aefd0f998164c5d8195997a5fb7220` |
| `apps/harness/src/schema-projection.ts` | 543 | `7e3c48ca4c4967c03a788a7daddbc9bb17fdec4c1a2839dcfec236c5546a8ae5` |
| `apps/harness/src/server.ts` | 195 | `53d862e7f7efcb28e6b2f4d45d947faac52d3af10d63571f9770a3bc99563b69` |
| `apps/harness/src/tools/gate.ts` | 1070 | `7920ceaca2ce8231ecc2672b3a1ecd0e3a70c95971e80d225c107159558dadbd` |
| `apps/harness/src/tools/registry.ts` | 160 | `ab5a6f8a42a7731d7d8b93973d66b3c5d30d00bfa1159821dba582b917e620a2` |
| `apps/harness/src/version.ts` | 22 | `56c8cf039e6a40cdf159e37bc4382b92ed61a20335d0cd990d837c96d3dd0f86` |
| `apps/harness/test/` | 41 | `faff7266e16b1e1b0f95bd8fe599cbe3cd5158ef30a8cd8a43ffa8a1d09628ed` |
| `apps/harness/test/gate-liq.test.ts` | 438 | `86dbddd7a973c43965d164b5313de0d48dc4b322fe56d92602c0f4ff554d27ff` |
| `apps/sentinel/src/run.ts` | 400 | `b3b107033ceee8d060390c07ba37a98ea0360e5e0b0f6faf6faad15f5c6f81b5` |
| `apps/sentinel/src/timeline.ts` | 184 | `ac357e7ddae380cf687bd97add4f03916374a16f1a2e42e7276466b12c1f2958` |
| `apps/site/app/docs/integrators/page.tsx` | 189 | `6e9a4c5ae57787666b420c851b1fe720d988c5fe9b03dbc07790e26151b6f271` |
| `apps/site/app/docs/verify/page.tsx` | 189 | `906c714a2e31aa024cbf3110157169a182c4e153bcabf3fb752dcad7b8a34565` |
| `apps/site/data/harness-served.json` | 150 | `f47ed82f98bdcdb0738cf466442d2b78e841c34b21b23d0038f626584ba75c47` |
| `apps/site/lib/fleet.ts` | 429 | `998fdf33a3c461f687ec604524c63ee739ef1b7dd77acba571523aa979f232f4` |
| `deploy/Caddyfile.monark-harness` | 36 | `8c6bf12a49859404d3fe0b27c46b654dc31beb812ef7f6ed48fb5fd689ecaa2b` |
| `deploy/monark-harness.service` | 76 | `de5e96c2f4fcfd2894803bc0a40b4604d860ada533405f0829e414382bda03c7` |
| `deploy/monark-probe.service` | 44 | `985f8381de31f7cb071305c4eb01ae7df258d506ca3b2e124e7c23d3ef5f9ce8` |
| `deploy/monark-sentinel.service` | 60 | `d526f9c061c44814e0ca73cfeb996259d715c072319fd453caad3f39d4976e46` |
| `docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md` | 459 | `f44e0a91c75973e2d1b62874fd988824bf99b7229141ef8f76fc704216f24874` |
| `docs/ETAT.md` | 1904 | `3190de5c23507292414418cbb8b24e0f7c9f319dca64a0f5ae8c5009475a5b5a` |
| `docs/G0-lot-short-digest-inversion-1.md` | 838 | `c19b4cc96def0f3045ad850752abe0315593f9140184eb3d102012d4983e1ba4` |
| `docs/G7-lot-d-3.md` | 149 | `4b9ee6bc2cd19ed878ac64def6c59ec2eb8e6d316bc82902576f65ec2b0c8de0` |
| `docs/G7-lot-retire-path-ra.md` | 54 | `e20dfa588e20477460883cb1dee8b456f7af94f94cf965c46491befc11926132` |
| `docs/G7-lot-schema-projection-fail-closed-1.md` | 168 | `7730f6a08b8fa223aa27bba7fde1b561cca5f39f9878e4a6a4ff7fef16c8174d` |
| `docs/G7-lot-short-digest-floor.md` | 69 | `94b22436b7e2b67423e1859d03b8865880e74b7ad374e7cdc247ed7448aac1a1` |
| `docs/G7-lot-surfaces-1-1-0.md` | 107 | `4ab31c593a6141e4c31c9faccd7a0ba3fb8c29ec91cff5af87a348fde51b4734` |
| `docs/G7-lot-transport-500-schema-1.md` | 122 | `0ab2ecec14fb3fe5cb6e3514d60aaa669dfb072dff5e03d0e94e3c2396632dc1` |
| `docs/JOURNAL-PROVENANCE.md` | 466 | `7dfa3f0c8a5da8b0c5ad2807f10b377d03fc1fda895349490c8f834415f16e9f` |
| `docs/PAROXYSME-Dojo.md` | 853 | `56c3762e7ae9acd4fc3f8e0850a3750b343c4cb6f5968408f79d94503779674a` |
| `docs/RUNBOOK-harness.md` | 509 | `badd2e092d629d7f4ca69b51f15143d2c7e4ee78b019f00c6772a35e84a56ff1` |
| `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` | 331 | `64aa3e11a87ac59ce633d5191952824d06010970c34b73c749e1c1caa2430c7b` |
| `docs/adr/ADR-M005-harnais-mcp-appelable.md` | 208 | `177a8c33741c701416397aca414257a03827e71d73f69219d328aeb141a6764c` |
| `docs/adr/ADR-M006-skills-distribution.md` | 78 | `b74a444d5420b4fad07e1b0b07afe1e053586ae5d4c6a86b2c711a4e0b71419f` |
| `docs/adr/ADR-M015-phase-portefeuille.md` | 163 | `3f75b1bafacfd094a5156ff8b713e9bf018e5b82c2d76b5e68c5f6a6c3085638` |
| `docs/deploy-CA-harness.json` | 126 | `678d84c8428b8518565e0f00efb6079139b6c3cccee53a04075d4ac62ea8eba7` |
| `docs/public-notes/v0.9.0.md` | 62 | `3999c146971ea737240466b8b16302436adbe5a5cb4a496a084d9c2231756b94` |
| `fixtures/h5-e2e-trace.json` | 469 | `57d38c1907bfea4d7cb746186f9bada86bd210358c0a7902a61392957567fc19` |
| `packages/contracts/package.json` | 8 | `e3990a22d35cd758cc236f64742cfa8570058df6634a47b3c8cbd5bd419cfb80` |
| `schemas/prediction.schema.json` | 17 | `3ca09b90c553dd044069eda59eaa8789cb800e255165bb53771348edf72a3013` |
| `scripts/spec-publish.mjs` | 362 | `d0bf16aafae561896378f001e44ce3a1d47603ea78b1e03758a51c0338a27e82` |
| `scripts/sync-harness-served.mjs` | 326 | `273563118024ce275eac93327f96bf6174e7f35f435d5fc5c71f1198dc6e8b73` |
| `scripts/verify-harness.mjs` | 588 | `2cf68a6026d65b765002df0c05c4601bfe8896b8d6f06d36872aba047ae686cf` |
| `skills/monark/DEMO.md` | 104 | `3ff6ea4abacd657909da689ecad2a68a9b2e84116561bda7e8b63b9f94e28836` |
| `skills/monark/SKILL.md` | 79 | `63f52be6a3a6243bab45409fc19d05d88afbed1dfe9236c182501f811e057c8c` |
| `test/byo-demo-probe.test.ts` | 210 | `5a4c18981b5673bd08bb62a2caeb47102772d0bcca3f84fecd02d914ef6b6118` |
| `test/harness-served.test.ts` | 923 | `3143fc6ab8f71785598b4ca42e7a109146cbc7804bb4473bd68956b807e76727` |

Sources hors du tronc (boîte PAROXYSME) :

| Source | Lignes | sha256 |
|---|---|---|
| INV-H, boîte PAROXYSME, `dossier/etude-2026-10-06/inventaire/` | 158 | `111ad4e4bdc068c865c502f6b773e982faa728d65b5648e8b92b6969b182e128` |
| INV-M, même dossier | 350 | `d724157e6f458e9dbc9fbd807bd364a825060b476e95526a51520fdf6ebf99ed` |
| CC, boîte PAROXYSME `dossier/etude-2026-10-06/CHANTIERS-CANDIDATS.md` | 1 260 | `86ed73a23b0bfd8e2da5ea40de3818ae8a105a7d406c6bc0607fb8914c5dcc60` |
| PLAN, même dossier, `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` | 1 195 | `96b5b01858886906930f8be6e76094294dd71a9878a34b9b71804a160a645714` |
| `coordination/pieces/2026-10-07-registres/reanchor.mjs`, commit `a55a62d` | 69 | `2edae6398e35a39d750cca2951cf4349380971066acb23bd1dbe965d9f88ca4b` |
| `coordination/pieces/2026-10-07-registres/reanchor-cases.mjs`, commit `a55a62d` | 34 | `8290f603765cb9c5399293e40ed15178097909147a333c37a48cff3788c8b9da` |
| `coordination/pieces/2026-10-07-registres/verify-registres.mjs`, commit `d97d838` | 127 | `6d71141222d2c32b995cd30e11335501e7021f4b2c7a38fb25053a61efe8712b` |

Sources du pli des décisions de MONARK (2026-10-07) : ETAT à `5437cd0d` (tronc) ; MSG, message de MONARK `d6331f6`,
`coordination/messages/2026-10-07-MONARK-vers-PAROXYSME-tache1-fusionnee-decisions.md` ; MSG2, message de MONARK `8eb9a46`,
`coordination/messages/2026-10-07-MONARK-vers-PAROXYSME-host-prev-date.md` ; et pour le second tour, MSG3, message de MONARK `0c8fb24`,
`coordination/messages/2026-10-07-MONARK-vers-PAROXYSME-245-p7-ordre.md` (boîte PAROXYSME) :

| Source | Lignes | sha256 |
|---|---|---|
| `docs/ETAT.md` à `5437cd0d` | 2 089 | `64afc212a18bc683d892c7c7c6362abba46c1a4ed5db11061f4b25b63d07b0a9` |
| MSG, message `d6331f6` de la boîte PAROXYSME | 90 | `03f305908703f119cc82c7b9f0a29684f720c0eab0997514c019fe068b64306a` |
| MSG2, message `8eb9a46` de la boîte PAROXYSME | 11 | `620ac327b3acf49cd472a5340e4ea53a4b287d265dac9489ea639e58ad2c30e4` |
| MSG3, message `0c8fb24` de la boîte PAROXYSME | 18 | `639a6761c3c3a42647194dd9c817e21986adf91aef3f6a5af2aaf7952260d7bb` |
