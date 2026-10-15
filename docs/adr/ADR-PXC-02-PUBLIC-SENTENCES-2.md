# ADR-PXC-02 : PUBLIC-SENTENCES-2, bornage des phrases publiques qui dépassent leur témoin, en trois parties, le noyau d'abord

- **Statut** : VALIDÉ par le fondateur avec deux amendements, pliés ici (v10 ; amendement daté ci-dessous ; `5471b92` l.6-14) ; la
  validation tient pour la v10 si le pli ne fait que ces deux amendements, ce que MONARK relit (`5471b92` l.42-43) ;
  avant : PROPOSÉ, **pli n° 1, réparations n° 1 et n° 2** de la version que la G2 a lue (v1, sha256 `f8f06e36…`), pour le cp-1 complet du
  validateur-humain, en une pièce avec le plan de la partie 1 (`PLAN-PXC-02-P1-NOYAU.md`) [D-13 ; METHODE §c.2 [5]]. Aucun code avant,
  dans cet ordre (D-13, A65) : la consultation d'advisor sur D-1, **retirée par MONARK (Q-M4 (b)) le 2026-10-08** (`e37f2a5` l.6-15,
  commit de 13:26:03 UTC, contre la recommandation de PAROXYSME) ; motif : la valeur est réglée par le fondateur (`47ef84d` l.27,
  `d40ab57` l.9-11), la question technique a sa réponse (`e37f2a5` l.9-15), jugée au cp-1 sous CA-11, conforme
  (`coordination/pieces/2026-10-08-cp1-pxc02-p1/CP1-PXC02-P1.md` l.20, l.37 à `0737061`) ; `CONSULTATION-ADVISOR-D1.md` reste comme
  trace ; la réponse de MONARK à Q-M1, rendue : (a), deux lots (`5fc2d0c` l.6-22 ; D-3) ; le cp-1, rendu ACCEPTE-AVEC-CORRECTIONS
  (C-1 à C-8, pliées : « Pli du cp-1 » ci-dessous) ; la validation du fondateur, sur cet ADR seul (Q-M7 (a)) ; l'accord de la
  partie 1 ; la liste des fichiers au TABLEAU. Les cinq questions de valeur sont tranchées (§8) : la première livraison de code
  n'attend plus rien d'autre du fondateur (`8e5bea2` l.19). Les prototypes cités sont une preuve du plan, hors de tout dépôt ; le code de
  chaque lot sera régénéré par `make-gel.mjs` après l'accord, sur la tête du tronc, puis remesuré (RUL l.20-21, A01).
- **Cette passe (pli n° 1)** : le 2026-10-08, `date -u` lu à 06:27:03 (première lecture de la passe), 07:40:27, 07:56:27 et 08:07:24 ;
  worker de PAROXYSME, modèle résolu `claude-opus-5-5`, effort `max` ; mission `tache2-pli/MISSION.md` (sha256 `aa6abdb7…`) et
  complément de MONARK `9b20ad2` l.6-9. Quatre sources de changement : (1) la re-mesure à `5e976a1a` ; (2) O-1, la liste (a) étendue
  (`32cf23d` l.10) ; (3) la G2 de l'ADR, 69 constats (§12) ; (4) la forme (aucune ligne de plus de 160 caractères, tables mises en
  listes). Parties touchées : toutes ; §12 neuf.
- **Réparation n° 1**, en deux temps (vérification A de la réparation n° 1, problème 12). (1) La session plie les 11 problèmes de A par
  `v3/pli-A.py` et `v3/pli-A2.py` (dates des fichiers : 08:40:50 et 08:41:04 UTC). (2) Un worker de PAROXYSME, modèle résolu
  `claude-opus-5-5`, effort `max`, mission `tache2-pli/MISSION-REPARATION-1.md` (sha256 `a552594c…`), le 2026-10-08, `date -u` lu à
  09:05:10, 09:08:27 et 09:29:30, plie le reste des 34 problèmes des trois vérifications adverses du pli (`tache2-pli/verif/` : A, 11 ;
  B, 6, dont B-1, bloquant ; C, 17) ; ses dernières écritures datent de 09:32:19 (ADR) et 09:32:33 UTC (`RELEVE.md`, `PLI-VERIF.md`).
  Parties touchées : en-tête ; « non vérifié » ; §1 ; §2 (lignes C21, C25, C26, M6, E9, T10, I-G2-5 ; la parole du fondateur) ; D-2, D-3,
  D-4, D-7, D-12, D-14, D-16, D-17 ; §4 ; §6 ; §7.2, §7.3, §7.8, §7.9, §7.10 ; §8 ; §9 ; §10 ; §11 ; §12 ; D-13. Relevé : `RELEVE.md` §5
  et `PLI-VERIF.md`.
- **Réparation n° 2** : le 2026-10-08, `date -u` lu à 09:52:44, 10:01:11, 10:23:53, 10:26:12, 10:36:02 et à la fin de la passe (`PLI-VERIF.md`) ;
  worker de PAROXYSME, modèle résolu `claude-opus-5-5`, effort `max` ; mission `tache2-pli/MISSION-REPARATION-2.md` (sha256 `53487a98…`).
  Elle plie (1) les décisions du fondateur sur Q-V1 à Q-V4 et DN-13 (`8e5bea2` l.12-17 ; `2ed67d1` l.8-12, lu par MONARK l.16-22) ; (2) le
  périmètre vrai de Q-V3 et Q-V4 que MONARK confirme (`b03e434` l.6-9) ; (3) la lecture d'ECMA-262 et de V8 par MONARK (`0e66c86`) et la
  mesure de l'écart de `**` (`0eb8942` ; `dbe4915`) ; (4) les constats des deux vérifications neuves de la réparation n° 1
  (`verif/VERIF-REP1-A.json`, 15 problèmes ; `verif/VERIF-REP1-B.json`, 3). Parties touchées : en-tête ; « non vérifié » ; §1 ; §2 ; D-2 à
  D-7, D-11, D-13 à D-15 ; §4 ; §6 ; §7.3, §7.4, §7.8, §7.10 ; §8 ; §9 ; §10 ; §11 ; §12. Relevé : `RELEVE.md` §6 et `PLI-VERIF.md`.
- **Pli final** : le 2026-10-08, `date -u` lu à 11:30:07, 11:34:07, 11:44:22 et à la fin de la passe (`PLI-VERIF.md`) ; worker de
  PAROXYSME, modèle résolu `claude-opus-5-5`, effort `max` ; mission `tache2-pli/MISSION-PLI-FINAL.md` (sha256 `4c196e1d…15a7f383`)
  et les notes de la session de 11:31, 11:33 et 11:35 UTC. Il plie (1) les décisions de MONARK sur Q-M8
  (`226d008` l.6-18), en exécution de la décision du fondateur sur Q-V4 (`226d008` l.13-15), Q-M9 et Q-M10 (`cf0e079` l.6-19), en
  exécution de la phrase de MONARK « le rejeu exact ne se promet nulle part » (`b03e434` l.7) et de sa règle sur le gel du texte de Bell
  (`32cf23d` l.18-19) (`cf0e079` l.18-19 ; vérification courte du pli final, constat 1), sans décision neuve du fondateur ;
  (2) les constats des deux vérifications neuves de la réparation n° 2 (`verif/VERIF-REP2-A.json`, 16 ; `verif/VERIF-REP2-B.json`, 9) ;
  (3) la porte des adresses du tronc (#243) ; (4) la tête du tronc, `d9cb6ef3`. Parties touchées : en-tête ; « non vérifié » ; §2 ; C04,
  C26 ; D-4, D-6, D-7, D-14, D-15 ; §6 ; §7.3, §7.4, §7.8, §7.10 ; §8 ; §9 ; §11 ; §12. Relevé : `RELEVE.md` §7 et `PLI-VERIF.md`.
- **Découpage** : le 2026-10-08, `date -u` lu à 12:11:44, 12:14:00, 12:19:42, 12:26:34, 12:28:23 et à la fin de la passe (`PLI-VERIF.md`) ;
  worker de PAROXYSME, modèle résolu `claude-opus-5-5`, effort `max` ; mission `tache2-pli/MISSION-DECOUPAGE.md` (sha256
  `b4e33591…7a101045`) et la note de la session de 12:28 UTC. Il écrit Q-M1 (a), décidée par MONARK (`5fc2d0c` l.6-22), avec sa condition de
  taille et la coupe (D-3 ; plan, « Découpage en deux lots ») ; il plie les cinq constats mineurs de la vérification courte du pli final
  (`verif/VERIF-FINAL.md`), la tête du tronc, `2c3f51a8`, et l'inscription de NARABI-POW-PORTABLE-1 à ETAT. Parties touchées : en-tête ;
  « non vérifié » (points 3 et 8) ; §1 ; D-3 ; D-13 ; §4 ; §6 ; §7.8 ; §8 ; §9 ; §11 ; §12. Relevé : `RELEVE.md` §8 et `PLI-VERIF.md` §7.
- **Pli de la vérification du découpage** : le 2026-10-08, `date -u` lu à 13:04:56 et 13:06:22 ; la session PAROXYSME elle-même, sans
  worker. Elle plie les constats de la vérification neuve du découpage qui touchent l'ADR (`verif/VERIF-DECOUPAGE.json`, problèmes 4 et 5,
  mineurs ; aucun bloquant sur les huit). Parties touchées : en-tête ; « non vérifié » (point 8) ; §1 ; D-3. Relevé : `RELEVE.md` §9 et
  `PLI-VERIF.md` §8.
- **Pli du cp-1** : le 2026-10-08, `date -u` lu à 13:42:55, 13:44:02, 13:48:36, 13:54:35 et à la fin de la passe (`PLI-VERIF.md` §9) ;
  worker de PAROXYSME, modèle résolu `claude-opus-5-5`, effort `max` ; mission `tache2-pli/MISSION-PLI-CP1.md` (sha256
  `035274e6…b6a27613`). Il plie, ensemble (`e37f2a5` l.24-26), le rapport du cp-1 du validateur-humain, ACCEPTE-AVEC-CORRECTIONS, liste
  fermée C-1 à C-8 (`coordination/pieces/2026-10-08-cp1-pxc02-p1/CP1-PXC02-P1.md` l.16-32 à `0737061` ; la précision de MONARK sur C-6,
  `0737061` l.27-28), les décisions de MONARK sur Q-M2 à Q-M7 (`e37f2a5` l.6-20) et la tête du tronc, `3128869e` (`b45193e`), puis `94733bda`. Parties
  touchées : en-tête (Statut, Éléments affectés, Base mesurée, Dates) ; « non vérifié » (point 8) ; §2 (Sort, C30, C32, C38, X3, Ukemi
  E6, Comptes) ; D-13 ; D-14 ; D-17 ; §4 ; §5 ; §6 (Ukemi E12, MK-L32) ; §7.11 ; §8 ; §9 ; §10 ; §11. Relevé : `RELEVE.md` §10 et
  `PLI-VERIF.md` §9.
- **Pli de la vérification courte du pli du cp-1** : le 2026-10-08, `date -u` lu à 14:17:20 (copies de `v8/` et `v8-run/`), 14:18:30,
  14:20:12 et à la fin de la passe (`PLI-VERIF.md` §10) ; la session PAROXYSME elle-même, sans worker. Elle plie les sept problèmes de la
  vérification courte, par une instance neuve, du diff du pli du cp-1 (`0737061` l.31 ; `verif/VERIF-V8.json` : trois à corriger, quatre
  mineurs, aucun bloquant) : le problème 6 par la lecture du papier MAST (§9, §11 ; `LECTURE-MAST.json`), le problème 7 par un erratum
  au message à MONARK. Parties touchées : en-tête (Dates) ; §6 (MK-L33) ; §7.8 ; §9 ; §10 ; §11. Relevé : `RELEVE.md` §11 et
  `PLI-VERIF.md` §10.
- **Pli de la validation du fondateur (v10)** : le 2026-10-08, `date -u` lu à 16:22:19, 16:28:32, 16:33:29 et à la fin de la passe
  (`PLI-VERIF.md` §12) ; worker de PAROXYSME, modèle résolu `claude-opus-5-5`, effort `max` ; mission `tache2-pli/MISSION-PLI-FONDATEUR.md`
  (sha256 `09772b03…37215f4c`) ; source unique : le message de MONARK `5471b92` (48 lignes), lu en entier. Il plie A-1 et A-2 et ce
  qu'ils rendent faux, rien d'autre (`5471b92` l.42-43). Parties touchées : en-tête (Statut, cet amendement, Dates, Éléments affectés,
  empreintes) ; « non vérifié » (point 10) ; §1 ; D-3 ; D-8 ; D-13 ; §4 ; §6 ; §7 ; §8 ; §10. Relevé : `RELEVE.md` §13 et `PLI-VERIF.md` §12.
- **Second pli de la validation du fondateur (v10)** : le 2026-10-08, `date -u` lu à 17:26:34, 17:32:43, 17:35:33, 17:37:52, 17:41:00 et
  à la fin de la passe (`PLI-VERIF.md` §13) ; worker de PAROXYSME, modèle résolu `claude-opus-5-5`, effort `max` ; mission
  `tache2-pli/MISSION-PLI-V12.md` (sha256 `eaa23ba9…37364fa3`) ; deux sources : la vérification courte du pli par une instance neuve
  (`verif-v11/rendu.json`, sha256 `2ad98159…309520c9`, douze problèmes : P1 et P2 à corriger, P3 à P12 mineurs) et l'effet sur les
  parties de la précision du fondateur (`7560620` l.12-22 ; « A2 » : `amendement-3/v2/EFFET-PARTIES.md`, sha256 `efc6aca9…cf1c82b2`).
  Il ne fait que ces corrections, que MONARK relit contre sa liste (`5471b92` l.42-43) et la précision de `7560620`. P1 et P2 sont des
  décisions de la session PAROXYSME sous sa délégation technique, que MONARK peut renverser (D-8 ; D-13). Parties touchées : en-tête
  (cette puce, Dates, Éléments affectés, empreintes) ; « non vérifié » (point 10) ; §1 ; D-3 ; D-8 ; D-13 ; §4 ; §7.14 ; §10. Relevé :
  `RELEVE.md` §14 et `PLI-VERIF.md` §13.
- **Pli de la vérification de la v12 (v10, troisième pli)** : le 2026-10-08, `date -u` lu à 18:14:28, 18:19:33, 18:20:29, 18:23:45 et à
  la fin de la passe (`PLI-VERIF.md` §14) ; worker de PAROXYSME, modèle résolu `claude-opus-5-5`, effort `max` ; mission
  `tache2-pli/MISSION-PLI-V13.md` (sha256 `d63c3e79…d523e09a`) ; source : la vérification du second pli par une instance neuve
  (`verif-v12/rendu.json`, sha256 `822160fa…ec66fb39`, huit problèmes mineurs, V1 à V8). Il ne fait que ces corrections ; V3 devient
  une question à MONARK, Q-M13 (la pastille `building`), sans décision prise. Parties touchées : en-tête (cette puce, Dates) ; « non
  vérifié » (point 10) ; §1 ; D-3 ; D-8 ; D-13. Relevé : `RELEVE.md` §15 et `PLI-VERIF.md` §14.
- **Pli de la vérification de la v13 (v10, quatrième pli)** : le 2026-10-08, `date -u` lu à 18:53:46, 19:00:07, 19:05:59, 19:08:00 et à
  la fin de la passe (`PLI-VERIF.md` §15) ; worker de PAROXYSME, modèle résolu `claude-opus-5-5`, effort `max` ; mission
  `tache2-pli/MISSION-PLI-V14.md` (sha256 `070603b0…bc0b9a78`) ; source : la vérification du troisième pli par une instance neuve
  (`verif-v13/rendu.json`, sha256 `cf1ac63c…c0cbae04` : W1 et W3 à corriger, W2 mineur). Le test d'usage unique, qui lit le texte des
  sources, laissait passer quatre contournements ; un test du produit servi les ferme (D-8). Parties touchées : en-tête (cette puce,
  Dates) ; « non vérifié » (point 10) ; §1 ; D-3 ; D-8. Relevé : `RELEVE.md` §16 et `PLI-VERIF.md` §15.
- **Pli de la vérification de la v14 (v10, cinquième pli)** : le 2026-10-08, `date -u` lu à 19:48, 20:00 et à la fin de la passe
  (`PLI-VERIF.md` §16) ; worker de PAROXYSME, modèle résolu `claude-opus-5-5`, effort `max` ; mission `tache2-pli/MISSION-PLI-V15.md`
  (sha256 `bd2b8127…9e930c68`) ; sources : la vérification du quatrième pli par une instance neuve (`verif-v14/rendu.json`, sha256
  `80be0280…4fa2f307` : P1 et P3 à corriger, P2, P4 et P5 mineurs, et sa clé `decision_shogen`) ; la décision du fondateur sur le
  périmètre de Shōgen (boîte, `39c0425` l.14-30), la réponse de MONARK à Q-SH-1 (`ae8a0fa` l.6-8) et, reçue pendant la passe, sa
  décision sur Q-V15-1 (`cc02038` l.10-16). L'aide du test servi rend la prop
  `render` des parties du dialogue (P1) ; le compte retire les balises vides et les caractères invisibles (P2) ; ce que le test ne voit
  pas devient deux items, chiffrés sur le prototype (P3, P5) ; les ancres de Shōgen passent côté MONARK. Parties touchées : en-tête
  (cette puce, Dates) ; « non vérifié » (point 10) ; §1 ; §2 (C02, C07) ; D-3 ; D-8 ; §6. Relevé : `RELEVE.md` §17 et `PLI-VERIF.md` §16.
- **Pli de la vérification de la v15 (v10, sixième pli) et des réponses reçues le 2026-10-13 et le 2026-10-14** : le 2026-10-14,
  `date -u` lu à 14:57, 15:13 et à la fin de la passe (`PLI-VERIF.md` §17) ; worker de PAROXYSME, modèle résolu `claude-opus-5-5`,
  effort `high` (le fondateur, le 2026-10-13, relayé par MONARK : `c2c9410` l.9-10) ; mission `tache2-pli/MISSION-PLI-V16B.md` (sha256
  `659c49bd…e752f183`) ; sources : la vérification du cinquième pli par une instance neuve (`verif-v15/rendu.json`, sha256
  `e83625d8…ceea3ac4` : V15-P1 et V15-P2 à corriger, V15-P3 à V15-P7 mineurs) ; les réponses du fondateur aux questions de
  l'amendement n° 3 et celles de MONARK à Q-M11 et Q-M12 (boîte, `5ce6f27` l.110-153) ; ses réponses du 2026-10-13 (`c2c9410`
  l.20-30). L'aide du test servi garde les parties de Base UI qui rendent côté serveur (V15-P1) ; le compte retire les commentaires et
  les caractères ignorables par défaut, et lit les attributs `value` et `placeholder` (V15-P2 à V15-P4) ; ROUTES-1 tait la console
  (V15-P7) ; PX-Shogen-1 reste au titre de L-01 (V15-P5) ; le README dit que le quorum compte l'opérateur à clé (Q-F4 (a)) ; la marque
  `upcoming` de la relation de Bell attend le jugement d'usage (Q-F1 (a)). Parties touchées : en-tête (cette puce, Dates) ; « non
  vérifié » (point 10) ; §1 ; §2 (C02, C04, C11, C17, C26, C35) ; D-3 ; D-6 ; D-8 ; D-10 ; §6 ; §7.14 ; §8 ; §10. Relevé :
  `RELEVE.md` §18 et `PLI-VERIF.md` §17.
