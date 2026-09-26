# DOSSIER DE PASSATION — MONARK / Shōgen / Pocket / film, 2026-09-26 (orchestrateur `claude-fable-5-1` → agent suivant)

Décision investisseur (2026-09-26 05:5x UTC, verbatim) : « on laisse de coté la vidéo, on continue, mais préparéez, toi et vernier, les consignes de passation vers un autre claude. comme la derniére fois, on va atteindre le budget weekly dans pas longtemps alors consignez ce que vous faites en passation, dans le méme dossier passation ».

Ce dossier **complète** `docs/PASSATION-2026-09-24.md` (toujours valable pour §0 « comment travailler ici », §3 roadmap, §4 hôtes/comptes, §7 MCP/SKILL) : ne relis que ce qui a changé. Ordre de lecture : `~/.claude/CLAUDE.md` (= `F:\claude-config\CLAUDE.md`, règles absolues ; amendements 22/09 Opus 5.5, 25/09 config dir sur F:, 26/09 UUID firecrawl `8aa0cccf…`), les 25 dernières entrées de `docs/CHANTIERS.md` (depuis « 2026-09-25 07:57 UTC »), puis ce dossier. Dossier Vernier : `F:VernierdocsPASSATION-2026-09-26.md` (sha256 `1fd005f1…`, commit `20a69f7` sur `master`, reçu 05:42Z) ; Vernier a 10 questions d'escalade posées à l'investisseur (26/09 ~05:30Z) sans réponse, et le volet commun Vernier–MONARK (décision 226) en §3.

## 0. Ce qui a changé dans la façon de travailler depuis le 24/09

