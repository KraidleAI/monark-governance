# CHECKPOINT-1 (PLAN) — sous-lot Bell T-1a-ii-b3d-b (pli source + course + passage en production de la contre-vérification full-mint)

Avis du `validateur-humain`, modèle résolu **`claude-fable-5-1`** (R-1), instance séparée à contexte frais, **2026-09-21 02:07→02:20 UTC** (rejeu AM-2 ter sous `F:\tmp\cp1-b3d-b\` : `h1.ts`, `replay.test.ts`). **Rédigé par le worker rédacteur `claude-opus-4-8[1m]`** (transcription fidèle de l'avis rendu ; corrections/tranchages **intégraux**) ; **committé par l'ORCHESTRATEUR** (R-20 : le worker ne committe pas). Artefact jugé : `docs/G0-lot-t1a-ii-b3d-b.md` au commit **`5c1c44d`**, sha256 **`3f9a836666b0f313d6d0e149ce532be71161576b185e81a0bc8aabf15d132c74`** (recomputé conforme ce tour : `git show 5c1c44d:… | sha256sum` == working-tree). §2 du PLI GELÉ intact (`7071484f…`). HEAD `3aaf094`, `git status` propre, aucun appel réseau, aucune valeur de close citée.

## Décision
**SCINDÉE.**
- **-b3d-b1 : ACCEPTE-AVEC-CORRECTIONS** — **9 bloquantes C-B-1..9** à plier dans le G0/le pli source **avant tout code**.
- **course : SUSPENDUE** — conditions de reprise pré-enregistrées (audit HELIUS-1 ; deux lectures espacées ; PLI §4 rebasé ; étalonnage du coût par appel).
- **-b3d-b2 : ACCEPTE-AVEC-CORRECTIONS conditionnel** — **checkpoint-1 DELTA OBLIGATOIRE après le tirage** ; corrections C-B2-1..4.
- **ordre R1 / -b3d-b2 : ESCALADE-INVESTISSEUR (EN ATTENTE)** — deux ordres possibles écrits (A recommandé, B strict décision 85) ; ne présume aucune réponse.

Aucune escalade investisseur due maintenant hors l'ordre R1/-b3d-b2 ; escalades conditionnelles recâblées par C-4.

## Vérification sur pièces (synthèse) — TROIS REJEUX AU HEAD
- **V-1 — FAUX `equal` par reprise.** Un scan coupé par le budget sur une page où le **quorum de corps a échoué** committe la page au ledger **SANS son événement** ; à la reprise avec l'opérateur sain ⇒ `equal`, `scan_complete=true`, alors que le full-mint a vu l'événement et la série non. H5 passe parce que le **triplet final n'encode pas l'historique intermédiaire** dès que deux updates suivent (9 à 11 événements par série). Cause : les drapeaux `blockTimeNull`/`bodyQuorumFail`/`notFullPages`/`nonMonotonic` (`rebase-crosscheck.ts:204`) sont **process-locaux, ni persistés ni réensemencés**.
- **V-2 — écrasement.** Un artefact `equal` relancé sous un `--max-credits` **inférieur au cumul** est **ÉCRASÉ** par `inconclusive:budget_exhausted` (`scan_complete` true→false ; `calls_by_method` remis à `{1,0}`).
- **V-3 — compteur.** À l'épuisement du budget, **Σ `calls_by_method` = 4** alors que **`calls_used` = 3** (`counted` incrémente AVANT le garde budgétaire).

## Checklist (adaptée au PLAN de -b3d-b)
CA-1 (correction : V-1/V-2/V-3 falsifient l'énoncé de complétude) **bloquante** ; CA-2/3/4 conformes ; CA-5 conforme ; CA-6/7/8 n-a au PLAN ; **CA-9 correction bloquante** (audit §5 : sens de comparaison à déclarer, borné par `retries_by_method` — C-B-4 ; `verifyLedgerChain` exécuté à chaque reprise — C-B-5) ; **CA-11 + durci correction bloquante** (C-V-9 non probant ; tuyau attestation → gate non exécuté depuis un `runMain` — C-B2-2) ; anti-close conforme.

## Corrections — liste fermée

### Bloquantes -b3d-b1 (à plier avant tout code)
- **C-B-1 — drapeaux collants.** `blockTimeNull`, `bodyQuorumFail`, `notFullPages`, `nonMonotonic` (`rebase-crosscheck.ts:204`) locaux au process, ni persistés ni réensemencés. **Au choix du G0** : (i) une page qui lève un drapeau n'est PAS committée et sera re-tirée, OU (ii) le drapeau voyage dans l'enregistrement de page (`page_faults`) et est réensemencé. Test `resume_after_decode_fault_is_not_equal` via DEUX `runMain` ; mutant « page committée malgré le drapeau ⇒ rouge » ; **INVENTAIRE ÉCRIT de chaque `let` de `scanFullMint`** classé « réensemencé / fail-closed / N/A » avec preuve (le G0 en a traité **3 sur 7**) ; le test de reprise terminale prouve aussi qu'un `inconclusive` collant **ne se PROMEUT jamais** par relance.
- **C-B-2 — écriture d'artefact MONOTONE.** Ne jamais remplacer un `scan_complete:true` par `false` (refus journalisé ou sidecar `-attempt`) ; test « relance sous budget mordant ⇒ artefact byte-identique » ; mutant **M-b1-14**.
- **C-B-3 — compteur par méthode.** `counted` (`:452`) incrémente AVANT le `guard` (`collect.ts:299-308`) ⇒ compter **après passage du guard ou dans la couche budgétée** ; l'invariant **`Σ == calls_used`** couvre le chemin `budget_exhausted`.
- **C-B-4 — budget durable sur le chemin d'erreur.** Un throw non budgétaire (`:249`) ou sur l'appel desc (`:255`, **hors `try`**) tue le process sans écrire `budget.json` (jusqu'à **6 appels de retry perdus** par crash) ⇒ écriture en **`finally`** ; persister `retries_by_method` ; l'audit §5 déclare son sens de comparaison (**dashboard ≤ recomputed**, écart borné par les retries).
- **C-B-5 — queue tronquée non persistante.** Après reprise la ligne tronquée se retrouve **au MILIEU** du fichier ⇒ au choix, à prouver : **(α)** tronquer le fichier à la dernière ligne complète avant tout append (une ligne illisible hors queue ⇒ throw), OU **(β)** lecteur sautant toute ligne illisible avec `verifyLedgerChain` exécuté **à CHAQUE reprise** ; mutant « ligne tronquée en milieu de fichier tolérée sans vérification de chaîne ⇒ rouge ».
- **C-B-6 — `candidate_shas`.** `candidates/` est un répertoire **plat partagé** entre mints (`:445`, `:468`) ; re-dériver par `readdirSync` **mélange les 4 mints** ⇒ **sous-dossier par mint**, ou sha portés par l'enregistrement de page.
- **C-B-7 — option (A) = changement de FORMAT PERSISTÉ** du ledger fixé par le PLI §6 ⇒ **amendement PLI DATÉ** ; `entry_sha256` sur le **seul core** du §6, jamais `page_events` ; le helper de densité alimente le `calls_by_method` **GLOBAL** (sinon Σ ≠ `calls_used` dès la sonde).
- **C-B-8 — texte de l'Amendement 3.** Sous-plafonds cumulatifs recalculés **conformes** (256 170 / 769 170 / 2 439 170 / 5 396 170 ; marge 1 101 330 sous 6 497 500) ; amendement **LÉGITIME** (H6 = mécanisme d'arrêt de coût, daté, avant toute donnée). Le texte doit : **(a)** corriger la contradiction du roulant (« un sur-consommé le mange » contredit « dépassement ⇒ STOP » : une sur-consommation est **TOUJOURS STOP + ESCALADE**, le roulant n'est que **descendant**) ; **(b)** rétablir la granularité de H6 **sans code chaud** : l'orchestrateur exécute la projection à f = 0,05 du span **HORS PROCESS** (lit `slot_hi` dans le ledger, calcule `pages / fraction`, retient le `max` avec le modèle de densité) — support : une **FONCTION PURE testée, logeable en b1b** ; à défaut déclarer l'écart (**SPYx peut brûler 2,96 M avant un STOP**) ; **(c)** pré-enregistrer **ENTIÈREMENT** l'estimateur de densité AVANT la sonde (formule d'intégration, définition de l'intervalle, seuils ; « borne haute = densité max × span » dépasserait tous les sous-plafonds — à rejeter) ; **(d)** déclarer que les sous-plafonds sont des **estimations ponctuelles** (marge TSLAx ≈ 100 appels ⇒ faux STOP plausible) ; **(e)** couvrir la chaîne « sous-plafond mordu → relance élargie » (= chaîne de V-1/V-2 ⇒ l'Amendement 3 n'est exécutable **qu'après C-B-1 et C-B-2**) ; **(f)** committé **SEUL** avant la sonde de densité.
- **C-B-9 — découpe b1a / b1b décidée D'EMBLÉE.** b1a = reprise, ledger, budget, C-B-1..7 ; b1b = densité + projection H6 hors process ; **chacun G2 fraîche + checkpoint-2 + G7** ; **R-25 ré-estimé par sous-lot avec le facteur mesuré (×2)**.

### Bloquantes -b3d-b2 (conditionnelles, post-tirage)
- **C-B2-1** — `rebase-produce.test.ts:123-125` affirme `set_authority_unscanned ≥ 1` **à travers la composition complète** ⇒ **rougira** quand le piggyback écrira l'attestation (à **nommer et traiter**).
- **C-B2-2** — le tuyau `crosscheck-<MINT>.json.set_authority_scan` → série → `loadTrajectories` → gate doit être **EXÉCUTÉ depuis un artefact écrit par `runMain`** (CA-11 durci), ou item formé.
- **C-B2-3** — la formule de gate utilise `oracle_slot`, **absent de la signature** de `rebaseGateFromTrajectory` (dire d'où il vient) ; l'attestation porte sa **`source`** (`fullmint` / `piggyback`) ; le piggyback seul **ne voit pas un hand-off antérieur signé par une autre autorité** ⇒ ne ferme pas le résiduel d'un mint nouveau.
- **C-B2-4** — point de rebase R1 / b2 nommé : **`buildSolanaSymbol`** (appel du gate `collect.ts:540` et `quoteDec: 6` en dur `:545`, à 5 lignes d'écart).

### Non bloquantes -b3d-b1
- Formule réelle du backoff (`400*(i+1)` sur 6 essais = **8,4 s** cumulés, pas « ~5 s »).
- Item `Retry-After` **maintenu formé**.
- Préciser que le semis donne `ascLastSig = last.last_sig` (équivalence vérifiée `:142` et `:222-223`).

## Réponses aux questions du G0 (tranchées par le validateur)
- **Q1** — trois fuites réelles, semis correct, **idempotence insuffisante** (C-B-1, 2, 6).
- **Q2** — retry confirmé (`withRetry` injecté, `tries = 6`, non rejouables re-lancées, `Retry-After` formé ; ne peut ni dépasser `--max-credits` ni doubler un ledger) **sous C-B-3/4**.
- **Q3** — option (A) confirmée **sous C-B-5/7** (interaction avec C-G2D-2 sûre).
- **Q4** — Amendement 3 **légitime** (texte = C-B-8).
- **Q5** — mode `--rebase-density` confirmé, **≤ 48 appels / 480 cr**.
- **Q6** — ordre recommandé : b1a → b1b → Amendement 3 committé seul → **R1 → G0 -b1-bis-ii hors ligne EN PARALLÈLE de la course** → course depuis un worktree épinglé au sha de fusion de b1, AUCUN autre consommateur Helius pendant la sonde et le tirage → b2 rebasé sur R1 après checkpoint-1 delta → T-1b derrière b2.
- **Q7** — L-5 sans re-pin **PROUVÉ** (`tslaxInput()` `collect.test.ts:43-54` sans `rebase` ; anti-cycle confirmé).
- **Q8 [INV]** — conditions de reprise de la course : **(a)** audit attribuant les crédits (FAIT : incident HELIUS-1, `docs/CHANTIERS.md` fin de fichier — 60 938 au dashboard vs ~11 263 reconstruits, ~49 675 non attribués ; critère de GO pré-enregistré : export par méthode ou par jour) ; **(b)** deux lectures du dashboard espacées sans aucun process MONARK ; **(c)** PLI §4 rebasé sur le chiffre du dashboard (consommé 60 938 ; cumul pire cas ≈ 7 610 938 / 10 M) avec une ligne « non attribué » ; **(d)** première invocation de la sonde = **ÉTALONNAGE du coût par appel** (N appels connus, dashboard avant/après lu par l'investisseur, égalité à Σ méthode × tarif) ; **(e)** date **2026-10-15** sous réserve.
- **Q9 [INV]** — routage C-4 confirmé.

Relève de l'INVESTISSEUR (déclencheurs C-4 + escalade EN ATTENTE) : ordre R1 / -b3d-b2 (décision 85) ; dépassement 6,5 M ; cumul > 10 M ; autoscaling ; tirage à cheval sur le 19 oct ; acceptation d'un partiel ; toute divergence.

## SIGNALEMENT — erratum du G7 -b3d-a (FALSIFIÉ)
L'énoncé « fail-closed, jamais de faux `equal` » du **G7 -b3d-a** est **FALSIFIÉ (V-1)**. Erratum déjà consigné par l'orchestrateur : **`docs/CHANTIERS.md:382-384`, commit `7aae8d7`** — code FUSIONNÉ (`83da61d`) mais **AUCUN appel réseau, rien servi, `pending` intact, tirage bloqué ⇒ aucun effet produit**. `error_origin` : worker G1 (C-7 b) + les trois relecteurs G2 + validateur checkpoint-2 (« jamais de faux equal » écrit sans croiser reprise × drapeaux) + orchestrateur G7.

## AM-1 — ce que la checklist a attrapé
V-1, V-2, V-3 ; queue tronquée ; `candidates/` partagé ; format §6 modifié sans amendement ; contradiction du roulant ; tuyau attestation → gate non exécuté ; `rebase-produce.test.ts:123-125` non nommé ; argument `collect.ts` non discriminant (attestation référençant un `oracle_slot` hors signature).

**Manqué du validateur au checkpoint-2 -b3d-a** (auto-relevé) : « jamais de faux `equal` » écrit **sans croiser reprise × drapeaux** — corrigé par cet erratum.