- **Pli des citations du sixième pli, puis septième pli (v10) : les trois vérifications du sixième** : le pli des citations, le 2026-10-14 entre 15:48 et
  16:06 UTC (worker de PAROXYSME, `claude-opus-5-5`, effort `high` ; mission `tache2-pli/MISSION-PLI-CITES-V16.md`, sha256 `0fdabe83…bb7ae4c6` ; rendu
  `v16-cites/rendu.json`, sha256 `b6a945e2…95cad4db`), adosse à un renvoi ou retire les 22 mentions de copie à l'identique que l'outil de l'atelier refusait
  (erratum P-35), sans changer un sens. Le septième pli : le 2026-10-14, `date -u` lu à 16:42, 16:44, 16:53 et à la fin de la passe (`PLI-VERIF.md` §18) ;
  worker de PAROXYSME, modèle résolu `claude-opus-5-5`, effort `high` (le fondateur, le 2026-10-13, redit le 2026-10-14) ; mission
  `tache2-pli/MISSION-PLI-V17.md` (sha256 `3f83b122…fb2831d3`) ; sources : les trois vérifications du sixième pli par des instances neuves,
  `verif-v16/constructions/rendu.json` (sha256 `1e8afae4…77cb5e37` : C16-P1 à C16-P5 à corriger, C16-P6 et C16-P7 mineurs), `verif-v16/decisions/rendu.json`
  (`bda1ddc9…6ab1f3e5` : D-1 à D-3 à corriger, D-4 à D-8 mineurs) et `verif-v16/comptes/rendu.json` (`45a1613e…113d7c79` : V16C-P1 à V16C-P4 à corriger,
  V16C-P5 à V16C-P8 mineurs). Le test servi passe la page par le balayeur du dépôt, `stripHiddenSurfaces`, et ne retire plus que les balises vides `span`,
  `b`, `i`, `em`, `strong` et `wbr` (C16-P1, C16-P2) ; l'aide lit les deux guillemets et refuse tout import de `@base-ui/` qu'elle ne bouchonne pas (C16-P3)
  ; la borne nomme les props que Base UI calcule depuis l'état d'un `Trigger` (C16-P4) ; ROUTES-1 compte aussi `process.stdout` et `process.stderr` (C16-P5)
  ; T14 et T18 sortent de L1 par défaut, chacune avec sa question fermée à MONARK (Q-M14, Q-M15 ; D-1, D-3) ; aucune phrase ne revendique plus `upcoming`
  pour Bell (D-2). Parties touchées : en-tête (cette puce, Dates) ; « non vérifié » (point 10) ; §1 ; §2 (C11, C17, C26) ; D-3 ; D-6 ; D-8 ; §5 ; §6 ; §7
  (ligne 4 d'ETAT, §7.14) ; §8 ; §10. Relevé : `RELEVE.md` §19 et `PLI-VERIF.md` §18.
- **Amendement daté v10** (2026-10-08) : l'ADR v9 (`4f45d750…fdd66ddc`) et le plan v10 (`e784c81a…9bc2a449`) sont validés par le
  fondateur, en session de MONARK vers 16:1x UTC, avec deux amendements de valeur (`5471b92` l.6-8, l.14). Sa réponse, mot pour mot :
  « ok, mais pour shogen mettez BUILDINBG, en cours, ne mettez pas a venir. mais j insiste sur le fait qu'avant la fin du chantier
  paroxisme, ces manquement doivent étre faits, c est a dire builder ces manquament. pas remettre des phrases honnétes et laisser des trous
  dans le code, on ne build pas l honneteté, on build un produit » (`5471b92` l.10-12).
  A-1 et A-2, tels que MONARK les tire, mot pour mot (`5471b92` l.16-38) :

  > **A-1. Shōgen : « building », pas « upcoming ».** Cela renverse D-8 (« *Rejetée* : une troisième valeur de statut »).
  > - `lib/status.ts` et `components/panel-shell.tsx` reçoivent une troisième valeur, `building`. Le bloc `How it works` de Shōgen la prend
  >   (T13, L2, `shogen_how_it_works_is_upcoming_while_the_join_is_dormant`, à renommer).
  > - Les lignes de L1 sur Shōgen sont à relire contre ce choix : `readme_shogen_row_and_diagram_say_the_join_is_dormant`, README l.33 et
  >   l.205-206. « Dormant » ne va plus si la jointure est en construction.
  > - **« building » doit être vrai.** Il n est permis que si un item de construction existe, avec son chantier, sa place dans ta feuille
  >   de route et son prix (A-2). Un test lie le statut à cet item : il rougit si l item disparaît ou se ferme sans que le statut passe à
  >   `built`.
  > - Shōgen est sous l exception datée du registre public (ADR-0028 Shōgen §4.11, SHOGEN-VITRINE-MONARK-1) : aucune revendication neuve
  >   pendant l exception. Le texte du bloc dit « en construction », sans aucune capacité de plus.
  > - Les autres marques `upcoming` du chantier (dont la relation de Bell, T14) ne changent pas : le fondateur n a nommé que Shōgen.
  >   Liste-moi celles qui seraient « building » au même titre, avec leur item, et je les lui pose en une question.
  >
  > **A-2. Chaque manque se construit avant la fin du chantier PAROXYSME.** C est la règle PAROXYSME appliquée sans reste.
  > - Une phrase bornée par PXC-02 n est plus une fin. Le texte honnête reste l état intérimaire : il protège le public pendant la
  >   construction, et l épingle de chaque test, qui rougit quand le code rend l ancienne promesse vraie, devient le signal de fin.
  > - Pour chaque phrase bornée, des trois parties : le manque qu elle révèle, la construction qui rend la promesse d origine vraie, son
  >   item, son prix et sa place dans ta feuille de route, avant sa fin.
  > - Pareil pour chaque entrée du §6, « Limites que le chantier laisse ».
  > - Une phrase dont la promesse d origine ne doit pas être construite (fausse par nature, ou que le fondateur ne veut pas) est une
  >   question au fondateur, une par phrase, jamais un silence.
  > - Forme : l **amendement n° 3 de ton plan de route**, avec la table phrase, manque, construction, item, prix, place. Je le présente au
  >   fondateur en langage simple.

  Où ils s'appliquent : A-1, D-8 (récrite), D-13, §7.14, §10 et le plan (T13, T24, fichiers, R-25, préalables) ; A-2, §6, §7 et §8 ;
  leurs comptes, §1, D-3 et §4. La validation tient pour la v10 si le pli ne fait que ces deux amendements (`5471b92` l.42-43) ;
  l'accord de la partie 1 est tenu pour donné par ce « ok » sur la v10, dans ces limites (`5471b92` l.48).
- **Dates** : v1 rédigée le 2026-10-07 entre 20:26 et 21:3x UTC ; pli n° 1 le 2026-10-08 entre 06:27 et 08:1x UTC ; réparation n° 1 le
  2026-10-08 entre 08:40 et 09:32:33 UTC ; réparation n° 2 le 2026-10-08 entre 09:52 et 10:50 UTC (dates des fichiers de `v4/`) ; pli
  final le 2026-10-08 entre 11:30 et la fin de sa passe ; découpage le 2026-10-08 entre 12:11 et la fin de la passe ; pli de sa
  vérification le 2026-10-08 à partir de 13:04 UTC ; pli du cp-1 le 2026-10-08 à partir de 13:42 UTC ; pli de sa vérification courte le
  2026-10-08 à partir de 14:17 UTC ; pli de la validation du fondateur le 2026-10-08 à partir de 16:22 UTC, son second pli à partir de
  17:26 UTC, le pli de la vérification de la v12 à partir de 18:14 UTC, celui de la vérification de la v13 à partir de 18:53 UTC,
  celui de la vérification de la v14 à partir de 19:48 UTC, celui de la vérification de la v15 et des réponses du 2026-10-13 et du
  2026-10-14 le 2026-10-14 à partir de 14:57 UTC, son pli des citations entre 15:48 et 16:06 UTC, le septième pli à partir de
  16:42 UTC ; décision : validée par le fondateur le 2026-10-08 vers 16:1x UTC, avec deux amendements (`5471b92` l.6-14) ;
  approbation : néant ; dernière modification : le septième pli.
- **Propriétaire de la décision** : le fondateur, qui valide l'ADR une fois (décision 300, METHODE l.182-190) ; décisions techniques sous
  délégation : PAROXYSME (D-1 à D-17), MONARK pour celles marquées [MONARK] ; décisions de valeur : le fondateur (§8).
- **Gates concernés** : cp-1 (CA-1 à CA-5, CA-7, CA-11) ; à chaque fusion, l'oracle G7 de MONARK ; la G2 de chaque partie par une instance
  neuve, ses lots relus ensemble, une G2 de plus si MONARK la demande (METHODE l.218-219) ; cp-2 (CA-6 à CA-13) ; verdict G7 de chaque partie.
- **Éléments affectés (partie 1)** : 41 fichiers, liste fermée au plan : `README.md` ; 30 fichiers de `apps/site` (22 au pli ; six de plus à
  la réparation n° 2 : `app/applications/page.tsx`, `app/docs/page.tsx`, `app/docs/verify/page.tsx`, `app/layout.tsx`,
  `app/roadmap/page.tsx`, `components/site-header.tsx` ; deux de plus au pli de la validation du fondateur, A-1 : `lib/status.ts`,
  `components/panel-shell.tsx` ; `app/globals.css`, troisième à ce pli, en sort au second, P4) ; `skills/monark/SKILL.md`,
  `DEMO.md`, `INTEGRATION.md` ; `apps/sentinel/README.md` ; `docs/adr/ADR-M012-narabi-live-sentinel.md` (amendement daté, A28) ; tests
  `test/{site-build-fleet,narabi-live,site-docs,ci-gates}.test.ts` et `test/readme-public-sentences.test.ts` (neuf). Parties 2 et 3 au §4 ;
  registres `docs/PAROXYSME-<pièce>.md` (acte au §10, A47) ; lignes d'ETAT proposées à MONARK (§7). Aucun octet servi du harnais.
  Sous C-6 du cp-1, `test/test-counts.json` (registre du tronc depuis #250) s'y ajoute, régénéré, si `scripts/test-count-check.mjs` est
  au tronc à la naissance d'un lot, le cas attendu (`0737061` l.27-28 ; plan, préalable 3).
- **Base mesurée** : code à T = `5e976a1a` (MISSION l.11-12). Le tronc a avancé pendant la passe : `origin/lot/etude-suite` est à `565c7065`
  (reflog du clone, fetch de 07:27:00 UTC) et `git diff --name-only 5e976a1a 565c7065` ne liste que huit fichiers sous `docs/` (ETAT,
  JOURNAL-PROVENANCE, six registres) : le code est le même. Depuis T0 = `885554e5` (base de la v1), `git diff -U0 885554e5 5e976a1a --
  apps README.md test scripts/export-public.mjs .github/workflows/ci.yml skills packages schemas` donne 39 blocs de même taille, et des
  blocs qui décalent seulement après `ci.yml` l.269 et dans neuf fichiers de test que ces documents ne citent pas : chaque numéro de
  ligne de code de la v1 tient à T. Quatre fichiers du noyau ont changé
  de contenu, par #244 (fusion `e13cfff7`, ses lignes « own host » : C25). ETAT lu à `565c7065` (E) ; registres à `b7c2ba40` (REG, tête de
  #245, fusionnée par `1ae166c6` : `d5553e7` l.8 ; `git diff --stat b7c2ba40 565c7065 -- docs/PAROXYSME-*.md` est vide, A02) ; boîte à
  `87bc219`. Au pli final, `lot/etude-suite` est à `d9cb6ef3` (fusions #249 à `c5030fd9`, #243 à `d9cb6ef3`, 11:01:32 UTC par
  `TZ=UTC git log --date=iso-local`) ; aucun des 39 fichiers n'a changé depuis T : `git diff --name-only 5e976a1a d9cb6ef3 --
  ':!apps/site/data'` liste 74 fichiers, dont aucun des 39 (croisés avec `gel-fingerprints.txt`, plan, annexe B) ; `ci.yml` n'y change
  qu'aux l.275-276 et l.293-300 (le job de l'outil de vérification) : ses bornes R-25 (l.56-57) et ses l.100 et l.104 sont celles de T.
  Au découpage, `lot/etude-suite` est à `2c3f51a8` (commit d'ETAT de MONARK, 12:14:36 UTC, après `2d37851b`, #253, 12:00:07 UTC ;
  `TZ=UTC git log -1 --date=iso-local`) ; `git diff --name-only 5e976a1a 2c3f51a8 -- ':!apps/site/data'` liste 76 fichiers, dont aucun
  des 39 ; de `d9cb6ef3` à `2c3f51a8` ne changent que dix fichiers, tous sous `docs/` (`ci.yml` non compris).
  Au pli du cp-1, `lot/etude-suite` est à `3128869e`, la fusion de #250 (TEST-COUNT-FLOOR-1 PR-1 ; 12:39:24 UTC par `TZ=UTC git log -1
  --date=iso-local` ; `b45193e` l.11-12). `git diff --name-only 2c3f51a8 3128869e -- ':!apps/site/data'` liste 13 fichiers, dont un des
  39 : `test/ci-gates.test.ts` (CIG), quatre lignes remplacées en place, l.1851, l.1856 et l.1884-1885 (`git diff -U0 3e194d2e 3128869e
  -- test/ci-gates.test.ts`) ; les blocs du plan dans CIG sont aux l.52-53 et l.570-588 de la base (`diff -U0` de la base au gel) : aucun
  recouvrement, aucun décalage ; `ci.yml` ne change pas. La chaîne rejouée (`b45193e` l.15-21) : copie `scratchpad/head-3128869e/`, dont
  la base porte le CIG de `3128869e` (`90d7f859…7970578c`, 2155 l.), les 38 autres fichiers égaux à `3128869e` (`git show 3128869e:<f> |
  cmp`), le 39ᵉ étant le test neuf ; `bash run2/run-all.sh` à 13:28 UTC, mêmes codes de sortie (`run-exits.txt` `bfd39cb2…2bcbb70b`,
  égal). Des 27 sorties qu'elle réécrit, 24 sont égales à l'octet à celles de `v7-run/run2` (`sha256sum`), dont `out-killers.txt`
  (`342cd2bd…34e939b0`), `out-mutants-noyau.txt` (`655ad5ee…3cc0d6a6`) et `r25.tsv` (`8068a3bd…42c7a8e3`, CIG : code 7 + 4) ; les deux
  TAP brutes diffèrent, égales une fois normalisées (`5177b838…a87cdc02`, `9984afcb…e9116283`, plan, annexe B) ; `gel-fingerprints.txt`
  ne diffère que par la ligne de CIG (`6631671e…bf529040` à T, `5c43b62b…fd09a831` sur `3128869e`). Les sorties des lots L1 et L2 et
  `out-judged.txt` ne sont pas réécrites par `run-all.sh` : le préalable 3 les rejoue sur la tête (plan, point 5 de « non vérifié »).
  La tête suivante, `94733bda` (fusion de #254, 13:46:28 UTC ; note de la session de 13:58 UTC), ne change aucun des 39 :
  `git diff --name-only 3128869e 94733bda` ne liste que cinq registres, `docs/PAROXYSME-{Bell,Harnais,Narabi,Shogen,Ukemi}.md`.
  Empreintes des 39 fichiers à T (`git show 5e976a1a:<f> | sha256sum`, `wc -l`) :
  - `README.md` : `6324c8b220ccb5378d5458ca883190b7241b0d3cdbc1e42d9f1697051e58b5ad`, 353 l.
  - `apps/sentinel/README.md` : `4dea6a1b66817dba6ae836b8bc47352105502e92ec5acd8be4e56c4ef5332664`, 51 l.
  - `apps/site/app/applications/built-application-card.tsx` : `067be94701a52e2f90228e66e14336d7a8b9a2ab344c83efc273241cfc691604`, 92 l.
  - `apps/site/app/applications/page.tsx` : `7a26ce8786987879800d884143eedf4b6ef06cd538ab44c0e4ae8608019bfed4`, 122 l. (réparation n° 2)
  - `apps/site/app/bell/method/page.tsx` : `0e0ed9488d28084f672f398ac30ddfb264a02028816050b5b49e19814589b2d0`, 613 l. (#244)
  - `apps/site/app/docs/bell/page.tsx` : `b1664cd124dd63a6974c722aed008dde62dd8a2a82e751546630904b4b5b20bf`, 265 l. (#244)
  - `apps/site/app/docs/narabi/page.tsx` : `10c07c0ffd492a7fd92ea0637316286acacb410d4505119ee327c06b32428795`, 164 l.
  - `apps/site/app/docs/page.tsx` : `92727d858aee4cd09d2451519f43d9dc6ef7bb57c576f80e86c8cfc07073e696`, 168 l. (réparation n° 2)
  - `apps/site/app/docs/research/page.tsx` : `881847b8502d623b0b2777a15d442e48c3b5ae403df3f92bfed8f48aafcc43b6`, 285 l.
  - `apps/site/app/docs/verify/page.tsx` : `906c714a2e31aa024cbf3110157169a182c4e153bcabf3fb752dcad7b8a34565`, 189 l. (réparation n° 2)
  - `apps/site/app/how/page.tsx` : `a78e7bd5be1d5360beee608ff062893b6172749b646db74233449a297f1b03e6`, 313 l.
  - `apps/site/app/layout.tsx` : `b77b68d80717b18174a742aba8f85b83c6ca2d5eb4eb6f903ae6ed19fecef55a`, 78 l. (réparation n° 2)
  - `apps/site/app/narabi/page.tsx` : `11e19f394d3301cab60b566c80998919d7efd5d901270a89cf060347d26fb0d3`, 54 l.
  - `apps/site/app/page.tsx` : `8c3b5e963fbeadf14bbae74633073e9886e4f02cbcdaaba0cb5354037a4b83aa`, 325 l.
  - `apps/site/app/roadmap/page.tsx` : `944051d647580d5fdb56bcbb8f2198da32a18776c981634e644f8ac2c018c651`, 363 l. (réparation n° 2)
  - `apps/site/components/docs/piece-doc-page.tsx` : `65fc7bc5c01a80469c593a20a524a6856fda8c4e41274a9d43d1ece785d63dd1`, 280 l.
  - `apps/site/components/docs/schemas/narabi.tsx` : `aa9728e5918ef2d80a8270875c5587ecbee9ce0e72f3464ccc5baa3a2866d313`, 115 l.
  - `apps/site/components/docs/schemas/overview.tsx` : `249233da8a3126dfb28d50cf32bfbc48d55d0ac9b59a2bca84d855787f5129b0`, 289 l.
  - `apps/site/components/gate-sim/board.tsx` : `3134959416beafdf2536d664d05c654c4780e1a3dcc81614071c8f9f02badd3e`, 446 l.
  - `apps/site/components/hikae-panel.tsx` : `bb86a788302b9acc771f4f52ebfe1ea48e30ebc38e608310ce0ff2df368d56e2`, 107 l.
  - `apps/site/components/narabi-panel.tsx` : `f1d66db50cd17206e412a85697ace56aceefe66787d8ad7b809ea2e2765cd129`, 111 l.
  - `apps/site/components/narabi/narabi-live.tsx` : `fc3fb41976da20f9a3e6d9d0a227ccb65fb0e22a364b084a058a662fc1660410`, 559 l.
  - `apps/site/components/shogen-panel.tsx` : `47c33c7a99b2ecb341fac62c69c1659e7d308fbb416377728f15c09afc477113`, 102 l.
  - `apps/site/components/site-header.tsx` : `e31e31ef3023c444dd1bb4cb6575155e99b37cd7ff00d7307520d070754afa48`, 92 l. (réparation n° 2)
  - `apps/site/lib/docs-nav.ts` : `6df373114f431c745b4b5e0adbe33b95d0fbe0da48f1d52461e44390b02f2084`, 47 l.
  - `apps/site/lib/docs-pieces.ts` : `7023e2c3cd4f6217b3180e14a61c68940f84e7d3e1fec1675a37b599dca3cf95`, 244 l.
  - `apps/site/lib/fleet-presentation.ts` : `103474b877100c8aa0cae527deb23fabb4bc78cfac69c9a435fbcc2f11014fd1`, 160 l. (#244)
  - `apps/site/lib/fleet.ts` : `0621e8e73c38d1cb7d92d52d1f9076b59d1d957afad094d9c024ce3bd697e912`, 429 l. (#244)
  - `apps/site/lib/narabi-copy.ts` : `981c7bc7f0db99f80861de9b19a432a08b6170478b5d329b53715602ee916aa6`, 101 l.
  - `apps/site/lib/narabi-live.ts` : `e794a94736367b159a1c0548d84575f3eabe03f575a88b272ec310adceef6cfd`, 970 l.
  - `docs/adr/ADR-M012-narabi-live-sentinel.md` : `d8badd90eb06eaf2c988d473e43745c0490d783426cc6ad322403fd7e3e5511a`, 281 l.
  - `skills/monark/DEMO.md` : `3ff6ea4abacd657909da689ecad2a68a9b2e84116561bda7e8b63b9f94e28836`, 104 l.
  - `skills/monark/INTEGRATION.md` : `9b0a1afe4df6064819082111e8dc0a787e617e72f34dd9a2de6fe65c289cbd6f`, 56 l.
  - `skills/monark/SKILL.md` : `63f52be6a3a6243bab45409fc19d05d88afbed1dfe9236c182501f811e057c8c`, 79 l.
  - `test/ci-gates.test.ts` : `e00fa1ad23fc7371155ca3a513339e21648aef7cbc060f4449147f7c1db4c376`, 2155 l.
  - `test/narabi-live.test.ts` : `dd93f970ce059e6d0a99008b211e07566cb8158138905307820c1d19b676d184`, 1193 l.
  - `test/readme-public-sentences.test.ts` : absent à T (neuf).
  - `test/site-build-fleet.test.ts` : `d6a513c8c3bc1af97cef24c275e765c09e5deb886447ee5919c42c9c7643ede3`, 1509 l.
  - `test/site-docs.test.ts` : `f41b47c6ec322e02b1da4ff1d70f091b4b4e19d06592039467f3968103162525`, 831 l.
  - A-1 (v10), deux de plus, égaux de T à `b44c3890` (`git diff --name-only 5e976a1a b44c3890 -- <les deux>` vide ; `app/globals.css`,
    `35c058e1…7a2766f8`, 548 l., lu, n'est plus touché depuis le second pli, P4) :
  - `apps/site/components/panel-shell.tsx` : `3e2f164da76709a36ccd32155f0d4abacf7371dd76d71426c37c4416bcd4af16`, 27 l.
  - `apps/site/lib/status.ts` : `ea98997251f74be297a9c1756c4d8e045863a719abdc5dfaddd66ba9e68d7efc`, 6 l.
- **Provenance** : v1 et pli par des workers de PAROXYSME, `claude-opus-5-5`, effort `max`, contexte frais ; décisions de la v1 DEC-PX
  (sha256 `afe79339…`) et RUL (sha256 `22b41500…`, pliées ici : A06) ; journal de la G2 (§12) ; prototypes et sorties sous
  `tache2-pli/travail/` (pli), `tache2-pli/v3-run/` (réparation n° 1) et `tache2-pli/v4-run/` (réparation n° 2 ; empreintes au plan, annexe
  B). Réviseurs : PAROXYSME (R-21) ; trois vérifications adverses neuves du pli (`9b20ad2` l.6-9 ; A, B, C), deux de la réparation n° 1
  (A, textes ; B, plan et chaîne) ;
  le validateur-humain au cp-1. Aucun commit, aucun push, aucun réseau ; git en lecture seule ; **aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun
  `--write-tree`**. Copie de travail : `git archive 5e976a1a | tar -x`, dont j'ai retiré avant tout outil, jamais lus : `apps/site/data/`,
  tous les répertoires `fixtures/`, `apps/harness/data/`, les `*.jsonl` et un `*.tsv` (149 fichiers sur 2 458, `comm` des deux listes).
- **Abréviations** : T, T0, E, REG comme ci-dessus ; DEC-PX, RUL, REL (relevé de la v1, sha256 `44d96711…`) ; dans la boîte : PLAN (plan de route
  v3, sha256 `96b5b018…`), CC (`CHANTIERS-CANDIDATS.md`, sha256 `86ed73a2…`), CP1 (`cp1-validateur/CP1-VALIDATEUR-PLAN-DE-ROUTE-2026-10-07.md`),
  INV-B, INV-H, INV-U, INV-N, INV-M, INV-D (inventaires Bell, Harness, Ukemi, Narabi, Moteur, Dōjō de `dossier/etude-2026-10-06/inventaire/`),
  REL-B, REL-U, REL-N (relevés de la pièce `coordination/pieces/2026-10-08-pieces-inachevees/`), METHODE (`METHODE.md`), CL (copie des règles
  de l'investisseur, `coordination/pieces/2026-10-07-sources-cadrage/CLAUDE-global-investisseur.md`), DOC06 (`methode/corpus/06-framework-agents.md`) ;
  messages de la boîte par commit : MSG = `d6331f6`, MSG3 = `0c8fb24`, MSG4 = `5fec732`, et `32cf23d`, `63eef32`, `d40ab57`, `47ef84d`,
  `4f8e42f`, `d5553e7`, `9b20ad2`, `88430bd`, `ba3dab6` ; DP = `apps/site/lib/docs-pieces.ts` ; SBF, NLT, CIG, SDT, PSH = `test/{site-build-fleet,narabi-live,
  ci-gates,site-docs,public-surfaces-honesty}.test.ts` ; RDM = `test/readme-public-sentences.test.ts`. « La D-5 de Bell » est le gel de Bell
  du PLAN (l.511), à ne pas confondre avec la décision D-5 de cet ADR (A11).

### Ce que je n'ai pas vérifié (en tête)

1. **Aucun fichier de test du dépôt n'a tourné tel quel**, ni `typecheck`, `lint`, `next build`, l'oracle, `red-proof.mjs` ou `mutants/run.mjs` :
   la copie n'a pas de `node_modules` et le réseau est fermé ; SBF, SDT et CIG importent `typescript`. Ce qui a tourné, sous Node 24.21.0 : les
   32 tests neufs et les deux tests modifiés (CIG ; SBF, `site_names_no_kitchen`, avec un bouchon pour le seul fichier de données qu'il lit),
   extraits à l'octet des fichiers de test du gel et exécutés contre la base puis contre le gel ; la
   fonction `killerProblem` du dépôt sur chaque tueur ; les vraies portes `scripts/grep-forbidden.mjs` et `scripts/lang-gate.mjs` sur la base
   et sur le gel ; une réplique des assertions existantes que le noyau touche ; une réplique de `judgedOf` de `red-proof.mjs` (« total
   judged 34 ») (plan, annexe B). La CI de la base est supposée verte.
2. **`apps/site/test/honesty-lint.ts`** (lecture par arbre syntaxique, il importe `typescript`) n'a pas tourné ; ma réplique ligne à ligne
   signale le `60` de `piece-doc-page.tsx` (gel l.99), une division dans un appel : son en-tête dit qu'un appel ne rend aucun littéral
   (`apps/site/test/honesty-lint.ts:117-118` à `5e976a1a`), et la même forme existe à T (`apps/site/lib/narabi-live.ts:590`). La CI le dira.
3. **ECMA-262 et V8** (`**`, `Math.pow`) : lus par MONARK, non par moi ([2nd] ici) ; ses faits datés sont au tronc :
   `docs/FAITS-pow-ecma-v8-2026-10-08.md` à `2c3f51a8` (43 lignes ; [lu] le 2026-10-08 de 09:56 à 10:04 UTC, l.3 ; `0e66c86` l.6-17) ;
   l'écart de `**` entre Linux et Windows sous le même Node est mesuré par MONARK et la session (`0eb8942` l.20-21 ; `dbe4915` l.10-14),
   non par moi. Q-V3 est tranchée (c) : aucune surface ne promet le rejeu (D-7 ; plan, T16).
4. Les octets servis, le site servi, le miroir `KraidleAI/Monark` et la skill publiée ne sont pas lus ; les sources hors dépôt (0006, C §13,
   texte X du Dōjō, dépôt `recherches`) non plus.
5. Hors du noyau, chaque ligne citée au §2 est relue à T (contenu présent) ; la falsité qu'en dit le registre n'y est pas re-démontrée.
6. Les prix sont ceux de l'étude, des inventaires et des relevés (« Estimations, jamais des faits », INV-B l.50) ; ceux que j'ajoute sont
   marqués « estimé ». Aucun n'est mesuré.
7. Le tri des 28 constats sans verdict (§12) est le mien, sans vote (`9b20ad2` l.6-9) : la vérification adverse du pli le juge.
8. La réparation n° 1 a été relue par deux vérifications adverses neuves (`verif/VERIF-REP1-A.json`, `verif/VERIF-REP1-B.json`), pliées par
   la réparation n° 2 ; la réparation n° 2 aussi (`verif/VERIF-REP2-A.json`, `verif/VERIF-REP2-B.json`), pliées par le pli final ; le pli
   final, par une vérification courte (`verif/VERIF-FINAL.md`, cinq constats mineurs), pliée par le découpage ; le découpage, par une
   vérification neuve (`verif/VERIF-DECOUPAGE.json`, huit constats, aucun bloquant), pliée par la session ; ce pli, par une vérification
   courte neuve (`verif/VERIF-V7.json`, cinq problèmes, aucun bloquant), pliée par la session ; ce second pli n'est pas relu. Ses preuves
   mécaniques sont la chaîne rejouée, celle de chaque lot comprise (plan, annexe B) et `cites-prep.mjs` ; ses choix et leurs raisons sont
   dans `PLI-VERIF.md`. Le paquet est jugé au cp-1 par le validateur-humain (ACCEPTE-AVEC-CORRECTIONS, C-1 à C-8) ; le pli du cp-1
   n'est pas relu : une vérification courte du diff du pli par une instance neuve suit, puis MONARK relit le diff (`0737061` l.31).
9. Les inventaires du rejeu (T16) et du positionnement (T25) viennent de recherches par motif et d'une lecture (plan, annexe B) ; une
   phrase d'un fichier sous `apps/site/data/`, jamais lu, leur échapperait.
10. **Pli de la validation du fondateur, son second pli, son troisième, son quatrième et son cinquième** : le code de A-1 n'a tourné
    qu'en partie, sur un prototype (`v15-run/tmp/a1/`, copies du gel de la v9) : le compte R-25 (plan, R-25) ; les portes `lang-gate` et
    `gate:vocab` du dépôt, vertes ; les trois tests SBF de A-1, extraits à l'octet (`run-v13/mini3.mts`), verts au gel quand l'entrée
    N-14 nomme l'item ouvert ; à l'item clos ou absent, le test neuf de l'item seul rouge ; à la base, les trois rouges ; à chaque
    tueur, les tests qu'il vise (second pli, P6) ; au contournement de la vérification de la v12, un ré-export sous un autre nom, le
    test d'usage unique seul rouge (V1). Le test servi (quatrième pli ; `run-v14/`, aide et test extraits à l'octet en `mini4.mts`) :
    vert au gel ; rouge à la base, à son tueur et aux cinq contournements des vérifications de la v12 et de la v13 (W1 à W3), chacun par
    assertion. Au cinquième pli (`v15-run/tmp/v15/`, `mini5.mts` extrait à l'octet, seize arbres) : vert au gel ; rouge à la base, à son
    tueur, au tueur du bloc, à ces cinq contournements et à six de plus (prop `render` en fonction, en fonction qui rend
    `BuildingPanelBlock`, en élément qui porte son texte ; mot coupé par `<wbr/>`, par U+00AD, par U+200B), chacun par l'assertion du
    compte. Au sixième pli (`v16-run/tmp/v16/`, `mini6.mts` extrait à l'octet, vingt-cinq arbres) : vert au gel et à l'import élargi ;
    rouge à la base, à son tueur, au tueur du bloc, aux onze contournements d'avant et aux huit de la v16 (`ev-render4`, `ev-portal`, `ev-rootfn`,
    `ev-wj`, `ev-feff`, `ev-input`, `ev-comment`, `ev-adj`), chacun par l'assertion du compte ; `ev-popupfn`, une fonction `render` de
    `Popup` qui lit le `role` que Base UI calcule, reste vert : c'est la borne dite au D-8. Au septième pli (`v17-run/tmp/v17/`, `mini7.mts` extrait à
    l'octet) : les vingt-cinq verdicts d'avant inchangés (`cmp` égal), et onze arbres de la vérification du sixième : `a-style`, `a-script`, `a-abrupt`,
    `a-fab`, `a-fab2`, `a-sq`, `a-dq`, `a-pkg`, `a-viewport` rouges ; `a-trigexp` et `a-trigopen` verts, la borne dite au D-8 (C16-P4). Ni
    `typecheck`, ni `next build`, ni le test RDM, ni celui de T24, ni red-proof, ni la campagne de mutants n'ont tourné (seuls les
    quatre mutants du test d'usage unique, au mini-run du troisième pli) ; la chaîne n'est pas rejouée et
    les annexes A et C du plan restent celles du gel de la v9 (T13 et T24 y sont à l'ancien texte). L'amendement n° 3 de la feuille de
    route, écrit en parallèle, n'est pas lu, hors de A2 (son effet sur les parties) : les renvois le nomment sans recopier sa table ni ses
    prix. Ce pli est relu par une vérification courte d'une instance neuve (`verif-v11/rendu.json`), pliée au second pli ; le second
    pli l'est aussi (`verif-v12/rendu.json`), plié au troisième, le troisième (`verif-v13/rendu.json`), plié au quatrième, et le
    quatrième (`verif-v14/rendu.json`), plié au cinquième ; le cinquième n'est pas relu : MONARK le relit contre sa liste
    (`5471b92` l.42-43) et la précision de `7560620` ; le sixième l'est par trois instances neuves (`verif-v16/`), pliées au
    septième ; le septième n'est pas relu.

## 1. Décision en une phrase

Le chantier borne, vers moins de revendication et sans octet servi du harnais, les phrases publiques de la cause commune de la fiche (CC l.116-117) en **trois
parties** (README et site ; paquets exportés, README du harnais, skill ; pages Bell et Dōjō) ; **la partie 1 est le noyau seul, étendu par O-1** (`32cf23d`
l.10), **en deux lots** (Q-M1 (a), MONARK, `5fc2d0c` l.6-22 ; D-3) de 645 lignes de code mesurées (plan, R-25 ; L1 379, L2 268 (somme 647 : la ligne
`// killer:` du test de T14, écrite par L1, est renumérotée par L2 et compte dans les deux ; plan, « Découpage en deux lots », Somme) ; 787 avec
A-1, L2 passant à 410 au septième pli, mesuré sur un prototype : plan, R-25), où chaque phrase
bornée est épinglée par un test qui rougit sur l'ancien texte et porte une prémisse sur le code (ou calcule son attente depuis le code) qui rougit quand
l'item nommé rend l'ancien texte vrai à nouveau ; **deux tuyaux déclarés « à brancher »** (§5).

## 2. Contexte mesuré

**Cause commune** (CC l.116-117) : « des phrases publiques dépassent leur témoin (standard P-77, FORCE-1) ; un bornage réversible tient en un
lot de texte sans octet servi du harnais, sauf mention. » Les mentions sont en CC l.141-143 : `cascade.ts:92` et la description d'`attest`
sortent du lot de texte vers PXC-12 et PXC-08 (lignes C03, C16, Ukemi E6) (A03).

**Décisions déjà prises.**
- Fondateur, 2026-10-07 : Q-A « Maintenant », Q-A.2 « Passe « upcoming » (Recommandé) », Q-C « Adopter, ADR en 3 parties » (E l.49-54) ; la
  ligne d'ETAT de Q-A.2 est corrigée par MONARK à `caa36277` (E l.51-53, erratum P-7 ; `d5553e7` l.12) (A22).
- Fondateur, 2026-10-08 vers 05:18 UTC (`47ef84d` l.21-30 ; E l.484-492) : budget sans plafond (`47ef84d` l.23) ;
  le go d'envoi du site (`47ef84d` l.25) ;
  « on laisse built, mais on la BUILD, on en change pas le texte, on change l était du chantier de la piéce, on la battit. » (`47ef84d` l.27) ;
  lecture de MONARK : O-1 ne retire plus les phrases de collecte, Bell M5, M6 et Ukemi E9, qui deviennent des engagements de O-3 et O-4
  (`d40ab57` l.22-24).
- Fondateur, 2026-10-08 vers 05:3x UTC (`d40ab57` l.9-11 ; E l.513-516) : « Upcoming while building (Recommended) » : Q-A.2 est maintenue,
  la jambe « attested » de Narabi reste `upcoming` jusqu'à une attestation signée réelle ; l'attesteur à clé réelle se forme dans O-2, porteur
  et prix dans cet ADR (D-16). Le même jour : « on réarme la jambe payante » (`4f8e42f` l.13 ; E l.505-509), T6 de Narabi, dans O-2.
- MONARK, 2026-10-08 (`32cf23d`) : l'ordre O-1 à O-4 (l.9-15) ; O-1 « avec la liste (a) étendue comme tu la proposes » (l.10) ; la D-5 de Bell
  pour le **texte** : une correction qui retire ou rend vraie une phrase sur Bell est permise sous le gel, aucune phrase neuve,
  `/applications` compte comme page de Bell (l.18-20 ; D-15) ; I-G2-5 : sa lecture sur place avant l'envoi du site qui clôt O-1 (l.27-28 ;
  E l.360-364 ; D-17).
