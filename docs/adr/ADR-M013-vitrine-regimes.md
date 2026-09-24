# ADR-M013 — Régimes de changement de la vitrine (`apps/site`) après la refonte : T0 / T1 / T2

- **Statut** : accepté (investisseur, 2026-09-18 — « je valide, et à chaque fois, je vérifierai moi-même personnellement à la fin, s'il y a des choses à
  retirer ou à changer »). Prend effet à la livraison du lot F-site-9a-ii (diagramme vivant), qui reste en T2.
- **Contexte** : chaque modification de la vitrine a jusqu'ici suivi AgileGates complet (plan, checkpoint-1, worker, G2 par agent, checkpoint-2, G7, journal
  long). Le coût est la cérémonie, pas les gates : l'oracle mécanique (`npm run ci` — honesty-lint, `gate:vocab`, `lang:gate`, champs gelés, registres,
  tests site ; `lint`, `lint:ratchet`, `export:check`) tient les invariants d'honnêteté en moins d'une minute. Question investisseur : « une fois qu'on a
  bien redesigné le site, on ne devrait pas refaire du AgileGates pour la vitrine à chaque fois ; juste des mises à jour, sauf un AgileGates léger pour
  les sous-pages comme celle de Narabi ».
- **Contrainte tenue** : R-22 (aucun gate suspendu). Cet ADR ne suspend rien ; il **dimensionne la cérémonie au diff**. G0 = cet ADR (rattachement par
  régime) ; G1 = ligne de journal ; G2 = relecture fraîche ≠ générateur, toujours ; G3/G4/G6 = oracle CI complet, toujours ; G5 = zéro dette, toujours ;
  G7 = verdict orchestrateur, toujours. Ce qui varie : plan, checkpoints validateur, longueur du journal.

## Décision

| Régime | Périmètre | Cérémonie | Acceptation |
|---|---|---|---|
| **T0 · mise à jour** | texte/copie, tokens de style, image ou icône **déjà sous licence consignée**, chiffre **déjà sourcé** ailleurs dans le dépôt, réordonnancement sans nouveau composant | orchestrateur édite ; oracle CI complet vert ; **G2 fraîche sur le diff** (instance séparée, checklist courte : honnêteté, vocab, langue, marques, chiffres) ; commit ; PR (R-25) ; déploiement sur go ; **une ligne** de journal | revue personnelle de l'investisseur après déploiement (retirer/changer) |
| **T1 · léger** | sous-page ou composant **sur registres et patrons existants** (ex. page Narabi live lisant `state.json`/`timeline.jsonl` publiés), sans registre ni contrat touché | **mini-plan** (≤ 10 lignes : but, fichiers, tests nommés, risque MAST principal) ; worker Opus 4.8 ; G2 fraîche ; oracle ; G7 ; journal court | idem + G7 |
| **T2 · complet** | tout ce qui touche un **registre** (`fleet.ts`, `profiles.ts`, présentation), un **contrat gelé** ou ses libellés, une **phrase publique nouvelle sur le moteur** (claims, garanties, méthode), un **chiffre nouveau**, une **dépendance** (R-8), la **liste d'export** public, une **marque tierce nouvelle**, un **nouveau service** ou une route serveur | AgileGates complet (plan → checkpoint-1 → worker → G2 → checkpoint-2 → G7 → commit) | validateur-humain + investisseur |

- **Bascule automatique** (fail-closed) : un changement engagé en T0/T1 qui (a) fait rougir un test existant, (b) modifie un fichier de registre ou de
  contrat, (c) introduit un nom de marque ou un chiffre absent du dépôt, ou (d) ajoute une dépendance, **monte en T2** avant toute suite. L'orchestrateur
  déclare le régime **dans le message de commit** (`site[T0]`, `site[T1]`, `site[T2]`) et dans la ligne de journal ; le G2 vérifie que le régime déclaré est
  le bon (première ligne de sa checklist).
- **Revue personnelle de l'investisseur** : siège d'acceptation final de la vitrine pour T0/T1, exercé après déploiement ; ses retraits/changements sont
  exécutés en T0 sans nouvelle cérémonie et consignés (une ligne). Elle ne remplace pas les checkpoints du validateur en T2.
- **Déploiement** : reste une action sortante sous go par action (ADR-M010) ; T0 peut grouper plusieurs mises à jour en un seul déploiement.

## Conséquences
- Le lot F-site-9a-ii (diagramme), 9b (DA) et 9c (icônes providers) restent **T2** (registres, marques). La page Narabi live sera **T1**.
- `docs/JOURNAL-PROVENANCE.md` accepte des entrées d'une ligne pour T0 (format : date, régime, fichiers, oracle, G2, go, revue investisseur).
- Amendement du validateur-humain : ses checkpoints ne sont **pas** convoqués en T0/T1 (règle inscrite ici, pas dans son fichier — AM-2).
- Alternatives rejetées : (i) supprimer G2 en T0 — rejeté, « générateur ≠ relecteur » est ce qui a attrapé « split-conformal » sur /fleet (M012-e C1) ;
  (ii) tout garder en T2 — rejeté par l'investisseur (coût sans bénéfice sur du texte) ; (iii) régime au jugé sans critère écrit — rejeté (MAST FM-1.1).
