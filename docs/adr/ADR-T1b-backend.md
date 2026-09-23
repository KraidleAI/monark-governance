> Persisté par l'orchestrateur `claude-fable-5-1` le 2026-09-23 depuis `F:/tmp/t1b-g0/ADR-T1b-backend.md` (sha256 199490961a0e252bff86775ff21fef9e49a73528bf86c053ae4fb38ca9763bd4). G0 par le worker Opus 5.5 ; checkpoint-1 ACCEPTE-AVEC-CORRECTIONS C-1..C-10 pliées (v2) ; rulings R-T1b-1..7 ; DNS posé 13:49Z ; décision 147 (E-2 close).

# ADR-T1b-backend (v2) — Bell : publication signée de `state.json` et `timeline.jsonl` depuis l'hôte dédié (éditeur, clé Ed25519, service, Caddy, DNS)

- **Statut** : **PROPOSÉ (G0), v2.**
  - **Checkpoint-1** du validateur-humain : **ACCEPTE-AVEC-CORRECTIONS C-1..C-10** (`F:\tmp\cp1-t1b\CP1.md`, sha256 `d8f95c8a2f072ec5fe781a33ac7f1ab806ad5ee890e2c052cbe9e1121ff89767`). Les dix corrections sont **pliées ici** ; leur table de traçabilité est en fin de document.
  - **Rulings intégrés** : R-T1b-1..7 (`F:\tmp\t1b-g0\RULINGS-orchestrateur.md`, sha256 `1da85a27…e787`) et rulings sur C-1..C-10 (message de l'orchestrateur, 2026-09-23 ~14:00Z).
  - **Faits nouveaux** : DNS posé, décision 147, G7 BELL-ADV-1.
  - La **v1** est conservée à `F:\tmp\t1b-g0\ADR-T1b-backend.v1.md` (sha256 `d32ed37e34f4278fb11275c2d9d6f0b3fd0262a0c1da19f78e567601d275d1ea`).
  - Aucun code, aucun déploiement, aucune clé, aucun commit (R-20).
  - Rédaction : worker `claude-opus-5-5[1m]`, effort max (R-1). Vérification adversariale par l'orchestrateur avant consommation (R-21).
- **Dates** : v1 le 2026-09-23 (13:31Z) · checkpoint-1 le 2026-09-23 · v2 le 2026-09-23 (14:xxZ, horloge dans `RENDU.md`) · approbation —.
- **Propriétaire de la décision** : orchestrateur `claude-fable-5-1`, pour l'exécution et les rulings techniques, sous les décisions 14/ESC-2 et 143. **Investisseur** pour les actes nommés au § « Actes investisseur » (sauvegardes ; clé ou compte Helius du lot b). La cible produit reste celle d'ADR-B0.
- **Gate concerné** : G0 (ce document). Ensuite G1 → G2 ‖ checkpoint-2 → G7 pour chacune des **3 PR** (R-25), puis l'événement de déploiement **D-n** (§D11). Le backend est **GATÉ directement** par les décisions 62/101 (`docs/CHANTIERS.md:125,412`) ; la dérogation 146 ne couvre que `apps/site` (`:1130-1133`). ADR-M013 régit la vitrine : ce lot relève du régime complet *par analogie* avec son T2 (nouveau service, nouvelle route serveur), sans en dépendre.
- **Éléments affectés** :
  - **Nouveaux** :
    - `apps/bell/scripts/bell-chain.mjs`, `bell-publish.mjs`, `bell-verify.mjs` (+ `.d.mts`) ;
    - `deploy/monark-bell-publish.service`, `deploy/Caddyfile.monark-bell` ;
    - `scripts/verify-bell.mjs` (CA de déploiement) ;
    - `docs/RUNBOOK-bell.md` ;
    - `apps/bell/keys/bell-keyring.json` : clé **publique** seulement, committée par l'orchestrateur après génération ; **racine de confiance** du vérificateur (C-9) ;
    - tests `apps/bell/test/bell-publish*.test.ts` et tests racine.
  - **Modifiés** :
    - `vocab-banned.json` : le scope `bell` s'étend à `apps/bell/scripts/*.mjs` (ligne d'ADR, §D13) ;
    - `test/no-secret-in-repo.test.ts` : motif de clé privée JWK ;
    - `test/no-cash-provider-name.test.ts` : second `test()`, qui applique les formes de la décision 69 aux fichiers servis ; littéraux à source unique ;
    - ADR-B0 (amendements §D13) et ADR-T1aii (tuyaux T-1b), insérés au G7 ;
    - lignes CHANTIERS : C-1, K-1. Acte de l'orchestrateur (R-20).
  - **Hôte** : VPS Bell `178.16.131.29`, `srv1993906.hstgr.cloud` (`CHANTIERS.md:123`), DNS posé (§Contexte 7).
  - **NON touchés** (critère « 0 ligne », §D12) : `apps/site/**`, `README.md`, `skills/**`, `schemas/**`, `packages/contracts/**`, `apps/bell/src/**`, `apps/sentinel/**`, `deploy/monark-{harness,sentinel,probe}.*`, `/opt/monark-probe`, `/opt/monark-harness`.

---

## Contexte (mesuré, sourcé)

**Bases de lecture.**
- v1 : dépôt lu à `83b8904`.
- v2 : relu à `c0f905c` = G7 BELL-ADV-1 `adc3260` + commit de docs.
- **Les ancres de code du G1 sont celles d'`adc3260`**, l'arbre fusionné (tableau ci-dessous). Les citations v1 à `83b8904` y sont reportées.

| Ancre | à `83b8904` (v1) | à `adc3260` (base du G1) |
|---|---|---|
| `collect.ts` : `GENESIS` + `chainTimeline` | 80-93 | 83-96 |
| `collect.ts` : `earliest_publish_utc` (`epu`) | 159, 178, 185 | 181 (+ entrées `gT`) |
| `collect.ts` : entrées `volume[]` (BELL-ADV-1) | — | 211-233 |
| `collect.ts` : `supply` / `por` / `wrapper` / records timeline / `halt_deltas` | 205 / 209-211 / 214 / 218 / 236 | 241 / 245-247 / 250 / 254 / 272 |
| `collect.ts` : `sources` de la provenance (`close_source`, `adv_source`) + `makeProvenance` | 258-264 (la v1 citait à tort 287-296, voir Errata) | 294-301 |
| `collect.ts` : objet `state` | 266-268 | 303-305 |
| `collect.ts` : `assertOutsideRepo` | 489-495 | 535-541 |
| `collect.ts` : écritures de `runMain` | 806-811 | 854-859 |
| `digest.ts` : `canonical` / `CLOSE_KEY` | 23-31 / 33 (la v1 citait 22-30 / 32, voir Errata) | 28-36 / **38** (ajout de `(?<!no_)adv`) |
| `digest.ts` : `GapEntryBase` / `GapEntryFilled` / `GapEntryAbstained` | 61 / 69 / 90 | 66-70 / 74-88 / 95-97 |
| `digest.ts` : « T-1b export whitelist » / « published too » | 79 / 106 | 84 / 111 |
| `volume.ts` : `VOL_RATIO_FORMULA` / `ADV_SOURCE` | — | 133-137 / 140 |
| `residuals.ts` : `RESIDUAL_CODES` | — | 55 |
| `bell-report.mjs` : `CLOSE_KEY` / « Close of record… Massive » | 36 / 109 | 38 / 111 |
| `report.test.ts` : littéral `massive-starter-internal` | 67 | 69 |

Empreintes à `adc3260` : `collect.ts` `130168aa…`, `digest.ts` `e7ee1a25…`, `volume.ts` `46fa184d…`, `residuals.ts` `643f16a1…`, `bell-report.mjs` `d27b5e96…`, `report.test.ts` `3862f675…`.

