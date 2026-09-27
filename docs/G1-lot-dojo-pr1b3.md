claude-opus-5-5[1m]

# G1 — PR-1b-3 MONARK Dōjō : rayon d'effet de la balise publique et des lectures sur l'ancre, le snapshot, le marcheur et le vérificateur

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Worker, effort high (mission), contexte frais. Générateur ≠ réviseur (G2 à venir).
- **Mission** : `F:/tmp/dojo/mission-g1-pr1b3.md` (21 l., sha256 `49632ad194a417bd941c5f3bfd1be58a450190a0397739cab0dd4f1de13d34b2`), horodatage de mission 2026-09-27T07:05Z. Horloge de la machine (`date -u`) à l'orientation : 07:02:26Z, soit avant l'horodatage de mission ; écart déclaré, heures du journal = `date -u`.
- **Base / HEAD** : worktree `F:/Monark-wt-dojo-1b3`, branche `lot/dojo-pr1b3`, HEAD `02884eb` (gel 1 de PR-2-1) ; `git status --short` **vide** à l'ouverture (07:02:26Z). `F:/Monark-wt-dojo` non touché.

## 0. Journal (`date -u`)

| Heure | Fait |
|---|---|
| 07:02:26Z | orientation : mission, HEAD, arbre propre ; ADR de lot lu (§0, D-5, D-8, §4, §5, plis cp-1 et G2) ; mère D-17 ; code gelé (`dojo-chain.mjs`, `dojo-verify.mjs`, `dojo-core.mjs` l.400-492, `bundle.ts`, `reading.ts` par recherche) ; fixture et 30 tests de `dojo-chain`/`dojo-verify` lus en entier ; rapport DOJO-RANDOMNESS-1 et FAITS PR-2 §4 par recherche |
| 07:02:26Z → 07:12:59Z (heures intermédiaires non relevées) | advisor intégré, avant toute écriture (§13) |
| 07:12:59Z → 07:15:06Z | code, fixture, trois retouches de tests existants ; `mk-nm.ps1` sur ce worktree : `entries: 220  monark: 10  fail: 0` ; 56/56 (tests Dōjō existants et ceux de PR-2-1) |
| 07:15:06Z → 07:18:31Z | oracle Python indépendant (§6) ; quatre tests nommés ; 34/34 sur `dojo-chain` + `dojo-verify` (après correction d'une contamination entre cas, §6) ; `tsc` 0, `eslint` 0, `lang-gate` OK |
| 07:19:02Z | clone `--no-local` `F:/tmp/dojo/pr1b3/clone` (HEAD `02884eb`) ; fichiers du lot copiés (`sync.sh`, `cmp` égal) ; R-25 = **273** |
| 07:20:00Z → 07:22:12Z | mutants : témoin 34 ok ; 14/14 tués par le test visé |
| 07:22:24Z → 07:29:17Z | `mk-nm.ps1` sur le clone (`entries: 220  monark: 10  fail: 0`) ; verrou pris sans attente ; sept gates : 7/7 exit 0 ; verrou rendu |
| 07:29:27Z → 07:32:44Z | verrou repris ; test 42 seul : exit 0, 2/2 ; verrou rendu |
| 07:33:08Z → 07:35:01Z | journal complété ; livraison `F:/tmp/dojo/pr1b3-deliver/` ; seconde consultation advisor ; `grep versionAt` sur les tests et la fixture : aucune référence ; §13, `error_origin` et Q-10 ajoutés ; livraison refaite |

## 1. Sources (niveau) et entrées

- **[lu]** ADR de lot `docs/adr/ADR-DOJO-PR-2.md` (sha256 `397e6d4c9e0a93033220d857187140d934e35c8ee0d19015d1a6c9199a6267a1`, 411 l.) : §0, D-1 l.117 (« Il précède toute ligne `anchor` publiée »), D-3 l.134 (fraîcheur à deux bornes), D-5 l.152-163, D-8 l.187-196, §4 PR-1b-3 l.238-240, §5, plis cp-1 et G2. Il fait foi.
- **[lu]** mère `docs/adr/ADR-DOJO-SNAPSHOT-1.md` (sha256 `fc93f66c…d35078`, 1103 l.) : D-17 (dont le dixième pli : « sept valeurs valides exigées dans la fenêtre, sinon pas de nouvelle version » ; fraîcheur t − 165 ≤ `publish_time` ≤ heure de lecture) ; ligne D-10 « - Codes de refus, liste ferm… » lue par les deux tests existants, inchangée.
- **[lu]** `docs/dojo/FAITS-pr2-lectures-2026-09-27.md` (sha256 `3b86f76b…4e11`, 83 l.) **l.55** : hash de chaîne complet, clé publique complète (96 octets), `period` 3, `genesis_time` 1692803367, schéma. Le FAITS précise : valeurs du billet, « à relire sur `/info` du relais avant d'être épinglées dans une ligne `anchor` ».
- **[lu]** rapport `F:/PRODUITS/dojo/randomness/RAPPORT-DOJO-RANDOMNESS-1-2026-09-27.md` (sha256 `a8686e58…329f33`, 326 l.) : **l.84** (règle ronde ↔ temps, r_d = ⌈(T_d − genesis)/period⌉ + 1, 32 554 612 pour le 2026-09-27, + 28 800 par jour) ; **l.156** (`period: 3`, `genesis_time: 1692803367`, clé « identique octet pour octet à celle des FAITS §4 l.55 », hash identique). Le rapport **tronque** le hash (`52db9ba7…e971`, l.92 et l.156) et ne recopie pas la clé : les valeurs complètes viennent donc de FAITS l.55, que le rapport déclare identiques. Aucune constante devinée.
- **[lu]** code au `02884eb` : `dojo-chain.mjs` (`9baa03c4…64d3`), `dojo-verify.mjs` (`5867b4df…7bf9d`), fixture (`f4a26d3b…55f6`), `dojo-core.mjs` l.400-492 (`beaconRound`, `readInstants`, `dayMinimum` de PR-2-1, signatures du journal `docs/G1-lot-dojo-pr2-1.md` §2.1), `bundle.ts` (`Read`, `readOk`, `composed`), `reading.ts` (`solUsd`).

## 2. Interfaces (ajouts seuls ; exports existants intacts)

- `dojo-chain.mjs` : `walkDojoTimeline` inchangé en signature ; son refus peut porter **`detail: "read_rule"`** (champ optionnel, présent seulement pour ce refus). `.d.mts` : `{ ok: false; seq; reason; detail?: "read_rule" }`. Aucune raison nouvelle (`DOJO_WALK_REASONS` inchangé). Contrôle `readRuleForm` interne (8 clés fermées ; hash 64 hex minuscules ; clé 192 hex minuscules ; schéma `bls-unchained-g1-rfc9380` ; `beacon_genesis_time` entier ≥ 0 ; `beacon_period` entier ≥ 1 ; `read_offset_s` 900 ; `read_tolerance_s` 600 ; `sol_usd_max_age_s` 165), appelé après `anchorForm` pour toute ligne `anchor`. Imports inchangés (`node:crypto`, bell-chain).
- `dojo-verify.mjs` : clés fermées `anchor` + `read_rule`, `snapshot` + `beacon` ; importe en plus `beaconRound`, `dayMinimum`, `readInstants` de `dojo-core` (même module, liste d'imports du fichier inchangée) ; `readsCheck` (interne) ; contrôle des valeurs journalières après la boucle ; le refus du marcheur garde son `detail` (`w.detail ?? "timeline.jsonl"`) ; rapport de succès : **`beacon_bls_verified: false`** et `scope` complété (« the beacon's BLS signature is not verified »). `.d.mts` : `beacon_bls_verified: false` dans le type du succès. Aucun code de refus nouveau (liste de 45 inchangée).
- Fixture `apps/dojo/test/helpers/dojo-fixture.ts` : `READ_RULE`, `roundOf`, `betaOf`, `instantsOf`, `priceOf`, `readsOf`, `versionOf` ajoutés ; `anchorBody` porte `read_rule` ; `snapshotBody` porte `beacon` et quatre `reads` ; `versionBody` dérive ses séries des lectures du jour ; **`versionAt` retiré** (§5).

### 2.1 Contrôles du vérificateur, codes et `detail`

| Contrôle | Code (D-8) | `detail` |
|---|---|---|
| `read_rule` absent ou hors forme (marcheur) | `timeline_malformed` | `read_rule` |
| `beacon` ≠ {round, signature} fermé, round entier ≥ 1, β ≠ 96 hex minuscules, bit 0x80 nul ou bit 0x40 posé ; `beacon` null hors jour abstenu sans lectures | `timeline_malformed` | `beacon` |
| `reads` : nombre ≠ K (0 sans balise), clés fermées du D-8 l.188, fractions réduites, `usd_per_sol` null ⇔ `usd_per_sol_publish_time` null, lecture manquée (`read_at` null) ⇒ emplacements, `pool_price`, `usd_per_sol` null ; K > 255 | `timeline_malformed` | `reads` (choix, Q-3) |
| T_d < `beacon_genesis_time`, ou ronde ≠ r_d | `read_instant_mismatch` | `beacon` |
| instant j ≠ t_{d,j} recalculé (g_d = `seed` de la ligne, β publiée, K, O) | `read_instant_mismatch` | `instant` |
| `read_at` ∉ [instant, instant + `read_tolerance_s`] | `read_instant_mismatch` | `read_at` |
| `usd_per_sol_publish_time` < instant − `sol_usd_max_age_s`, ou > `read_at` | `read_instant_mismatch` | `usd_per_sol` |
| valeur journalière k d'une `price_version` ≠ min réduit des `reads` non nuls du snapshot du jour `window_first_day` + k (snapshot absent ou min null compris) | `price_version_mismatch` | `pool_price_daily` ou `usd_per_sol_daily` |

- **Compatibilité (dit explicitement)** : une ancre **sans `read_rule`** (forme de la fixture PR-1b-2) est désormais **refusée** : `timeline_malformed` au seq de l'ancre, `detail` `read_rule`, par le marcheur puis par le vérificateur (clés fermées). Motif : ADR D-1 l.117, « Il précède toute ligne `anchor` publiée » ; aucune ancre réelle n'existe ; refus strict admis. La fixture est amendée (toute ancre porte `read_rule`).
- **BLS non vérifiée** : dit dans le code (commentaire de `readsCheck`), dans le rapport JSON (`beacon_bls_verified: false`, asserté par test) et dans `scope`.

## 3. Fichiers (sha256 après ce G1)

| Fichier | Nature | +/− (numstat) | sha256 |
|---|---|---|---|
| `apps/dojo/scripts/dojo-chain.mjs` | étendu | 12 / 1 | `3315217831cf3fba088e549449080169ada4ce33b733387363213185df68721a` |
| `apps/dojo/scripts/dojo-chain.d.mts` | étendu | 1 / 1 | `387b637ada0af4c1ec2f42ec794a4bd6cb8bc54526e33ba3beb3535b02dc84a3` |
| `apps/dojo/scripts/dojo-verify.mjs` | étendu | 50 / 6 | `98999b2dff9a44d62e6d2d2a6f9465f72508da5fa4071c0715cbb9bfb45dd376` |
| `apps/dojo/scripts/dojo-verify.d.mts` | étendu | 1 / 1 | `98d9f1bc70bda5af477510a18e74a090eff45bdc9bafe3e6bf6f022836f153f6` |
| `apps/dojo/test/helpers/dojo-fixture.ts` | amendé | 46 / 13 | `aa4151bcf4fd967b19c15b52d2e981d2992daf5e40eb0c4af1b540dbec1d7d51` |
| `apps/dojo/test/dojo-chain.test.ts` | un test ajouté | 32 / 0 | `2830cbc84dc217878b8e1185cc0d16c1bf64124022f387c2e68d5d2bbf2544e7` |
| `apps/dojo/test/dojo-verify.test.ts` | trois tests ajoutés, trois retouches | 102 / 7 | `3359f51ba40cd98c311a608063f76d0f71b2560d4a5fe6bd4716ff246251e106` |
| `docs/G1-lot-dojo-pr1b3.md` | créé (ce journal ; hors compte R-25, `ci.yml:82`) | — | rendu hors du fichier |

Gelés (`git diff --stat HEAD` ne les nomme pas) : `dojo-core.mjs` et `.d.mts`, `apps/dojo/src/**`, `apps/bell/**`, `package*.json`, `tsconfig.json`, `docs/adr/**`. Aucune dépendance ; modules intégrés seuls. La fixture reste **générée à l'exécution** (aucun fichier de données ajouté).

## 4. Fixture amendée (valeurs citées, SYNTHETIC déclarées)

- `READ_RULE` : hash `52db9ba7…e971` et clé `83cf0f28…ece45a` complets, `genesis_time` 1 692 803 367, `period` 3 : FAITS PR-2 l.55 (et rapport l.156) ; schéma : ADR D-5 l.154 ; 900 : l.152 ; 600 : l.154 ; 165 : D-3 l.134. Valeurs de test : une ancre publiée relit d'abord la balise sur deux relais (D-5 l.154) — ce G1 ne l'a pas fait (aucun réseau).
- Ronde `roundOf(d)` = ⌈(T_d − genesis)/period⌉ + 1 (rapport l.84), recodée dans la fixture, jamais importée de `dojo-core`.
- β `betaOf(d)` : 48 octets **SYNTHETIC** (sha256 d'un libellé), bit 0x80 posé, bit 0x40 nul ; ce n'est pas une signature (la BLS n'est pas vérifiée, D-5 l.157).
- Instants `instantsOf` recodés (SHA-256(g_d ‖ "dojo-read" ‖ octet(i) ‖ β), gros-boutiste, mod 85 500, + T_d + 900, triés).
- Lectures `readsOf`, **SYNTHETIC**, quatre par jour : 1) prix du pool (b + 1)/7, SOL/USD 301/2 ; 2) b/7 et 150/1 (les minima) ; 3) prix du pool null (pas de quorum), 152/1 ; 4) lecture manquée (instant et nulls, D-8 l.188). b = 10 + d − FIRST (au moins 1) ; SOL/USD publié 41 s avant l'instant ; lu 60 s après. Les valeurs journalières de la version 1 restent (10 + k)/7 et 150 : p = 39/140 inchangé (test existant épinglé).
- `versionBody(v, first, at)` : séries = `priceOf` des sept jours et 150, donc égales aux minima des lectures de chaque jour ; `versionOf(v, first, at, pi, sigma)` : version d'une série donnée, p et seuils par `dojo-core` (usage déjà en place dans la fixture).