- #244 est fusionnée (`e13cfff7`, 2026-10-08 02:03:34 UTC) ; #245 aussi (`1ae166c6`, `d5553e7` l.8). L'ordre sur `fleet.ts` reste : le noyau,
  puis PXC-01 (MSG3 l.15-16 ; E l.303).
- Fondateur, 2026-10-08 vers 09:4x UTC, sur Q-V1 (`2ed67d1` l.8-12) : « construire le vrai lien, ce qui demande du travail en plus », un
  vrai usage pour Bell, « pas pour un ornement » (`2ed67d1` l.9) ; il corrige « Ukemi » en « Hikae » (l.12). Lecture de MONARK
  (`2ed67d1` l.16-22) : le vrai lien se construit s'il apporte un usage réel à Bell, et PAROXYSME juge s'il le faut (l.11, l.16-17) ;
  s'il le faut, il entre dans un chantier Bell institutionnel que PAROXYSME portera après le chantier en cours, le candidat PXC-19,
  BELL-INSTITUTIONAL-1 (`f392df8` l.20-21, `coordination/pieces/2026-10-08-plan-amendement-1/AMENDEMENT-1-PLAN-DE-ROUTE.md`) ; pour le
  noyau, MONARK retient l'option (a), le lien marqué à venir, sans autre promesse (l.20-21) ; « Le fondateur peut corriger cette
  lecture. » (l.22).
- Fondateur, 2026-10-08 vers 09:5x UTC (`8e5bea2` l.8-9) : « oui, je suis vos reco sur toutes les questions, … » ; d'où Q-V2 (b), Q-V3 (c)
  puis (a) si la lecture confirme, Q-V4 (d) et DN-13 (b) (`8e5bea2` l.12-17). MONARK applique Q-V3 (c) et Q-V4 (d) à leur périmètre vrai,
  sans les reposer au fondateur (`b03e434` l.6-11) : « La chaîne de hachage se dit ; le rejeu exact ne se promet nulle part. » (l.7) ;
  puis il tranche Q-M8 (a), six lignes de plus (`226d008` l.6-15).
- MONARK, 2026-10-08, lecture (a) de la demande du §7.10 (`0e66c86` l.6-17) : ECMA-262, 17ᵉ éd., §6.1.6.1.3, laisse le résultat de `**`
  « implementation-approximated » ; sous Node 24.21.0, V8 13.6 (build 233, révision 17) appelle le `std::pow` de la bibliothèque C de la machine. Mesure, même
  Node et même V8 (`0eb8942` l.6-21 ; `dbe4915` l.6-14) : les trois empreintes de `pow-digest.mjs`
  (`coordination/pieces/2026-10-08-pow-portable/`) diffèrent entre Linux et Windows, le pas réel du traqueur de Narabi compris ; le premier
  cas qui diffère est t = 2466, d'un ULP.

**Les limites couvertes.** Une ligne par limite de CC §4 où figure PXC-02 (C01 à C39, dans l'ordre du bloc), puis les lignes hors du bloc
(X1 à X3 : fiche ; X4 à X6 : liste (b) du PLAN §5.1, l.668-672, A04 ; X7 : renvoi du registre de Narabi, A30), puis les étapes
d'O-1 (relevés REL-B, REL-U, REL-N). Sort : `[P1]` partie 1 (le noyau, deux lots, deux PR) ; `[P2]` partie 2 ; `[P3]` partie 3 ; `[HORS]` hors
de PXC-02, porteur nommé ; `[O-3]`, `[O-4]` engagement de collecte (D-14). Fenêtres (REG Narabi, l.64-66) : F1 semaine du 2026-10-07,
F2 jusqu'au service de la vague 1 (vers le 2026-10-20), F3 du 2026-10-21 au 2026-11-16, F4 jusqu'au 2026-12-31, F5 après. Code et README
à T ; ETAT à E ; registres à REG, cités par entrée et lignes.

- **C01** · Shōgen L-01 (CC l.662) · `README.md:33` [P1] T13 (texte de A61) ; `README.md:95` et `:104` gardés sous l'exception datée de
  Shōgen, qui les touche (REG Shōgen N-16, l.409-415 ; CL l.35-40) (A05) · item : PXC-08 p2 ; PX-Shogen-1 ; SHOGEN-VITRINE-MONARK-1 (REG
  Shōgen L-01, l.117-122) · porteur : PAROXYSME ; release du miroir : le fondateur · déclencheur : PR du noyau ; PXC-08 p2 (F4).
- **C02** · le panneau Shōgen du site, même panneau que C05 (N-14) (CC l.696) · `shogen-panel.tsx:66-68` [P1] T24 (A45) ; DP:53
  (`notClaim`) gardé · porteur : PAROXYSME. La limite L-35, le certificat 04 et l'ouverture « par conception » de DP:53 tiennent au
  projet Shōgen et sortent de PXC-02 : hors du périmètre (`39c0425` l.14-16) ; la ligne L-35 du registre reçoit sa mention datée, rien
  n'est retiré (Q-SH-1 (a), `ae8a0fa` l.6-8). PX-Shogen-1, que le registre porte aussi sous L-35 (REG Shōgen L-35, l.308-312), reste
  porté au titre de L-01, côté MONARK (C01 ; `39c0425` l.17-18) : une seule lecture (sixième pli, V15-P5).
- **C03** · Shōgen N-03 (CC l.699) · `apps/harness/src/tools/attest.ts:33-35` (octet servi) [HORS] PXC-08 p1 ; le panneau [P1] T24, avec C02 ;
  `README.md:251` suit la clause · item : ATTEST-NEGATIVE-SCOPE-1, à former ; G5 (REG Shōgen N-03, l.332-338) · porteur : PAROXYSME ; forme G5 :
  le fondateur · déclencheur : release de textes servis (F3).
- **C04** · Shōgen N-04 (CC l.700) · `apps/site/lib/shogen-copy.ts:9-10` (à l'octet, SDT:602-610) [P2], Q-V2 (b), tranchée (`8e5bea2` l.12) :
  `which produces` devient `meant to produce` sur les trois surfaces du site qui rendent la phrase : “The full Shōgen
  sensor, meant to produce continuous testimonies across sources, is under test and is not served yet.” ; `shogen-copy.ts` et SDT entrent dans
  la liste de la partie 2 ; `piece-doc-page.tsx:144-147` [P2], un bornage vers moins de revendication, permis pendant l'exception (A40) ;
  le post X qui reprend la phrase [HORS] lecture de MONARK puis acte du fondateur (A40, A14) · item : SHOGEN-VITRINE-MONARK-1 (REG Shōgen
  N-04, l.339-344). Q-F6 est réglée en substance par la décision du 2026-10-08 sur le périmètre de Shōgen (`5ce6f27` l.128-129) ; C04
  reste sortie de la table de l'amendement n° 3 et sa part MONARK est portée par N-04 (Q-AM3-6 (b), `c2c9410` l.24).
- **C05** · Shōgen N-14 (CC l.710) · `shogen-panel.tsx:50-52` ; `README.md:204-206` [P1] T13 · item : PXC-02 p1 (REG Shōgen N-14, l.397-402).
- **C06** · Hikae L10 (CC l.747) · `README.md:53-56` [P1] T8 ; DP:61-63 [P1] T12 ; `packages/hikae/src/l2-monitor.ts:6`, `:61` (commentaires)
  [P2] · item : CM-5-PLAN-1 (E l.984) ; PXC-10 p1 (REG Hikae L10, l.145-152) · porteur : PAROXYSME ; CM-5-PLAN-1 : RECHERCHES.
- **C07** · Hikae L15, texte (CC l.749) · DP:66 ; `README.md:205` [P1] T12, T13 ; le servi `gate.ts:258-261` inchangé · construction PXC-08 p2-p3
  (REG Hikae L15, l.159-166) · porteur : PAROXYSME (la couture `attest → porte`, côté MONARK : `39c0425` l.17-18).
- **C08** · Hikae L19 (CC l.753) · `packages/hikae/src/index.ts:2` ; `packages/hikae/README.md:1` [P2] · M009 item (e), à former (REG Hikae L19,
  l.187-192) ; `hac-cp` relève de MK-L33 (X3).
- **C09** · Hikae N11 (CC l.768) · `packages/hikae/README.md` [P2] · HIKAE-TEXT-1-1-0-1, à former (REG Hikae N11, l.310-314).
- **C10** · Hikae N12 (CC l.769) · DP:61, :63, :66, :69, :70 [P1] T12 (P-3 et P-4 tranchés, A06) ; `hikae-panel.tsx:64`, `app/how/page.tsx:289`
  et `:75` [P1] T23. Gardés, vrais : `fleet-presentation.ts:47` (« Online monitoring of the remaining risk » : une technique du paquet, que la
  sentinelle de Narabi fait tourner, `apps/sentinel/src/timeline.ts:15`, `:146`) et `hikae-panel.tsx:71` (une limite honnête du même pas) ·
  item : PXC-02 (REG Hikae N12, l.315-321) · porteur : PAROXYSME · déclencheur : PR du noyau.
- **C11** · Hikae N13, texte (CC l.770), avec Hikae L9 (REG Hikae L9, l.138-144) (A07) · `README.md:13`, `:79`, `:94`, `:197`, `:255`,
  `:262-264` ; `package.json:5` · [HORS] le fondateur, valeur (CX-07, PLAN l.889), puis [P2] (le README et `package.json` entrent dans la liste
  de la partie 2, §4) ; le registre dit « parties 2-3 » : écart déclaré · item : liste (b) ; PXC-10 p3 (REG Hikae N13, l.322-328).
  Q-F3, réponse du fondateur, (b) : la dépense de `B_t` n'est pas construite dans le chantier PAROXYSME, qui ne l'attend pas pour
  finir ; elle reste un item de TYCHO, déclencheur : sa reprise ; aucune phrase publique sur `B_t` ni le jeton avant CX-07, et `README.md:262-264` ne change
  pas ici (`5ce6f27` l.121-124). Septième pli (D-4) : les deux lignes réécrites qui portent `B_t`, `README.md:205` (T13, L1) et `app/roadmap/page.tsx:159`
  (Q-M12 (b), L2), le gardent sans le changer ; le moniteur de C10 (1) suit la décision sur `B_t`
  (`coordination/pieces/2026-10-08-plan-amendement-3/QUESTIONS-FONDATEUR.md` l.75-77 à `32663c7`) : T12 retire déjà le moniteur des phrases de DP, et sa
  construction reste avec `B_t`, item de TYCHO, hors de la partie 1 (lecture de PAROXYSME, que MONARK peut renverser).
- **C12** · Ukemi L13 (CC l.790) · `apps/site/lib/ukemi-copy.ts:160-161` [P2] · PXC-12 p3 ; PXC-16 p3 (REG Ukemi L13, l.153-159).
- **C13**, **C14**, **C15** · Ukemi L26, L27, L28 (CC l.803-805) · `packages/ukemi/README.md:14`, `:79-82`, `:34-37` [P2] · PX-Ukemi-15, à former
  (REG Ukemi L26, l.222-226 ; L27, l.227-231 ; L28, l.232-236).
- **C16** · Ukemi L38 (CC l.815) · `apps/harness/src/tools/cascade.ts:92` (octet servi) ; `fleet.ts:194` (sa note, épinglée dans les deux sens
  avec la description servie) · [HORS] PXC-12, deux déclencheurs (A08) : la description de `cascade` à la release de textes servis (F3 ;
  CC l.141-143) ; U-6 au G0 de sa partie de PXC-12, au plus tard p3 (MSG l.47-48) (REG Ukemi L38, l.283-291). Même ligne : Ukemi E6 (D-14).
- **C17** · Ukemi N3 (CC l.818) · `README.md:106-107`, `:189`, `:256` [P1] T9 ; `schemas/attested-book.schema.json:5` [HORS] PXC-16 p3 (D-10) ;
  `packages/contracts/src/index.ts:8`, `types.ts:156`, `packages/monark/src/adapter-book.ts:30` [P2] · PX-Ukemi-20 (REG Ukemi N3, l.314-320).
  Q-F4, réponse du fondateur, (a), « Dans le vote » : la jambe payante reste dans le quorum, la promesse « keyless RPC quorum »
  devient fausse, le contrat et le README disent que le quorum compte un opérateur à clé (`5ce6f27` l.125-127). Volet README au noyau,
  T9 (PX-Ukemi-20, `docs/PAROXYSME-Ukemi.md` l.369 à `8400a223`) : « an RPC quorum that counts keyless operators and an optional keyed
  one », sans nombre d'opérateurs ; vrai à `8400a223` (`apps/sentinel/src/ukemi/record.ts:328-333` : l'opérateur à clé entre dans les
  listes du quorum et compte parmi ses opérateurs distincts) ; volet contrat en PXC-16 p3 (D-10). Septième pli (D-8) : les trois
  lignes [P2] de C17 (`packages/contracts/src/index.ts:8`, `types.ts:156`, `packages/monark/src/adapter-book.ts:30`), qui disent
  encore le quorum sans clé à `8400a223`, reçoivent en partie 2 la phrase de T9.
- **C18** · Ukemi N6 (CC l.821) · `apps/harness/README.md:34` ; `gate.ts:669` ; `calibrate.ts:115` [P2] (`gate.ts` après E-2a, PLAN l.501-502) ·
  PX-Ukemi-15 étendu (REG Ukemi N6, l.332-337).
- **C19** · Ukemi N9 (CC l.824) · `skills/monark/SKILL.md:62` [P2] · PX-Ukemi-15 étendu (REG Ukemi N9, l.350-354).
- **C20** · Narabi L15 (CC l.840) · `fleet.ts:209`, `:216-225` ; `README.md:113`, `:125`, `:186`, `:252` ; `narabi-copy.ts:12-15` ; les
  dix-neuf lignes « attested » du site et de la skill (REL-N l.66-74, Narabi T2), dont `skills/monark/DEMO.md:97` et `INTEGRATION.md:16` (A10) ;
  `skills/monark/SKILL.md:68` ; `apps/sentinel/README.md:3` · tout [P1] (T1, T5, T15) · item : NARABI-K1 (D-16) (REG Narabi L15, l.93-102).
- **C21** · Narabi L19 (CC l.844) · `README.md:61`, `:125`, `:133-135`, `:231-232` ; `narabi-live.ts:913-915`, `:925`, `:941` ;
  `app/docs/narabi/page.tsx:20`, `:50` ; DP:111, :113 (REL-N l.101-103, Narabi T10) · tout [P1] (T5, T16) ; Q-V3 tranchée (c) (`8e5bea2`
  l.13-14), au périmètre vrai (`b03e434` l.7) : toutes les surfaces du rejeu de Narabi, `README.md:36`, `:66`, `:119` et la `line`
  (`fleet.ts:209`) comprises, [P1] T16 (D-7) · item : NARABI-POW-PORTABLE-1 (`0e66c86` l.24-25), voie (ii) S4′ = PXC-04 p2 (REG Narabi
  L19, l.199-205) · porteur : PAROXYSME ; lecture d'ECMA-262 et de V8 : faite par MONARK (`0e66c86` l.9-17).
- **C22** · Narabi N03 (CC l.862) · `fleet.ts:217`, `:221-225` (la note, rendue par `app/fleet/page.tsx:139`, `app/docs/narabi/page.tsx:64`,
  `piece-doc-page.tsx:200`, `app/roadmap/page.tsx:326`) ; DP:124 [P1] T2 · items : NARABI-REGISTER-NOTE-1 ; NARABI-ATTESTED-LEG-1 (§5, §7)
  (REG Narabi N03, l.303-309).
- **C23** · Bell PX-Bell-17 (CC l.919) · `fleet.ts:350` ; `app/bell/page.tsx:428-431` [P3], sous la règle de texte de D-15 · PXC-07 p1, p3
  (REG Bell PX-Bell-17, l.370-375).
- **C24** · Bell PX-Bell-18 (CC l.920) · `app/bell/method/page.tsx:584-587` [P3] · PXC-15 p1-2 (REG Bell PX-Bell-18, l.376-380).
- **C25** · Bell N-01, texte (CC l.921) · **clos par #244** : les lignes « dedicated host » ou « own host » de `app/bell/method/page.tsx:423`,
  `app/bell/page.tsx:36`, `:616`, `app/bell/anchors/page.tsx:39-41`, `fleet-presentation.ts:130`, `fleet.ts:361` et
  `fleet.ts:352`, qui dit à T « … a MONARK host that also runs the Dōjō and a Narabi probe », comme les six autres ;
  `app/docs/bell/page.tsx:60` dit à T « it publishes at its own web address », où #244 a remplacé `from its own host`
  (`git diff -U0 885554e5 5e976a1a`) · item : BELL-HOST-COTENANCY-1 (E l.229-233) ; la séparation d'hôte (c) est à MONARK et au fondateur.
- **C26** · Bell N-02 (CC l.922) · `README.md:146-147`, `:214` [P1] T11 ; `fleet.ts:354` [P1] T14, volet (a) ; volet (b) : Q-V1, lecture de MONARK
  après la décision du fondateur, (a) pour le noyau (`2ed67d1` l.20-22 ; D-6) ; positionnement (`README.md:16-17`, `README.md:28`, `README.md:98`, le
  schéma `README.md:204-211` ; `app/layout.tsx:51`, `app/page.tsx:124`, `:206`, `app/roadmap/page.tsx:221`, `app/docs/page.tsx:50-51`,
  `app/docs/bell/page.tsx:59` ; et six lignes trouvées à la réparation n° 2, `README.md:77`, `app/docs/page.tsx:62`, `app/applications/page.tsx:26`,
  `:64`, `:67-68`, le commentaire `components/site-header.tsx:25`) : [P1] T25 ; Q-V4 (d) : les dix endroits (`8e5bea2` l.15) ; l'épingle et son tueur
  (`b03e434` l.8-9) ; six lignes de plus, Q-M8 (a), décidée par MONARK (`226d008` l.6-15) · item : BELL-CONNECTS-WITNESS-1 (REG Bell N-02, l.406-415) ;
  le vrai lien se construit s'il apporte un usage réel à Bell, PAROXYSME le juge dans l'ADR de PXC-19 (`2ed67d1` l.11, l.16-17 ; `f392df8` l.20-21).
  Q-F1, réponse du fondateur, (a) : le jugement d'usage d'abord ; s'il sert Bell, la construction avant la fin du chantier ; sinon le
  retrait de « Connects » et de « derived from the same gate » ; et « il n y aura pas de upcoming sur le nouveau BELL » (`5ce6f27`
  l.115-118). Aucune marque `upcoming` ne part sur la relation (volet (a), T14) : T14 sort de L1 par défaut (Q-M14 (a) ; D-6).
  « derived from the same gate »
  (`README.md:146` à `8400a223`) sort déjà par T11.
- **C27** · Bell N-03, texte (CC l.923) · `fleet.ts:346` ; `docs/adr/ADR-T1b-backend.md:129` · **sort du chantier** : c'est Bell M5, une phrase
  de collecte gardée, engagement de O-3 (`d40ab57` l.22-24) ; la minuterie (BELL-COLLECT-TIMER-1, PXC-14 p3) passe dans O-3 (A12) · item :
  BELL-CADENCE-TEXT-1 (REG Bell N-03, l.416-422) · porteur : PAROXYSME · déclencheur : le G0 de O-3.
- **C28** · Bell N-07 (CC l.927) · `README.md:133-137`, `:298-299` ; aussi `:48-49`, `:323` (A13) et `:221-222` (A57) [P1] T10, T20 · item :
  BELL-README-REPLAY-1 ; reste : l'export du collecteur, Bell L-31, PXC-11 p2-3 (A33) (REG Bell N-07, l.443-447 ; L-31, l.302-307).
- **C29** · Bell N-08, texte (CC l.928) · `app/bell/method/page.tsx:604-605` [P1] T18 (O-1, Bell N-08 ; règle de texte de D-15) · item :
  BELL-COLLECTOR-REV-PUBLIC-1, PXC-11 p2-3, pour l'empreinte (REG Bell N-08, l.448-453).
- **C30** · Dōjō DN-12 (CC l.1060) · `README.md:92-98` [P2] · Q-M6 (a), décidée par MONARK (`e37f2a5` l.19) : une ligne `upcoming` du
  Dōjō à la table de maturité (README-DOJO-MATURITY-1, INV-D l.381) (A14) ; contrainte PSH:227-230.
- **C31** · Dōjō DN-13 (CC l.1061) · texte X, hors dépôt · [HORS] lecture de MONARK (D6 ; demande formée au §7.10 (b), DOJO-X-TEXT-READ-1),
  puis, sous DN-13 (b), tranchée (`8e5bea2` l.16-17) : le texte est corrigé seulement si la relecture de MONARK y trouve une phrase fausse ;
  la publication reste un acte du fondateur (A14).
- **C32** · Dōjō DN-15 (CC l.1063) · `apps/site/lib/dojo-copy.ts:25-27` [P3] · DOJO-COPY-HOLDERS-MISSING-DAY-1 (E l.2290), déclencheur passé,
  décision de l'orchestrateur (INV-D l.384) [MONARK] : Q-M6 (a), décidée par MONARK (`e37f2a5` l.19), ligne d'attente datée proposée au
  §7.11, porteur PAROXYSME (A15).
- **C33** · Harness PX-Harness-02 (CC l.1066) · `README.md:175` [P1] T6 ; `packages/contracts/package.json:6` [P2] · README-CONTRACT-COUNT-1
  (REG Harnais PX-Harness-02, l.87-92).
- **C34** · Harness PX-Harness-03 (CC l.1067) · `README.md:258` [P1] T7, volet (a) ; le contrat [HORS] PXC-16 p3 · TRANSPORT-ERROR-DEF-1, à
  former (REG Harnais PX-Harness-03, l.93-98).
- **C35** · Harness PX-Harness-24 (CC l.1088) · `deploy/Caddyfile.monark-harness:27-28` contre `SECURITY.md:46-47` [P2] · PXC-02 p2 (le
  commentaire) ; JURISTE-DROIT-1 (PXC-18 p1) · porteur : PAROXYSME ; FAITS sur les champs du journal de Caddy : MONARK, lecture sur place,
  avant la partie 2 (A16) (REG Harnais PX-Harness-24, l.254-260). Q-F7, réponse du fondateur, (a) : le journal garde les quatre champs
  du commentaire ; la restriction est à construire, HARNESS-ACCESS-LOG-FIELDS-1 (PXC-18 p1) ; son déploiement sur l'hôte reste un acte,
  avec le go du fondateur, par MONARK (`5ce6f27` l.130-132).
- **C36** · Harness PX-Harness-27 (CC l.1091) · `skills/monark/SKILL.md:72` ; `README.md:238-243` [P2] · R-11, SKILL-KATA-15M-NOTE-1, à re-former
  par PXC-01 (REG Harnais PX-Harness-27, l.274-280).
- **C37** · Moteur MK-L09 (CC l.1101) · 0006 l.37, dépôt `recherches`, non lu · [HORS] RECHERCHES · W2-MKL09-ADDENDUM-1 (E l.1217) ; PXC-09 p2
  (REG Harnais MK-L09, l.337-341) · déclencheur : avant le G0 court de la vague 2.
- **C38** · Moteur MK-L32 (CC l.1124) · C §13, non lu · l'épingle reste à PXC-02 (CC l.133 ; REG Harnais MK-L32, l.485-489), en zone
  RECHERCHES : la v1 la déplaçait à PXC-16 p3 sans décision de MONARK (A17) ; Q-M3 (a), décidée par MONARK (`e37f2a5` l.17) : gardée dans
  PXC-02, partie 2, zone ouverte à demander à RECHERCHES par MONARK [P2] (§4, partie 2) · item : ERROR-ORDER-SPEC-1, à former.
- **C39** · Moteur MK-L36 (CC l.1128) · `README.md:175` [P1] T6 · README-CONTRACT-COUNT-1 (REG Harnais MK-L36, l.504-507).
- **X1** · Hikae, doute 4 (fiche, CC l.124-125) · `fleet.ts:159-163` (un id unitaire dans `integration_test`) [P1] T3 (D-9) · règle CA-11 durci.
- **X2** · Ukemi, ligne datée d'ADR-M020:67 (fiche, CC l.127) · `docs/adr/ADR-M020-programme-ukemi.md:67` [P2] · volet de L5 (REG Ukemi L5,
  l.105-112) ; aucune ligne d'ETAT proposée (A18 réfuté, §12).
