# PAROXYSME-Hikae : registre intérimaire des limites de Hikae (la porte : inférence à couverture contrôlée, budget `B_t`)

- **Objet** : versement intérimaire (a′) du plan de route PAROXYSME v3 (§4.1 A, §6 « Transition ») : la pièce `built` Hikae reçoit son
  registre. C'est le remède de N17 (« registre PAROXYSME de la pièce absent du dépôt », INV l.172 ; item proposé, INV l.190-192).
- **Règle** (règles « Dettes » et « PAROXYSME » de l'investisseur ; décision 251 rappelée par `docs/PAROXYSME-Dojo.md`) : une limite
  déclarée n'est jamais une fin ; elle mène à un item, à une campagne, puis à une décision. Ici, chaque entrée ouverte porte un item, un
  porteur et un déclencheur ; ce qui ne se reproduit pas tel quel à la tête va à un doute nommé (§7).
- **Provenance** : écrit par un worker de PAROXYSME (`claude-opus-5-5`, effort max) le 2026-10-07 à partir de 17:28 UTC (`date -u`),
  tâche 1 du tableau MONARK ↔ PAROXYSME. Sources : l'inventaire validé de Hikae (dossier d'étude du 2026-10-06), la couverture de
  `CHANTIERS-CANDIDATS.md` §4 et les fenêtres du plan v3 §4 (chemins et empreintes au §8). Relecture : une G2 par une instance neuve,
  pliée le 2026-10-07 de 18:48 à 19:12 UTC (`date -u`) par un worker de PAROXYSME (`claude-opus-5-5`, effort max), le registre étant
  retouché ensuite par PAROXYSME (N19, doute 15, §8) avant le commit `11d2a34f` (19:14 UTC par `TZ=UTC git log` ; `PLI-Hikae.md` l.5,
  l.55-59, §8) ; contrôle par diff, fusion et ligne d'ETAT : MONARK. Versé par #242, fusion `1df4e44f` (ETAT l.181-186 à `5437cd0d`) ;
  décisions de MONARK pliées le 2026-10-07 (PR `paroxysme/registres-decisions-1007`), par un worker de PAROXYSME (`claude-opus-5-5`,
  effort max) à partir de 19:56 UTC (`date -u`), sur ETAT à `5437cd0d` et le message de MONARK `d6331f6` (MSG ; §8).
  Constats 4, 5 et 14 de la G2 de ce pli (instance neuve) pliés le 2026-10-07, achevés à 21:16 UTC (`date -u` ; heure de départ non
  relevée) par un worker de PAROXYSME (`claude-opus-5-5`, effort max, contexte de sa mission) : N7, N9, N22,
  §7 (doutes 5, 13, 17), §8. Trois constats d'un vérificateur adverse de ce pli corrigés à partir de 22:36 UTC (`date -u`) par un
  worker de PAROXYSME (`claude-opus-5-5`, effort max, contexte de sa mission) : en-tête, N6, N22, §7 (doute 5) ; un constat d'un second
  vérificateur adverse corrigé le 2026-10-07 à partir de 23:59 UTC (`date -u`) par un worker de PAROXYSME (`claude-opus-5-5`, effort max) : en-tête.
  Second tour : constats d'une relecture par lentilles reproduits à `beea9834` et pliés le 2026-10-08 à partir de 01:09 UTC
  (`date -u`) par un worker de PAROXYSME (`claude-opus-5-5`, effort max) : L2, N17, §7 (doutes 16, 18), §8 ; constats d'un vérificateur
  adverse de ce second tour réparés à partir de 02:57 UTC (`date -u`) par un worker de PAROXYSME (`claude-opus-5-5`, effort max) : §7 (doute 16), §8 ; constats
  d'un second vérificateur adverse réparés à partir de 04:35 UTC (`date -u`) par un worker de PAROXYSME (`claude-opus-5-5`, effort max) : en-tête, L3, §8 ;
  constats de la vérification finale de ce tour réparés à partir de 05:44 UTC, puis après une vérification neuve de ce pli à partir de
  06:04 UTC (`date -u`), par la session PAROXYSME : en-tête, §1, §8. Pli des décisions de l'après-#245 (#245 versée au tronc, fusion `1ae166c6` : ETAT l.546-551
  à `565c7065`), le 2026-10-08 à partir de 07:41 UTC (`date -u`), par un worker de PAROXYSME (`claude-opus-5-5`, effort max) : sources : ETAT à `565c7065` et
  MSG2 (Bases, §8) ; parties touchées : en-tête, §1, L2, L3, N6, N7, N8, N9, N12, N22, §7 (doutes 2, 5, 13, 16 et 17), §8.
  Réparation n° 1 de ce pli, après deux vérificateurs adverses neufs, le 2026-10-08 à partir de 09:25 UTC (`date -u`), par un worker de
  PAROXYSME (`claude-opus-5-5`, effort max) : sources : ETAT à `565c7065` et MSG2 ; parties touchées : en-tête, L6a, N16, §7 (doute 2), §8.
- **Bases** : inventaire mesuré à `d8fe354c` ; il lit ETAT, `apps/harness/src/policy-guard.ts` et `docs/G7-lot-retire-path-ra.md` à
  `57a131fc` (INV l.9-13 ; §7, doute 6).
  Toutes les ancres de ce registre sont à la tête `87b821b0` de `lot/etude-suite`, reportées par l'outil `reanchor.mjs` (pièce de la
  boîte, `d2332e2` ; aucune hors bornes, §7 doute 15) : les 17 plages d'ETAT que cite l'inventaire se reportent avec un texte identique, onze à un autre
  numéro ; hors d'ETAT, aucune ancre de l'inventaire ne tombe dans un hunk changé et deux se déplacent au même texte.
  Font exception les décisions pliées le 2026-10-07, citées « ETAT l.N à `5437cd0d` » et « MSG l.N », et deux renvois du doute 17 :
  la demande `6698269` et ce registre à `5437cd0d`, cités par leurs lignes (empreintes au §8). Le pli de l'après-#245 cite ETAT à
  `565c7065` (« ETAT l.N à `565c7065` », relu par `git show 565c7065:docs/ETAT.md | sed -n`) et MSG2 (« MSG2 l.N », message de MONARK
  `d5553e7`, §8).
- **Préséance** : `docs/ETAT.md` l.7-11 ; ETAT prime. Un item nommé hors d'ETAT et du code (ADR, plan, inventaire, fiche du 2026-09-27)
  n'est pas compté comme formé : il est écrit « à former » et porté par son chantier.
- **Labels** : aucun ne change (`built` de Hikae, `apps/site/lib/fleet.ts:150`) ; `apps/site/lib/fleet.ts` n'est pas touché par ce versement.

## 0. Comment lire ce registre

- **Une entrée par limite**, ouverte par le préfixe `- **`, en quatre lignes logiques au plus (limite ; source, touche et nature ; item,
  porteur et déclencheur ; état et suite) ; une ligne longue se continue en retrait (forme de `docs/PAROXYSME-Dojo.md` §0).
- **Étiquettes** : celles de l'inventaire, inchangées : `L1` à `L24` et `Q6` (= PX-Hikae-11) pour les limites du 2026-09-27, `N1` à
  `N22` pour les nouvelles. L24 est repliée avec L1 dans une seule entrée, `L1 (+L24)`, comme la table de l'inventaire l'écrit (INV
  l.126) ; L6 y est scindée en `L6a` et `L6b`. `HKT-nn` numérote les limites trouvées à la tête (§5). Ce sont des numéros de ligne de
  registre, jamais des items, et aucune n'apparaît dans un champ « item ».
- **Champs** : limite (25 mots au plus) ; source (fichier et ligne à `87b821b0`) ; touche (texte public que la limite qualifie) ; nature ;
  item ; porteur ; déclencheur ; état ; suite.
- **Natures** (celles de l'inventaire) : T théorie · M mesure · D donnée · P dépendance · Dr droit · C capacité ; « texte » : une phrase
  publique.
- **Item, porteur, déclencheur** (règles acceptées par MONARK, message `07d99e2` de la boîte, qui répond à `d4b3d07`) :
  - un item formé à ETAT est cité avec sa ligne à la tête, et garde le porteur et le déclencheur qu'ETAT lui écrit ;
  - une limite que `CHANTIERS-CANDIDATS.md` §4 rattache à un chantier prend ce chantier pour item de porteur (`PXC-nn`, sa partie, et
    l'item que la partie forme) ; porteur : PAROXYSME, qui porte les chantiers (TABLEAU de la boîte, décision de MONARK du 2026-10-07),
    MONARK gardant l'ordre et l'attribution ; déclencheur : la partie et sa fenêtre au plan v3 §4 ;
  - les deux sont écrits quand les deux existent ; un acte hors délégation a pour porteur le fondateur (par MONARK) ; une lecture sur
    place ou un acte d'hôte, MONARK.
- **Fenêtres du plan v3 §4** : F1 = §4.1, semaine du 2026-10-07 ; F2 = §4.2, du 2026-10-14 au service de la vague 1 (vers le
  2026-10-20) ; F3 = §4.3, du 2026-10-21 au 2026-11-16 ; F4 = §4.4, du 2026-11-17 au 2026-12-31 ; F5 = après le 2026-12-31, avec ligne
  d'attente datée au versement (plan §4.4, dernier alinéa).
- **États** : `ouvert` ; `changé` (l'état diffère de la fiche du 2026-09-27 ou de l'inventaire, dit entre parenthèses) ; `clos (preuve : …)`.
- **Abréviations** : ETAT = `docs/ETAT.md` ; ADR-CM = `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` ; M009 =
  `docs/adr/ADR-M009-aci-tracker.md` ; CC = `CHANTIERS-CANDIDATS.md` ; PLAN = `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` ; INV = l'inventaire
  de Hikae (lignes du fichier) ; HR = `packages/hikae/README.md` ; DP = `apps/site/lib/docs-pieces.ts` ; HP =
  `apps/site/components/hikae-panel.tsx` ; HOW = `apps/site/app/how/page.tsx` ; DG = `apps/site/app/docs/gate/page.tsx` ; HAR =
  `apps/harness/README.md` ; FC = `docs/marche/FAITS-conditions-series-2026-10-01.md`. C, 0004, F9 et W1R sont des sources du dépôt de
  RECHERCHES (`kata/spec/CONTRACT-1.1.0.md`, `decisions/0004-ADR-draft-commit-error-binomial-bound.md`,
  `decisions/0006-F-W2-9-serial-dependence-finding.md`, `kata/registry/wave1-report.md`), et PROC le fichier des procurements du
  2026-09-27 (hôte de MONARK) : tous sont cités par la ligne que l'inventaire a lue, non relus ici (§7, doute 1).

## 1. Dettes : limites sans item, sans porteur ou sans déclencheur

- Aucune établie. Chaque entrée ouverte des §2, §3 et §5 porte un item, un porteur et un déclencheur. Les dix limites que l'inventaire
  disait « sans item » (INV l.184-186) en reçoivent un ici, par un item d'ETAT ou par leur chantier ; le contrôle est mécanique (§7,
  doute 15).
- La question de L2 et L3 (un seul item par construction commune avec Ukemi, ou deux, un par registre ; formée au registre Ukemi à
  `beea9834`, son §7, doute 9) est tranchée par MONARK : un seul item, porté par un registre et renvoyé par l'autre ; le texte de
  l'impossibilité (PXC-09 p5) est porté par la L21 d'Ukemi et renvoyé par L2 ; le diagnostic d'échangeabilité de K-1 est porté par L3
  (KATA-EXCH-TEST-1) et renvoyé par la L20 d'Ukemi ; échéance : la recartographie de PXC-01 partie 2 (ETAT l.567-570 à `565c7065` ;
  MSG2 l.29-31).

## 2. Limites du 2026-09-27 : ouvertes ou changées (21, INV §3.1)

