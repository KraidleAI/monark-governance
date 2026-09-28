# DOCTRINE MONARK — principes de jugement des lots (document vivant, sections datées, jamais réécrites)

Ce fichier rassemble les principes qui servent à juger un lot avant son G0 et à son G7. Chaque section est datée et porte sa source (décision investisseur au CHANTIERS). Une section nouvelle ne remplace jamais une ancienne : elle s'y ajoute, et dit ce qu'elle amende.

## D-0 — But (2026-09-28, investisseur, verbatim : « notre but est de faire de MONARK une machine innovante. qu'on crée une nouvelle classe d'agents capables de prendre des décisions dans des environnements à risque »)
Ce que MONARK construit : des agents qui **savent ce qu'ils ne savent pas et agissent quand même, à hauteur exacte de ce qu'ils peuvent garantir**. La décision et sa garantie voyagent ensemble ; la garantie est en échantillon fini, sans loi supposée sur les données (inférence conforme), calibrée sur du réel, attestée, rejouable par un tiers, et le texte public ne dit jamais plus que ce qui est prouvé. La valeur n'est pas dans une brique (le cœur mathématique est public) mais dans la **composition** : calibration réelle + attestation + rejeu tiers + texte honnête + décision qui en découle.

## D-1 — Doctrine C1..C6 de la revue rapide (2026-09-27, décision 259, avis `F:\PRODUITS\paroxysme-2026-09-27\advis-2026-09-27\AVIS-advisor-2026-09-27.md`)
- **C1** : une preuve de revue non branchée n'est pas « built » ; le modèle (Kraidle, Lean) fait autorité, le différentiel généré et son test non-LLM sont obligatoires (règle Branchement).
- **C2** : les procurements se règlent à l'identité (DOI résolu), pas au volume ; une demande sans identité complète est un défaut.
- **C3** : un mutant « équivalent sur cet hôte » n'existe pas (Offutt 1992) ; on le tue par injection ou on le déclare vivant.
- **C4** : « avant le G0 de X », jamais « plus tard » : toute précondition d'un lot est datée sur son déclencheur.
- **C5** : ordre d'engagement mesuré sur les contraintes réelles (verrou, pièces partagées) : d'abord ce qui ne prend ni verrou ni worktree ; textes publics faux les plus petits ensuite ; jamais deux lots de code sur une pièce partagée en même temps.
- **C6** : chercher l'angle mort avant le prochain lot (précédent : K-1, attesteur factice `deadbeef` servi comme identité).

## D-2 — Décider pour le capital de tiers (2026-09-28, décision 263, investisseur : « oui, mets cette direction dans la doctrine »)
**Principe.** À partir de ce jour, chaque pièce et chaque lot sont jugés comme si **le lecteur de la garantie était un étranger qui a de l'argent en jeu et aucune raison de nous croire**. Aujourd'hui l'agent décide pour le capital de MONARK ; la direction est qu'il puisse décider pour celui d'un tiers (trésorier lisant Narabi, mandat de capital avec plafond de perte sur Shōgen, agent aval consommant la porte sans recalcul). Ce n'est pas un produit de demain : c'est **l'aune** à laquelle on juge dès maintenant.

**Ce que ça exige, par ordre de vérification à chaque G0 / G7 :**
1. **Vérifiable sans confiance.** La garantie servie doit être recomputable par le tiers à partir de faits signés et datés (attesteur K-1, rejeu depuis les paramètres publiés, égalité octet pour octet texte servi / arbre). Une garantie que seul MONARK peut vérifier est une promesse, pas une garantie : elle reste « upcoming ».
2. **Sélection visible.** Tout choix fait après avoir vu les données (strate, fenêtre, seuil, modèle) est déclaré au tiers avec son effet sur la borne ; une sélection cachée est une dette (registre PAROXYSME N-L4, U-L7). Les constructions qui gardent la couverture sous sélection (sélection conforme séquentielle) sont à évaluer par la campagne de lecture du 2026-09-28.
3. **La perte du mandant est la quantité contrôlée.** Pour un tiers, une fréquence de couverture marginale ne suffit pas : la borne visée est sur l'**espérance de la perte du mandant** (contrôle de risque conforme), avec la perte définie par le mandat, pas par nous. Là où l'on n'a qu'une couverture, on le dit tel quel.
4. **Les incitations sont une pièce.** Un agent payé à la performance a intérêt à sous-déclarer l'incertitude. Notre honnêteté est aujourd'hui une règle interne (vocabulaire banni, validateur) ; la direction est un **mécanisme** où le mandant fixe le protocole de test de sorte que dire vrai reste la meilleure stratégie de l'agent (tests d'hypothèses principal-agent, Bates-Jordan-Sklar-Soloff). Item de recherche : **MONARK-PRINCIPAL-AGENT-1** (déclencheur : synthèse de la campagne de lecture 2026-09-28).
5. **Limite de droit déclarée.** Gérer le capital d'autrui a un statut réglementaire que gérer le sien n'a pas ; hors de notre compétence, jamais oublié : toute pièce qui s'approche d'un mandat porte cette limite dans son registre PAROXYSME (nature Dr), avec un item de procurement (texte réglementaire applicable, lu sur place), jamais une opinion.

**Conséquences immédiates.**
- Les checklists du validateur-humain (CA-11 branchement) et les ADR de pièce ajoutent une ligne « **lecteur tiers** » : qui, hors MONARK, peut recomputer la garantie servie, avec quoi, et quel test non-LLM le prouve. Amendement daté du fichier du validateur : à faire par l'orchestrateur (item **VALIDATEUR-CA-12-TIERS-1**).
- Les registres PAROXYSME ajoutent la nature **Tiers** aux limites : « garantie non vérifiable sans nous », « sélection invisible », « perte du mandant non contrôlée », « incitation non mécanisée ».
- Aucun texte public ne dit « for third-party capital », « mandate », « fiduciary » ni « guarantee » tant qu'aucune pièce ne passe le point 1 avec un test ; vocabulaire à ajouter au gate `vocab-banned.json` au prochain lot de site (item **VOCAB-TIERS-1**).