- **X3** · Moteur MK-L33, volet épingle (fiche, CC l.133) · C §5-§13, non lu · même question que C38, Q-M3 (a), décidée par MONARK
  (`e37f2a5` l.17) : l'épingle en partie 2, zone ouverte chez RECHERCHES [P2] (§4, partie 2) ; l'élagage reste à PXC-16 p3
  (REG Harnais MK-L33, l.490-493).
- **X4** · liste (b) : `README.md:179-180`, critère public de maturité · [HORS] le fondateur : la question P-79, échéance PXC-01 p3 (PLAN l.889) ;
  « n'est pas faux » (PLAN l.668-669) (A19, A41).
- **X5** · liste (b) : `README.md:65`, `:285` (version, `version.ts:22`) · [HORS] HARNESS-VERSION-ALIGN-1 (PXC-16 p2), porteur PAROXYSME ;
  le fondateur pour Q-H1 et la republication · déclencheur : Q-H1 en F2 ; release de textes servis (F3) (REG Harnais PX-Harness-01, l.80-86) (A20).
- **X6** · liste (b) : `gate.ts:183-184` (octet servi) · [HORS] release L · E2A-TEXTS-1 (E l.273) · porteur : MONARK.
- **X7** · Narabi, renvoi à PX-Harness-04 (REG Narabi, l.455-456 ; CC l.1068 ; REG Harnais PX-Harness-04, l.99-106) (A30) · la définition
  publique « … unchanged sentinel build … » (`narabi-copy.ts:92`, `narabi-live.tsx:529`) [P1] T4 (PLAN l.653-654) · item :
  SENTINEL-DEPLOY-GUARD-1, PXC-05 p1 dans O-2 (E l.571-573) · porteur : PAROXYSME.
- **Bell M5** (REL-B l.63-64) · la phrase promise par `ADR-T1b-backend.md:129`, absente · [O-3] : phrase de collecte, gardée (`d40ab57` l.22-24) ;
  = C27 · 0,25 j (INV-B l.171).
- **Bell M6** (REL-B l.65-68) · présent habituel de la collecte (D2 à D5) · [O-3], gardé : engagement de O-3 ; porteur PAROXYSME ; déclencheur : le G0 de O-3
  · estimé 0,25 j (REL-B l.66). Ses renvois N-07 et N-08 restent au noyau (C28, C29).
- **Bell M9** (REL-B l.73-75) · `fleet-presentation.ts:131` sur `/applications` : « no closing price is read into the first record, so it carries
  no gap » · [P1] T19 (règle de texte de D-15) · estimé 0,1 j (REL-B l.75).
- **Bell N-08** · = C29, [P1] T18 · 0,25 j (INV-B l.128).
- **Ukemi E6** (REL-U l.86-87) · la description servie de `cascade` nomme « U-5 » (`apps/harness/src/tools/cascade.ts:92`) · O-1 la retient, mais
  c'est un octet servi : hors des PR du noyau ; Q-M2 (b), décidée par MONARK (`e37f2a5` l.16) : lot propre dans O-1, après le noyau, dû
  avant l'envoi qui clôt O-1 ; porteur PAROXYSME ; prix estimé 0,25 j (REL-U l.87) + acte de release du fondateur.
- **Ukemi E8** (REL-U l.90-92) · `cascade` décrit comme un outil de livre de prêt (`README.md:35`, `:239-240`) · [P1] T21 · estimé 0,25 j.
- **Ukemi E9** (REL-U l.93-95) · présent d'activité (`app/docs/ukemi/page.tsx:31`, `app/docs/research/page.tsx:193`, DP:88,
  `ukemi-copy.ts:79`) · [O-4], gardé (`d40ab57` l.22-24) : engagement de O-4 ; porteur PAROXYSME ; déclencheur : le G0 de O-4 · estimé 0,25 j.
- **Ukemi E12** (REL-U l.105-107) · lecteur de file de désendettement dit « wired » sans code (`fleet.ts:298`, `:316` ; `README.md:35`) · [P1]
  T22, au futur · estimé 0,25 j.
- **Narabi T2** (REL-N l.66-74) · les dix-neuf lignes « attested » · [P1] T15 (avec C20) · estimé 0,8 j.
- **Narabi T10** (REL-N l.101-103) · « anyone can replay it » · [P1] T16 (avec C21) · texte : estimé 0,1 j ; la
  construction du rejeu reste S4′, la voie (ii) de NARABI-POW-PORTABLE-1, prix estimé C 2,5 + R 1 j-h (INV-N l.172 ; §7.8).
- **Narabi T12** (REL-N l.105-107) · `piece-doc-page.tsx:97-98` tait le délai et les reprises · [P1] T17 · estimé 0,1 j.
- **I-G2-5** (Bell L-22 ; REG Bell L-22, l.233-245) · `app/bell/method/page.tsx:563` (« consolidated daily share volumes ») · lecture sur place
  de MONARK (FAITS datés), puis un lot de texte ; déclencheur : avant le prochain envoi du site, au plus tard la publication seq 3
  (`ba3dab6` l.13-14 ; E l.360-364 ; D-17) · 0,5 j (INV-B l.99).

**Comptes**, par limite, sur les lignes C01 à C39 et X1 à X7 (une puce, ses lignes de suite comprises ; la puce C13-C15 compte trois),
`node travail/run2/count-marks.mjs <ADR>` (empreinte au plan, annexe B) : 44 puces, 46 limites ; `[P1]` 19, `[P2]` 19, `[P3]` 3, `[HORS]` 11
(les marques se recouvrent : la somme n'est pas 46) ; sans marque de partie : C16, C25 (clos), C27 (sort), C31, C37 (`[HORS]`), X4, X5,
X6. C38 et X3 portent `[P2]` depuis Q-M3 (a) (pli du cp-1, C-3).

## 3. Décisions

**D-1. Forme de Q-A.2 (a) : forme (2), texte et câblage ; `status` reste `built`** [MONARK]. La jambe « attested flow → gate » sort de
`served_by` (`fleet.ts:217`) et d'`integration_test` (`:223`, l'id A7b) ; la note (`:225`) dit qu'elle est `upcoming` ; la `line` (`:209`)
perd « attested » (T1, A52). *Preuves à T, qui portent sur la jambe* (A21) : le test cité construit son flux à la main
(`apps/harness/test/gate.test.ts:463-479`, clé fictive l.467) et appelle la porte en mémoire (`:518-531`) ; aucune source de la sentinelle,
à aucune profondeur, n'appelle la porte ni n'importe le harnais hors de sa calibration (`git grep -n -e runGate -e gateTool -e tools/gate
-e handleJsonMirror -e '@monark/harness' 5e976a1a -- apps/sentinel/src ':!apps/site/data'` : une ligne, `apps/sentinel/src/timeline.ts:16`,
l'import de la calibration) ; aucun module servi ne fait d'un flux publié un appel de porte (`git grep -n fromAttestedFlow 5e976a1a --
apps/harness/src ':!apps/site/data'` : `calibration.ts:59` et `:171`, un commentaire et une note de provenance). La première jambe est
servie et rejouée depuis les fichiers publiés (`test/narabi-live.test.ts:184`) ; CP1 l.43 : « le built de Narabi ne tient que par la
première jambe ». Le refus de tout `attested` par la porte servie (`apps/harness/src/attestation-binding.ts:36`, `:62-65`) ne prouve rien
sur cette jambe, qui entre comme `Prediction` (A21) : il ne sert plus de preuve. MONARK : « Elle me paraît juste. Je la jugerai au cp-1 »
(MSG3 l.13-14) (A22). Le fondateur garde `built` (`47ef84d` l.27) et maintient la jambe `upcoming` (`d40ab57` l.9-11) : la forme (3) est
exclue par sa décision. *Rejetées* : (1) texte seul (`served_by` et `integration_test`, exportés au miroir, diraient une jambe prouvée) ;
(3) `status` → `upcoming` (contraire à la décision du fondateur ; change les comptes publics, CIG:1051, `package.json:5`). Deux limites
distinctes : L15 (clé fictive, `apps/sentinel/src/flow.ts:52`, construction NARABI-K1, D-16) et N03 (câblage de la seconde jambe,
NARABI-ATTESTED-LEG-1, §5).

**D-2. Aucun code interne dans un texte public ; l'item est nommé dans le titre du test.** Trois scans du site refusent les codes (REL A.0
l.69-74) ; la règle du fondateur interdit la cuisine interne en public. Règle suivie, recomptée sur les 32 tests neufs (A23) : 30 portent
au moins une prémisse sur le code (`premise:` dans le message) qui rougit quand l'item arrive ; 2 calculent leur attente depuis le code,
sans prémisse (`built_application_connections_are_upcoming_until_imported`, depuis les `package.json` ;
`readme_counts_the_frozen_contracts`, depuis `schemas/`). Les prémisses lisent du code, pas du texte : celle de T8 cherche un lecteur
de `drift_flag` dans les sources du harnais et des paquets, celle de T12 un appel du moniteur en ligne dans le harnais (A23). Chaque titre
nomme la limite et l'item, sauf quatre : celui de X1 nomme la règle CA-11 durci (la liste est corrigée, aucun item) ; celui de T23
(`hikae_panel_and_how_say_no_monitor`) ne nomme que la limite, Hikae N12 : le registre lui donne PXC-08 pour `attested` et PXC-16, aucune
construction pour `monitor` (REG Hikae N12, l.315-321), mais PXC-10 touche le moniteur L2 et DP:61-63 (CC l.354, l.358) ; s'il fait tourner un
moniteur dans le harnais, la prémisse du test rougit ; les deux de T4 ne nomment que l'item, SENTINEL-DEPLOY-GUARD-1 (leur limite : X7).
*Rejetée* : le nom d'item dans la phrase publique (PLAN l.644-645).

**D-3. Trois parties ; la partie 1 est le noyau seul, en deux lots sous une seule G2** [MONARK, Q-M1 tranchée : (a)] (A48). La v1 coupait la partie 1 en deux
lots gardés à part, chacun avec son cp-1 et sa G2, contraire à la décision 300 (METHODE l.185-186). MONARK tranche Q-M1 (`5fc2d0c` l.6-22) : (a), la partie 1
est le noyau seul ; la partie 2 reprend le contenu de l'ancienne PR 2 et le reste du README et du site ; le chantier compte trois parties (`5fc2d0c` l.7-10).
*Condition de taille* : le noyau mesure 645 lignes de code, au-dessus de 547, la borne du lot au plan (`docs/methode/CHECKLIST-G7.md` l.8 à `2d37851b`, item 4 ;
`5fc2d0c` l.11-12) : il se coupe en deux lots de 547 au plus, fusionnés l'un après l'autre, avec tests, tueurs et mutations à chaque fusion, puis relus
ensemble par une seule G2, celle de la partie, suivis d'un seul cp-2 et d'un seul G7 ; ni cp-1 ni G2 par lot (`5fc2d0c` l.13-16 ; décision 300). *La coupe*,
un fait du plan (`5fc2d0c` l.22 ; plan, section du découpage) : L1, le README, les textes exportés et les phrases que le README partage avec le site (T4 à
T11, T14, T18, T20 à T22, T25, la part L1 de T13, T15 et T16) : 379 lignes de code, 8 de contenu, 8 de documents ; L2, le reste du site (T1 à T3, T12, T17,
T19, T23, T24, la part L2 de T13, T15 et T16) : 268, 39, 0 (somme 647 : la ligne `// killer:` du test de T14, écrite par L1, est renumérotée par L2 et compte
dans les deux ; plan, « Découpage en deux lots », Somme). Chaque lot est vert seul (19 et 15 tests jugés, rouges à leur base par assertion, verts à leur gel ;
19 et 15 tueurs, 49 et 40 mutants, tous tués), et T + L1 + L2 est à l'octet le gel du noyau entier. La piste de MONARK (`5fc2d0c` l.17-18) ne tient pas : le
noyau ne porte aucun outil (plan, même section). *Rejetées* : (i) une G2 par lot (écart à METHODE l.218-219, que MONARK seul demande ; `5fc2d0c` l.16) ; (ii)
une PR unique de 645 lignes, au-dessus de la borne du plan (`5fc2d0c` l.11-12). *A-1 (v10)* : L2 prend trois fichiers de plus (le troisième,
`scripts/assert-fleet-html.mjs`, au septième pli), trois tests jugés et leurs tueurs, et 142 lignes de code, mesurées sur un prototype : 410, sous 547, pas
de troisième lot ; L1 garde sa taille, hors des défauts de Q-M14 et Q-M15 (T14 et T18 hors de L1 : environ 34 lignes de code de moins, estimé ; plan, R-25)
; les comptes ci-dessus sont ceux du gel de la v9, remesurés à la régénération du gel après l'accord.

**D-4. README l.146-147 et l.214** (A24, A59). Le texte du PLAN (« built on the same contracts ») est faux pour Bell :
`apps/bell/package.json` ne dépend que de `@monark/rpc-guard`. Le texte neuf dit ce que les imports et le registre portent : Bell garde sa
porte, celle que le registre lui donne (`fleet.ts:351` : « the publisher's closed checks »), et n'importe aucun contrat ; chaque piste
de recherche est câblée à la porte partagée (`fleet.ts:298`, `:307`, `:316`, `:326`, `:335` ;
*wired* défini en `README.md:29`). La l.146 dit `is meant to be put to work on` (A24). Les phrases de positionnement (`README.md:16-17`,
`README.md:28`, `README.md:98`, le schéma `README.md:204-211` ; six surfaces du site) étaient une décision de valeur. Q-V4 (d) : les dix
endroits (`8e5bea2` l.15) ; l'épingle et son tueur (`b03e434` l.8-9) ; six lignes de plus, trouvées à la réparation n° 2 (C26), Q-M8 (a),
décidée par MONARK le 2026-10-08 vers 11:3x UTC, en exécution de la décision du fondateur sur Q-V4, non une décision neuve du fondateur
(`226d008` l.6-15). Le noyau les borne (plan, T25) : le moteur est `meant to power` les applications ; MONARK Bell garde sa porte, chaque phrase sur Bell rendue
vraie à sa place (D-15). L'épingle de SBF:1171-1172 (le mutant nommé de `site_names_no_kitchen` ancré sur la phrase de `/roadmap`) est
récrite, avec une ligne `// killer:` neuve : ce test devient jugé, F2P, et les tests jugés passent de 33 à 34 (vérification A de la
réparation n° 1, problème 4). Prix réestimé : environ 0,75 j, estimé (`80223c2` l.35), pour les dix endroits et l'épingle ; environ un dixième de journée de
plus, estimé, pour les six lignes (`315ce29` l.32-34) ; mesuré : 42 lignes de code et 6 de contenu, dont 10 et 2 pour les six lignes
(plan, R-25). *Rejetées* : le texte du PLAN ;
« upcoming application » à la l.214 (le README dit partout « research leads », `:17`, `:98`, A59).

**D-5. DP:61-70 : aucune revendication neuve ; les mots suivent la porte servie** (P-1, P-3, P-4 ; A06, A27, A60). DP:70 devient `a
split-conformal margin q-hat from a committed calibration or the caller's own scores` : une calibration engagée (`gate.ts:630-633`,
`:695-697`) ou la boucle BYO, `splitQuantile` sur les scores de l'appelant (`apps/harness/README.md:35`). DP:63 perd `per task class` :
les 32 classes kata (nombre : `apps/harness/README.md:36`, A26) sont servies en contrôle de risque (`policy-classes.ts:22` ;
`kata-path.ts:83`) ; P-4 est tranché, faux à T. DP:69 devient `Calibrate, then decide` (P-3) : la porte servie ne tient aucun moniteur.
L'item qui rendra ces mots à revoir : E-2a, à la première ligne kata engagée ; la prémisse du test lit `gate.ts:233` (« which hold no
committed calibration row ») et rougit alors (A27). *Erratum de la v1* : « les deux classes stable-run » (DEC-PX D-5) était faux (P-1) ; la
v1 disait aussi « aucun item ne le rend faux », faux à T (A27).

