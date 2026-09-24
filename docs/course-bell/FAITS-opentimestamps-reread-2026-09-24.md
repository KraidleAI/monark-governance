# FAITS — OpenTimestamps, lecture sur place (FAITS-OTS-REREAD-1, ADR-BELL-OTS-ANCHOR-1 §0 bis point 4)

Lu par l'orchestrateur `claude-fable-5-1` dans le navigateur interne le 2026-09-24T13:34:07Z, page `https://opentimestamps.org/` (accueil), niveau **[lu]**. Aucun formulaire, aucun dépôt de fichier, aucun téléchargement.

- Définition (citation ≤ 25 mots) : « A timestamp proves that some data existed prior to some point in time. » Confirme la borne D8 de l'ADR : une preuve dit « avant un bloc », jamais « à un instant ».
- Blockchain : « At the time of writing timestamping on the Bitcoin blockchain is supported » ; format déclaré flexible.
- Calendriers : « we offer calendar servers that perform this operation for you. These servers are free to use and they don't require any registration or api key. » Quatre calendriers par défaut listés : ALICE, BOB, FINNEY, CATALLAXY ; ils reposent sur des dons ; page d'uptime mentionnée.
- Client : `pip3 install opentimestamps-client` ; `ots stamp my-file` ; dépôts client/serveur/bibliothèques python, javascript, java, rust.
- Stamper et vérificateur en navigateur : « The hash is calculated on your browser preserving your privacy. » Non utilisé (aucun dépôt de fichier).
- Conséquences pour le lot : (a) aucune clé ni compte : l'usage sortant est un envoi de digest aux calendriers publics (à faire valider par l'investisseur, nouvel usage sortant) ; (b) la vérification par un tiers repose sur le client ouvert et un nœud Bitcoin de son choix (D4) ; (c) les délais de confirmation ne sont pas indiqués sur cette page (non lu, conforme à l'ADR §8).