- **Config Claude sur F:** (`CLAUDE_CONFIG_DIR=F:\claude-config`, 25/09) : agents globaux dans `F:\claude-config\agents\`, transcriptions `F:\claude-config\projects\`, scratchpad `F:\tmp\claude\<projet>\<session>\scratchpad\`. Rien n'est écrit sur C: (règle investisseur). L'ancien `C:\Users\KACIMI\.claude` existe encore : suppression = acte investisseur.
- **memstack DÉCONNECTÉ** pendant toute la session du 26/09 (MCP absent jusqu'au redémarrage de l'app) : les décisions 222 à 228 et tout le 26/09 ne sont **que** dans CHANTIERS. Première action après redémarrage : `memory_remember` de ces entrées (liste §5).
- **Workflows lourds** : un W2 Pocket ≈ 50 agents a été STOPPÉ par l'investisseur (limite de 5 h d'usage). Règle pratique : ≤ 8 agents simultanés, fan-out justifié, et annoncer le nombre d'agents AVANT de lancer.
- **Lecture sur place** (règle 20/09) appliquée au Dōjō : fichiers FAITS avant tout agent ; solana.com plante dans le navigateur interne (erreur client) → variantes `.md` par firecrawl puis confirmation dans Chrome (déviation consignée dans FAITS-probe-3-lectures).
- **Chrome** : onglets ouverts de l'investisseur = Higgsfield (projet « MONARK garage »), X (@oneofzero4), Helius usage, Chainstack console, CoinGecko (formulaire soumis `CL2509260042`), Pixabay. Jamais de mot de passe, de CAPTCHA, de consentement, d'achat (les pages d'offre Higgsfield « Secret Max », « 71 % discount » n'ont jamais été touchées).

## 1. PREMIÈRE TÂCHE : Dōjō pièce 1 (SNAPSHOT) — clôturer PROBE-3 et enchaîner G1

État : probe exécutée le 26/09 01:45Z, code 0, FAITS complets `docs/dojo/FAITS-probe-3-2026-09-26.md` (sha256 `9b7b3f78…`), sortie hors dépôt `F:/PRODUITS/dojo-mirror/probe-3/2026-09-26T0145Z/` (49 fichiers, SHA256SUMS OK, aucune clé), script `F:/PRODUITS/dojo-mirror/probe-3/probe-3.mjs` (sha256 `8d0a65a0…`, 798 lignes) + `README-probe-3.md`. Résultats : création établie sous quorum 3/3 (SIG0 `2rgTPb…86uoU`, slot 445 903 343, 2026-09-10T14:10:06Z, `initializeMint2` + `mintTo` 10^15), N = 23 628 signatures (24 pages, 5 714 failed), facturation Helius = compte du garde à l'unité (+39 crédits : 3 738 080 → 3 738 119), 16 RU Chainstack, R3 vrai, R6 owner/programId présents, R7 3/10 lookup-table, R8 0 absent, reconcile « servi » = NO-GO doux (fenêtre = cycle entier ; cf. item RECONCILE-WINDOW-1).

À faire, dans l'ordre :
1. **Lecture Chainstack « après »** (console, onglet ouvert) : RU avant = 282 515 ; attendu +16 ; puis lecture de stabilité (quelques heures plus tard) ; consigner dans `FAITS-probe-3-2026-09-26.md` §T-3 et l'agrégat reconcile.
2. **ADR SNAPSHOT** (`docs/adr/ADR-DOJO-SNAPSHOT-1.md`, gel `1e380b0` + plis 227/228) : amender D-18 (historique depuis le jour 1 = 2026-09-10, sans récupération, min du jour), paramètres mesurés (V = `maxSupportedTransactionVersion` 1 ; A1 = `getTransactionsForAddress` limit 1 asc jsonParsed ; paire d'opérateurs helius + chainstack ; ≈ 1 390 signatures/jour), items formés : BELL-TX-VERSION-1 (Bell utilise 2, non documenté), RECONCILE-WINDOW-1, RPC-GUARD-HELIUS-HOST-1, HARNESS-BASH-BASH-BACKSLASH-1, DOJO-MINT-EXTENSIONS-1 (Token-2022 : `Transfer` sans mint refusé seulement avec TransferHook/TransferFee/Pausable).
3. **Checkpoint-1 du validateur** sur l'ADR amendé, puis **G1 PR-2b** (collecteur historique) sous le garde `openGuardedClient` (`F:/Monark-wt-dojo/packages/rpc-guard`, HEAD `5b75cd2`), RunLimits/runCaps identiques à la probe, cycle `helius-2026-09-19`, `BELL_SOLANA_RPC` lu depuis `apps/bell/ops/launch-q6.sh` (ligne `HELIUS_ENDPOINT=`, jamais affichée).
4. Worktree : `F:\Monark-wt-dojo` (branche `lot/dojo-snapshot-1`) ; dépôt principal `F:\Monark` sur `lot/etude-suite` (propre au 26/09 05:35Z, dernier commit `aeaaf21`).

## 2. Étude SHŌGEN × POCKET NETWORK (ouverte 25/09 21:11Z, « poussée à son paroxysme »)

- **W1 terminé** (`wf_b45c11d0-4e3`, 168 agents, 0 erreur) ; réfutations mises en forme : 195 affirmations, 160 soumises, **54 confirmées / 106 réfutées (toutes avec `corrected`) / 0 invérifiable**, 35 non soumises. Fichiers : `F:/PRODUITS/etude-2026-09-25-pocket/refutations/{RESULTATS.json, SYNTHESE-REFUTATION.md, SHA256.txt}`. Correction majeure : P-10 « 0 preuve probabiliste sur 1 464 554 claims » est **RÉFUTÉE** (≈ 764 observées, ratio 0,52) ; l'hypothèse « claims réglés sans preuve » reste **SENSIBLE** (divulgation privée à la PNF avant toute publication).
- **W2 STOPPÉ** (`wf_f2d707ff-0f0`, 4 agents en cache) sur ordre investisseur (limite 5 h). Décision Q-ORCH-1 : W2 consomme les confirmées + les `corrected` citées « [corrigé] uid » (uid = famille:id). Un W2 réduit (≈ 6 agents : synthèse, jury 2, advisor, advisor-marché, complétude) est proposé, **non lancé** : go investisseur requis.
- Livrable final attendu : `F:\Shogen\docs\15-etude-pocket-network-2026-09-25.md`, puis JOURNAL-PROVENANCE, CHANTIERS, memstack. FAITS d'ouverture et concentration des suppliers : voir CHANTIERS 25/09 21:11Z.

## 3. Shōgen — campagne S2 (F:\Shogen, hors MONARK)

- Driver vivant au 26/09 05:39Z (trois `python.exe`, journal `F:/shogen-campagne/campagne/journal.jsonl` 451 162 lignes, dernière fenêtre 1790401080 = 05:38Z, chainlink ok). Fin prévue ≈ lundi 28/09 00:00Z (ADR-0024, 38 600 fenêtres, cinquième week-end).
- Après la fin : rapport J28 à requalifier ; SHOGEN-TORN-LINE-1 (auto-isolement des lignes NUL déchirées, `campagne/repair-2026-09-23.py` réutilisable) avant S3 ; audit d'entrée `docs/AUDIT-ENTREE.md` dû à la prochaine passe.
- Dépôt Shōgen : modifications non committées `.claude/agents/shogen-{devops,orchestrator}.md`, `CLAUDE.md`, `.claude/launch.json` (roster/UUID firecrawl) : à relire puis committer (orchestrateur seul).

## 4. Film « Engine first. Body later. » (mis de côté par l'investisseur le 26/09 05:5x UTC)

- Dossier `F:\PRODUITS\communication-2026-09-26\` : scénarios v1/v2 enrichi (amendements 04:40 et 06:00), `METHODE-higgsfield-realisme.md`, `JOURNAL-production-higgsfield-2026-09-26.md` (sessions 1 à 5, table des clips, leçons d'outillage), `clips/` (17 mp4 1080p HEVC, `SHA256SUMS.txt`), `norm/` (intermédiaires H.264 24 fps muets), `cartons/` (5 cartons), `music/crab_audio-mysterious-304201.mp3` (Pixabay, licence lue : commerciale sans attribution ; sous Content ID YouTube), `export/MONARK-engine-first-v2.mp4` (88 s, sha `9c778cf6…`), `export/MONARK-teaser-9x16-v1.mp4` (17,6 s), `export/montage.sh` (rejouable).
- Higgsfield : plan Max, projet « MONARK garage » (`higgsfield.ai/generate/@rothkogrape2054/monark-garage`), ≈ 660 crédits restants (estimation), éléments `@ray @ana @doc @claw @pod @kid @garage @street @engine @ship`. Les mp4 se récupèrent par curl sur le CDN (URL dans l'élément `<video>` de la vue détail) ; le bouton Download du site ne produit rien.
- En attente de l'investisseur : jugement du film v2 ; logo MONARK sur le vaisseau (non posé : calque fixe impossible sur une coque animée) ; caisse au logo visible au plan 2 (regénérer sans la référence, 60 crédits) ; **avant publication** : accord écrit ClawPump (logo à l'identique) et UsePod (mascotte), certificat de licence Pixabay.

## 5. Décisions investisseur depuis le 24/09 à consigner dans memstack (verbatim dans CHANTIERS)

216/217 (Ukemi chiffres, UKEMI-DIGIT-1 clos, upload 23) · 222 « on commence le chantier snapshot » (Dōjō pièce 1) · 223 option B + hold · 224 · 225 sept points (snapshot) · 226 roadmap commune Vernier–MONARK après gel pièce 1, abstention, conseil commun, Seikal · 227 historique depuis le jour 1 · 228 « je suis ta reco, go pour l'historique snapshot » (sans récupération, min du jour, go PROBE-3) · 26/09 : « DOJO? ON A PAS UNE TACHE A LANCER » (go probe), arrêt du W2 Pocket (limite 5 h), film (tout manga, masqués, pas de NO RUGS, équations, nouvelle phase vaisseau, option 1 silhouette, musique Pixabay « Mysterious », téléchargements autorisés, logo ClawPump + aura), exa.ai = second moteur de recherche (pas un produit), passation 05:5x.

## 6. Reste dû hors Dōjō (inchangé depuis le 24/09 sauf mention)

- **SEC 4-927** : lettre EN LIGNE sur sec.gov (SEC-POSTED-1 clos, 25/09 20:29Z) ; annonce X rédigée, **relecture conjointe due** (décision 101) ; NOTE-DEPOT §7.
- **CoinGecko** : formulaire soumis `CL2509260042` (25/09) ; réponse à surveiller (mail investisseur).
- **Confirmations investisseur en attente** : feu vert périmètre MONARK, conseil écrit, gel pièce 1 → roadmap commune avec Vernier (226), P-36.
- Roadmap 24/09 §3 points 2 à 9 (R-22/lots courts, FAULTS-PROVIDER-NAME-1, BELL-VERIFY-SCHEDULE-1, jambe cash, Ukemi étape 7 / U-4b-2a, export public, outillage) : **non entamés** cette semaine, sauf UKEMI-DIGIT-1 (clos 25/09).
- Après redémarrage de l'app : vérifier `ToolSearch firecrawl` (UUID) et memstack avant tout lancement d'agent ; premier worker Opus 5.5 = contrôle R-1 du préfixe.

## 7. Ce que je n'ai pas fait / ce qui reste douteux

- Reconcile « servi » de la probe rendu NO-GO doux par construction (fenêtre = cycle) : le chiffre +39 est établi par le tableau par méthode du dashboard Helius, pas par l'outil ; RECONCILE-WINDOW-1 est la correction.
- La lecture Chainstack « après » n'a pas été faite (colonne dashboard décalée de plusieurs heures).
- Pocket : 35 affirmations non soumises à réfutation (rangs > 20) ; la divergence « la signature lie-t-elle la requête ? » n'est pas tranchée (c'est le rôle de W2).
- Film : S5b v1 gardée en alternative ; audio des clips coupé sans écoute (des répliques v1 subsistaient) ; aucune écoute humaine de l'export.
- memstack non alimenté depuis le 25/09 (MCP absent) ; CHANTIERS fait foi.