**D-6. `fleet.ts:354` : volet (a) au noyau ; volet (b) : lecture de MONARK (`2ed67d1` l.20-22) après la décision du fondateur
(l.8-12)** (Q-V1). (a) : le champ `connectsStatus: FleetStatus` de
`BuiltFleetProduct` (Bell : `"upcoming"`), rendu par la pastille de statut aux trois endroits qui rendent la relation
(`built-application-card.tsx:74`, `app/docs/bell/page.tsx:59`, `board.tsx:430`) ; la valeur et son épingle (SBF:1092-1093) ne bougent pas.
Le test n'impose que « non importé ⇒ `upcoming` », puis `upcoming` tant que le registre ne nomme aucune composition servie et testée de la
relation : une dépendance déclarée ne suffit pas à `built` (A67, règle Branchement). (b) : Q-V1 : pour le noyau, l'option (a), la relation
annoncée et marquée à venir, sans autre promesse (lecture de MONARK, `2ed67d1` l.20-22 ; « Le fondateur peut corriger cette lecture. … »,
l.22) ; le marquage clôt BELL-CONNECTS-WITNESS-1. Le vrai lien, Bell ↔ Shōgen et Hikae, se construit s'il apporte un usage réel à Bell
(`2ed67d1` l.8-12, l.16-17) ; PAROXYSME le juge et le chiffre dans l'ADR de PXC-19 (l.11 ; `f392df8` l.20-21). Conséquence
mesurée : le champ ajoute deux lignes avant `fleet.ts:137` ; les tueurs SDT:608 et SDT:801 passent de `:137`, `:142` à `:139`, `:144` dans
la même PR. *Sixième pli* : le fondateur corrige cette lecture, Q-F1 (a), et dit « il n y aura pas de upcoming sur le nouveau BELL » (`5ce6f27` l.115-118) :
aucune marque `upcoming` ne part pour la relation de Bell. Le jugement d'usage, item BELL-CONNECTS-USE-1 (porteur : PAROXYSME, sur pièce ; prix estimé, non
mesuré : 0,25 j ; déclencheur : avant la PR de L1), choisit : s'il sert Bell, la construction avant la fin du chantier, dans le code de Bell, à MONARK, par
une ligne de zone qu'il valide (≥ 1 j, estimé, §6), et la relation devient `built` par sa composition servie et testée ; sinon, le retrait de la ligne
Connects de la fiche de Bell et de ses trois rendus, et de la phrase du README que T11 retire déjà. *Septième pli* (D-1) : Bell est le seul produit `built`
du registre (`apps/site/lib/fleet.ts:355` à `8400a223`), et `connects` est obligatoire dans le type commun (`fleet.ts:105`) : le retrait change le type et
les trois rendus, et le test de T14 devient une épingle d'absence (prix estimé, non mesuré : 20 à 30 lignes) ; il n'y a pas d'autre produit pour qui garder
le champ. Ce que L1 livre pour T14, défaut qui tient sans décision neuve, Q-M14 (a) : rien ; T14 sort de L1 (le champ, la valeur de Bell, les trois rendus,
le test de T14 et les deux tueurs de SDT qu'il renumérote : 26 lignes de code au gel de la v9, `diff -U0` de la base à `gel-L1`, estimé pour L1 ; deux
fichiers de moins, `built-application-card.tsx` et `board.tsx`) ; la relation reste servie comme au tronc, sans marque, jusqu'au lot qui porte la suite du
jugement (la construction, par MONARK ; ou le retrait, par PAROXYSME, avec sa ligne de zone). L'autre option, Q-M14 (b) : L1 porte le retrait si le jugement
le rend avant sa PR (`QUESTIONS.md`, Q-M14).

**D-7. La phrase D8 de Narabi : les trois copies ensemble, sans clause de rejeu** [VALEUR, couverte par la validation ; la clause et les
autres surfaces du rejeu : Q-V3, tranchée (c)].
Phrase du pli, mot pour mot :

> Narabi runs an adaptive quantile tracker (Angelopoulos–Barber–Bates 2024, decaying step) on the daily USDe redemption flow: its state
> moves each 24h window from the realized outcome, and the full timeline is published with the Node version of each line. What it
> carries is a deterministic long-run bound that tightens as windows accumulate, printed daily with T, not a per-window coverage, not a
> probability; the gate's committed calibration does not depend on the tracker state. Until the pre-registered drift criterion fires
> and an ADR says otherwise, the gate's region is still the committed static calibration: the tracker adapts, the gate does not yet.

(Coupée ici pour la lecture ; une seule ligne dans chaque copie.) Copies : `README.md:125`, `apps/site/lib/narabi-live.ts:912-919`,
`test/ci-gates.test.ts:577-584` (gel l.579-586). *Preuve* : « attested » tombe (clé fictive, `flow.ts:52`) ; chaque ligne publiée porte la
version de Node qui l'a écrite (`apps/sentinel/src/run.ts:352`, `timeline.ts:165`) ; le dépôt ne tient le rejeu bit à bit que sur le même
moteur (NLT:807 : « bit for bit on this engine ») et le pas passe par `**` (`packages/hikae/src/tracker.ts:79`) : la clause `so it can be
replayed on that version` reposait sur une source alors non lue (A38) ; D8 s'arrête à `published with the Node version of each line`.
**Q-V3 est tranchée (c)** (A37, A38) par le fondateur (`8e5bea2` l.13-14), au périmètre vrai que MONARK confirme (`b03e434` l.6-7) :
aucune surface publique ne promet le rejeu du traqueur ; la chaîne de hachage par ligne et la version de Node de chaque ligne se disent.
Le plan l'applique à trente et une lignes de quinze fichiers (T16) : README l.36, l.66, l.119 et les deux recettes, la `line` (T1),
`/narabi` (`WHY_SEVEN`, `FLEET_PLACE`, `VERIFY_HINT`), le panneau de Narabi, l'accueil, `/docs/research`, `/docs/verify`, le menu des
docs, la présentation de la flotte, la skill et le README de la sentinelle ; la liste de la réparation n° 1 n'en nommait que cinq
(vérifications A et B de la réparation n° 1, problème 1 chacune). Gardés, car ils ne promettent rien : la recette que `/narabi` rend et
son fait `tracker replay recomputed here` (`narabi-live.tsx:498`), un recalcul que la page fait elle-même et dont elle imprime le résultat.
**La bascule vers (a)** (la clause `, so it can be replayed on that version` dans D8, et un rejeu borné sur les surfaces de T16) n'attend
plus la lecture : faite par MONARK, elle ne la confirme pas (`0e66c86` l.9-17) ; l'écart est mesuré entre Linux et Windows sous le même
Node, sur le pas réel du traqueur (`0eb8942` l.20-21 ; premier cas t = 2466, d'un ULP, `dbe4915` l.10-14). La limite n'est plus
seulement permise par la spécification : elle est mesurée. La bascule attend NARABI-POW-PORTABLE-1 (`0e66c86` l.19-25 ; §6, §7.8) : construction,
voie (ii), S4′, le calcul en entiers (PXC-04 p2), accordée par MONARK (`2f88fe7` l.6-7) ; la voie (i) n'est pas retenue. Les neuf tests
du rejeu (celui de T1, deux de T5, quatre de T15, les deux de T16) ont deux prémisses, `**` dans `tracker.ts:79` et la provenance d'une
ligne dans `run.ts:55` : la construction les fait rougir.
Prix de (c), réestimé : environ 0,5 j, estimé (`80223c2` l.24) ; mesuré : 59 lignes de code et 4 de contenu (plan, R-25). ADR-M012 D8
fixait l'ancienne phrase : la PR porte un amendement daté d'ADR-M012 l.113, étendu à D4 (l.56, l.62) et aux Positives (l.157), qui
disaient le rejeu du traqueur (Q-M10 (a), décidée par MONARK : `cf0e079` l.8-9, l.18-19) ; le commentaire de CIG cite D-7 (A28). Les
deux commentaires de `apps/sentinel/src/timeline.ts` qui le disent aussi (l.4-5, l.67 à T) restent à l'octet (pli §11-1 de Narabi,
#252 : `cf0e079` l.12-13) et vont à NARABI-POW-PORTABLE-1 (§7.8). Le test d'identité
README = site est ajouté (NLT) ; site = CIG est déjà tenu (NLT:307-317). Le compte
des « ADR » nus de `narabi-live.ts` reste 4 (SBF:1121-1125). *Rejetées* : changer le README seul ; garder `so anyone can replay it`
(`README.md:125`, L19).

**D-8. Shōgen, bloc `How it works` : `building`** (A-1, décision du fondateur, `5471b92` l.10, l.16-27 ; récrite au pli de sa validation et à son second pli).
La v9 disait `upcoming` et rejetait une troisième valeur de statut ; le fondateur la demande pour Shōgen : la troisième valeur, `building`,
est adoptée pour ce bloc seul. Tout `attested` est refusé (`attestation-binding.ts:62-65`) : la composition ne tourne pas. Le bloc la dit en
construction, `This composition does not run yet: the join from attest into the gate is being built.`, sans fait servi (règle H8,
SBF:688-693) ni capacité de plus : Shōgen est sous l'exception datée (ADR-0028 Shōgen §4.11, SHOGEN-VITRINE-MONARK-1), qui interdit
toute revendication neuve (`5471b92` l.24-25), et `building` dit moins que `built`, le statut du bloc à T (`docs/PAROXYSME-Shogen.md`
l.422 à `b44c3890`, N-14). *Forme* : `PanelBlock` prend un `AgentStatus` (`apps/site/components/panel-shell.tsx:17` à `b44c3890`),
`"built" | "upcoming"` (`apps/site/lib/status.ts:6` à `b44c3890`), et `StatusBadge` rend `upcoming` pour tout ce qui n'est pas `built`
(`apps/site/components/status-badge.tsx:12-13` à `b44c3890`). **Décision de la session PAROXYSME sous sa délégation technique** (second
pli, P1 ; MONARK peut la renverser) : `PanelBlock` garde `AgentStatus`, deux valeurs ; `lib/status.ts` reçoit la troisième valeur à
part, `BuildingStatus = "building"`, que prend seul `BuildingPanelBlock`, composant de `components/panel-shell.tsx` propre au panneau
de Shōgen, que seul `shogen-panel.tsx` emploie. Motif : le typage interdit alors `building` à tout `PanelBlock`, sans élargir les
gardes. Deux tests le tiennent (plan, T13). Le test servi lit le rendu de la page : `/fleet`, rendue côté serveur avec chaque panneau
ouvert (le panneau ne se monte qu'au clic ; le HTML de `next build` n'en porte rien), montre le mot `building` une fois, pastille du
bloc « How it works » du panneau de Shōgen. Un second rougit quand un fichier que la page importe le dessine, sous tout nom, par la prop `render` ou
l'enfant fonction d'une partie du dialogue, dans un attribut `value` ou `placeholder`, ou le mot coupé par une balise vide `span`, `b`, `i`, `em` ou
`strong` (ou `<wbr/>`), par un commentaire tel que le lit le balayeur du dépôt, `stripHiddenSurfaces` (`scripts/assert-fleet-html.mjs:202` à `8400a223`,
exporté par L2 : il ôte aussi `script`, `noscript` et `template`, et lève quand un commentaire couvre l'ouvrant d'un `<style>` ou d'un `<script>`), ou par
un caractère ignorable par défaut (propriété Unicode `Default_Ignorable_Code_Point`, dont U+00AD, U+200B à U+200D, U+2060 et U+FEFF) (quatrième à septième
plis, W1 à W3, P1, P2, V15-P1 à V15-P4, C16-P1 à C16-P3). L'aide garde le `Root`, le `Trigger`, le `Close`, le `Title` et la `Description` de Base UI 1.8.0,
qui rendent côté serveur : `Root` fermé, comme le sert le premier rendu, avec les props et l'état que Base UI calcule (une fonction `render` du déclencheur
qui lit `aria-haspopup` rougit, et un enfant fonction de `Root` est appelé) ; elle garde aussi `Viewport`, `Handle` et `createHandle`, que le gel n'emploie
pas : un `Viewport` lève sans le vrai `Portal`, et le test rougit (arbre `a-viewport` ; C16-P6) ; seuls `Portal`, `Backdrop` et `Popup` sont des bouchons,
rendus en place : `Portal` dessine sa prop `render` avant ses enfants, `Backdrop` et `Popup` la leur comme Base UI le fait pour le texte (une fonction,
appelée avec les props du site et un état vide ; un élément, cloné avec elles sous les siennes). Elle lit un import entre guillemets doubles ou simples et
refuse, nommé, tout import de `@base-ui/` qu'elle ne bouchonne pas, hors `@base-ui/react/button`, le seul autre que le gel importe (C16-P3 ; arbres `a-sq`,
rouge, et `a-pkg`, refusé). Il ne voit pas : un texte que dessine le CSS ou un autre attribut (`alt`, `title`) ; un état qu'un script atteint après le
premier rendu (un effet ; un clic hors des dialogues, que le test ouvre) ; une fonction `render` qui lit l'état de sa partie, une prop que Base UI calcule
depuis cet état (`aria-expanded`, `data-popup-open` d'un `Trigger` : arbres `a-trigexp` et `a-trigopen`, verts ; C16-P4), ou une prop que Base UI calcule
pour `Portal`, `Backdrop` ou `Popup` (une fonction de `Popup` qui lit son `role` laisse le test vert : arbre `ev-popupfn`, borne prouvée) ; un mot coupé par
un élément qui a un contenu, par un autre élément vide ou par une balise vide que le CSS dote d'une boîte (une pastille coupée par un `button` vide rougit
le test : arbre `a-fab2` ; C16-P2) ; les 39 autres pages. Le premier filet lit le texte : dans
les fichiers `.ts` et `.tsx`
de `apps/site/app`, `components` et `lib`, le texte `BuildingPanelBlock` ne paraît qu'à sa définition, dans `panel-shell.tsx`, et à
l'import et aux deux balises de `shogen-panel.tsx` ; il ne lit ni une autre extension, ni un autre répertoire, ni un nom échappé (W1,
W2). Ce que le test servi ne voit pas devient deux items formés, chiffrés sur le prototype (plan, T13 ; cinquième pli, P3, P5) :
SITE-BUILDING-PILL-ROUTES-1, les 39 autres pages, rendues de même sous le `ThemeProvider` du layout, leurs parties asynchrones attendues (prix mesuré au
septième pli : 43 lignes de SBF, L2 453 ; 2,38 à 2,67 s de test, mesuré au sixième pli ; déclencheur : la PR de L2). Avec l'item, le test de `/fleet` passe
de `renderToStaticMarkup` à `prerender`, qui insère `<!-- -->` entre deux textes voisins : le balayeur les ôte, et `build{"ing"}` rougit les deux tests
(V15-P2, arbre `adj-r2`). Deux d'entre elles lisent `fixtures/usde-calib-scores.json` : Q-V15-1, tranchée (a) sous conditions par MONARK, `cc02038` l.10-16,
conditions écrites dans l'item et dans le test : le rendu du test peut lire le fichier, comme le build lit `apps/site/data/` ; aucun agent n'en lit,
n'affiche, ne copie ni ne cite le contenu, ni un nombre rendu à partir de lui, et le test n'asserte que la pastille, son statut et sa classe ; aucun journal
du test ni TAP versé ne porte une valeur venue du fichier : une page qui échoue, ou qui écrit à la console, à `process.stdout` ou à `process.stderr` pendant
son rendu, est nommée sans son message, et la console et les deux flux sont comptés pendant le rendu, jamais écrits (V15-P7, C16-P5 ; arbres `ev-console` et
`ev-stdout` : le second test rougit, 0 marque au TAP, contre 2 sans la capture ; contrôle au plan, T13). SITE-BUILDING-PILL-STATES-1, le texte du CSS (prix
mesuré pour le CSS du site : 9 lignes de SBF ; déclencheur : la PR de L2) et ce que seul un navigateur montre : les états qu'un script atteint, une fonction
`render` qui lit l'état, une prop que Base UI calcule depuis l'état d'une partie (`aria-expanded`, `data-popup-open` d'un `Trigger`) ou pour `Portal`,
`Backdrop` ou `Popup`, un mot coupé par un élément ou par une balise vide que le CSS dote d'une boîte, un mot qu'un autre attribut dessine (`alt` d'une
image absente, `title` au survol) (prix estimé, non mesuré : plan, T13, 40 à 60 lignes de test, une à trois minutes de job ; déclencheur : la décision de
MONARK sur un navigateur de test, absent des dépendances). La pastille dit `building` avec la
classe de la pastille `upcoming`, `c-pill--upcoming` (`apps/site/app/globals.css:291-292` à `b44c3890` ; classe que `StatusBadge`
donne à `upcoming`, `apps/site/components/status-badge.tsx:12` à `b44c3890`) : même fond, même encre, même point creux, seul le mot
diffère ; sans troisième fichier (second pli, P4). Q-M13 ouverte : MONARK juge ce choix contre la parole du fondateur (`5471b92`
l.10) ; l'autre voie, une classe propre dans `app/globals.css`, coûte deux lignes et un fichier (V3). `AgentStatus`, `StatusBadge` et
le registre gardent deux valeurs.
*Condition* (`5471b92` l.21-23) : `building` n'est vrai que tant que l'item de construction de la jointure existe, ouvert ; l'entrée
N-14 du registre de Shōgen le nomme (§7.14, §10 ; Q-M11, tranchée (a) par MONARK avec la phase et le prix, `5ce6f27` l.137-139 :
le test exige aussi dans l'entrée la partie et sa fenêtre, `PXC-08 p<n> (F<n>)`, et un prix, `prix : <nombre>`), et un test neuf de L2
lie à cet item le statut du bloc et le schéma du README (plan, T13). Dans le même panneau, les « Honest limits » disent l'adaptateur aval
fait pour lire le nombre, la jointure en construction (T24, A45 : sinon le panneau se contredit). Les autres marques `upcoming` ne changent pas (`5471b92`
l.26), sauf celle de la relation de Bell, que Q-F1 (a) écarte (D-6). *Rejetées* : `upcoming` (contraire à A-1) ; élargir `AgentStatus` : deux coercitions
prouvent `FleetStatus` et `AgentStatus` identiques (`test/ci-gates.test.ts:1014-1015` à `b44c3890`), et `npm run typecheck` rougirait à la
seconde, sauf à ouvrir `building` aux statuts du registre, que A-1 ne vise pas, ou à changer le corps de
`fleet_register_built_set_is_frozen`, qui n'a pas de tueur (plan, T13) ; un `PanelBlock` typé `AgentStatus | "building"` (la forme du
premier pli) : une surface du registre qui rend un `PanelBlock`, comme `apps/site/components/what-inside.tsx:16` à `b44c3890`, pourrait
écrire `status="building"` en dur sans que le typecheck ni les gardes des statuts écrits en dur (`test/visage-register.test.ts:100`,
`test/ci-gates.test.ts:1089` à `b44c3890`) le voient (vérification courte du pli, P1) ; élargir ces gardes, ou déclarer la brèche en
limite, options (i) et (iii) de cette vérification.

**D-9. `fleet.ts:162` : l'id sort de la liste de Hikae.** Le test passe par `registry.run` sur un flux construit à la main
(`apps/harness/test/gate.test.ts:564-590`) : ce n'est pas un test d'intégration au sens CA-11 durci ; la classe stable-run reste rejouée
sur le vrai fil par `probe_harness_records_real_decision` (`test/h5-e2e-probe.test.ts:10`, `:115`, `:135`). *Précédent Shōgen* : les deux
tests unitaires de la jointure listés pour Shōgen (`fleet.ts:141-142`) relèvent de l'exception datée de Shōgen (CL l.35-40 ; REG Shōgen
N-16, l.409-415) et d'une décision de l'investisseur du 2026-10-03 (E l.2043-2047) ; ils ne portent aucune revendication de branchement
(la jointure est dite dormante, `fleet.ts:137`, `:143`) : aucune décision n'est demandée (A29 réfuté, §12). *Rejetée* : renommer la liste.

**D-10. README l.256 contre le schéma gelé.** Le README dit le vrai ; la description du contrat (`schemas/attested-book.schema.json:5`)
change avec PXC-16 p3 (C17, §6). Sous Q-F4 (a) (`5ce6f27` l.125-127), le README dit que le quorum compte l'opérateur à clé (T9) ; le
contrat le dira à PXC-16 p3.

**D-11. README l.61 et l.66** (A55 ; P-9 tranché ; Q-V3 (c)). Le chapeau devient `Everything below is live and machine-readable without an
account:` : il ne revendique plus le rejeu pour toute la table, et n'ajoute aucune capacité. La ligne Narabi de la table disait son lecteur
« Anyone replaying the tracker » (`README.md:66`) ; la réparation n° 1 la gardait parce que D8 et les recettes bornaient le rejeu, ce que
D8 ne faisait déjà plus (vérification A de la réparation n° 1, problème 2). Sous Q-V3 (c), aucune surface ne promet le rejeu : la ligne dit
`Anyone checking the windows and the hash chain` (T16).