## 5. Retouches des tests existants (forcées par D-8 et mère D-17 ; déclarées)

1. `dojo_verify_accepts_a_signed_served_fixture` l.58 : le jour retiré passe de l'étape 5 (jour FIRST+3, **dans** la fenêtre de la version 1) à l'étape 10 (FIRST+7, hors fenêtre). Motif : une fenêtre à jour manquant n'a pas sept valeurs valides ⇒ la version est refusée (`price_version_mismatch`), ce que le test `dojo_verify_daily_values_follow_the_snapshot_reads` asserte désormais. La propriété d'origine (« un jour sans ligne de snapshot est manquant pour toute adresse ») reste testée.
2. `dojo_verify_refuses_a_price_version_on_history_days` : `tl` porte sept snapshots au lieu de trois, pour que le cas témoin « a window of read days » ait les sept jours de sa fenêtre. Les deux cas refusés restent `price_version_mismatch @3` (DOJO-WALK-GAPS-1 (a), contrôle en boucle, avant le nouveau).
3. `versionAt(2, …, "300")` (deux appels) → `versionBody(2, …)` ; import retiré. Motif : un SOL/USD libre à 300 sur des jours dont les lectures portent 150 est exactement M-24. Contrôle que les cas M-4 gardent leur sens, calcul à la main : v2 (fenêtre FIRST+2..FIRST+8) a pour valeurs 12/7…18/7, médiane 15/7 × 150/1000 = 9/28 ; T_1 = ⌈5 000 000 × 28/9⌉ = 15 555 556 ; au jour 31, A a 150 000 000 validés ⇒ ⌊150 000 000 / 15 555 556⌋ = 9 unités (8 sous v1) : une ligne diffère, `threshold_mismatch @13` reste atteint (vert).

