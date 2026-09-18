# ADR-M005 — Harnais MCP appelable : exposer les primitives RÉELLES `attest`(Shōgen) · `gate`(HIKAE) · `cascade`(UKEMI)

> **Statut** : **accepté / en vigueur** (2026-09-11, après H1→H5 mergés + checkpoint-2 consolidé), **révisé après deux checkpoint-1 (validateur, 2026-09-10) et quatre décisions investisseur**
> (Q1/Q2 + Q-A/Q-B, ci-dessous). Corrections C-1..C-10 et K-1..K-9 **intégrées**. Checkpoint-1 final avant code.
> **Révision 2026-09-10 (Addendum D12)** : **Q2 révisée** — l'agent déploie AUSSI le harnais (même motif que la vitrine). D0/D10/§1.1/§5/PF-2 lus à travers D12.
> **Siège committeur** : `claude-opus-4-8` par exception Opus-seat (précédent PR #1) — journalisé par commit.
> Orchestrateur/validateur `claude-fable-5-1` ; workers `claude-opus-4-8` effort max ; lecteurs `claude-sonnet-5` ;
> Opus 5 banni ; Gate 0 / R-1 au premier worker.
> **Rattachement** : dépend de **ADR-M003 D10 « Lot I »** (adaptateur Shōgen→`AttestedPrice`, `crossAgentGate` réel,
> tests 29/30) ; **amende** ADR-M004 (Addendum D16). S'appuie sur ADR-M001 (contrats gelés zéro-dep, `additionalProperties:false`),
> ADR-M002 (HIKAE/UKEMI). Sources : `R-P1` §3.3/Q4, `R-P3` §5.4 [lu], mémoire `2869aada`/`0072dd81`/`b70af090`, décisions de session.

## 1. Contexte

### 1.1 Quatre décisions investisseur du 2026-09-10
- **Q1 = « honorer l'architecture littéralement »** : `attest` = **vrai Shōgen**, `cascade` = **vraie cascade-VaR
  UKEMI**, `gate` = **HIKAE réel** — **aucun stand-in de démo**.
- **Q2 = « n'amende pas »** : l'orchestrateur **ne déploie pas le harnais** ; l'investisseur l'exécute.
- **Q-A = « exporter (open-source) »** : `apps/harness` **et** les fixtures Shōgen entrent dans le miroir public
  `KraidleAI/monark` (avec exemption de langue par chemin, D9) — démo e2e reproductible publiquement.
- **Q-B = « garder l'auto-déploiement de la vitrine »** : la boucle de redéploiement de la **vitrine** par l'agent
  (SSH, `/opt/monark-redeploy.sh`) est **ratifiée comme exception datée** (l'itération rapide voulue, mémoire
  `b70af090`) ; **seul le harnais** suit le déploiement-investisseur. **Aucune révocation de clé.** M004 D0.3 tient
  pour le harnais, exception datée pour la vitrine (Addendum D16).

### 1.2 L'imbrication réelle (mémoire `2869aada`) et son ancrage code
`Shōgen AttestedPrice → HIKAE GateDecision → UKEMI cascade-VaR`. Les trois primitives **sont** ce chaînage :
- **`gate` = HIKAE réel** — `gate(input: GateInput): GateDecision` (`packages/hikae/src/l3-gate.ts:127`), pure,
  n'appelle jamais `input.tool` (D0 M003). Prêt.
- **`cascade` = UKEMI réel** — `clearing(sys: FinancialSystem): ClearingResult` (Eisenberg-Noe,
  `clearing.ts:185`) + `liquidableAmount` (`liquidable.ts`) → `yhat` → `emitPrediction(yhat, producedAt):
  Prediction` (`prediction.ts:22`, `task_class="cascade-liquidable-24h"`). Câblage `FinancialSystem→yhat` à composer (TS).
- **`attest` = Shōgen réel via Lot I** — `AttestedPrice` = projection d'un témoignage Shōgen VÉRIFIÉ =
  `(Temoignage, Verdict, Constat)` (ADR-M003 D10, « rien ne manque côté Shōgen »). Adaptateur `fromShogen`
  **côté MONARK** (`packages/monark/src/adapter-shogen.ts` + `cbor-canonique.ts`, zéro-dep) ; Shōgen n'émet aucun
  JSON (CBOR + sortie texte du vérificateur). **Lot I non construit** (`packages/monark/src` = stub) → `attest` en dépend.

### 1.3 Recherche déjà tranchée (R-P1, R-P3, [lu])
Transport **2026-07-28 sans état** ; **Origin : MUST valider / MUST 403** si *présent et invalide*, **SHOULD bind
127.0.0.1** (R-P3 §5.4 l.106-107) ; SDK **`@modelcontextprotocol/server@2.0.0`** (GA, node≥20 — PF-1 confirmé
2026-09-10). Prémisse d'exposition **non sourcée** (R-P1 §3.3) = pari produit (D2). Nommage : outils sous serveur
`monark`, jamais `clawpump-hermes` (R-P1 Q4).

## 2. Décisions

### D0 — Sièges ; déploiement : harnais par l'investisseur, vitrine ratifiée (Q2 + Q-B)
Sièges inchangés (Opus-seat journalisé ; validateur aux deux checkpoints ; clôture jamais auto-déclarée).
**Q2** : le **harnais** est déployé par l'investisseur (D10) — M004 D0.3 tient. **Q-B** : la boucle SSH de la
**vitrine** est **ratifiée comme exception datée** (Addendum D16) ; **la clé reste, aucune révocation**. La note de
rotation du premier jet est **retirée** (l'investisseur a ratifié l'itération rapide, pas une déviation).

### D1 — Périmètre MVP = trois outils exposant les primitives **réelles**, purs, gratuits
`attest`(Shōgen) · `gate`(HIKAE) · `cascade`(UKEMI), en MCP (`mcp.monarkgate.tech`) + HTTP/JSON (`api.monarkgate.tech`).
Gratuit. Trois **fonctions pures** : aucune persistance, aucun trading (D0 M003) ; `gate` émet, n'exécute jamais `tool`.

### D2 — Q1 : honorer l'architecture littéralement (pari produit consigné)
Outils = Shōgen/HIKAE/UKEMI réels, **pas** de stand-in. Le pari « gate appelable par un tiers » (R-P1 §3.3, prémisse
non sourcée) est **consigné** : décision de construction, aucun acheteur revendiqué ; l'agent Hermes *appelant* est
une phase ultérieure déjà séquencée (mémoire `2869aada`). **PF-4** : recherche GTM (advisor-marché) due (§4).

### D3 — `attest` = **Lot I** (ADR-M003 D10) ; enveloppe hors contrat ; rejeu Shōgen par l'agent
`attest` **dépend de Lot I** (non construit). Lot I livre, côté `packages/monark` :
- `cbor-canonique.ts` (décodeur CBOR déterministe, **zéro-dep**) ; `adapter-shogen.ts` : `fromShogen(lot, verdictText,
  constat): AdapterOutput | AdapterError`. Mappage figé (ADR-M001 Déc.3, M003 D10) : `subject/attestor/transport/
  utterance ← Temoignage` ; `octets_recalcules/residual/verifier_revision ← Verdict` ; `sens_emis_digest ←
  Constat.empreinte_du_sens_emis` ; `schema_version ← "1.0.0"`.
- **K-1 — enveloppe hors contrat gelé** : `AttestedPrice` est `additionalProperties:false` → **ni** label **ni**
  provenance ne peuvent y vivre. `AdapterOutput = { price: AttestedPrice; provenance: { source_lot_sha256,
  source_verdict_sha256, shogen_head_sha }; label: "real, notary Shōgen, demonstrative, not probative" }`. **Seul
  `price` passe `assertClosedAttestedPrice`.** La « ligne de provenance sur chaque AttestedPrice » (M003 D3) se lit :
  **sur l'enveloppe**. Test `adapter_output_carries_demonstrative_label` (mutant : label absent ou « probative » ⇒ rouge).
- **`crossAgentGate` réel** (M003 D4, signature `(price, prediction, ctx)`) remplace le stub `index.ts` (2 params) ;
  **test 30** `cross_agent_gate_end_to_end` (mutant nommé).
- **K-2 — fixtures** : `s3-binance.{lot.cbor,constat.json,registre.txt}` (seulement dans F:\Shogen) **importées** dans
  `F:\Monark/fixtures/` (sha256, PROVENANCE) ; **exemptées par chemin** dans `scripts/lang-exempt.json` (plume
  orchestrateur, ligne ADR, précédent D7 quater) — motif « artefact verbatim d'un dépôt tiers, sha256 épinglé, non
  traduisible » (la sortie du vérificateur est **en français** : `main.rs:79` « VERDICT : octets conformes… »). Test :
  `lang-gate --scope root` vert avec fixtures ; mutant : exemption retirée ⇒ rouge.
- **K-6 — PF-5 résolu : owner = l'agent** (mesuré 2026-09-10 : `cargo 1.97.1`/`rustc 1.97.1` présents, F:\Shogen sur
  HEAD `5b6469ae`, arbre propre). Rejeu unique de `shogen-verifier` sur `s3-binance.lot.cbor` (`--registre … --constat
  …`), **sans modifier ni committer F:\Shogen (R-20)** ; provenance commise : SHA HEAD F:\Shogen, arbre propre,
  versions `rustc`/`cargo`, commande exacte, **stdout + stderr + code de sortie séparés** (M003 D3), sha256.