**D-12. Recouvrements** [MONARK, tranché]. #244 est fusionnée : la re-mesure est faite à T (en-tête) ; #245 aussi : les ancres de registre sont
à `b7c2ba40` (A02). Ordre sur `fleet.ts` : le noyau, puis PXC-01, une PR à la fois (MSG3 l.15-16). I-G2-5 (l'ancien P-14) : posée à
MONARK après la v1 (`88430bd` l.49-51) et tranchée (b) par lui (`ba3dab6` l.8-16 ; E l.360-364) : re-port, avec le déclencheur « avant le
prochain envoi du site, au plus tard la publication seq 3 » ; sa lecture sur place passe avant l'envoi qui clôt O-1 (`32cf23d` l.27-28) (A51).

**D-13. Le cycle** (A65 ; au pli de la validation du fondateur : A-1 le touche, car le test neuf de L2 lit le registre de Shōgen ; A-2 non,
l'amendement n° 3 suit en parallèle sans retenir L1, `5471b92` l.47). Consultation d'advisor sur D-1 : retirée par MONARK (Q-M4 (b),
`e37f2a5` l.6-15 ; motif daté en en-tête) ;
Q-M1 tranchée, deux lots (D-3) ; cp-1, rendu ACCEPTE-AVEC-CORRECTIONS, corrections pliées (en-tête, « Pli du cp-1 ») ; validation du
fondateur, sur cet ADR seul (Q-M7 (a)), rendue avec deux amendements pliés en v10, et accord de la partie 1 (`5471b92` l.6-14, l.48) ;
vérification courte du pli par une instance neuve, pliée au second pli, empreinte neuve, relecture de MONARK (`5471b92` l.42-43) ; PR de
l'ADR au tronc, qui porte la v10, puis L1 (`5471b92` l.46) ; fichiers au TABLEAU ; PR de documents sur les registres (§10), sans l'item
de N-14, avant les PR du noyau (A47) ; L1 ; la PR de registres qui écrit à l'entrée N-14 de Shōgen l'item de construction de la
jointure (D-8, §7.14, §10), avant L2, jamais avant L1 : L1 n'attend pas l'amendement n° 3 (`5471b92` l.47) ; L2 ; chacun
fusionné avec son oracle G7 ; G2 de la partie par une instance neuve, les deux lots ensemble ; cp-2 ; G7. Les questions de valeur sont
tranchées (§8) : aucune n'attend plus dans ce cycle (`8e5bea2` l.19). L'ordre de la PR de registres qui écrit l'item de N-14, le même
au §7.14, au §10 et au plan (préalable 2), est une décision de la session PAROXYSME sous sa délégation technique (second pli, P2 ;
MONARK peut la renverser) ; motif : l'item tient son identifiant, sa place et son prix de l'amendement n° 3, qui ne retient pas L1.
*Fenêtre* (second pli, P3) : de la fusion de L1 à celle de L2, le README dit la jointure en construction (`being built`, `join
building`) et le test RDM l'épingle, mais aucun test ne lie encore ce statut à l'item (`5471b92` l.21-23) ; le test neuf arrive avec
L2, dont la fusion ferme la fenêtre (plan, T13). De la fusion de L1 à celle de la PR de registres qui écrit l'item, le registre du tronc
ne nomme pas encore l'item : il n'existe que dans cet ADR (§6, PXC-08 p2, F4, 12-14 j-h) et dans l'amendement n° 3 (V4).

**D-14. Le périmètre d'O-1** (`32cf23d` l.10 ; `d40ab57` l.22-24). *Entrent dans la partie 1* : Bell N-08 (T18) et M9 (T19) ; Ukemi E8 (T21)
et E12 (T22) ; Narabi T2 (T15), le texte de T10 (T16) et T12 (T17) ; et, par la G2, les phrases sœurs des mêmes pages (A09, A13, A45, A57,
A06). *Sortent* : Bell M5 et M6, Ukemi E9 (phrases de collecte gardées : engagements de O-3 et O-4). Ukemi E6 sort des PR du noyau (octet
servi, CC l.141-143) et reste dans O-1 : Q-M2 (b), décidée par MONARK (`e37f2a5` l.16), lot propre dans O-1, après le noyau, dû avant
l'envoi qui clôt O-1 ; porteur PAROXYSME ; prix estimé 0,25 j (REL-U l.87) + acte de release du fondateur. Prix :
cités ou estimés au §2, ligne par ligne. Sommes : le noyau de la v1, ≈ 1 j (PLAN l.528) ; entrées d'O-1 : 0,75 j cités (N-08 0,25,
INV-B l.128 ; I-G2-5 0,5, INV-B l.99) et 1,6 j estimés (M9 0,1 ; E8 0,25 ; E12 0,25 ; T2 0,8 ; T10 0,1 ; T12 0,1) ; sorties : M5, 0,25 j
cité (INV-B l.171), et M6, E9, 0,5 j estimés ; hors du noyau mais dans O-1 : E6, 0,25 j estimé. La proposition de `63eef32` l.68 comptait 1 j cité et 2,25 j
estimés, sorties comprises. *Entrent aussi, par les décisions du fondateur* (`8e5bea2` l.13-15 ; périmètre, `b03e434` l.6-9) : toutes les
surfaces du rejeu de Narabi (T16, Q-V3 (c)) ; le positionnement (T25), Q-V4 (d) : les dix endroits (`8e5bea2` l.15) ; l'épingle et son
tueur (`b03e434` l.8-9) ; six lignes de plus, Q-M8 (a), décidée par MONARK (`226d008` l.6-15) ; prix réestimés, environ 0,5 j et 0,75 j, estimés
(`80223c2` l.24, l.35) ; mesurés : 59 et 42 lignes de code, 4 et 6 de contenu (plan, R-25).

**D-15. La règle de texte de Bell sous son gel** (`32cf23d` l.18-20). Chaque phrase sur Bell que touche le noyau est retirée ou rendue
vraie à sa place ; aucune phrase n'est ajoutée : T10 et T20 (README ; à la l.299, la parenthèse sur Bell que le pli avait ajoutée est
ôtée, la phrase `hash-chained` tient seule : Q-M9 (b), décidée par MONARK, `cf0e079` l.6-7, l.18-19), T11 (README), T14 (relation,
`/applications` et `/docs/bell`), T18 (`/bell/method` l.604, une incise dans la phrase existante), T19 (`/applications`, le même point
réécrit), T25, surface par surface au gel : README l.17 (`The first built is MONARK Bell, which keeps its own gate;`), l.98 (`MONARK
Bell, its own gate`), l.211 (`built, served, its own gate`) et `app/layout.tsx:51` (`the first, MONARK Bell, keeps its own gate.`) disent
la porte de Bell ; `/docs/bell` l.59 dit `with its own gate`, sans `meant to power` ; `/applications` l.26 et l.64 disent le moteur `meant
to power` les applications et l.67 dit `A client is meant to install` : phrases de positionnement d'une page de Bell, qui ne nomment pas
Bell (vérification B de la réparation n° 2, règle tenue). La collecte de Bell n'est plus
sous le gel (`d40ab57` l.12-14) ; elle est hors de ce chantier (O-3).

**D-16. L'attesteur à clé réelle de Narabi, formé pour O-2** (`d40ab57` l.9-11). Item NARABI-K1 : remplacer `key: "deadbeef"`
(`apps/sentinel/src/flow.ts:52`) par une clé Ed25519 réelle, signataire séparé, selon l'ADR-K1 (statut « proposé (G0) », à reprendre) ;
porteur, fixé par cette ADR (`d40ab57` l.11) : PAROXYSME pour le code (lots K-1a), MONARK pour les actes d'hôte (K-1b), le fondateur
pour la clé (clés et comptes). Prix : 3-4 j-h pour K-1a en trois lots, estimation de CC l.164 et d'INV-N l.168 à partir de
`docs/adr/ADR-K1-attesteur-narabi.md:193-195` à T, qui ne donne pas ce total ; + 0,5 j de MONARK pour K-1b (ADR-K1:193) ; + 0,5 j de
rebase du gel K-1a (estimé, INV-N l.168 ; CC l.164) ; soit 4-5 j-h. NARABI-K1 est le titre du chantier PXC-03 (CC l.148), dont l'effort
entier est de 8-9 j-h (CC l.164). Déclencheur : le G0 de PXC-03 dans O-2. Quand la ligne publiée porte une attestation signée vérifiable, « attested » peut
revenir : les prémisses `deadbeef` des tests rougissent alors (D-2).

**D-17. I-G2-5 avant l'envoi du site** (`ba3dab6` l.13-16 ; `32cf23d` l.27-28 ; E l.360-364). MONARK lit sur place la documentation du
fournisseur (FAITS datés) ; puis la phrase de `/bell/method` l.563 est corrigée dans un lot hors des PR du noyau, sous D-15. Déclencheur :
avant le prochain envoi du site, au plus tard la publication seq 3 (`ba3dab6` l.14) ; la collecte de Bell n'est plus gelée (`d40ab57`
l.12-14) : seq 3 peut venir avant l'envoi qui clôt O-1. Porteur du texte : RECHERCHES ou le chantier de PAROXYSME (`ba3dab6` l.15) ;
PAROXYSME se propose, MONARK attribue. Prix : 0,5 j (INV-B l.99).

## 4. Les trois parties

- **Partie 1, le noyau (O-1)**, deux lots, deux PR (Q-M1 (a), D-3). *Périmètre* : les lignes `[P1]` du §2, tâches T1 à T25 du plan.
  *Fichiers* : les 41 de l'en-tête (39, et deux par A-1), liste fermée, et `test/test-counts.json` sous C-6 du cp-1 (plan, préalable 3).
  *Entrée* : tronc à jour ; ADR validée ; accord de partie (les questions de valeur sont tranchées, §8). *Sortie* : textes bornés,
  34 tests neufs (32, et deux par A-1) et 2 modifiés (CIG ; SBF, T25), l'amendement d'ADR-M012. *Critère
  falsifiable* : 36 tests jugés (34, et deux par A-1), chacun rouge à la base par assertion et vert au gel ; aucune phrase publique
  séparée n'est ajoutée : les clauses neuves bornent ou corrigent des phrases existantes, chacune avec son témoin au plan (« Vrai à T ») et son test ;
  c'est un écart déclaré à la lettre du critère du PLAN, « aucune phrase publique neuve » (PLAN l.675-676), conforme à son but (A25) ;
  `red-proof.mjs` sort 0 ; tueurs tirés tués ; campagne de mutants (89 lignes de table au gel de
  la v9, et celles de A-1 : plan, T13) sans
  survivant ; R-25 sous ≈ 1 150 lignes mesurées (porte CI 1 205) ; CI verte ;
  `git diff --name-only <base>...HEAD -- apps/harness apps/sentinel/src packages schemas` vide (le README de la sentinelle est le seul
  fichier sous `apps/sentinel`). *Fenêtre* : F1-F2, avant PXC-01. I-G2-5 (D-17) vient avant l'envoi, au plus tard la publication seq 3, qui
  peut précéder la fin de la partie 1 (`ba3dab6` l.14 ; `d40ab57` l.12-14) ; puis l'envoi du site et la release du miroir.
- **Partie 2** (A31). *Périmètre* : les lignes `[P2]` du §2 (dont l'ancienne PR 2 : C04, la phrase de Q-V2 (b), tranchée, et
  `piece-doc-page.tsx` ; C11, C12, C30) et les paquets exportés, le README du harnais, la skill ; l'item CIG-WIRING-COMMENT-1 (§7.8), au plus
  tard ; l'épingle de MK-L32 et MK-L33 (C38, X3 ; Q-M3 (a), `e37f2a5` l.17), en zone RECHERCHES. *Fichiers* : `README.md`, `package.json`,
  `apps/site/components/docs/piece-doc-page.tsx`, `apps/site/lib/ukemi-copy.ts`,
  `apps/site/lib/shogen-copy.ts` et SDT (Q-V2 (b)), `test/ci-gates.test.ts` (CIG-WIRING-COMMENT-1), `packages/{hikae,ukemi,contracts}/…`,
  `packages/monark/src/adapter-book.ts`, `apps/harness/README.md`, commentaires de `gate.ts` et `calibrate.ts`, `skills/monark/SKILL.md`,
  `deploy/Caddyfile.monark-harness`, `docs/adr/ADR-M020-programme-ukemi.md`, et leurs tests ; liste fermée à son plan. *Entrée* : ADR validée ;
  réponse à CX-07 ; DN-12 décidée (a) par MONARK (Q-M6, `e37f2a5` l.19) ; FAITS Caddy ; `gate.ts` après E-2a (W-1) ; pour l'épingle
  de C38 et X3, la zone ouverte chez RECHERCHES, que MONARK demande (Q-M3 (a)) : son entrée en dépend. *Critère* : chaque phrase bornée a son test
  jugé (nombre fixé à son plan), rouge à la base, vert au gel ; le test qui porte CIG-WIRING-COMMENT-1, `fleet_register_built_set_is_frozen`,
  F2P avec sa ligne `// killer:`, ou une épingle comptée à part (CA-13 bis, METHODE l.530-532) ; seuls des README, des commentaires et des
  textes changent sous `apps/harness`
  et `packages`, et une commande nommée montre les octets servis inchangés (`git diff --name-only` limité à des `*.md` et à des lignes de
  commentaire, plus la sortie de la CA) ; un octet servi qui bougerait sort vers son chantier (PXC-16 p3, PXC-12). *Fenêtre* : F3.
- **Partie 3**. *Périmètre* : `[P3]` du §2, pages Bell et Dōjō. *Fichiers* : `apps/site/app/bell/**`, `fleet.ts:350`, `apps/site/lib/dojo-copy.ts`,
  et leurs tests. *Entrée* : la partie 1 fusionnée ; DN-15 décidée (a) par MONARK (Q-M6, `e37f2a5` l.19). *Critère* : un test jugé par
  phrase bornée, rouge à la
  base, vert au gel ; aucune phrase neuve sur Bell (D-15). *Fenêtre* : F3-F4.

**Recouvrements** : `fleet.ts` et `README.md` avec PXC-01 (PLAN l.506) ; `skills/monark/SKILL.md` (T0, CC l.140) ; zone KATA en lecture seule ;
`gate.ts` en W-1 jusqu'à E-2a (PLAN l.501-502). **G2** : une par partie, après ses lots (décision 300) ; la partie 1 a deux lots, deux PR.

## 5. Tuyaux

Deux tuyaux, déclarés « à brancher » (A32) ; l'écart à « texte seul » (PLAN l.677-679) est dit ici et porté à MONARK, qui le tranche (a) (Q-M5, `e37f2a5` l.18).
1. **`connectsStatus`** : *entrée* le registre (`fleet.ts`) ; *sortie* la pastille de trois rendus servis (carte de `/applications`, `/docs/bell`, tableau
   d'accueil) ; *état* : dans le registre ; *test* : T14, au niveau du source et du registre, pas du HTML rendu (une regex sur le source ne prouve pas le
   branchement) ; *à brancher* : CONNECTS-STATUS-RENDER-1, étendre O-2 (`scripts/assert-fleet-html.mjs`, job `g3-site`, `.github/workflows/ci.yml:268-269` à
   `5e976a1a`) aux trois rendus ; porteur PAROXYSME ; déclencheur : la première PR de la partie 2 (F3) ; estimé 0,5 j. Septième pli (D-2) : la valeur
   `upcoming` de Bell n'entre plus (Q-F1 (a), D-6), et T14 sort de L1 par défaut (Q-M14 (a)) ; le tuyau suit le jugement d'usage : la valeur `built` par la
   construction, ou plus de tuyau si `connects` sort de la fiche de Bell ; CONNECTS-STATUS-RENDER-1 attend ce jugement.
2. **La jambe de Narabi `fromAttestedFlow` → porte** : *retirée* du registre ; *à brancher* : NARABI-ATTESTED-LEG-1, un appel servi depuis
   l'artefact publié, testé depuis lui, une fois l'attestation réelle (D-16) et l'acceptation par la porte d'un flux signé (N02,
   NARABI-GATE-SIG-1, PXC-03 p3) faites ; porteur PAROXYSME ; déclencheur : le G0 de PXC-03 p3, dans O-2 ; prix : N02 ≥ 2 j (INV-N l.197, estimé
   par l'inventaire) et l'appel servi, estimé 1 j.
Ne sont pas des tuyaux : l'envoi du site (RUNBOOK-vitrine), la release du miroir (PLAN l.888), la republication de la skill, actes du
fondateur.

## 6. Limites que le chantier laisse, en entrées

Chaque limite porte son item, son porteur, son déclencheur et son prix, cité ou estimé (A34) ; aucune n'est « à chiffrer ».
**A-2** (`5471b92` l.29-38) : aucune de ces limites n'est une fin. Chacune se construit avant la fin du chantier PAROXYSME ; d'ici là, le
texte borné est l'état intérimaire, et l'épingle de son test, qui rougit quand le code rend l'ancienne promesse vraie, est le signal de
fin. Le manque, la construction qui rend la promesse d'origine vraie, son item, son prix et sa place avant la fin du chantier sont à la
ligne de l'entrée dans l'amendement n° 3 de la feuille de route, écrit en parallèle (« → amendement n° 3 », en fin d'entrée) ; les
items, porteurs, déclencheurs et prix ci-dessous sont ceux de la v9. Une limite dont la promesse d'origine ne doit pas être construite y
est une question au fondateur, une par phrase, jamais un silence (`5471b92` l.35-36).
- *`line`, D8, mots « attested » du site, du README et de la skill* : la clé d'attesteur reste fictive → NARABI-K1 (D-16) · PAROXYSME, MONARK,
  le fondateur pour la clé · G0 de PXC-03 (O-2) · 4-5 j-h (D-16). → amendement n° 3.
- *note de Narabi (N03)* : la jambe flux → porte n'est pas servie → NARABI-ATTESTED-LEG-1 (§5) · PAROXYSME · G0 de PXC-03 p3 · ≥ 2 j (INV-N
  l.197) + 1 j estimé. → amendement n° 3.
- *le rejeu du traqueur de Narabi (Narabi L19 ; D8 et les trente et une lignes de T16 ; Q-V3 (c))* : `**` rend la valeur de la
  bibliothèque C de la machine (`0e66c86` l.12-17) ; l'écart est mesuré, un ULP dès t = 2466 sur le pas réel du traqueur (`dbe4915`
  l.10-14) → NARABI-POW-PORTABLE-1 (§7.8) : voie (ii), S4′, le calcul en entiers (PXC-04 p2 ; INV-N l.173), accordée par MONARK
  (`2f88fe7` l.6-7) ; la voie (i) n'est pas retenue · PAROXYSME · la partie 2 de PXC-04 (F3) · prix estimé : C 2,5 + R 1 j-h (INV-N l.172 ;
  CC l.193). Le test rouge vient avec la construction (`dbe4915` l.18-24). Les commentaires de `apps/sentinel/src/timeline.ts` l.4-5 et
  l.67 la suivent (Q-M10 (a), `cf0e079` l.10-13) ; prix : compris dans R (deux lignes de commentaire, à la PR de la construction). → amendement n° 3.
- *« code version » (témoin)* : le témoin ne couvre pas les paquets importés → SENTINEL-DEPLOY-GUARD-1 (PXC-05 p1, dans O-2 : E l.571-573 ;
  `d5553e7` l.32-33) · PAROXYSME · G0 de PXC-05 p1 · ≈ 2 j-h (PLAN l.718). → amendement n° 3.
- *README l.133-137, l.299, `/bell/method` l.604 (Bell)* : le collecteur n'est pas exporté → Bell L-31, PXC-11 p2-3 (A33 ; CC l.909 ;
  REG Bell L-31, l.302-307 ; la fiche ne nomme pas la partie, le registre la place par sa nature et l'ADR la fixe : REG Bell l.574-575,
  doute 9) · PAROXYSME ; release : le fondateur · parties 2-3 de PXC-11 (F3) · 2,5 j (INV-B l.108) ; l'empreinte de N-08 :
  BELL-COLLECTOR-REV-PUBLIC-1, 0,25 j (INV-B l.128). → amendement n° 3.
