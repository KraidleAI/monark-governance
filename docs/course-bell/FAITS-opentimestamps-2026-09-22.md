# FAITS — OpenTimestamps, lecture sur place (règle 2026-09-20), préalable 124(1)

Orchestrateur Fable 5.1, navigateur interne, `https://opentimestamps.org/`, lu le 2026-09-22 02:39 UTC (`date -u`). Niveau : **[lu]** première main. Aucun téléchargement, aucun formulaire, aucun fichier déposé sur la page.

| # | Fait | Citation (≤ 25 mots) |
|---|---|---|
| 1 | Objet : preuve d'antériorité, ancrée sur Bitcoin | « A timestamp proves that some data existed prior to some point in time » |
| 2 | Les calendriers publics sont gratuits, sans inscription ni clé | « These servers are free to use and they don't require any registration or api key » |
| 3 | Financement par dons ; pas de garantie de service énoncée | « They rely on donations to reduce maintainers efforts » |
| 4 | Quatre calendriers par défaut nommés : ALICE, BOB, FINNEY, CATALLAXY ; page d'uptime référencée | « Check the calendars uptime » |
| 5 | Le hash est calculé côté client ; le service ne reçoit que le hash | « The hash is calculated on your browser preserving your privacy » |
| 6 | Client officiel Python : `pip3 install opentimestamps-client` ; `ots stamp <file>` | verbatim du bloc de code de la page |
| 7 | Aucune page « Terms of Service » ni « Privacy Policy » liée depuis l'accueil (menu : Stamp and verify, How it works, Members, Code repositories, Mailing lists) | — (absence constatée) |

## Conséquences pour la procédure 124 (G0 course §5)
- **Ce qui sort de la machine** : uniquement un hash (manifeste de tête), jamais le ledger ni une page — conforme à 124 (« l'ancre ne révèle que le hash »).
- **Aucune condition d'usage contraignante n'est publiée** (fait 7) : le service est offert sans contrat ; la limite est opérationnelle (disponibilité non garantie, fait 3). Repli pré-enregistré : si un calendrier ne répond pas, le client interroge les autres ; si aucun ne répond, l'ancre est consignée « non horodatée, calendriers indisponibles à <heure> » et posée à la frontière suivante — jamais rattrapée a posteriori (124 « non rattrapable »).
- **Délai de preuve** : la preuve complète exige une confirmation Bitcoin ultérieure (`ots upgrade`) ; l'ancre est engagée à l'instant de la soumission, la preuve finale se récupère après. Aucun délai chiffré n'est lu sur la page : **[abs]**, à mesurer à la première ancre.
- **Installation** : le client Python est un paquet tiers ⇒ installation = acte à go (règle « aucun téléchargement sans go ») ; à faire par l'orchestrateur après le go investisseur, dans un environnement dédié, version épinglée et sha du paquet consigné.
- **Coût** : 0 (dons facultatifs, non engagés).

## Demande de go (décision 124, préalable 2)
Go investisseur demandé pour : (a) installer `opentimestamps-client` (version épinglée) ; (b) soumettre le premier hash aux calendriers publics à la frontière `probe_end` de la course Bell. Aucun appel avant le go.