- **Test 29** : couple réel ⊨ schéma gelé. **Label démonstratif** : seul témoignage réel = Binance `BTCUSDT`
  **auto-notarisé ⇒ « réel, notaire Shōgen, démonstratif, pas probant »** (porté par `AdapterOutput.label` + trace H5).

### D4 — `cascade` = **UKEMI réel**, retourne une `Prediction` (atomique)
Entrée `FinancialSystem` (**non gelée**, déclarée champ par champ) → `clearing` → `liquidableAmount` → `yhat` →
`emitPrediction` → **`Prediction`** (`cascade-liquidable-24h`). `producedAt` injecté. **Ne sort pas** de `GateDecision`
(atomicité) ; `gate` **consomme** la `Prediction`. **K-1** : tout énoncé d'honnêteté vit dans la description d'outil +
le contenu texte MCP, **jamais** dans `Prediction`. Sortie `assertClosedPrediction`.

### D5 — `gate` dispatche sur `task_class` ; `under_calib` honnête ; validation des params (K-4)
`btc-dir-15m` → `conformalSet` (région `set`, **calibration S2 SYNTHÉTIQUE** commise, `HARNESS_VERSION="fixtures-synth"`) ;
`cascade-liquidable-24h` → `conformInterval`. **Aucune calibration cascade** (S2 = btc-dir seul) : `splitQuantile([],…)`
→ région vide → **`abstain`/`under_calib`** — **résultat attendu et honnête** (« It abstains »), pas un défaut.
- **K-4(a) validation serveur** des params non gelés : `nMin ≥ 1`, `alpha ∈ (0,1)`, `tau`/`tauInterval` finis ≥ 0,
  `bFloor ≥ 0` → entrée invalide ⇒ **erreur d'outil**, jamais un gate silencieux.
