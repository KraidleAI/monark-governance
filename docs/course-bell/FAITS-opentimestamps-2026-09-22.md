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

## Installation et essai à blanc (2026-09-22 03:05 UTC `date -u`, go investisseur verbatim « fais le toi méme »)
- **Environnement** : `F:\MONARK SUITE\ots\venv\` (Python 3.14, venv dédié, tout sur F ; cache pip `F:\tmp\pip-cache`, `HOME=F:\tmp\ots-home`). Paquets téléchargés dans `F:\MONARK SUITE\ots\dl\` puis installés HORS LIGNE depuis ce dossier, versions épinglées : `opentimestamps-client 0.7.2` (sha256 `84e604d7…8ba`), `opentimestamps 0.4.5` (`a4912b3b…6b5`), `python-bitcoinlib 0.12.2` (`2f29a9f4…a44`), `pycryptodomex 3.23.0`, `GitPython 3.1.62`, `gitdb 4.0.12`, `smmap 5.0.3`, `appdirs 1.4.4`, `PySocks 1.7.1` (sha complets : `sha256sum dl/*`). La version 0.7.3 visée n'existe pas sur PyPI (index : 0.7.2 la plus récente).
- **Piège Windows mesuré** : `python-bitcoinlib` charge OpenSSL par `ctypes.util.find_library('ssl')` = un fichier nommé littéralement `ssl.dll`, et y cherche `BN_add` (symbole de **libcrypto**, héritage `libeay32`). Solution sans installation système : `F:\MONARK SUITE\ots\dll\ssl.dll` = copie de `libcrypto-3-x64.dll` de Git for Windows (sha `0330b5f5…31c`), + `mingw64\bin` sur le PATH du seul process ots. Commande d'invocation figée : `PATH="F:\MONARK SUITE\ots\dll;C:\Program Files\Git\mingw64\bin;%PATH%" HOME=F:\tmp\ots-home F:\MONARK SUITE\ots\venv\Scripts\ots …`.
- **Essai à blanc** (fichier de test, PAS une pièce de course) : `test/dry-run-2026-09-22.txt` sha256 `ccf5f944…1fe5` ; `ots -v stamp` 03:05:12 → 4 calendriers contactés (`a.pool.opentimestamps.org`, `b.pool.opentimestamps.org`, `a.pool.eternitywall.com`, `ots.btc.catallaxy.com`), politique 2-sur-4, timeout 5 s, **1,70 s** ; preuve `dry-run-2026-09-22.txt.ots` 770 octets, sha `6d7cde4a…1b92` ; `ots verify` à 03:05:29 : « Pending confirmation in Bitcoin blockchain » sur alice/bob/finney (+ catallaxy en attestation pendante) — **délai de preuve finale = [abs], à mesurer par `ots upgrade` ultérieur** (attendu : après inclusion dans un bloc Bitcoin, typiquement heures).
- **Ce qui est sorti de la machine** : le hash du fichier de test, rien d'autre. Coût 0.
- **Procédure de course (G0 §5)** : à chaque frontière, `ots stamp <manifest>` puis `ots upgrade <manifest>.ots` au plus tard avant la publication du verdict ; l'`.ots` et son sha sont écrits dans `ANCHORS.md` et committés/poussés avec le manifeste. Repli si < 2 calendriers répondent : ligne « non horodatée » (jamais rattrapée).