- **L1 (+L24)** · « Erreur d'un acte engagé non bornée par α : la construction 1.1.0 (`bound_on=commit`, τ ≤ 1) n'est servie sur aucune ligne. »
  source : `packages/hikae/src/l1-split.ts:48-80` ; `spec/contract-1.1.0/policy/btc-dir-1h.json` (`"rows":[]`) ; 0004 l.50 ; C l.225,
    l.293, l.503 ; W1R l.8 · touche : HR:14, HP:71-72, HOW:288-289, DG:250 (vraies pour le servi) ; `README.md:81` (« commit ») · nature : T
  item : PXC-09 CONFORMAL-PX-2, partie 3 (SELECTIVE-COMMIT-1, à former : texte servi C-5 dès qu'une ligne `bound_on=commit` sert)
    · porteur : PAROXYSME · déclencheur : partie 3 de PXC-09 (F4)
  état : changé (construction livrée, servie sur aucune ligne ; vague 1 : aucune région de direction) · suite : PX-Hikae-1 du 2026-09-27
- **L2** · « Aucune couverture conditionnelle à x : la partition Mondrian de 1.1.0 (côté, paniers) ne donne aucune garantie par groupe nommé. »
  source : `packages/hikae/src/l1-split.ts:4-5` ; C l.332-335 · touche : DP:77, HP:64-67, DG:249-252 · nature : T
  item : PXC-09 partie 1 (campagne K2 : conditionnel, Mondrian, PAC) et partie 5 (texte public qui nomme l'impossibilité, P-64 (d) :
    un seul item, porté par le registre Ukemi et renvoyé ici, ETAT l.567-568 à `565c7065`) · porteur : PAROXYSME · déclencheur :
    campagne en F3 ; partie 5 en F5
  état : ouvert · suite : PX-Hikae-2 du 2026-09-27 ; partie 5 : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d`
    (PLAN l.617-618) ; sources détenues (CC l.316-318) ; la partie 5 traite aussi la L21 du registre Ukemi (CC l.342) : un seul item,
    tranché par MONARK, porté par cette L21 ; échéance : la recartographie de PXC-01 partie 2 (ETAT l.567-570 à `565c7065` ; MSG2
    l.29-30)
- **L3** · « Échangeabilité déclarée, jamais testée par la porte ; le diagnostic de dépendance des lignes kata n'est pas recalculé par le serveur. »
  source : `apps/harness/src/tools/calibrate.ts:53-58` ; texte de la ligne USDe (`spec/contract-1.1.0/policy/stable-run-velocity-24h.json`) ;
    0004 l.89-97 ; C l.490 · touche : description de `calibrate` (K-1) ; DG:249 ; DP:77 · nature : T/M
  item : KATA-EXCH-TEST-1 (ETAT l.762-765) ; PXC-09 partie 1 (campagne K1 : données non échangeables) · porteur : RECHERCHES (ETAT l.763) ;
    PAROXYSME (campagne) · déclencheur : avant le G0 court de la vague 2 (ETAT l.763-764) ; campagne en F3
  état : changé (item formé à ETAT depuis l'inventaire) · suite : PX-Hikae-7 du 2026-09-27 ; même famille que MK-L01 du registre du Harnais ;
    source commune avec la L20 du registre Ukemi (label K-1 de `calibrate`) : un seul item, tranché par MONARK, KATA-EXCH-TEST-1, porté
    ici et renvoyé par cette L20 ; échéance : la recartographie de PXC-01 partie 2 (ETAT l.568-570 à `565c7065` ; MSG2 l.31)
- **L4** · « La couche de surveillance (`l2-monitor`) est sans garantie : la garantie (ii) de Wang n'est pas invoquée ; `r_t` n'a aucun consommateur. »
  source : `packages/hikae/src/l2-monitor.ts:1-15` · touche : HR:13 (public par l'export) · nature : T
  item : PXC-10 CM-5-RETIRE-1, partie 3 (`B_t` et moniteur, selon la décision du fondateur sur `B_t`) ; PXC-09 partie 1 (campagne K3)
    · porteur : PAROXYSME · déclencheur : campagne en F3 ; partie 3 de PXC-10 (F4)
  état : ouvert · suite : PX-Hikae-5 du 2026-09-27 ; lectures : Wang-Zecchin-Simeone, Joulani, Weinberger-Ordentlich (CC l.354-355)
- **L5** · « Retard déterministe et terme w/T : une composition (H4) esquissée, choix de conception et non théorème publié. »
  source : `packages/hikae/src/l2-monitor.ts:13-15` · touche : HR:13 · nature : T
  item : PXC-10 partie 3 (cadrage du moniteur) ; PXC-09 partie 1 (campagne K3) · porteur : PAROXYSME · déclencheur : campagne en F3 ;
    partie 3 de PXC-10 (F4)
  état : ouvert · suite : PX-Hikae-5 du 2026-09-27 ; un seul cadrage avec la couche de surveillance (CC l.367)
- **L6a** · « `n_min` déclaré, non fondé, sur les lignes marginales (USDe 50, liq 100) ; fondé pour les classes kata (n0 dérivé de α et test_delta). »
  source : `apps/harness/src/class-policy.ts:24`, `:27` ; `apps/harness/src/kata-path.ts:61` ; 0004 l.76, l.97 ; C l.235, l.300-301 ·
    touche : HR:45-46 ; `README.md:34` · nature : T/D
  item : PXC-09 partie 1 (campagne : fondement de `n_min` des lignes marginales) ; F-W2-3, nommé à ETAT l.565 à `565c7065` sans y être
    formé, à former à ETAT par la recartographie de PXC-01 partie 2 (ETAT l.564-566 à `565c7065` ; MSG2 l.28) · porteur : PAROXYSME ;
    MONARK (ligne d'ETAT) · déclencheur : partie 1 de PXC-09 (F3) ; formation à ETAT : partie 2 de PXC-01 (F3)
  état : changé (fondé et imposé pour les classes kata, refus `policy_nmin_mismatch`) · suite : PX-Hikae-3 (volet marginal) ; n de liq : données
- **L6b** · « α (0,45 ; 0,01) et test_delta 0,05 sont pré-enregistrés, non dérivés ; η ne vit que dans le tracker Narabi ; w = 15 min est caduc. »
  source : HR:45-46 ; `apps/sentinel/src/timeline.ts:20` ; 0004 l.50, l.74 ; C l.300-301 · touche : HR:45-46 · nature : T/D
  item : PXC-09 partie 1 (KATA-PARAM-BASIS-1, à former ; Kiyani et al. 2025, CC l.319) · porteur : PAROXYSME · déclencheur : partie 1
    de PXC-09 (F3)
  état : changé (τ ≤ 1 justifié sur `dir`, 0004 l.50 ; la classe à w = 15 min est retirée) · suite : PX-Hikae-4 ; même famille que MK-L34
    du registre du Harnais
- **L7** · « `τ_interval` « DECLARED, UNFOUNDED » ; en 1.1.0, la largeur admise sur une classe intervalle servie est celle de l'appelant. »
  source : `packages/hikae/src/l3-gate.ts:33`, `:55-56` ; `apps/harness/src/class-policy.ts:2-5` ; M009 l.126-128 ; C §6 · touche : HAR:64
    (`tauInterval`) ; DG (ordre de décision) · nature : T
  item : PXC-09 partie 1 (verdict de la campagne) ; M009 item (d) (contrainte `τ_interval < 2B`, hors d'ETAT : à former) · porteur :
    PAROXYSME · déclencheur : partie 1 de PXC-09 (F3) ; celui de l'ADR (« premier passage branche (a) ») n'est pas tiré
  état : ouvert (alourdi en 1.1.0) · suite : PX-Hikae-4 ; partie choisie ici (§7, doute 3) ; HAR:64 et non l.61 (§7, doute 7)
- **L8** · « `B_t` est un estimateur fragile au bord et aux rafales ; la sentinelle Narabi le publie. »
  source : M009 l.123-125 (chiffré [abs] par l'ADR) ; `packages/hikae/src/l2-monitor.ts:64-70` ; `apps/sentinel/src/timeline.ts:146` ·
    touche : timeline Narabi (`B_t` publié) · nature : M/T
  item : PXC-10 partie 3 (mesure sur des traces réelles ; M009 item (a), hors d'ETAT : à former) · porteur : PAROXYSME · déclencheur :
    partie 3 de PXC-10 (F4)
  état : ouvert · suite : PX-Hikae-6 du 2026-09-27 ; le déclencheur de l'ADR (« traces S2 ») n'a jamais été tiré (INV l.134 ; CC
    l.360-361) ; même source que L33 du registre Narabi
- **L9** · « `B_t` est porté par l'appelant et rendu inchangé ; la porte est sans état et ne reçoit aucune issue. »
  source : `apps/harness/src/tools/gate.ts:247-248` ; `packages/hikae/src/l3-gate.ts:158` ; `apps/site/lib/sim.ts:43` ; HAR:61, :111 ;
    0004 l.60 · touche : `README.md:13`, `:94` · nature : C
  item : PXC-10 partie 3 (`B_t` selon la décision du fondateur) ; texte : PXC-02, liste (b) du PLAN §5.1 · porteur : PAROXYSME ; le
    fondateur (sémantique de `B_t`, label Backbone, CX-07 ; par MONARK) · déclencheur : la décision avant la release de textes servis
    (PLAN §7.3) ; partie 3 de PXC-10 (F4)
  état : ouvert · suite : PX-Hikae-6 et question Q4 du 2026-09-27 (décisions 71 et 172 effacées, ETAT l.7-11) ; voir N13
- **L10** · « Un `drift_flag` est publié par ligne par la sentinelle, sans autre effet ; « drive π (…) and the drift flag » reste faux. »
  source : `apps/sentinel/src/timeline.ts:9-10`, `:25`, `:164` ; `packages/hikae/src/l2-monitor.ts:6`, `:61` ; ADR-CM l.67 ; ETAT
    l.533-534 · touche : `README.md:53-56` (« drift criterion ») ; DP:61-63 · nature : C/T
  item : PXC-02 partie 1, noyau (`README.md:53-56`, PLAN l.657) et partie 2 (commentaire de `l2-monitor.ts:6`, `:61`) ; CM-5-PLAN-1
    (ETAT l.533-537) ; PXC-10 partie 1 · porteur : PAROXYSME ; CM-5-PLAN-1 : RECHERCHES (ETAT l.534 ; c3 et c4, l.535), MONARK (oracles
    d'hôte, G2, courses, l.536-537) · déclencheur : tâche 2 du TABLEAU (F1) ; partie 2 de PXC-02 (F3) ; T0, atteint (ETAT l.534) ;
    partie 1 de PXC-10, après la mesure de R-b (F3)
  état : changé (fiche du 2026-09-27 corrigée ; G0 de CM-5 écrit, ETAT l.543) · suite : PX-Hikae-8 ; C1 au PLAN l.406-408 ; voir N14
- **L13** · « Le « silence calibré » est désormais un résultat mesuré : 239 silences sur 240 cellules de direction à la vague 1. »
  source : `packages/hikae/src/l1-split.ts:12-14` ; W1R l.8 ; `apps/harness/data/kata/registry/wave1.json` (recompté au tronc : 239
    `silence` et 1 `vetoed` sur 240 cellules de direction, §7 doute 1) · touche : HR:18-20 · nature : T/D
  item : PXC-17 DOMAINE-PX-2, partie 1 (campagne D4, prévisibilité intrajournalière) et partie 2 (ADR de direction) · porteur : PAROXYSME
    · déclencheur : partie 1 (D4) et partie 2 de PXC-17 (F4)
  état : changé (mesuré sur des données réelles) · suite : même construction que N3 ; même fait que MK-L08 du registre du Harnais
- **L15** · « Attestation non revérifiée à l'appel : la phrase reste servie, mais tout `attested` est refusé (jointure dormante). »
  source : `apps/harness/src/tools/gate.ts:194-196`, `:260-261` ; `apps/harness/src/attestation-binding.ts:64-65` ; ADR-CM l.186-191 ·
    touche : `README.md:205` ; DP:66 · nature : C/P
  item : PXC-08 SHOGEN-SEAM-1, parties 2 (vérificateur exécuté à l'appel) et 3 (ATTEST-KATA-SUBJECT-1, ADR-CM l.191 : à re-former) ;
    texte : PXC-02 partie 1, noyau (DP l.66, `README.md:205` ; PLAN l.661-665) · porteur : PAROXYSME, avec le mainteneur Shōgen ·
    déclencheur : tâche 2 du TABLEAU (F1) pour le texte ; partie 2 de PXC-08 (F4) ; partie 3 après CM-4 (F5)
  état : changé (tout `attested` refusé) · suite : fusionnée à PX-Shogen-3 le 2026-09-27 (registre Shōgen) ; partie 3 : ligne d'attente
    datée (P-25) : ETAT l.270-273 à `5437cd0d` (PLAN l.617-618)
- **L16** · « « no temporal binding in P1 » reste servi, sur un chemin dormant. »
  source : `apps/harness/src/tools/gate.ts:261` · touche : description servie de `gate` · nature : C
  item : PXC-08 partie 3 (garde `observed_at` : MONARK-SHOGEN-FRAICHEUR-1, formé au dépôt Shōgen, ADR-0028 annexe B l.148, porteur
    MONARK, `INVENTAIRE-Shogen.md` l.44 ; à transcrire) · porteur : PAROXYSME, avec le mainteneur Shōgen ; MONARK (item de Shōgen) ·
    déclencheur : partie 3 de PXC-08, après CM-4 (F5)
  état : changé (chemin dormant) · suite : PX-Shogen-4 et L-05 (registre Shōgen) ; ligne d'attente datée (P-25) :
    ETAT l.270-273 à `5437cd0d` (PLAN l.617-618)
- **L17** · « La composition BYO + `attested` (Shōgen, Ukemi, Hikae) est dormante. »
  source : `docs/adr/ADR-M017-attested-price-dans-gate.md:117` ; `apps/harness/src/attestation-binding.ts:7-14` · touche : aucune · nature : C
  item : PXC-08 partie 3 (item « BYO + `attested` » d'ADR-M017 l.117 et ATTEST-KATA-SUBJECT-1 : hors d'ETAT, à former) · porteur :
    PAROXYSME, avec le mainteneur Shōgen · déclencheur : partie 3 de PXC-08, après CM-4 (F5)
  état : changé (dormante) · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` (PLAN l.617-618) ; registre Shōgen
    pour la couture
- **L18** · « La borne ABB du tracker est numériquement vide en cadence journalière (propriétaire Narabi). »
  source : M009 l.120-121 ; `packages/hikae/src/tracker.ts` (octets inchangés depuis le 2026-09-27, INV l.47) · touche : `README.md:125` ·
    nature : T
  item : PXC-04 NARABI-SERVED-2, partie 5 (instrument à pas constant certifié) · porteur : PAROXYSME (pièce propriétaire : Narabi) · déclencheur :
    partie 5 de PXC-04 (F4)
  état : ouvert · suite : NARABI-THEORY-1 terminée, sans suite Hikae (INV l.144) ; même famille que L9 du registre Narabi ; partie choisie
    ici (§7, doute 3)
- **L19** · « En-tête « Hikae Adaptive Conformal Control (HAC-CP) » ; `hac-cp` reste dans l'énumération des méthodes du contrat. »
  source : `packages/hikae/src/index.ts:2` ; HR:1 ; M009 l.128-130 ; `packages/contracts/src/enums.ts:39` ; C l.226 · touche : HR:1
    (public par l'export) · nature : C
  item : PXC-02 partie 2 (renommage de `index.ts:2` et du titre de HR ; M009 item (e), hors d'ETAT : à former) · porteur : PAROXYSME ·
    déclencheur : partie 2 de PXC-02 (F3) ; publication : release du miroir (acte du fondateur, par MONARK)
  état : ouvert (déclencheur de l'ADR tiré, acte non fait) · suite : `hac-cp` relève de MK-L33 du registre du Harnais (C l.226)
- **L20** · « `trackerStepSize` ne rejette pas η = 0, inatteignable par un `trackerInit` validé. »
  source : `packages/hikae/src/tracker.ts:50-68`, `:73-79` ; M009 l.130-133 · touche : aucune · nature : C
  item : PXC-01 PAROXYSME-STANDARD-1, partie 2 (re-formation à ETAT de l'item (f) de M009 : rejeter η ≤ 0, avec son test) · porteur :
    PAROXYSME (chantier) ; MONARK (ligne d'ETAT) · déclencheur : partie 2 de PXC-01 (F3) ; celui de l'ADR (exposition de `eps` à un
    appelant) n'est pas tiré
  état : ouvert (non dû) · suite : aucune
- **L21** · « Classe `ukemi-liquidable-24h` : modèle déclaré, non fondé, hors des 35 tables servies (propriétaire Ukemi). »
  source : `packages/hikae/src/liquidable-24h.ts:9-13` ; C §10 l.353-357 · touche : aucune · nature : D
  item : PXC-17 partie 3 (classes métier : `liquidable-24h`) · porteur : PAROXYSME (pièce propriétaire : Ukemi) · déclencheur : partie 3 de PXC-17 (F5)
  état : ouvert · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` (PLAN l.617-618) ; reste
    ici : le registre Ukemi y renvoie (son §6 ; pendant : sa L27)
- **L22** · « DtACI est le repli nommé ; l'incohérence de registre (lu ou dû) n'est pas tranchée ; la copie JMLR est perdue. »
  source : `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md:129-132` ; PROC l.153, l.177 · touche : aucune · nature : T/C
  item : PXC-01 PAROXYSME-STANDARD-1, partie 2 (décision technique sur les options PXA §2 (e)) · porteur : MONARK (décision technique) ;
    PAROXYSME (chantier) · déclencheur : partie 2 de PXC-01 (F3)
  état : ouvert · suite : Q3 du 2026-09-27 ; DtACI, JMLR 25(162), est libre (CC l.179) : une lecture, pas un procurement
- **Q6** · « Une largeur positive minuscule reste servie `covered` ; largeur nulle et bande kata sans bord fini rendent `region_degenerate`. »
  source : `docs/adr/ADR-M011-interval-non-degenerescence.md:189-195` ; `apps/harness/src/policy-guard.ts:111` ; C §8, §16 · touche :
    aucune · nature : C/T
  item : PXC-09 partie 1 (verdict de la campagne : seuil de non-dégénérescence d'une région) · porteur : PAROXYSME · déclencheur :
    partie 1 de PXC-09 (F3)
  état : changé (B-16 ; garde d'import : bord positif exigé à `calib_support.min`) · suite : PX-Hikae-11 ; partie choisie ici (§7, doute 3)

## 3. Limites nouvelles depuis le 2026-09-27 : ouvertes ou changées (20, INV §3.2 ; N20 et N21 au §4)

- **N1** · « Aucun énoncé par calibration sous dépendance sérielle à α 0,01 aux tailles kata ; i.i.d. et stationnarité supposés, non montrés. »
  source : F9 l.20, l.99, l.105-123 ; 0004 l.91, l.97 ; ETAT l.20, l.753-761 · touche : `README.md:11-12` (« coverage-controlled ») ;
    phrase de bande à venir (F9 l.99) · nature : T
  item : F-W2-9a, F-W2-9b, F-W2-9c (ETAT l.753-761) ; PXC-09 partie 2 · porteur : RECHERCHES (ETAT l.754, l.757, l.760) ; MONARK pour le
    suivi en ligne de 9c (l.760) ; PAROXYSME (PXC-09 p2) · déclencheur : 9a : une demande de lignes au niveau du tampon (l.754) ; 9b : le
    premier ADR qui la propose, avec sa table de puissance et d'échec au protocole [V7] D3 (l.757) ; 9c : la mise en place du suivi en
    ligne (l.760) ; partie 2 de PXC-09 (F4)
  état : changé (formés à ETAT depuis l'inventaire ; chiffres de R4 v3, ETAT l.737-742) · suite : volet PXC-01 (inscription de F-W2-9,
    CC l.91-92) fait : ETAT l.753-761 ; même limite que MK-L02 du registre du Harnais ; P-INV-H-1 et -2 sans objet (CC l.320-321) ;
    P-INV-H-3 (Carrasco-Chen) : PX-IDENT-C0BIS-1 (PLAN §7.1)
- **N2** · « Les 32 classes kata sont servies sans ligne : tout appel kata bien formé s'abstient ; aucune ligne servie n'énonce par calibration. »
  source : `spec/contract-1.1.0/policy/btc-dir-1h.json` (`"rows":[]`, comme les 31 autres tables kata) ; `apps/harness/src/kata-path.ts:125-128` ;
    `apps/harness/src/tools/gate.ts:232-234`, `:1042` · touche : `README.md:34`, `:94-95`, `:105` ; `apps/site/lib/fleet.ts:147-150` · nature : C/D
  item : E-2a (ETAT l.26-28, l.106-113) ; VERIFIERS-LIST-F5A-1 (l.567-590) ; SHORT-DIGEST-INVERSION-1 (l.599-613) ; KATA-CLAUSE-COMMITTED-STATE-1
    (l.807-811) ; RETIRE-LISTS-E2A-PIPE-1 (l.947-955) · porteur : E-2a : RECHERCHES (lots, l.42), MONARK (G2, l.109) ; VERIFIERS : partie 1
    (lot 1f) RECHERCHES, partie 2 MONARK (course) et RECHERCHES (code de 2a), partie 3 RECHERCHES (l.588-590) ; SHORT-DIGEST : RECHERCHES
    (l.604) ; KATA-CLAUSE : RECHERCHES, MONARK (ligne Z-3) (l.810-811) ; RETIRE-LISTS : RECHERCHES (l.951) · déclencheur : E-2a : G0 court
    accepté, lots dans l'ordre de la chaîne (l.107-109) ; VERIFIERS : bloquant à la première table publiée dont une ligne porte
    `recompute` non nul (l.569-571) ; SHORT-DIGEST : la révision qui publiera des lignes kata (l.603-604) ; KATA-CLAUSE : le premier
    chargement d'une ligne kata engagée (l.811) ; RETIRE-LISTS : le lot b1 d'E-2a (l.951-952)
  état : changé (G0 court d'E-2a accepté, ETAT l.107-109 ; plancher fusionné, l.605-613) · suite : préalables du service, visé vers le
    2026-10-20 (ETAT l.26-28) ; même limite que PX-Harness-17 du registre du Harnais
- **N3** · « Vague 1 : aucune région de direction sur 240 cellules, deux régions de bande sur 40 ; l'erreur au COMMIT n'est servie sur aucune ligne. »
  source : W1R l.8-9, l.81, l.189-190, l.287 ; `apps/harness/data/kata/registry/wave1.json` (comptes recomptés au tronc, §7 doute 1) ;
    ETAT l.29-31 · touche : `README.md:81` ; HP:71-72 · nature : D/T
  item : PXC-17 DOMAINE-PX-2, partie 1 (campagne D4 : une classe où la conformité est informative) et partie 2 (ADR de direction)
    · porteur : PAROXYSME · déclencheur : partie 1 (D4) et partie 2 de PXC-17, après le service de la vague 2 (F4)
  état : ouvert · suite : même fait que MK-L08 du registre du Harnais ; PX-Hikae-9 recentré ici (INV l.216-217) ; Urquhart libre,
    Akyildirim reçu (INV l.239-240)
- **N4** · « Sélection côté appel : l'erreur au COMMIT n'égale le taux de raté de la cellule que si l'intention de l'appelant est indépendante de l'issue. »
  source : 0004 l.50, l.52 · touche : phrase servie des lignes ensemble à venir (C-5) · nature : T
  item : PXC-09 partie 3 (SELECTIVE-COMMIT-1, à former ; Jin-Ren et Jin-Candès détenus, Weinstein-Ramdas libre, Benjamini-Yekutieli
    reçu, INV l.226-229) · porteur : PAROXYSME · déclencheur : partie 3 de PXC-09 (F4)
  état : ouvert · suite : volet appel de PX-Hikae-1 ; même famille que MK-L04 du registre du Harnais (sélection par l'admission)
- **N5** · « L'erreur au COMMIT n'est pas identifiée sur les lignes intervalle (`bound_on=region`). »
  source : 0004 l.51, l.194 ; W1R l.888 (section de référence, rapport seul) · touche : aucune · nature : T/M
  item : PXC-09 partie 1 (verdict de la campagne) ; PXC-01 partie 2 (F-W2-2, hors d'ETAT : à re-former à ETAT) · porteur : PAROXYSME
    (chantier) ; MONARK (ligne d'ETAT) · déclencheur : partie 1 de PXC-09 (F3) ; partie 2 de PXC-01 (F3)
  état : ouvert · suite : déclencheur de 0004 : la première ligne intervalle à sa fenêtre de test (INV l.160) ; partie choisie ici (§7,
    doute 3)
- **N6** · « Aucun énoncé de famille entre cellules servies ; la divulgation « échecs attendus ≤ test_delta × T » reste à imprimer. »
  source : 0004 l.81-87, l.123, l.196 ; W1R l.760 · touche : README et notes de version à venir · nature : T
  item : PXC-09 partie 3 (famille et divulgation) ; PXC-01 partie 2 (F-W2-4 et F-W2-8, hors d'ETAT : à re-former à ETAT) · porteur :
    PAROXYSME (chantier) ; MONARK (ligne d'ETAT ; la lecture du déclencheur de F-W2-4, décision technique dans sa délégation, et non du
    fondateur : ETAT l.556-558 à `565c7065` ; MSG2 l.21-23) · déclencheur : partie 3 de PXC-09 (F4) ; partie 2 de PXC-01 (F3)
  état : ouvert · suite : même limite que MK-L05 du registre du Harnais ; déclencheur de F-W2-4 : la lecture tranchée par MONARK, écrite
    à sa re-formation par PXC-01 p2, sur la lecture de RECHERCHES (`INVENTAIRE-Moteur.md` l.337) (ETAT l.260-261 à `5437cd0d` ; ETAT
    l.556-558 à `565c7065` ; §7, doute 17)
- **N7** · « Recalcul par un tiers impossible sur une ligne kata : q̂, k_obs et misses reposent sur des scores ni publiés ni tenus par le serveur. »
  source : C l.490-497 ; ETAT l.567-590 ; FC l.43-44, l.57-61 · touche : `README.md:61` (« replayable by a third party »), `:65` · nature : C/Dr
  item : VERIFIERS-LIST-F5A-1 (ETAT l.567-590 : la liste) ; PXC-11 THIRD-PARTY-1, partie 3 (formée à ETAT l.231-234 à `5437cd0d` pour
    l'attaquant « A » ; KATA-THIRD-PARTY-RECALC-1, à former, CC l.394 ; nommé KATA-ROW-PUBLIC-RECOMPUTE-1 par CC l.375 : §7, doute 13 ;
    l'engagement à clé s'y ajoute, la partie porte les deux : ETAT l.553-555 à `565c7065`, MSG2 l.19-20)
    · porteur : VERIFIERS : partie 1 (lot 1f) RECHERCHES, partie 2 MONARK (course)
    et RECHERCHES (code de 2a), partie 3 RECHERCHES (l.588-590) ; PAROXYSME (PXC-11 p3, ETAT l.554 à `565c7065`) · déclencheur : VERIFIERS :
    bloquant à la première table publiée dont une ligne porte `recompute` non nul (l.569-571) ; le G0 de PXC-11 partie 3 (ETAT l.555 à
    `565c7065`), en F3, le droit d'abord
  état : ouvert · suite : Q-B (v) (« oui », 2026-10-07, ETAT l.55-57 à `5437cd0d` ;
    JOURNAL de la boîte l.13 à `150c997`) couvre le service public d'un étalonnage,
    pas la redistribution des séries ni la publication des scores (PLAN l.893) ; au plus, une attente de PXC-11 p3 levée (PLAN l.625) ;
    même limite que MK-L11 et PX-Harness-19 du registre du Harnais ; P-INV-H-4 (lecture sur place : MONARK) et droit de publication des
    scores dérivés (fondateur) : PLAN §7.3
- **N8** · « La porte ne recalcule ni la valeur kata ni les barres derrière `features_digest` : l'énoncé suppose le kata calculé sur ces barres. »
  source : C l.343 ; ETAT l.743-749 · touche : aucune · nature : C/T
  item : KATA-INPUT-RECOMPUTE-1 (ETAT l.747-749) ; F-K-7 (ETAT l.743-746) ; PXC-13 K8-CALLER-INPUT-1, partie 1 (décision F-K-7 et phrase
    K-8 du texte de ligne) et partie 3 · porteur : RECHERCHES (spécification et code) et MONARK (version, déploiement ; F-K-7, l.744) ;
    PAROXYSME (PXC-13 p1 et p3) · déclencheur : le G0 de la prochaine version du contrat (l.748-749) ; F-K-7 : avant le service de la
    vague 1, inchangé au re-port de MONARK (ETAT l.260 à `5437cd0d` ; ETAT l.563 à `565c7065` ; MSG2 l.26-27) ; PXC-13 p1 avant la vague
    1 servie (F2) ; partie 3 de PXC-13 (F4)
  état : changé (items formés à ETAT depuis l'inventaire) · suite : décision F-K-7 (« pas à E-2a, limite servie par S-K8 », l.744-745)
    attendue au G0 court d'E-2a, accepté (ETAT l.107), non consignée à ETAT ; déclencheur re-porté par MONARK, puis par sa ligne datée du
    2026-10-08, la décision restant due (ETAT l.563 à `565c7065` ; §7, doute 16) ; même limite que PX-Harness-18 et MK-L15 du registre du
    Harnais
- **N9** · « Le digest d'une suite 0/1 de 30 points ou moins est inversible. »
  source : C l.361 ; ETAT l.599-613 ; `docs/G0-lot-short-digest-inversion-1.md:245-251` (attaquant « A ») · touche : aucune · nature : C/T
  item : SHORT-DIGEST-INVERSION-1 (ETAT l.599-613) ; E2A-DIGEST-FLOOR-TEST-1 (tuyau, l.621-632) ; SHORT-DIGEST-SPEC-TEXT-1 (l.696-703) ;
    pour l'attaquant « A », PXC-11 THIRD-PARTY-1, partie 3 (item formé sous le nom de la partie à ETAT l.231-234 à `5437cd0d` :
    engagement à clé des empreintes de suite publiées, option (e), G0 l.379, qui généralise DIR-4H-DIGEST-COMMIT-1, ETAT l.614-620 ;
    prix à chiffrer à son G0 ; la même partie porte KATA-THIRD-PARTY-RECALC-1 (CC l.375, l.394 ; §7, doute 13), à former, et
    l'engagement s'y ajoute : ETAT l.553-555 à `565c7065`, MSG2 l.19-20)
    · porteur : RECHERCHES (l.604 ; code du tuyau au partage 80/20, l.629-630 ; texte, l.702) ; MONARK (brouillon
    du texte, l.702) ; PAROXYSME (PXC-11 p3, ETAT l.554 à `565c7065`) · déclencheur : SHORT-DIGEST : la révision qui publiera des lignes
    kata (l.603-604) ; TUYAU : atteint (`wave1.json` versé, l.631-632), le test reste à construire avec E-2a ; SPEC-TEXT : avant la
    première publication datée de lignes kata, avec sa ligne P0 (l.702-703) ; le G0 de PXC-11 partie 3 (ETAT l.555 à `565c7065`), en F3
  état : changé (construit au code, `upcoming` jusqu'au chargeur d'E-2a, ETAT l.613 et `docs/G7-lot-short-digest-floor.md:68-69` ; le
    code : plancher exact de 2^128 suites compatibles, `apps/harness/src/policy-digest-floor.ts:28`, appliqué par la porte
    (`scripts/spec-publish.mjs:284-297`) et par la garde (`apps/harness/src/policy-guard.ts:105-106`) ; G1 et G7 verts, G7 l.48-50,
    enregistrements sur l'hôte de MONARK, §7 doute 1 ; mesure des 280 lignes et modèle de menace, G0 l.143, l.237-247) · suite :
    restes : HKT-01, HKT-02, VERIFIER-REPORT-DIGESTS-1 (l.633-635), FLAT-CAP-NEXT-WAVE-1 (l.681-683), DIGEST-FLOOR-ATTACKER-COST-1
    (l.684-686), BAND-AUX-DIGEST-W2-1 (l.693-695) ; pour l'attaquant « A », qui recalcule la suite depuis les données publiques et la
    spécification, aucune règle de longueur ni de plancher ne change rien ; seule une non-publication ou un engagement à clé le ferait
    (G0 `docs/G0-lot-short-digest-inversion-1.md:245-246`, option (e) du §3, l.379) ; même limite que MK-L14 du registre du Harnais
- **N10** · « La clause kata servie dit « hold no committed calibration row » ; un fil-piège fait échouer le chargement à la première ligne. »
  source : `apps/harness/src/tools/gate.ts:232-234`, `:1042` ; `apps/harness/src/kata-path.ts:125-128` · touche : description servie de
    `gate` · nature : C
  item : KATA-CLAUSE-COMMITTED-STATE-1 (ETAT l.807-811) · porteur : RECHERCHES (texte et code, lot E-2a) ; MONARK (ligne Z-3) ·
    déclencheur : le premier chargement d'une ligne kata engagée (G0 court d'E-2a)
  état : ouvert · suite : même limite que PX-Harness-17 du registre du Harnais (volet clause) ; la description est coupée chez un client (HKT-05)
- **N11** · « Le README exporté du paquet est périmé : `btc-dir-15m`, « Phase 1 », titre HAC-CP, paramètres v0 ; rien sur `risk-control` ni 1.1.0. »
  source : HR:1, :16-24, :45-46 ; `scripts/export-public.mjs:36-38` · touche : HR (miroir public) · nature : C (texte)
  item : PXC-02 partie 2 (README de `packages/hikae` réécrit pour 1.1.0 ; HIKAE-TEXT-1-1-0-1, à former) · porteur : PAROXYSME ·
    déclencheur : partie 2 de PXC-02 (F3) ; publication : release du miroir (acte du fondateur)
  état : ouvert · suite : octets inchangés depuis le 2026-09-27 (INV l.46) et depuis `d8fe354c`
- **N12** · « Textes du site au-delà du témoin : « online monitor », « optional: an attested testimony », « margin q-hat per class », « a monitor ». »
  source : DP:61, :63, :66, :70 ; HP:64 ; témoins : HAR:47, :111 ; `apps/harness/src/attestation-binding.ts:64-65` ; C l.225 ·
    touche : DP:61-70 ; HP:64 · nature : C (texte)
  item : PXC-02 partie 1, noyau (DP l.61, 63, 66, 70 : liste (a), PLAN l.661-662) ; HP:64, hors de la liste (a), à placer par l'ADR de
    PXC-02 · porteur : PAROXYSME · déclencheur : tâche 2 du TABLEAU (ADR de PXC-02 et noyau, F1) ; publication : go d'envoi du site
    (acte du fondateur, par MONARK), donné le 2026-10-08 pour l'envoi qui suit O-1 et la lecture sur place d'I-G2-5 par MONARK (ETAT
    l.486-489 à `565c7065`)
  état : ouvert · suite : constructions : PXC-08 pour `attested`, PXC-16 (PLAN l.313-314) ; même phrase en HOW:289 (§7, doute 4)
- **N13** · « Le README promet que chaque `commit` dépense `B_t` ; la règle servie le rend inchangé, rien ne le dépense ; jeton « à annoncer ». »
  source : `README.md:262-264` ; `apps/site/lib/sim.ts:43` ; `packages/hikae/src/l3-gate.ts:158` ; HAR:61 · touche : `README.md:13`, `:79`,
    `:197`, `:255`, `:262-264` · nature : C
  item : PXC-02, liste (b) du PLAN §5.1 (« carried unchanged until the token exists »), parties 2-3 ; PXC-10 partie 3 (construction)
    · porteur : PAROXYSME ; le fondateur (label Backbone et jeton, CX-07 ; par MONARK) · déclencheur : la décision du fondateur avant la
    release de textes servis (PLAN §7.3), puis parties 2-3 de PXC-02 (F3) ; partie 3 de PXC-10 (F4)
  état : ouvert · suite : voir L9 ; la construction côté jeton est un acte du fondateur (INV l.168)
- **N14** · « Surveillance par clé kata (CM-5) non planifiée, déclencheur T0 passé ; seules protections : vetos TEST, FWD, bridge et retrait. »
  source : ADR-CM l.67 ; ETAT l.533-543 ; F9 l.117 · touche : `README.md:53-56` · nature : C/T
  item : CM-5-PLAN-1 (ETAT l.533-537) ; PXC-10 CM-5-RETIRE-1, partie 1 · porteur : RECHERCHES (ETAT l.534 ; c3 et c4, l.535) ; MONARK
    (oracles d'hôte, G2, courses, l.536-537) ; PAROXYSME (partie 1) · déclencheur : T0, atteint (ETAT l.534) ; partie 1 de PXC-10 après
    la mesure de R-b (F3)
  état : changé (G0 de CM-5 écrit par RECHERCHES, ETAT l.538, l.543 ; partage daté, l.535-537) · suite : même limite que MK-L22 du
    registre du Harnais (volet surveillance)
- **N15** · « Retrait d'une ligne servie : R-a non servie avant E-2a ; répétition chronométrée à faire ; preuve et cause `adr:` contrôlées en forme seule. »
  source : ETAT l.947-971, l.1020-1029, l.1760-1766 ; `docs/G7-lot-retire-path-ra.md` · touche : aucune · nature : C
  item : RETIRE-LATENCY-REHEARSAL-1 (ETAT l.1020-1029), RETIRE-LISTS-E2A-PIPE-1 (l.947-955), RETIRE-EVIDENCE-BIND-1 (l.965-967),
    RETIRE-ADR-CAUSE-FILE-1 (l.968-971) · porteur : MONARK ; RECHERCHES pour la liste (l.951) · déclencheur : maintenant (l.1022-1023),
    atteint, acte en cours (ETAT l.1024-1032, l.1095-1097) ; lot b1 d'E-2a (l.951-952) ; premier retrait `live:` (l.966-967) ; première
    liste à cause `adr:` (l.970-971)
  état : changé (R-b fusionnée, ETAT l.1764-1766) · suite : même limite que MK-L22 et MK-L23 du registre du Harnais ; HKT-06, HKT-07
- **N16** · « Aucune option par calibration en BYO ni dans `calibrate` : la méthode y reste `split`. »
  source : `apps/harness/src/tools/calibrate.ts:116`, `:169-171` ; `apps/harness/src/tools/gate.ts:474`, `:496` ; C l.569 ; 0004 l.193 ·
    touche : description de `calibrate` · nature : C/T
  item : PXC-09 partie 4 (BYO et `calibrate`) ; PXC-01 partie 2 (F-W2-1, nommé à ETAT l.565 à `565c7065` sans y être formé, à
    re-former à ETAT par la recartographie de cette partie : ETAT l.564-566 à `565c7065` ; MSG2 l.28) · porteur : PAROXYSME
    (chantier) ; MONARK (ligne d'ETAT) · déclencheur : partie 4 de PXC-09 (F5) ; partie 2 de PXC-01 (F3)
  état : ouvert · suite : ligne d'attente datée (P-25) : ETAT l.270-273 à `5437cd0d` (PLAN l.617-618) ;
    déclencheur de 0004 : la première cellule par calibration (INV l.171)
- **N17** · « Le registre PAROXYSME de la pièce manque au dépôt ; PX-Hikae-1 à -11 n'ont ni porteur ni déclencheur à ETAT. »
  source : `git ls-tree --name-only 87b821b0 docs/` (seul `docs/PAROXYSME-Dojo.md`) ; ETAT l.1853 (modèle : PAROXYSME-DOJO-FILE-1) ·
    touche : registre public, Hikae `built` (`README.md:34`, `:105` ; `apps/site/lib/fleet.ts:150`) · nature : C
  item : versement intérimaire (a′) (PLAN §4.1 A, l.540), fait ; PXC-01 PAROXYSME-STANDARD-1, partie 2 (re-formation à ETAT des onze
    PX-Hikae ; CC l.91, l.109 ; MSG l.85) · porteur : PAROXYSME (écriture ; PXC-01 p2) ; MONARK (fusion et lignes d'ETAT) · déclencheur :
    la fusion de la PR de ce versement, faite ; partie 2 de PXC-01 (F3)
  état : changé (registre versé ; items à re-former par PXC-01 p2) · suite : versé par #242, fusion `1df4e44f`, qui clôt N17 pour le
    registre seul (ETAT l.181-184 à `5437cd0d`) ; PX-Hikae-1 à -11 portés ici (§6), à re-former à ETAT par PXC-01 p2 ; PX-STD-ORPHAN-1
    n'est pas étendu (MSG l.85)
- **N18** · « q̂ = 0 sur liq est rendu `under_calib` : la raison écrite E-14 est tombée, la raison distincte existe, le contrat garde `under_calib`. »
  source : ADR-CM l.125, l.267 ; C l.189 · touche : aucune · nature : C
  item : PXC-16 HARNESS-NEXT-1, partie 1 (E14-REASON-1, à former : raison réécrite) ou partie 3 (changement en 1.2.0) · porteur :
    PAROXYSME (pièce copropriétaire : Ukemi) · déclencheur : partie 1 de PXC-16 (F2) ; bascule 1.2.0 (F4)
  état : ouvert · suite : même limite que E-14 ; elle reste ici : les registres du Harnais (son §6) et Ukemi (son §6 et son doute 8)
    y renvoient
- **N19** · « La garde BYO des confusables laisse passer les imitations ASCII hors de sa réduction fermée : classe résiduelle déclarée. »
  source : `apps/harness/src/tools/gate.ts:806-808` ; ADR-CM l.231 ; ETAT l.1553-1555 · touche : aucune · nature : C
  item : BYO-LOOKALIKE-RESIDUAL-1 (ADR-CM l.231 ; nommé à ETAT l.1555, non formé) ; PXC-16 HARNESS-NEXT-1, parties 1 et 2 (squelette
    UTS #39 restreint, séparateurs, préfixe `kata`) · porteur : RECHERCHES (ADR-CM l.231) ; PAROXYSME (PXC-16) · déclencheur : ceux
    d'ADR-CM l.231 : (a) le plan de CM-4 (B-14), (b) plus tôt, une imitation résiduelle observée dans un appel BYO réel ou rapportée
    par un tiers (non tiré) ; lecture d'UTS #39 en partie 1 de PXC-16 (F2) ; garde servie en partie 2 (F3), sous go du fondateur
    (ligne B neuve)
  état : ouvert · suite : même limite que PX-Harness-16 du registre du Harnais
- **N22** · « Droit des séries : le service public d'un étalonnage dérivé des séries Binance n'est pas couvert clairement par la licence (usage interne). »
  source : FC l.43-44, l.57-61, l.66-67 ; ETAT l.33-34, l.246-247 · touche : service public des lignes kata (vague 1) · nature : Dr
  item : PXC-18 JURISTE-DROIT-1, partie 1 (dossier juriste) ; DATA-LICENCE-KATA-1 et DATA-ACCORDS-TEXTS-1, formés à ETAT le 2026-10-08
    (ETAT l.559-562 à `565c7065` ; MSG2 l.24-25 ; avant : DATA-ACCORDS-TEXTS-1 sans son identifiant à ETAT à `87b821b0`, l.246-247, puis
    nommé sans être formé à ETAT l.55-57 à `5437cd0d` : « reste ouverte » ; DATA-LICENCE-KATA-1 absent d'ETAT)
    · porteur : le fondateur (DATA-ACCORDS-TEXTS-1 ; DATA-LICENCE-KATA-1, accord écrit ou licence ; par MONARK : ETAT l.559-562 à
    `565c7065`) ; PAROXYSME (dossier) · déclencheur : avant le service public des lignes kata (PLAN §7.3 ; ETAT l.560, l.562 à
    `565c7065`) ; partie 1 de PXC-18 (F3)
  état : changé (Q-B (v) tranchée « oui » le 2026-10-07 : ETAT l.55-57 à `5437cd0d` ; JOURNAL de la boîte l.13 à `150c997` ; doute 11
    de l'inventaire levé, §7 doute 5 ; les deux items formés le 2026-10-08) · suite : même limite que MK-L28 du registre du Harnais

## 4. Limites closes ou obsolètes (avec preuve)

### 4.1 Limites du 2026-09-27 (4, INV §3.1)

- **L11** · « Classe servie `btc-dir-15m` synthétique. » · obsolète (preuve : commit de retrait `77e825c6`, 2026-10-03 21:34:18 UTC ;
  `apps/harness/src/tools/gate.ts:68-69`, `:92-94`, refus nommé `task_class_retired` ; ADR-CM l.95, B-5 ; HAR:31) · suite : remplacée par
  N2 ; HR:16-24 périmé (N11) ; commit relu dans le clone complet (§7, doute 8)
- **L12** · « Prédicteur réel « Phase 2 », S2b réel jamais exécuté. » · obsolète (preuve : chemin abandonné pour les katas, vague 1 sur
  séries réelles, W1R l.3-4 ; registre `apps/harness/data/kata/registry/wave1.json` versé, ETAT l.631-632) · suite : HR:22-24 périmé (N11)
- **L14** · « Réserve Su et al. : jamais testé sur une API propriétaire. » · obsolète (preuve : aucun prédicteur LLM sur un chemin servi ;
  prédicteurs kata, `apps/harness/src/tools/gate.ts:234-235` ; BYO sur les scores de l'appelant, `:256-257`)
- **L23** · « Ordre des raisons, lecture d'horloge, sémantique d'`abstain` donnés comme « choix déclarés ». » · clos (preuve : tests à
  `87b821b0`, `packages/hikae/test/oracle-l3-interval.test.ts:3-4`, `:67-72`, `:119` (ordre des raisons écrit depuis ADR-M002 D5, horloge
  comprise, chaque combinaison énumérée) ; `packages/hikae/test/l3.test.ts:53`, `:111`, `:127` (`abstain` et ses raisons) ; contrat C §6
  l.159-217) · suite : reclassée par l'inventaire (INV l.149, doute 9) ; reste au §7, doute 1 : l'égalité de C avec le contrat publié

### 4.2 Limites nouvelles (2, INV §3.2)

- **N20** · « Pas d'instant de décision ; borne de retard de 300 s ; un horizon de moins d'1 h exige sa propre valeur. » · clos (preuve :
  DECIDED-AT-1 clos par raison écrite, ETAT l.828-831)
  · suite : se rouvre avec LATE-CALL-WINDOW-1 (ETAT l.775-778 ; ADR-CM l.328, l.331) si la mesure de latence le demande
- **N21** · « Bord de bande USDe à un demi-ulp près (B-7), déclaré. » · clos (preuve : bords tirés du test du score, B-13, ADR-CM l.253 ;
  `apps/harness/src/tools/gate.ts:133-134`)

## 5. Limites marquées PAROXYSME apparues à ETAT depuis l'inventaire

Commande (à la tête, sans réseau) : `git diff -U0 57a131fc 87b821b0 -- docs/ETAT.md | grep '^+' | grep PAROXYSME` : dix lignes, soit huit
limites, un bloc et la ligne de suite de RETIRE-LATENCY-FIRST-REAL-1 (ETAT l.1103). Le bloc « Limites déclarées des textes figés de R4
v2 » (ETAT l.730-778) porte des items déjà rattachés aux entrées L3 (KATA-EXCH-TEST-1), N1 (F-W2-9a, -9b, -9c) et N8 (F-K-7,
KATA-INPUT-RECOMPUTE-1), et LATE-CALL-WINDOW-1 (registre du Harnais), qui rouvrirait N20 ; ses autres items (SERVER-CLOCK-BOUND-1, W2-MKL09-ADDENDUM-1) sont au
registre du Harnais, NARABI-POLICY-TEXT-REV-1 au registre Narabi. DOJO-PROBE-UID-BOUNDARY-1 (ETAT l.1889) touche les sondes de Narabi et
du Dōjō, pas la porte. Les sept autres limites touchent la porte : chacune qualifie une entrée de ce registre, dite en suite ; ce sont
les mêmes que HT-01 à HT-07 du registre du Harnais.

- **HKT-01** · « Les quatre tables dir-4h ne peuvent être servies sans divulguer des suites sous 2^128. »
  source : ETAT l.614-620 · touche : aucune (tables retenues) · nature : T/C
  item : DIR-4H-DIGEST-COMMIT-1 (ETAT l.614-620) · porteur : RECHERCHES (spécification), puis MONARK (code) · déclencheur : avant tout
    service d'une table dir-4h, ou avant le pré-enregistrement de cellules de direction d'une autre vague
  état : ouvert · suite : reste de N9 ; même limite que HT-01 du registre du Harnais
- **HKT-02** · « Les bornes du double comptage et de l'union sont des minorants : elles peuvent retenir une ligne au compte exact suffisant. »
  source : ETAT l.687-692 · touche : un texte qui écrirait « exact » sans réserve · nature : T
  item : DIGEST-FLOOR-FLAT-EXACT-1 (ETAT l.687-692) · porteur : MONARK, avec RECHERCHES pour la preuve · déclencheur : une ligne `sign-set`
    d'une vague future entre la borne et le compte f = 0, ou un texte qui écrirait « exact » sans réserve
  état : ouvert · suite : reste de N9 ; sans effet sur la vague 1 (ETAT l.691-692) ; même limite que HT-02 du registre du Harnais
- **HKT-03** · « Rien ne lie à la porte la ligne entière d'une ligne publiée ; ses colonnes de décision ne sont lues qu'en présence ou en compte. »
  source : ETAT l.652-662 · touche : aucune · nature : C/T
  item : VERIFIER-REPORT-DECISION-DIGEST-1 (ETAT l.652-662) · porteur : RECHERCHES (spécification), code au partage 80/20 · déclencheur :
    avant une release datée dont les tables ne sortiraient pas de l'écrivain, ou avant le rapport de la vague 2
  état : ouvert · suite : touche N7 (vérification par un tiers) ; même limite que HT-03 du registre du Harnais
- **HKT-04** · « La tête de la chaîne des essais ne se recalcule des seuls fichiers publiés qu'avec le lieu, que la porte de vocabulaire refuse en prose. »
  source : ETAT l.724-729 · touche : aucune · nature : M
  item : TRIAL-HEAD-PUBLIC-REPLAY-1 (ETAT l.724-729) · porteur : RECHERCHES, avec E-2a · déclencheur : la première publication datée de
    lignes kata, après #221
  état : ouvert · suite : touche N7 ; prix à chiffrer à son G0 ; même limite que HT-04 du registre du Harnais
- **HKT-05** · « Un client MCP coupe la description de la porte à 2 048 unités : la fin de la clause d'honnêteté n'est pas vue. »
  source : ETAT l.812-823 · touche : description servie de `gate` (« Never a probability of being right ») · nature : C/texte
  item : GATE-DESC-CLIENT-CUT-1 (ETAT l.812-823) · porteur : MONARK (la décision) ; RECHERCHES (recherche et construction) · déclencheur :
    avant T_f(c)
  état : ouvert · suite : touche N10 (clause kata) ; même limite que HT-05 du registre du Harnais
- **HKT-06** · « Un dossier daté ne change que des tables dont les lignes citent un seul rapport ; un retrait mixte prend deux cycles. »
  source : ETAT l.1075-1084 · touche : aucune · nature : C
  item : DATED-DIR-MULTI-REPORT-1 (ETAT l.1075-1084) · porteur : RECHERCHES (code), G2 MONARK · déclencheur : avant la première liste de
    retrait après c′, et avant RETIRE-LIST-WRITER-1
  état : ouvert · suite : touche N15 ; voie (a) ou (b), au choix de MONARK (ETAT l.1082-1083) ; même limite que HT-06 du registre du Harnais
- **HKT-07** · « Le premier retrait réel est mesuré de T_a à T_g d'un seul tenant ; au-delà de 14 jours, c'est un écart à D6. »
  source : ETAT l.1101-1103 · touche : aucune · nature : M
  item : RETIRE-LATENCY-FIRST-REAL-1 (ETAT l.1101-1103) · porteur : MONARK · déclencheur : ce premier retrait réel (`live:1` au plus tôt
    le 2027-01-01, ou une cause `adr:` avant)
  état : ouvert · suite : touche N15 ; même limite que HT-07 du registre du Harnais

## 6. Renvois

- **Limites d'autres pièces que l'inventaire cite** : PX-Shogen-3 et -4 (avec L15 et L16 ; PX-Hikae-10 y est fusionnée) et la limite
  Shōgen des valeurs du témoin servi non épinglées (`docs/G7-lot-cm-2b-surfaces.md:51`) : registre Shōgen ; le tracker et la suite de
  NARABI-THEORY-1 (L18) : registre Narabi, qui renvoie ici L18 et L8 (même famille que ses L9 et L33, son §6) ; `ukemi-liquidable-24h`
  (L21) et E-14 (N18) restent ici : les registres Ukemi (son §6) et du Harnais (son §6) y renvoient ; « Connects: Hikae, Shōgen » sans
  import (N-02 de Bell) : registre Bell.
- **Limites de Hikae aussi au registre du Harnais** (le lien est dit en suite de chaque entrée) : L3 et MK-L01 ; L6b et MK-L34 ; L13, N3
  et MK-L08 ; L19 (`hac-cp`) et MK-L33 ; N1 et MK-L02 ; N2, N10 et PX-Harness-17 ; N4 et MK-L04 ; N6 et MK-L05 ; N7, MK-L11 et
  PX-Harness-19 ; N8, PX-Harness-18 et MK-L15 ; N9 et MK-L14 ; N14 et MK-L22 ; N15, MK-L22 et MK-L23 ; N19 et PX-Harness-16 ; N22 et
  MK-L28 ; HKT-01 à HKT-07 et HT-01 à HT-07.
- **Renvois du registre du Harnais vers celui-ci** (son §6, à `376225c`) : PX-Hikae-4 (L6b, L7) et X-9 (`alpha` et `nMin` imposés sur
  les clés engagées, `INVENTAIRE-Moteur.md` l.305 : voir L6a, L6b) ; PX-Hikae-6 (L8, L9) ; PX-Hikae-9 (close au servi avec L11,
  recentrée en N3) ; PX-Hikae-10 (L15 à L17) ; PX-Hikae-11 (Q6) ; E-14 (N18), partagé avec Ukemi.
- **Les onze items du 2026-09-27** (N17) : PX-Hikae-1 (L1, N4) ; -2 (L2) ; -3 (L6a) ; -4 (L6b, L7) ; -5 (L4, L5) ; -6 (L8, L9) ; -7 (L3) ;
  -8 (L10, N14) ; -9 (N3) ; -10 (L15 à L17) ; -11 (Q6).

## 7. Doutes nommés (ce qui ne se reproduit pas tel quel à la tête)

1. **Sources hors du tronc.** Les lignes de C (copie de RECHERCHES, sha256 `ac8187fa7662…`, INV l.38), 0004, F9, W1R, PROC, de la fiche
   du 2026-09-27 et de PX-IDENT sont celles que l'inventaire a lues ; elles ne sont pas relues ici. L'égalité de C avec le contrat publié
   n'est pas vérifiée (INV l.291-292) : c'est le seul reste de L23, close par les tests du tronc (§4.1). Les chiffres de la vague 1 que
   W1R donne (INV l.75-76) sont recomptés au tronc : `git show 87b821b0:apps/harness/data/kata/registry/wave1.json`, 280 lignes (`rows`),
   compte du champ `status` par genre de `taskClass` (`-dir-` ou non) : direction 239 `silence` et 1 `vetoed` ; bande 2 `region`,
   37 `silence` et 1 `vetoed` ; égaux à INV l.75-76 (L13, N3). Les enregistrements d'oracle G1 et G7 du plancher d'empreinte
   (`5463028a…`, `ef3ef079…` ; message `07d99e2` de la boîte, l.11-16) sont sur l'hôte de MONARK : non revérifiables ici (N9).
2. **Items absents d'ETAT à la tête** (`grep -c` dans ETAT à `87b821b0` : 0 pour chacun, sauf BYO-LOOKALIKE-RESIDUAL-1, 1, nommé
   sans être formé, l.1555) : F-W2-1, F-W2-2, F-W2-3, F-W2-4, F-W2-8, ATTEST-KATA-SUBJECT-1, DATA-ACCORDS-TEXTS-1, PX-Hikae-1 à -11,
   et les items des ADR M009 (a), (d), (e), (f), d'ADR-M017 l.117 et d'ADR-CM l.231 (BYO-LOOKALIKE-RESIDUAL-1), et les items « à
   former » de l'inventaire et des fiches (SELECTIVE-COMMIT-1, KATA-PARAM-BASIS-1, KATA-THIRD-PARTY-RECALC-1, HIKAE-TEXT-1-1-0-1,
   E14-REASON-1, DATA-LICENCE-KATA-1). MONARK-SHOGEN-FRAICHEUR-1 n'est pas à former : il est formé au dépôt Shōgen (ADR-0028 annexe B
   l.148, porteur MONARK, `INVENTAIRE-Shogen.md` l.44), à transcrire (L16). Leurs entrées les portent par un chantier ; leur
   re-formation à ETAT, que MONARK écrit, passe par PXC-01 partie 2 pour ceux que sa fiche nomme (CC l.91-92, l.98-99 ; F3), sinon par
   la partie qui les forme ; F-W2-1 et F-W2-3, deux des douze items couvrants d'Ukemi, passent par la recartographie de PXC-01 partie 2,
   une seule route, et ETAT les nomme depuis sans les former (ETAT l.564-566 à `565c7065` ; MSG2 l.28 ; L6a, N16) ;
   DATA-ACCORDS-TEXTS-1 et DATA-LICENCE-KATA-1 sont au fondateur (PLAN l.893, l.902), formés à ETAT le
   2026-10-08 (ETAT l.559-562 à `565c7065` ; N22) ; la liste de
   PX-STD-ORPHAN-1 (PLAN l.541, l.897) n'en nomme aucun. Les items du plan cités ici (DATA-ACCORDS-TEXTS-1, CARTO-BR-2026-10-1,
   PX-IDENT-C0BIS-1, PX-STD-ORPHAN-1) sont formés par le PLAN (§7.3, l.896-902 : propriétaire MONARK, sauf DATA-ACCORDS-TEXTS-1, au
   fondateur, l.902) et ne sont pas non plus à ETAT à `87b821b0` (DATA-ACCORDS-TEXTS-1 y est formé depuis : ETAT l.559-560 à `565c7065`).
3. **Parties choisies par ce registre.** La fiche du chantier ne fixe pas la partie de L1 (+L24) (PXC-09 p3), L6a, L6b, L7, Q6, N5
   (PXC-09 p1, dont la sortie est une « synthèse à verdict par entrée », CC l.339), L13 et N3 (PXC-17 p1 D4 et p2), L18 (PXC-04 p5), L20
   et L22 (PXC-01 p2), N18 (PXC-16 p1 ou p3) : ce registre les place selon l'objet des parties ; l'ADR de chaque chantier les fixe.
4. **Textes du site hors du noyau.** « Hikae is a monitor » (HP:64) n'est pas dans la liste (a) du PLAN §5.1, qui ne cite que DP:61-70 ;
   la même phrase est en HOW:289, que l'inventaire ne cite qu'en L1. L'ADR de PXC-02 (tâche 2 du TABLEAU, l.34) les place.
5. **N22 et doute 11 de l'inventaire.** Le fondateur a répondu « oui » à Q-B (v) le 2026-10-07 (JOURNAL de la boîte, l.13 à `150c997`,
   l.12 à `07d99e2` : le JOURNAL s'écrit par le haut) ; la question est celle du doute 11 (service public d'un étalonnage tiré des
   séries). La demande des textes des accords, DATA-ACCORDS-TEXTS-1, reste ouverte. La réponse et la demande ouverte sont écrites à
   ETAT l.55-57 à `5437cd0d`, sans porteur ni déclencheur pour la demande ; à `87b821b0`, ni Q-B (v) ni l'identifiant
   DATA-ACCORDS-TEXTS-1 ne sont à ETAT (`git show <tête>:docs/ETAT.md | grep -c`, motifs `DATA-ACCORDS-TEXTS-1` et `Q-B (v)` : 0 à
   `87b821b0`, 1 à `5437cd0d`). La demande y est déjà écrite, sans identifiant, porteur ni déclencheur : « textes des accords
   attendus » (ETAT l.246-247 à `87b821b0` ; même texte à ETAT l.383-384 à `5437cd0d`), la ligne que le PLAN donne à l'item (PLAN
   l.193, l.893 : « ETAT l.215-216 », à la tête qu'il lit, l.53-55) ; à `5437cd0d`, ETAT en parle donc deux fois (l.55-57 et l.383-384).
   ETAT l.33-34 garde « usage interne » pour les FAITS (texte identique aux deux têtes). Tranché le 2026-10-08 : MONARK forme
   DATA-ACCORDS-TEXTS-1 et DATA-LICENCE-KATA-1, porteur le fondateur, par MONARK, déclencheur avant le service public des lignes kata
   (PLAN l.893), état formé (ETAT l.559-562 à `565c7065` ; MSG2 l.24-25).
6. **Ancres qui ont bougé à la tête.** ETAT (`57a131fc` → `87b821b0`, 17 plages, texte identique) : l.82 → 106, l.86 → 117, l.502-503 →
   533-534, l.518-531 → 567-580, l.539-545 → 599-779, l.573-577 → 807-811, l.578-581 → 828-831, l.651-654 → 947-950, l.651-667 →
   947-972, l.1288-1291 → 1760-1763, l.1376 → 1853 ; deux plages s'élargissent par des lignes insérées (les entrées citent l'item à ses
   lignes propres). Hors d'ETAT : `apps/harness/src/policy-guard.ts` l.109 → l.111 (lu à `57a131fc` : à `d8fe354c`, sa l.109 est `}`) ;
   `test/verify-harness-liq.test.ts` l.124 → l.131 ; `docs/G7-lot-retire-path-ra.md` absent à `d8fe354c`, inchangé depuis `57a131fc`.
   Commande : `node reanchor.mjs --repo <clone> --base <57a131fc | d8fe354c> --head 87b821b0 <fichier>:<ligne>…`.
7. **Ancre corrigée.** Pour L7, l'inventaire cite HAR:61, qui est la ligne de `remainingBudget` ; la ligne de `tauInterval` est HAR:64
   (fichier inchangé depuis `d8fe354c`).
8. **Commits relus dans le clone complet** (doute levé au pli de la G2). Peu profond à l'écriture du registre (542 commits), le clone est complet
   depuis le 2026-10-07 à 18:05:26 UTC (journal des références : `fetch --unshallow`) : `git rev-parse --is-shallow-repository` : false ;
   `git rev-list --count 87b821b0` : 4 176. Heures par `TZ=UTC git log -1 --date=iso-local` : `77e825c6`, 2026-10-03 21:34:18, retrait
   de `btc-dir-15m` (L11) ; `56acedf0`, 2026-09-18 00:46:16, crée `apps/sentinel/src/timeline.ts` avec `drift_flag` (L10) ; `1447c057`,
   2026-09-18 07:12:33, pose `HARNESS_VERSION = "0.4.0"` (doute 9), et `git log 1447c057..87b821b0 -- apps/harness/src/version.ts` ne
   rend aucun commit. Les trois sont ancêtres de `87b821b0` (`git merge-base --is-ancestor`).
9. **Doute 3 de l'inventaire** (version servie 0.4.0, `apps/harness/src/version.ts:22` ; `docs/RUNBOOK-vitrine.md:65`) : renvoi à
   PX-Harness-01 du registre du Harnais.
10. **Doute 4 de l'inventaire** (un test unitaire déclaré d'intégration, `apps/site/lib/fleet.ts:162` à la tête) : pas une limite de la
    table ; le PLAN le met au noyau de PXC-02 (liste (a), l.649-650 ; falsité 17, l.322) : porteur PAROXYSME, tâche 2 du TABLEAU (F1).
11. **Doute 9 de l'inventaire.** La calibration synthétique de `btc-dir-15m`, « gardée pour les fixtures » (HAR:31) : résidu ou non,
    non tranché ici ; propriétaire de N18 (porte ou Ukemi) : l'entrée nomme les deux.
12. **Constats de branchement de l'inventaire (§2, sans étiquette)** : `runs.ts`, `riskControlQuantile`, `riskControlRow`,
    `canonicalRow`, `orderedCalibDigest`, `conformScaledBand` n'ont toujours aucun appel ni import hors de `packages/hikae/src` et des
    tests (`git grep` à `87b821b0` ; les autres mentions sont des commentaires, et l'outil Python de `tools/kata-recalc/` les
    réimplémente) ; la couche de surveillance n'est consommée que par la sentinelle. Ils relèvent de la cartographie CARTO-BR-2026-10-1
    (PLAN §4.2, porteur orchestrateur).
13. **Nom de l'item de N7.** KATA-THIRD-PARTY-RECALC-1, le nom du registre du Harnais (PX-Harness-19, MK-L11) ; le même item est nommé
    KATA-ROW-THIRD-PARTY-RECOMPUTE-1 (INV l.208) et KATA-ROW-PUBLIC-RECOMPUTE-1 (CC l.375) : un seul item, un seul propriétaire, fixé au
    versement (CC l.658), porté par PXC-11 partie 3 (formée à ETAT l.231-234 à `5437cd0d` pour l'attaquant « A » ;
    KATA-THIRD-PARTY-RECALC-1, à former, CC l.394). Tranché par MONARK le 2026-10-08 : l'engagement à clé s'ajoute au contenu que CC
    l.394 donne à la partie, qui porte les deux ; porteur PAROXYSME ; déclencheur : le G0 de PXC-11 partie 3 (ETAT l.553-555 à
    `565c7065` ; MSG2 l.19-20).
14. **Plancher d'empreinte et attaquant qui recalcule.** Le cas que le G0 laisse sans item (l'attaquant « A »,
    `docs/G0-lot-short-digest-inversion-1.md:245-246`) est entré dans N9 (§3). Tranché par MONARK le 2026-10-07 : il a formé PXC-11
    partie 3, l'engagement à clé, prix à chiffrer à son G0 (ETAT l.231-234 à `5437cd0d` ; doute 18).
15. **Contrôle mécanique.** L'oracle du versement (`verify-registres.mjs`, pièce de la boîte) sort 0 sur `6e6c8782` et sur `376225ca`
    dans sa version `1fd31ee`, et sur la branche avec ce registre plié dans sa version `d97d838` (entrées prises entières, doutes
    épinglés) : 48 ids, 54 entrées (open 48, closed 6, head 7). La version `d2332e2` de `reanchor.mjs` ne refusait pas une ligne hors du
    fichier : les renvois « `fichier:ligne` » et « ETAT l. » de ce registre tombent dans leur fichier à `87b821b0` (`bounds.py`, pièce de
    la boîte, 2026-10-07 19:1x UTC).
16. **Décision F-K-7 (N8).** ETAT lui donne pour déclencheur « la première ligne kata servie, donc une décision au G0 court d E-2a »
    (l.744-745). Le G0 court d'E-2a est accepté (ETAT l.107, 12:1x UTC), et aucune ligne sous F-K-7 ne consigne la décision
    (`git show 87b821b0:docs/ETAT.md | grep -n F-K-7` : l.255 et l.743 ; `git show 87b821b0:docs/ETAT.md | sed -n '743,747p'` : l'item l.743-746,
    KATA-INPUT-RECOMPUTE-1 l.747, sans ligne datée entre eux). La pièce du G0 court est hors du tronc (dépôt de RECHERCHES) :
    non relue. Tranché par MONARK le 2026-10-07 : le déclencheur est une ligne datée sous l'item avant le service de la vague 1
    (ETAT l.260 à `5437cd0d`) ; l'item occupe ETAT l.882-885 à `5437cd0d` et KATA-INPUT-RECOMPUTE-1 le suit à ETAT l.886 à
    `5437cd0d`, sans ligne datée entre eux (`git show 5437cd0d:docs/ETAT.md | sed -n '882,886p'` ; à cette tête, `grep -n F-K-7` ne
    rend que l.260, l.392 et l.882) : la ligne datée reste à écrire. La question du §1 en sort. Le 2026-10-08, MONARK écrit le
    re-port : la décision attendue au G0 court d'E-2a reste due, déclencheur inchangé, avant le service de la vague 1 (ETAT l.563 à
    `565c7065` ; MSG2 l.26-27) ; l'item (ETAT l.1194-1197 à `565c7065`) n'a toujours pas de ligne datée sous lui.
17. **Déclencheur de F-W2-4 (N6).** Deux lectures : « K ≥ 20 cellules listées », atteint par un registre de 280 cellules (INV l.161) ;
    « until a cell reaches calib_attempt 2 », « lu comme un déclencheur atteint à la vague 2 », à confirmer par RECHERCHES
    (`INVENTAIRE-Moteur.md` l.337). Le CC attend une décision de l'investisseur sur ce déclencheur (CC l.334-335). F-W2-4 n'est pas à
    ETAT (doute 2) : sa re-formation par PXC-01 partie 2 (F3) écrit le déclencheur tranché. Tranché : MONARK l'a retenu le 2026-10-07
    (ETAT l.260-261 à `5437cd0d` ; à cette tête, `grep -n F-W2-4` ne rend que l.260). Selon la proposition retenue (MSG l.44-45,
    « retenu » ; MSG l.4 : réponse à la demande `6698269`, dont l.135-136 porte la proposition et l.132 renvoie au §1 de ce registre,
    l.63-64 à `5437cd0d`) : la lecture par RECHERCHES, la décision de l'investisseur (CC l.334-335) portée par MONARK (§0), à la
    re-formation par PXC-01 p2. La question du §1 en sort. Décision de MONARK du 2026-10-08, sur la question de la demande de fusion de
    #245, qui remplace ce partage : la lecture de ce déclencheur est une décision technique, dans sa délégation, et non au fondateur ;
    MONARK la tranche à la re-formation de F-W2-4 par PXC-01 p2, sur la lecture de RECHERCHES (ETAT l.556-558 à `565c7065` ; MSG2
    l.21-23) ; N6 le dit.
18. **Proposé à MONARK dans la demande de fusion, tranché le 2026-10-07** (MONARK écrit ETAT ; message `d6331f6`, ETAT à `5437cd0d`) :
    les lignes d'attente datées (P-25) des parties placées après le 2026-12-31 (PLAN l.617-618), L2 (PXC-09 p5), L15, L16 et L17
    (PXC-08 p3), L21 (PXC-17 p3), N16 (PXC-09 p4), sont écrites : ETAT l.270-273 à `5437cd0d` ; N9 : MONARK a formé PXC-11 partie 3
    pour l'attaquant « A » : ETAT l.231-234 à `5437cd0d` (doute 14) ; F-K-7 : une ligne datée sous l'item avant le service de la
    vague 1 : ETAT l.260 à `5437cd0d` (doute 16) ; F-W2-4 : la lecture tranchée, écrite à sa re-formation par PXC-01 p2 :
    ETAT l.260-261 à `5437cd0d` (doute 17) ; PX-Hikae-1 à -11 : à re-former à ETAT par PXC-01 p2, PX-STD-ORPHAN-1 n'est pas étendu :
    MSG l.85 (N17).

## 8. Ligne PAROXYSME et sources

**Ligne PAROXYSME (2026-10-07, décisions de MONARK pliées ; second tour le 2026-10-08 ; pli de l'après-#245, le 2026-10-08 à partir de
07:41 UTC).** Hikae : 41 limites ouvertes (21 du 2026-09-27, 20 nouvelles ; 18 à
l'état « changé ») et 6 closes (L23 close ; L11, L12, L14 obsolètes ; N20, N21). Aucune ⚑B : l'inventaire n'en marque aucune et le
PLAN juge PX-Hikae-8 et -9 en C1 (l.406-409). Limites neuves à ETAT : 7 ici (§5), les mêmes que HT-01 à HT-07 du registre du Harnais ;
54 entrées, 48 ouvertes, 6 closes, aucune ne change d'état dans ce pli.
Aucune dette établie parmi les entrées : chaque entrée ouverte a son item, son porteur et son déclencheur. Le registre est versé (#242,
fusion `1df4e44f`, ETAT l.181-184 à `5437cd0d`). Les questions renvoyées à MONARK sont tranchées (§7, doute 18) : PXC-11 partie 3
formée pour l'attaquant « A » (N9) ; déclencheurs de F-K-7 (N8) et de F-W2-4 (N6) re-portés ; lignes P-25 de L2, L15, L16, L17, L21
et N16 écrites. Celles de la demande de fusion de #245 le sont aussi (MSG2 §3) : un seul item par construction commune avec Ukemi
(L2 renvoie à la L21 d'Ukemi ; L3 porte KATA-EXCH-TEST-1, que la L20 d'Ukemi renvoie ; échéance : la recartographie de PXC-01 partie
2 ; ETAT l.567-570 à `565c7065`) ; PXC-11 partie 3 porte les deux constructions, déclencheur son G0 (N7, N9 ; doute 13) ; la lecture
du déclencheur de F-W2-4 est à MONARK (N6 ; doute 17) ; F-K-7 re-porté par sa ligne datée (N8 ; doute 16) ; DATA-ACCORDS-TEXTS-1 et
DATA-LICENCE-KATA-1 formés (N22 ; doute 5). Go d'envoi du site donné par le fondateur (N12).
PX-Hikae-1 à -11 restent à re-former à ETAT par PXC-01 p2 (N17) ; les autres items hors d'ETAT : §7, doute 2 (mesuré à `87b821b0` ;
DATA-ACCORDS-TEXTS-1 et F-W2-4 nommés depuis à ETAT, non formés : ETAT l.56 et l.260 à `5437cd0d` ; à `565c7065`,
DATA-ACCORDS-TEXTS-1 et DATA-LICENCE-KATA-1 formés : ETAT l.559-562 ; F-W2-1 et F-W2-3 nommés, non formés, à former par la
recartographie de PXC-01 partie 2 : ETAT l.564-566 à `565c7065`, MSG2 l.28 ; L6a, N16).

| Source | Lignes | sha256 |
|---|---|---|
| `docs/ETAT.md` à `87b821b0` | 1 904 | `3190de5c23507292414418cbb8b24e0f7c9f319dca64a0f5ae8c5009475a5b5a` |
| `docs/ETAT.md` à `5437cd0d` (décisions pliées : « ETAT l.N à `5437cd0d` ») | 2 089 | `64afc212a18bc683d892c7c7c6362abba46c1a4ed5db11061f4b25b63d07b0a9` |
| `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` à `87b821b0` | 331 | `64aa3e11a87ac59ce633d5191952824d06010970c34b73c749e1c1caa2430c7b` |
| `docs/adr/ADR-M009-aci-tracker.md` à `87b821b0` | 136 | `bf17b560745cfb450a5601c24e1ada54115bdfbdfd3dfedb78b548ea26ec1705` |
| `docs/adr/ADR-M011-interval-non-degenerescence.md` à `87b821b0` | 197 | `45f086d8b4ba11637a6cc10370b87073a50caf95b75bf9eec502e0e9978c52fc` |
| `docs/adr/ADR-M017-attested-price-dans-gate.md` à `87b821b0` | 162 | `c067405786aad8cf5d08fbc21e5cbf905ecf20502f11745abf3c30b0edebdfaf` |
| `docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md` à `87b821b0` | 427 | `157a560c08987d24e8c91090aedaa033fc644362f4f29858d55368a67a325a1a` |
| `README.md` à `87b821b0` | 353 | `6324c8b220ccb5378d5458ca883190b7241b0d3cdbc1e42d9f1697051e58b5ad` |
| `packages/hikae/README.md` à `87b821b0` | 54 | `39c016d325fe2c29b54cce0c05bb9b2f69766a39f69bfa59bca440e09cfdeb6f` |
| `packages/hikae/src/l1-split.ts` à `87b821b0` | 244 | `266987175b3398c0017cb89efd7a17bdd7ff48dd8990bce91afe37ce85d1c5c3` |
| `packages/hikae/src/l2-monitor.ts` à `87b821b0` | 83 | `f00df5f8e1fcaa1067b77bddb31de097ef51363ac72cd9170c995544e9c4587e` |
| `packages/hikae/src/l3-gate.ts` à `87b821b0` | 167 | `7fd788db3c339c5ca27e957fe35c86f1899c0ba5ae10c72819653b41888f3cc2` |
| `packages/hikae/src/index.ts` à `87b821b0` | 117 | `964cfae06523836e53426fd78dbcf21d6e59b95206421edb9c5283738406e2e7` |
| `packages/hikae/src/tracker.ts` à `87b821b0` | 161 | `1d3677ad65a74250bf28bfe4ae20f64bc373841a8272b68fe82456db8b504d71` |
| `packages/hikae/src/liquidable-24h.ts` à `87b821b0` | 67 | `eda0fb74fbc3a3386e0eac01658a4ddaa2199f88b055b88d4e90c26f421f61aa` |
| `packages/contracts/src/enums.ts` à `87b821b0` | 90 | `a4f0b7d4a210193ff66988dc3159aa88a04502242fd069b26c0d9970e0ed28e5` |
| `apps/harness/src/tools/gate.ts` à `87b821b0` | 1 070 | `7920ceaca2ce8231ecc2672b3a1ecd0e3a70c95971e80d225c107159558dadbd` |
| `apps/harness/src/tools/calibrate.ts` à `87b821b0` | 172 | `765921eca895d81325056041b384d6677d8f80c6149184d896ae1be42b78ba6b` |
| `apps/harness/src/class-policy.ts` à `87b821b0` | 31 | `19127536113b0767c6691df099ede1a1d9354e56c69ed4071624b3e31f73562b` |
| `apps/harness/src/attestation-binding.ts` à `87b821b0` | 65 | `3e59882de94f3fd6e457b4637f69c4e10556e10d8eee008ef14926e383321eed` |
| `apps/harness/src/kata-path.ts` à `87b821b0` | 129 | `21ef898d8ed34b1d4d5fcd3d4550f41e047f2c79b5f8b692c3a9ba3e4de9644f` |
| `apps/harness/src/policy-guard.ts` à `87b821b0` | 136 | `daa6c63d844cca8a769e5f1783b3c0102731c7febba619982f24c5eeca5e53d8` |
| `apps/harness/src/policy-digest-floor.ts` à `87b821b0` | 136 | `2d639b2bacbff554492e8615a6c1eef178e0b57cc4a4ed8a30c3cfa36f88035a` |
| `apps/harness/src/version.ts` à `87b821b0` | 22 | `56c8cf039e6a40cdf159e37bc4382b92ed61a20335d0cd990d837c96d3dd0f86` |
| `apps/harness/README.md` à `87b821b0` | 134 | `733479970acb68981dab5b3146f08ead3c4fdd4bbd8f3e1068d91c66a28baa7c` |
| `apps/sentinel/src/timeline.ts` à `87b821b0` | 184 | `ac357e7ddae380cf687bd97add4f03916374a16f1a2e42e7276466b12c1f2958` |
| `apps/site/lib/docs-pieces.ts` à `87b821b0` | 244 | `7023e2c3cd4f6217b3180e14a61c68940f84e7d3e1fec1675a37b599dca3cf95` |
| `apps/site/lib/fleet.ts` à `87b821b0` | 429 | `998fdf33a3c461f687ec604524c63ee739ef1b7dd77acba571523aa979f232f4` |
| `apps/site/lib/sim.ts` à `87b821b0` | 258 | `ca0bc588a9a56e9321dfa1b2058a358a91637ca86e9f08314ca481aa21f2685b` |
| `apps/site/components/hikae-panel.tsx` à `87b821b0` | 107 | `bb86a788302b9acc771f4f52ebfe1ea48e30ebc38e608310ce0ff2df368d56e2` |
| `apps/site/app/how/page.tsx` à `87b821b0` | 313 | `a78e7bd5be1d5360beee608ff062893b6172749b646db74233449a297f1b03e6` |
| `apps/site/app/docs/gate/page.tsx` à `87b821b0` | 271 | `804c126d967c7ec142aea76169666964eb74b21b21eea93726f8b8403211d2b5` |
| `docs/marche/FAITS-conditions-series-2026-10-01.md` à `87b821b0` | 88 | `798c5ac985e0111b1f1217ade67e2e6f9dcbe3a2c67a1bf38e99d7a9c126d093` |
| `docs/G7-lot-retire-path-ra.md` à `87b821b0` | 54 | `e20dfa588e20477460883cb1dee8b456f7af94f94cf965c46491befc11926132` |
| `docs/G0-lot-short-digest-inversion-1.md` à `87b821b0` | 838 | `c19b4cc96def0f3045ad850752abe0315593f9140184eb3d102012d4983e1ba4` |
| `docs/G7-lot-short-digest-floor.md` à `87b821b0` | 69 | `94b22436b7e2b67423e1859d03b8865880e74b7ad374e7cdc247ed7448aac1a1` |
| `docs/G7-lot-cm-2b-surfaces.md` à `87b821b0` | 71 | `17aa0a0502f8fd17c848f4b70569680713fc5fe49b65716dfa380efdc937fcbb` |
| `docs/RUNBOOK-vitrine.md` à `87b821b0` | 67 | `744945b157702c6f0107ac6f02d65e36b3cc98aaec7c8d7c81d27b6dedb5483a` |
| `docs/PAROXYSME-Dojo.md` à `87b821b0` | 853 | `56c3762e7ae9acd4fc3f8e0850a3750b343c4cb6f5968408f79d94503779674a` |
| `scripts/spec-publish.mjs` à `87b821b0` | 362 | `d0bf16aafae561896378f001e44ce3a1d47603ea78b1e03758a51c0338a27e82` |
| `scripts/export-public.mjs` à `87b821b0` | 644 | `b5d21a080703c257975ba31d0bddedf2e13e9ad5a9d65a8b5b6ad55e8f4b1502` |
| `spec/contract-1.1.0/policy/btc-dir-1h.json` à `87b821b0` | 1 | `c04ae2921430968857350fd2fa663d0931f92c1a9bfeb595a7d341d3a02cc6e1` |
| `spec/contract-1.1.0/policy/stable-run-velocity-24h.json` à `87b821b0` | 1 | `c7572e084a6765c5a145b54e3a93e1a0ee81b2ad6ccb38630399173454fbf0a8` |
| `test/verify-harness-liq.test.ts` à `87b821b0` | 726 | `179ddbe359ec2281c5c44b855d26eb3940c0db43fd1e8e8721c5699de64752d7` |
| `packages/hikae/test/oracle-l3-interval.test.ts` à `87b821b0` | 218 | `834fb9a22345227934b15dbe198c31037da7b91c7549a550398fbb64ac53b4a8` |
| `packages/hikae/test/l3.test.ts` à `87b821b0` | 136 | `ec025dce7293d586837cea38172207fab53f152eef256a2d011e1f6844efa96a` |
| `apps/harness/data/kata/registry/wave1.json` à `87b821b0` | 26 202 | `811fcd574e182f33e24e19795b18139adb1917cf392a02810705c6adda1dd9cb` |
| `docs/PAROXYSME-Harnais.md` à `376225c` (branche de ce versement) | 702 | `5c476acc9cf41bd38c74c7d72ec5978af639007d41e9f02891224f80dbf160d6` |
| `docs/PAROXYSME-Ukemi.md` à `376225c` (même branche) | 498 | `6e9c3cf8d185df4b17bebe7205bd78d25616a793bc7fcb2c31e7f5fabc516df1` |
| `docs/PAROXYSME-Shogen.md` à `376225c` (même branche) | 605 | `d44aa38b73cc6cd13f41551134d0d53c8bdc68ef98228ee75d5c12c073e70bea` |
| `docs/PAROXYSME-Narabi.md` à `ea0d2de4` (même branche) | 531 | `0b658e226be5b9f4530fad08847fb21f3dd158a099a35c95dc2d9a4374237ea7` |
| `docs/PAROXYSME-Bell.md` à `5b4d962d` (même branche) | 504 | `f7def06dc938afddb0d4fb42603f941af992ecf51a21d4ae1316c67aa4830a33` |
| `docs/PAROXYSME-Hikae.md` à `5437cd0d` (base de ce pli) | 599 | `38ca29f85d6684caa6bcfafb1c91865d3c0b042a049e054eecae47c7be18c003` |
| `docs/PAROXYSME-Ukemi.md` à `beea9834` (tête de ce pli, second tour) | 614 | `0118ac69ceb55194f21db0af28fc2b071c514f7a7d359ea70c57627ad706834c` |
| INV, boîte PAROXYSME, `dossier/etude-2026-10-06/inventaire/INVENTAIRE-Hikae.md` | 309 | `80b092d90f8c709e966906455eb015d7c5bb1ea459dfc7b1b706e83be8186ed5` |
| `INVENTAIRE-Moteur.md`, même dossier | 350 | `d724157e6f458e9dbc9fbd807bd364a825060b476e95526a51520fdf6ebf99ed` |
| `INVENTAIRE-Shogen.md`, même dossier | 291 | `c7cd6f49f362e8b9a4ffc63aacdc86fc078c2363b3216db9931c39c92d5ff533` |
| message de MONARK `07d99e2`, boîte PAROXYSME `coordination/messages/` | 23 | `ef1cded000da48460b4d5cf84793cd47a4e19f704a554887fba0ce491ed2672d` |
| MSG, message de MONARK `d6331f6`, boîte PAROXYSME `coordination/messages/` | 90 | `03f305908703f119cc82c7b9f0a29684f720c0eab0997514c019fe068b64306a` |
| demande de PAROXYSME `6698269`, boîte PAROXYSME `coordination/messages/` | 227 | `6486d6da494d82312549e087cc8afea18cff7aefcfc5579a37adc4a9dc818473` |
| CC, boîte PAROXYSME `dossier/etude-2026-10-06/CHANTIERS-CANDIDATS.md` | 1 260 | `86ed73a23b0bfd8e2da5ea40de3818ae8a105a7d406c6bc0607fb8914c5dcc60` |
| PLAN, même dossier, `PLAN-DE-ROUTE-PAROXYSME-2026-10-06.md` | 1 195 | `96b5b01858886906930f8be6e76094294dd71a9878a34b9b71804a160a645714` |
| JOURNAL, boîte PAROXYSME `coordination/JOURNAL.md` à `150c997` | 18 | `3e2a9572843ac3fbffe3f0a2fd26249fc0780d69c03e9ab2bcfa6c43f6d1ae4e` |
| TABLEAU, boîte PAROXYSME `coordination/TABLEAU.md` à `150c997` | 54 | `1fac9ba1b7d36fe02db804d0279a7f83f2d507da4f97553695a3b503cf1ddd6e` |
| `reanchor.mjs` à `d2332e2`, boîte, `coordination/pieces/2026-10-07-registres/` | 65 | `9ce778f21dc34cdf93cb5bceb41aa566de6ecc5390a39b8eb7993f3d731f4f8b` |
| `verify-registres.mjs`, même dossier, commit `1fd31ee` | 121 | `284a5ceda26073d5c46f0f5465b9410d221a1f9f475722eda3507e4cba17531e` |
| `verify-registres.mjs`, même dossier, commit `d97d838` | 127 | `6d71141222d2c32b995cd30e11335501e7021f4b2c7a38fb25053a61efe8712b` |
| `PLI-Hikae.md`, même dossier, commit `0a5ca61`, pli de la G2 du versement | 59 | `e4754d77a79d4e86ff48113e450fc283f3ff716a24870fab4df66b16de08a9b6` |

Les deux fichiers JSON de `spec/contract-1.1.0/policy/` tiennent sur une ligne, sans fin de ligne (`wc -l` y compte 0).

Sources du pli de l'après-#245 (2026-10-08) : ETAT à `565c7065` (tronc) ; MSG2, message de MONARK `d5553e7`,
`coordination/messages/2026-10-08-MONARK-vers-PAROXYSME-245-decisions.md` (boîte PAROXYSME) :

| Source | Lignes | sha256 |
|---|---|---|
| `docs/ETAT.md` à `565c7065` | 2 401 | `73ebf0597d9aa5030fd03b5ed3ccae3d08070fe00d50b1f89488ac7d79a0abd1` |
| MSG2, message de MONARK `d5553e7`, boîte PAROXYSME `coordination/messages/` | 44 | `8c3eade5c93ffd6af7283a0c724a9367566d3d8d668b184c23626e863cc7a7d8` |