- **K-4(b)** `gate_dispatches_on_task_class` asserte `action==="abstain"` **et** `verdict.reason==="under_calib"` **et**
  `reason==="under_calib"` (mutant : dispatch en dur `set` ⇒ rouge).
- **K-4(c)** `schema_version` **fixé serveur** (`"1.0.0"`), **pas** porté par l'appelant.
- **K-4(d)** `clockOpen` **porté par l'appelant** (propriétaire de la fenêtre), déclaré ; `timedOut`/`evaluable`/`nCalib`
  **fixés/dérivés serveur** (`timedOut=false` par défaut, un serveur pur ne l'invente pas). Portés par l'appelant :
  `remainingBudget`, `bFloor`, `tau`, `tauInterval`, `alpha`, `nMin`, `intent`, `tool`, `clockOpen`.
- **K-4(e)** `synthetic` réservé à la description **`gate`** (chemin btc-dir) ; la description **`cascade`** porte « no
  cascade calibration is committed; the gate abstains (`under_calib`) on this class » ; test
  `gate_description_declares_cascade_uncalibrated` (mutant : phrase retirée ⇒ rouge) — **c'est ce test qui distingue
  « honnête » de « cassé »**.

### D6 — B_t **porté par l'appelant**, serveur sans état
`GateInput.remainingBudget` entre, `GateDecision.remaining_budget` sort ; gate pur, **serveur sans état** (transport
stateless, R-P3). Déplétion côté serveur = monétisation (identité appelant), **hors M005**.

### D7 — Transport : MCP 2026-07-28 sans état ; Origin (allowlist + absent-accepté) ; bind localhost ; miroir HTTP
- **MCP** : un POST `mcp.monarkgate.tech`, SDK `@modelcontextprotocol/server@2.0.0` (`createMcpHandler`).
- **K-9/C-1 Origin** : allowlist `https://monarkgate.tech` + sous-domaines (`validateOriginHeader`) ; **403** si *présent
  et invalide* ; **`Origin` absent = ACCEPTÉ** (les clients MCP non-navigateur n'en envoient pas ; la spec ne vise que
  « present and invalid »). Tests `origin_invalid_returns_403` **et** `origin_absent_is_accepted`.
- **K-8/C-10** : serveur lié **`127.0.0.1:3001`** (test `harness_binds_localhost_only` **en H1**). `keepAliveMs` 15000.
- **HTTP/JSON** : miroir `api.monarkgate.tech`, OpenAPI dérivé des schémas gelés (test 43).

### D8 — Schémas d'outils = **projection** des `schemas/*.json` gelés + test de dérive
Entrées/sorties gelées (`AttestedPrice`, `Prediction`, `GateDecision`) projetées, jamais réécrites. Test
`tool_schema_equals_frozen_schema` (champ requis retiré ⇒ rouge). Params non gelés (`FinancialSystem`, params `gate`)
déclarés non gelés, schéma d'outil à part.

### D9 — Portes d'honnêteté (bloquantes dès H1) ; câblage réel des scopes (K-3, K-8)
- Sorties `assertClosed*` + `assertNoForbiddenKey` — **mutant `p_correct` ⇒ throw**.
- **K-3 scope `harness` RÉEL** : `scripts/lang-gate.mjs` reçoit `SCOPES += "harness"` **et** une branche `apps/harness`
  dans `classifyScope` (sinon `apps/harness` tombe en scope `root`) ; `scripts/grep-forbidden.mjs` reçoit un bloc de
  parcours `apps/harness` ; `vocab-banned.json` un scope `scan.harness`. Sans quoi `harness_tool_descriptions_pass_vocab`
  serait vacueux. Descriptions sans mot banni (`confidence`…). `lang-gate --scope harness` anglais.
- **K-8** `mcp_tools_have_no_side_effects` : (a) allowlist fermée `REGISTERED ⊆ {attest, gate, cascade}` **et**
  (b) **set EXACT par lot** — `=== {attest, gate, cascade}` est l'**état TERMINAL atteint en H3** ; chaque lot
  asserte son propre set exact vers cet état (H1 : `=== {gate}`, erratum C-4 checkpoint-2) — **+** scan statique de
  `apps/harness/src/tools/**` **sans** import `node:fs`/`node:net`/`node:child_process`/`fetch`/écriture `process.env`
  (mutant : import `node:fs` ⇒ rouge).
- **C-8** calibration déclarée **`synthetic`** ; `lint:ratchet` 92/92 ; `npm run lint` séparé de `npm run ci` (leçon g4).

### D10 — Déploiement : harnais par l'investisseur (Q2) ; vitrine ratifiée (Q-B) ; export public (Q-A)
- **Harnais** : l'agent **commit** l'artefact + `docs/RUNBOOK-harness.md` (anglais) + `scripts/verify-harness.mjs` ;
  **l'investisseur exécute** (aucun `scp`/`ssh` par l'agent). Systemd `monark-harness` (`127.0.0.1:3001`) ; Caddy
  `mcp./api. → 127.0.0.1:3001` **posé après DNS** (PF-2). CA déploiement = **enregistrée par l'investisseur** (URL, date, sha256).