- *`connectsStatus` de Bell* : la relation n'est liée à aucun import → Q-V1 : lecture de MONARK, (a) pour le noyau (`2ed67d1` l.20-22),
  que le fondateur peut corriger (l.22) ; le vrai lien se construit s'il apporte un usage réel à Bell → chantier candidat PXC-19,
  BELL-INSTITUTIONAL-1 (`f392df8` l.20-21), où PAROXYSME le juge · PAROXYSME · la clôture du chantier PAROXYSME en cours · estimé ≥ 1 j
  (borne basse de la v3 : un import et un test d'intégration), chiffré par l'ADR de PXC-19 (`f392df8` l.37). → amendement n° 3.
  Sixième pli, Q-F1 (a) (`5ce6f27` l.115-118) : le jugement vient avant la fin du chantier, et avant L1 (BELL-CONNECTS-USE-1, D-6) ; la
  construction, s'il y a usage, avant la fin, dans le code de Bell (zone de MONARK) ; sinon le retrait du texte ; jamais `upcoming`.
  Septième pli : T14 sort de L1 par défaut (Q-M14 (a), D-6).
- *marquage `connectsStatus`* : épinglé au source, pas au HTML → CONNECTS-STATUS-RENDER-1 (§5) · PAROXYSME · partie 2 · estimé 0,5 j. → amendement n° 3.
- *README l.107, l.189, l.256* : le schéma gelé dit encore « keyless RPC quorum » → PX-Ukemi-20 (PXC-16 p3) · PAROXYSME · bascule 1.2.0 (F4) ·
  1 j (INV-U l.182, volet contrat). → amendement n° 3. Sous Q-F4 (a), le contrat dira, comme le README de T9, que le quorum compte
  l'opérateur à clé (`5ce6f27` l.125-127).
- *README l.258* : le contrat ne décrit pas le 500 du transport → TRANSPORT-ERROR-DEF-1 (PXC-16 p3) · PAROXYSME · bascule 1.2.0 (F4) · au plus
  0,6 j-h (INV-H l.36). → amendement n° 3.
- *README l.53-56* : le drapeau de dérive n'a aucun effet → CM-5-PLAN-1 (E l.984) ; PXC-10 · RECHERCHES ; PAROXYSME · PXC-10 p1 (F3) ·
  15-17 j-h pour PXC-10 (CC l.367). → amendement n° 3.
- *README l.33, l.205 ; panneau Shōgen ; DP:66* : la jointure attest → porte dort → PXC-08 · PAROXYSME · PXC-08 p2 (F4) ·
  12-14 j-h (CC l.308) ; A-1 : tant que cet item de construction est ouvert, nommé à l'entrée N-14 du registre de Shōgen, le bloc
  `How it works` est `building` (D-8 ; l'item est cette couture, côté MONARK, `39c0425` l.28-30) → amendement n° 3.
- *DP:61, :63, :70* : vrais jusqu'à la première ligne kata engagée → revue des mots à E-2a (prémisse du test) · PAROXYSME · E-2a · estimé 0,1 j.
  → amendement n° 3.
- *`README.md:35`, `fleet.ts:298`, `:316` (Ukemi E12)* : ce n'est pas une limite d'une pièce `built` : aucun lecteur de file de
  désendettement n'existe, et la phrase le dit au futur (`will read`) ; il appartient aux pistes Firebreak et Softlanding, `upcoming` au
  registre (`fleet.ts:296-300`, `:314-318`), dont la construction est hors du plan de route (PLAN l.281-283), une décision de produit.
  Porteur : le fondateur ; déclencheur : décision de produit sur Firebreak/Softlanding (PLAN l.281-283) ; prix : hors plan de route
  (cp-1, C-8). → amendement n° 3.
- *Shōgen N-04, Q-V2 (b), tranchée* (A40 ; `8e5bea2` l.12) : la phrase dit le capteur complet `meant to produce` ses témoignages, à l'essai
  et non servi, en partie 2 (estimé 0,25 j) → amendement n° 3. Le capteur complet appartient au projet Shōgen, hors du périmètre : la
  fin du chantier ne l'attend pas, et « à l'essai » reste vrai côté MONARK (`39c0425` l.14-15, l.19-20) ; sa part sort de l'amendement
  n° 3, qui ne garde que les lignes côté MONARK (`39c0425` l.25-27).
- *Parties 2 et 3* (A12 ; vérification C, problème 8). Minuterie de Bell N-03 → BELL-COLLECT-TIMER-1, dans O-3 (PXC-14 p3 ramenée en
  tête) · PAROXYSME ; le fondateur pour la clé ou le compte RPC de la collecte (REG Bell N-03, l.416-422) · le G0 de O-3, qui peut partir
  dès maintenant (`d40ab57` l.12-14 ; le registre dit encore le déclencheur conjonctif de T1B) · ≥ 3 j (INV-B l.123, CC l.475).
  Construction de PX-Bell-17 → PXC-07 p3 · PAROXYSME · partie 3 de PXC-07, F5 (REG Bell PX-Bell-17, l.370-375) · 1 j + mesure (INV-B l.119).
  `hac-cp` de Hikae L19 → MK-L33 : l'épingle « jamais produit » gardée dans PXC-02, partie 2, zone ouverte chez RECHERCHES (X3 ; Q-M3
  (a), `e37f2a5` l.17), l'élagage à PXC-16 p3 (REG Harnais MK-L33, l.490-493) · PAROXYSME · épingle : partie 2 ; élagage : bascule 1.2.0,
  F4 · 0,5 (INV-M l.241). MK-L32 → ERROR-ORDER-SPEC-1, à former (publier l'ordre des contrôles, PXC-16 p3),
  épingle gardée dans PXC-02, partie 2, zone ouverte à demander à RECHERCHES par MONARK (Q-M3 (a), `e37f2a5` l.17) · PAROXYSME
  (REG Harnais MK-L32, l.485-489 ; INV-M l.241 disait MONARK) · bascule 1.2.0 ou révision datée, F4 · 0,5 (INV-M l.241). → amendement n° 3.
- *commentaire de `CIG:1100`* (A53 ; vérification B, problème 1) : ses comptes par pièce sont faux en partie à T (Shōgen, Ukemi ; Bell
  tu) et tous faux au gel (vérification A de la réparation n° 1, problème 11), et le noyau ne peut pas le corriger sans rendre jugé un
  test qui n'a pas de tueur → CIG-WIRING-COMMENT-1 (§7.8) · PAROXYSME · la première PR qui rend ce test jugé, au plus tard la PR de la
  partie 2 de PXC-02 (§4, partie 2) · estimé 0,25 j. → amendement n° 3.

Aucun texte neuf du noyau n'emploie les formules que vise la règle PAROXYSME (CL l.45-47) : recherche `grep -n -i -e 'aucune borne' -e
'hors théorie' -e 'non couvert' -e 'résiduel accepté' -e 'troisième voie'` sur les lignes neuves du gel, vide ; les phrases anglaises neuves
passent `scripts/grep-forbidden.mjs` (plan, annexe B).

## 7. Items à former à ETAT, lignes proposées à MONARK

MONARK écrit les lignes ; texte proposé entre “ ”, tel quel, sans apostrophe comme ETAT (les « » restent pour les citations).
**A-2** (`5471b92` l.29-38) : un item dit *clos par la PR du noyau* est un item de texte, et sa limite reste. Le texte borné est l'état intérimaire,
l'épingle de son test le signal de fin, et la construction qui rend la promesse d'origine vraie, avec son item, son prix et sa place
avant la fin du chantier PAROXYSME, est à la ligne de la phrase dans l'amendement n° 3 de la feuille de route (§6).
1. “SENTINEL-DEPLOY-GUARD-1 : déjà re-porté à PXC-05 p1 dans O-2 (E l.571-573). Le noyau de PXC-02 dit sur `/narabi` que `sentinel_sha` ne
   hache que les sources de premier niveau (`run.ts:156-160`) ; aucune ligne neuve.”
2. “NARABI-K1 (PAROXYSME, ADR PXC-02 D-16 ; décision du fondateur du 2026-10-08, Q-A.2 maintenue) : attesteur à clé réelle de Narabi à la
   place de `deadbeef` (`apps/sentinel/src/flow.ts:52`), selon ADR-K1. Porteur : PAROXYSME (code), MONARK (hôte), le fondateur (clé) ;
   déclencheur : G0 de PXC-03 dans O-2 ; prix : 4-5 j-h (K-1a 3-4 ; K-1b 0,5 ; rebase 0,5 estimé ; CC l.164, INV-N l.168) ; état :
   ouvert.”
3. “S4′ (PAROXYSME, ADR PXC-02 ; PXC-04 p2) : rejeu du traqueur indépendant du moteur, par le calcul en entiers ; c est la voie (ii) de
   NARABI-POW-PORTABLE-1 (§7.8). Jusque-là, aucune surface ne promet le rejeu (Q-V3 (c), décision du fondateur du 2026-10-08, eb01d45
   l.44-45 et 8e5bea2 l.13 : aucune promesse de rejeu tant que la lecture n est pas faite, puis (a) si elle confirme ; elle ne confirme
   pas, 0e66c86 l.9-17 ; MONARK : la promesse revient en (a) après l une des deux constructions, 0e66c86 l.19). Porteur : PAROXYSME ;
   déclencheur : PXC-04 p2 (F3) ; prix estimé : C 2,5 + R 1 j-h (INV-N l.172 ; CC l.193) ; état : ouvert.”
4. “BELL-CONNECTS-WITNESS-1 (PAROXYSME, ADR PXC-02 D-6) : volet (a) non clos par un marquage : le fondateur, Q-F1 (a), le 2026-10-14 (`5ce6f27` l.115-118),
   veut le jugement d usage d abord et aucune marque upcoming sur le nouveau Bell ; le volet passe à BELL-CONNECTS-USE-1 (PAROXYSME ; prix estimé, non
   mesuré : 0,25 j ; déclencheur : avant la PR de L1) : s il sert Bell, la construction avant la fin du chantier PAROXYSME, dans le code de Bell, par une
   ligne de zone que MONARK valide ; sinon le retrait de la ligne Connects et de la phrase que T11 retire ; T14 hors de L1 (Q-M14, défaut (a)). Volet (b) :
   Q-V1 de PXC-02 tranchée par le fondateur le 2026-10-08 (`2ed67d1`), lecture de MONARK corrigée par Q-F1 (a). Prix : celui de BELL-CONNECTS-USE-1 ; état :
   ouvert.” Le septième pli récrit cette ligne (D-2 de la vérification du sixième) ; celle d'avant reprenait `b75f575` l.40-42, que Q-F1 (a) renverse.
5. “README-CONTRACT-COUNT-1 : clos par la PR du noyau, test `readme_counts_the_frozen_contracts`. Prix : 0,1 (INV-M l.241).”
6. “NARABI-REGISTER-NOTE-1 : la note de Narabi ne dit plus la seconde jambe rejouée par un test d intégration ; elle la dit `upcoming`
   (`the sentinel does not call the gate`) ; clos par la PR du noyau, test `narabi_wiring_declares_the_attested_flow_leg_upcoming`.
   Prix : 0,25 j (INV-N l.198).” (A35, A54)
7. “BELL-README-REPLAY-1 : le README borne Bell à ce que fait le vérificateur exporté ; clos par la PR du noyau, test
   `readme_bell_is_checked_not_rebuilt_while_its_collector_is_outside_the_export` ; reste : l export du collecteur, Bell L-31, PXC-11 p2-3,
   2,5 j (INV-B l.108). Prix : 0,25 j (INV-B l.172).”
8. Items d'O-1 clos par les PR du noyau (chacun par le lot qui porte sa phrase), à former en même temps (prix estimés, REL-B, REL-U,
   REL-N) : NARABI-ATTESTED-WORDS-1 (Narabi T2, 0,8 j) ; NARABI-SLOTS-TEXT-1 (T12, 0,1 j) ; BELL-INSIDE-GAP-TEXT-1 (M9, 0,1 j) ;
   UKEMI-CASCADE-TEXT-1 (E8, 0,25 j) ; UKEMI-READER-TEXT-1 (E12, 0,25 j). Ouverts, avec leur prix au §5 et au §6 :
   NARABI-ATTESTED-LEG-1 ; CONNECTS-STATUS-RENDER-1.
   Ouvert, neuf (réparation n° 1 ; A53 ; vérification B, problème 1) : “CIG-WIRING-COMMENT-1 (PAROXYSME, ADR PXC-02) : le commentaire de
   `CIG:1100` dit « Hikae 3, Narabi 2, Shōgen/Ukemi 1 ».
   À T, Shōgen en a 5 (`fleet.ts:142`) et Ukemi 2 (`fleet.ts:187`) ; le bloc parcourt aussi MONARK Bell, 3 (`fleet.ts:360` ; CIG:1114-1119),
   que le commentaire tait ; au gel, Hikae en a 2 et Narabi 1 (`fleet.ts`, l.161-164 et l.222-224 du gel) : aucun compte n y est juste.
   La correction va dans la première PR qui rend jugé `fleet_register_built_set_is_frozen` (CIG:1010), avec sa ligne `// killer:` ; ce
   test y est F2P, ou une épingle comptée à part (CA-13 bis, METHODE l.530-532). Porteur : PAROXYSME ; déclencheur : cette PR, au plus
   tard la PR de la partie 2 de PXC-02 ; prix : estimé 0,25 j (le commentaire, la ligne de tueur, une assertion des comptes) ; état : ouvert.”
   Ouvert, neuf (réparation n° 2 ; nommé par MONARK, `0e66c86` l.24-25 ; voie (ii) accordée, `2f88fe7` l.6-7) : “NARABI-POW-PORTABLE-1 (PAROXYSME,
   ADR PXC-02 D-7 ; limite Narabi L19) : sous Node 24.21.0, `**` rend la valeur de la bibliothèque C de la machine, et la spécification ne fixe pas
   le résultat ; trois séries d un million de cas, le pas réel du traqueur compris, rendent des empreintes différentes sous Linux et sous Windows ;
   premier cas t = 2466, un ULP. Construction : voie (ii), S4′, le calcul en entiers (PXC-04 p2), accordée par MONARK ; la voie (i) n est pas
   retenue. Le test rouge vient avec la construction et porte t = 2466. Jusque-là, aucune surface ne promet le rejeu (Q-V3 (c)). Rattachés (Q-M10
   (a), MONARK) : les commentaires de `apps/sentinel/src/timeline.ts` l.4-5 et l.67, rendus vrais ou corrigés avec la construction ; le fichier
   reste à l octet jusque-là ; prix : compris dans R (deux lignes de commentaire, à la PR de la construction). Porteur : PAROXYSME ;
   déclencheur : la partie 2 de PXC-04 (F3) ; prix estimé : C 2,5 + R 1 j-h (INV-N l.172 ; CC l.193) ; état : ouvert.” Sources de la
   ligne : `0e66c86` l.9-25 ; `0eb8942` l.6-21 et la pièce `coordination/pieces/2026-10-08-pow-portable/pow-digest.mjs` ;
   `dbe4915` l.6-27 ; `2f88fe7` l.6-7 ; `cf0e079` l.8-13. L'item est inscrit à ETAT : ETAT l.735-746 à `2c3f51a8` (et l.783-785,
   l.822-824 ; `git -C <clone> show 2c3f51a8:docs/ETAT.md | cat -n`) ; « L19 mesurée » est au registre de Narabi depuis #253
   (`docs/PAROXYSME-Narabi.md` l.43 à `2d37851b`, l.229-236 ; fichier inchangé jusqu'à `2c3f51a8`).
   Écarts entre la ligne proposée ici et ETAT : (1) ETAT garde la voie (i) en alternative, « ou plate-forme et » (ETAT l.736 à `2c3f51a8`),
   que la ligne proposée dit non retenue (`2f88fe7` l.6-7) ; (2) ETAT dit « Q-V3 bascule en (a) à sa » clôture (ETAT l.737 à `2c3f51a8`),
   ce que la ligne proposée laisse à D-7 ; (3) ETAT ne dit pas le prix des deux commentaires de `timeline.ts` (ETAT l.783-785 à
   `2c3f51a8`), que la ligne proposée dit compris dans R. Le reste concorde : porteur, déclencheur, prix C 2,5 + R 1, t = 2466, le test
   rouge avec la construction. Une correction d'ETAT, s'il en faut une, est à MONARK (D6) ; cette ligne ne recopie pas ETAT.
9. **Ligne datée nommant T0** (D-2) : “Ligne datée 2026-10-08 (PAROXYSME, ADR PXC-02) : à T0 (2026-10-06, actes 1 à 6, tronc `9612d4d2`,
   JOURNAL-PROVENANCE l.445), la sentinelle tournait dans l arbre déployé (`deploy/monark-sentinel.service:18`, `:39`, inchangé depuis
   `9612d4d2`) ; le témoin `sentinel_sha` ne couvre pas les paquets importés : le déploiement de T0 a changé 18 de leurs fichiers
   depuis `c9aebb44` sans que `sentinel_sha` bouge (Narabi H5, E l.495-497) ; depuis T0, le diff des sources de la fermeture est vide.” (A36)
10. **Demandes de lecture à MONARK**, formées aux champs de METHODE l.755-756 (vérification C, problème 10) ; porteur MONARK. La (a) est
    rendue : MONARK a lu les pages primaires de 09:56 à 10:04 UTC et en donne les extraits (`0e66c86` l.6-17) ; son fichier de faits est
    hors dépôt. La (b) suit (`0e66c86` l.30).
    (a) *Source* : ECMA-262, 17ᵉ édition, Ecma International, comité TC39 (CC l.1177 : « ECMA-262 17ᵉ éd. »), les clauses de `Math.pow`
    (la section `Math.pow` : 21.3.2, sous-section 27) et de l'opérateur `**` (§6.1.6.1.3) ; V8 tel que l'embarque Node 24.21.0,
    13.6 (build 233, révision 17), fichiers `src/numbers/ieee754.cc`
    et `src/flags/flag-definitions.h` (`0e66c86` l.9-15 ; vérification A de la réparation n° 1, problème 10). *Rendu* : la spécification
    laisse le résultat à l'implémentation, et V8 appelle le `std::pow` de la bibliothèque C (`0e66c86` l.9-17) ; Q-V3 reste (c) (D-7).
    *Question* : pour les mêmes opérandes, la spécification fixe-t-elle le résultat de `**`
    et de `Math.pow`, ou le laisse-t-elle à l'implémentation ; sous une même version de Node, V8 rend-il le même nombre sur toute machine ?
    *Usage* : trancher Q-V3, la clause de D8 et les recettes du README (D-7 ; PLAN l.544). *Extrait voulu* : la phrase de la clause qui
    dit comment le résultat est obtenu, 25 mots au plus ; pour V8, le nom de la fonction qui le calcule.
    (b) *Source* : l'annonce du Dōjō sur X, publiée depuis le 1er octobre, à lire dans la session de l'investisseur, où elle se trouve ; son
    adresse est à relever par MONARK, qui la lit (INV-D l.382 ; DOJO-X-TEXT-READ-1, 0,1) ; le post X qui reprend `shogen-copy.ts:9-10`
    (CC l.1175 ; REG Shōgen N-04, l.339-344). *Question* : que disent-ils mot pour mot, à quelle date, et une phrase y dit-elle plus que ce
    que le Dōjō ou Shōgen sert ? *Usage* : appliquer DN-13 (b), tranchée (`8e5bea2` l.16-17) : corriger seulement une phrase fausse, la
    publication restant un acte du fondateur (A14, A40). *Extrait voulu* : pour chacun, la phrase qui dit ce que la pièce fait, 25 mots au plus.
11. **Pour MONARK** [MONARK], Q-M6 (a) et (a), décidées par MONARK (`e37f2a5` l.19) : README-DOJO-MATURITY-1 (DN-12, une ligne
    `upcoming`, 0,1, INV-D l.381) ; DOJO-COPY-HOLDERS-MISSING-DAY-1 (DN-15) : ligne d'attente datée, nouveau déclencheur “partie 3 de
    PXC-02, après le lot de la page Dōjō”, porteur PAROXYSME, prix 0,1 (INV-D l.384) (A15).
12. **Cartographie** (A46) : erratum de la ligne P-N4 de `docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md:182` (« câblé » pour la jambe de
    Narabi) ; porteur MONARK ; déclencheur : avant la première PR de PXC-01 (CL l.31-33).
13. **D-1** : aucune ligne ; la ligne de Q-A.2 est déjà corrigée (E l.49-53) et la décision du 2026-10-08 est inscrite (E l.513-516).
14. **A-1, l'item de construction de la jointure de Shōgen** (D-8 ; `5471b92` l.21-23) : le statut `building` du bloc `How it works`
    n'est vrai que si cet item existe, ouvert, avec son chantier (PXC-08, partie 2, au §6), sa place et son prix (amendement n° 3).
    L'entrée N-14 du registre de Shōgen le nomme, avec sa partie, sa fenêtre et son prix, par la PR de registres qui l'écrit (§10),
    avant L2, jamais avant L1 (D-13 ; Q-M11, tranchée (a), phase et prix, `5ce6f27` l.137-139), sous la forme exacte que le test lit (septième pli, D-6) :
    une ligne de l'entrée porte `PXC-08 p2 (F4)` (la partie, puis la fenêtre ; motif `\bPXC-08 p\d+ \(F\d\)`), une autre `prix : 12-14 j-h` (motif `\bprix :
    \d` ; la valeur du §6), et une ligne en retrait `état : ouvert` ; l'idiome du registre, partie 2 de PXC-08 (F4), ne passe pas le premier motif ; le test
    `shogen_how_it_works_is_building_only_while_its_construction_item_is_open` la lit (plan, T13). Sa ligne d'ETAT est celle que
    l'amendement n° 3 forme ; aucune ligne neuve ici.

## 8. Décisions de valeur (CA-2)

**Tranchées par le fondateur**, avec leur source : Q-A et Q-A.2 (E l.49-53) ; Q-A.2 maintenue (`d40ab57` l.9-11) ;
« on laisse built, mais on la BUILD, on en change pas le texte, on change l était du chantier de la piéce, on la battit. » (`47ef84d` l.27) ; le go d'envoi du
site, après O-1 et I-G2-5 (`47ef84d` l.25 ; E l.489) ; Q-C, trois parties (E l.53) ; le budget sans plafond (`47ef84d` l.23) ; la jambe payante réarmée
(`4f8e42f` l.13). Puis, le 2026-10-08, les cinq questions de cet ADR, posées par `eb01d45` et relayées par MONARK :
- **Q-V1** (D-6 (b), relation de Bell), vers 09:4x UTC (`2ed67d1` l.6-12) : « construire le vrai lien, ce qui demande du travail en plus »
  (l.8), un vrai usage pour Bell, « pas pour un ornement » (`2ed67d1` l.9). Lecture de MONARK (`2ed67d1` l.16-22) : le vrai lien se construit s'il
  apporte un usage réel à Bell, et PAROXYSME le juge dans l'ADR de PXC-19 (l.11, l.16-17 ; `f392df8` l.20-21) ; pour le noyau, MONARK
  retient l'option (a), la relation marquée à venir, sans autre promesse (l.20-21) ; le fondateur peut corriger cette lecture (l.22). La
  PR du noyau n'attend plus.
- **Q-V2** (Shōgen N-04), vers 09:5x UTC, comme les trois suivantes (`8e5bea2` l.6-17) : **(b)** ; le capteur complet est dit fait pour
  produire ses témoignages, à l'essai, pas encore en service (`8e5bea2` l.12), en partie 2 (C04).
- **Q-V3** (D8 et toutes les surfaces du rejeu) : **(c), puis (a) si la lecture confirme** (`8e5bea2` l.13-14). Appliquée au périmètre
  vrai que MONARK confirme (`b03e434` l.6-7) : aucune surface ne promet le rejeu (D-7 ; plan, T16). La lecture est faite et ne confirme pas
  (a) : la bascule attend NARABI-POW-PORTABLE-1 (D-7, §7.8). Le défaut sans réponse, (b), est sans objet.
- **Q-V4** (positionnement) : **(d)** : les dix endroits (`8e5bea2` l.15) ; l'épingle de SBF:1171-1172 récrite et son tueur neuf, 34
  tests jugés (`b03e434` l.8-9) ; six lignes de plus, Q-M8 (a), décidée par MONARK le 2026-10-08 vers 11:3x UTC, en exécution de la
  décision du fondateur, non une décision neuve du fondateur (`226d008` l.6-15) : tous bornés dans la PR du noyau (D-4 ; plan, T25).
  Le défaut sans réponse, (a), est sans objet ; rien ne se contredit à l'envoi.
- **DN-13** (texte X du Dōjō, C31) : **(b)** (`8e5bea2` l.16-17) : le texte est corrigé seulement si la relecture de MONARK y trouve une
  phrase fausse ; la publication reste un acte du fondateur. MONARK demande le texte et sa source (l.17) ; sa lecture (b) suit (§7.10).
- **La validation de cet ADR, avec deux amendements de valeur**, le 2026-10-08 vers 16:1x UTC (`5471b92` l.6-14 ; la phrase du fondateur,
  mot pour mot (`5471b92` l.10-12), et A-1 et A-2 tels que MONARK les tire : en-tête, amendement daté v10). **A-1** : Shōgen « building », pas « upcoming » :
  le bloc `How it works` prend la troisième valeur, vraie tant que l'item de construction de la jointure est ouvert, et un test lie le
  statut à cet item ; les autres marques `upcoming` ne changent pas (`5471b92` l.16-27 ; D-8), sauf celle de la relation de Bell, que
  Q-F1 (a) écarte (D-6). **A-2** : chaque manque se construit avant
  la fin du chantier PAROXYSME ; une phrase bornée est un état intérimaire, l'épingle de son test le signal de fin ; chaque phrase bornée
  et chaque entrée du §6 ont leur ligne dans l'amendement n° 3 de la feuille de route ; une promesse d'origine à ne pas construire est une
  question au fondateur, une par phrase (`5471b92` l.29-38 ; §6, §7). L'accord de la partie 1 est tenu pour donné, dans ces limites
  (`5471b92` l.48).
- **Les questions de l'amendement n° 3**, posées par MONARK le 2026-10-14 et relayées mot pour mot (`5ce6f27` l.110-132) : **Q-F1 (a)**,
  le jugement d'usage d'abord, la construction avant la fin s'il sert Bell, sinon le retrait de « Connects » et de « derived from the
  same gate », et « il n y aura pas de upcoming sur le nouveau BELL » (l.115-118 ; C26, D-6) ; **Q-F2 (b)**, les lecteurs de Firebreak et
  de Softlanding hors du chantier, la phrase au futur vraie (l.119-120) ; **Q-F3 (b)**, contre la recommandation (a) : la dépense de
  `B_t` reste un item de TYCHO, déclencheur sa reprise, aucune phrase publique sur `B_t` ni le jeton avant CX-07, et le README
  l.262-264 ne change pas ici (l.121-124 ; C11) ; **Q-F4 (a)**, « Dans
  le vote », contre la recommandation (c) : le quorum compte un opérateur à clé (l.125-127 ; C17, T9) ; **Q-F5 et Q-F6**, réglées en
  substance par la décision du 2026-10-08 sur le périmètre de Shōgen (l.128-129 ; C04) ; **Q-F7 (a)**, les quatre champs, à construire
  par HARNESS-ACCESS-LOG-FIELDS-1 (PXC-18 p1), le déploiement restant un acte avec go du fondateur (l.130-132 ; C35).
MONARK ne repose pas Q-V3 et Q-V4, élargies, au fondateur : ses décisions portent sur le sens (`b03e434` l.11-12). Le fondateur a aussi
donné un but pour MONARK (`8e5bea2` l.21-26) ; il ne change aucune règle de cet ADR et va au plan de route, hors de ce dossier.

**Tranchées par MONARK** (délégation D4 ; texte dans `QUESTIONS.md`) : Q-M1 (a), la partie 1 en deux lots de 547 lignes de code au plus
(`5fc2d0c` l.6-22 ; D-3) ; Q-M8 (a), les six lignes de positionnement dans T25 (`226d008` l.6-15), en exécution de la décision du
fondateur sur Q-V4 (`226d008` l.13-15) ; Q-M9 (b), la parenthèse sur Bell ôtée de README l.299, et Q-M10 (a), l'amendement daté
d'ADR-M012 étendu à D4 et à l.157, les commentaires de `timeline.ts` rattachés à NARABI-POW-PORTABLE-1 (`cf0e079` l.6-13), en exécution
de la phrase de MONARK « le rejeu exact ne se promet nulle part » (`b03e434` l.7) et de sa règle sur le gel du texte de Bell
(`32cf23d` l.18-19) (`cf0e079` l.18-19 ; vérification courte du pli final, constat 1).
Puis, le 2026-10-08, sur les questions ouvertes de cet ADR (`e37f2a5` l.6-22, commit de 13:26:03 UTC ; texte et décisions mot pour mot
dans `QUESTIONS.md`) : **Q-M2 (b)**, Ukemi E6 en lot propre dans O-1, après le noyau (§2, D-14) ; **Q-M3 (a)**, l'épingle de MK-L32 et
MK-L33 en partie 2, zone ouverte chez RECHERCHES (C38, X3, §4) ; **Q-M4 (b)**, contre la recommandation de PAROXYSME : la consultation
d'advisor est retirée (en-tête, D-13) ; **Q-M5 (a)**, CONNECTS-STATUS-RENDER-1 « à brancher » (§5) ; **Q-M6 (a) et (a)**, DN-12 et DN-15
(C30, C32, §7.11) ; **Q-M7 (a)** [méthode ; A42] : « Le fondateur valide l ADR seule, comme METHODE l.259. Les autres textes neufs
passent par l accord de la partie 1. » (`e37f2a5` l.20). La validation porte donc sur cet ADR et sur les textes publics qu'il cite mot
pour mot (D8, DP:69, DP:70, le chapeau de README l.61, `is meant to be put to work on`, la phrase de Q-V2 (b) (C04), le texte de D-11
`Anyone checking the windows and the hash chain`, le moteur `meant to power` ; vérification A de la réparation n° 1, problème 9 ;
vérification A de la réparation n° 2, problème 6) ; les autres textes neufs, au plan, passent par l'accord de la partie, dont l'entrée
est « le plan accepté au cp-1 » (METHODE l.286).
Puis, le 2026-10-13 (`c2c9410` l.20-30) : **Q-AM3-6 (b)**, C04 reste sortie, sa part MONARK portée par N-04 (C04) ; Q-259-1, Q-PAUSE-1
et Q-BR-5 à Q-BR-7 ne touchent pas cet ADR. Et le 2026-10-14 (`5ce6f27` l.137-143) : **Q-M11 (a), avec la phase et le prix** : le test
de A-1 lit l'entrée N-14 de `docs/PAROXYSME-Shogen.md` et exige aussi sa partie et sa fenêtre et son prix (D-8 ; plan, T13 ; au
prototype, une ligne changée, R-25 + 0) ; **Q-M12 (b), à une condition** : la phrase « being built » de la jointure est déjà au tronc
public par L1. Aujourd'hui elle ne l'est pas : L1 n'est pas fusionnée, et la seule occurrence servie de « being built » au tronc est
le titre de `apps/site/app/roadmap/page.tsx:219` à `8400a223`, qui ne porte pas sur la jointure (l.141-142) ; deux commentaires
(`apps/site/components/site-header.tsx:26-27`) et `test/site-docs.test.ts:497`, à `8400a223`, portent aussi les mots, non
servis (D-5). Il en découle : rien ne s'aligne
avant la fusion de L1 ; L2, qui vient après elle (D-13), aligne les autres lignes « dormant » de la jointure (`apps/site/lib/fleet.ts:135`,
`:137`, `:143` ; `apps/site/app/roadmap/page.tsx:159` ; `apps/site/lib/docs-pieces.ts:39`, égales à `8400a223`) et leurs épingles de SDT
(`test/site-docs.test.ts:608`, `:618-619`, `:800`, `:818`, `:821` à `8400a223`), si L1 est au tronc à l'ouverture de la PR de L2 ;
prix mesuré au prototype (`v16-run/tmp/v16/m12.py`, `count.sh` ; au septième pli, `v17-run/tmp/v17/m12-v17.py`, mêmes comptes,
textes au plan, T13, sans durée affirmée, D-5) : + 22 lignes, dont 18 de code (`fleet.ts` 6, SDT 12) et 4 de
contenu (`roadmap/page.tsx` 2, DP 2) ; le README du harnais (`apps/harness/README.md:24` à `8400a223`) suit la partie 2 ; la
provenance de la fixture h5 (SDT:824) garde son mot, hors de Q-M12.

**Ouvertes**, en questions fermées (forme : METHODE l.757 ; A40) ; le détail et le texte des options sont dans `QUESTIONS.md` :
- **CX-07** (texte `B_t`, C11) : oui ou non, posée par le PLAN (l.889) sans défaut ni conséquence écrits (A41) ; à poser avant la release de
  textes servis. **P-79** (README l.179-180) : question au fondateur, échéance PXC-01 p3 (PLAN l.889) (A41). **Q-H1** (X5) : sans porteur ni
  échéance au PLAN (A41) ; MONARK la pose avec HARNESS-VERSION-ALIGN-1.
- **Q-M13** (l'aspect de la pastille `building`) reste posée à MONARK (`QUESTIONS.md`) ; elle ne touche que L2. Q-M11 et Q-M12 sont
  tranchées (ci-dessus).
- **Q-M14** (T14 dans L1 ; D-6) et **Q-M15** (T18 et la minuterie de Bell ; plan, préalable 4), posées à MONARK au septième pli
  (D-1, D-3) : le plan porte leur défaut (a), qui tient sans décision neuve.
- Aucune autre question de MONARK n'est ouverte : Q-M1 à Q-M12 et Q-V15-1 sont tranchées (ci-dessus ; `QUESTIONS.md`). Q-M7 était posée parce
  que le pli avait tranché seul la portée de la validation (vérification C, problème 4) ; elle est tranchée (a).

## 9. Modes d'échec MAST et contre-mesures

La taxonomie est celle de Cemri et al., *Why Do Multi-Agent LLM Systems Fail?*, arXiv:2503.13657, lue dans sa v3, révisée le 2025-10-26 :
page abs et résumé relus ici le 2026-10-08 [lu] ; figure 1, p. 2, et annexes A.1 et A.3 [lu] par un lecteur (`LECTURE-MAST.json` de la
pièce). Trois catégories : « system design issues », « inter-agent misalignment », « task verification » (résumé de la v3). La
terminaison n'y est pas un libellé de catégorie : elle est répartie entre FM-1.5, « Unaware of Termination Conditions » (catégorie 1), et
FM-3.1, « Premature Termination » (catégorie 3) (figure 1). Les libellés ont changé : en v1, la catégorie 1 est « Poor Specification » et
le résumé nomme la 3 « task verification and termination » ; en v2, la 1 est « Specification Issues » (lecteur : résumés et quatre
premières pages de la v1 et de la v2). DOC06 l.82 [lu] rapporte la même taxonomie (cp-1, C-5).
- (1) une phrase bornée à un endroit, laissée fausse ailleurs → les occurrences relevées (§2 ; REL-N T2 ; G2), un test par surface.
- (1) une borne vraie aujourd'hui, fausse quand l'item arrive → une prémisse par test, sur le code (D-2).
- (1) « upcoming » pour une jambe confondu avec le statut de la pièce → forme (2) écrite, formes rejetées et leur raison (D-1).
- (2) deux sessions éditent le même fichier → ordre fixé (MSG3 l.15-16) ; liste fermée au TABLEAU.
- (2) une décision recopiée sans la confronter à la source → errata (P-1, A21, A27, A49) ; ancres relues à leur tête.
- (2) une décision de valeur prise par l'exécutant au moyen d'un défaut ou d'un test codé (A44) → les cinq questions de valeur posées au
  fondateur avant tout code, puis tranchées par lui (`8e5bea2` l.12-17 ; `2ed67d1` l.8-12, lu par MONARK l.16-22) ; le code suit ses
  décisions, au périmètre que MONARK confirme (`b03e434` l.6-9) ; un élargissement trouvé ensuite se nomme ligne par ligne et part en
  question avant d'être appliqué (P-24 ; `226d008` l.17-18) : les six lignes de Q-V4, d'abord écrites comme couvertes, ont été posées à
  MONARK (Q-M8, `315ce29` §2) et tranchées par lui (`226d008` l.6-15) ; aucun défaut codé ne décide, les défauts de Q-V3 et Q-V4 sont sans objet
  (vérification A de la réparation n° 1, problèmes 3 et 6) ; Q-M1 à Q-M10 sont tranchées par MONARK (`5fc2d0c` l.6-22 ; `e37f2a5` l.6-20).
- (3) un test vert à la base, qui ne prouve rien → 34 tests jugés rouges à la base par assertion, sur prototypes ; red-proof à la PR.
- (3) une G2 de même modèle qui accepte trop vite → instance neuve, contre-vérification de MONARK.
- (3) clore sur « fusionné » au lieu de « publié » → l'envoi du site et la release du miroir restent des actes du fondateur (§5).

## 10. Conséquences et actes

**Positives** : les phrases de la liste (a) étendue cessent de dépasser leur témoin dès l'envoi, sans contradiction entre une phrase bornée
et ses sœurs qui disent le même fait (A09, A45) ; le positionnement aussi est borné dans le noyau (Q-V4 (d), T25), et aucune surface ne
promet le rejeu (Q-V3 (c), T16) : rien ne se contredit à l'envoi (vérification A de la réparation n° 1, problème 5) ; chaque borne porte un
test qui tombe quand l'item arrive ; le registre ne déclare plus de jambe prouvée par une entrée construite à la main. **Négatives** : le
site et le README gardent, jusqu'à la partie 2, les phrases en attente (Q-V2 (b), sur les trois surfaces du site ; CX-07 ; DN-12),
listées au §2 ; le README diverge du
schéma gelé jusqu'à PXC-16 p3 ; deux tueurs de SDT sont renumérotés ; un test existant, `site_names_no_kitchen`, change d'ancre et devient
jugé (T25) ; la
cartographie dit encore « câblé » pour la jambe de Narabi (item au §7.12). **Actes** : demandes de lecture (MONARK ; la consultation
est retirée, Q-M4 (b)) ; cp-1 (validateur, par MONARK ; rendu, `0737061`) ; validation de l'ADR (fondateur ; Q-V1 est tranchée) ; accord
de la partie 1 (fondateur) ; **PR de documents
sur les registres** `docs/PAROXYSME-{Shogen,Ukemi,Hikae,Narabi,Harnais,Bell}.md` (PAROXYSME, après la validation et avant les PR du noyau) :
les entrées dont le déclencheur est « l'ADR de PXC-02 » reçoivent le sort du §2 ; l'item de construction de la jointure, ouvert, que
l'entrée N-14 de Shōgen nomme (A-1 ; D-8, §7.14 ; Q-M11, tranchée (a), phase et prix), part dans une PR de registres à part, avant L2,
jamais avant L1, avec son identifiant, sa place et son prix tirés de l'amendement n° 3 (D-13 ; second pli, P2), sous la forme que le
test lit (§7.14 ; septième pli, D-6) ; les écarts : Narabi L15 (tout
le texte au noyau ; et NARABI-K1, déclencheur O-2, prix de D-16), Ukemi N3 (« keyed »), Ukemi E6 (Q-M2 (b) : le lot propre dans O-1, écart au propriétaire
PXC-12 p2 que fixe REG Ukemi, l.459-460), Hikae N13 (parties), Bell N-03 (O-3), Bell N-08 (partie 3 → noyau, T18, règle de D-15)
(A47) ; Harnais MK-L32 n'en est plus un : Q-M3 (a), le registre reste tel qu'il est (REG Harnais MK-L32, l.485-489) ; Harnais MK-L33
en devient un (Q-M3 (a) appliquée à X3 : l'épingle en PXC-02 partie 2, alors que REG Harnais MK-L33, l.490-493, la met en PXC-16 p3 ;
lecture à confirmer par MONARK) ; M9, E8, E12, T2
et T12 n'ont pas d'entrée de registre (REL-B l.74, REL-U l.91, l.106, REL-N
l.73, l.107) : leurs items du §7.8 sont formés et clos à ETAT avec les PR du noyau (chacun par le lot qui porte sa phrase), sans entrée
neuve ; liste au TABLEAU (PAROXYSME, relayée à RECHERCHES) ;
PR, CI (PAROXYSME) ; contrôle par diff, rejeu Windows, fusion, oracle G7 (MONARK) ; G2 de partie ; cp-2 ; G7 ; I-G2-5 et son lot, avant
l'envoi, au plus tard la publication seq 3, qui peut précéder la fin de la partie 1 (D-17 ; vérification A de la réparation n° 1,
problème 14) ; **envoi du site**
(go donné, `47ef84d` l.25) et **release du miroir** (fondateur), hors d'une fenêtre de service (PLAN l.509-510) ; lignes d'ETAT (MONARK).

## 11. Points tranchés (RUL, P-1 à P-14), sources

Chaque point de la v1 a sa décision (A06) :
- **P-1** retenu pour l'erratum de la note ; son texte est remplacé par celui de A60 (D-5). **P-2** retenu : D-6 (a). **P-3** retenu : DP:69 au noyau, et
  `app/how/page.tsx:75` avec lui (C10).
- **P-4** tranché : « per task class » est faux à T (D-5), retiré, avec une assertion et un mutant. **P-5** modifié : aucun constat n'est
  porté au fondateur ; D-9 et REG Shōgen N-16 le tiennent (votes 1 et 2 de A29). **P-6** remplacé par D-3 (deux lots, une G2 de partie) (A48).
- **P-7** retenu, motif corrigé (A49) : « paid » est aussi vrai (`apps/sentinel/src/ukemi/record.ts:33`) ; « keyed » est un choix de
  formulation, il dit ce que le transport demande (une clé, `record.ts:22-23`, `:320`, `:326-330`) sans parler de coût.
- **P-8** → Q-V3, question fermée (A37, A38), tranchée (c) par le fondateur (D-7). **P-9** tranché : D-11. **P-10** retenu ; ajouts
  (A50) : `ETAT l.1301-1302` de DEC-PX D-9
  est la numérotation de T0 (K-6 : l.1443-1445 à `5437cd0d`, E l.1757) ; `PLAN l.409-413` de DEC-PX l.13 est en PLAN l.413-414.
- **P-11**, **P-13** acceptés. **P-12** tranché, vrai : README l.56 renvoie aux critères, et `README.md:182` y range « a new recorder, a new
  residual hypothesis », `:175` le changement versionné d'un contrat. **P-14** : posé à MONARK et tranché (b) (`ba3dab6` l.8-16) ; D-12, D-17.

**Sources** (niveau) : code, README, tests, ETAT, JOURNAL-PROVENANCE, registres et ADR du dépôt aux têtes nommées, par `git show` [lu] ;
PLAN, CC, CP1, inventaires, relevés, METHODE, gabarits, CL, messages de la boîte par commit [lu] ; DOC06 l.82 [lu] ; Cemri et al.,
arXiv:2503.13657v3 [lu] (§9 ; procurement levé, ci-dessous) ; ECMA-262 et V8 : lus par MONARK (`0e66c86` l.6-17), [2nd] ici ; format
`adr.md` (qui cite Nygard 2011 et ISO/IEC/IEEE 42010:2022 §6.10, non relus ici). Chiffres de prix : estimations de l'étude et des relevés, [lu] dans ces
documents, non mesurés.

**Procurement levé** (cp-1, C-5 ; la v8 le formait ici). Le papier est en accès ouvert (page abs de la v3 : licence CC BY-NC-ND 4.0,
DOI 10.48550/arXiv.2503.13657) et lu le 2026-10-08 (§9) : la page abs et le résumé ici, la figure 1 et les annexes A.1 et A.3 par un
lecteur (`LECTURE-MAST.json`). Le §9 s'appuie sur la v3 ; la v1 et la v2 ne sont lues que dans leurs résumés et leurs quatre premières
pages, qui portent les libellés de catégories qu'il compare.

## 12. La G2 de l'ADR et son tri

**Journal** : G2 à lentilles du workflow `wf_b8b7c1cf-cd6`, lancé le 2026-10-07 à 21:28 UTC, arrêté le 2026-10-08 vers 06:25 UTC
(identifiant et lancement : `b0b645e` l.28 ; arrêt : date de modification du fichier d'export, 06:25:30 UTC par `ls --time-style=full-iso` ;
ni l'un ni l'autre n'est dans l'export ; vérification C, problème 14) ; export
`scratchpad/g2-adr-pxc02/export/G2-ADR-journal-final.json` : 3 302 lignes, 851 888 octets, sha256
`c4fcad9676723af092ef7ee5623b334f8be148a40addc736150f6f9da0214e53` (`wc -l`, `wc -c`, `sha256sum`, lus le 2026-10-08 à 07:38 UTC).
Constats : 69 (`fusion.findings`). Votes (`votes`) : 41 constats ont trois votes, dont 39 confirmés (au moins deux non réfutés) et 2 réfutés
(A18, A29, deux votes sur trois) ; A42 a deux votes (non réfutés) et 27 n'en ont aucun : 28 sans verdict, triés par moi à la tête
(`9b20ad2` l.6-9). Le relevé ligne par ligne est `RELEVE.md` (classement, lieu du pli, preuve).

**Réfutés, non pliés** (raisons des votes) :
- **A18** (une ligne d'ETAT pour ADR-M020:67) : le registre ne demande à l'ADR que la partie et la fenêtre (REG Ukemi L5, l.105-112), ce que
  X2 donne ; « sans force » motive l'alternative « ou le retirer », pas une obligation ; les lignes d'ETAT d'une partie partent avec sa
  demande de fusion (METHODE l.752-754), et la reprise par ETAT passe par PXC-01 p2 (CC l.36-37) ; la correction écrirait une ligne
  datée qui n'existe pas encore.
- **A29** (une question au fondateur sur les deux ids de Shōgen) : la règle qui gouverne est l'exception datée de Shōgen (CL l.35-40),
  déjà portée par REG Shōgen N-16 (l.409-415) ; aucune revendication de branchement ne repose sur ces ids (`fleet.ts:137`, `:143`) ;
  `integration_test` n'est pas rendu ; une question, une ligne au §6 et un item neuf doubleraient N-16. Le motif est écrit en D-9.

**Les 28 sans verdict, triés à la tête** (« plié » : corrigé par ce pli, lieu nommé ; « déjà corrigé » : rendu sans objet par la re-mesure ou
par O-1 ; « ne tient pas » : preuve contraire) :
- A42 plié en partie : le pli étendait seul la validation à l'annexe C ; la réparation pose la question à MONARK, Q-M7 (§8 ; vérification C,
  problème 4). A43 plié (§9, §11 : DOC06 l.82 seule [lu]).
- A44 plié (§9, catégorie 2). A45 plié (D-14 : les phrases sœurs des mêmes pages entrent au noyau, T15, T23, T24 ; R-25 mesuré : une PR).
- A46 plié (§7.12). A47 plié (§10, PR de documents sur les registres). A48 plié sous réserve de Q-M1, bloquante pour le cp-1 (D-3
  [MONARK], option (iii) ; §4) ; Q-M1 est tranchée au découpage : (a), deux lots (`5fc2d0c` l.6-22).
- A49 plié (§11, P-7). A50 plié (§11, P-10). A51 plié (D-12, D-17, §2 : la question posée et tranchée, le déclencheur entier).
- A52 plié (T1 : « attested » seul retiré, ni promesse ni clé citée ; prémisse `deadbeef` dans le test). A53 plié en partie
  (commentaires de `fleet.ts` réécrits, plan T1-T3, T14 ; celui de `CIG:1100` n'est pas touché, car red-proof refuserait le test sans tueur
  dont il est le corps : item CIG-WIRING-COMMENT-1, §7.8 ; vérification B, problème 1). A54 plié (la note : `the sentinel does not call the
  gate` ; le détail reste au commentaire).
- A55 plié (D-11). A56 plié (T7 : les deux corps du 500). A57 plié (T20 : le vérificateur du lecteur nommé deux fois, sans adresse).
- A58 plié (T10 : `not in the public export yet`). A59 plié (D-4 : `Each research lead`). A60 plié (D-5).
- A61 plié (T13 : `A price testimony format an application could cite …; today the attest tool projects one committed witness`).
- A62 plié (R-25 : « ≈ 1 150 lignes mesurées, porte CI 1 205 » ; mesure par fichier et classes de `ci.yml` l.100-104 au plan).
- A63 plié (table de mutants : `op` `CONST`, `test` chaîne ; réplique de `malformed` : 46 lignes bien formées au pli, 89 à la réparation n° 2).
  A64 plié (plan, Faisabilité).
- A65 plié (D-13, en-tête). A66 plié (en-tête de RDM : `Node built-ins, the register and the export lists`). A67 plié (D-6, T14).
- A68 plié (prémisse sur `WHITELIST_FILES`, `WHITELIST_DIRS` et `APP_PACKAGE_DIRS`, un répertoire entier compris). A69 déjà corrigé :
  `sha-base-gel.txt` appartient au prototype de la v1 ; le pli ne le cite pas, ses empreintes sont régénérées au plan, annexe B.

**Les 39 confirmés** : tous pliés (lieux dans `RELEVE.md`) ; aucun n'est refusé. A06, bloquant, est plié en premier : RUL plié au §11, DP:69
et `app/how/page.tsx:75` au noyau.

**Réparation n° 1** (les trois vérifications adverses du pli) : 34 problèmes, 11 de A (pliés par la session, `v3/pli-A.py`, `pli-A2.py`),
6 de B (B-1, bloquant : plié dans la chaîne par la session, puis au plan et à l'ADR ; B-2 à B-6 pliés), 17 de C (pliés ; la voie de texte
pour C-1, sans changement de code ; Q-V4 (d) et Q-M7 neuves). Le sort, le lieu et la preuve de chacun : `RELEVE.md` §5 et `PLI-VERIF.md`.
Tri des 28 sans verdict après la réparation : 25 pliés, 2 pliés en partie (A42 : Q-M7 ; A53 : CIG-WIRING-COMMENT-1), 1 déjà corrigé
(A69) ; A48 plié sous réserve de Q-M1, tranchée depuis (D-3).

**Réparation n° 2** (les deux vérifications neuves de la réparation n° 1, `verif/VERIF-REP1-A.json` et `verif/VERIF-REP1-B.json`, `claude-opus-5-5`,
effort `max`). A : 15 problèmes (4 à corriger, 11 mineurs) ; B : 3 (1 à corriger, le même que le problème 1 de A ; 2 mineurs). 16 pliés, 2 sans objet
(les défauts de Q-V3 et de Q-V4, A, problèmes 3 et 6, rendus sans objet par les décisions du fondateur, qui sont écrites), aucun refusé. C-1, C-3 et
C-10, que A disait pliés en partie, sont pliés en entier : Q-V3 et Q-V4 appliquées à leur périmètre vrai, l'épingle de SBF récrite, la demande (a)
rendue et la (b) formée avec son lieu. Le sort, le lieu et la preuve de chacun : `RELEVE.md` §6 et `PLI-VERIF.md`.

**Pli final** (les deux vérifications neuves de la réparation n° 2, `verif/VERIF-REP2-A.json` et `verif/VERIF-REP2-B.json`, `claude-opus-5-5`, effort
`max`). A : 16 problèmes (1 bloquant, 3 à corriger, 12 mineurs) ; B : 9 (2 à corriger, 7 mineurs). Le bloquant de A (six lignes de Q-V4 écrites comme
couvertes) est posé à MONARK (Q-M8, `315ce29` §2) et tranché par lui (`226d008` l.6-15) ; deux mineurs de B demandaient une lecture de MONARK : Q-M9
et Q-M10, tranchées (`cf0e079` l.6-13). Le problème 1 de B, le champ `test` de la table des mutants, est un défaut réel : avec l'identifiant court,
`run.mjs` ne choisit aucun test et la campagne écrite au plan rendrait 89 survivants ; la réplique disait 0 parce qu'elle construisait un motif plus
lâche (plan, Mutants). Tous pliés, aucun refusé ; le sort, le lieu et la preuve de chacun : `RELEVE.md` §7 et `PLI-VERIF.md`.

**Découpage** (la vérification courte du pli final, `verif/VERIF-FINAL.md`, `claude-opus-5-5`, recopiée par PAROXYSME) : cinq constats
mineurs, aucun bloquant, tous pliés : 1, la parole de MONARK que Q-M8 à Q-M10 exécutent (en-tête, §8 ; plan, en-tête) ; 2, l'outil
`mutcheck.mjs` et la réplique (plan, Mutants) ; 3, la tête du tronc et « L19 mesurée » (en-tête, §7.8 ; plan, points 5 et Fichiers) ;
4, les empreintes des TAP (plan, annexe B) ; 5, le prix des commentaires de `timeline.ts` (§6, §7.8). Q-M1 est tranchée par MONARK (D-3).
Le sort, le lieu et la preuve de chacun : `RELEVE.md` §8 et `PLI-VERIF.md` §7.
