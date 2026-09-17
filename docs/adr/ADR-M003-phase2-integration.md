# ADR-M003 — Phase 2 (G0) : intégration MONARK (Shōgen → HIKAE → UKEMI), S2b réel, DEVOPS et vitrine hackathon

- **Statut** : **ACCEPTÉ-AVEC-CORRECTIONS au checkpoint 1** (validateur-humain, 2026-09-05, 14 items appliqués ci-dessous — avis verbatim et traitement : `docs/CHECKPOINT1-phase2.md`) ; ~~**D10 en ESCALADE-INVESTISSEUR, non en vigueur**~~ **D10 EN VIGUEUR — option (a) décidée par l'investisseur le 2026-09-05** (addendum D10).
- **Rattachement** : ADR-M001 (contrats gelés, D8 DEVOPS différé, l.166 label par `AttestedPrice`), ADR-M002 (Phase 1, §4 pendants), `docs/G7-phase1.md`, `docs/CHECKPOINT2-phase1.md`.
- **Provenance** : rédigé par l'orchestrateur `claude-fable-5-1` (effort high) le 2026-09-05, après consultation advisor (R-26, outil intégré, 2 appels : pré-rédaction, pré-checkpoint) et quatre pré-vérifications machine (§1.3). Aucun code écrit.
- **Auteur du siège investisseur** : l'utilisateur. Actions réservées investisseur : listées D0.3 verbatim.

## 1. Contexte

### 1.1 État à l'ouverture
Phase 1 close le 2026-09-05 (`66ec181`, main, CI 77/77, vocab OK, tsc strict 0, **0 remote**). Livré : HIKAE L1/L2/L3 + instrument S2 sur fixtures synthétiques ; UKEMI clearing E&N + Knife-edge ; atelier local. `packages/monark/src/index.ts` est un stub qui lève (`MONARK_PHASE = "0-skeleton"`). Le `crossAgentGate` n'existe pas.

### 1.2 Calendrier (contrainte dure, [lu] page hackathon, cf. `F:\Clawpumptech\ROADMAP-MONARK.md` §7)
| Date | Événement |
|---|---|
| 2026-09-05 | aujourd'hui, J-15 |
| ≤ 2026-09-10 | décisions investisseur (g) clé UsePod, (h) date token + post X |
| 2026-09-20 23:59 UTC | tokenisation (limite) |
| 2026-09-21 → 30 | judging (« deploy early ») |
| 2026-10-01 | résultats |

### 1.3 Pré-vérifications machine (orchestrateur, 2026-09-05)
1. **Shōgen ↔ `AttestedPrice`** : le schéma gelé exige `schema_version, subject, attestor, residual, transport, utterance, observed_at, octets_recalcules, verifier_revision`. Côté Rust : `subject, attestor, transport, utterance` viennent du `Temoignage` (`crates/shogen-core/src/temoignage_canonique.rs`) ; `octets_recalcules: bool`, `residus` et `revision_amont_deleguee` viennent du **`Verdict`** (`crates/shogen-core/src/verification.rs`, l.124-137) ; `schema_version` est la **constante du contrat** (ADR-M001 l.190, « 1.0.0 »). `sens_emis_digest` (optionnel) vient du **`Constat`** (`verification.rs` l.119, `empreinte_du_sens_emis`), pas du témoignage ni du verdict (correction checkpoint 1, item 2). ADR-M001 Décision 3 (C2/C3) fixe ce mappage : `AttestedPrice` = témoignage **vérifié** = (`Temoignage`, `Verdict`, `Constat`). Conclusion : **rien ne manque côté Shōgen** ; l'adaptateur (D3) est une composition de **trois** types existants, sans champ inventé. **Mais Shōgen n'émet aucun JSON** (0 occurrence de `serde` dans `crates/`) : le lot réel est du CBOR canonique et le vérificateur imprime de la prose — D3 dit qui décode quoi (item 3). La validation d'un couple réel contre le schéma est le **test 29**.
2. **Forme de l'API UsePod/Hermes (harnais ClawPump)** : absente du corpus (`MARKET-VET.md`, `chercheur-a-infrastructure.md` ne décrivent que Pyth Hermes et la notion de skill). ⇒ **item de recherche formé R-P1** (D5), pas un choix de stack deviné.
3. **Source de label pour la classe 24h (UKEMI)** : aucune source de dette liquidée réalisée sur 24h dans le corpus. ⇒ classe 24h **sur paires synthétiques déclarées** en Phase 2 (D6), garantie non revendiquée sur données réelles.
4. **Collision de nom** : **« Hermes » = (a) Pyth Hermes**, API prix gatée par clé (Shōgen ADR-0023, perdue en campagne) **≠ (b) harnais Hermes/claw-agent ClawPump**. Dans ce document et le code : `pyth-hermes` vs `clawpump-hermes`, jamais « Hermes » nu.

## 2. Décisions

