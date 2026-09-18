# PR-12 et PR-14 — clos par réponse investisseur / localisation (2026-09-18)

## PR-12 — Statut ClawPump
Réponse investisseur (verbatim) : « non, il ne peut pas, c'est le contraire, on le fait pas dans cette phase, on le fera quand on mettra nos agents sur un VPS. »
⇒ Aucun agent ClawPump ne peut appeler `api.monarkgate.tech` ni monter un MCP externe dans cette phase (confirme memstack `b4003fd6`, 2026-09-11).
Conséquence pour D3 : l'agent externe attendu pendant le judging ne peut venir que d'OpenClaw/Hermes générique ; la mesure D8 ne comptera donc aucun
appel ClawPump. **Clos.**

## PR-14 — Traces S2 pour l'item (a) ADR-M009 (B_t à bFloor = 0)
Localisées (investisseur : « regarde dans le dossier shogen et dans le dossier de la campagne en cours ») :
- `F:\shogen-campagne\campagne\journal.jsonl` — 322 794 lignes (94 Mo) au 2026-09-18 19:05 local, une ligne par fenêtre × flux
  (`window_start`, `flux_id`, `kind`, `currency`, `status`, `http_status`, `price`, `source_ts`, `fetch_ts`, `sha256_raw`) ; 26 898 fenêtres
  distinctes closes (`control.jsonl`, record `window_close`) sur cible 37 440 ; segment J0 = 2026-08-23 (campagne), J28 = 2026-09-18.
- `F:\shogen-campagne\campagne\control.jsonl` (61 957 lignes après réparation du 2026-09-18 : `asn_attribution`, `run_params`, `clock_check`,
  `window_close`) ; `raw.jsonl` (octets bruts).
- Segment calibration (48 h, 21–23 août) : `F:\shogen-campagne\calibration\{journal,control,raw}.jsonl` (34 572 lectures) ; seuils scellés
  `F:\shogen-campagne\sigma-tau.json`.
- Lecteurs : `F:\Shogen\s2-harness\shogen_s2\records.py` (`read_jsonl_tolerant`, fail-closed sur ligne déchirée non finale), `report.py`.
Format suffisant pour rejouer une suite de miscovers par fenêtre et mesurer P(B_t < 0 | bFloor = 0) ; la mesure elle-même = lot P0-b. **Clos (localisé).**
Incident du jour : coupure 19:05 → ligne déchirée non finale (control.jsonl:61936) → driver fail-closed en boucle ; réparé et relancé 21:33 local
(`F:\shogen-campagne\campagne\REPAIR-2026-09-18.md`).