1. **Ce que le collecteur produit** [lu, code] :
   - **Sorties.** `runMain` écrit `state.json`, `timeline.jsonl`, `journal.json` et `provenance.json` dans `--out` (`collect.ts:854-859`), obligatoirement hors de l'arbre (`assertOutsideRepo`, `:535-541`, CA-11).
   - **Timeline par run.** `chainTimeline` repart de `GENESIS` à chaque run (`:83-96`), avec une ligne par symbole. Commentaire : « the Ed25519 signature is a T-1b fact (D8) » (`:84-85`).
   - **Porte de publication.** Chaque entrée `gT` porte `earliest_publish_utc` (`:181` ; `close.ts:69-74` @ `adc3260`, `:67-72` @ `83b8904`). Le commentaire ajoute : « A T-1b export whitelist consumes it » (`digest.ts:84`).
   - **Enveloppe.** La provenance est dite « published too (T-1b, /bell/*.json) » (`digest.ts:111`).
   - **Rapport.** `bell-report.mjs` agrège un D9 de `state.json` par pool.
2. **Tuyaux amont dont le consommateur servi déclaré est T-1b** [lu] :
   - ADR-T1aii l.316 : close Databento → `state.json` ;
   - ADR-T1aii l.339 : `gate.residuals` → `state.json` ;
   - ADR-T1aii l.102 : état -b1-bis ;
   - BELL-ADV-1, O-1 : `digest.volume[]` « rendez-vous T-1b » (`CHANTIERS.md:1125-1128`).
3. **Décisions de programme** [lu] :
   - **ADR-B0 D2** (l.23-24) : publication chaînée et signée.
   - **ADR-B0 D4** (l.39) : tuyau publication→panneau.
   - **ADR-B0 D8** (l.67-69) : VPS dédié ; clé publique à `/bell/pubkey` + committée + citée ; privée détenue par l'opérateur ; RUNBOOK-bell ; test `bell_no_secret_in_repo` ; Définition de fini au plus tôt après T-2.
   - **ADR-B0, alternatives** (l.99) : reverse-proxy rejeté.
   - **ESC-2 (a)** (l.129).
   - **Décision 54** (`CHANTIERS.md:119`) : « `deploy/Caddyfile.monark-bell` + `monark-bell.service/.timer` + `docs/RUNBOOK-bell.md` à livrer avec T-1b », clé générée sur le VPS.
   - **Décision 57** (`:120`).
   - **VPS provisionné** (`:123`), [lu, docs] : Ubuntu 26.04.1, Caddy v2.11.4 sans site, Node v24.21.0, `ufw` 22/80/443, NTP, sauvegardes hebdomadaires.
   - **Décision 78** (`:227`) : entrée en relation `mailto:` ; « signaux à relever 30 jours après T-1b : re-fetchs distincts de la timeline et de `/bell/pubkey` (logs Caddy) ».
   - **Décisions 117** (`:539-541`), **137** (`:857-860`) et **146** Q2/Q3 (`:1130-1133`).
4. **Exigences de la lettre SEC v3** :
   - `url_state` = `https://bell.monarkgate.tech/state.json`, qui sert aussi les autres symboles, le régime *holiday* et `residuals` ; `url_timeline` ; `url_method` (`LETTRE-4-927-v3.md:76-80`) ;
   - phrases au présent : RENDU-v3 §6 ;
   - items I-G2-1..4 et C-G2-3 (`G2-TEXTE-v3.md:216-224,356-360`) ; I-v3-1 et I-v3-4.
5. **Précédents** :
   - Narabi publie par `appendFileSync` puis `copyFileSync` (`apps/sentinel/src/run.ts:358-361`) ;
   - la sonde Narabi tourne sur Bell (`/opt/monark-probe`, `.mjs` en built-ins, `deploy/monark-probe.service`) ; la formule « `@monark/*` non installable » est auto-citée (`G0-ADDENDUM-lot-narabi-ops-1b-ii.md:28`) ;
   - harness : `git archive` + `npm ci`, CA `verify-harness.mjs` ;
   - CARTO-T1F-1/-2, d'où SENTINEL-DEPLOY-GUARD-1 (`CHANTIERS.md:1108`) ;
   - écritures durables (`rebase-crosscheck.ts` `writeDurable`, ADR-T1aii D1-nonies §5-6).
6. **Items à déclencheur T-1b** : K-1 (`CHANTIERS.md:45,84`), décision 80 (`:229`), C-4 `paused` (ADR-T1aii l.30), PR-B-DBN n° 8 (`:72`), item (6) décision 69 (`:329-330`), NARABI-OPS-1 (d) (`:75`), MWCB (ADR-T1aii l.320), ADR-B0 (d)/(f)/(l) (l.106). Tous sont traités ci-dessous.
7. **Faits nouveaux (v2)** [lu, dépôt @ `c0f905c`] :
   - **DNS posé** : A `bell.monarkgate.tech → 178.16.131.29`, TTL 300, créé à 13:49Z (`CHANTIERS.md:1157-1158`). Constaté par le validateur : `nslookup … 1.1.1.1` (CP1 §1). La porte DNS est **levée** ; le `dig +short` reste à rejouer au D-n.
   - **Décision 147** (`:1160-1162`) : GO global du juriste. La **décision 79 est levée** ; **E-2 est close** ; R-T1b-6 est sans objet. Précision : l'acte formel est attendu en novembre, item **JURISTE-ACTE-NOV-1** (propriétaire investisseur, entrée 14:05Z).
   - **G7 BELL-ADV-1 ACCEPTÉ** : fusion `adc3260`, oracle 7 × 0, porte test 1 083 = 1 074 + 9 au rejeu (entrée 14:05Z). La porte « G7 BELL-ADV-1 » du G1 PR-1 est **levée**.

---

## Décision

### D1 — Hôte et arbre : VPS Bell dédié, arbre `/opt/monark-bell`, rien de partagé (inchangé)

- **Hôte.** Nous publions depuis le **VPS Bell `178.16.131.29`** (décision 57 ; ADR-B0 D8), avec le Caddy propre de l'hôte, sous `bell.monarkgate.tech`.
- **Arbre.** Le code tourne depuis un **arbre dédié `/opt/monark-bell`**, qui ne contient que ce qu'exécute l'unité.
- **Leçon CARTO-T1F-2**, en trois engagements :
  1. aucun octet écrit sous `/opt/monark-probe`, `/etc/monark/probe.env` ni `/var/lib/monark-probe` (CA, contrôle 12) ;
  2. empreinte de chaque fichier livré ET de la configuration **chargée** comparée à `git show <SHA G7>` (CA, contrôle 11 étendu, C-5) ;
  3. aucun redéploiement du harness : SENTINEL-DEPLOY-GUARD-1 n'est pas déclenché.
- **Rejeté** : l'arbre `/opt/monark-harness` du VPS site.

### D2 — Où tourne la collecte : option C retenue (R-T1b-5), déviation de la décision 54 journalisée (C-1)

| Option | Mécanisme | Coûts / contraintes (sources) | Bénéfices |
|---|---|---|---|
| **A — collecteur sur le VPS (timer)** | `monark-bell-collect.timer` → `runMain` sur Bell → éditeur | **4 secrets d'API** sur un hôte public. **Garde d'argent** : ledger de cycle `F:\monark-ledger`, plafond Chainstack par compte (décision 121, `:602`), cycle Helius « jamais chevaucher » (125, `:638`). **Clé Helius** révoquée au verdict, donc nouvelle clé ou nouveau compte (135, `:836`). **Autres dépendances** : `BELL_HALTS_CSV` ; arbre complet + `npm ci` (`collect.ts` importe `@monark/rpc-guard` et `apps/sentinel/src/rpc.ts`) ; licences PR-B-DBN n° 8 et Massive ; héritage NARABI-OPS-1 (d). | cadence ; collecte sur l'hôte indépendant ; chemin vers « ≤ 10 min » |
| **B — collecteur opérateur + éditeur VPS** | run produit sur le poste ; `scp` vers `inbox/` ; `systemctl start` de l'éditeur | publication = **acte opérateur**, sans cadence ; « ≤ 10 min » ni tenue ni revendiquée ; collecte hors de l'hôte dédié, dite sur `/bell/method` | aucun secret nouveau sur l'hôte public ; garde unique ; utilisable dès maintenant |
| **C — hybride séquencé (RETENUE, R-T1b-5)** | lot **a** = B ; lot **b** = A, item à déclencheur | celui de B jusqu'au lot b | éditeur réutilisé tel quel |

- **Lot b = item BELL-COLLECT-TIMER-1**. Propriétaire : orchestrateur. Déclencheur **conjonctif** :
  1. verdict Bell et clé Helius de course révoquée ;
  2. nouvelle clé ou nouveau compte Helius posé (acte investisseur) ;
  3. Q6-COURSE-1 fait ;
  4. PR-B-DBN n° 8 et conditions Massive lues pour un usage serveur ;
  5. ruling sur le ledger (compte dédié ou partition déclarée des plafonds 112/115/121).

  Il reçoit un G0-addendum propre et hérite de NARABI-OPS-1 (d) (retry, 3ᵉ opérateur, sonde externe hors de Bell).
- **Honnêteté.** Jusqu'au lot b, Bell publie par run, sur acte opérateur, sans cadence ni cible de latence. Dit sur `/bell/method` (T-1b-site).
- **CA-2.** E-1 a été tranchée par **R-T1b-5** sous la décision 143 (choix de périmètre journalisé, investisseur informé). Le validateur concourt (CP1, CA-2).
- **Déviation nommée de la décision 54 (C-1).**
  - Ce qu'elle disait : la décision 54 (`CHANTIERS.md:119`) nomme « `deploy/Caddyfile.monark-bell` + `monark-bell.service/.timer` + `docs/RUNBOOK-bell.md` à livrer avec T-1b ».
  - Ce que livre le lot a : `deploy/Caddyfile.monark-bell`, `docs/RUNBOOK-bell.md` et **une unité de publication `monark-bell-publish.service`**, **sans timer**.
  - **Le timer** (et le service de collecte qu'il pilotera, `monark-bell-collect.{service,timer}`) **passe au lot b** (BELL-COLLECT-TIMER-1). Le nom `monark-bell.service` est remplacé par deux unités à rôle unique : publication maintenant, collecte au lot b.
  - **Motifs** : les discriminants mesurés du tableau ci-dessus (secrets sur l'hôte public, clé Helius révoquée au verdict, plafonds par compte 121/125, licences serveur).
  - **`error_origin`** : **planificateur**. La décision 54 (2026-09-20) a fixé la livraison avant la mesure de ces discriminants.
  - **Investisseur informé** par l'orchestrateur (présent ; décision 137 : « l'orchestrateur informe, ne demande pas » ; exigence de la décision 143).
  - Ligne d'amendement : ADR-B0 D7/D8 (§D13.2) et ligne CHANTIERS citant `:119` (acte de l'orchestrateur, R-20).

### D3 — Forme de l'éditeur : P1 retenue ; P2 liée au lot b

- **P1** : trois `.mjs` à **built-ins Node seuls** sous `apps/bell/scripts/` : `bell-chain.mjs`, `bell-publish.mjs`, `bell-verify.mjs`.
- **Duplications déclarées, prouvées égales (C-6)** :
  - **`canonical()`** de `digest.ts:28-36` (exporté) : égalité directe, octet pour octet, sur un corpus fixé.
  - **`CLOSE_KEY`** de `digest.ts:38` (**non exporté** ; `(?<!no_)adv` depuis BELL-ADV-1) : égalité **double**.
    - (i) **Littéral** : le littéral de la regex est extrait du texte source de `digest.ts` et comparé au littéral `.mjs`.
    - (ii) **Comportement** : `assertNoClose` exporté et la garde `.mjs` rendent le même verdict (lève / ne lève pas) sur un **corpus de noms positifs et négatifs**, chacun porteur d'une valeur numérique. Le corpus contient au moins : `close`, `closeRef`, `ref_price`, `pRef`, `reference`, `prev`, `adv`, `share_volume`, `volume_ref`, `no_close_ref`, `no_adv`, `prev_line_hash`, `adv_period` (objet), et `close_source` (chaîne non numérique, qui ne lève pas).

    La seule égalité de littéral serait un grep sur le source (CA-11 durci).
  - La copie de `bell-report.mjs:38` est épinglée par `bell_report_accepts_named_adv_residuals_in_sync` (`report.test.ts:76-99` : égalité de littéral et quelques assertions de comportement) ; ce lot ne la touche pas. Sa méthode d'extraction du littéral (`report.test.ts:88`) sert de précédent à l'assertion (i).
- **Motifs de P1** (sans l'argument « pas de npm sur Bell ») :
  - moindre privilège sur l'hôte public ;
  - vérifiabilité par un tiers muni de Node seul ;
  - aucun module `@monark/*` requis ;
  - précédent `probe-narabi.mjs`.
- **P2** (`apps/bell/src/publish.ts` + `npm ci`) : retenue seulement si le lot b amène le collecteur sur le VPS.

### D4 — Contrat d'entrée : un *bundle* de N ≥ 1 runs `runMain`, contrôles fermés (fail-closed)

- **Entrée.** `inbox/<bundle>/` contient N ≥ 1 sous-répertoires de run, **tels que `runMain` les écrit dans un `--out` réel hors dépôt** : `state.json`, `timeline.jsonl`, `provenance.json` ; `journal.json` toléré, jamais servi.
- **Refus.** Chaque contrôle en échec ⇒ **exit 1**, message `bell/publish: <raison>`, empreinte du répertoire d'état inchangée.
- **Bornes (C-7)** : valeurs et motifs au §« Constantes ». Elles sont **injectables** (paramètres de la fonction pure, défauts = constantes nommées), ce qui permet les tests à borne abaissée.
- **Contrôles** :
  - **C-in-1** : exactement un bundle en attente ; 1 ≤ N ≤ `MAX_RUNS` ; chaque fichier d'entrée ≤ `MAX_INPUT_FILE_BYTES`.
  - **C-in-2** : `state.json` parse ; `schema === "bell-state-v1"` ; clés ⊆ liste blanche **dérivée des types du collecteur** (§D5, C-4), à tous les niveaux.
  - **C-in-3** : `bell_sha === sha256(canonical(digest))`, octet pour octet.
  - **C-in-4** : garde anti-close (duplicat prouvé égal, C-6) sur chaque fichier servi, avant écriture.
  - **C-in-5** : aucune entrée `gT` avec `earliest_publish_utc > published_at` (§D7).
  - **C-in-6** : la `timeline.jsonl` du run se re-chaîne depuis `GENESIS`, et ses symboles ⊆ ceux du `state`.
  - **C-in-7** : `provenance.bellSha === state.bell_sha`.
  - **C-in-8** : aucune chaîne servie ne contient `://` ni un motif de clé. Couvre aussi le point non bloquant (i) du CP1 : `providers.providers` = libellés `providerOf` nus.
  - **C-in-9** : bundle identique à la dernière publication ⇒ exit 0, « rien à publier ».
  - **C-in-10** (ajout v2 du rédacteur) : deux runs de même `bell_sha` dans un bundle ⇒ refus ; jamais un run publié deux fois.
- **Horloge (C-3)** : `published_at` est lu **une seule fois** par publication. La même valeur est écrite dans l'enveloppe `state.json` et dans la ligne `bell-timeline-v1` (test d'égalité).

### D5 — Artefacts servis, fichier par fichier, champ par champ ; liste blanche **dérivée des types** (C-4)

| Fichier servi | Contenu | Liste blanche (source) |
|---|---|---|
| `https://bell.monarkgate.tech/state.json` | `{schema:"bell-public-state-v1", seq, published_at, runs:[<state collecteur verbatim>…] (triés par bell_sha)}`, forme canonique + `\n`. **Aucun total dérivé** | voir le tableau de dérivation ci-dessous |
| `/provenance.json` | `{schema:"bell-public-provenance-v1", seq, runs:[projection par run]}` | projection **déclarée** : `bellSha, generatedAt, sources.{generated_at, cash_request_digest, cash_cross_mismatch_days, cash_cross_unavailable_days}`, `providers.{providers, quorum_required, providers_distinct, faults}`. **Ni `adv_source` ni `close_source`** (décision 69, `CHANTIERS.md:208,223` ; **R-T1b-2**). Conflit mesuré : `ADV_SOURCE = "massive-aggs-range-1-day-unadjusted"` (`volume.ts:140`) placé dans `sources` (`collect.ts:294-301`). L'enveloppe n'est pas hachée dans `bell_sha` : projeter ne casse aucun rejeu |
| `/timeline.jsonl` | lignes `bell-timeline-v1` (§D6) | schéma fermé |
| **`/bell/pubkey.json`** (URL canonique unique, **C-10**, §D9) | trousseau `{schema:"bell-keyring-v1", keys:[{key_id, jwk:{kty,crv,x}, valid_from_seq, status, valid_to_seq?, revoked_from_seq?, continuity?}]}` | clé publique seulement ; jamais `d` |
| `/states/<state_sha256>.json`, `/provenance/<provenance_sha256>.json` | immuables, adressés par contenu. Ils naissent dans `staging/`, hors du répertoire servi, et sont renommés dans `public/` **après** le point de commit (§D8) | idem |

**Dérivation de la liste blanche** (C-4, **des types et des sites de construction, jamais d'une fixture**) :

| Objet | Source de vérité à `adc3260` | Épinglage |
|---|---|---|
| entrée `gaps[]` | `keyof GapEntryFilled ∪ keyof GapEntryAbstained` (`digest.ts:66-98`) : `symbol, session, regime, vwap, volumeBase, n, cash_cross?` + `gT, exceed1, exceed2, exceed5, multiplierUsed?, rebase_residuals?, earliest_publish_utc?` + `abstain` | test `.ts` déclarant `const K: Record<GapKey, true>` avec `GapKey = keyof GapEntryFilled \| keyof GapEntryAbstained`. `tsc` impose l'exhaustivité (clé manquante = erreur de type) et refuse l'excédent (propriété littérale en trop). Égalité avec la liste `.mjs` au runtime |
| `residuals` (clés) | `RESIDUAL_CODES` (`residuals.ts:55`) | égalité d'ensemble avec la liste `.mjs` |
| entrée `volume[]` (objet `Json` non typé) | site de construction `collect.ts:224-233` : `symbol, session, regime, session_date_et, window{from_utc_ms,to_utc_ms}, adv_period{year,month}, n, n_bars, n_trading_days, formula` + (`abstain[]` \| `vol_ratio, multiplier_unit`) | liste citée par ligne dans le test ; les deux formes (calculée, abstenue) sont produites par la fixture E2E |
| `supply[]` | `collect.ts:241-242` : `symbol, supply, decimals, multiplier, paused, permanent_delegate` | idem |
| `por[]` (3 formes) | `collect.ts:245-247` : `symbol, kind, method` + `note` \| `age_sec` \| `statement` | idem |
| `wrapper[]` | `collect.ts:250` : `symbol, contracts, residue` | idem |
| `halt_deltas[]` | `collect.ts:272-273` | idem |
| `halt_census` | `collect.ts` (`census()`) : `total, empty_resume` | idem |
| `digest` (niveau 1) | `buildDigest` (`digest.ts:100`) + `extra` (`collect.ts:279-281`) : `schema, gaps, halt_census, residuals, volume, supply, por, wrapper` | idem |
| `state` (niveau 1) | `collect.ts:303-305` : `schema, bell_sha, window, residuals, digest, halt_deltas?` | idem |

- **Preuve de couverture.** Test `bell_publish_whitelist_covers_all_collector_gap_shapes`. La fixture E2E produit au moins :
  - un gap **abstenu** ;
  - un gap avec **`rebase_residuals`** ;
  - un gap avec `cash_cross` ;
  - une entrée `volume` **abstenue** et une **calculée**.

  Mutant : un champ optionnel retiré de la liste ⇒ **rouge** sur la fixture abstenue.
- **Principe (inchangé).** L'éditeur enveloppe et signe ; il ne calcule aucun fait. Ses seuls champs propres : `seq`, `published_at`, hachages, `key_id`, signatures.
- **Non servis** : `journal.json` ; la timeline du collecteur en fichier séparé (elle est embarquée dans la ligne) ; la clé privée ; `inbox/`, `staging/` et les archives.
- **C-4 `paused` (ADR-T1aii l.30)** : la partie T-1b est satisfaite par publication de `digest.supply[].paused`. Le rendu comme témoin de type halt = item C-4-RENDER.

### D6 — La timeline SERVIE est un objet T-1b construit par l'éditeur (amendement d'ADR-B0 D2)

- **Le trou.** ADR-B0 D2 décrit une timeline publique append-only, chaînée et signée ; celle du collecteur est **par run** (`collect.ts:83-96`). La timeline servie est donc un objet nouveau. `error_origin` : **planificateur**.
- **Schéma `bell-timeline-v1`** :
  - champs communs : `schema`, `seq`, `kind` ∈ {`publication`, `key_rotation`, `key_revocation`}, `published_at` (**même valeur que l'enveloppe**, C-3), `prev_line_hash`, `key_id`, `sig` ;
  - `publication` : `state_sha256`, `provenance_sha256`, `runs:[{bell_sha, window, records:[<lignes de la timeline du collecteur, verbatim>]}]` ;
  - `key_rotation` : `new_key`, `new_key_id`, `sig_new`, `continuity?` ;
  - `key_revocation` : `revoked_key_id`, `revoked_from_seq`.
- **Signature** : Ed25519 (RFC 8032 §5.1.6) sur `canonical(ligne sans sig ni sig_new)`, par `crypto.sign(null, …)` (Node v24 `crypto.md:6234-6235` [lu]).
- **Chaînage** : `line_hash = sha256(canonical(ligne complète))`, puis `prev_line_hash(n+1) = line_hash(n)`.
- **Déterminisme** (RFC 8032 §8.2 [lu-WF]). KAT : RFC 8032 §7.1 TEST 1, clé **bâtie en mémoire** depuis la graine publiée (vecteur public, pas une clé Bell) ; aucun littéral `"d":`.
- **Honnêteté** :
  - la signature atteste l'**origine**, jamais la **vérité** ;
  - « signed » n'est jamais rendu « verified » ;
  - une réécriture est **détectable** par ceux qui gardent une copie antérieure : le miroir opérateur, dont le sha est consigné au JOURNAL après chaque publication (§D9), et toute copie tierce de `timeline.jsonl` ou des immuables. Point non bloquant (iii) du CP1 : la phrase est portée dans RUNBOOK-bell et sur `/bell/method`.

### D7 — `earliest_publish_utc` : refus du bundle entier (R-T1b-1, retenu)

- **L'existant.** Le champ est placé dans le digest haché (C-6 option (a), ADR-T1aii D1-quinquies l.300-306) et « consommé par la liste blanche d'export T-1b » (`G0-lot-t1a-ii-b3b.md:23,92`).
- **Option (ii), retenue (R-T1b-1).** Si une entrée est en avance, le bundle est refusé. Le `bell_sha` publié reste celui du collecteur, ce qui préserve le « bit for bit ».
- **Option (i), filtre par session : rejetée.** Elle casse l'identité du `bell_sha` rejoué.
- **Porte bloquante de la première publication : PR-B-DBN n° 8.** C'est une étape G-b du D-n, avec pièce (§D11). Elle peut changer l'offset de `earliestPublishUtc`, donc un lot séparé avant la publication.

### D8 — Écritures : ordre, durabilité, reprise (inchangé depuis le pli de la v1)

- **Emplacement des immuables.** Ils naissent dans `staging/` (privé, même système de fichiers) et n'entrent dans `public/` qu'après le point de commit.
- **Ordre** :
  1. valider ;
  2. `staging/states/<sha>.json` et `staging/provenance/<sha>.json` durables (tmp → `fsync` → `rename` → `fsync(rép.)`) ;
  3. ajout durable de la ligne privée : **point de commit** ;
  4. `rename` des immuables dans `public/`, puis `fsync(rép.)` ;
  5. `public/timeline.jsonl` ;
  6. `public/{state,provenance}.json` et `public/bell/pubkey.json`.
- **Sources** : `rename(2)` (man7 [lu-WF]) ; `fsync(2)`, qui exige aussi le `fsync` du répertoire (man7 [lu-WF]).
- **Invariants** :
  - **I-1** : tout fichier servi est cité par une ligne commitée ;
  - **I-2** : le `state.json` courant est cité par une ligne servie ;
  - **I-3** : chaque ligne servie a ses immuables servis.

  Transitoire déclaré entre les étapes 4 et 5. Panne injectée après chaque étape ⇒ I-1 à I-3 tiennent.
- **Intégrité au démarrage.** Chaîne, signatures (trousseau), `seq` contigu.
  - Une queue privée déchirée et **non servie** est tronquée, de façon journalisée.
  - Toute autre incohérence ⇒ refus.

### D9 — Clé Ed25519 : porte I-G2-2, garde, **racine de confiance = trousseau committé (C-9)**, URL canonique unique (C-10)

- **Porte.** La génération n'a lieu qu'après I-G2-2 : lecture sur place du périmètre des sauvegardes Hostinger, puis **décision de l'investisseur** sur les sauvegardes. Options : (a) exclure le chemin ; (b) désactiver ; (c) accepter avec la formule « is generated on it » (C-G2-3).
  - **R-T1b-3** : la formule ESC-2 de `/bell/method` est arrêtée **après** I-G2-2 ; « never leaves that host » seulement si (a) ou (b) est établi et mesuré.
  - `error_origin` : **plan**.
- **Génération** : `node bell-publish.mjs --generate-key /etc/monark/bell/signing-key.pem`, en root, `umask 077`. PKCS#8 PEM en 0600 root:root ; refus d'écraser ; seule sortie : le JWK public et le `key_id`. Sources : Node v24 `generateKeyPairSync('ed25519')`, formats `pem`/`der`/`jwk` (`crypto.md:86-93` [lu]).
- **Garde** :
  - `LoadCredential=bell-signing-key:/etc/monark/bell/signing-key.pem` : « only accessible to the user associated with the unit », en lecture seule, « backed by non-swappable memory » si possible, exposé par `$CREDENTIALS_DIRECTORY` (`systemd.exec.xml:3879-3887`, **v247** `:4015` [lu]) ;
  - l'éditeur lit la clé **uniquement** dans `$CREDENTIALS_DIRECTORY/bell-signing-key` ; absente ⇒ exit 1 sans rien écrire ; aucune autre lecture d'environnement ni de chemin de clé (calque B-4 de la consigne ; backlog S-3 (f)) ;
  - `PrivateNetwork=yes` (`:2054-2058` [lu]) ; l'avertissement de `:2069-2071` impose un second verrou dans le code (aucun module réseau importé, test) ;
  - la clé n'entre jamais sous `public/`.
- **Racine de confiance (C-9)** :
  - La **racine** est le trousseau **committé** `apps/bell/keys/bell-keyring.json`, fourni au vérificateur par **`--keyring`**.
  - La clé servie à `/bell/pubkey.json` n'est qu'un **canal recoupé** (CA, contrôle 3).
  - Une ligne `key_rotation` avec `continuity:"broken"` (signée par la nouvelle clé seule) n'est acceptée **que si** la nouvelle clé figure dans le trousseau fourni hors bande.
  - **Sans `--keyring`**, le vérificateur rend l'état **« auto-cohérent seulement »** (chaîne et signatures cohérentes avec la clé servie). Il ne rend jamais un état de réussite sans qualificatif ; le mot « verified » nu est exclu (vocab).
  - Test `bell_verify_trust_root_is_supplied_keyring_not_served_pubkey` ; mutant : clé servie acceptée comme racine ⇒ rouge.
- **URL canonique unique de la clé publique (C-10)** :
  - **`https://bell.monarkgate.tech/bell/pubkey.json`**, servie par l'hôte qui signe : fichier `public/bell/pubkey.json`, contrôlé par la CA du backend.
  - C'est la **seule** URL citée par `/bell/method` et par la lettre. Le site **lie** cette URL et ne sert **aucune** seconde copie.
  - Le chemin `/bell/pubkey.json` reprend celui d'ADR-B0 D8 et de la décision 78 (`/bell/pubkey`), avec l'extension. Amendement §D13.4.
  - **Interprétation déclarée du ruling** : il fixe le chemin `/bell/pubkey.json`, pas explicitement l'hôte. Je retiens l'hôte Bell (servi par ce lot, contrôle 3 de la CA). Si l'origine du site était voulue, le changement est local : bloc Caddy et contrôle 3 déplacés vers T-1b-site.
- **Rotation** : ligne `key_rotation` signée par l'ancienne et la nouvelle clé. Aucune période fixe (aucune source). Déclencheurs : compromission suspectée, changement d'hôte, révision ESC-2 à la Définition de fini, perte.
- **Compromission** :
  - ligne `key_revocation` signée par la nouvelle clé ; lignes de la clé révoquée à `seq ≥ revoked_from_seq` invalides ;
  - annonce hors bande : trousseau committé, `/bell/method`, JOURNAL ;
  - résiduel déclaré : fenêtre avant détection.
- **Perte** : `continuity:"broken"`, acceptée seulement si la nouvelle clé est dans le trousseau fourni (C-9) ; rupture rapportée.
- **Miroir de la timeline** : après chaque publication, sha au JOURNAL ; la clé n'y figure jamais.

### D10 — Service systemd (sans timer au lot a), Caddy, journal d'accès

- **Unité `deploy/monark-bell-publish.service`** :
  - exécution : `Type=oneshot`, `User=bell`/`Group=bell`, `WorkingDirectory=/opt/monark-bell`, `ExecStart=/usr/bin/env node --max-old-space-size=448 /opt/monark-bell/apps/bell/scripts/bell-publish.mjs --inbox /var/lib/monark-bell/inbox --state /var/lib/monark-bell` ;
  - clé : `LoadCredential=…` ;
  - isolement : `PrivateNetwork=yes`, `NoNewPrivileges=true`, `ProtectSystem=strict`, `ProtectHome=true`, `PrivateTmp=true`, `ReadWritePaths=/var/lib/monark-bell` (seul chemin inscriptible), `UMask=0022` ;
  - **plafonds valués (C-7)** : `CPUQuota=25%`, `MemoryMax=512M`, `TasksMax=32`, `TimeoutStartSec=120` (valeurs et motifs au § « Constantes ») ;
  - ni `EnvironmentFile` ni `[Install]`.
- **Aucun timer au lot a** : déviation de la décision 54, journalisée au §D2 (C-1).
- **Caddy `deploy/Caddyfile.monark-bell`** : bloc `bell.monarkgate.tech` avec :
  - `root * /var/lib/monark-bell/public` et `file_server` sans `browse` (docs [lu-WF]) ;
  - `Access-Control-Allow-Origin "*"` (MDN [lu-WF]) ;
  - `nosniff` ;
  - `Cache-Control` `no-cache` sur les courants, `immutable` sur `states/*` et `provenance/*` ;
  - ni `reverse_proxy` ni `log`.

  Le `Content-Type` de `.jsonl` est mesuré au G1 (point non bloquant (ii) du CP1).
- **Installation sur l'hôte : ruling C-5.** Le fichier dédié est installé **en entier** à `/etc/caddy/monark-bell.caddyfile`. Il est **remplacé en bloc**, jamais édité sur place.
  - **Si** `/etc/caddy/Caddyfile` porte d'autres sites que le défaut du paquet : une **seule** ligne `import /etc/caddy/monark-bell.caddyfile` y est ajoutée. La directive `import` « includes a snippet or file » et peut apparaître au premier niveau (docs Caddy `import` [lu-WF]).
  - **Sinon** (défaut du paquet seul) : `/etc/caddy/Caddyfile` est **remplacé** par le fichier dédié.
  - Le RUNBOOK tranche sur pièce : sha et contenu du Caddyfile en place consignés avant l'acte.
  - Dans les deux cas : sauvegarde, `caddy validate`, `systemctl reload caddy`.
- **HTTPS automatique** : A → hôte, 80/443 ouverts, données inscriptibles (docs [lu-WF]). Le DNS est **posé** (§Contexte 7).
- **Journal d'accès : ruling C-2 (item BELL-ACCESS-LOG-1 re-formé).**
  - **AUCUN journal d'accès Caddy** jusqu'au déclencheur.
  - **Déclencheur** : la **décision 78**, c'est-à-dire la mise en service de l'entrée en relation (boîte de contact `mailto:`, lot site).
  - La forme (aucun journal ; IP tronquée ou hachée ; journal complet) est **rulée à ce moment-là** par l'orchestrateur ; le GO 147 couvre les textes.
  - **Conséquence déclarée** : les signaux de la décision 78 « re-fetchs … (logs Caddy) » se comptent à partir de l'activation du journal, pas de T-1b.

### D11 — CA de déploiement, contrôles sur place, événement D-n avec portes et pièces (C-5, C-8, C-9)

- **`scripts/verify-bell.mjs --url https://bell.monarkgate.tech --keyring apps/bell/keys/bell-keyring.json --out docs/deploy-CA-bell.json --tree-digests <f> --loaded-config <f> --probe-digests <avant> <après>`**. Douze contrôles nommés ; `VERIFY OK` seulement si tous passent.
  1. `GET /state.json` 200 et JSON ;
  2. `GET /timeline.jsonl` 200 ;
  3. `GET /bell/pubkey.json` 200 et **== trousseau committé** (canal recoupé, C-9/C-10) ;
  4. `GET /provenance.json` 200 ;
  5. vérification complète **avec `--keyring` pour racine** (C-9) : chaîne, signatures, liaisons, `bell_sha` par run, immuables ;
  6. ACAO `*` ;
  7. `GET /` n'est pas un listing ;
  8. cache immuable sur `states/` ;
  9. `tls.authorized === true` ;
  10. aucun matériau privé servi ;
  11. **empreintes de l'arbre ET de la configuration réellement chargée (C-5)** :
      - (a) chaque fichier de `/opt/monark-bell` == `git show <SHA G7>:<chemin>` ;
      - (b) `/etc/caddy/monark-bell.caddyfile` (ou `/etc/caddy/Caddyfile` si remplacé) == `git show <SHA G7>:deploy/Caddyfile.monark-bell`, et, en mode `import`, exactement une ligne `import` qui le cible ;
      - (c) `systemctl cat monark-bell-publish.service` montre **un seul fragment, aucun drop-in**, et son corps (sans la ligne de commentaire d'en-tête qui nomme le fichier) == `git show <SHA G7>:deploy/monark-bell-publish.service`. `systemctl cat` montre les fichiers **sur disque**, qui peuvent différer de ce que le gestionnaire a chargé sans `daemon-reload` (`systemctl.xml:349-359` [lu]). D'où `systemctl show -p NeedDaemonReload` == `no`. Selon `org.freedesktop.systemd1.xml:2809-2811` [lu], cette propriété indique si le fichier de configuration dont l'unité est chargée « has changed since the configuration was read ».

      Mutant : unité copiée modifiée ⇒ rouge ;
  12. empreintes de `/opt/monark-probe` et `/etc/monark/probe.env` inchangées.
- **Contrôles sur place** :
  - `node -v`, `which node` ;
  - `caddy version`, `systemctl is-active caddy` ;
  - `ufw status` ;
  - `systemctl --version` ≥ 247 ;
  - `timedatectl show -p NTPSynchronized` ;
  - `sudo -u caddy test -x /var/lib/monark-bell/public` (`RUNBOOK-sentinel.md:44`) ;
  - disque ;
  - `systemctl list-units 'monark-*'` ;
  - `npm -v` (informatif).
- **Séquence D-n (C-8)** : les **portes** précèdent l'étape 9, chacune avec sa **pièce probante**. Le JOURNAL du D-n **cite chaque pièce**.

| Étape | Porte / acte | Pièce probante | Qui |
|---|---|---|---|
| G-a | G7 des PR 1, 2, 3 | documents G7 + SHA de fusion | orchestrateur |
| G-b | **PR-B-DBN n° 8** : licence EQUS.SUMMARY + FAQ « after 24 hours » | **fichier de FAITS daté** (lecture sur place : URL, heure, citation ≤ 25 mots) sous `docs/course-bell/` ; offset confirmé, ou lot de changement G7 avant G-e | orchestrateur |
| G-c | **I-G2-2** : périmètre des sauvegardes | **lecture hPanel consignée** (FAITS daté) + **décision investisseur sur les sauvegardes** (ligne CHANTIERS) + ruling ESC-2 (R-T1b-3) | orchestrateur + investisseur |
| G-d | **DNS** | `CHANTIERS.md:1157-1158` + `dig +short bell.monarkgate.tech` = `178.16.131.29` **rejoué au D-n** | orchestrateur |
| G-e | **premier bundle** (Q6-COURSE-1 et/ou -b1-bis-ii) | **sha256 du bundle** et références de sa course (JOURNAL de course, ancres) | orchestrateur |
| 1-8 | contrôles sur place ; arbre `git archive` au SHA G7 ; utilisateur et répertoires ; **clé (après G-c)** ; commit du trousseau ; unité ; Caddy (ruling C-5) ; DNS constaté | sorties consignées | orchestrateur |
| 9-13 | `scp` du bundle ; `systemctl start` ; CA `VERIFY OK` ; JOURNAL ; miroir | CA JSON + sha | orchestrateur |

  Le **commit du trousseau et du JSON de CA** passe l'**oracle complet** (`npm run ci`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`) **avant tout push** (décision 136 : aucun déclenchement CI sans prévenir).

### D12 — `built` / `upcoming` ; frontière avec le site

- **Registre public inchangé** : Bell `upcoming` (décisions 117 et 146 Q3 ; ADR-B0 D8). Critère : 0 ligne sur `apps/site`, `README.md`, `skills`, `schemas`, `packages/contracts`, par PR.
- **État interne** : « câblé (code) + composition testée » au G7 des PR ; « **servi** » au D-n (CA verte, première publication).
- **Hors périmètre backend** (propriétaire orchestrateur ; déclencheur nommé) :

| Élément | Où | Déclencheur |
|---|---|---|
| `/bell/method` : **URL de la clé `https://bell.monarkgate.tech/bell/pubkey.json`** et `key_id` ; périodes du ratio ; règle du jour du close ; phrase « détectable par qui » (§D6) ; **nommer ou décrire génériquement la source de clôture selon PR-B-DBN n° 8** (item **CLOSE-SOURCE-NAMING-1**, conséquence de R-T1b-2, CP1 §5) | T-1b-site (SITE-CHARTE-C) | D-n fait + EXPORT-BELL-1 + G-b |
| `/bell/anchors/` (146 Q2) | T-1b-site | en cours |
| panneau `/bell/` + `bell_panel_reads_published_state`, rejoué depuis la sortie de `bell-publish` sur la sortie réelle de `runMain` | T-1b-site | page Bell ; contrat : `publishToDir(bundleDir, keyring, clock)` exportée |
| `fleet.ts` : Bell `PRODUCTS` `upcoming`, capteur « Kane » `upcoming`, contrôle de collision du nom | T-1b-site | idem |
| **EXPORT-BELL-1** : export d'`apps/bell` (code de rejeu public) ; purge des noms de la décision 69 dans `close.ts`, `collect.ts`, `volume.ts:140` (`ADV_SOURCE`), `bell-report.mjs:111` (`renderMarkdown` : « Close of record: Massive Starter… »), **`apps/bell/test/report.test.ts:69` (`:67` à `83b8904`, littéral `massive-starter-internal`, CP1 §5)** ; décision 52 ; anti-close | lot dédié, régime complet | avant le remplissage d'`url_method` |

### D13 — Amendements portés (texte à insérer au G7 par l'orchestrateur)

1. **ADR-B0 D2** : la timeline publique est l'objet `bell-timeline-v1` de l'éditeur ; la timeline par run du collecteur y est embarquée. `error_origin` : planificateur.
2. **ADR-B0 D7/D8 (C-1)** : « Déviation de la décision 54 (`CHANTIERS.md:119`) : le lot T-1b-backend-a livre `deploy/Caddyfile.monark-bell`, `docs/RUNBOOK-bell.md` et `monark-bell-publish.service`, sans timer ; le timer et le service de collecte (`monark-bell-collect.{service,timer}`) passent au lot b, BELL-COLLECT-TIMER-1 (option C, R-T1b-5, décision 143) ; motifs : secrets d'API sur l'hôte public, clé Helius révoquée au verdict, plafonds par compte 121/125, licences serveur ; `error_origin` planificateur ; investisseur informé (décision 137 : informer, ne pas demander). Jusqu'au lot b, la publication est un acte opérateur ; la cible « ≤ 10 min » de D8 n'est ni tenue ni revendiquée. » Ligne jumelle dans CHANTIERS, par l'orchestrateur.
3. **ADR-B0 D8, formule ESC-2** : « is generated on it », tant que le ruling après I-G2-2 n'établit pas mieux (R-T1b-3).
4. **ADR-B0 D8 et décision 78 (C-10)** : « l'URL canonique unique de la clé publique est `https://bell.monarkgate.tech/bell/pubkey.json` (anciennement « `/bell/pubkey` ») ; la racine de confiance est le trousseau committé `apps/bell/keys/bell-keyring.json` (C-9) ». Ligne CHANTIERS de renvoi à `:227`, par l'orchestrateur.
5. **ADR-B0, décision 80** (`CHANTIERS.md:229`) : inscription verbatim. Aucune publication privée ni accès restreint dans l'éditeur (test).
6. **ADR-T1aii** : tuyaux T-1b ; bascule `upcoming → servi` datée au D-n.
7. **`vocab-banned.json`**, scope `bell` : `dirs` += `apps/bell/scripts`, `extensions` += `.mjs`.
8. **CHANTIERS `:45` / `:84` (R-T1b-4)** : K-1 découplé de T-1b. `error_origin` : planificateur. Acte de l'orchestrateur au G7.

---

## Constantes (C-7) — valeurs et motifs (le G1 confirme ou amende avec mesure déclarée)

| Constante | Valeur | Motif |
|---|---|---|
| `MAX_RUNS` | **64** | le périmètre v1 compte 5 jetons (4 xStocks Solana + TSLAon, ADR-B0 D2) ; un D9 fondateur par pool et une course Q6 donnent quelques runs par publication ; 64 laisse un ordre de grandeur de marge. Toute croissance vers le census (362 lignes, décision 40) passe par un amendement et une taille mesurée |
| `MAX_INPUT_FILE_BYTES` | **64 MiB** | ≤ 1/7 du plafond de tas V8 de l'unité (448 MiB), pour laisser au même processus l'analyse JSON (graphe d'objets), une copie canonique et le hachage. La taille réelle d'un run fondateur n'est **pas mesurée** : la G1 la mesure sur la fixture, le D-n sur le bundle réel. Dépassement ⇒ refus (publier en plusieurs fois), jamais une troncature |
| `MAX_PUBLIC_STATE_BYTES` | **64 MiB** | même motif ; l'enveloppe servie doit tenir dans le même budget mémoire |
| `MAX_LINE_BYTES` | **1 MiB** | une ligne embarque au plus `MAX_RUNS` × quelques enregistrements par symbole ; bien en deçà. La timeline privée est vérifiée **ligne à ligne**, en flux, sous cette borne par ligne |
| `CPUQuota` | **25%** | précédent `monark-probe.service` sur le même hôte (2 vCPU, `CHANTIERS.md:123`) : laisse leur part à Caddy et à la sonde |
| `MemoryMax` + `--max-old-space-size` | **512M** + **448** | précédents harness (H7) et sentinelle : un arrêt propre du tas avant le tueur OOM du cgroup |
| `TasksMax` | **32** | un seul processus Node (pool libuv de 4 et fils V8) ; précédents 64 (sonde) et 128 (harness) pour des profils plus lourds |
| `TimeoutStartSec` | **120** | précédent sonde ; le travail (hachage ≤ 64 MiB, une dizaine d'écritures durables) est d'un ordre de grandeur en dessous. Mesure win32 de l'écriture durable : p99 80,7 ms (ADR-T1aii D1-nonies §5) ; la valeur Linux reste à constater au D-n |

**Mutants** : pour chaque borne, un test « borne abaissée, puis entrée à deux fois la borne ⇒ refus nommé » ; le contrôle retiré ⇒ rouge.

---

## Tuyaux (entrée / sortie / état / test) — ADR-M018 D3

| Tuyau | Entrée | Sortie | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| T-a collecte → bundle | `runMain` (`collect.ts:854-859`), **`--out` réel hors dépôt** (C-3) | `bell-publish.mjs` | poste opérateur (D9 hors dépôt) → `inbox/` | `bell_publish_consumes_real_runmain_output_end_to_end` (égalité profonde `runs[i]` ↔ `state.json` du run ; `published_at` unique) |
| T-b éditeur → servi | `bell-publish.mjs` | Caddy → tiers, lettre, CA ; panneau (T-1b-site) | `timeline.jsonl` privé ; `staging/` ; `public/` | même E2E + CA contrôles 1-10 |
| T-c servi → vérificateur | HTTP GET | `bell-verify.mjs`, **racine `--keyring`** (C-9) | — | `bell_verify_*` + `bell_verify_trust_root_is_supplied_keyring_not_served_pubkey` |
| T-d clé → signature | `LoadCredential` | éditeur | root 0600 ; publique : `/bell/pubkey.json` + trousseau committé | `bell_key_*` + CA 3/10 |
| T-e `earliest_publish_utc` → porte | digest (`collect.ts:181`) | refus C-in-5 | — | `bell_publish_refuses_unpublishable_session` |
| T-f `volume[]` → servi | `collect()` | `state.json` | — | E2E (entrées calculée ET abstenue) |
| T-g servi → `bell-report` | `runs[]` servis | `aggregate()` | — | `bell_report_aggregate_equals_on_served_bundle` |
| T-h servi → panneau | CORS | `apps/site` | — | **ABSENT au lot a**, item T-1b-site |
| T-i collecte VPS | timer | `inbox/` | — | **ABSENT**, BELL-COLLECT-TIMER-1 |
| T-j config livrée → config chargée (C-5) | `git show <G7>` | Caddy / systemd | `/etc/caddy/…`, `/etc/systemd/system/…` | CA contrôle 11 (b)(c) |

---

## Dépendances (état v2 au 2026-09-23 ~14:1xZ)

| Dépendance | État | Bloque |
|---|---|---|
| G7 BELL-ADV-1 | **ACCEPTÉ**, fusion `adc3260` (14:05Z) | **porte levée**. Le G1 PR-1 part de la pointe de `lot/etude-suite` (≥ `adc3260`) |
| Q6-COURSE-1 / -b1-bis-ii | préparés / à venir | contenu de la première publication (G-e) |
| I-G2-4 (« bit for bit ») | ouvert (lots de course) | rien ici ; tout champ nouveau d'un run ⇒ amendement de la liste blanche |
| I-G2-2 | ouvert | **clé** (G-c) |
| PR-B-DBN n° 8 | ouvert | **première publication** (G-b) |
| DNS | **LEVÉE** (13:49Z) | — (`dig` rejoué au D-n, G-d) |
| Décision 79 / E-2 | **LEVÉES** (décision 147) ; JURISTE-ACTE-NOV-1 (acte formel en novembre, investisseur) | rien |
| K-1 | **DÉCOUPLÉ** (R-T1b-4) | rien ; amendement CHANTIERS `:45/:84` au G7 |
| SENTINEL-DEPLOY-GUARD-1 | ouvert | non déclenché par ce lot |
| NARABI-OPS-1 (d) | hérité | lot b |
| PR-B-8 MWCB | procurement | release Bell (re-formé) |
| T-1b-site / EXPORT-BELL-1 | en cours / non ouvert | `url_method` |

## Actes investisseur nommés (NON faits ici) — escalades

- **Faits** :
  - DNS, par acte délégué (13:49Z) ;
  - décision 147.
- **Restent** :
  - **décision sur les sauvegardes** après la lecture I-G2-2 (G-c) ;
  - **lot b** : clé ou compte Helius, pose des secrets, ruling sur le ledger ;
  - **JURISTE-ACTE-NOV-1** : joindre l'acte formel à sa réception ; non bloquant.
- **Escalades ouvertes : aucune.**
  - E-1 tranchée (R-T1b-5) ;
  - E-2 close (décision 147) ;
  - rulings R-T1b-1..7 rendus.

## Demande de consultation K-1 — **TRANCHÉE (R-T1b-4 : découplage ; le validateur concourt, CP1 CA-2)**

- Texte v1 conservé pour l'historique : `ADR-T1b-backend.v1.md`, § « Demande de consultation formée ».
- Option retenue : **(b)**.
- La réutilisation de la procédure par K-1 (option (c)) reste possible au lot K-1.

---

## Sources

- **[lu] Dépôt.**
  - v1 @ `83b8904` et v2 @ `c0f905c` (ancres de code @ `adc3260`, empreintes en tête du Contexte).
  - `CHANTIERS.md` @ `c0f905c` : l.45, 72, 75, 84, 119-125, 208, 223, 227-229, 281, 329-330, 412, 539-541, 602, 638, 836, 857-860, 1042-1047, 1108, 1115-1133, 1157-1162, entrée 14:05Z.
  - ADR-B0, ADR-T1aii, ADR-M013, ADR-M018 ; `docs/RUNBOOK-{harness,sentinel}.md` ; `docs/CONSIGNE-STANDARD-G1.md` (`543c23c5…`) ; `deploy/*` ; tests racine cités ; `vocab-banned.json`.
- **[lu] Primaires en ligne, octets téléchargés et hachés** :
  - Node v24 `crypto.md` (`9646e88a…`, l.86-93, 6229-6235, 6368-6372) ;
  - systemd `systemd.exec.xml` (`44b89bff…`, l.2054-2071, 3877-3887, 4015) ;
  - **systemd `systemctl.xml`** (`caca7b87…`, l.349-359 : `cat` montre les fichiers sur disque, jusqu'au `daemon-reload`) ;
  - **systemd `org.freedesktop.systemd1.xml`** (`59cfeea5…`, l.2809-2811 : `NeedDaemonReload`).
- **[lu-WF]** : RFC 8032 (§1, §5.1.6, §7.1, §8.2) ; man7 `rename(2)`/`fsync(2)` ; Caddy `file_server`/`root`/`header`/`automatic-https`/**`import`** ; MDN ACAO ; systemd.io/CREDENTIALS ; MAST v3.
- **Artefacts de gouvernance** : `F:\tmp\cp1-t1b\CP1.md` (`d8f95c8a…`) ; `F:\tmp\t1b-g0\RULINGS-orchestrateur.md` (`1da85a27…`) ; messages de l'orchestrateur du 2026-09-23 (~14:00Z : rulings C-1..C-10 ; ~14:0xZ : G7 BELL-ADV-1, base et worktree).
- **Aucun chiffre de seconde main** : les valeurs du § « Constantes » sont des choix de conception motivés ; aucune taille mesurée n'est revendiquée. **Aucun [2nd].**

## Alternatives rejetées

- **Publication et arbre** :
  - VPS site / reverse-proxy ;
  - collecte VPS dès le lot a (reportée au lot b, non rejetée) ;
  - P2 dès le lot a ;
  - filtre par session (§D7) ;
  - copie publique non atomique ;
  - signer la seule tête ;
  - ancrage on-chain.
- **Clé** :
  - fichier chiffré par phrase de passe ;
  - `systemd-creds` sous clé d'hôte ;
  - TPM/HSM non établi ;
  - bibliothèque Ed25519 tierce (R-8) ;
  - un fichier par run sans enveloppe ;
  - journal d'accès avant le déclencheur 78 (C-2).
- **Ajouts v2** :
  - **racine de confiance = clé servie** : un hôte compromis « tournerait » vers sa propre clé (C-9) ;
  - **deux URL pour la clé** : incohérence entre la lettre, la méthode et le code (C-10) ;
  - **liste blanche mesurée sur un run** : un champ optionnel absent de la fixture ferait refuser un run réel au D-n sans rouge en amont (C-4) ;
  - **égalité de `CLOSE_KEY` par littéral seul** : un grep sur le source (C-6) ;
  - **CA sur les seuls fichiers de l'arbre** : aveugle à la configuration chargée, précédent CARTO-T1F-2 (C-5).

## Conséquences

- **Positives** :
  - premier chemin servi de Bell, avec une liaison vérifiable état ↔ timeline ↔ clé ;
  - racine de confiance hors de l'hôte ;
  - configuration chargée prouvée ;
  - aucun secret d'API nouveau sur l'hôte public.
- **Négatives, assumées** :
  - publication par acte opérateur jusqu'au lot b ;
  - duplications prouvées égales ;
  - amendement de la liste blanche à chaque champ nouveau ;
  - timeline nouvelle ;
  - clé soumise à I-G2-2 ;
  - `adv_source` et `close_source` non servis ;
  - signaux de la décision 78 retardés à l'activation du journal.
- **Items formés** (propriétaire orchestrateur sauf mention) :
  - **BELL-COLLECT-TIMER-1** (lot b) ;
  - **EXPORT-BELL-1**, dont `report.test.ts:69` ;
  - **BELL-ACCESS-LOG-1** (déclencheur : décision 78) ;
  - **BELL-PROBE-1** ;
  - **C-4-RENDER** ;
  - **CLOSE-SOURCE-NAMING-1** (T-1b-site, déclencheur G-b) ;
  - **NARABI-COPY-ATOMIC-1**, accepté (R-T1b-7). Déclencheur : prochain lot touchant `apps/sentinel/src/run.ts` (le ruling écrit « `apps/narabi/.../run.ts` » ; le fichier réel est `apps/sentinel/src/run.ts:360`), ou tout redéploiement Narabi ;
  - **JURISTE-ACTE-NOV-1** (investisseur) ;
  - item (6) de la décision 69 : clos pour les fichiers servis, ouvert pour l'export.

## Modes MAST (Cemri et al., arXiv:2503.13657v3)

| Mode | Menace | Contre-mesure |
|---|---|---|
| FM-1.1 | collecte VPS ou `apps/site` touchés | « 0 ligne » par chemin |
| FM-1.2 | le worker commit, déploie ou génère une clé | R-20 ; portes G-a..G-e acte orchestrateur |
| FM-1.3 | double publication | C-in-9, C-in-10, `seq` contigu |
| FM-1.4 | décisions 69/78/80, K-1, C-6 perdues | citations à la ligne ; mission G1 autoportante |
| FM-1.5 | « servi » sans CA | D-n : `VERIFY OK` + `tls.authorized` ; portes avec pièces |
| FM-2.1 | agent ou éditeur coupé | rendus sous `F:\tmp` ; reprise §D8 |
| FM-2.2 | tranche silencieuse | rulings journalisés ; interprétation C-10 déclarée |
| FM-2.3 | dérive vers le site | table de frontière §D12 |
| FM-2.4 | entrée écrite à la main | E2E depuis `runMain` à `--out` réel ; égalité profonde |
| FM-2.5 | rulings G2/CP1 ignorés | traçabilité C-1..C-10 ci-dessous |
| FM-2.6 | « origine » dit, « verified » servi | gate vocab sur le texte servi ; « auto-cohérent seulement » sans `--keyring` |
| FM-3.1 | D-n clos sans première publication | étapes 9-13 obligatoires |
| FM-3.2 | fsync/rename sous win32 ; configuration chargée | couture durable + item CI POSIX ; CA 11 (b)(c) |
| FM-3.3 | éditeur et vérificateur partagent un défaut ; G1 et G2 de même famille (Opus 5.5) | KAT RFC ; double égalité C-6 ; checkpoint-2 (Fable, instance séparée) qui rejoue un mutant du vérificateur (CP1 CA-5) |

## `error_origin` (proposés ; assignés au G7)

| Point | Origine | Motif |
|---|---|---|
| Timeline publique ≠ timeline du collecteur | planificateur | ADR-B0 D2 antérieur au collecteur |
| Formule ESC-2 face aux sauvegardes | plan (C-G2-3) | antérieure au provisionnement |
| K-1 bloquant de T-1b | planificateur (R-T1b-4) | plan du 2026-09-19, antérieur à la scission |
| **C-1** déviation de la décision 54 | **planificateur** (ruling) | livraison fixée avant la mesure des discriminants |
| **C-2** journal d'accès vs décision 78 | **rédacteur G0** (worker) | la v1 a formé BELL-ACCESS-LOG-1 « si le GTM demande » sans relire la décision 78, qui nomme déjà les logs Caddy (manquement à G-1 de la consigne) |
| **C-3, C-4, C-6, C-7, C-8, C-9, C-10** | **rédacteur G0** (worker) | précision manquante dans la v1 (rejeu, dérivation, égalité, valeurs, pièces, racine, URL) ; attrapée par le checkpoint-1 |
| **C-5** configuration chargée | **rédacteur G0** (worker) | la v1 appliquait la leçon CARTO-T1F-2 à l'arbre, pas à la configuration chargée |
| `adv_source` / `close_source` | n/a (item (6), rien de servi) | projection §D5 |

## Traçabilité des corrections du checkpoint-1 (v1 → v2)

| Correction | Où, dans cette v2 | Preuve à venir |
|---|---|---|
| C-1 | §D2 « Déviation nommée », §D13.2, §error_origin | ligne d'amendement citant `CHANTIERS.md:119` (G7) |
| C-2 | §D10 « Journal d'accès », §Conséquences | item BELL-ACCESS-LOG-1, déclencheur décision 78 |
| C-3 | §D4 (horloge unique), §Tuyaux T-a ; backlog S-3/S-5 | `bell_publish_consumes_real_runmain_output_end_to_end`, `bell_publish_published_at_single_clock_read` |
| C-4 | §D5 (tableau de dérivation) ; backlog S-2/S-5 | `bell_publish_whitelist_covers_all_collector_gap_shapes` + mutant |
| C-5 | §D1, §D10 (import vs remplacement), §D11 contrôle 11 (b)(c), T-j ; backlog S-9/S-11 | contrôle nommé + mutant « unité copiée modifiée » |
| C-6 | §D3 ; backlog S-1 | deux assertions dans `bell_chain_close_key_equals_digest` |
| C-7 | § « Constantes » ; backlog S-2/S-7 ; mission G1 | valeurs + mutants à borne ×2 |
| C-8 | §D11 (tableau G-a..G-e + pièces) ; backlog S-12 | JOURNAL du D-n citant chaque pièce |
| C-9 | §D9 « Racine de confiance », §D11 contrôles 3/5 ; backlog S-4/S-6/S-9 | `bell_verify_trust_root_is_supplied_keyring_not_served_pubkey` + mutant |
| C-10 | §D5, §D9 « URL canonique », §D13.4 ; backlog S-8/S-9 | ligne d'amendement ADR-B0 D8 + décision 78 |

**Errata v1**, relevés par le rédacteur à la relecture des ancres ; non relevés par le checkpoint-1. `error_origin` : **rédacteur G0**.
- **E-v1-1** : §D3 de la v1 citait `digest.ts:22-30` (`canonical`) et `:32` (`CLOSE_KEY`). Les ancres exactes à `83b8904` sont `:23-31` et **`:33`** (`git show 83b8904:apps/bell/src/digest.ts | sed -n '23p;33p'`). À `adc3260` : `:28-36` et `:38`.
- **E-v1-2** : §D5 de la v1 citait `collect.ts:287-296` pour l'enveloppe de provenance. L'ancre exacte à `83b8904` est **`:258-264`** (`sed -n '258,264p'`) ; à `adc3260`, `:294-301`.
- Aucune conclusion de la v1 ne dépendait de ces numéros : le contenu cité était exact, la ligne ne l'était pas.

## Provenance

- **Généré par** le worker `claude-opus-5-5[1m]` (effort max), le 2026-09-23. v1 à 13:31Z ; v2 après le checkpoint-1.
- **Contexte** : mission G0 et message de l'orchestrateur (C-1..C-10) ; dépôt en lecture seule.
- **Réviseurs** : orchestrateur (R-21), validateur (checkpoint-1 fait ; checkpoint-2 par PR).
- **Écritures** : aucun commit, aucun accès VPS, aucune écriture dans `F:\Monark`.

## Amendement daté 2026-09-23 — G7 PR-1 (`lot/t1b-backend` @ `72803e5` = `64dbbd6` + PR-1-bis `d4fcb76` + PR-1-ter `72803e5`), orchestrateur `claude-fable-5-1`

Actes documentaires dus par le checkpoint-2 PR-1 (`docs/CHECKPOINT2-lot-t1b-backend-pr1.md`, C-V-3/C-V-4) et par son delta (`docs/CHECKPOINT2-delta-lot-t1b-pr1.md`, C-D-1..C-D-5) :

- **D5 (C-V-3 a, D-9)** : le `provenance.json` SERVI porte `published_at` (horodatage de la publication, pas de la collecte) ; la ligne de timeline et l'enveloppe sont liées par cette valeur (test C-5 PR-1-bis, CD-5 PR-1-ter).
- **D8 (C-V-3 a, D-13 et D-20)** : le trousseau `keyring.json` est écrit à l'étape 3 du publisher au PREMIER run (dérivé de la clé de l'unité), et les réparations de l'état commité (copie servie manquante, altérée ou en retard) sont faites AVANT la validation du bundle. **Ruling O-7 (C-D-2, déclencheur « G7 PR-1 » atteint)** : une copie servie altérée ou en retard est **re-dérivée et journalisée** (comportement livré, épinglé par le test C-6 de PR-1-bis) ; toute autre incohérence de l'état (chaîne, signature, immuable, enveloppe) est un **refus nommé** (`existing_timeline_corrupt`), jamais une réparation silencieuse. Le vérificateur (PR-2) ne vérifie pas que le trousseau passé en `--keyring` est committé : item **CA-KEYRING-COMMITTED-1** (cp-2 PR-3), ceinture au D-n = JOURNAL cite le sha du blob committé.
- **`error_origin` (C-V-3 b)** : PROC-RFC8032-KAT-1 → rédacteur G0 (RFC citée [lu-WF] sans les valeurs) ; D-18 → outillage Write (A13-UNICODE-ESCAPE-1). **CD-1..CD-4 (PR-1-ter)** → relecteur G2 PR-1 (CD-1, CD-2, CD-3) ; worker G1 + relecteur G2 PR-1 (CD-4). **DV-2** (4 objets `tree` non référencés écrits par `merge-tree` du relecteur) → relecteur G2-delta, inoffensif.
- **CI-POSIX-FSYNCDIR-1 (C-V-3 c)** : déclencheur = « à la prochaine exécution CI autorisée par l'investisseur » — conditionné à la décision 136 (aucune CI sans prévenir) ; jamais déclenché par une PR ouverte pour lui.
- **D13.5 (C-V-3 d, décision 80)** : le test « aucune publication privée ni accès restreint » est porté par **PR-3**, sous deux formes lues (pas devinées) : (i) le modèle Caddy en sous-ensemble FERMÉ de `test/bell-caddy.ts` (un site, `root`, `header`, `file_server [browse]` ; toute autre directive — `basicauth`, `remote_ip`, etc. — fait échouer `serveCaddy`, fail-closed) exercé par S-8 sur le Caddyfile committé ; (ii) la CA `scripts/verify-bell.mjs` : c06 (chaque chemin servi répond 200 avec `access-control-allow-origin: *`), c07 (aucun listing), c10 (aucune matière privée servie, JWK publiques seules), c09 (TLS autorisé). Une première rédaction de cette ligne citait un « contrôle 9 sans en-tête d'authentification » inexact — corrigée avant commit du G7 après lecture des fichiers (error_origin orchestrateur).
- **Anti-close (C-V-4)** : 0 coïncidence sur les formes de la clause ; 2 correspondances hors formes (`[masque]`) sur un littéral synthétique préexistant (`collect.test.ts:754` @ `c0f905c`), classe I-3 du CP2bis -b3b ; consignation, aucune purge ; clause inchangée.
- **CD-5 (C-D-3)** : le rendu PR-1-bis affirmait « pas de couplage avec BELL-REPUBLISH » — **faux**, corrigé ici : sous le code PR-1 le surensemble republie `a` ; sous « O-1 ⇒ refus » C-7 rougit (`duplicate_run`) ; sur la fusion avec PR-2 (**filtre**, 26/26, `skipped_already_published`). **Ruling forme (au G7 PR-2, tranché ici pour ne pas le reporter)** : **FILTRE** (les runs déjà publiés sont sautés et journalisés, les nouveaux sont publiés ; invariant T-g « l'archive reçoit le bundle entier, seuls les runs nouveaux sont servis » est réécrit ainsi : l'archive reçoit le bundle entier ET le journal nomme les runs sautés) ; C-7 conserve ses deux ordres (g13 et y09 exigent chacun un ordre).
- **Déviation déclarée (C-D-4)** : PR-1-ter n'a pas eu de G2 en instance séparée du rédacteur du patch (le patch a été écrit par le relecteur G2-delta lui-même, appliqué et prouvé par l'orchestrateur : 14/14 G2 + 9/9 y rejoués) — compensé par le checkpoint-2 delta (rejeu indépendant 6/6). error_origin → orchestrateur (choix de vitesse, décision 149).
- **Item (C-D-5)** : le test 42 rouge de la pré-intégration (1/508) a été qualifié après coup : entrée supplémentaire sous charge (famille HTTP-TEST-CRASH-1), CI exportée verte sur la fusion et sur la pointe rejouées seules — pas d'item propre ; rattaché à HTTP-TEST-CRASH-1 (3 occurrences le 23/09).
- **CA-11 (branchement)** : la fusion de PR-1 est licite ; le passage de Bell à `built` n'a lieu qu'à G-a + déploiement PR-3 + CA sur l'hôte (RUNBOOK étape 11).

## Amendement daté 2026-09-23 — décision investisseur 155 (BELL-HOST-ROOT-1) : la racine de l'hôte redirige vers la page du site

- **Fait** : `https://bell.monarkgate.tech/` répondait 404 (l'hôte ne sert que des fichiers) ; l'investisseur l'a lu comme « Bell n'est pas en ligne ».
- **D10 (Caddy)** : le bloc `bell.monarkgate.tech` porte en plus, après les `header` et avant `file_server`, `@home path /` + `redir @home https://monarkgate.tech/bell 302` (matcher nommé exact, URL absolue `https://`, code `302` littéral, un seul `redir`). Le modèle fermé `test/bell-caddy.ts` n'admet que cette forme (S-8) ; ordre `header → redir → file_server` = ordre codé de Caddy v2.11.4 (lu : `caddyfile/directives.md`, `parseRedir`).
- **D11 (CA, contrôle 7)** : « `GET /` n'est pas un listing » devient « `GET /` ⇒ 302 avec `Location` exactement `https://monarkgate.tech/bell` ; aucun listing sur les répertoires » ; la CA ne suit jamais une redirection (c07/c11 cohérents).
- **D13.5** : la redirection n'est pas un accès restreint ; les chemins servis restent `state.json`, `timeline.jsonl`, `provenance.json`, `bell/pubkey.json`, `states/*`, `provenance/*`.
- **§D12** : supersédé par l'amendement ADR-B0 du 2026-09-23 (décision 155) — Bell `built` au registre.
- **Rejeu** : RUNBOOK étape 7 rejouée avec le blob du nouveau G7 (`G7-1.txt` conserve l'ancien ; `Caddyfile.bak-bell-2`), étape 8 attendu `302 0 https://monarkgate.tech/bell` pour `/` et `404` pour un chemin inexistant, puis étape 11 (CA).
- **Items** : le second lecteur `apps/bell/test/helpers/bell-served.ts` ignore `redir` (piège : `fetch` suit les redirections — `redirect: "manual"` si modélisé un jour) ; aucun Caddy réel en local (validation par `caddy validate` sur l'hôte avant bascule).