### D0 — Chemin critique et sièges
- **D0.1** Chemin critique = **DEVOPS → premier remote → vitrine**. Tout ce qui n'est pas sur ce chemin est *conditionnel* (D1) et possède un repli nommé.
- **D0.2** Toute poussée vers un remote est une **permission par action** (session, jamais permanente) ; rien ne part avant la passe DEVOPS (pendant (i), ADR-M002 §4).
- **D0.3** **Actions réservées à l'investisseur, verbatim** (l'orchestrateur ne les exécute jamais, ne saisit jamais de secret) : création du dépôt distant ; configuration de la clé de signature git ; saisie de la clé API UsePod (variable d'environnement locale, jamais dans le dépôt) ; lancement du token ; publication du post X ; création de tout compte.
- **D0.4** Pas de trading en Phase 2 (`ROADMAP-MONARK.md` §7). MONARK gate, n'exécute pas.
- **Addendum D0.3 — 2026-09-05/06** : sur instruction investisseur verbatim (« crées le toi même le répertoire, tu as ma permission » ; « configure la toi même la clé signature »), l'orchestrateur a **créé les dépôts distants** (`monark-governance`, `monark`, privés) et **configuré la signature** sur la clé SSH existante (`~/.ssh/shogen_signing`, aucune clé créée, aucun secret saisi). D0.3 est amendé pour ces deux actions seulement ; le reste (clé UsePod, token, post X, création de compte) est inchangé. Toute poussée reste une permission par action (D0.2).

- **D0.5 — Langue et dépôts (décisions investisseur 2026-09-05, verbatim « tout ce qui est github, site, plateforme, doit être en anglais, rien en français » ; « je suis ta recommandation des deux dépôts »)** : tout artefact public — code, commentaires, noms de tests, CI, README, API, schémas, site, messages de commit du dépôt public — est **en anglais**. Deux dépôts : **`KraidleAI/monark-governance`** (privé, ce dépôt, historique intact, ADR/journaux/revues en français, jamais réécrit) et **`KraidleAI/monark`** (public au lancement ; créé privé le 2026-09-05 ; export anglais du code et de la documentation produit, historique neuf). Chaque lot passe une revue « English only » à sa G2 avant d'être exporté. Les rapports G1/G2/G7 restent en français dans la gouvernance.

### D1 — Lots, ordre de dépendance, repli
| Lot | Contenu | Dépend de | Repli si bloqué |
|---|---|---|---|
| **V** DEVOPS | eslint ; actions épinglées par SHA ; commits signés ; `templates/ci-gates.yml` instancié (jobs bloquants g1 model-pinning, r25 taille de lot, g3/g4/g6) ; `VIBEGATES_PR_LIMIT` fixé par cet ADR ; premier remote | (i) investisseur **≤ 2026-09-10** : dépôt + clé de signature + choix de l'hébergement public (item 9) | **sans (i) : aucun remote, aucune vitrine, déclaré tel quel ; jamais un push non signé** (item 14). Les jobs CI sont écrits et testés en local (`act` non requis : test 38 est un grep) |
| **S** S2b réel | sonde J0 Coinbase (endpoint public, sans clé) → **snapshot daté + haché commis** → rejeu offline `harness_version=fixtures-real-replay` (ADR-M002 D10 C9 ii) → rapport → décision (e) | V (commit du snapshot) | endpoint indisponible : repli **Kraken nommé, activé uniquement par décision investisseur (a′, §4)** — la décision (a) du 2026-09-04 nomme Coinbase ; sinon S2a reste la seule présentation |
| **I** Intégration | adaptateur Shōgen→`AttestedPrice` (D3) ; `crossAgentGate` réel (D4) ; panneau UKEMI branché dans l'atelier | V ; **fixture réelle `s3-binance`** (`crates/shogen-verifier/tests/fixtures/`, subject Binance `BTCUSDT`, notaire = Shōgen lui-même ⇒ **démonstratif, pas probant**, PROVENANCE.md l.133-136) | **aucun témoignage Shōgen BTC-USD Coinbase n'existe au 2026-09-05** ⇒ label = Coinbase brut (ADR-M002 D8) toute la Phase 2 ; une session TLSN Coinbase = travail Shōgen hors M003 (pendant §4) |
| **P** Prédicteur UsePod | client ~~`clawpump-hermes`~~ **`usepod-client`** (addendum D5, R-P1) selon R-P1 ; `predictor_id: "usepod:…"` ; clé investisseur | (g) ; R-P1 | démo sur `momentum-4c` + `oracle-didactique`, profondeur de piste UsePod déclarée telle quelle |
| **K** UKEMI Phase 2 | conformeur `interval` (lève le throw `l3-gate.ts:62-66`) ; classe HIKAE 24h α=0.01 sur paires synthétiques ; (α,β) Rogers-Veraart dans `fictitiousDefault` | aucun (local) | aucun — lot local sans dépendance externe |
| **W** Vitrine | ~~atelier déployé statique (D8)~~ **supersédé par ADR-M004** (plateforme public/live/console, repositionnement investisseur 2026-09-05) ; contenu = ce qui a tourné, négatifs inclus | ADR-M004, (i) hébergement, S ou S2a | S2a seul, déclaré |

Ordre : **V → S ∥ K → I → P → W**. **S ∥ K est justifié par l'isolation** (chemins disjoints : `packages/ukemi/**` vs snapshot + harnais S2 dans `packages/hikae/**`, aucune dépendance), jamais par le débit ; V, I, P, W sont **séquentiels = mono-agent + oracle déterministe**, aucun fan-out. Un commit par lot (R-25). Gate-0 R-1 au premier worker de la phase.

### D2 — Contrats gelés, inchangés
Aucun des quatre contrats ne change en Phase 2. Si un lot exige un champ nouveau (ex. un identifiant de régime pour la branche (a) de L2), c'est un **ADR séparé + bump de `schema_version`**, jamais silencieux. `contracts_frozen` reste vert sur toute la phase (test 0, reconduit).

### D3 — Adaptateur Shōgen → `AttestedPrice` (corrigé checkpoint 1, items 1-4)
- **Entrées et qui les produit (item 3, option (a))** : (1) `Temoignage` = décodage du **lot CBOR canonique** par un **décodeur TS du sous-ensemble CBOR déterministe**, code nôtre, zéro dépendance, dans `packages/monark/src/cbor-canonique.ts`, testé contre `s3-binance.lot.cbor` (7399 octets, sha256 `8700d88f87253f0fd8496402601dc7326362a2cd9e6614a9bf44b79052f1e5a3`, PROVENANCE.md l.18) ; (2) `Verdict` = **reconstruit depuis la sortie textuelle du vérificateur** `shogen-verifier` (stdout `main.rs` l.326-348 : `octets_recalcules`, résidus, révision amont ; **et** stderr + code de sortie en cas de refus, l.284-287). **Aucune fixture de cette sortie n'existe au 2026-09-05** : elle sera **produite par rejeu au Lot I** (`shogen-verifier` sur `s3-binance.lot.cbor` avec `--registre s3-binance.registre.txt --constat s3-binance.constat.json`), commise comme fixture avec son sha256 à ce moment-là, et lue par un **parseur ligne à ligne testé**. `s3-binance.registre.txt` (616 octets, sha256 `899898…`, PROVENANCE.md l.46) est une **entrée** du vérificateur (registre publié des résidus), pas sa sortie — correction quick-verify ; (3) `Constat` = `s3-binance.constat.json` (875 octets, sha256 `7aba07cd…`, seul JSON réel côté Shōgen). Ligne de provenance exigée sur chaque `AttestedPrice` produit : `source_lot_sha256`, `source_verdict_sha256`.
- Fonction pure `fromShogen(lot: Uint8Array, verdictText: string, constat: json): AttestedPrice | AdapterError` dans `packages/monark/src/adapter-shogen.ts`. Mappage (ADR-M001 Déc. 3) : `residual ← Verdict.residus` (ordre émis, jamais agrégé), `octets_recalcules ← Verdict.octets_recalcules`, `verifier_revision ← Verdict.revision_amont_deleguee`, `sens_emis_digest ← Constat.empreinte_du_sens_emis` (item 2), `schema_version ← "1.0.0"`.
- **Raisons d'abstention = littéraux gelés uniquement** (`packages/contracts/src/enums.ts` `COVERAGE_REASONS`, item 1) : verdict absent → `attestation_absent` ; sortie du vérificateur = refus (`ErreurVerification`) → `attestation_refused` ; champ manquant ou forme non conforme au schéma → `binding_broken` (un seul littéral, celui-ci). Aucun littéral nouveau, aucun champ inventé ni défaulté (D2 respecté).
- **Label (item 4)** : « la campagne Shōgen couvre BTC-USD » est **faux au 2026-09-05** (seul témoignage réel : Binance `BTCUSDT`, auto-notarisé). Donc **label = Coinbase brut (ADR-M002 D8) pendant toute la Phase 2** ; ADR-M001 l.166 (label par `AttestedPrice`) reste un pendant formé (§4) conditionné à une session TLSN Coinbase par Shōgen. Tout rapport ou panneau portant `s3-binance` affiche sur sa ligne D10 : « réel, notaire Shōgen, démonstratif ».
- **Adaptateur octets → prix** (item 4) : `AttestedPrice` ne porte pas de nombre (M001 Déc. 3) ; `packages/monark/src/utterance-prix.ts` extrait le nombre de `utterance` (réponse HTTP Binance `/api/v3/ticker/price`, corps JSON `{"symbol","price"}`), lié par `sens_emis_digest` ; test nommé 41 (D11).

### D4 — `crossAgentGate` réel
Signature : `crossAgentGate(price: AttestedPrice, prediction: Prediction, ctx: GateContext) → GateDecision` avec `GateContext = { calib: CalibrationState /* scores triés, n_calib, alpha, qhat, calib_digest */, budget: BudgetState /* B_t, τ */, clock: { now: string } }` (item 5). **La signature du stub Phase 0 (`index.ts:12`) n'est pas l'un des quatre contrats gelés** : ajouter `ctx` n'est pas un bump de `schema_version`, et on le dit ici. Pipeline : `price` valide (schéma) → HIKAE `conform(prediction)` → `CoverageVerdict` → L3 `gate(verdict, budget B_t)` → `GateDecision`. Test 30 = bout en bout depuis l'`AttestedPrice` produit par le test 29 (`s3-binance`, sha256 commis) avec un `GateContext` de calibration seedé jusqu'à une `GateDecision` validée contre `gate-decision.schema.json`. `MONARK_PHASE = "2-integration"`.

### D5 — Prédicteur UsePod : recherche formée R-P1 avant tout client
- **R-P1** (chercheur `claude-sonnet-5`, max, Write) : documentation officielle du harnais ClawPump — transport (HTTP/SDK), authentification, format d'appel d'une skill, format de réponse, limites ; **et tranche l'identité (item 13)** : ADR-M001 l.47 dit « runtime Hermes/`claw-agent` = Python » (Nous Research Hermes) ; est-ce le même objet que le harnais ClawPump/UsePod ? Le nom `clawpump-hermes` **ne se fige qu'après R-P1** ; jusque-là, ce document l'emploie comme étiquette provisoire. Sortie : `docs/R-P1-clawpump-hermes.md` avec niveaux [lu]/[2nd].
- Client en **TypeScript** (une seule chaîne d'outils, aucun code Grok lifté) sauf si R-P1 établit qu'un SDK Python est le seul chemin — alors ADR d'amendement.
- La clé vit dans `USEPOD_API_KEY` (env locale investisseur) ; tests : aucun réseau (`atelier_no_network` reconduit) ; le prédicteur réel n'est exécuté que par la sonde `scripts/probe-usepod.mjs` lancée par l'investisseur.

**Addendum D5 — 2026-09-06 (retour R-P1, `docs/R-P1-clawpump-hermes.md`, chercheur `claude-sonnet-5`, 29 sources [lu] datées)** :
1. **Identité tranchée** : « Hermes » = runtime **Nous Research Hermes**, dont `github.com/Clawpump/claw-agent` est une distribution aval — c'est le harnais du track **ClawPump × pump.fun**. **UsePod** (Sortis-AI) = proxy HTTP d'inférence, sponsor du track **Inference Markets** ; zéro occurrence de Hermes/ClawPump dans sa documentation. Deux objets sans rapport technique. **`clawpump-hermes` est retiré** : le prédicteur LLM s'appelle **`usepod-client`** ; l'exposition de MONARK aux agents (skills) vise **`claw-agent`** (schéma SKILL.md Hermes `metadata.hermes.*`). La liste d'exemptions du gate vocabulaire (D12) devient `pyth-hermes|nous-hermes|claw-agent` au Lot P (le Lot V, en revue, n'est pas rouvert).
2. **Transport UsePod** : REST compatible OpenAI (`…/proxy/<token>/v1`) et Anthropic (`…/proxy/<token>`), pas de SDK ni MCP propres ; **le jeton est un segment de l'URL**, jamais un header ⇒ règle : **aucune URL UsePod n'est journalisée, affichée ou commise** ; `USEPOD_API_KEY` reste en env locale investisseur (D0.3) ; délivrance via `POST /v1/register` sans compte (l'investisseur l'exécute, D0.3). Client en **TypeScript**, `fetch` natif, sans dépendance (§5 confirmé).
3. **Aucun sandbox officiel** ⇒ test 39 repose sur un mock interne (réponses fixtures, hash commis).
4. **Prémisse « skill hikae_* »** : non exigée par UsePod ; elle relève du track pump.fun via `claw-agent` (ADR-M002 §7). Maintenue pour le Lot P-bis « surface de skill », dissociée du prédicteur.
5. Contradictions datées (pool de prix, split de commission, 19 vs 20 sept.) consignées dans R-P1 ; le calendrier §1.2 est confirmé par la page hackathon du 2026-09-06.

### D6 — UKEMI Phase 2 (Lot K)
- **D6.1 conformeur `interval`** : score |y − ŷ|, q̂ = ⌈(n+1)(1−α)⌉-ième score, région `[ŷ−q̂, ŷ+q̂]` ; L3 : COMMIT si l'intention ∈ région et largeur ≤ τ_interval, DEFER si largeur > τ, ABSTAIN sinon. τ_interval **déclaré, non fondé** (même statut que D6 M002).
- **D6.2 classe 24h** : `ukemi-liquidable-24h`, α=0.01, **paires synthétiques** (générateur déclaré, seed, n=300) — la garantie (i) ne vaut que sur ces paires ; « données réelles » n'est pas revendiqué (pré-vérif 3). **Imposé au fil (item 6)** : tout rapport, journal ou panneau de cette classe porte la ligne D10 (M002 D0) avec `harness_version=fixtures-synth` ; l'atelier affiche « synthétique » à côté de l'identifiant. **Oracle du test 34** : (a) q̂ et la région vérifiés **exactement** (déterministe, valeurs attendues calculées à la main dans le test) ; (b) couverture **moyenne sur R=100 répétitions seedées** (seeds 1..100) ≥ 1−α−0.005 (tolérance déclarée) ; mutant nommé : q̂ décalé d'un rang vers le bas ⇒ rouge.
- **D6.3 coûts de défaut (α,β)** [lu, P-K4-1] : `fictitiousDefault(L, e, α, β)`, α=β=1 ⇒ E&N inchangé (test de non-régression byte-exact sur les fixtures Phase 1). Pour α ou β < 1 : `clearing()` rapporte `L*` (GA, ≤ n tours) **et** `L_*`, champ `unique=false` sauf égalité ; **contrôle négatif = Ex. 3.3** (2 banques, e=(1,1), α=β=½, L̄=(2.2,2.2) ⇒ deux vecteurs (1,1) et ~~(2,2.2)~~ **(2.2, 2.2)** — *addendum 2026-09-05 : coquille du lecteur P-K4-1 corrigée sur rendu image p. 886 ; (2, 2.2) est le vecteur du système original K₁ = 2 ; attrapé par le worker Lot K ; `error_origin` = lecteur, propagation orchestrateur*). `(α, β)` sont des **scalaires exogènes** (Def. 2.5) ; hors α=β=1 (E&N) et hors Ex. 3.3 (valeurs de la source), toute valeur utilisée est **déclarée, non fondée** — aucun défaut produit n'en fixe une.
- **D6.4 prix endogène (Cifuentes)** : sourcé [lu, P-K4-2] mais **Phase 2b** (pendant formé §4) — seconde boucle de point fixe, unicité non revendiquée, hors chemin hackathon.

### D7 — L2 reste un moniteur (Tibshirani [lu, P-HIKAE-3])
La branche (a) de L2 n'ouvre que si une source **attestée** de `w = dP̃_X/dP_X` existe ; `w` estimée ⇒ aucune garantie prouvée ; drift de `Y|X` non couvert. Aucune source attestée en Phase 2 ⇒ **L2 = moniteur**, DtACI = repli nommé (P-HIKAE-1, PDF en main, lecture à planifier §4).

### D8 — Vitrine = atelier statique déployé (**supersédé le 2026-09-05 par le repositionnement investisseur → ADR-M004** ; conservé pour provenance)
L'atelier est déjà statique : `index.html + main.js + style.css` ; `serve.js` n'est qu'un serveur de fichiers de développement (`node:http`, 127.0.0.1:4173), aucun `fetch`/socket dans `src` (test 28 `atelier_no_network`, reconduit). Le plus petit livrable public honnête : ces trois fichiers + les rapports commis, servis statiquement depuis l'hébergement public **choisi par l'investisseur en (i)** (item 9), contenu = rapports S2a (et S2b si (e) positif), négatifs inclus (momentum abstention 100 %). Aucun site nouveau (§5).

### D9 — DEVOPS : chiffres fixés par cet ADR (R-23)
`VIBEGATES_PR_LIMIT = 1205` lignes changées (insertions + suppressions) par lot = **médiane mesurée des trois lots Phase 1**. Sortie brute (orchestrateur, 2026-09-05, `for c in 0468cf4 133aba9 ca8a070; do echo -n "$c "; git show --shortstat --format= $c | tail -1; done`, rejouable à l'octet) :
```
0468cf4  24 files changed, 5125 insertions(+), 6 deletions(-)
133aba9  17 files changed, 1197 insertions(+), 8 deletions(-)
ca8a070  15 files changed, 826 insertions(+)
```
Une borne à la médiane **bloque par construction environ la moitié des lots passés : c'est un resserrement délibéré** (item 7), assumé. Justification R-25 : DORA 2024 pp. 39-40 (**[lu] primaire vérifié, doc 02 §8.2 tableau**). Le lot H dépasse à cause du journal TSV S2 (2393 lignes générées, sous `packages/hikae/docs/`) : les artefacts générés reproductibles sont **exclus du décompte** par le pathspec git `':(exclude)packages/*/docs/S2-*'` écrit dans le job du workflow commis (le template n'exclut que les lockfiles). eslint config `@typescript-eslint/recommended-type-checked`. Actions épinglées par SHA complet. Commits signés (clé investisseur).

**Addendum D9 — 2026-09-05 (retour Lot V, consultation formée du worker + advisor R-26)** : `@typescript-eslint/recommended-type-checked` est **inexécutable sous `typescript@7.0.2`** (portage natif : l'API compilateur n'est pas exposée ; `typescript-eslint@8.69.0` exige `typescript <6.1.0`, refus explicite « does not support TS 7.0 », issue amont #10940). TS 7 n'était **pas** une décision (aucun ADR ; `package.json` portait `^7.0.0` sans rattachement). Décision : **option (c)** — épingler `typescript` en **6.0.3 exact** (registre npm, dernière 6.0.x, R-8) pour tout le dépôt, un seul compilateur pour `typecheck` et `lint` ; installer `eslint@10.10.0` + `typescript-eslint@8.69.0` (versions vérifiées registre par le Lot V). Écartés : (a) parseur tiers sans règles typées = D9 non satisfait ; (b) deux TypeScript côte à côte = divergence lint/typecheck ; (d) attendre TS ≥ 7.1 côté typescript-eslint = pendant de repli seulement (reprise de TS 7 par ADR quand #10940 est clos). Conditions : `tsc --noEmit` strict 0 sous TS 6 (tout écart vs TS 7 = finding rapporté, jamais rustiné) ; comptage des violations eslint par règle **avant** correction ; aucun `eslint-disable` nu. **`error_origin` = orchestrateur** (D9 a nommé une configuration sans la confronter au compilateur installé).

**Addendum D9 bis — flux de livraison** : le workflow du corpus se déclenche sur `pull_request` ; un push direct sur `main` ne produit aucun run et le job R-25 lit `github.base_ref` (vide sur push). Décision : **chaque lot atterrit par PR** (branche de lot → PR → CI verte → merge), `main` protégée ; « premier push » (CA-V) se lit « première PR verte ». Test 38 vérifie que `on:` porte `pull_request`.

**Addendum D9 ter — 2026-09-06 (périmètre des 182 violations eslint mesurées sous TS 6.0.3 ; consultation formée du Lot V §S9 ; décision orchestrateur)** :
1. **Production `packages/*/src/**` : strict intégral, zéro violation, corrigée** (6 violations mesurées : 1 `no-redundant-type-constituents`, 3 `no-unnecessary-type-assertion`, 2 autres) ; aucun `eslint-disable`.
2. **`no-floating-promises` sur `test(...)` de `node:test` (79)** : ce n'est pas un défaut de code mais l'idiome du runner (la promesse retournée par `test()` est gérée par le runner). Traitement par l'option **documentée** de la règle, `allowForKnownSafeCalls` ciblant `test`/`describe`/`it` du paquet `node:test` (doc typescript-eslint, URL et version à citer dans G1) — pas une désactivation. Règle **conservée en erreur** partout ailleurs.
3. **Règles `no-unsafe-{member-access,assignment,call,argument,return}` et `no-explicit-any` dans les fichiers de test (92)** : cause = fixtures JSON manipulées en `any` dans les tests. Décision : **override en `off` limité aux globs `**/*.test.ts` et `test/**`**, **avec cliquet mesuré** : `scripts/lint-ratchet.mjs` exécute eslint avec ces règles réactivées sur les tests, compare au **plafond commis** `lint-ratchet.json` (valeur initiale = compte mesuré au Lot V), et **échoue si le compte augmente** ; job CI `g4` = `npm run lint && node scripts/lint-ratchet.mjs`. Toute baisse abaisse le plafond (commis avec le lot). **Pendant formé** : typage des fixtures de test (parse puis validation ajv typée), un lot par package (S, I, K), objectif plafond 0 avant checkpoint 2 de la Phase 3.
4. **`no-unused-vars` (6) et `no-unnecessary-type-assertion` (4)** : corrigées partout, tests compris.
`error_origin` : orchestrateur (D9 n'avait pas anticipé l'idiome `node:test` ni le coût des fixtures non typées).

**Addendum D9 quater — 2026-09-06 (revue G2 du Lot V, réserves 1 et 3)** : (1) le décompte R-25 mesuré avec les rapports de gouvernance = 1311 > 1205 (code seul = 621) : les rapports G1/G2 par lot sont des artefacts de gouvernance, pas des changements de code ; le pathspec du job r25 devient `-- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude)package-lock.json'` et test 38 l'asserte ; `error_origin` = orchestrateur (D9 n'avait pas anticipé le volume des rapports). (2) test 38 assertion (7) : le job g4 contient **littéralement** `npm run lint && npm run lint:ratchet` (un `||` ou le retrait de `lint` rougit). (3) English-only (réserve 2) : lot transverse E avant export, comme pour K.

**Addendum D9 quinquies — 2026-09-17 (exception PONCTUELLE R-25, décision investisseur ; non-précédent)** : la PR #56 de `monark-governance` (`backup/main-20260917-f2b` → `main`) synchronise **30 commits / 6 lots** déjà vérifiés un par un sous AgileGates (M010-4, v0.1.0, F1/v0.2.0-prep, M011, F2-B, release v0.3.0 — G2 fraîches, checkpoints validateur, G7, journal) ; `main` étant protégée (push direct refusé par hook), la sauvegarde passe par PR. Mesure R-25 de la PR = **22 504** lignes (plafond 1 205) : chaque commit tient sous le plafond **sauf F2-B `1f4dbaf` = 19 674**, dont **18 202 = `fixtures/usde-calib-series.json`**, série de données brute **sha-pinnée** (`7c33027a…`), reproductible depuis `scripts/usde-full-pull.mjs` (committé), intégrité C1 par fenêtre — un artefact généré reproductible au sens de D9 (comme les S2), pas du code relu ligne à ligne ; F2-B hors série = 1 471 (hors PLAN/CLOTURE/PROVENANCE = 1 091) ; total PR hors série et docs de gouvernance = 3 678 (six lots agrégés, R-25 est par lot). **Décision (investisseur, 2026-09-17, sur trois options exposées — amendement général des exclusions / exception ponctuelle / laisser rouge)** : exception **ponctuelle**, limitée à **cette seule PR (#56)**, implémentée par une garde **explicite** dans le job `r25-taille-de-lot` (keyée sur `pull_request.number == 56` ET le dépôt `KraidleAI/monark-governance`, référence à cet addendum imprimée, mesure toujours affichée) ; **`VIBEGATES_PR_LIMIT` et les pathspecs restent inchangés** (test 38 intact). Non-précédent : la garde est à **retirer** par un commit de suivi après le merge ; la question générale (exclure les séries de données sha-pinnées et les docs de gouvernance par lot — option écartée ce jour) reste **ouverte comme item formé**, à trancher par ADR avant le prochain lot portant une série. **Correction d'honnêteté** : le JOURNAL F2-B (C-19) déclarait « code/docs nouveaux ≈ 924 lignes (< plafond) » — **faux** (ne comptait que les fichiers nouveaux, pas les +571 tracked) : F2-B = 1 471 hors série, **au-dessus** du plafond sous la gate telle quelle ; `error_origin` = orchestrateur (R-25 mal calculé au C-19).

### D10 — Roster, écriture en siège worker (escaladé à l'investisseur le 2026-09-05 par le validateur ; **tranché le même jour : option (a), en vigueur** — voir addendum)
Workers `claude-opus-4-8` effort max ; lecteurs/chercheurs `claude-sonnet-5` max ; orchestrateur `claude-fable-5-1` high, seul committeur. **Règle nouvelle** : si le worker Opus d'un lot meurt deux fois sur limite d'usage, l'orchestrateur peut écrire en siège worker, **à condition** d'une relecture G2 delta par `claude-opus-4-8` avant G7 et d'une ligne de journal nommant le modèle résolu. Ce qui fut déviation en Phase 1 devient mode documenté.

**Addendum 2026-09-05 (décision investisseur, verbatim : « escalade D10 option A, oui »)** : D10 est **en vigueur tel quel** pour la Phase 2 MONARK. Conditions inchangées et obligatoires : (1) deux morts du worker Opus 4.8 sur limite d'usage, consignées ; (2) relecture G2 delta par `claude-opus-4-8` (instance séparée, mutants re-exécutés) avant G7 ; (3) ligne de journal R-1 nommant le modèle résolu de l'écrivain. Portée : MONARK Phase 2 seulement ; la règle roster globale (CLAUDE.md mainteneur) n'est pas modifiée par cet ADR.

### D10bis — Vérification imposée par le système (reconduction ADR-M002 D12, item 12)
Pour **tous** les lots, déviation ou non : relecteur G2 = instance séparée à contexte frais, ≠ générateur, `claude-opus-4-8` max ; checklist G2 du corpus ; **mutants re-exécutés par le relecteur** (rouge puis restauration à l'octet vérifiée) ; oracle d'exécution non-LLM (CI) avant G7 ; G7 = orchestrateur ; checkpoint 2 = validateur-humain.

### D11 — Liste fermée des tests nommés (numérotation continue après M002)
| # | Nom | Lot | Oracle |
|---|---|---|---|
| 29 | `shogen_s3_binance_decodes_to_attested_price` | I | CBOR réel `s3-binance` (sha256 commis) + sortie vérificateur (sha256 commis) + constat ⇒ ajv strict OK |
| 30 | `cross_agent_gate_end_to_end` | I | fixture réelle → `GateDecision` valide schéma |
| 31 | `adapter_binding_broken_on_missing_field` | I | champ retiré ⇒ `ABSTAIN{reason:"binding_broken"}` ; verdict absent ⇒ `attestation_absent` ; refus ⇒ `attestation_refused` |
| 32 | `s2b_snapshot_replay_byte_equal` | S | rapport régénéré = sha256 commis |
| 33 | `s2b_snapshot_hash_pinned` | S | hash du snapshot dans D10-line |
| 34 | `interval_conformer_coverage` | K | q̂/région exacts (déterministe) + couverture moyenne R=100 seeds ≥ 1−α−0.005 ; mutant q̂−1 rang rouge |
| 35 | `interval_gate_commit_defer_abstain` | K | trois états sur largeur/intention |
| 36 | `clearing_alpha_beta_regression_en` | K | α=β=1 byte-exact fixtures Phase 1 |
| 37 | `clearing_rv_ex33_two_vectors` | K | Ex. 3.3 ⇒ L*≠L_*, unique=false |
| 38 | `ci_gates_blocking_no_continue_on_error` | V | grep du workflow : 0 `continue-on-error` |
| 39 | `usepod_client_no_network_in_tests` | P | aucun socket ouvert sous test |
| 40 | `vitrine_static_no_secrets` | W | grep clés/tokens = 0 sur l'artefact déployé |
| 41 | `utterance_to_price_bound_by_digest` | I | nombre extrait de `utterance` Binance = valeur attendue ; digest du sens émis vérifié |

Chaque test est tué par ≥ 1 mutant nommé en revue G2 (discipline Phase 1 reconduite).

### D12 — Note MAST (risque résiduel, mode → contre-mesure imposée par le système ; item 11)
| Mode MAST | Contre-mesure |
|---|---|
| Pression de délai (J-15, deux dates dures) | R-22 (aucun gate suspendu) ; R-25 via `VIBEGATES_PR_LIMIT` bloquant en CI ; **aucune publication avant checkpoint 2** ; replis nommés D1 plutôt que raccourcis |
| Générateur = vérificateur | D10bis (relecteur Opus séparé, mutants) ; D10 en vigueur (option (a), 2026-09-05) sous ses trois conditions |
| Collision de nom Hermes | motif `\bHermes\b` nu **interdit** hors `pyth-hermes` / `clawpump-hermes` dans `vocab-banned.json` ; parcours du gate étendu à `packages/monark/**` (Lot V) |
| Décrochage de dépendance externe (clé tardive, endpoint down) | replis D1 + décisions investisseur datées §4 (a′, g, i) ; tests sans réseau (28, 39) |
| Dérive de périmètre vers du trading | D0.4 ; `perps_*` restent des stubs qui lèvent (M002 test 27, reconduit) |
| « Tests passés » ≠ propriété (HULA) | oracles exacts + moyennes sur R seeds (test 34) ; mutants nommés par test (D11) |

## 3. Critères d'acceptation Phase 2 (fermés, un par lot)
- **CA-V** : workflow CI instancié, 0 `continue-on-error`, premier push signé sur le remote créé par l'investisseur, CI verte à distance.
- **CA-S** : snapshot daté + sha256 commis ; rejeu byte-égal (test 32) ; rapport S2b avec D10-line ; décision (e) consignée.
- **CA-I** : tests 29-31 et 41 verts depuis la fixture réelle `s3-binance` (démonstratif, ligne D10 le dit) ; stub Phase 0 supprimé ; atelier montre le panneau UKEMI branché.
- **CA-P** : R-P1 persisté ; client sans réseau sous test ; si clé absente au 2026-09-10 : repli déclaré dans la vitrine.
- **CA-K** : tests 34-37 verts ; non-régression E&N byte-exacte.
- **CA-W** : vitrine en ligne avant 2026-09-20 ; contenu = rapports commis, négatifs inclus ; 0 secret.
- **Global** : `contracts_frozen` vert ; vocab gate OK ; zéro dette nue ; journal de provenance avec `error_origin` au G7 ; checkpoint 2 validateur.

## 4. Pendants formés (zéro dette nue)
- **Investisseur** : (a′) activation du repli Kraken si Coinbase est indisponible (item 8 ; jamais automatique) ; (e) décision S2b après rapport réel ; (g) clé UsePod ≤ 2026-09-10 ; (h) date token + post X (thread prêt, jamais « $800 M » — P-K1-1) ; **(i) ≤ 2026-09-10** : dépôt distant + clé de signature + **choix de l'hébergement public de la vitrine** (item 9) — sans (i) à cette date, le chemin critique n'a pas de déclencheur et rien n'est public, déclaré ; (j) builders ; (k) volume = token seul.
- **Recherche** : R-P1 (D5).
- **Lecture** : P-HIKAE-1 ACI/DtACI (PDF en main, lecteur Sonnet 5, règle 4/4bis, sans advisor intégré).
- **Procurements ouverts** : P-K2-1 Blocknative, P-K2-2 Klages-Mundt, P-K2-3 Aymanns-Farmer, P-K3-1 SoK ePrint 2022/1773, P-K3-2 Hacken/QuillAudits, PM-6..10, PR-11, P-GEO-1/2, P-K4-2b (BoE WP 2004).
- **Shōgen (hors M003)** : session TLSN Coinbase BTC-USD notarisée par un tiers, condition du label par `AttestedPrice` (ADR-M001 l.166) — pendant formé, passe Shōgen.
- **Phase 2b** : prix endogène Cifuentes (D6.4) ; τ_interval fondé ; `(α, β)` fondés par source empirique.

## 5. Alternatives écartées
- **Client Python (Grok)** : seconde chaîne d'outils, risque de lift ; écarté sauf preuve R-P1.
- **Label `AttestedPrice` imposé d'emblée** : dépend d'un adaptateur non encore testé ; conditionné au test 29.
- **Site vitrine dédié** : coût sans gain de preuve ; l'atelier déployé montre le vrai artefact.
- **Prix endogène en Phase 2** : deuxième point fixe, unicité non revendiquée, hors chemin critique.
- **Classe 24h « réelle »** : aucune source de label ; serait un chiffre nu.
- **Push avant DEVOPS** : viole (i).
