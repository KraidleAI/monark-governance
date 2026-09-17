# G1 — Génération tracée, Lot release v0.3.0 (surfaces publiques : README pro, skill, site, notes, description)

- **Générateur** : worker implémenteur **`claude-opus-4-8[1m]`** (R-1 vérifié), instance `aae80331a6974a7be`, dispatché
  par l'orchestrateur `claude-fable-5-1`. 2026-09-17. Une première instance (`adef80f8b2d1b64b7`) était tombée sur une
  limite d'usage AVANT d'écrire (finding préservé : `roadmap/page.tsx:40` « four frozen contracts » = compte total faux ;
  `/how` pipeline à garder). **Aucun commit par le worker (R-20), aucune action sortante** (le `--dry-run` a correctement
  REFUSÉ sur arbre sale, garde B-2).
- **Spec** : directive investisseur 2026-09-17 — README réédité/enrichi/professionnalisé, **CA du token conservé**,
  description du repo changée, linktree `https://linktr.ee/monarkgate` renseigné. Surfaces publiques GATÉES :
  `checkReleaseText` (barre vitrine), `gate:vocab`, `lang:gate`, `honesty-lint`, `token_ca_pinned`, `skill_*`.
- **Pas de checkpoint-1 pour ce lot** (consigné, C-3) : lot texte-seul sous ADR-M010 déjà checkpointé (M010-4) et
  directive investisseur explicite ; l'acceptation est portée par le checkpoint-2 (livrable) + G2.
