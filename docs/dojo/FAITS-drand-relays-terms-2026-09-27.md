# FAITS — relais publics drand (League of Entropy) : points d'accès et conditions d'usage (lecture sur place, orchestrateur `claude-fable-5-1`, navigateur interne + `curl` de contrôle, 2026-09-27 07:38-07:4x UTC) — item DOJO-DRAND-RELAY-TERMS-1

## Lu [lu, https://docs.drand.love/developer/http-api/, 07:38Z]
- « Our HTTP API has two version: a legacy one, v1, and a newer REST based API, v2 » ; « Currently only the drand.sh HTTP relays are supporting the v2 API. All relays do support the v1. »
- « The public League of Entropy drand mainnet endpoints are: » `https://api.drand.sh`, `https://api2.drand.sh`, `https://api3.drand.sh` (HTTPS, aussi HTTP), `https://drand.cloudflare.com` (HTTPS), `https://api.drand.secureweb3.com:6875` (HTTPS).
- Exemples d'usage publiés : `curl api.drand.sh/public/latest` ; `curl -s api.drand.sh/v2/beacons/quicknet/rounds/42 | jq` → `{"round": 42, "signature": "95a9f9f5…"}` (forme v2 : `/v2/beacons/<chaîne>/rounds/<n>`).
- « Our client libraries all support fetching beacons from these relays, as well as verifying the beacons' signatures ».
- Pied de page docs : « Licensed 2026 Randamu, Inc.™ Built with Docusaurus. »

## Conditions d'usage : NON PUBLIÉES sur les pages primaires
- `https://drand.love/terms` → **404** (07:38Z) ; `https://docs.drand.love/developer/http-api/v2/` → 404 (le lien « v2 » de la page pointe ailleurs, non résolu ici) ; aucune mention « terms », « acceptable use », « rate limit » sur `drand.love/`, `docs.drand.love/`, `api.drand.sh/`, `drand.cloudflare.com/info` (grep sur le HTML de contrôle).
- Relais Cloudflare : `https://www.cloudflare.com/website-terms/` existe (200) mais ne nomme pas drand (grep) ; il régit le site, pas explicitement le relais.

## Ce qui est établi / non établi
- **Établi** : cinq relais publics nommés par la documentation primaire, présentés comme points d'accès publics avec exemples `curl`, d'opérateurs distincts (drand.sh ×3, Cloudflare, secureweb3) ; forme v2 des rondes ; aucune condition d'usage ni limite de débit publiée.
- **Non établi** : limites de débit, disponibilité, garanties, droit d'usage automatisé quotidien (un GET par relais par jour — ordre de grandeur des exemples publiés) ; conditions de secureweb3.
- **Conséquence pour PR-2-2 (ADR-DOJO-PR-2 D-5, P-3 du rapport DOJO-RANDOMNESS-1)** : un GET par relais et par jour sur deux relais d'opérateurs distincts est conforme à l'usage que la documentation illustre ; **acte à conditions non publiées, déclaré** (« non établi ») ; la demande écrite aux opérateurs (P-3) reste un acte sortant sous go investisseur (Q-O5 du G0). Contrôle `curl` fait par l'orchestrateur sur `api.drand.sh/` et `drand.cloudflare.com/info` (GET de lecture sur place, 07:38Z, deux requêtes, aucune ronde lue) — la phrase « aucun appel » de la première rédaction était inexacte (`error_origin` orchestrateur, cp-1 PR-2-2 C-V-5).

## Complément [lu, https://docs.drand.love/developer/API-v2/drand-http-api/, 07:40Z] (lien réel de la doc v2 : `/developer/API-v2/drand-http-api`)
- « The version 2 of the public League of Entropy HTTP APIs are available at: Protocol Labs https://api.drand.sh/v2/ , https://api2.drand.sh/v2/ , https://api3.drand.sh/v2/ » (les trois relais v2 sont du MÊME opérateur, Protocol Labs ; Cloudflare et secureweb3 ne servent que la v1 selon la page « Our HTTP API » ⇒ pour deux relais d'opérateurs distincts, PR-2-2 combine v2 (drand.sh) et v1 (`drand.cloudflare.com/<hash>/public/<round>`), ou deux v1).
- Chaîne **quicknet** (3 s, unchained, Mainnet) : hash `52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971` ; default (30 s, chained) : `8990e7a9…b2ce` ; evmnet (BN254) : `04f1e906…c8c3` ; fastnet dépréciée. Testnet : `pl-us`/`pl-eu.testnet.drand.sh/v2`, `testnet-api.drand.cloudflare.com` (quicknet-t `cc9c3984…a9a5`).
- « If you're using drand in an application, it may be easier and more secure to use one of the client libraries, which will also perform verification of randomness rounds » ; « License : Apache 2.0 or MIT » (licence de la documentation/API, pas des conditions d'usage du service).
- Hash quicknet lu ici = à confronter à `read_rule.beacon_chain_hash` (FAITS PR-2 l.55) au G1 de PR-1b-3/PR-2-2.
