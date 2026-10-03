# FAITS — point d'accès des bougies Binance (`GET /api/v3/klines`), lu avant toute requête

Lu sur place par l'orchestrateur MONARK (navigateur interne), le 2026-10-01 à partir de 02:31:54 UTC. Source primaire : la
documentation officielle de l'API Spot dans le dépôt de Binance, fichier brut
https://raw.githubusercontent.com/binance/binance-spot-api-docs/master/rest-api.md (181 007 caractères ; sha256 du texte rendu,
calculé dans le navigateur : `49ea6809243fc7fb426e07f2fe662097736c7bb405bd2da5eef637d715427999`). La page « SPOT Exchange Terms of
Use » de la documentation renvoie aux conditions générales déjà lues (`docs/marche/FAITS-conditions-series-2026-10-01.md`).
Aucune requête n'a été faite au point d'accès.

## Ce que confirme la documentation (hypothèses H-1 à H-5 du journal `docs/G1-lot-series-binance.md`, section 5)

- **H-1, forme d'une ligne : confirmée.** Douze éléments : l'heure d'ouverture et l'heure de clôture en entiers (millisecondes), le
  nombre de transactions en entier, les prix et volumes en chaînes décimales, et un dernier champ inutilisé.
- **H-2, filtre et ordre : confirmés.** Section « Kline/Candlestick data » : `limit` vaut 500 par défaut et 1 000 au plus ; une
  bougie est identifiée par son heure d'ouverture ; `startTime` et `endTime` sont toujours lus en UTC. Section « General API
  Information » : les données sont rendues dans l'ordre chronologique ; avec les deux bornes, l'API rend les plus anciennes à partir de
  `startTime` sans dépasser `endTime`.
- **H-3, 429 et 418 : confirmés.** Section « LIMITS / IP Limits » : 429 pour une limite de débit dépassée, 418 pour un bannissement
  automatique de l'adresse après des 429 répétés, de 2 minutes à 3 jours ; l'en-tête `Retry-After` donne le délai en secondes. Les
  limites portent sur l'adresse IP.
- **H-4, 451 : non documenté dans ce fichier.** L'arrêt nommé `restricted_location` reste dans l'enregistreur, sans effet s'il n'arrive
  jamais.
- **H-5, en-tête de poids : confirmé** sous la forme `X-MBX-USED-WEIGHT-(intervalNum)(intervalLetter)`, par exemple
  `x-mbx-used-weight-1m`. Le poids d'une requête `klines` est 2.

## Ce que la documentation ajoute

- **403** : rendu quand une règle du pare-feu applicatif est violée (limite de débit ou blocage de sécurité). L'enregistreur s'arrête
  alors par `http_status` (tout statut autre que 200, sans relance), donc sans contournement.
- **5XX** : erreur interne de Binance ; l'enregistreur s'arrête par `server_error`, sans relance.
- **Point d'accès réservé aux données publiques** : la documentation recommande `https://data-api.binance.vision` pour les API qui ne
  servent que des données de marché publiques. L'enregistreur garde `https://api.binance.com`, nommé par la demande ; la bascule est
  proposée à RECHERCHES, jamais faite en silence.
- Charge prévue : 71 requêtes par série (70 080 bougies, 1 000 par page), poids 2 chacune, au moins 500 ms entre deux requêtes ; au
  plus environ 240 de poids par minute.

## Ajout daté du 2026-10-01 à 19:24:39 UTC : H-6, intervalles 1h et 4h (FAITS-BINANCE-INTERVALS-1, journal `docs/G1-lot-series-intervals.md`)

Relu sur place par l'orchestrateur (navigateur interne), même fichier brut, inchangé : sha256 du texte rendu recalculé dans le
navigateur, `49ea6809243fc7fb426e07f2fe662097736c7bb405bd2da5eef637d715427999` (181 007 caractères). Aucune requête au point d'accès.

- **(a) Intervalles admis : `1h` et `4h` y sont.** Table « Supported kline intervals (case-sensitive) », ligne des heures :
  `1h`, `2h`, `4h`, `6h`, `8h`, `12h`.
- **(b) `timeZone`** : paramètre facultatif, « Default: 0 (UTC) » ; « If `timeZone` provided, kline intervals are interpreted in that
  timezone instead of UTC » ; « `startTime` and `endTime` are always interpreted in UTC, regardless of `timeZone` ». L'enregistreur
  n'envoie pas `timeZone` : les intervalles sont lus en UTC.
- **(c) Exemple de réponse** : ouverture `1499040000000`, clôture `1499644799999`, soit ouverture + 604 799 999 ms (une semaine moins
  1 ms) ; l'intervalle de l'exemple n'est pas nommé.
- **H-6 : confirmée en partie.** Lu : 1h et 4h admis, intervalles lus en UTC par défaut, clôture de l'exemple = ouverture + durée − 1 ms.
  Non écrit mot pour mot : que les bougies 4h s'ouvrent à 00:00, 04:00, …, 20:00 UTC. La garde stricte de l'enregistreur
  (`off_grid`, `close_time`) arrête la première page qui en dévierait ; aucune lecture fausse en silence.

## Ajout daté du 2026-10-03 à 15:36 UTC : H-6 après le lot RECORDER-CLOSE-TIME-1 (fusion `f7a55512`)

- La garde `close_time` des l.49-51 n'existe plus. Une clôture après son créneau ou avant son ouverture arrête la page
  (`close_out_of_slot`, `scripts/record-binance-klines.mjs` l.204) ; une clôture dans le créneau mais différente de ouverture + durée
  − 1 ms est gardée et listée sous `irregular_close` dans le manifeste (l.244-249). `off_grid` est inchangé (l.202).
- Les l.37-51 restent la lecture du 2026-10-01 ; aucune page n'a été relue pour cet ajout.
