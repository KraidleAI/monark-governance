# G7 — GARDE-HELIUS-2a (`@monark/rpc-guard` multi-opérateur : Helius + Chainstack + keyless, prérequis de la migration Ukemi) — ACCEPTED
Orchestrateur `claude-fable-5-1`, 2026-09-21 16:33 UTC (`date -u`). Fusion `--no-ff` **`e98b54fb2d0900a6cba116b49ebebbd8ff61e569`** sur `lot/etude-suite` (branche `lot/garde-helius-2a`, base `5d177db`, G1 `dd9148f`, plis `c6a112d`, `4585b20`, `97eca86`).

## Vérifications de l'orchestrateur (exécutées sur l'arbre FUSIONNÉ, codes de retour capturés directement)
- `npm run ci` exit 0 : **744 tests / 743 pass / 0 fail / 1 skip** (`fetch_only_inside_client`, « SKIP until 1b », déclaré) ; `npm run lint` exit 0 ; `npm run lint:ratchet` exit 0, **69/69**. Aucune interaction inter-lots (troisième fusion de l'heure, après -f et -a1-bis). Journal `scratchpad/ci-garde2a.log`.
- R-25 (pathspec `ci.yml:65`, mesuré sur la fusion) : 818 + 122 = **940 ≤ 1 205** (17 fichiers ; sous le seuil de découpe ~1 150).
- Les trois plis confrontés à `sha256sum -c DELIVERED.sha256` (tout OK) et à `git show --stat` avant annonce.
- **Clôture de C-R-3 telle que prescrite par le validateur (pas de nouvelle passe), rejouée PAR MOI** sur un `git archive 97eca86` (`F:\tmp\g7-garde2a\`), avec SA sonde `r2-leakforms.mts` : `leakedPrefixChars=0` sur les sept cas (dont les deux corps tronqués à 150 et 145 caractères), indice de plage du corps 400 INTACT. Deux cas de mon cru sur le chemin JSON-RPC (clé à cheval à 150 et 120) : 0. Mutant « tronquer avant d'expurger » (`transport.ts:113`) : suite du paquet 46/0 → **ROUGE** sur `transport_error_key_straddling_truncation_never_leaks`, restauration byte-exacte (`3cb8216e…` = blob HEAD). Un seul site de troncature dans `transport.ts`, après `redact`.
- Clés factices, `fetch` bouchonné, aucun réseau dans ce G7. Périmètre du code : `packages/rpc-guard/**` seul ; `rpc.ts`, `record.ts`, `rpc2.ts` et le gel U-4b byte-identiques (mesuré par la G2-delta et le validateur).

## Chaîne
G0-ADDENDUM + checkpoint-1 delta (C-1..C-7) → G1 (`dd9148f`) → G2 séparée ‖ checkpoint-2 (régime B) : **C-G2-1..6 et C-V-1..6 convergents, trouvés indépendamment** (transport fail-open : erreur JSON-RPC à HTTP 200 résolue `undefined` ; plancher par opérateur non épinglé ; pas de chemin pour la course d'étalonnage ; caps et `tariff_version` par opérateur non épinglés) → pli `c6a112d` → ré-acceptation : **C-R-1 bloquant** (le pli « garder le corps » faisait fuir la clé par un corps repris sans préfixe `http`) → pli `4585b20` → G2-delta **PASS** ‖ passe limitée du validateur : **C-R-3 bloquant = C-GD-3**, trouvé par les DEUX instances (troncature à 160 caractères avant `redact` ⇒ préfixe de clé) → pli `97eca86` (expurger le corps BRUT puis normaliser/tronquer ; userinfo C-GD-1) → clôture par sonde non-LLM (ci-dessus) → G7.

## Résidus DÉCLARÉS (ADR-GARDE-HELIUS A-3bis) et items formés
- **C-GD-2** : formes de la clé transformées par le serveur (base64, hex) — non expurgeables par motif. Borne : le message n'est jamais publié, il va au journal local `rpcErrors`. **Item formé, déclencheur = G0 du lot 2b** : « pour un opérateur PAYANT, ne reprendre du corps que le code HTTP/RPC et l'indice de plage » (à trancher là : 2b consomme le corps 400 pour le découpage de plage).
- Clé coupée par un blanc inséré DANS le corps brut (pathologique) : résidu déclaré, même item.
- Chemin Chainstack payant du job quotidien Narabi : HORS garde pour le temps 1 (décision 118), lot NARABI-OPS-1d après release.
- `"requests"` retiré des unités (D-3) : report licite, déclencheur 1b. Skip `fetch_only_inside_client` : 1b.

## Tuyaux (règle Branchement)
Entrée : env (`HELIUS_API_KEY`, `CHAINSTACK_ETH_URL`, URLs keyless) + limites + cycles par opérateur. Sortie : `openGuardedClient(...)` → **consommateur = lot 2b** (recorder Ukemi) puis 1b (Bell). État : `<ledgerDir>/<cycle>/<op>.jsonl` + `.head` + `.lock`. Preuve : suite `packages/rpc-guard/test/**` (composition `openGuardedClient` → transport bouchonné → ledger → `reconcile`). **Registre : `upcoming`** — aucun chemin servi ne consomme encore le paquet ; il passe « branché » à la fusion de 2b + grep CI, et « built » à la première course rapprochée.

## error_origin
C-G2-1 (fail-open) : latent 1a, périmètre 2a — worker + plan (A-3) ; C-G2-2/4/5/6 : worker ; C-G2-3 : plan + validateur (mécanisme d'étalonnage) ; **C-R-1 : worker + validateur** (consigne « nettoyée de toute URL » alors que la menace est la clé) ; **C-R-3 : worker** (ordre des opérations) **+ validateur** (sonde sans troncature au tour précédent) ; régime B sans gel du worktree pendant une G2 (signalé par la G2) : orchestrateur — **règle : un worktree en revue est gelé, aucun commit avant le retour du relecteur** (appliquée dès la G2-delta).

## Suite (temps 1, priorité 1) — sous la décision 119
**Lot 2b** : migration du recorder Ukemi sous `@monark/rpc-guard` + grep CI (allowlist : 2ᵉ entrée à déclencheur -1d), G0 court à écrire avec l'item C-GD-2 en exigence d'entrée → prereg U-4b-1b committé SEUL (3 sha gelés + 4 transitifs, texte d'arrondi CA ruling (a), `--concordance-out`, protocole agrégat Chainstack A-4, mode `aggregate-calibration`) → course U-4b-1b (étalonnage ; plafonds de cycle actifs ; plafond touché ⇒ STOP + retour investisseur).
