# LECTURES SERVIES — lettre SEC 4-927, v4 (2026-09-24)

**Provenance** : worker `claude-opus-5-5[1m]` (R-1 déclaré en tête de session), effort max ; mission orchestrateur « SEC-4927-v4 »
(décision 192, CHANTIERS:1426) ; horloge `date -u` ; réviseur = orchestrateur (R-21). Lecture seule du dépôt `F:\Monark`
(`lot/etude-suite` ; HEAD `b980215` au départ, `0db8748` autour des GET, `84add61` au relevé de 14:36:09Z ; commits de
l'orchestrateur, aucun ne touche `docs/sec-4927/`). Réseau : 12 GET publics seulement, listés au §1, sur `bell.monarkgate.tech` et `monarkgate.tech`.
Toutes les commandes node sont lancées sous la ceinture `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL
-u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY TEMP=F:/tmp
TMP=F:/tmp TMPDIR=F:/tmp`.

**Règle licence appliquée à CE fichier** (consigne de mission, décision confidentielle non citée) : aucune valeur de close, aucune
valeur dérivée d'une source sous licence n'est reproduite ici. Sont exclus : gT, drapeaux exceed1/2/5, VWAP, volume de base,
vol_ratio. Les corps servis bruts restent HORS dépôt, dans le scratchpad de session
`F:\tmp\claude\F--Shogen\90684fb2-4e7b-42e9-b820-f042dc4465f3\scratchpad\sec4927-v4\mirror\` et `...\site\`.

## 1. GET publics (journal `get/reads.log` du scratchpad, recopié tel quel)

Format : début de la requête (horloge locale UTC, ms), code HTTP, octets, sha256 du corps, URL. L'en-tête `Date` du serveur a
environ 3 s d'avance sur l'horloge locale (14:01:25.967Z local, `Date: Thu, 24 Sep 2026 14:01:29 GMT`).

```
2026-09-24T14:01:25.246Z 200 2407 fba1824d9dc4a9218246dc9dd14107f89a6f14d2250c62a6cea0e3db7ccfd28b https://bell.monarkgate.tech/timeline.jsonl
2026-09-24T14:01:25.967Z 200 14070 4564701add6e4231a67912ef45c7db640cd76dfe88302a96bc0e7722090508b9 https://bell.monarkgate.tech/state.json
2026-09-24T14:01:26.608Z 200 1202 ad8dd9b023bdfafade328d7ada5d17ae53d0de2133fcdf808237409d136fc39b https://bell.monarkgate.tech/provenance.json
2026-09-24T14:01:27.075Z 200 239 beec868a9e7d8e396de0f0541ab20572a2159068e8102bb303cb9af368b6ef81 https://bell.monarkgate.tech/bell/pubkey.json
2026-09-24T14:01:44.634Z 200 5326 a828489f64f112c8026b7c38f3710b82af1c97245fdba10b16170e39aed7a240 https://bell.monarkgate.tech/states/a828489f64f112c8026b7c38f3710b82af1c97245fdba10b16170e39aed7a240.json
2026-09-24T14:01:45.166Z 200 14070 4564701add6e4231a67912ef45c7db640cd76dfe88302a96bc0e7722090508b9 https://bell.monarkgate.tech/states/4564701add6e4231a67912ef45c7db640cd76dfe88302a96bc0e7722090508b9.json
2026-09-24T14:01:45.653Z 200 510 4935a259b7d6c2ddd929b4ecd440b6918d103c76b8a42b364df1b505f041ea3b https://bell.monarkgate.tech/provenance/4935a259b7d6c2ddd929b4ecd440b6918d103c76b8a42b364df1b505f041ea3b.json
2026-09-24T14:01:46.116Z 200 1202 ad8dd9b023bdfafade328d7ada5d17ae53d0de2133fcdf808237409d136fc39b https://bell.monarkgate.tech/provenance/ad8dd9b023bdfafade328d7ada5d17ae53d0de2133fcdf808237409d136fc39b.json
2026-09-24T14:02:00.525Z 200 96228 356109975a01a133c1f94c16e464f5858d9186cdc903e96891d8d9a547ee855d https://monarkgate.tech/bell/method
2026-09-24T14:02:01.364Z 200 64387 b41e521ca17156bc2d5af25cdf6c1a17de14d8f59d7eee1bb0c4511a944b268f https://monarkgate.tech/bell/anchors
2026-09-24T14:02:01.957Z 200 161626 54229cced926b3fd99715d79bbe5e9f47f967dc9161a292de09258249d767b55 https://monarkgate.tech/bell
2026-09-24T14:02:02.652Z 404 15891 6741c402b4355b05b1a3527326928e6faed3901f380fbbf9b69dc3baaf48ca96 https://monarkgate.tech/docs
```

Concordances (toutes [lu]) :
- `state.json` = `states/4564701a….json` = `state_sha256` de la ligne seq 2 = `bodies_sha256./state.json` de `docs/deploy-CA-bell.json`
  (sha du fichier `8942b97318582a11a56598c6d90bcb6c268d6da19977d12aaa1829130e00b396`, commit `3428dfa` ; 12 contrôles sur 12 `ok`,
  `tls.authorized: true`).
- `timeline.jsonl` = `fba1824d…` = miroir de l'étape 13 (JOURNAL-PROVENANCE, D-n Bell seq 2).
- `bell/pubkey.json` = `beec868a…` = `apps/bell/keys/bell-keyring.json` committé (commit `41cb08e`).
- `/docs` : 404 à 14:02:02Z (section Docs non en ligne).

## 2. Vérifications hors ligne (rejouables)

- **Chaîne** : sha256 de la ligne 1 de `timeline.jsonl` sans son saut de ligne = `4a417cf02289b4968c17e7dc9f61c013bf04d62c77e541993a05a20a6965f47c`
  = `prev_line_hash` de la ligne 2 ; sha256 de la ligne 2 sans saut = `ef3b06f2ff93951e200a6559b42ab66df5ac4aa38b86d3aa763c118c766f6464`
  = `line_hash` publié (JOURNAL-PROVENANCE, D-n seq 2, étape 10). Commande : `sed -n '<n>p' timeline.jsonl | tr -d '\n' | sha256sum`.
- **Signatures, liaison état/provenance, immuables** : `node F:/Monark/apps/bell/scripts/bell-verify.mjs --dir <scratchpad>/sec4927-v4/mirror
  --keyring F:/Monark/apps/bell/keys/bell-keyring.json` ⇒ exit 0 :
  `{"status":"consistent_with_supplied_keyring","trust_root":"supplied_keyring","lines":2,"head_seq":2,"publications":2,"active_key_id":"30fd26e80efac0d93e1f82c5f4372354ec71e5294f36d946d5167ce0ef39c672","voided_lines":[],"breaks":[],"scope":"a signature attests origin, never truth"}`.
  Script `bell-verify.mjs` sha `14a7e07c116ef3be70a8168f6113f46a214e04ccaa40bcba85b179f755324e8b`, `bell-chain.mjs` sha
  `521270a3793716c53b61ba1ee7ccec5aa4faa0f24406cba04e6a254398816ce7`. Le miroir contient uniquement les 8 corps GET du §1 (bell.monarkgate.tech).
- **Clés de la ligne de timeline** (les deux lignes) : `key_id, kind, prev_line_hash, provenance_sha256, published_at, runs, schema,
  seq, sig, state_sha256`. Ligne 1 : seq 1, `published_at` `2026-09-23T21:35:52.438Z`. Ligne 2 : seq 2, `2026-09-24T08:41:21.864Z`.
- **Preuves OpenTimestamps de la course** (lecture d'octets, pas une vérification cryptographique, aucun nœud Bitcoin interrogé) :
  `ots-heights.mjs` (copie du harnais v3, sha `f91027496843aadd5101914d85d640a626a356bd07f01791bd5011485d7aa7c5`) sur les 16
  `docs/course-bell/*.ots` au HEAD : 16 fichiers sur 16 portent au moins une attestation de bloc Bitcoin (1 à 4 selon le fichier ;
  hauteurs 968149 à 968305). Dernière mise à niveau : commit `13a9aed` (2026-09-23T23:32:20Z, « ots upgrade 16/16 »).
- **Preuve de la publication seq 2** : `docs/bell-publications/timeline-seq2-manifest.txt.ots` (non suivi par git au premier
  relevé ; committé ensuite par l'orchestrateur, `694e98b`, registre `docs/bell-publications/ANCHORS.md` colonne commit `1c78543`,
  HEAD `84add61` au relevé de 14:36:09Z ; sha `abfaf787237a40b95ff02a93ec23faa51010ce90d867ccb93a1b1eb21387f4ca` = preuve pendante
  du JOURNAL, 13:37 UTC) : relue à 14:36Z, 0 attestation de bloc, 4 engagements de calendrier en attente. Manifeste sha
  `602ff93d60dbf10fe96b0b2cfcd5b8ff439d2d0019f4daa362e9dd6ad3f16946`.

## 3. Recensement sans valeur sous licence (`state-safe.mjs`, scratchpad)

Ligne 2 de la timeline (signée), champ `runs[].records[]` :

| run | symbole | fenêtre d'observation (UTC) | n_fills | sessions | bell_sha |
|---|---|---|---|---|---|
| 0 | TSLAx | 2026-09-16T08:00:00Z → 2026-09-17T07:59:59Z | 3110 | 4 | `502720e3…` |
| 1 | AAPLx | 2026-09-16T08:00:00Z → 2026-09-17T07:59:59Z | 2619 | 4 | `5fbb856d…` |
| 2 | SPYx | 2026-09-16T13:30:00Z → 2026-09-16T19:59:59Z | 2244 | 1 | `5fde676e…` |

Ligne 1 (seq 1) : un seul run, TSLAx, même fenêtre, `n_fills` 3110, 4 sessions, `bell_sha` `f3b61af4…`.

État servi seq 2 (`4564701a…`), `digest.gaps[]` et `digest.volume[]` (champs sans valeur sous licence) :

| symbole | session | régime | date ET | n (fills) | écart | abstention | cash_cross | adv_period | n_bars = n_trading_days |
|---|---|---|---|---|---|---|---|---|---|
| TSLAx | after | — | 2026-09-16 | 112 | calculé | aucune | matched | 2026-08 | 21 = 21 |
| TSLAx | overnight-weekday | overnight-weekday | 2026-09-16 | 268 | calculé | aucune | matched | 2026-08 | 21 = 21 |
| TSLAx | pre | — | 2026-09-16 | 308 | calculé | aucune | matched | 2026-08 | 21 = 21 |
| TSLAx | regular | — | 2026-09-16 | 2422 | calculé | aucune | matched | 2026-08 | 21 = 21 |
| AAPLx | after | — | 2026-09-16 | 588 | calculé | aucune | matched | 2026-08 | 21 = 21 |
| AAPLx | overnight-weekday | overnight-weekday | 2026-09-16 | 901 | calculé | aucune | matched | 2026-08 | 21 = 21 |
| AAPLx | pre | — | 2026-09-16 | 360 | calculé | aucune | matched | 2026-08 | 21 = 21 |
| AAPLx | regular | — | 2026-09-16 | 770 | calculé | aucune | matched | 2026-08 | 21 = 21 |
| SPYx | regular | — | 2026-09-16 | 2244 | calculé | aucune | matched | 2026-08 | 21 = 21 |

Sommes des fills par symbole : 112 + 268 + 308 + 2422 = 3110 ; 588 + 901 + 360 + 770 = 2619 ; 2244 (= `n_fills` de la ligne signée).
Sessions par régime hors séance : **1** overnight-weekday pour TSLAx, 1 pour AAPLx, 0 pour SPYx ; **0 weekend, 0 holiday**.
Résidus par run (non nuls) : TSLAx `no_wrapper` 1, `por_unavailable` 1, `quorum_sampled` 1 ; AAPLx et SPYx : les mêmes plus
`multiplier_unit` 1 ; somme 3 + 4 + 4 = 11 (la page de méthode écrit « the served counters sum to 11 », l.94) ; `no_close_ref` 0.
Chaque entrée de volume porte sa fenêtre de session (premier et dernier fill) et `adv_period` ; chaîne `formula` servie :
« A = sum(v) / n_bars over the unadjusted daily bars of the underlying dated in adv_period = the calendar month before
session_date_et » (extrait ≤ 25 mots).

État immuable seq 1 (`a828489f…`) : 4 sessions TSLAx du 2026-09-16 (after, overnight-weekday, pre, regular ; n 112/268/308/2422),
**les 4 en abstention `no_close_ref`**, aucun écart calculé ; résidus non nuls : `no_close_ref` 4, `no_wrapper` 1,
`por_unavailable` 1, `quorum_sampled` 1.

## 4. Pages du site lues (texte extrait par `html2text.mjs`, numéros de ligne du texte extrait ; citations ≤ 25 mots)

`/bell/method` (corps `35610997…`, texte `519cce59…`) :
- l.37 « The reference close is read from a consolidated end-of-day source and cross-read on a second source at a fixed scale. »
- l.38 « In the latest record a gap is computed for 9 of its 9 session rows. »
- l.56 « adv_period = the calendar month before the session date; »
- l.69 « Per session: the session’s own pool fills, counted once per transaction, from its first fill to its last »
- l.121 « each line carries the previous line’s hash and a signature over its canonical bytes. »
- l.127 « https://bell.monarkgate.tech/bell/pubkey.json, the one URL of the key; this site links it and serves no copy »
- l.133 « on the dedicated host from which the records are published, operated by MONARK » (champ « generated »)
- l.144 « the collector (replay code below) is not exported yet. »
- l.152 « 17 (16 with a proof, 1 without) » ; l.154 « 16 of 16, read from the proof files when this page was built »
- l.156 « no anchor manifest lists its digests: it is signed and chained, not timestamp-anchored »
- l.163 « url_replayto be exported » (rendu du marqueur « upcoming » du code de rejeu)
- l.179 « With the same inputs, every gap and ratio is designed to recompute bit for bit. »
- l.189 « version dated 2026-09-24, the date of the collector source revision it restates, 3bda2ca »
- l.191 contact public servi : « bell@monarkgate.tech »
- liens effectifs (`href`) : `https://bell.monarkgate.tech/bell/pubkey.json`, `/bell/anchors`, `https://github.com/KraidleAI/monark`
  (pied de page) ; aucun lien de code de rejeu (marqueur « to be exported »).

`/bell/anchors` (corps `b41e521c…`, texte `9498d877…`) : l.7 « 17 lines in the register · 16 proof files · 16 with a Bitcoin block
record · 1 without proof » ; l.8 « status read from the proof file, not from a node ».

`/bell` (corps `54229cce…`, texte `a6b7658d…`) : l.118-122, champs de la mesure fondatrice rendus « upcoming » (`window_TSLAx`,
`t4_TSLAx_wkn_gt1`, `t4_TSLAx_wkn_gt5`, `n_TSLAx_wkn`, `t4_TSLAx_we_gt1`, `t4_TSLAx_we_gt5`, `n_TSLAx_we`).

Aucune page lue ne porte de clé ni de secret ; aucun formulaire, aucun téléchargement hors des 12 GET, aucune action de compte.