Aucune autre assertion existante n'est modifiée. Les 44 tests existants (14 `dojo-chain`, 16 `dojo-verify`, 12 `dojo-core-hold`, 2 `dojo-core-curve-merkle`) et les 12 de PR-2-1 sont verts.

## 6. Tests

- **Nommés (ADR §4 PR-1b-3)** :
  - `dojo_walk_requires_the_read_rule` (`dojo-chain.test.ts`) : ancre sans `read_rule`, null, chacune des 8 clés retirée, clé en trop, autre schéma, 899, « 900 » en texte, 601, 166, période 0, genèse −1 et 1,5, clé de 95 octets, clé en capitales, hash de 31 octets ⇒ `timeline_malformed @1 read_rule` ; seconde ancre sans `read_rule` ⇒ `@6 read_rule` ; fixture ⇒ ok. **M-K3.**
  - `dojo_verify_recomputes_the_read_instants` : ronde et instants du jour de lecture 1 épinglés (voir oracle) ; ancre sans `read_rule` ⇒ `timeline_malformed @1 read_rule` (le `detail` du marcheur traverse le vérificateur) ; r_d ± 1, genèse après le jour ⇒ `read_instant_mismatch @3 beacon` ; instant + 1 s, deux lectures permutées, β altérée à forme gardée ⇒ `@3 instant` ; bit d'infini, bit de compression nul, β de 47 octets, clé en trop, balise null un jour compté ⇒ `timeline_malformed @3 beacon` ; `read_at` à −1 ms et à +601 s ⇒ `@3 read_at`, à +600 s ⇒ ok ; trois lectures, clé en trop, fraction non réduite, lecture manquée portant un prix ⇒ `timeline_malformed @3 reads` ; jour abstenu sans balise ni lectures (jour 9, hors fenêtre) ⇒ ok ; `beacon_bls_verified: false` au rapport. **M-20, M-21, M-22.**
  - `dojo_verify_refuses_a_stale_sol_usd_reading` : `publish_time` = instant − 165 ⇒ ok ; − 166 (lectures 1 et 2) ⇒ `read_instant_mismatch @12 usd_per_sol` ; = `read_at` ⇒ ok ; `read_at` + 1 s ⇒ `usd_per_sol` ; valeur sans heure de publication ⇒ `timeline_malformed @12 reads`. **M-23.**
  - `dojo_verify_daily_values_follow_the_snapshot_reads` : minima recodés dans le test depuis les lectures servies (fractions en BigInt, pgcd), égaux aux deux séries de la version 1, épinglées à la main ((10 + k)/7 réduites) ; série altérée **avec p et seuils recalculés** (le contrôle `unit_price` passe, seul le nouveau refuse) : valeur du pool au plus grand relevé, SOL/USD à 301/2, valeur non réduite ⇒ `price_version_mismatch @10 pool_price_daily` / `usd_per_sol_daily` ; plus petit relevé d'un jour relevé, jour à prix tous nuls ⇒ `@10 pool_price_daily` ; jour de fenêtre sans snapshot ⇒ `@9 pool_price_daily`. **M-24.**
