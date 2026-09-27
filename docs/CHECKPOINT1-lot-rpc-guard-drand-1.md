claude-fable-5-1
# CP1 BREF - lot rpc-guard DRAND-RELAY-GET-1 (ADR-RPC-GUARD-DRAND-1, G0) - validateur-humain, 2026-09-27 10:54 UTC (date -u a la remise)
Verdict : ACCEPTE-AVEC-CORRECTIONS (C-V-1 a C-V-5, liste fermee au par. 4). Aucun GIT_DIR, aucun --write-tree, aucun git ecrivant, aucun reseau, rien sur C:.

## 1. Artefacts lus (sha256 releves a l'ouverture ; worktree F:/Monark-wt-dojo-a2, branche lot/dojo-pr2-2, HEAD f8f6105)
- docs/adr/ADR-RPC-GUARD-DRAND-1.md : 99 l., 0 CR, 3261b32443ebc82696115097d765f53e620e00e9a576b99ad10ac04a4c742d19 ; head -97 = 88d5319e...6432d = sha du G0 : la ligne datee 10:44Z est la seule difference.
- docs/G0-lot-rpc-guard-drand-1.md c22b8d6d...0592 ; docs/adr/ADR-DOJO-PR-2.md 2cf0fa34...4dce (D-5, par. 3 TU-B, par. 4 lot, par. 7 P-3, l.235, l.484) ; docs/G1-lot-dojo-pr2-2.md 7c920b9d...9e61 (par. 1, 7, 10, Q-2).
- packages/rpc-guard/src/{transport,client,guarded,ledger,lock,index,errors,classify}.ts, test/{exports,error-hint}.test.ts (sha egaux au G0) ; apps/bell/test/bell-keys.test.ts:120-190 25ab6a2a...59e8 ; apps/dojo/src/collect.ts e903cf8a...caa5 (course, plan, tick, main) ; apps/dojo/test/dojo-collect.test.ts, helpers/collect-chain.ts.
- FAITS drand tronc 1c19b94f...59e9 (30 l., = citation de l'ADR) ; version retiree 87613b3b...9285 ; CHANTIERS l.1685 (decision 247), l.1845-1850 ; ci.yml:78-95 (methode R-25).
- Sondes locales sans reseau (node : regle de chemin D-1 rejouee sur 12 chemins ; closedHint sur les preambules drand ; tri de la liste de l'epingle) : conformes.

## 2. Checklist
- CA-1 (falsifiable) : CORRECTION - D-1..D-5 reformulables en une phrase chacune (fait) ; mais Q-1 = (i') n'est pas propagee (D-1 par. 0, D-1 (b), par. 4 disent encore « propose 4 ») et invalide un test declare « a controler par nom » (C-V-1).
- CA-2 (valeur) : conforme, signal consigne - Q-1/Q-2/Q-3 tranchees par l'orchestrateur ; le plafond 2 tient dans la forme (ii) tout-ou-rien deja tranchee (decision 248) et suit le libelle de la lettre P-3 (« un GET par relais et par jour ») ; conditions non publiees => acte declare (FAITS l.10-16) ; cout 0 (decision 247 sans objet : aucun abonnement). Non escalade ; item de revisite apres reponse P-3 demande (C-V-1).
- CA-3 (ADR, gates) : conforme - ADR rattache (PR-2 D-5, par. 4, par. 7 ; G1 par. 10) ; aucun gate suspendu ; hash quicknet epingle = FAITS l.21/l.26.
- CA-4 (fan-out) : n-a - mono-worker au G1, G2 en instance separee ; aucun fan-out.
- CA-5 (MAST) : conforme - FM-1.1, FM-2.2, FM-3.2 nommes avec contre-mesure (M-B4, Q-1, lecture de 10:30:50Z).
- CA-10 (lots petits, aucun argument de vitesse) : conforme, recompte fait : 1a = 19 code (9+2+8) + 61 tests (45+15+1) + 1 epingle = 81 ; 1b = 10+2+8+10 = 30 ; lot 111 ; x2,1 = 170 / 63 / 233 (table D-4 exacte) ; STOP 1 150 ; mecanique de fusion a fixer (C-V-2).
- CA-11 (tuyaux, branchement) : conforme sur pieces - TU-B entree/sortie/etat/tests declares ; consommateur collect.ts --plan/--tick par openGuardedClient (une seule voie, Q-3 = oui) ; registre reste upcoming ; G7 au gel 1b. Reserve TY-8 (C-V-3).
- Anti-close : n-a (aucun prix ; le hash de chaine est une constante publique). CA-6..CA-9 : n-a (checkpoint-2).

## 3. Points demandes par l'orchestrateur, verifies sur pieces
- Libelles : drand-pl / drand-cf sans point ; epingle bell-keys.test.ts:157 = egalite de liste => extension inevitable (constat 1 du G0 exact) ; liste a 10 triee (verifie) ; tirets deja admis par BARE_LABEL (cash-close, xstocks-issuer publies) ; preambules d'erreur sans jeton (error_preamble_carries_no_vocabulary_token reste vert, verifie).
- Chemin ferme : resolveGetUrl (transport.ts:198-206) = hote structurel + https + sans userinfo ; regle D-1 rejouee : /.../public/../info (normalise en /info), /v2/, latest, ronde 0, hash majuscule, requete, fragment, //hote, sosie suffixe, chemin vide (TY-5) tous REFUSES ; seule la ronde v1 est admise.
- Cout 0 compte : classe keyless => costOf 0 (client.ts:104), ligne attempted write-ahead (client.ts:123), by_op_method drand-pl|GET ; cycle drand-<jour> disjoint de helius (guarded.ts:42, verrous par (cycle, op)).
- Plafond par relais et par jour : aucun n'existe aujourd'hui pour un keyless (client.ts:111 : maxCalls seul) => cycleAttempts + prior compte sur entries() du grand livre est la bonne place ; BudgetExceededError sans motif structure (errors.ts:8) => traitement « aucun plan a ce passage » correct. Arithmetique de (i') : C-V-1.
- Menaces : menteur => betaOf champ par champ + egalite des deux => aucun plan => abstention a T_d+900 (collect.ts:153-175) ; sosies par hote structurel ; redirection redirect:"manual", 3xx = arret (transport.ts:220, 228).
- Declencheur : chaine D-5 conforme au prompt (G7 PR-2-2 -> G1 1a puis 1b -> G2 -> cp-2 -> G7 -> A-7 sous go -> premier jour lu) ; P-4 avant le premier jour.

## 4. Corrections (liste fermee, a porter dans l'ADR avant le G1)
- C-V-1 (bloquante pour le G1) : propager Q-1 = (i') dans D-1 par. 0, D-1 (b) et par. 4 avec sa consequence ecrite : call reessaie une fois sur 429/5xx/reseau (TRIES 2, collect.ts:135-140), donc une double faute transitoire a 00:00 epuise le plafond du jour et les passes 00:05/00:10 sont refusees cycle_attempts ; un 404 (non reessaye) a 00:00 puis a 00:05 refuse la passe de 00:10. Consequence mesurable : dojo_tick_before_0015_fetches_beacon_once (dojo-collect.test.ts:267, assertion « 3 * 2 » requetes sans beta) ne peut plus tenir => le passer de « a controler par nom » a « amende » (2 x 2 GET puis refus avant fetch, lignes refused au grand livre), test (2) a plafond 2, ligne R-25 de 1b ajustee. Item forme « revisite du plafond apres reponse P-3 » (declencheur : reponse de la League of Entropy).
- C-V-2 : mecanique de fusion de la coupe : « deux PR » et « G7 du lot au gel de 1b, jamais a 1a » se contredisent si R-25 se mesure par PR contre la base (ci.yml:82). Fixer : (a) une branche de lot, une PR finale (alors « deux PR » cede et R-25 = 111 en une PR > 100, a justifier) ; ou (b) 1a fusionnee sous son propre verdict avec TU-B « absent, item forme, declencheur 1b » (precedent Pli G7 PR-2-1, ADR PR-2 l.235), piece upcoming.
- C-V-3 : TY-8 sous-declare : tick() (collect.ts:229-238) attend plan() avant la boucle des lectures ; un verrou drand-*.lock perime pendant [T_d, T_d+900) fait refuse("lock_held") a chaque passe => les lectures de d-1 dont la fenetre chevauche minuit (jusqu'a T_d+600, dojo_collect_reads_only_inside_the_window) passent missed, en plus du jour d abstenu (apres T_d+900, plan() saute la course et ecrit le plan nul). Couvrir dans le test (5) ou nommer ce residuel tel quel + unlock au runbook.
- C-V-4 : TY-5 : le refus de --operators drand-pl cote Bell tombe dans transport APRES meter+commit (client.ts:132-134) => une ligne attempted et un verrou drand-pl.lock sous le cycle de Bell existent avant le refus de chemin ; fail-closed, mais effet de bord a nommer (aucune ligne sous apps/bell/src, Q-2).
- C-V-5 (legere, provenance) : G0 l.7 « aucune edition apres ce hachage » est perimee par la ligne datee ; consigner le sha post-ligne 3261b324...742d19 (99 l., 0 CR).

## 5. Preuves d'integrite et rejeu
- Chemin de rejeu : F:/tmp/dojo/cp1-drand/ (chemin donne par l'orchestrateur, hors depot ; carve-out AM-2 ter/quater ; sondes node sans reseau, aucune copie du depot necessaire). Aucun octet ecrit dans le depot ; git status --short du worktree identique a l'ouverture (fichiers du G1 PR-2-2 + les deux ?? du G0) ; sha256 des fichiers du depot AVANT = APRES (releve dans repo-shas-avant-apres.txt, a cote de ce rapport).
- AM-1 : attrape par la checklist = C-V-1 (decision Q-1 non propagee, test aval invalide), C-V-2 (mecanique de fusion), C-V-3 (residuel TY-8 sous-declare) ; manques signales ensuite par le G7 : a consigner.
Modele resolu (R-1) : claude-fable-5-1.
