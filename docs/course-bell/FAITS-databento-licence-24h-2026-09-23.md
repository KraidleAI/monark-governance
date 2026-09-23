# FAITS — PR-B-DBN n° 8 / porte G-b : règle Databento des « 24 hours » et licence EQUS.SUMMARY (lecture sur place, orchestrateur `claude-fable-5-1`, 2026-09-23 18:1x UTC)

Contexte : porte **G-b** de la première publication Bell (ADR-T1b §D11, RUNBOOK-bell) — « lire la page catalogue/licence EQUS.SUMMARY et le verbatim FAQ "24 hours" avant toute publication ; jusque-là `earliest_publish_utc = 16:00 ET + 24 h` ». Décision 53 (2026-09-20) avait lu la fiche du jeu dans le portail (« A license isn't required to access historical data », « official prices… without license fees »).

## 1. Pages lues [lu] (navigateur interne, 18:0x-18:1x UTC)

- `https://databento.com/docs/venues-and-datasets/equs-summary` — « Databento US Equities Summary », Dataset ID `EQUS.SUMMARY` ; schémas `ohlcv-1d`, `statistics`, `definition` seuls ; « Nasdaq NLS+ disseminates an end-of-day summary … at three different times » (≈ 16:15, 17:00, **20:15 ET**) ; « Databento only provides the last summary (from 20:15 ET) on the ohlcv-1d schema » (citations ≤ 25 mots). Aucune mention de licence ni de redistribution sur cette page (recherche « icens », « 24 hours », « redistribut » : 0).
- `https://databento.com/blog/introduction-market-data-licensing` — « Part 1: Introduction to market data licensing » (FAQ officielle, publique) :
  - §1.1 : « You need a license … if you're distributing data externally within 24 hours of receipt. You do NOT need a license to access historical (T+1) data. »
  - §1.7 : « Databento users don't need a license to access historical data, which we define as 24 hours into the past. » puis « you must have a license for historical data: You plan to redistribute the data. »
  - §1.8 : « exchanges require a license for any intraday or delayed data. »
- `https://databento.com/datasets/EQUS.SUMMARY`, `/faq`, `/docs/faqs` : la première et la deuxième répondent 404 ; la troisième est un index sans le texte des 24 h.
- `https://databento.com/portal/datasets/EQUS.SUMMARY` (fiche du jeu avec le libellé de licence) : **derrière connexion** (navigateur interne ET Chrome : page « Login | Databento ») — non contournée, aucun mot de passe saisi ; relecture confiée à l'investisseur (connexion dans Chrome), item **DBN-PORTAL-SHEET-1** (propriétaire investisseur+orchestrateur ; déclencheur : avant la première publication d'une valeur dérivée d'un cours Databento).

## 2. Conséquences (ruling orchestrateur, décisions 148/149)

- La règle des 24 h vise la **redistribution des données** reçues ; Bell ne redistribue pas les données Databento : il publie une **valeur dérivée** (gap %) et, aujourd'hui, **rien du tout côté cash** — la jambe cash est COUPÉE par conception (clé Databento retirée, D-2 Q6 ; contrôles TSLAx W3 : `no_close_ref` 4/4, `databento faults` HTTP 400, 0 valeur de clôture dans les bundles). La première publication (G-e, bundle TSLAx W3) ne contient donc **aucune donnée ni valeur dérivée Databento**.
- **Offset confirmé et conservé** : `earliest_publish_utc = 16:00 ET + 24 h` (conservateur : couvre « 24 hours of receipt » même pour une valeur dérivée) — aucun lot de changement de l'offset n'est requis avant G-e. Le refus du lot entier (R-T1b-1) s'applique.
- **Porte G-b : LEVÉE pour la première publication** (aucune donnée Databento publiée ; règle des 24 h lue et respectée par l'offset). Elle est **RE-DÉCLENCHÉE** (DBN-PORTAL-SHEET-1 : fiche de licence du portail relue par l'investisseur) avant toute publication d'un gap calculé sur une clôture Databento (jambe cash rallumée, CASH-KEYLESS-SKIP-1 / D-2 renversée).