- **Vitrine (Q-B)** : boucle SSH de l'agent **conservée**, ratifiée exception datée (Addendum D16) ; clé maintenue.
- **Export (Q-A)** : `apps/harness` **et** les fixtures Shōgen entrent dans la **liste blanche** d'export (`export-public.mjs`) ;
  test 42 couvre le harnais ; exemption de langue par chemin pour les fixtures (K-2). Le miroir public devient reproductible e2e.

### D11 — test 45 réconcilié : `mcp_tools_have_no_side_effects` (voir K-8 pour l'oracle)
M004 D11 (`mcp_tools_readonly_fixtures`) reformulé ; invariant sûreté renforcé (« aucun effet de bord » ⊃ « lecture seule »).

## 3. Critères d'acceptation (chaque lot sous R-25 ; ADR/PLAN comptent)
CA-1 R-25 (G1/G2 exemptés). CA-2 G0 (attest : + M003 D10). CA-3 G2 fraîche ≠ générateur, ≥ 1 mutant/test. CA-4 oracle :
`npm run ci` + `npm run lint` + `lint:ratchet` 92/92 + `lang-gate --scope harness` + `grep-forbidden` verts ; `git diff
main -- schemas/ packages/contracts/` 0 octet. CA-5 honnêteté : `assertClosed*` (mutant `p_correct` ⇒ throw) ; label sur
l'**enveloppe** (K-1) ; calibration `synthetic` ; cascade `under_calib` déclaré (test K-4e). CA-6 checkpoint-2 par lot.

