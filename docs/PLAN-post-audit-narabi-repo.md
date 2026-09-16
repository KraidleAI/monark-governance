# PLAN — post-audit disposition of Grok's Narabi + GitHub-hygiene opinion

> **Statut** : PROPOSÉ par le planificateur Fable (`claude-fable-5-1`) — advice, pas un commit. Gate suivant :
> **validateur checkpoint-1** sur ce plan, puis décision investisseur. Aucun code changé. F1 (branche
> `lot-m008-f1`, non poussée, non mergée, 197 tests verts) et F2 restent gelés jusqu'à ce que l'investisseur
> tranche C(a) et C(b). Source : audit adversarial `weh728mn3.output` (Grok = opinion, jamais autorité ;
> défaut = keep-ours).

## A. Confirmé — aucune décision requise
L'audit (33 claims) = 22 keep-ours + 1 adopt + 6 human-decision + **2 investigate + 2 réfutés-vers-keep**
(GH-01 CHANGELOG, GH-02 SECURITY : la thèse de Grok échoue à la vérification ⇒ **on n'ajoute NI un
`CHANGELOG.md` racine NI un `SECURITY.md`** ; les notes de release iront sur l'objet GitHub Release).

**Grok relu ; notre design tient.**
- **Surface outil / emplacement AttestedFlow** (A1, B1, d) : aucun 5ᵉ outil (accord). « loger dans `attest` »
  repose sur une prémisse fausse (input `attest` = objet fermé vide ; AttestedFlow porte `flow{}`/`source`/
  `window`/résidus fermés absents d'AttestedPrice). Ratifié E-M008-1/2.
- **task_class / horizon / régime** (A-horizon, B-regime, C-mondrian, E-utilization, +labels/fixtures) :
  Mondrian interdit le POOLING de strates, pas un horizon 24h ; une seule classe, horizon dans le nom,
  calibration calm-only, run hors échantillon ; `splitQuantile` fail-close à p>n (le « théâtre 12 points »
  est déjà refusé par le code) ; label = burns jamais le mid ; utilisation = classe future séparée (N5 de Grok
  dit pareil).
- **Vocabulaire de résidus** (C1, b, F) : enum fermé = append-only AVEC événement de re-baseline versionné —
  fail-closed strictement plus fort que l'ASCII libre. `run_started` est un VERDICT, pas un fait ; le garder
  hors des octets attestés est la discipline centrale.
- **Frontière Ukemi / feed cascade** : feed déjà cadré secondaire (D-Surface) ; un témoin de flux n'est pas
  un livre de prêt ; `cascade-liquidable-24h` hardcodé = invariant plus fort qu'un paramètre.
- **Hygiène GitHub** (GH-07 pins, GH-08, GH-10, + GH-01/02 réfutés) : Actions déjà épinglées par SHA
  (provenance datée) ; main-is-history tient sur origin ; face publique légère obtenue par PROJECTION, pas en
  amincissant la gouvernance.

**Portée exacte de la vindication** : l'audit valide l'architecture F1 (routage, 5ᵉ schéma gelé,
task_class/horizon/régime, mécanisme de résidus, frontière Ukemi). Il ne valide PAS la prémisse du
dénominateur close-supply (les gates ont vérifié la cohérence-code-avec-prémisse et le fail-closed, jamais la
prémisse). ⇒ décision C(a).

## B. Adopter — bas risque, faisable
**GH-09 métadonnées repo** (`gh repo edit KraidleAI/monark`) : Website = `https://monarkgate.tech` ; topics =
`defi, mcp, conformal-prediction, agents, typescript`. **Retirer `solana`** — aucune surface on-chain
(pas de deps Solana, `packages/monark` = stub, token « to be announced »). Trigger de ré-ajout (pas un « later »
nu) : token live sur Solana mainnet ; date observable = ClawPump tokenize **20 sept 23:59 UTC** [2nd] ;
owner = investisseur. Métadonnée GitHub-side, immune à l'export reset+overlay. Pas de code, pas d'ADR.
**Requiert un go investisseur explicite** (changement sortant sur le repo public).

## C. Les six décisions humaines
**(a) Dénominateur v_t — supply début vs clôture.**
Question : `v_t` = fraction du stock d'OUVERTURE rachetée (Grok, Diamond–Dybvig) ou burns sur le stock de
CLÔTURE (ADR-M008 D2/D4) ? Le code calcule `burns/supply_close` (peut dépasser 1) alors que le docstring dit
« fraction … per hour » — les deux se contredisent (défaut réel, présent quel que soit le choix).
**Reco : passer à start-supply** — `S_start = supply_close + burns − mints`, recomputé dans l'adaptateur ;
le champ wire `supply` reste clôture (D2), **aucun changement de schéma, aucune re-baseline**. Pourquoi :
`burns/close = f/(1−f)` (mints=0) est une transformée monotone de `f = burns/start` — zéro information en plus,
casse la sémantique « fraction » que l'ADR et le docstring promettent, casse la comparabilité inter-fenêtres.
Immatériel pour msUSD (pic ~4,26 % ⇒ `f/(1−f)`≈4,45 %, aucune fenêtre de lead ne bouge). Alternative : garder
close et relabeliser « odds, peut dépasser 1 » — aussi petit. **Laisser les deux en l'état n'est pas une
option.** Blast radius : amendement ADR-M008 D4 + ligne PLAN §2 ; ~1 ligne adaptateur + docstring ; re-fixturer
`narabi_maps_the_run_regime` + re-vérifier le mutant checkpoint-2 C-1 ; G2-delta fraîche ; checkpoint-2. Local,
non poussé. Probablement pas de re-pin trace h5 (description outil inchangée — à vérifier).

**(b) Timescale 1h vs 24h.**
Reco : **Option A (24h) tient ; aucune décision maintenant.** Convertir en **item de procurement P-F-5 formé** :
série de mid secondaire horaire msUSD, 15–20 juin 2026, à [lu]. Règle écrite d'avance : mid ≈ 1 jusqu'au
≥17 juin ⇒ 24h a des jours de lead, A confirmée ; mid bouge 15–16 juin ⇒ Option B/D7bis (classe 1h) remonte
dans la roadmap. Le mid reste benchmark-only (jamais feature/label/champ wire). Coût : un paragraphe P-F-5 ;
zéro code (F2 est data-bloqué de toute façon).

**(c) GH-03 PR template.** Reco : oui, slim, **repo gouvernance UNIQUEMENT**, écrit dans le lot 4 (ADR release)
pour référencer le rituel de tag. Champs : ADR de rattachement ; schéma gelé touché (o/n, défaut non) ; surface
outil touchée (o/n) ; instance relecteur G2 ; compte de tests avant/après. Retirer les champs tweet/hop. Non
whitelisté ⇒ jamais exporté. Process pur, pas d'ADR.

**(d) GH-04 CONTRIBUTING §Releases.** Reco : **split.** (i) MAINTENANT (lot honnêteté) : corriger la section
« Pull requests » pour dire le vrai — les PR externes sont portées sur le repo gouvernance puis ré-exportées ;
une PR mergée sur le miroir est revertée au prochain sync. (ii) §Releases SEULEMENT avec (f), en anglais
(fichier exporté verbatim), nommant le tag comme source unique de version.

**(e) GH-05 README badges.** Reco : badges CI + Apache-2.0 MAINTENANT (lot honnêteté) ; badge Release avec (f).
Alt-text anglais, hors `vocab-banned.json`. Bundle : README l.86/l.123 citent `docs/adr` (blacklisté de
l'export) ⇒ refs mortes sur le miroir aujourd'hui — instance la moins chère de « README dit ce qui est live ».

**(f) GH-06 versioning / tags / releases.** Reco : **adopter tags + Releases sur le miroir en étendant
`release-public.mjs`** (tag annoté sur le commit de sync + `gh release create` ; **notes de release = argument
anglais requis** remplaçant le message libre, stockées sur l'objet Release — **pas** un CHANGELOG.md racine,
réfuté GH-01). Taguer aussi le SHA gouvernance de la même version (traçabilité privé↔public). Semver 0.x ;
source de vérité = tag git ; `package.json` reste `0.0.0`/`private:true`. Cadence : un tag par lot livré qui
change la surface publique, jamais par sync. Premier tag `v0.1.0` = état public actuel ; F1+F2 ⇒ `v0.2.0`
(5ᵉ contrat additif = minor). Coût : nouvel ADR (change un script interne, non exporté) + CONTRIBUTING §Releases
+ badge Release ; ~2–3 j incl. G2. Effet sortant seulement au premier sync tagué, sous go investisseur.

## D. Décision de modèle de repo (sous-tend C c–f)
| Option | Suppose | Coût | Risque |
|---|---|---|---|
| **1. Rester miroir push-only + tags/Releases** (reco) | Gouvernance reste privée + FR ; le firewall anglais est la raison d'être du miroir | Extension script (f) + wording CONTRIBUTING | PR externes = port à la main (déjà de facto) — documenter |
| 2. Basculer public en repo de travail | Tout commit/PR/ADR/journal devient anglais ou relocalisé | Très élevé ; perd la défense whitelist fail-closed ; viole le firewall par défaut | Fuite gouvernance ; `.md` FR silencieusement perdus |
| 3. Hybride PR public portées à la main | = 1 en mécanique | = 1 | Ne diffère de 1 que par le wording ; c'EST 1 une fois CONTRIBUTING écrit |
**Reco : Option 1**, CONTRIBUTING énonçant la règle de port. Conséquence : (c) sur gouvernance ; (d)/(e)/(f) sur
les fichiers exportés + le script interne.

## E. Séquencement AgileGates
| # | Lot | Type | ADR | Gates | Bloqué sur |
|---|---|---|---|---|---|
| 0 | **Ce plan** | plan | — | **validateur checkpoint-1** → investisseur tranche (a),(b),B,D,(f) | — |
| 1 | Fix dénominateur F1 sur `lot-m008-f1` | code | **amende ADR-M008 D4** (+ ligne PLAN §2) | implément → G2-delta (instance fraîche) → checkpoint-2 → G7 → commit local, **pas de push** | ruling (a) |
| 2 | GH-09 métadonnées | ops | aucun | `gh repo edit` | un go investisseur |
| 3 | **Lot honnêteté-doc** : refs mortes `docs/adr` du README + badges CI/Apache ; wording PR CONTRIBUTING ; phrase PLAN §9 (« un test rétrospectif rouge clôt en `under_calib` honnête, jamais un vert fabriqué ») ; wording ADR-M008 D-Surface (cascade n'expose aucun `Position[]` aujourd'hui) ; item série-mid P-F-5 §0bis | doc | rattaché ADR-M004 D7 (export) / ADR-M008 | G2 (checklist doc) → checkpoint-2 → commit local ; **items exportés publics seulement à un sync autorisé** | — |
| 4 | **Modèle release** : étendre `release-public.mjs` (tag + Release + notes requises), CONTRIBUTING §Releases, badge Release, PR template gouvernance | code + process | **nouvel ADR** (numéro au G0 ; éviter M009 = candidat ACI, D8) | G0 → checkpoint-1 → implément → G2 fraîche → checkpoint-2 → G7 → **premier sync tagué `v0.1.0`** sous go investisseur | D = Option 1 |
| 5 | Calibration F2 + recherche PLAN §6 (stratification weekend décidée ; invariant CI « 24h-only » ajouté) | code | ADR-M008 D7/D7bis | per PLAN-m008-f2 §8 | P-F-5 à [lu] **incl. la série mid** ; lot 1 clos |
| 6 | Merge F1+F2 → push → `v0.2.0` | release | — | ADR-M008 §3 (F1+F2 verts) | 1, 4, 5 |

**Aléa de séquencement** : le sync du lot 3 doit tourner depuis `main` avec F1 ENCORE non mergée — sinon F1
devient public avant F2 (contraire à ADR-M008 §3). L'opérateur de sync confirme le checkout avant de lancer.

**Zéro dette** : chaque point ouvert = un lot, un ruling investisseur, ou un item de procurement formé (la série
mid → amendement P-F-5). Aucun « later » nu.

## F. Incertitudes déclarées (planificateur)
1. Textes complets des réfutations GH-01/GH-02 non disponibles (journal.jsonl introuvable) — seuls les aperçus.
   Le design (f) évite tout CHANGELOG.md racine ⇒ tient sous toute lecture ; si la réfutation ferme aussi les
   corps de notes PAR release, la source des notes est à décider au G0 du lot 4.
2. Existence d'une série mid horaire msUSD (un wrapper long-tail peut n'avoir aucun print DEX liquide) — sinon
   seul le PoR-cut du 20 juin ([2nd]) sert de repère, et la règle (b) dégrade en « 24h a ≥4 j de lead par la
   date de rupture publique ».
3. État du repo public = [2nd] (`gh api` de l'audit, 2026-09-16) ; re-vérifier avant `gh repo edit`.
4. Si le fix (a) touche la description d'outil `gate` (⇒ re-pin trace h5) — à vérifier au lot 1.
5. Date tokenize ClawPump 20 sept 23:59 UTC = [2nd] (audit citant ADR-M002:34).

## G. Verdict checkpoint-1 (validateur `claude-fable-5-1`, 2026-09-16)
**ACCEPTE-AVEC-CORRECTIONS** (plan) **+ ESCALADE-INVESTISSEUR** (rulings). Contexte frais, R-20.

### Corrections BLOQUANTES (avant ruling investisseur) — liantes sur l'implémentation
- **B-1** — Réécrire §B : retirer « DROP solana » comme reco ET la prémisse « aucune surface on-chain / token TBA » (FAUSSE : mint Solana à `apps/site/app/token/page.tsx:26`, exporté). Distinguer *token existe* de *pas d'utilité on-chain*. §B devient un CHOIX investisseur (avec/sans `solana`), pas un fait d'audit ; retirer le trigger de ré-ajout. Statut DexScreener/Jupiter = [2nd] jusqu'à vérif explorateur public [lu]. Tension : la page token omet volontairement le nom de chaîne (plancher securities) ⇒ un topic `solana` serait la 1re nomination publique de la chaîne par le repo.
- **B-2** — Lot 3 PROTÈGE le CA : exclure `apps/site/app/token/page.tsx` du périmètre ; test gouvernance pinnant le littéral du CA ; sha de `token/page.tsx` inchangé au checkpoint-2.
- **B-3** — Aléa §E = garde SYSTÈME au lot 4 (`release-public.mjs` refuse si source ≠ `HEAD==main` propre / exporte depuis un worktree d'`origin/main`) ; AUCUN sync avant lot 4 ; les items publics du lot 3 montent au sync tagué `v0.1.0` (un seul événement sortant, un seul go).
- **B-4** — Liste de rulings lot 0 complète : (a),(b),B,D,(c),(d),(e),(f).
- **B-5** — Lot 6 porte « go investisseur » sur sa ligne (seule ligne qui pousse).
- **B-6** — Lot 1 falsifiable : garde `S_start ≤ 0` ⇒ refus nommé (`non_evaluable`/`binding_broken`, fixé dans l'amendement D4) ; fixture ratio>1 conservée via mint-then-burn ; **l'amendement D4 RETIRE la justification « ratio>1 = signal de sévérité »** (pas seulement la formule) + porte le caveat wrapper rebasing.
- **B-7** — Topologie (1 implémenteur `claude-opus-4-8`, relecteur G2 instance séparée, pas de fan-out) + modes MAST nommés (dérive 4-artefacts lot 1 ; sync mauvaise branche / action sans vérif lot 4) par lot code.
- **B-8** — Notes de release (lot 4) passées par `lang-gate.mjs` avant `gh release create`, fail-closed sur hit non exempt ou texte vide (seul texte libre atteignant le public).

### Notes (admissibles)
N-1 date ClawPump → [lu] ; N-2 Barber/Candès/Ramdas/Tibshirani 2023 (« CP Beyond Exchangeability ») = item de lecture formé lot 5 ; N-3 lot 3 « G2 fraîche, relecteur ≠ générateur » + oracle `export --check` vert + README/CONTRIBUTING dans `kept` ; N-4 journal G1 + `error_origin` par lot ; N-5 lot 2 go+état consignés durablement ; N-6 orchestrateur persiste les réfutations GH-01/02 (aperçus seuls) ; l'ADR lot 4 documente « pas de CHANGELOG/SECURITY » sur cette base ; N-7 lot 4 oracle `--dry-run` étendu (refuse sans notes / tag non-semver).

### ESCALADE — rulings investisseur (le plan §B/§C est superseded par ces réponses)
1. **(a)** dénominateur : start-supply (reco) ou clôture relabellisée « odds » ? *(statu quo interdit)*
2. **(b)** ratifier la règle 1h/24h pré-écrite (mid ≈ 1 jusqu'au ≥17 juin ⇒ 24h confirmé ; sinon classe 1h remonte) ?
3. **B** topics : Website `monarkgate.tech` + `defi/mcp/conformal-prediction/agents/typescript` — **AVEC ou SANS `solana`** (1re nomination publique de la chaîne vs page token qui l'omet) ?
4. **B-bis** (nouvelle) : le README public NE porte PAS le CA — l'y ajouter (demande communauté) ou le laisser à la seule page `/token` ?
5. **D** : Option 1 (miroir push-only + tags/Releases) ?
6. **(c)(d)(e)(f)** : ratifier les recos groupées + cadence (1 tag par lot changeant la surface publique ; `v0.1.0` = 1er sync tagué ; `v0.2.0` = F1+F2) ?
7. **Go distincts** (par action, plus tard) : lot 2 `gh repo edit` ; lot 4 1er sync tagué ; lot 6 push F1+F2.
