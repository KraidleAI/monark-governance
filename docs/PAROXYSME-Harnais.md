# PAROXYSME-Harnais : registre intérimaire des limites du Harnais (la porte) et du moteur 1.1.0 avec ses katas

- **Objet** : versement intérimaire (a′) du plan de route PAROXYSME v3 (§4.1 A, §6 « Transition ») : la pièce `built` Harness reçoit son
  registre, et les limites du moteur 1.1.0 et des katas y sont versées (« Harnais avec les limites du moteur », plan §4.1 A).
- **Règle** (règles « Dettes » et « PAROXYSME » de l'investisseur ; décision 251 rappelée par `docs/PAROXYSME-Dojo.md`) : une limite
  déclarée n'est jamais une fin ; elle mène à un item, à une campagne, puis à une décision. Ici, chaque entrée ouverte porte un item, un
  porteur et un déclencheur ; ce qui ne se reproduit pas tel quel à la tête va à un doute nommé (§7).
- **Provenance** : écrit par PAROXYSME (`claude-opus-5-5`, effort max) le 2026-10-07 à partir de 17:1x UTC, tâche 1 du tableau MONARK ↔
  PAROXYSME. Sources : les inventaires validés du Harnais et du Moteur (dossier d'étude du 2026-10-06), la couverture de
  `CHANTIERS-CANDIDATS.md` §4 et les fenêtres du plan v3 §4 (chemins et empreintes au §8). Relecture : une G2 par une instance neuve ;
  contrôle par diff, fusion et ligne d'ETAT : MONARK.
- **Bases** : inventaires mesurés à `d8fe354c`, ETAT lu à `57a131fc`. Toutes les ancres de ce registre sont à la tête `87b821b0` de
  `lot/etude-suite` (relue par `git ls-remote` le 2026-10-07 à 17:1x UTC), reportées par l'outil `reanchor.mjs` (pièce de la boîte
  PAROXYSME, commit `d2332e2`) : les 44 plages d'ETAT citées par les deux inventaires se reportent avec un texte identique ; hors
  d'ETAT, deux fichiers ont des ancres dans un hunk changé (`docs/RUNBOOK-harness.md` l.159, l.186, l.214 ; `scripts/spec-publish.mjs`
  l.284-297), relues aux entrées qui les citent (PX-Harness-09, C-15, MK-L14), et une ancre citée ici se déplace au même texte
  (`apps/harness/src/policy-guard.ts` l.108-109 → l.110-111, MK-C04).
- **Préséance** : `docs/ETAT.md` l.7-11 ; ETAT prime. Un item nommé hors d'ETAT et du code n'est pas compté comme formé : il est écrit
  « à former » et porté par son chantier.
- **Labels** : aucun ne change (`built` du Harness et du Backbone, `upcoming` des lignes kata calibrées) ; `apps/site/lib/fleet.ts`
  n'est pas touché par ce versement.

## 0. Comment lire ce registre

- **Une entrée par limite**, ouverte par le préfixe `- **`, sur quatre lignes au plus (forme de `docs/PAROXYSME-Dojo.md` §0).
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
  0006, addN, A-2, F9 = sources du dépôt de RECHERCHES (`kata/spec/CONTRACT-1.1.0.md`, `KATA-SPEC.md`, `decisions/…`), citées par la
  ligne que l'inventaire a lue, non relues ici (§7, doute 1).

## 1. Dettes : limites sans item, sans porteur ou sans déclencheur

- Aucune. Chaque entrée ouverte des §2, §3 et §5 porte un item, un porteur et un déclencheur ; le contrôle est mécanique (§7, doute 5).

## 2. Harness : limites ouvertes, changées ou nouvelles (28, INV-H §3)

