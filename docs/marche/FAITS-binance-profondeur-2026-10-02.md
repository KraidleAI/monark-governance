# FAITS — profondeur du point d accès des bougies Binance (`GET /api/v3/klines`), lue sur place le 2026-10-02

Lu par l orchestrateur MONARK le 2026-10-02 entre 18:19:18 et 18:19:40 UTC (horloge lue), par une requête par symbole au point d accès
déjà lu et autorisé (`docs/marche/FAITS-conditions-series-2026-10-01.md`, `docs/marche/FAITS-binance-klines-2026-10-01.md`) :
`symbol=<S>&interval=15m&startTime=0&limit=1`, poids 2 chacune, quatre requêtes en tout, une seconde entre deux. Seule l heure
d ouverture de la première bougie rendue a été lue ; aucun prix, aucun volume, aucune bougie gardée. Motif : question Q-W2-15 de
RECHERCHES (`coordination/messages/2026-10-02-RECHERCHES-vers-MONARK-vague-2-donnees-passees.md`).

| Symbole | Première bougie 15 min rendue (heure d ouverture, UTC) |
|---|---|
| BTCUSDT | 2017-08-17T04:00:00Z |
| ETHUSDT | 2017-08-17T04:00:00Z |
| BNBUSDT | 2017-11-06T03:45:00Z |
| SOLUSDT | 2020-08-11T06:00:00Z |

- Lecture : `startTime=0` demande la plus ancienne bougie servie ; la valeur rendue est la profondeur du point d accès pour le symbole,
  pas la date de cotation au sens juridique (non lue ici).
- Non mesuré : la continuité des séries entre ces dates et 2024-10-01 (trous, bougies manquantes) ; elle ne se lit qu en enregistrant, et
  `missing.json` la dira.
- Enregistreur (`scripts/record-binance-klines.mjs`, sha256 `0a1ae564…`) : `--start` et `--end` sont libres sur la grille de 15 minutes,
  sans borne basse ; `--end` dans le futur est un arrêt nommé. Même discipline qu en 2026-10-01 (pages brutes, `requests.jsonl`,
  manifeste, `SHA256SUMS`, rejeu hors ligne au bit).