- **Exception R-25 datée du 2026-09-24, lot SITE-DOCS-1 (régime T2)** (**annotation datée 2026-09-24 20:59 UTC, G2 fraîche du pli, C-G2B-7 : remplacée par le lot R25-CONTENT-1** ; ses chiffres, 555 et 6 949, sont ceux du gel 2 ; au gel 6, la CI découpée mesure ce lot à CODE 1 012 ≤ 1 205 et CONTENU 6 135 ≤ 8 000 contre `lot/etude-suite`, l'exception n'a plus d'objet) : décidée par l'orchestrateur au pli de la G2 fraîche
  (rapport `F:\tmp\site-docs-1\g2\G2-SITE-DOCS-1.md`, §5). Lot de contenu (22 pages /docs et MONARK Building), relu à 100 % avec
  ré-exécution. Gel 1 `0a632e5` : **6 490 lignes** (`git diff --shortstat 3436304...0a632e5` avec le pathspec de
  `.github/workflows/ci.yml:65` ; borne 1 205 d'ADR-M003 D9). Non découpable sans réécrire les tests livrés
  (`docs_pages_render_a_schema` exige au moins 20 pages ; `docs_pieces_and_navigation_match_the_register`, une page par section
  et un dossier par pièce). Pli des corrections G2 et des remarques de l'investisseur, mesuré à part avec le même pathspec :
  555 lignes (473 suivies, 82 nouvelles) ; lot entier depuis `3436304` : 6 949 lignes. Le commit de gel porte l'étiquette
  `site[T2]` (§ Décision). Le job CI `r25-taille-de-lot` reste fail-closed à 1 205 : cette ligne documente l'exception, elle ne
  relève pas la borne du job.

- **Amendement daté 2026-09-24 19:54 UTC (décision investisseur 209, « ok pour tout »)** : un lot T2 peut sauter le checkpoint-1 du validateur **sur décision expresse et datée de l'investisseur** (ici SITE-DOCS-1 ; **correction datée 2026-09-24 20:59 UTC, C-G2B-7** : les mots « G2 fraîche puis upload » sont la note de régime de l'orchestrateur sous la décision 190, `docs/CHANTIERS.md`, pas un verbatim de l'investisseur ; la décision expresse est la 209 elle-même), jamais par défaut ; l'écart est consigné au JOURNAL avec `error_origin` = la décision qui l'ordonne, et le checkpoint-2 reste dû. Sans décision expresse, le régime T2 garde ses deux checkpoints.
- **Amendement daté 2026-09-24 19:54 UTC (décision investisseur 207)** : la borne R-25 de 1 205 lignes reste celle du **code**. Les **lots de contenu** de la vitrine (pages `apps/site/app/docs/**`, `apps/site/components/docs/**`, `apps/site/lib/docs-*.ts`, `apps/site/data/docs-*.json`, `apps/site/app/roadmap/**`) sont comptés à part, sous une borne de contenu dédiée portée par le workflow (`VIBEGATES_CONTENT_LIMIT`), sourcée ici : 8 000 lignes = la taille mesurée du premier lot de contenu (SITE-DOCS-1, 6 970 lignes au gel 5, dont 6 135 de contenu au sens de cette liste) plus une marge d'environ un septième, fixée par la décision 207 (correction N-1 du lot R25-CONTENT-1 : « arrondie à la dizaine de centaines » donnait 7 000, ce n'est pas la règle) ; toute révision passe par cet ADR (R-23). Mise en œuvre : lot R25-CONTENT-1 (workflow + test 38), relu en G2.

- Note (R25-CONTENT-1, N-3) : la liste de contenu capte aussi `apps/site/app/roadmap/frozen-contracts.ts` et cinq modules `apps/site/lib/docs-*.ts` (logique serveur) ; leurs modifications comptent sous la borne de contenu. Restreindre la liste demande une ligne datée ici.
- **Observation datée 2026-09-24 20:59 UTC (G2 fraîche du pli SITE-DOCS-1, C-G2B-10, non tranchée)** : la liste de contenu de la décision 207 capte `apps/site/lib/docs-vocab.ts` (filtre de vocabulaire et dérogation D14) et `apps/site/lib/docs-references-load.ts` (chargeur fail-closed), qui sont des gardes de gouvernance, pas du contenu ; les modifier se compte sous la borne de contenu et non sous 1 205. Item R25-CONTENT-GUARDS-1 (CHANTIERS) : les rendre au CODE par une ligne datée ici, le workflow et la garde du test 38 suivant l'ADR, par un worker en G2 fraîche, jamais par cette ligne.