## 4. Pendants formés (datés)
- **PF-1 (H1)** — ✅ résolu 2026-09-10 : `@modelcontextprotocol/server@2.0.0` (GA, node≥20).
- **PF-2 (H4, investisseur)** — DNS A `mcp.`/`api.monarkgate.tech` (**Hostinger** — cf. K-7/D16 ; repli `127.0.0.1:3001` non publié).
- **PF-3 (H1)** — annotations MCP `readOnlyHint` non trouvées (R-P3 §6) → sûreté par D11, pas par annotation.
- **PF-4 (D2)** — recherche GTM (advisor-marché), owner = orchestrateur (consultation formée), échéance avant toute revendication d'acheteur (jamais avant H5).
- **PF-5 (Lot I)** — ✅ owner résolu = **agent** (K-6) ; rejeu au démarrage de Lot I-a, provenance commise.
- **Pendant M003 CA-I (K-5)** — tests 31/41, `utterance-prix.ts`, panneau atelier UKEMI **non réduits silencieusement** :
  **daté 2026-09-11 (JOURNAL-PROVENANCE)** : owner = **lot de nettoyage M003 CA-I**, échéance **post-publication**
  (hors chemin critique « projet vérifié »), consigné, jamais un dû nu.

## 5. Alternatives écartées
Stand-ins de démo (rejeté Q1) ; réécrire l'attestation en TS (trahirait « le vrai Shōgen ») ; modifier F:\Shogen pour
émettre du JSON (inutile, mappage côté MONARK) ; déploiement **harnais** par l'agent (rejeté Q2) ; révoquer la clé /
arrêter l'auto-déploiement vitrine (rejeté Q-B) ; docker-compose/GHCR (reporté).