- **Faits portés** : Narabi = `stable-run-velocity-24h` avec **une calibration committée pour UNE population** (USDe,
  clé `narabi:persistence-v2@eip155:1/erc20:0x4c9edd…68b3`, fenêtres calmes, échangeabilité DÉCLARÉE), toute autre
  population `under_calib` ; NDG-1 shippée ; run oct. 2025 hors-échantillon = observation témoin ; **endpoint public
  NON redéployé** (sert les 2 classes d'origine) ; 5 contrats gelés ; msUSD mesuré puis refusé.
- **Rulings investisseur (checkpoint-2, Q1/Q2, 2026-09-17)** : **`v0.2.0` SAUTÉ publiquement** (`v0.1.0` → `v0.3.0`,
  notes portant aussi le contenu v0.2.0, ADR-M010 §2.3 amendé — C-2) ; **CA GARDÉ dans la description** (C-5).

## Livrables (empreinte : 6 fichiers, +108/−63)
- `README.md` réécrit — sha256 (LF) **`87f04bd7a31025a7c1728eb5c7922ffbcd78ce18f04e2966a000ad67ea0d38fe`** (après
  corrections G2 ; sha worker initial `ecfba65f…`). Verbatim préservés : bannière, 3 badges + commentaires HTML, ligne CA
  `FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT`, « it abstains so DeFi can act. », « never a probability of being
  right ». Sections neuves : « The backbone — the gate », « Reach the fleet », « Links » (linktree). Purge gouvernance +
  verbes bannis (`live`, `yield`/`stake` → `return`/`deposit`).
- `skills/monark/SKILL.md` (paragraphe Narabi + ligne miroir), `INTEGRATION.md`, `DEMO.md` (ligne miroir) — constantes
  pinnées intactes (`skill_*` PASS).
- `apps/site/app/roadmap/page.tsx:40` four→five ; `:87` « the first four schemas » (R1) ; `apps/site/app/how/page.tsx:52-54`
  commentaire périmé corrigé (R2). Aucun redesign ; `/how` pipeline intact.
- Notes de release **`v0.3.0-notes-draft.md`** — **amendées C-1** (paragraphe d'ouverture portant le contenu v0.2.0 :
  AttestedFlow 5ᵉ contrat, adaptateur vélocité, classe — texte repris des notes v0.2.0 acceptées, `G1-lot-v020.md`) ;
  `checkReleaseText` ok, 0 hit ; **sha256 (LF, UTF-8) = `4f39eafb2ddf36777f453fbc6cea632bf1a7c16a30aacc4d89e5fdf9638b27ba`**
  (supersède `44652b42…`) — ÉPINGLÉES ci-dessous (« accepted text ↔ pushed text » : au tag, `sha256(--notes)` doit
  égaler cette valeur).
- Description du repo — **avec CA** (C-5, ruling Q2), `checkReleaseText` ok, **341 caractères** (limite GitHub 350 :
  documentée [2nd], non mesurée — si l'API refuse au go, raccourcir en retirant la parenthèse des 4 outils), **sha256 =
  `111658bb51f80e75ebeba003aa935c09c13a5ea8dc878e814714119ffbb4afb3`** — verbatim ci-dessous.

## Corrections G2 appliquées par l'orchestrateur
R1 cadrage historique `roadmap:87` ; R2 commentaire `how:52-54` ; **R5** « reverse-DNS name » → « listed on the official
MCP Registry as `tech.monarkgate/monark` » (preuve primaire ci-dessous) ; **R6** lien mort `https://api.monarkgate.tech/mcp`
(**404 mesuré** GET+POST ; `/gate` 405, `POST {}` → 400 `invalid_input` ; `/attest`, `/cascade`, `/calibrate` répondent)
→ miroir REST par outil `POST https://api.monarkgate.tech/{attest|gate|cascade|calibrate}` dans README + SKILL/INTEGRATION/
DEMO — cohérent `docs/deploy-CA-harness.json` (`paths=/gate,/cascade,/attest,/calibrate`) et `apps/harness/src/http.ts:61-75` ;
R7 LF final de la description ; R8 double espace ; R9 dev-deps (`eslint`/`typescript-eslint`). **Notées, non appliquées** :
R3 (jetons gouvernance en commentaires source du site, pré-existant → scrub ultérieur), R4 (linktree porté par README +
description ; lien site → redesign), R10 (« Next: adaptive conformal inference » = intention roadmap assumée, D8 respecté).

## Corrections checkpoint-2 appliquées (C-1..C-7)
C-1 notes amendées (ci-dessus) ; C-2 ADR-M010 §2.3 amendement daté (`v0.2.0` sauté) ; C-3 entrée JOURNAL (error_origin
R6, rétro-consignation ClawHub, absence de checkpoint-1, instances) ; **C-4 registre MCP — champs GET verbatim**
(`GET https://registry.modelcontextprotocol.io/v0/servers?search=monarkgate`, orchestrateur + validateur, 2026-09-17) :
`name: "tech.monarkgate/monark"`, `title: "MONARK"`, `version: "1.0.0"`, `websiteUrl: "https://monarkgate.tech"`,
`remotes[0]: {type: "streamable-http", url: "https://mcp.monarkgate.tech/mcp"}`, `repository.url:
"https://github.com/KraidleAI/monark"`, `_meta.io.modelcontextprotocol.registry/official: {status: "active",
publishedAt: "2026-09-11T18:51:35Z"}` — **`version: "1.0.0"` est pré-existant (publication du 2026-09-11) et contredit
« never a version one »** ⇒ action sortante formée n° 4 ci-dessous ; C-5 description avec CA ; C-6 version ClawHub
nommée (**`1.0.2`** : skill live `latestVersion 1.0.1`, handle `kraidle`, texte pré-F1 avec lien mort) ; C-7 sha re-épinglés.

## Oracle (arbre final, R-21 orchestrateur ; rejoué indépendamment par le validateur avec Bash)
`npm run ci` 222/222 (dont `token_ca_pinned`, `skill_*`, tests site) ; `gate:vocab` OK ; `lang:gate` 0 ; `export:check` 0 ;
`lint-ratchet` 69/69 ; `checkReleaseText` ok ×3 (README `87f04bd7…`, notes `4f39eafb…`, description `111658bb…`) ; plan
d'export (pré-corrections) A:7 / M:20 / D:0, triade `out/` préservée, aucune fuite gouvernance — **dry-run réel à rejouer
après commit**. État public mesuré (validateur, lecture) : miroir `KraidleAI/monark` tags = `v0.1.0` seul, `schemas/` = 4
fichiers, description live = « Transforming DeFi with conformal inference. Coverage over confidence. Mint: FYZ… » ;
ClawHub `monark` 1.0.1 (2026-09-11), texte pré-F1. **Rien de sortant n'a été fait.**

## Actions SORTANTES restantes (go investisseur per-action, jamais l'orchestrateur seul)
1. `node scripts/release-public.mjs --tag v0.3.0 --notes <notes sha 4f39eafb…>` (push miroir `KraidleAI/monark` + tag annoté + GitHub Release) ;
2. `gh repo edit KraidleAI/monark --description "<texte ci-dessous, 341 chars>"` ;
3. `clawhub publish` du skill en **`1.0.2`** (SKILL.md / INTEGRATION.md / DEMO.md ont changé ; live = 1.0.1 pré-F1 + lien mort) ;
4. republication du serveur sur le registre MCP officiel avec une **version alignée sur le tag** (live = `1.0.0`, contradictoire) ;
5. (privé) PR `backup/main-20260917-f2b` → `main` sur `monark-governance`.

## Notes de release v0.3.0 — ÉPINGLÉES (sha256 `4f39eafb2ddf36777f453fbc6cea632bf1a7c16a30aacc4d89e5fdf9638b27ba`)

```
MONARK v0.3.0 — Narabi: AttestedFlow and the first committed calibration (USDe)

This release folds in what v0.2.0 carried in the repository and was never tagged: AttestedFlow, the
fifth frozen typed contract — an attestation over token flow (burns, mints and closing supply over a
declared block window) that any agent can recompute from onchain bytes — plus a velocity adapter and a
new gate class, stable-run-velocity-24h, that reads redemption velocity as a fraction of the opening
stock, which it recomputes from those raw numbers.

On top of that, it commits the first measured calibration of that class, for a single population:
USDe (Ethena), under the key
narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3. It is measured on calm
onchain redemption-flow windows with exchangeability declared as a modelling assumption. Every other
population abstains under_calib: the committed region is locked to this one key, and no family label
routes around it.

A non-degeneracy guard ships with it: a zero-width interval region abstains under_calib and never commits,
so a degenerate all-zero calibration cannot pass as a committed region.

The October 2025 USDe episode is held out of sample and reported only as a witness observation, on bare
dates — not a statement of what the gate emits in real time. One caveat, stated plainly: the first-day
crossing of the committed q99 depends on the pre-registered stress exclusion; only the peak day is robust
to both threshold sets.

An earlier candidate, msUSD, was measured and then refused: its calm regime was degenerate — a single
redemption day, a zero-width region — so the class kept abstaining. We publish the method, not a trophy.

The contract, the adapter and the calibration are in the repository. The public endpoint has not been
redeployed, so it still serves the two original classes. Next: adaptive conformal inference for drift.

Apache 2.0. Five frozen typed contracts. Never a probability of being right.
```

## Description du repo — verbatim (sha256 `111658bb51f80e75ebeba003aa935c09c13a5ea8dc878e814714119ffbb4afb3`, 341 caractères)

```
MONARK — a coverage-controlled decision gate for DeFi and inference agents: commit | defer | abstain over a depletable budget, never a probability of being right. Five frozen typed contracts, a public 4-tool MCP endpoint (attest · gate · cascade · calibrate). Mint: FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT · https://linktr.ee/monarkgate
```
