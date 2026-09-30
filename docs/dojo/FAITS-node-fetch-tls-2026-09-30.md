claude-fable-5-1

# FAITS — `fetch` de Node 24 : TLS, environnement, mandataire, corps non lu (FAITS-NODE-FETCH-TLS-1, DOJO-SYNC-GET-BODY-CANCEL-1) — lu sur place le 2026-09-29T23:16Z

Lecture sur place par l orchestrateur (navigateur interne), règle du 2026-09-20. Runtime local mesuré : `node --version` = v24.15.0, `process.versions.undici` = 7.24.4. **Écart déclaré** : la documentation lue est celle de la branche v24 la plus récente (en-tête « Node.js v24.21.0 Documentation ») et le README d undici est celui de `main` ; aucune page figée à v24.15.0 / 7.24.4 n a été lue. Citations ≤ 25 mots.

## F-1 à F-5 — https://nodejs.org/docs/latest-v24.x/api/cli.html [lu]

- **F-1 `NODE_TLS_REJECT_UNAUTHORIZED`** : « If value equals '0', certificate validation is disabled for TLS connections. » ⇒ une seule variable d environnement désactive la vérification du certificat pour tout le processus.
- **F-2 `NODE_EXTRA_CA_CERTS`** : les racines connues sont « extended with the extra certificates in file » ; lue seulement au lancement du processus ⇒ l environnement peut ÉTENDRE le magasin de confiance.
- **F-3 `--use-bundled-ca` / `--use-openssl-ca`** : magasin Mozilla figé à la version de Node, ou magasin OpenSSL modifiable par `SSL_CERT_DIR` et `SSL_CERT_FILE`.
- **F-4 `NODE_USE_SYSTEM_CA=1`** (ajouté en v24.6.0) et `--use-system-ca` : ajoutent le magasin du système aux précédents.
- **F-5 `NODE_USE_ENV_PROXY=1`** (ajouté en v24.0.0, « Active Development ») : Node lit `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` au démarrage et route les requêtes par ce mandataire ; sans cette variable ni `--use-env-proxy`, les variables de mandataire ne sont pas lues.

## F-6, F-7 — https://github.com/nodejs/undici/blob/main/README.md [lu]

- **F-6 (corps non lu)** : laisser le ramasse-miettes libérer une connexion peut mener à « stalls or deadlocks when running out of connections » ; « always either consume or cancel the response body ». ⇒ **DOJO-SYNC-GET-BODY-CANCEL-1 CONFIRMÉ** : tout refus sur statut ou sur longueur déclarée doit annuler le corps (`body.cancel()`) ; même règle pour `urlSource` de PR-1b-4.
- **F-7 (`Content-Encoding`)** : undici « limits the number of Content-Encoding layers in a response to 5 » et rejette au-delà. Que le corps rendu soit décompressé n est pas écrit sur cette page en une phrase : non établi ici (lecture de la spécification Fetch due si T-6 en dépend).

## Conséquences pour les lots

- **PR-1b-4 T-9** (« aucune option TLS posée : la validation est celle du runtime ») : le runtime l affaiblit par F-1 et l étend par F-2 à F-4, par l environnement seul. Construction retenue pour le G1 : le vérificateur REFUSE de s exécuter en `--url` quand `NODE_TLS_REJECT_UNAUTHORIZED` vaut `0` (refus `insecure_url`, sens étendu à nommer au pli de la mère) et DÉCLARE au rapport la présence de `NODE_EXTRA_CA_CERTS`, `NODE_USE_SYSTEM_CA` et `NODE_USE_ENV_PROXY` (clé de rapport ou `detail`, au choix du G1 sous le contrat de D-3) ; précédent : HELIUS-TLS-BARRIER-1 (fichier d environnement fermé de l unité Dōjō).
- **PR-4a-2 `httpsGet`** : ajouter `cancel` du corps sur tout refus (≈ 4 lignes) : acte du pli G7 de PR-4a-2 ou correction, avant l acte TU-7.

- **Ligne datée (orchestrateur, 2026-09-30 01:4x UTC ; G2 PR-1b-4, Q-G2-2) — F-7 MESURÉ sur Node 24.15.0 / undici 7.24.4** (sondes du relecteur, `F:/tmp/dojo/g2-pr1b4/probes/`) : `fetch` rend le corps gzip DÉCODÉ ; une bombe gzip de 8 175 octets sur le fil, 8 Mio décodés, est refusée `too_large` sous une borne de 1 Mio : T-6 compte bien les octets rendus. F-7 clos pour ce runtime ; à remesurer à tout changement de version (déclencheur : FAITS-NODE-FETCH-TLS-1, prochain bump de Node).
- **Ligne datée (même heure ; G2 PR-1b-4, Q-G1-1 et Q-G2-1) — DOJO-VERIFY-TLS-FLAGS-1, objet ÉTENDU** : mesuré avec une autorité TLS jetable : aucune valeur voisine de `0` (`00`, `false`, ` 0`, `0 `, `no`, vide) ne désactive la validation ; deux cas SILENCIEUX étendent ou déroutent sans désactiver : `NODE_OPTIONS=--use-openssl-ca` avec `SSL_CERT_FILE` (succès, `detail` nul) et `--use-env-proxy` (tunnel `CONNECT`, `detail` nul, même vers `http://127.0.0.1`) ; s y ajoutent les préchargements `--require` / `--import`. Conséquence pour PR-3b-2 : un `detail` nul n atteste PAS l absence d environnement TLS ; l item se clôt avant le G7 qui compose TU-5c. Le report est sans danger : aucun chemin servi ne lance `--url` avant ce déclencheur.