- **Oracle indépendant** : `F:/tmp/dojo/pr1b3/oracle.py` (Python 3.14.5, `hashlib` ; sha256 `c8650e71ae90dca63af95bbffd85892f85d5b720c884effcd932ab4fd2dc1c7f`) : T = 1 790 899 200 (2026-10-02) ; r_d = **32 698 612** ; r(2026-09-27) = 32 554 612 (= rapport l.84 et ADR §4 PR-2-1) ; instants 03:08:57, 09:42:29, 18:02:34, 22:46:37 UTC. Le test épingle ces valeurs à la main ; ni le vérificateur ni `dojo-core` ne les fournissent.
- **Défaut trouvé et corrigé pendant le G1** : `render` copie les corps superficiellement ; les premières versions des nouveaux tests mutaient `beacon` et `reads` partagés entre cas (r_d + 1 puis r_d − 1 revenaient à r_d). Correction : `fresh()` clone les corps (`structuredClone`) avant chaque cas. Les tests existants ne modifient que des champs de premier niveau (non touchés).
- **Commandes** (worktree, puis clone) : `node --test --test-reporter=tap apps/dojo/test/dojo-chain.test.ts apps/dojo/test/dojo-verify.test.ts` ⇒ `tests 34, pass 34, fail 0` ; les cinq fichiers Dōjō ⇒ 60/60 (56 avant l'ajout des quatre tests) ; `npx tsc --noEmit` 0 ; `npx eslint` des 7 fichiers 0 erreur (les `.mjs`/`.d.mts` sont ignorés par la configuration, avertissement seul) ; `node scripts/lang-gate.mjs` OK.

## 7. R-25 (méthode `ci.yml:82` / `:90`, clone `--no-local`, base `02884eb`)

- Script `F:/tmp/dojo/pr1b3/r25.sh` (sha256 `5beabd7f43d68cff75d8aa10317c1810fb95154f9c772395b35a91e6b43a80a9`) = `pr2-1-corr/r25-corr.sh` au chemin de la copie d'index près (`diff` : trois lignes) : pathspec de `ci.yml:82` (20 jetons) et `awk` de `ci.yml:90` extraits par `sed` ; copie d'index propre ; `git diff --shortstat 02884eb`.
- Résultat sur `F:/tmp/dojo/pr1b3/clone` : `7 files changed, 244 insertions(+), 29 deletions(-)` ⇒ **273**. Ventilation : `dojo-chain.mjs` 13, `.d.mts` 2, `dojo-verify.mjs` 56, `.d.mts` 2, fixture 59, `dojo-chain.test.ts` 32, `dojo-verify.test.ts` 109.
- Estimation ADR : 145 ascendantes, cible ≤ 304 (×2,1), STOP 1 150 ; seuil d'arrêt de la mission 320. **273 ≤ 304**, aucune coupe. Mesure/estimation = ×1,88 (sous le facteur ×2,1 retenu).

## 8. Mutants (copie hors dépôt `F:/tmp/dojo/pr1b3-mutants/`)

Harnais `mutants.mjs` (sha256 `2f703e40f0ea933a1748011989faf93bfffff7f54e56940d2cf2e2f90b5eddf5`), calque de `pr2-1-corr/corr-mutants.mjs` : remplacements exacts, nombre d'occurrences contrôlé, dans une copie des 11 fichiers nécessaires sous `<id>/` ; TAP gardé ; **tué seulement si le test visé est « not ok »** ; témoin d'abord : exit 0, 34 ok, 0 not ok. `RESULTS.txt` sha256 `2527a580dc24f5ba2d38f11da23e3397da2a0e0c4874c5b1a9a9f8a124a57152` ; sources du clone inchangées au sha256 après la passe. Node v24.15.0 ; 07:20:00Z → 07:22:12Z.

| Mutant | Écriture | Test visé | Verdict |
|---|---|---|---|
| M-K3a | contrôle `read_rule` du marcheur retiré | `dojo_walk_requires_the_read_rule` | tué (aussi rouge : `…recomputes_the_read_instants`) |
| M-K3b | `read_rule` présent, décalage non contrôlé | idem | tué |
| M-20a | comparaison des instants retirée | `dojo_verify_recomputes_the_read_instants` | tué |
| M-20b | instants comparés comme ensemble, pas dans l'ordre | idem | tué |
| M-21 | bits de compression et d'infini de β non contrôlés | idem | tué **par exception** : `readInstants` de `dojo-core` lève (« a beacon signature is a compressed, finite point »), le test attend un refus nommé. β altérée à forme gardée est prise par la comparaison des instants (M-20a) : le vérificateur ne peut pas distinguer β altérée et instants altérés sans la BLS |
| M-22a | contrôle de ronde retiré | idem | tué |
| M-22b | r_d ± 1 admises | idem | tué |
| M-23a | borne basse de fraîcheur retirée | `dojo_verify_refuses_a_stale_sol_usd_reading` | tué |
| M-23b | une seconde de plus admise (166 s) | idem | tué |
| M-24a | contrôle des valeurs journalières retiré | `dojo_verify_daily_values_follow_the_snapshot_reads` | tué |
| M-24b | série SOL/USD non contrôlée | idem | tué |
| M-24c | jour de fenêtre sans snapshot sauté | idem | tué |
| P-1 (sonde) | `detail` `read_at` écrit `instant` | `…recomputes_the_read_instants` | tué |
| P-2 (sonde) | `detail` du marcheur perdu par le vérificateur | idem | tué |

**14/14** tués par le test visé.

## 9. Oracle (sept gates sur clone, sous verrou d'hôte) et test 42

- Scripts (hors dépôt) : `F:/tmp/dojo/pr1b3/locked.sh` (sha256 `96c526328476f952b13cb87e1e7433bb3c032a6322ad192253b09fad24bfdec2`) = `pr2-1-corr/corr-locked.sh` au propriétaire près (« G1 PR-1b-3 », `diff` : deux lignes) : `mkdir F:/tmp/oracle-lock` atomique, `owner.txt`, attente 60 s jusqu'à 90 min, retrait dans le piège EXIT ; `run-oracle.sh` (`9ecdd706c70ede164f87c328c4b0ba188cf1b667cb424d13cec74a7b2eace270`) = `corr-run-oracle.sh` au dossier temporaire près (une ligne) : `npm run <gate>` pour les sept gates, codes capturés directement, huit variables payantes retirées (`env -u`), TEMP/TMP sur F: ; `t42.sh` (`6117551fb8c1d014be39ab256c74ba80fcea2c8760fe8d027b7f8bdb490723f5`). Arbre : `F:/tmp/dojo/pr1b3/clone` (clone `--no-local` de `02884eb`, sept fichiers du lot copiés par `sync.sh` (`247a1bab…53f0`), égaux octet pour octet au worktree, `cmp` après les passages) ; Node v24.15.0.
- **Sept gates** (verrou pris sans attente, 07:22:24Z → 07:29:17Z ; `oracle-run.log` `ad2ddbb6…6de7`) : `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check` : **7/7 exit 0**. `test` : **1 391 tests, 1 389 pass, 0 fail**, 0 annulé, 2 skipped (préexistants ; 1 387 au gel 1 + 4 tests de ce lot) ; les quatre tests nommés ✔ (relevés par nom) ; `lint:ratchet` 69/69 ; `lang:gate` OK, 0 occurrence. sha256 : `test.log` `4b9433e30971530cfb2f4219714dbcf66fc7d551a03f145026fd27bbce9f2931` ; `gate-vocab` `f1b1a916…be2b`, `typecheck` `03481a8f…2051`, `lint` `f845417c…4a4f`, `lint-ratchet` `45ede4ce…6b42`, `lang-gate` `b22ac8f8…0dd7`, `export-check` `2f9645a9…f16` (les six égaux à ceux du G1, du G2 et de la correction de PR-2-1).
- **Test 42 à part, après la suite** (verrou repris 07:29:27Z → 07:32:44Z, sans attente) : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` sur le même clone ⇒ exit 0, `tests 2, pass 2, fail 0` ; `export_public_no_governance_no_french — clean public export (test 42)` ✔ en 196 s (`test42.log` `c9e0fd22d0b01014ebee79eeef19352f24bd3120107db6b4f008903037f5ad13`). Il était aussi vert dans la suite (359 s). Verrou absent après chaque passage.
- **Export** : `apps/dojo/**` n'est pas exporté (`scripts/export-public.mjs` ne nomme pas `dojo` : 0 occurrence) ⇒ aucun export local à rejouer pour ce lot (sans objet).

## 10. Tuyaux (règle Branchement, ADR-M018 D3)

| Pièce | Entrée (qui produit) | Sortie (qui consomme) | État | Test non-LLM | Branché ? |
|---|---|---|---|---|---|
| `read_rule` de l'ancre | éditeur PR-3a (valeurs relues sur deux relais, D-5 l.154) | marcheur (forme), vérificateur (ronde, instants, fenêtre, fraîcheur) | ligne `anchor` de `timeline.jsonl` servi | `dojo_walk_requires_the_read_rule`, `dojo_verify_recomputes_the_read_instants` | **non** : aucune ancre publiée ; éditeur PR-3a absent |
| `beacon` et `reads` du snapshot | paquet du jour de PR-2-2 (`publish/day.json`) → éditeur PR-3a (TU-1c) | vérificateur amendé | ligne `snapshot` servie | les trois tests `dojo_verify_*` de ce G1 (fixture signée) | **non** : TU-1c absent (déclencheur G7 de PR-3a) |
| vérificateur amendé | arbre servi | `dojo_collect_to_verify_end_to_end` de PR-2-2 (déclaré, ADR §3 et §4 PR-2-2) | — | ce test n'existe pas encore | **déclaré, pas encore branché** : déclencheur = G1 de PR-2-2 |

Le seul consommateur actuel de ces formes est la fixture signée des tests : la pièce reste **`upcoming`** dans tout registre public (règle Branchement), quel que soit l'état du code.

## 11. Ce que je n'ai pas fait

- Aucune relecture des constantes de la balise sur un relais (aucun réseau) : les valeurs de la fixture sont celles du billet, lues par l'orchestrateur (FAITS l.55), dites « de test ».
- Aucune vérification BLS (forme (i) écartée, D-5).
- Aucun contrôle croisé entre `accounts_concordant`/`accounts_no_quorum` des `reads` et les lignes du jour (non demandé par le D-8).
- Aucun contrôle de l'ordre de publication entre une version et les snapshots de sa fenêtre (Q-6).
- `dojo_collect_to_verify_end_to_end` : relève de PR-2-2.
- Aucun `git add/commit/stash/checkout/branch` ; `git` en lecture seule dans le worktree ; un `git clone --no-local` hors dépôt ; `GIT_INDEX_FILE` vers une copie d'index du clone seulement (R-25). Rien sur C: ; aucun réseau ; commandes < 6 Ko (les fichiers de remplacement longs sont écrits par l'outil d'écriture, hors dépôt). Jonctions `node_modules` du worktree et du clone laissées en place (retrait par `rm-nm.ps1 -Tree` seulement).

## 12. Questions (à l'orchestrateur)

- **Q-1 (forme de β)** : les bits 0x80/0x40 sont classés **forme** (`timeline_malformed`, `detail` `beacon`) d'après D-8 l.192 (« forme de `beacon` ») ; D-5 l.157 les listait avant « sinon `read_instant_mismatch` ». Confirmer.
- **Q-2 (β altérée)** : une β altérée à forme gardée donne `read_instant_mismatch` avec `detail` **`instant`** (les instants recalculés diffèrent des publiés), non `beacon` : sans BLS, le vérificateur ne sait pas lequel des deux est altéré. Confirmer, ou préférer `beacon`.
- **Q-3 (`detail` `reads`)** : la forme des `reads` sort sous `timeline_malformed` avec `detail` `reads` (nom de champ, convention `dojo-verify.mjs:17`) ; ce nom n'est pas dans la liste de C-V-1 (b). Admettre `reads`, ou le ranger sous `instant` ?
- **Q-4 (fraîcheur)** : les deux bornes de D-3 l.134 sont contrôlées (t − 165 ≤ `publish_time` ≤ `read_at`) ; la mission citait la borne basse seule.
- **Q-5 (jour sans balise)** : `beacon` null est admis seulement pour `status` `abstained` et `reads` vide (motif `beacon_unavailable`) ; un jour abstenu pour le mint porte sa balise et K lectures. Confirmer cette forme pour l'éditeur PR-3a.
- **Q-6 (ordre version / snapshots)** : le contrôle des valeurs journalières cherche le snapshot du jour **n'importe où** dans la ligne de temps (choix : garder vert le cas M-4 existant, où la version 2 est publiée le jour FIRST+8 à 02:00, avant la fin du dernier jour de sa fenêtre et avant son snapshot). Faut-il exiger que les sept snapshots précèdent la version, et que le marcheur refuse une version publiée avant la fin de sa fenêtre ? (touche un test existant et le marcheur ; ≈ +5 lignes).
- **Q-7 (jour abstenu dans une fenêtre)** : le D-8 dit « minimum des `reads` non nuls du snapshot de ce jour », sans condition de statut ; le paquet de PR-2-1 donne des valeurs journalières nulles pour un jour abstenu. Faut-il refuser une version dont un jour de fenêtre est `abstained` ?
- **Q-8 (lecture manquée)** : `read_at` null exige emplacements, `pool_price`, `usd_per_sol` et heure de publication nuls ; les deux comptes restent libres (entiers). Même question que Q-C1 de PR-2-1 pour le paquet.
- **Q-9 (K > 255)** : refusé sous `timeline_malformed` `reads` (octet(i)) pour tout snapshot à balise ; la ligne `anchor` n'en dit rien. Faut-il le borner dans `anchorForm` ?
- **Q-10 (écart au texte du §4 PR-1b-3)** : l'ADR écrit « les 44 tests existants restent verts sur la fixture amendée » ; trois tests existants ont en plus été retouchés (§5), chaque retouche étant forcée par D-8 l.194 et la mère D-17. Une ligne datée de l'ADR (pli G2 de PR-1b-3) est-elle due pour consigner cet écart ?

## 12 bis. `error_origin` proposés (à assigner au G7 ; proposés, non tranchés)

- Contamination entre cas des premiers brouillons des nouveaux tests (`render` copie les corps superficiellement ; `beacon` et `reads` partagés) = **générateur de ce G1**, trouvée par le premier passage des tests et corrigée en séance (`fresh()`, §6), avant toute mesure livrée.
- Trois retouches de tests existants (§5) = **générateur de PR-1b-2** (`versionAt` à taux libre ; jour retiré choisi dans une fenêtre de version) **ou planificateur du G0 de PR-2** (le §4 PR-1b-3 prévoit la seule fixture amendée alors que D-8 l.194 et la mère D-17 invalident ces trois cas). À trancher au G7.

## 13. Advisor

- Avant l'écriture (07:0x → 07:12Z) : collisions des trois tests existants avec D-8 et leur retouche ; valeurs par jour et fractions réduites ; marcheur sans import de `dojo-core` et `detail` optionnel ; exceptions de `dojo-core` à devancer ; contrôle journalier après la boucle ; isoler M-24 en recalculant p ; M-21 tué par exception à dire tel quel ; R-25 tôt. Chaque point vérifié sur pièce ; tous suivis.
- Après la livraison (07:33Z → 07:35Z) : `error_origin` proposés absents (ajoutés, §12 bis) ; Q-10 (écart au texte du §4) à poser (ajoutée) ; relivrer après la mise à jour du journal (fait) ; ne plus toucher aux sept fichiers du lot (respecté : aucun changement après la mesure, `cmp` égal) ; aucune référence orpheline à `versionAt` (vérifié). Tous suivis.

## 14. `git status --short` final (07:33:08Z)

```
 M apps/dojo/scripts/dojo-chain.d.mts
 M apps/dojo/scripts/dojo-chain.mjs
 M apps/dojo/scripts/dojo-verify.d.mts
 M apps/dojo/scripts/dojo-verify.mjs
 M apps/dojo/test/dojo-chain.test.ts
 M apps/dojo/test/dojo-verify.test.ts
 M apps/dojo/test/helpers/dojo-fixture.ts
?? docs/G1-lot-dojo-pr1b3.md
```

Jonction `node_modules` posée sur ce worktree par `mk-nm.ps1` (ignorée par git, absente de la liste). Livraison : `F:/tmp/dojo/pr1b3-deliver/` (les 7 fichiers du lot, ce journal, `harness/` : `mutants.mjs`, `RESULTS.txt`, `oracle.py`, `r25.sh`, `sync.sh`, `locked.sh`, `run-oracle.sh`, `t42.sh`) et `DELIVERED.sha256` ; sha256 de ce journal rendu hors du fichier (dans `DELIVERED.sha256`).

## 15. Corrections après G2 (C-G2-1 à C-G2-7)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Correcteur, instance fraîche, distincte du relecteur G2 ; effort high (mission).
- **Mission** : `F:/tmp/dojo/mission-corr-pr1b3.md` (14 l., sha256 `08c9d71aa1ea4fd589ccb71a4f2709c3ae8e06efa88d4b030ecefc01be2f2c7b`), horodatage 2026-09-27T08:35Z ; `date -u` à l'ouverture : 08:29:51Z (avant l'horodatage de mission ; heures ci-dessous = `date -u`).
- **Entrées lues** : rapport G2 `F:/tmp/dojo/g2-pr1b3/G2-report.md` (sha256 `bee6d537ae6f4dea53f8f5803713bd8b1e4aec4a865ed0e1d02f18cfb248f0f9`, 124 l., lu en entier), son prototype `fix-patch.mjs` et ses listes de mutants ; ce journal (§0 à §14) ; ADR de lot (D-5, D-8, §4 PR-1b-3, `397e6d4c…`) ; mère `fc93f66c…d35078` (D-17 ; table des emplois l.970, non touchée) ; mission du G1.
- **État d'entrée** : HEAD `02884eb` ; sept fichiers du lot et ce journal aux sha256 du §3 et du G2 (relus à 08:35Z) ; copie de cet état dans `F:/tmp/dojo/pr1b3-corr/before/`.
- **Discipline** : aucun `git add/commit/stash/checkout/branch` dans le worktree ; aucun réseau ; rien sur C: ; clone `--no-local` `F:/tmp/dojo/pr1b3-corr/clone` ; suite complète et test 42 sous le verrou d'hôte (« corr PR-1b-3 »), processus node relevés avant et après (C-V-4).

### 15.1 Journal (`date -u`)

| Heure | Fait |
|---|---|
| 08:29:51Z → 08:35:08Z | orientation : mission, rapport G2, prototype, code, tests, ADR ; advisor intégré avant écriture (§15.9) ; copie de l'état G1 |
| 08:35Z → 08:40:11Z | patch `corr-patch.mjs` appliqué au worktree (remplacements exacts, occurrences contrôlées), 34/34 ; R-25 mesuré 325 puis compacté (§15.4) à 316, puis 317 avec le test de la garde `published_at` |
| 08:38:46Z → 08:39:00Z | `tsc --noEmit` 0 ; `eslint` des 7 fichiers : 0 erreur (4 avertissements « ignored » des `.mjs`/`.d.mts`) ; `lang-gate` OK : état intermédiaire, avant la ligne du test de la garde (08:40:11Z) ; refaits sur l’état final à 09:09:55Z (dernière ligne) |
| 08:39:44Z | clone `--no-local` `F:/tmp/dojo/pr1b3-corr/clone` (`02884eb`) ; `sync.sh` ; R-25 |
| 08:40:40Z → 08:45:00Z | mutants : témoin 34 ok ; 27/28 tués par le test visé, F-Q6v équivalent (§15.5) |
| 08:45:13Z → 08:52:05Z | `mk-nm.ps1` sur le clone (`entries: 220  monark: 10  fail: 0`) ; sept gates sous verrou (pris sans attente à 08:45:17Z, 7/7 exit 0) |
| 08:46:09Z | lignes datées de l'ADR de lot (ajout seul, §15.7) |
| 08:46:33Z → 08:46:58Z | `apps/dojo/test` (5 fichiers) deux passages sur l'état final : 60/60 et 60/60 |
| 08:52:12Z → 09:07:22Z (attente du verrou 660 s ; test 09:03:30Z → 09:07:22Z) | test 42 seul sous verrou |
| 09:09:55Z → 09:10:07Z | sur l’état final du worktree : `tsc --noEmit` 0, `eslint` des 7 fichiers 0 erreur (`harness/tsc.log`, `harness/eslint.log`) ; §0 à §14 de ce journal égaux octet pour octet à l’état G1 (`cmp` des 187 premières lignes) ; 0 octet hors ASCII et 0 occurrence de `garanti|guarant|certif` dans les sept fichiers du lot ; `lang-gate` et `gate:vocab` OK sur le worktree (09:08Z) |

### 15.2 Corrections appliquées (numérotation du rapport G2)

- **C-G2-1 (Q-6)** :
  - marcheur `dojo-chain.mjs` `versionCheck` : `published_at` hors forme ⇒ `timeline_malformed` (garde demandée par le G2, absente de son prototype) ; puis `price_version_mismatch` si le jour d'effet est au plus le dernier jour de fenêtre (inchangé), **ou** si `published_at` < T(`window_first_day` + 7) (publiée avant la fin de sa fenêtre), **ou** si le dernier `snapshot` vu n'a pas pour jour au moins `window_first_day` + 6 (`st.last === null || st.last < first + W - 1` : contrôle d'ordre décidé par l'orchestrateur). Laxité du marcheur sur le jour d'effet (borne basse seule, journal PR-1b-1 Q-5) conservée.
  - vérificateur `dojo-verify.mjs` : le `snapshot` d'un jour de fenêtre compte seulement s'il précède la version (`s.seq > v.seq` ⇒ nul) ; même code et même `detail` qu'un jour sans snapshot.
  - tests : `dojo_walk_price_version_takes_effect_after_its_window` : publiée à FIRST+6 23:30 ⇒ `price_version_mismatch` @10 ; à FIRST+7 00:00 ⇒ ok (borne) ; `published_at` = « 2026-10-09 » (date sans heure) ⇒ `timeline_malformed` @10 (tue F-Q6g).
  - **réécritures de tests existants (déclarées)** :
    1. `dojo_walk_snapshot_names_the_version_in_force` l.230 (décision de l'orchestrateur) : `early` ⇒ `refused(9, "price_version_mismatch")`, libellé « published before the snapshot of its window's last day (Q-6 of PR-1b-3) ». Le seq est **9** (la version déplacée à l'indice 8), non 10 comme l'écrivait le G2.
    2. **même test, l.231, au-delà de l'énumération de la décision** : le cas « named before its effective day » utilisait `early`, désormais refusé à la ligne de version ; réécrit pour garder son objet : jour d'effet de la version 1 porté à FIRST+8, le `snapshot` de FIRST+7 (seq 11) la nomme ⇒ `version_not_in_force` @11. À confirmer par l'orchestrateur (Q-C1).
    3. `dojo_verify_refuses_a_price_version_on_history_days` : le prototype du G2 plaçait la version avant les snapshots dans les deux cas refusés ; avec le contrôle d'ordre du marcheur, ces cas seraient refusés par le **marcheur** (même chaîne `price_version_mismatch @3`, `said` ne portant pas le `detail`) : le test resterait vert pour une autre cause. Réécriture : `tl(first, eff)` place la version après le `snapshot` du jour eff − 1 et la publie le jour eff ; le test lit le `detail` et asserte « a window on history days (DOJO-WALK-GAPS-1 (a)) » aux seq 4 (fenêtre ANCHOR_DAY − 6, jour d'effet ANCHOR_DAY + 2 : seule voie qui passe le marcheur, au prix de sa laxité) et 9 (fenêtre ouvrant sur le dernier jour d'historique, jour d'effet first + 7) ; le témoin `tl(FIRST)` garde sa ligne d'origine (inchangée depuis `02884eb`) et reste ok.
    4. M-4 de `dojo_verify_refuses_each_named_mutant`, **option C** (décision) : v2 = `versionBody(2, FIRST + 2, at(FIRST + 9, 2))` à jour d'effet FIRST+10, placée après les douze lignes de la fixture, puis le `snapshot` de FIRST+9 sous la version 1 ; témoin ok ; lignes du seq 14 sous v2 ⇒ `threshold_mismatch @14`.
  - daily test : « Q-6 a version before the snapshot of its window's last day (the walker) » ⇒ `price_version_mismatch @9 timeline.jsonl` (refus du marcheur traversant le vérificateur ; voir F-Q6v).
- **C-G2-2 (Q-7)** : vérificateur, un jour de fenêtre non `counted` ⇒ valeur nulle ⇒ `price_version_mismatch` ; test « Q-7 a window day abstained, its beacon and reads kept » ⇒ `@10 pool_price_daily`.
- **C-G2-3 (Q-9)** : marcheur, `anchorForm` exige `k_reads <= 255` (`timeline_malformed` sans `detail`, comme `k_reads` = 0) ; vérificateur, `|| k > 255` retiré (devenu inatteignable), commentaire « K <= 255: the anchor's form (walker; Q-9 of PR-1b-3) » ; test `dojo_walk_refuses_malformed_fields` : K = 255 ⇒ ok, K = 256 ⇒ `timeline_malformed` @1 (une ligne ; la ligne `cases` d'origine n'est pas touchée).
- **C-G2-4** : cas « duplicate instants kept (D-5 l.152) » : β SYNTHETIC **dérivée dans le test** (SHA-256(« g2-dup-8962 ») ‖ SHA-256(« g2-dup+8962 »), 48 premiers octets, octet 0 `& 0x3f | 0x80`, compteur 8962 du G2) ; recalcul hors test : `98ed72ad…7f87`, égal au rapport G2 ; instants recodés par `instantsOf` de la fixture, `new Set(t).size === 3` asserté ⇒ ok.
- **C-G2-5** : cas « a missed read with slot_min » et « with slot_max » ⇒ `timeline_malformed @3 reads` ; « a counted day without beacon nor reads (Q-5) » ⇒ `timeline_malformed @3 beacon`.
- **C-G2-6 (Q-2)** : `scope` complété (« …; the beacon's BLS signature is not verified: an altered signature of valid form is refused as its instants ») et asserté (`[beacon_bls_verified, scope.endsWith("refused as its instants")]` = `[false, true]`).
- **C-G2-7** : appliquée (R-25 317 ≤ 320) : « an abstained day without beacon, its reads kept » ⇒ `timeline_malformed @3 beacon` (tue S-absent-reads) ; « a missed read with a SOL/USD value and its time » (valeur **et** heure posées, sans quoi le contrôle `null ⇔ null` refuse dans les deux versions) ⇒ `timeline_malformed @3 reads` (tue S-missed-usd).
- **§11 rectifié** : la ligne « Aucun contrôle de l'ordre de publication entre une version et les snapshots de sa fenêtre (Q-6) » n'est plus vraie : le contrôle existe (marcheur et vérificateur).

### 15.3 Fichiers (sha256 après corrections)

| Fichier | +/− (numstat contre `02884eb`) | sha256 |
|---|---|---|
| `apps/dojo/scripts/dojo-chain.mjs` | 17 / 5 | `04411fa71b2cfd365ef7023161d82e0fa65f9f4904b27964caf78b4b39ca7123` |
| `apps/dojo/scripts/dojo-chain.d.mts` | 1 / 1 (inchangé depuis le G1) | `387b637ada0af4c1ec2f42ec794a4bd6cb8bc54526e33ba3beb3535b02dc84a3` |
| `apps/dojo/scripts/dojo-verify.mjs` | 50 / 6 | `d768df168b1784bc53e76989c0a767bfb7e737f7fd7c6075565bb7fc98b349cb` |
| `apps/dojo/scripts/dojo-verify.d.mts` | 1 / 1 (inchangé) | `98d9f1bc70bda5af477510a18e74a090eff45bdc9bafe3e6bf6f022836f153f6` |
| `apps/dojo/test/helpers/dojo-fixture.ts` | 46 / 13 (inchangé) | `aa4151bcf4fd967b19c15b52d2e981d2992daf5e40eb0c4af1b540dbec1d7d51` |
| `apps/dojo/test/dojo-chain.test.ts` | 38 / 2 | `0e01aecc77c28e22fcbaacfcca2eba899c7f1fefa2ae72dcd3b5c4703e129def` |
| `apps/dojo/test/dojo-verify.test.ts` | 124 / 12 | `e20b814f29a4cb8b34ea462bfdd1a12d64d7fa58f85241083bd00711225c9364` |
| `docs/adr/ADR-DOJO-PR-2.md` | 11 / 0 (hors R-25, `docs/**/*.md`) | `8d966544e5789026d54601d2cacbea88ccb6ca8e7f4f276f93937a6c68bf98da` |

Gelés inchangés : `dojo-core.*`, `apps/bell/**`, `package*.json`, `tsconfig.json`, mère. Diff des corrections contre l'état G1 : `F:/tmp/dojo/pr1b3-corr/corr-vs-g1.diff` (`3a6fcdd1…66b1`) ; patch `corr-patch.mjs` (`54c6b966…0f5f`).

### 15.4 R-25

- `r25.sh` (`2c083d22…1ffd`) = celui du G1 au chemin de la copie d'index près ; clone `F:/tmp/dojo/pr1b3-corr/clone` : `tokens: 20`, `7 files changed, 277 insertions(+), 40 deletions(-)` ⇒ **317** (`r25.log` `e6065495…5298`). Ventilation : `dojo-chain.mjs` 22, `.d.mts` 2, `dojo-verify.mjs` 56, `.d.mts` 2, fixture 59, `dojo-chain.test.ts` 40, `dojo-verify.test.ts` 136.
- Première mesure après application directe : 325 (> 320). Compactage sans perte de cas : pas de `W` ajouté à la déclaration l.73 ni de retouche de commentaire l.71 (une ligne `W` avec commentaire avant le contrôle), K = 255/256 en une ligne sans toucher la ligne `cases` de `02884eb`, témoin du test d'historique gardé à sa ligne d'origine, lignes de `tl` fusionnées ⇒ 316 ; + 1 ligne pour le test de la garde ⇒ 317.
- 317 ≤ 320 (seuil de la mission) ; au-dessus des 304,5 du §5 de l'ADR (×2,19 sur 145) ; STOP 1 150 loin. Marge sur 320 : 3.

### 15.5 Mutants (harnais `corr-mutants.mjs`, calque de `g2-mutants.mjs` : source, TMP et trois tests du marcheur ajoutés à la table ; liste `corr-list.mjs` ⇒ `corr-mutants.json`)

- Liste : les 14 du G1 lus dans son harnais (jamais retapés), 8 mutants des corrections, 6 survivants du G2 (spécifications lues dans `g2-mutants.json` ; S-missed-usd visé désormais par le test des instants). Témoin : exit 0, 34 ok. `golden unchanged: true,true`. Node v24.15.0. `RESULTS.txt` `77dc8c15…eb38f`.
- **Liste fermée du G1 : 14/14** (M-K3a, M-K3b, M-20a, M-20b, M-21 par exception de `dojo-core` comme au G1, M-22a, M-22b, M-23a, M-23b, M-24a, M-24b, M-24c, P-1, P-2).
- **Corrections** : F-Q6w (contrôle de temps retiré) tué par `…takes_effect_after_its_window` ; **F-Q6o** (contrôle d'ordre retiré, ajouté par ce correcteur) tué par `…snapshot_names_the_version_in_force` (et le daily test) ; **F-Q6g** (garde `published_at` retirée, ajouté) tué par `…takes_effect_after_its_window` ; F-Q7, F-Q9, F-Q9b, F-Q2 tués par leur test visé.
- **S-dup-lost, S-missed-slot-min, S-missed-slot-max, S-status, S-absent-reads, S-missed-usd** : tués par `dojo_verify_recomputes_the_read_instants`.
- **F-Q6v SURVIT : équivalent par construction.** Preuve : le marcheur refuse une version si le dernier `snapshot` vu a un jour < `window_first_day` + 6 ; les jours de `snapshot` sont strictement croissants (`day_not_increasing`, aucune remise à zéro par une nouvelle ancre) ; donc tout `snapshot` postérieur à la version a un jour ≥ `window_first_day` + 7, hors fenêtre ; le vérificateur n'atteint son contrôle journalier qu'après un marcheur accepté (`dojo-verify.mjs:174-175`). Le filtre `s.seq > v.seq` est inatteignable par le chemin servi : défense en profondeur si le contrôle d'ordre du marcheur était relâché. Question Q-C2.
- Total : **27/28** tués par le test visé ; le 28ᵉ équivalent, déclaré, non compté comme tué.

### 15.6 Oracle (sept gates sur clone, sous verrou) et test 42

- Scripts (hors dépôt, `F:/tmp/dojo/pr1b3-corr/`) : `locked.sh` (`de20f2b4…12bc`) = `locked.sh` du G1 au propriétaire près (« corr PR-1b-3 ») ; `run-oracle.sh` (`87cd8541…3892`) = celui du G1 au dossier temporaire près ; `oracle-all.sh` (`4f342cbe…6fd5`) et `t42-all.sh` (`c0ea5fca…66cf`) : `tasklist` des processus node avant et après ; `t42.sh` (`e1c0864b…a498`) ; `sync.sh` (`067da56b…405f`). Arbre : le clone, sept fichiers du lot copiés à 08:45:13Z, `cmp` égal au worktree.
- **Sept gates** : verrou pris sans attente, 08:45:17Z → 08:52:05Z ; `exits.txt` (`3943c3b3…65d5`) : **7/7 exit 0** ; `test` : **1 391 tests, 1 389 pass, 0 fail, 0 annulé, 2 skipped** (préexistants), les tests touchés par les corrections ✔ par nom (`…takes_effect_after_its_window`, `…names_the_version_in_force`, `…refuses_malformed_fields`, `…requires_the_read_rule`, `…recomputes_the_read_instants`, `…stale_sol_usd_reading`, `…daily_values_follow_the_snapshot_reads`, `…price_version_on_history_days`, `…each_named_mutant`) ; test 42 aussi vert dans la suite (353 s) ; `test.log` `0ca7f2f0…1431` ; `gate-vocab`, `typecheck`, `lint`, `lint-ratchet`, `lang-gate`, `export-check` : sha256 égaux octet pour octet à ceux du G1 et du G2. Processus node (C-V-4) : 23 à la prise (08:45:17Z), 22 au rendu (08:52:05Z), les 22 présents à la prise ; le PID absent au rendu (45356) n'a pas été lancé par la passe (présent avant elle) ; aucun processus laissé.
- **Test 42 à part, après la suite** : verrou attendu 660 s (tenu par « corr PR-2b-1 », autre piste), pris 09:03:30Z → rendu 09:07:22Z ; `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` sur le clone ⇒ exit 0, `tests 2, pass 2, fail 0` ; `export_public_no_governance_no_french — clean public export (test 42)` ✔ en 231 s (`test42.log` `b04a9ace…87fd`). Processus node : 22 avant (09:03:30Z), les mêmes 22 PID après (09:07:21Z). Verrou absent après chaque passage.
- `apps/dojo/**` n'est pas exporté (`scripts/export-public.mjs` : 0 occurrence de « dojo ») : export local sans objet.

### 15.7 Lignes datées de l'ADR de lot (ajout seul, 11 lignes, `git diff --numstat` 11 / 0)

- après D-8 l.195 : Q-3 (`detail` `reads`, `pool_price_daily`, `usd_per_sol_daily` admis au C-V-1 (b)) ; emploi étendu de `price_version_mismatch` (Q-6, Q-7), garde `published_at`, K ≤ 255 à l'ancre (Q-9), amendement de la table de la mère l.970 renvoyé au prochain pli de la mère ;
- après D-8 l.196 : Q-5 confirmée, transmise au G1 de PR-3a-1 ;
- après §4 PR-1b-3 l.240 : Q-10 (trois retouches du G1, deux réécritures de C-G2-1, l.230 relibellé et l.231 réécrit, F-Q6v équivalent) ;
- section finale « Pli G2 PR-1b-3 (2026-09-27) » : sources, mode, R-25, `error_origin` proposés. La mère n'est pas touchée.

### 15.8 Questions (à l'orchestrateur)

- **Q-C1 (l.231)** : la décision nommait `dojo-chain.test.ts:229-230` ; le cas l.231 (« named before its effective day ») dépendait du même `early` et tombait au contrôle d'ordre ; réécrit (jour d'effet FIRST+8, refus `version_not_in_force` @11) pour garder son objet. Confirmer.
- **Q-C2 (F-Q6v)** : le filtre `s.seq > v.seq` du vérificateur est inatteignable derrière le contrôle d'ordre du marcheur (§15.5). Le garder (défense en profondeur déclarée, mutant équivalent) ou le retirer (une clause de moins, contrôle porté par le seul marcheur) ?
- **Q-C3 (laxité et fenêtre d'historique)** : le cas « a window of history days » n'atteint plus DOJO-WALK-GAPS-1 (a) qu'avec un jour d'effet au-delà de first + 7 ; si D-17 (« le lendemain de la fenêtre ») est un jour fermé un pli prochain, ce cas devient un refus du marcheur et (a) ne reste exercé que par la fenêtre qui ouvre sur le dernier jour d'historique.
- **Q-C4 (R-25)** : 317 est au-dessus des 304,5 du §5 (×2,19) ; ligne de §5 à dater au pli, ou la mesure du journal suffit ?

### 15.9 Advisor

- Avant écriture (08:3xZ) : F-Q6v équivalent derrière le contrôle d'ordre ; mutant du contrôle d'ordre à ajouter (F-Q6o) ; test d'historique à reconstruire pour que (a) reste le contrôle exercé, `detail` asserté ; l.231 à réécrire ; seq 9 et non 10 ; garde `published_at` ; β dérivée dans le test ; C-G2-7 après mesure ; numérotation du rapport ; ajout seul dans l'ADR ; section « Corrections après G2 ». Chaque point vérifié sur pièce ; tous suivis.

### 15.10 `error_origin` proposés (à assigner au G7)

- C-G2-1 à C-G2-3 = planificateur du G0 (D-8 et D-5 muets sur l'ordre version/snapshots, le statut d'un jour de fenêtre et la borne de K à l'ancre ; Q-6, Q-7, Q-9 posées par le G1) ; C-G2-4, C-G2-5 = générateur du G1 (propriétés codées sans test) ; C-G2-6 = générateur du G1 (Q-2 posée, phrase absente du rapport) ; mesure R-25 à 325 avant compactage = correcteur (constatée et corrigée avant toute livraison).

### 15.11 `git status --short` final (09:07:45Z)

```
 M apps/dojo/scripts/dojo-chain.d.mts
 M apps/dojo/scripts/dojo-chain.mjs
 M apps/dojo/scripts/dojo-verify.d.mts
 M apps/dojo/scripts/dojo-verify.mjs
 M apps/dojo/test/dojo-chain.test.ts
 M apps/dojo/test/dojo-verify.test.ts
 M apps/dojo/test/helpers/dojo-fixture.ts
 M docs/adr/ADR-DOJO-PR-2.md
?? docs/G1-lot-dojo-pr1b3.md
```

Livraison : `F:/tmp/dojo/pr1b3-corr-deliver/` (sept fichiers du lot, ADR de lot, ce journal, `harness/`) et `DELIVERED.sha256` ; sha256 de ce journal rendu hors du fichier.