## 6. Escalades investisseur — toutes répondues (2026-09-10)
1. Pari produit « gate appelable » : **répondu** (D2) ; reste PF-4 (GTM). 2. DNS A (PF-2) : action investisseur.
3. Q1 attest/cascade littéraux : **répondu**. Q2 déploiement harnais : **répondu** (n'amende pas).
4. **Q-A export** : **répondu** — public. **Q-B vitrine** : **répondu** — auto-déploiement conservé, ratifié exception datée.

## Addendum D12 — Q2 RÉVISÉ (investisseur, 2026-09-10) : l'agent déploie AUSSI le harnais (même motif que la vitrine)

**Décision investisseur (2026-09-10, après H3 ; `AskUserQuestion` « le harnais : je le déploie moi-même comme la vitrine, ou tu gardes le déploiement manuel via runbook ? » → « Je le déploie (comme la vitrine) »).** Q2 (« n'amende pas » — §1.1, D0, D10) est **révisée** : l'orchestrateur/agent **déploie aussi le harnais MCP**, exactement comme il déploie déjà la vitrine (Q-B). Ce qui change, et ce qui tient :

- **Qui déploie** : l'**agent**, par SSH avec la clé existante `~/.ssh/monark_vps` (`ssh -i ~/.ssh/monark_vps root@31.97.155.188`) — **pas** l'investisseur. Systemd `monark-harness` (`127.0.0.1:3001`) + Caddy `mcp./api. → 127.0.0.1:3001` **appended** à `/etc/caddy/Caddyfile` (la vitrine y vit — jamais remplacé, `caddy validate` avant `reload`). CA de déploiement **enregistrée par l'agent** via `scripts/verify-harness.mjs`.
- **Redéploiements** : script `/opt/monark-harness-redeploy.sh` **sur le VPS** (motif `/opt/monark-redeploy.sh` de la vitrine ; **non commis** au dépôt, cohérent avec Q-B), créé au déploiement.
- **Aucune exposition de sécurité nouvelle** : Q-B a déjà ratifié le déploiement **root-SSH de la vitrine par l'agent** (clé maintenue, aucune révocation — M004 D16). Le harnais suit le **même** canal, la **même** clé, la **même** discipline (append Caddy, `caddy validate`, jamais de secret commis — test `no_secret_in_repo`). Le harnais reste **stateless** ; aucune persistance, aucun trading (D0/D1). L'agent ne saisit jamais de mot de passe/clé.
- **Ce qui NE change PAS** : les livrables **H4 sont méthode-agnostiques** et tiennent tels quels — miroir HTTP/JSON, OpenAPI dérivé des schémas gelés, `deploy/monark-harness.service`, `deploy/Caddyfile.monark-harness`, `scripts/verify-harness.mjs`, export Q-A. Seule la **désignation de l'exécutant** change (RUNBOOK reframé : orchestrateur, pas investisseur — correction portée **dans le lot H4**).
- **Timing** : déploiement **après** merge de H4 + preuve e2e H5 (`tools/call` réel sur l'endpoint) + **checkpoint-2 consolidé** (M004 D15).

**Supersède** : §1.1 Q2, D0 (clause Q2), D10 (« harnais par l'investisseur »), §5 (« déploiement harnais par l'agent (**rejeté** Q2) » — désormais **retenu**), §6.3. **PF-2** (DNS A `mcp.`/`api.`) était marqué « action investisseur » mais a en fait été **posé par l'agent** (panneau Hostinger, navigateur, compte investisseur déjà connecté, aucun mot de passe manipulé) — conforme à cette révision. **error_origin = n/a** (décision investisseur). Reflété : M004 **Addendum D17** ; `JOURNAL-PROVENANCE.md` ; memstack `uid=e366643f`.

## Addendum D13 — Errata D7 (version de protocole, relevé par Lot H5)
**D7** (« Transport : MCP **2026-07-28** sans état ») est **précisé** : le SDK GA `@modelcontextprotocol/server@2.0.0` sert la révision `2026-07-28` mais **négocie `protocolVersion 2025-11-25`** dans la réponse `initialize` (dist/index.mjs : « the fix shipped with protocol version 2025-11-25 » ; `protocolVersion >= "2025-11-25"`). Mesuré à l'exécution par Lot H5 : le client offre `2026-07-28`, le serveur répond `2025-11-25` (`fixtures/h5-e2e-trace.json` step 1). **La propriété substantielle de D7 — transport SANS ÉTAT (aucun session id, B_t caller-carried) — TIENT** et est démontrée par H5 (`tools/list` + `tools/call` sans session). La discordance ne porte que sur la **chaîne de version** ; le trace la divulgue honnêtement et la scope hors sujet. Annotation seule, aucun changement de comportement, `schema_version` inchangé. `error_origin` = R-P3 (version citée en amont) ; corrigé ici.

## Addendum D14 — Set terminal 3→4 (`+calibrate`, ADR-M007, investisseur 2026-09-11)
**D1** (« périmètre MVP = trois outils ») et **D9(b)** (« set EXACT `=== {attest,gate,cascade}` = état TERMINAL atteint en H3 ») sont **amendés** : le set terminal du harnais passe à **`{attest, gate, cascade, calibrate}`** (quatre outils permanents). Décidé par **ADR-M007** (`calibrate` BYO — quantile conforme apporté par l'appelant), **ratifié par l'investisseur le 2026-09-11** (`AskUserQuestion` « `calibrate` devient un 4ᵉ outil permanent… tu ratifies ? » → « Oui, 4 outils permanents » ; découle de la décision E-3 « calibrate BYO d'abord »).
- **Ce qui change** : `ALLOWED_TOOL_NAMES`, `HARNESS_TOOLS`, le test de set EXACT (`registry.test.ts`), les commentaires « TERMINAL » de `registry.ts`, la surface projetée (`schema-projection.ts`), l'OpenAPI, le miroir HTTP, `verify-harness.mjs`, RUNBOOK/README, et la trace e2e H5 (re-pin) — TOUS dans le même commit que le changement de set (évolution par ADR, pas dérogation R-22 ; motif D9-bis M001).
- **Ce qui NE change PAS** : `calibrate` est **pur** (K-8), **gratuit**, **sans état** (l'appelant porte q̂ comme B_t, D6), **n'exécute jamais l'outil nommé** (D0), et n'ajoute **aucun contrat gelé** (`schemas/*.json` 0 octet ; sa sortie est une enveloppe K-1 non gelée — gel éventuel reporté à la fin de C2, décision investisseur « souple, figer après C2 »). Les trois outils H1-H3 et leurs contrats gelés sont intacts.
- **Honnêteté** : `calibrate` calcule le quantile conforme **sous l'hypothèse d'échangeabilité que seul l'appelant porte** (MONARK ne voit ni ne vérifie ses données/modèle) ; label K-1 « never a probability of being right » (ADR-M007 D5).

**Supersède** : la qualification « TERMINAL = 3 outils » de D9(b) et le périmètre « trois outils » de D1 (désormais quatre). `error_origin = n/a` (décision investisseur ratifiée). Reflété : ADR-M007, `JOURNAL-PROVENANCE.md`.

## Addendum D15 — Seconde unité systemd `monark-sentinel` (Narabi en direct, ADR-M012 D5)
**ADR-M012 D5** ajoute au VPS un **second** service à côté de `monark-harness` : **`monark-sentinel.service` + `monark-sentinel.timer`** (quotidien, après minuit UTC + marge de finalité). **Utilisateur dédié `sentinel`** (ni `caddy`, ni le compte de service du harnais), `ProtectSystem=strict`, **seul chemin en écriture `ReadWritePaths=/var/lib/monark-sentinel`**, `WorkingDirectory=/opt/monark-harness` en **lecture seule** — **aucun accès en écriture au harnais** (K-8 préservé côté outil ; la sentinelle est l'appelant hors-outil). Premier processus du VPS à **réseau sortant** (pool RPC public en lecture, **sans clé**, aucun ancrage onchain). **0 dépendance nouvelle** (built-ins Node, R-8). **Caddy** : **pas de bloc séparé** (deux blocs sur la même adresse ⇒ « ambiguous site definition », C-1) — un **`handle_path /narabi/*`** (`root /var/lib/monark-sentinel/public`, `file_server`, lecture seule, droits 0755/0644) **inséré DANS le bloc vitrine existant**, avant `reverse_proxy localhost:3000` ; première édition du bloc vitrine depuis le go-live ⇒ étape runbook nommée (`caddy validate`, `reload`, `curl` vitrine, rollback = retrait du `handle_path`). Sert `monarkgate.tech/narabi/` (`state.json`, `timeline.jsonl`), jamais sous `api.`. **Ordre** : redéploiement harnais depuis HEAD, puis sentinelle, puis J0 = premier pas (T compte depuis J0). `error_origin = n/a` (décision investisseur 2026-09-17). **Détail complet** (unité + timer + snippet Caddy) : **ADR-M012 D5**, **livrés en M012-b** (hors ce lot M012-a, gouvernance seule). **Supersède** : rien (addendum ; D12 « l'agent déploie le harnais » tient — la sentinelle suit le même canal SSH, même clé, même discipline `caddy validate` / `no_secret_in_repo`).

## Amendement 2026-09-18 (ADR-M017, P1) — D5/D8 : clé d'enveloppe optionnelle `attested`
`GateEnvelope` = `{ prediction: Prediction, params: HarnessParams, attested?: AttestedPrice }` ; `required` inchangé `["prediction","params"]` ;
`attested` est le contrat gelé `AttestedPrice` projeté à l'octet (même mécanisme que `prediction`) ; l'enveloppe reste hors `schemas/` (D8) ;
aucun 5ᵉ outil (D1, K-8 intact) ; l'attestation apportée n'est pas re-vérifiée à l'appel (K-8 interdit le vérifieur), déclaré dans la description.
Test de dérive dédié `gate_attested_is_frozen_attested_price`. Détail : ADR-M017 D1–D6.