- **PX-Harness-01** · « Version servie 0.4.0 sous la release publique v0.9.0 ; la règle du code (bump avec le tag) n'est pas tenue. »
  source : `apps/harness/src/version.ts:5-7`, `:22` ; `apps/site/data/harness-served.json:5`, `:126-132` ; `docs/JOURNAL-PROVENANCE.md:447` ·
    touche : `README.md:65`, `:285` ; `SECURITY.md:27-30` · nature : C
  item : PXC-16 HARNESS-NEXT-1, partie 2 (HARNESS-VERSION-ALIGN-1, à former ; question Q-H1 à la partie 1) · porteur : PAROXYSME ;
    republication au registre MCP : acte du fondateur · déclencheur : Q-H1 en F2 ; construction à la release de textes servis (F3)
  état : ouvert (aggravé à T0) · suite : octets servis déplacés (OpenAPI, notes datées, CA, synchro) : release, jamais pendant une vague
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
  item : SENTINEL-DEPLOY-GUARD-1 (absent d'ETAT, re-formation par MONARK, PX-STD-ORPHAN-1) ; construit par PXC-05 partie 1, PR 2 · porteur :
    PAROXYSME (chantier) ; MONARK (ligne d'ETAT, RUNBOOK-HARNESS-SENTINEL-DIFF-1) · déclencheur : PR 2 fusionnée avant le SHA nommé d'E-2a (F1-F2)
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
  état : ouvert · suite : la partie qui construit est fixée par l'ADR de PXC-16 ; R-8 si une dépendance entre
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
  item : PXC-05 partie 2, volet kata (CA-1-1-0-CHECKS-1, construit au code) ; KATA-CA-PUBLISHED-TABLES-1 (ETAT l.824-827) · porteur :
    PAROXYSME ; CA engagée : MONARK · déclencheur : la première CA engagée à 18 contrôles, au prochain déploiement (MONARK, `07d99e2`)
  état : changé (preuve partielle : essai de MONARK du 2026-10-07, 18 sur 18, `checked_at` 12:56:15Z, non engagé, §7 doute 6) · suite : la CA
    engagée reste à 15 contrôles jusqu'aux actes 2 à 6 de la release L ; KATA-CA-PUBLISHED-TABLES-1 : RECHERCHES, avant T_f(c)
- **PX-Harness-10** · « Jauge de demande D8 indécidable telle que déployée : le journal ne voit pas l'outil appelé sous `/mcp`. »
  source : `docs/adr/ADR-M015-phase-portefeuille.md:150-151`, `:154` ; `deploy/Caddyfile.monark-harness:26-28` ;
    `docs/adr/ADR-M006-skills-distribution.md:49` · touche : garde de Genkan (`README.md:43`) · nature : M
  item : PXC-16 partie 1 (HARNESS-DEMAND-J30-1, à re-former ; question Q-H2 : propriétaire unique Harness pour PX-Narabi-15) · porteur :
    PAROXYSME ; lecture du journal sur l'hôte : MONARK · déclencheur : lecture D8 le 2026-10-18 (J+30), en F2
  état : changé (D8 datée, absente d'ETAT) · suite : Dwork-Roth est libre (PLAN §7.1, reclassé) : lecture, pas procurement
- **PX-Harness-11** · « La fenêtre « après » de la mesure BYO-400 contient deux changements servis ; les 400 de B-0 et B-1 ne sont plus attribuables. »
  source : ETAT l.1458-1463 ; ETAT l.1570 (étape 4, 2026-10-04T07:44:08Z) ; `docs/JOURNAL-PROVENANCE.md:445` (bascule 1.1.0) ;
    `SECURITY.md:46-48` · touche : aucune · nature : M
  item : HARNESS-BYO-400-RATE-1 (ETAT l.1458-1463 ; porteur MONARK, l.1544) ; amendement en trois sous-fenêtres par PXC-16 partie 1 ·
    porteur : MONARK (lecture) ; PAROXYSME (texte de l'amendement, par message) · déclencheur : lecture le 2026-10-10 après 22:34 UTC
  état : changé (par T0) · suite : amendement proposé avant la lecture ; compte par code impossible sans PX-Harness-10
- **PX-Harness-12** · « Le harnais ne déclare aucune annotation d'outil MCP, que le SDK servi accepte ; la prémisse de l'ADR est fausse. »
  source : `apps/harness/src/tools/registry.ts:141-147` ; `docs/adr/ADR-M005-harnais-mcp-appelable.md:159` ; SDK `@modelcontextprotocol`
    2.0.0 [lu] (INV-H l.45) · touche : `README.md:65` ; `skills/monark/SKILL.md:9` · nature : P/C
  item : PXC-16 partie 2 (HARNESS-TOOL-ANNOTATIONS-1, à former ; test sur `tools/list`) · porteur : PAROXYSME · déclencheur : release de
    textes servis (F3) ; go du fondateur (octets de `tools/list` déplacés)
  état : changé · suite : réserve du SDK à écrire (un client ne décide pas sur l'annotation d'un serveur non fiable)
- **PX-Harness-13** · « Révision MCP négociée « 2025-11-25 » contre 2026-07-28 nommée par l'ADR, écart déclaré « annotation seule ». »
  source : `docs/adr/ADR-M005-harnais-mcp-appelable.md:113-114`, `:188-189` ; `fixtures/h5-e2e-trace.json` ; SDK [lu] (INV-H l.46) ·
    touche : aucune · nature : P
  item : PXC-16 partie 1 (MCP-PROTOCOL-REVISION-1, à former) · porteur : PAROXYSME ; lecture sur place de la révision : MONARK (PLAN §7.2) ·
    déclencheur : partie 1 de PXC-16 (F2)
  état : ouvert · suite : la propriété sans état est mesurée ; la révision du SDK suit l'amont
- **PX-Harness-14** · « `Host` illisible rend un 500 ; flux sans écouteur `error` ; corps ajouté à un corps commencé. »
  source : `apps/harness/src/server.ts:168`, `:172-175` ; `docs/G7-lot-transport-500-schema-1.md:120` (N-6) ·
    touche : `README.md:258` (forme des 500) · nature : C
  item : PXC-16 partie 1 (HARNESS-TRANSPORT-CATCH-1, nommé au G7, absent d'ETAT : à porter à ETAT par MONARK, PXC-01) · porteur :
    PAROXYSME ; inscription à ETAT : MONARK · déclencheur : partie 1 de PXC-16 (F2)
  état : ouvert · suite : ligne de changement servi si un octet servi bouge
- **PX-Harness-15** · « Résidus de la projection des schémas laissés par défaut ; sous PAROXYSME, « laisser » demande l'option B datée. »
  source : ETAT l.1190 ; `docs/G7-lot-schema-projection-fail-closed-1.md:153-168` · touche : `README.md:274-277` (schémas fermés) · nature : C
  item : DYNAMIC-ELSEWHERE-1, NESTED-ID-ELSEWHERE-1, DEFINITIONS-KEYWORD-1, UNKNOWN-KEYWORD-OBJECTS-1 (ETAT l.1190, défaut « laisser ») ;
    option B par PXC-16 partie 1 · porteur : PAROXYSME · déclencheur : partie 1 de PXC-16 (F2), ou le premier lot qui touche
    `apps/harness/src/schema-projection.ts`, le premier des deux
  état : ouvert · suite : option B ≈ 14 lignes de code et 23 de test (estimation du G7) ; aucun octet servi
- **PX-Harness-16** · « Des imitations ASCII hors réduction passent la garde des noms BYO ; homoglyphes non ASCII par appel direct ; faux refus déclarés. »
  source : `docs/G7-lot-d-3.md:94-96` ; ADR-CM l.231-232 ; ETAT l.1542 (BYO-HOMOGLYPH-1 « sans déclencheur ni prix »), l.1553-1555 ·
    touche : `skills/monark/SKILL.md:72` ; codes `byo_*` (C §13) · nature : C/T
  item : BYO-ASCII-LOOKALIKE-1 (ETAT l.1539-1540, RECHERCHES), BYO-LOOKALIKE-RESIDUAL-1, BYO-HOMOGLYPH-1, par PXC-16 · porteur : PAROXYSME ·
    déclencheur : lecture de UTS #39 en partie 1 (F2) ; garde servie à la release de la partie 2 (F3), sous go du fondateur (ligne B)
  état : ouvert · suite : même limite que MK-L31 ; donne à BYO-HOMOGLYPH-1 le déclencheur qu'ETAT ne lui écrit pas
- **PX-Harness-17** · « Le chemin kata est servi sans aucune ligne : 32 classes s'abstiennent toujours. »
  source : C l.503 ; `apps/harness/src/tools/gate.ts:231-238` ; `docs/G7-lot-retire-path-ra.md` (Mesures) · touche : `skills/monark/SKILL.md:72` ;
    description servie de `gate` · nature : D/C
  item : chemin des vagues à ETAT : E-2a, RETIRE-LISTS-E2A-PIPE-1 (l.947-950), KATA-CLAUSE-COMMITTED-STATE-1 (l.807-811), VERIFIERS-LIST-F5A-1
    (l.567-590), SHORT-DIGEST-INVERSION-1 (l.599-613) · porteur : ceux d'ETAT (MONARK, RECHERCHES) · déclencheur : service de la vague 1
  état : changé (R-b fusionnée, l.1764-1766 ; plancher d'empreinte fusionné, l.605-613) · suite : vague 1 vers le 2026-10-20, vague 2 visée au
    2026-11-16 (ETAT l.26-32) ; go de service distinct (Q-F5)
- **PX-Harness-18** · « La porte ne recompute pas la valeur kata et ne contrôle pas les barres derrière `features_digest`. »
  source : C l.343 · touche : spécification publiée, §9 · nature : T/P
  item : KATA-INPUT-RECOMPUTE-1 (ETAT l.747-749) ; PXC-13 K8-CALLER-INPUT-1, partie 3 · porteur : RECHERCHES (spécification et code),
    MONARK (version et déploiement), selon ETAT · déclencheur : le G0 de la prochaine version du contrat (ETAT l.748-749), en F4
  état : changé (item formé à ETAT depuis l'inventaire) · suite : prix écrit à ETAT : une version du contrat, 3 à 5 j
- **PX-Harness-19** · « Les lignes kata ne sont pas recomputables par un tiers : scores ni publiés ni tenus ; séries non redistribuables. »
  source : C l.490-495 ; A-2 l.135 ; ETAT l.242-245 · touche : C §11 ; `apps/site/app/docs/verify/page.tsx:67` · nature : D/Dr
  item : PXC-11 partie 3 (KATA-ROW-PUBLIC-RECOMPUTE-1, à former : droits de publication des scores dérivés, engagement et preuve de rang,
    ou deux vérificateurs indépendants) ; partiel : VERIFIERS-LIST-F5A-1 · porteur : PAROXYSME · déclencheur : partie 3 de PXC-11 (F3)
  état : changé (Q-B (v) tranchée « oui » le 2026-10-07 ; textes des accords encore demandés) · suite : même famille que MK-L11
- **PX-Harness-20** · « Le retrait d'une ligne servie attend la clôture du trimestre ; premier retrait `live:` après le 2027-01-01. »
  source : addendum 9 §6-§7 ; ETAT l.533-542, l.956-971 · touche : aucune aujourd'hui ; bornera la vague 1 servie · nature : T/M
  item : PXC-10 CM-5-RETIRE-1, partie 2 (ANYTIME-RETIRE-1, à former) ; à ETAT : CM-5-PLAN-1, RETIRE-EVIDENCE-BIND-1, RETIRE-ADR-CAUSE-FILE-1,
    RETIRE-CHILD-ROW-1 · porteur : PAROXYSME (chantier) ; ceux d'ETAT pour ses items · déclencheur : partie 2 de PXC-10 (F4)
  état : changé (CM-5 : c3 et c4 à RECHERCHES, ETAT l.535-537) · suite : même construction que MK-L21
- **PX-Harness-21** · « Un appel tardif de 300 s au plus est servi ; rien ne vérifie qu'il est fait sans information sur le mouvement. »
  source : `apps/harness/src/tools/gate.ts:212`, `:237` ; ADR-CM l.328, l.331 · touche : clause kata servie (`gate.ts:237`) · nature : M
  item : LATE-CALL-WINDOW-1 (ETAT l.775-778 ; ADR-CM l.331, ligne datée (15)) ; DECIDED-AT-1 se rouvre avec lui (ETAT l.828-831) ; PXC-13 ·
    porteur : MONARK (la mesure, acte d'hôte) ; RECHERCHES (le texte si la borne change) · déclencheur : le service de la vague 1
  état : ouvert · suite : même limite que MK-L16 ; prix à ETAT : mesure 0,25 j, version 3 à 5 j si la borne change
- **PX-Harness-22** · « Hygiène de l'hôte : garde de redéploiement procédurale, arbres et sauvegardes accumulés. »
  source : ETAT l.1259-1261, l.1464-1473, l.902-905 · touche : aucune · nature : C
  item : HOST-REDEPLOY-GUARD-1, HOST-HARNESS-PREV-1, SITE-SEND-PRUNE-1 (ETAT) ; PXC-05 partie 3 · porteur : MONARK (ETAT) · déclencheur :
    le prochain redéploiement du harnais (ETAT l.1261, l.1469) ; suppressions sur accord du fondateur
  état : ouvert · suite : HOST-REDEPLOY-GUARD-1 absorbé par SENTINEL-DEPLOY-GUARD-1 (PLAN §4.1 A)
- **PX-Harness-23** · « Aucun audit planifié des dépendances de l'arbre servi ; l'audit ne tourne qu'en CI de PR. »
  source : `.github/workflows/ci.yml:18-19`, `:243-244` ; `apps/harness/package.json` (SDK 2.0.0 épinglé) · touche : `SECURITY.md:27-30` ·
    nature : P
  item : PXC-05 partie 3 (HARNESS-DEP-WATCH-1, à former, avec la sonde de PX-Harness-05) · porteur : PAROXYSME · déclencheur : partie 3 de
    PXC-05 (F3)
  état : ouvert · suite : CI-WORKFLOWS-SET-1 si la veille passe par GitHub Actions
- **PX-Harness-24** · « Le commentaire du journal d'accès dit « route, hôte, méthode, statut » ; `SECURITY.md` dit qu'il garde l'adresse du client. »
  source : `deploy/Caddyfile.monark-harness:27-28` ; `SECURITY.md:46-47` · touche : `SECURITY.md:43-48` ; `README.md:294` · nature : Dr/texte
  item : PXC-02 partie 2 (commentaire aligné) ; PXC-18 JURISTE-DROIT-1, partie 1 (avis, sous-question au dossier juriste) · porteur :
    PAROXYSME ; FAITS sur les champs du journal de Caddy : MONARK (lecture sur place) · déclencheur : parties en F3
  état : ouvert · suite : aucun avis au point d'accès aujourd'hui
- **PX-Harness-25** · « Une seule version parlée, préavis nul pour 1.1.0 : sans règle écrite, la version suivante cassera les appelants le jour même. »
  source : C l.20, l.584 ; `docs/public-notes/v0.9.0.md:8` · touche : spécification §15 · nature : Dr/T
  item : PXC-16 partie 1 (question fermée Q-H3 : préavis, recouvrement, ou préavis nul écrit) ; PXC-18 partie 2 (décision écrite) · porteur :
    PAROXYSME (la question) ; le fondateur (la décision, par MONARK) · déclencheur : avant la release de textes servis (PLAN §7.3), en F3
  état : ouvert · suite : la décision précède la bascule 1.2.0
- **PX-Harness-26** · « La capture servie du site n'a pas de mode `--check` : un redéploiement sans synchro n'est vu par aucun contrôle non-LLM. »
  source : `scripts/sync-harness-served.mjs` (aucun `--check`) ; `test/harness-served.test.ts:210` · touche : `README.md:70` · nature : M/C · ⚑B
  item : SYNC-CHECK-MODE-1 (absent d'ETAT, re-formation par MONARK, PX-STD-ORPHAN-1) ; construit par PXC-05 partie 1, PR 1 · porteur :
    PAROXYSME ; MONARK (ligne d'ETAT) · déclencheur : PR 1 de PXC-05 partie 1 (F1, tâche 4 du TABLEAU ; après la décision P-28)
  état : ouvert · suite : si le débit ne tient pas, la PR 1 glisse après le service de la vague 1 (PLAN §4.0)
- **PX-Harness-27** · « Le skill ne renvoie pas aux fichiers Bell que le README promet aux agents ; note kata 15m absente d'ETAT. »
  source : `docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md:299` (R-11) ; `docs/G7-lot-surfaces-1-1-0.md:107` · touche : `README.md:238-243` ;
    `skills/monark/SKILL.md:72` · nature : C/texte
  item : PXC-02 partie 2 (skill) ; R-11 et SKILL-KATA-15M-NOTE-1 à re-former à ETAT (MONARK, PXC-01) · porteur : PAROXYSME ; lecture sur
    place des listes publiques (registre MCP, ClawHub) : MONARK · déclencheur : partie 2 de PXC-02 (F3)
  état : ouvert · suite : republication = acte de compte du fondateur
- **PX-Harness-28** · « La garde de port des tests est lexicale : nom calculé, alias, `PORT=0`, dgram lui échappent. »
  source : ETAT l.482-485 · touche : aucune · nature : C
  item : LOOPBACK-GUARD-RUNTIME-1 (ETAT l.482-485) · porteur : RECHERCHES (ETAT) · déclencheur : après CM-3c (ETAT l.485)
  état : ouvert · suite : garde d'exécution chargée par `--import` ; prix mesuré à son G0

## 3. Moteur 1.1.0 et katas : limites ouvertes (40, INV-M §3 ; MK-L14 close à la tête, §4)

- **MK-L01** · « L'énoncé par calibration ne vaut que sous points CALIB échangeables, « assumed, not shown ». »
  source : 0005 l.94 ; 0006 l.71 ; F9 l.97-103 ; C l.500 · touche : aucune aujourd'hui (aucune ligne kata servie) · nature : T
  item : KATA-EXCH-TEST-1 (ETAT l.762-765) ; PXC-09 CONFORMAL-PX-2, partie 1 (campagne) · porteur : RECHERCHES (ETAT) ; PAROXYSME
    (campagne) · déclencheur : avant le G0 court de la vague 2 (ETAT l.763-764) ; campagne en F3
  état : changé (item formé à ETAT depuis l'inventaire) · suite : le test borne le temps d'exposition, il ne prouve pas l'échangeabilité
- **MK-L02** · « Aucun énoncé à échantillon fini sous dépendance sérielle à α 0,01 aux tailles kata ; la borne de couplage est vide. »
  source : F9 l.36, l.47-57, l.109-111 · touche : phrase servie proposée (F9 l.99) · nature : T
  item : F-W2-9a, F-W2-9b, F-W2-9c (ETAT l.753-761) ; PXC-09 partie 2 · porteur : RECHERCHES ; MONARK pour le suivi en ligne de 9c (ETAT) ·
    déclencheur : ceux d'ETAT (9a : une demande de lignes au tampon ; 9b : le premier ADR qui la propose ; 9c : le suivi en ligne)
  état : changé (formés à ETAT) · suite : chiffre de R4 v3 pour F-W2-9a : 5 à 8 j (ETAT l.737-742) ; partie 2 de PXC-09 en F4
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
  item : PXC-09 partie 3 (famille) ; F-W2-4 à re-former à ETAT (MONARK, PXC-01) · porteur : PAROXYSME · déclencheur : partie 3 de PXC-09
    (F4) ; re-formation au prochain point d'étape
  état : ouvert · suite : lecture de son déclencheur (« calib_attempt 2 ») à confirmer par RECHERCHES (INV-M doute 6)
- **MK-L06** · « Position tenue : l'énoncé vaut par fenêtre ; sur cent fenêtres renouvelées ou plus, la borne de Boole est vide. »
  source : 0006 l.229 ; 0005 l.131 ; F9 l.84, l.102 · touche : textes des tampons à P4 · nature : T
  item : F-W2-9a (ETAT l.753-755) ; PXC-09 partie 2 · porteur : RECHERCHES (ETAT) · déclencheur : une demande de lignes au niveau du tampon
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
  item : W2-MKL09-ADDENDUM-1 (ETAT l.766-767) ; F-W2-9b (ETAT l.756-758) ; PXC-02 (texte) et PXC-09 partie 2 · porteur : RECHERCHES (ETAT) ·
    déclencheur : avant le G0 court de la vague 2 (ETAT l.767)
  état : changé (formé à ETAT) · suite : textes de Q-B, avant le G0 court d'E-2a (PLAN §4.1 B)
- **MK-L10** · « Vague 2b : six simplifications « accepted » ; 2b est différée et refusée par la garde. »
  source : 0006 l.24, l.296-303 ; `apps/harness/src/policy-guard.ts:43` · touche : rapport 2b, à venir · nature : T/D
  item : PXC-17 partie 1 (campagne courte avant P0-2b) ; partiel : FAITS-FUNDING-HOURS-1 (ETAT l.1750) · porteur : PAROXYSME ·
    déclencheur : campagne D1 en F3, D2 à D4 en F4
  état : ouvert · suite : aucune
- **MK-L11** · « Recalcul par un tiers impossible : séries privées et non redistribuables ; scores ni publiés ni tenus. »
  source : ETAT l.242-245 ; C l.490-494 ; A-2 l.158-162 ; 0005 l.32 · touche : C §11 (l.451, bornée par l.490) · nature : D/Dr
  item : PXC-11 partie 3 (KATA-THIRD-PARTY-RECALC-1, à former : recette publique de reconstitution, ou preuve vérifiable du calcul) ·
    porteur : PAROXYSME · déclencheur : partie 3 de PXC-11 (F3), le droit d'abord
  état : changé (Q-B (v) tranchée le 2026-10-07) · suite : même famille que PX-Harness-19
- **MK-L12** · « Un seul vérificateur, dans la même organisation que le générateur ; identité sans signature. »
  source : `apps/harness/src/policy-guard.ts:24`, `:100-104` ; K l.74 · touche : C §11 l.493 · nature : P/T
  item : VERIFIERS-LIST-F5A-1 (ETAT l.567-590) pour les champs et les ulps ; PXC-11 partie 5 (KATA-VERIFIER-EXTERNAL-1, à former) ·
    porteur : ETAT par partie (l.588-590) ; PAROXYSME (partie 5) · déclencheur : partie 5 de PXC-11 (F5, un tiers)
  état : changé (partage 80/20 des parties, ETAT l.588-590) · suite : ligne d'attente datée au versement
- **MK-L13** · « La garde d'import ne recalcule pas `qhat`, `misses`, `k_obs` des bandes ; CALIB-SEQ-IMPORT-1 chiffré puis non adopté. »
  source : A-2 l.100, l.158-164 ; add8 l.13, l.23 · touche : C §11 l.490-494 · nature : T/C
  item : CALIB-SEQ-IMPORT-1 à re-former à ETAT (MONARK, PXC-01 ; suites scellées hors dépôt, ou raison écrite datée) ; PXC-11 · porteur :
    PAROXYSME (chantier) ; MONARK (ligne d'ETAT) · déclencheur : re-formation au prochain point d'étape ; construction à l'ADR de PXC-11 (F3)
  état : ouvert · suite : compatibilité avec 0006 l.196 à trancher
- **MK-L15** · « K-8 : le serveur ne vérifie ni que `yhat` sort du kata déclaré, ni les barres derrière `features_digest`. »
  source : C l.343 ; `apps/harness/src/kata-path.ts:59`, `:75`, `:96` ; K l.78 · touche : C §9 ; K §7 ; `docs/public-notes/v0.9.0.md:26-31` ·
    nature : T/C
  item : F-K-7 (ETAT l.743-746) ; PXC-13 partie 1 · porteur : MONARK (ETAT) · déclencheur : la première ligne kata servie, décision au G0
    court d'E-2a (ETAT l.744-745)
  état : changé (formé à ETAT) · suite : la construction suit KATA-INPUT-RECOMPUTE-1 (PX-Harness-18)
- **MK-L16** · « Fenêtre de retard ]t, t + 300 s] : un appel tardif n'est dans l'énoncé que fait sans information. »
  source : ADR-CM l.328, l.331 ; `apps/harness/src/kata-path.ts:47` · touche : C §9 l.312 ; `apps/harness/src/tools/gate.ts:237` · nature : T
  item : LATE-CALL-WINDOW-1 (ETAT l.775-778) ; PXC-13 · porteur : MONARK (mesure) ; RECHERCHES (texte) (ADR-CM l.331) · déclencheur : le
    service de la vague 1
  état : ouvert · suite : même limite que PX-Harness-21
- **MK-L17** · « Horloge du serveur non attestée : grille, retard et futur lisent une horloge dont la dérive n'est pas publiée. »
  source : C l.79 ; `apps/harness/src/kata-path.ts:47` · touche : C §3 l.79, §9 l.312 · nature : T/P
  item : SERVER-CLOCK-BOUND-1 (ETAT l.750-752) ; PXC-13 partie 2 · porteur : MONARK, hôte (ETAT) · déclencheur : la forme avant le G7
    d'E-2a ; la construction avec la release suivante (ETAT l.751-752)
  état : changé (formé à ETAT) · suite : prix à ETAT : 0,5 j
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
    porteur : PAROXYSME (chantier) ; ETAT pour CM5-MONTHLY-GAP-1 · déclencheur : partie 2 de PXC-10 (F4)
  état : ouvert · suite : Ramdas et al. 2023, Howard et al., Waudby-Smith-Ramdas : libres, lecture sur place avant tout chercheur
- **MK-L22** · « Pas de surveillance par clé kata ; l'`evidence_sha256` des retraits dépend du relevé de CM-5. »
  source : ETAT l.533-537, l.965-967 ; ADR-CM l.67 ; `apps/harness/src/policy-retire.ts:15` · touche : 0005 l.114, l.131 · nature : C/M
  item : CM-5-PLAN-1 (ETAT l.533-537) ; RETIRE-EVIDENCE-BIND-1 (ETAT l.965-967) ; PXC-10 partie 1 · porteur : RECHERCHES (CM-5, c3 et c4) ;
    MONARK (oracles d'hôte ; RETIRE-EVIDENCE-BIND-1) · déclencheur : T0, atteint ; le premier retrait `live:` (ETAT l.966-967)
  état : changé (G0 de CM-5 écrit par RECHERCHES ; partage daté, ETAT l.535-537) · suite : partie 1 de PXC-10 après la mesure de R-b (F3)
- **MK-L23** · « Une cause de retrait `adr:` n'est contrôlée que dans sa forme ; rien ne la lie à un fichier ni à son sha256. »
  source : ETAT l.968-971 ; `apps/harness/src/policy-retire.ts:51-53` · touche : C §10 l.441-447 · nature : T/C
  item : RETIRE-ADR-CAUSE-FILE-1 (ETAT l.968-971) ; PXC-10 partie 2 · porteur : MONARK (ETAT) · déclencheur : la première liste qui porte
    une cause `adr:` (ETAT l.970-971)
  état : ouvert · suite : aucune
- **MK-L24** · « Recalibration non servable au-delà de l'essai 2 ; la cause `epoch:` est refusée sans journal épinglé. »
  source : `apps/harness/src/policy-guard.ts:57-58`, `:92-93` ; `apps/harness/src/policy-retire.ts:51-53` ; ETAT l.956-960 ·
    touche : C §10 l.441-447 · nature : C
  item : PXC-10 partie 3 (KATA-RECALIB-PATH-1, à former) ; partiel : RETIRE-CHILD-ROW-1 (ETAT l.956-960), EPOCH-EVENTS-1 (ETAT l.1743) ·
    porteur : PAROXYSME (chantier) ; MONARK (RETIRE-CHILD-ROW-1) · déclencheur : partie 3 de PXC-10 (F4) ; la généralisation d'E-1c
  état : ouvert · suite : aucune
- **MK-L25** · « Empreintes P0 sans horodatage tiers ; « never withdrawn » ne tient que par le propriétaire du dépôt de la spécification. »
  source : 0005 l.127, l.161 ; C l.441, l.449, l.587 · touche : C §10 l.449, §15 l.587 · nature : Dr/P
  item : PXC-15 LOG-TIME-2, partie 3 (ancrage OpenTimestamps des empreintes P0 et du manifeste de chaque version) · porteur : PAROXYSME ;
    acte du fondateur (revenir sur Q-7) · déclencheur : Q-7 avant le 2026-11-16 (PLAN §7.3), puis partie 3 de PXC-15
  état : ouvert · suite : réemploi d'ADR-BELL-OTS-ANCHOR-1
- **MK-L26** · « Aucune classe kata n'a de sujet attesté : `attested` est toujours refusé, la jointure attest → gate est dormante. »
  source : C l.85 ; 0005 l.121 ; ADR-CM l.189-191 · touche : `apps/harness/src/tools/gate.ts:234` · nature : T/P
  item : PXC-08 SHOGEN-SEAM-1, partie 3 (ATTEST-KATA-SUBJECT-1, à re-former à ETAT, PXC-01) · porteur : PAROXYSME, avec le mainteneur
    Shōgen · déclencheur : partie 3 de PXC-08, après CM-4 (F5)
  état : ouvert · suite : ligne d'attente datée au versement ; registre Shōgen pour la couture
- **MK-L27** · « Une seule plateforme, quatre symboles, 1h et 4h ; le 24h est silencieux par construction. »
  source : 0005 l.118-121, l.147-148, l.195-203 ; 0006 l.230 ; ETAT l.245 · touche : C §9 l.296-301 ; `docs/public-notes/v0.9.0.md:26` ·
    nature : D/Dr
  item : F-K-1 (ETAT l.255) ; PXC-17 partie 3 (portée) et PXC-18 partie 2 (Coinbase bloqué par ses conditions) · porteur : PAROXYSME ;
    le fondateur pour tout symbole ou plateforme neuf (0006 l.25) · déclencheur : PXC-18 partie 2 (F4) ; PXC-17 partie 3 (F5)
  état : ouvert · suite : F-K-8 et F-K-9 absents d'ETAT, à re-former (PXC-01)
- **MK-L28** · « Base juridique des données : l'usage est dit couvert par des accords dont les textes sont attendus. »
  source : ETAT l.246-247, l.33-34, l.136-137 · touche : rapport public de la vague 1 · nature : Dr
  item : PXC-18 partie 1 ; DATA-ACCORDS-TEXTS-1 (textes des accords, item du plan) · porteur : le fondateur (textes) ; PAROXYSME (dossier) ·
    déclencheur : avant le service public des lignes kata (PLAN §7.3)
  état : changé (Q-B (v) : « oui », le 2026-10-07) · suite : DATA-ACCORDS-TEXTS-1 n'est pas à ETAT (§7, doute 3)
- **MK-L29** · « Contre-vérification USDT/USD retirée (API payante) ; Kraken ne vérifie que dans un sens. »
  source : add6 l.8, l.14-18 · touche : rapport de la vague 2 · nature : D/P
  item : PXC-18 partie 2 (décision de dépense, format P-26) · porteur : le fondateur (dépense) ; PAROXYSME (question fermée) · déclencheur :
    partie 2 de PXC-18 (F4)
  état : ouvert · suite : aucune dépense engagée par ce registre
- **MK-L30** · « Stock passé non vu épuisé après la vague 3 : plus aucun mois non vu. »
  source : 0006 l.197-201, l.309 · touche : aucune · nature : D
  item : PXC-17 partie 3 (KATA-FORWARD-PLAN-1, à former : calibrations pré-enregistrées sur données futures) · porteur : PAROXYSME ; acte du
    fondateur · déclencheur : partie 3 de PXC-17 (F5)
  état : ouvert · suite : ligne d'attente datée au versement
- **MK-L31** · « Garde des noms BYO : imitations résiduelles et faux refus déclarés de la famille `<s>-dlr-<h>`. »
  source : ADR-CM l.231-232 ; `docs/G7-lot-d-3.md:93-96` ; ETAT l.1539-1542 · touche : C §13 l.540-543 · nature : C
  item : comme PX-Harness-16 (BYO-LOOKALIKE-RESIDUAL-1, BYO-HOMOGLYPH-1 ; PXC-16) · porteur : PAROXYSME · déclencheur : partie 1 de
    PXC-16 (F2) pour la lecture, partie 2 (F3) pour la garde
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
  état : ouvert · suite : `SHORT_N` vaut encore 30 à la tête (`spec-publish.mjs:288`), à côté du plancher 2^128
- **MK-L35** · « Une silence d'une calibration plus ancienne remplace une région plus récente (« the safe side »). »
  source : 0006 l.30-33, l.293 · touche : texte servi (0006 l.33) · nature : T
  item : PXC-09 partie 3 (règle qui combine les deux calibrations à δ ajusté, à former) · porteur : PAROXYSME · déclencheur : partie 3 de
    PXC-09 (F4)
  état : ouvert · suite : aucune
- **MK-L36** · « Incohérence publique : six contrats à une ligne du README, huit à trois autres. »
  source : `README.md:20`, `:94`, `:175`, `:245` · touche : `README.md:175` · nature : C (texte)
  item : PXC-02 partie 1, noyau (README-CONTRACT-COUNT-1, à former) · porteur : PAROXYSME · déclencheur : tâche 2 du TABLEAU (F1)
  état : ouvert · suite : même limite que PX-Harness-02
- **MK-L37** · « La chaîne des essais n'est écrite que dans le code du générateur ; sa tête reste hors décision. »
  source : INV-M l.174 (message G0 des vérificateurs l.29-31) · touche : FORMAT l.9, l.44 · nature : M
  item : TRIAL-HEAD-WRITTEN-1, par SHORT-DIGEST-SPEC-TEXT-1 (ETAT l.696-703) ; TRIAL-HEAD-PUBLIC-REPLAY-1 (§5, HT-04) ; PXC-11 partie 1 ·
    porteur : RECHERCHES (texte), MONARK (brouillon) (ETAT l.701-702) · déclencheur : avant la première publication datée de lignes kata
  état : changé (porté à ETAT par la révision datée de la spécification) · suite : section 8 de KATA-SPEC
- **MK-L38** · « L'indépendance de l'implémentation de contrôle est « declared by its author ». »
  source : K l.74 · touche : K §6 l.74 · nature : T
  item : PXC-11 partie 5 (implémentation tierce en salle blanche, avec journal d'accès) · porteur : PAROXYSME ; un tiers · déclencheur :
    partie 5 de PXC-11 (F5)
  état : ouvert · suite : ligne d'attente datée au versement
- **MK-L39** · « L'outil de vérification Python tourne hors CI. »
  source : ETAT l.591-598 · touche : aucune · nature : C
  item : VERIFIER-TOOL-CI-1 (ETAT l.591-598) ; PXC-11 partie 1 · porteur : RECHERCHES (ETAT l.595) · déclencheur : après la fusion de
    l'outil figé, avant le gel de c1a de CM-5 (ETAT l.595-596)
  état : ouvert · suite : prix à ETAT : ≈ 55 lignes
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
- **C-16** · « DEMO-HASH-STALE-1. » · clos au code (preuve : `skills/monark/DEMO.md:86-87`, test `demo_md_cites_the_current_byo_trace_digest`,
  `test/byo-demo-probe.test.ts:204`) ; ETAT l.1598-1600 le dit encore ouvert (§7, doute 2)
- **C-17** · « Actes de T0 : CONTRACT-1-1-0, NOTICE-1-1-0, SPEC-1-1-0-RELEASE. » · clos (preuve : `docs/JOURNAL-PROVENANCE.md:444-447` ;
  `docs/public-notes/v0.9.0.md:3`, `:62`)
- **C-18** · « SERVED-PENDING-1. » · clos (preuve : `docs/JOURNAL-PROVENANCE.md:445`, promus et retirés à T0)

### 4.2 Moteur (13 de l'inventaire, INV-M §4, et MK-L14 close à la tête)

- **MK-C01** · « Rang split flottant et scores infinis. » · clos (preuve : C l.114, l.224, l.228-232 ; ADR-CM l.252 ;
  `apps/harness/src/policy-marginal.ts:37`)
- **MK-C02** · « Lecture des seuils de compartiment. » · clos (preuve : C l.337-341 ; `apps/harness/src/kata-path.ts:75`)
- **MK-C03** · « Bord servi h* ou fl(q̂·σ̂). » · clos (preuve : add3 l.54 ; C l.272-275 ; `apps/harness/src/kata-path.ts:96`)
- **MK-C04** · « `region_degenerate` atteignable par une bande kata. » · clos (preuve : add3 l.41 ; `apps/harness/src/policy-guard.ts:110-111`)
- **MK-C05** · « Taille de l'effet K-2. » · clos (preuve : add3 l.34-35, mesurée 0,0534, SE 0,0042)
- **MK-C06** · « Interface de la garde `class-policy-v2`. » · clos (preuve : add8 §1 ; `apps/harness/src/policy-wave2.ts:26-42` ; ADR-CM l.300)
- **MK-C07** · « Phrase fausse de 0006 D3. » · clos (preuve : add2 l.12-22)
- **MK-C08** · « F-W2-9 dû avant P3. » · clos comme constat (preuve : `decisions/0006-F-W2-9…`) ; ses suites : MK-L02
- **MK-C09** · « DECIDED-AT-1. » · clos par raison écrite (preuve : ETAT l.828-831) ; se rouvre avec MK-L16
- **MK-C10** · « Borne du `n_test` d'un retrait `live:<k>`. » · clos (preuve : `apps/harness/src/policy-wave2.ts:16` ;
  `apps/harness/src/policy-retire.ts:79` ; ETAT l.1760-1763) ; non servie avant E-2a
- **MK-C11** · « Outils de T0 : SPEC-PUBLISH-PREVIOUS-BLOBS-1, TEMPLATE-MARKERS-SOURCE-1. » · clos (preuve : ETAT l.784, l.791-806)
- **MK-C12** · « Ordre des opérations du terme EWMA. » · clos (preuve : K l.5, l.42)
- **MK-C13** · « LIQ-BAND-EXACT-GUARD-1. » · clos (preuve : `apps/harness/src/policy-marginal.ts:53-59`, `:67` ; ETAT l.1540-1541)
- **MK-L14** · « Empreintes 0/1 inversibles : la règle « 30 points au plus » ignorait `misses`. » · clos par construction à la tête
  (preuve : `apps/harness/src/policy-digest-floor.ts:28`, plancher exact 2^128 appliqué par la porte (`scripts/spec-publish.mjs:284-297`)
  et par la garde ; mesure des 280 lignes et modèle de menace, `docs/G0-lot-short-digest-inversion-1.md:143`, `:237-247` ; G1 et G7,
  `docs/G7-lot-short-digest-floor.md:49-50` ; ETAT l.605-613) · suite : construit, `upcoming` jusqu'au chargeur d'E-2a ; restes : HT-01, HT-02

## 5. Limites marquées PAROXYSME apparues à ETAT depuis les inventaires

Commande (à la tête, sans réseau) : `git diff -U0 57a131fc 87b821b0 -- docs/ETAT.md | grep '^+' | grep PAROXYSME` : dix lignes ajoutées,
neuf limites et un bloc. Le bloc « Limites déclarées des textes figés de R4 v2 » (ETAT l.730-778) porte des items déjà rattachés aux entrées
MK-L01, MK-L02, MK-L06, MK-L09, MK-L15, MK-L16, MK-L17, PX-Harness-18 et PX-Harness-21, et NARABI-POLICY-TEXT-REV-1 (registre Narabi).
DOJO-PROBE-UID-BOUNDARY-1 (ETAT l.1889) touche la sonde Narabi et celle du Dōjō : registre Narabi. Les sept autres sont ici.

- **HT-01** · « Les quatre tables dir-4h ne peuvent être servies sans divulguer des suites sous 2^128. »
  source : ETAT l.614-620 · touche : aucune (tables retenues) · nature : T/C
  item : DIR-4H-DIGEST-COMMIT-1 (ETAT l.614-620) · porteur : RECHERCHES (spécification), puis MONARK (code) · déclencheur : avant tout service
    d'une table dir-4h, ou avant le pré-enregistrement de cellules de direction d'une autre vague
  état : ouvert · suite : prix à ETAT : contrat 1.2.0, régénération du registre, outil du vérificateur, ligne d'A-2
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
- PX-Hikae-6 (`remaining_budget` renvoyé tel qu'envoyé), PX-Hikae-9 (clos au servi, C-02), PX-Hikae-11 (`region_degenerate`) : registre Hikae.
- PX-Ukemi-11, -12 (`calibrate`), PX-Ukemi-1, -7, -8, -9, -10 (textes liq servis) : registre Ukemi.
- PX-Narabi-1 (texte stable-run servi) : registre Narabi ; PX-Narabi-15 (comptage par classe) : absorbé par PX-Harness-10 sous Q-H2.
- E-14 (q̂ liq nul rend `under_calib`, INV-M §8) : registre Ukemi.

## 7. Doutes nommés (ce qui ne se reproduit pas tel quel à la tête)

1. **Sources hors du tronc.** Les lignes de C, K, 0005, 0006, addN, A-2, F9, FORMAT et du rapport de la vague 1 sont celles que
   l'inventaire a lues dans le dépôt de RECHERCHES ; elles ne sont pas relues ici.
2. **DEMO-HASH-STALE-1.** Le code le clôt (C-16) ; ETAT l.1598-1600 le dit encore ouvert : clôture à écrire par MONARK.
3. **Items du plan absents d'ETAT.** DATA-ACCORDS-TEXTS-1, RUNBOOK-HARNESS-SENTINEL-DIFF-1, SENTINEL-DEPLOY-GUARD-1, SYNC-CHECK-MODE-1,
   F-W2-4, F-K-2, F-K-4, F-K-5, F-K-6, F-K-8, F-K-9, CALIB-SEQ-IMPORT-1, ATTEST-KATA-SUBJECT-1, R-11, SKILL-KATA-15M-NOTE-1 et
   HARNESS-TRANSPORT-CATCH-1 ne sont pas à ETAT à la tête (`grep -c` nul) : leurs entrées les portent par un chantier, et leur
   re-formation à ETAT est à MONARK (PX-STD-ORPHAN-1, PLAN §4.1 A).
4. **Items neufs non marqués PAROXYSME.** ETAT gagne d'autres items depuis `57a131fc` (par exemple KATA-CA-PUBLISHED-TABLES-1,
   E2A-DIGEST-FLOOR-TEST-1, BAND-AUX-DIGEST-W2-1, RETIRE-CAUSE-VOCAB-1) ; ils ne sont pas des limites des inventaires et ne sont repris
   ici que là où une entrée les cite. La recartographie de PXC-01 partie 2 les prendra.
5. **Contrôle mécanique.** Le script de contrôle de ce versement (identifiants des inventaires égaux aux étiquettes des registres et aux
   doutes nommés ; aucun champ item, porteur ou déclencheur vide ; comptes par pièce ; diff limité aux six fichiers) est versé en pièce
   de la boîte PAROXYSME avec sa sortie ; il est provisoire jusqu'à `scripts/paroxysme/registry.mjs` (PXC-01 partie 1).
6. **Essai de CA de MONARK.** La preuve partielle de PX-Harness-09 (pièce `ca-trial-18.json`, sortie sha256 `28aaa41b…`) est dans la
   boîte de RECHERCHES ; elle n'est pas relue ici.
7. **Ancres qui ont bougé à la tête** (ordre de mission : « ligne qui a bougé à la tête » va en doute). Texte changé : `docs/RUNBOOK-harness.md`
   l.159, l.186, l.214 (15 → 18 contrôles, `4c16ea0`) et `scripts/spec-publish.mjs` l.284-297 (plancher 2^128, `c4dbfc5`), d'où
   l'état changé de PX-Harness-09, la preuve de C-15 et la clôture de MK-L14. Même texte, autre numéro : les 44 plages d'ETAT
   (`57a131fc` → `87b821b0`) et `apps/harness/src/policy-guard.ts` l.108-109 → l.110-111. Commande : `node reanchor.mjs --repo <clone>
   --base <57a131fc | d8fe354c> --head 87b821b0 <fichier>:<ligne>…` (sortie `same`, `unchanged-file` ou `CHANGED`).

## 8. Ligne PAROXYSME et sources

**Ligne PAROXYSME (2026-10-07).** Harnais : 28 limites ouvertes (dont 2 ⚑B : PX-Harness-04, -26) et 18 closes. Moteur : 39 limites
ouvertes et 14 closes (MK-L14 close à la tête). Limites neuves à ETAT : 7 ici (§5). Aucune dette : chaque entrée ouverte a son item, son
porteur et son déclencheur.

| Source | Lignes | sha256 |
|---|---|---|
| `docs/ETAT.md` à `87b821b0` | 1 904 | `3190de5c23507292414418cbb8b24e0f7c9f319dca64a0f5ae8c5009475a5b5a` |
| `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` à `87b821b0` | 331 | `64aa3e11a87ac59ce633d5191952824d06010970c34b73c749e1c1caa2430c7b` |
| `README.md` à `87b821b0` | 353 | `6324c8b220ccb5378d5458ca883190b7241b0d3cdbc1e42d9f1697051e58b5ad` |
| `docs/RUNBOOK-harness.md` à `87b821b0` | 509 | `badd2e092d629d7f4ca69b51f15143d2c7e4ee78b019f00c6772a35e84a56ff1` |
| `scripts/verify-harness.mjs` à `87b821b0` | 588 | `2cf68a6026d65b765002df0c05c4601bfe8896b8d6f06d36872aba047ae686cf` |
| `docs/deploy-CA-harness.json` à `87b821b0` | 126 | `678d84c8428b8518565e0f00efb6079139b6c3cccee53a04075d4ac62ea8eba7` |
| `apps/harness/src/policy-digest-floor.ts` à `87b821b0` | 136 | `2d639b2bacbff554492e8615a6c1eef178e0b57cc4a4ed8a30c3cfa36f88035a` |
| `docs/G0-lot-short-digest-inversion-1.md` à `87b821b0` | 838 | `c19b4cc96def0f3045ad850752abe0315593f9140184eb3d102012d4983e1ba4` |
| `docs/G7-lot-short-digest-floor.md` à `87b821b0` | 69 | `94b22436b7e2b67423e1859d03b8865880e74b7ad374e7cdc247ed7448aac1a1` |
| INV-H, boîte PAROXYSME, `dossier/etude-2026-10-06/inventaire/` | 158 | `111ad4e4bdc068c865c502f6b773e982faa728d65b5648e8b92b6969b182e128` |
| INV-M, même dossier | 350 | `d724157e6f458e9dbc9fbd807bd364a825060b476e95526a51520fdf6ebf99ed` |
| CC, boîte PAROXYSME `dossier/etude-2026-10-06/CHANTIERS-CANDIDATS.md` | 1 260 | `86ed73a23b0bfd8e2da5ea40de3818ae8a105a7d406c6bc0607fb8914c5dcc60` |
| PLAN, même dossier, `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` | 1 195 | `96b5b01858886906930f8be6e76094294dd71a9878a34b9b71804a160a645714` |
| `reanchor.mjs`, boîte PAROXYSME `coordination/pieces/2026-10-07-registres/` | 65 | `9ce778f21dc34cdf93cb5bceb41aa566de6ecc5390a39b8eb7993f3d731f4f8b` |
