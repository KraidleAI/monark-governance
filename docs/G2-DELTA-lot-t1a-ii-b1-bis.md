claude-opus-4-8[1m]

# G2-DELTA — Revue à contexte frais du PLI G2 (fold C-G2-1..8) du lot Bell T-1a-ii-b1-bis-i

Modèle résolu (R-1) : **`claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, effort max). Worker RELECTEUR G2-DELTA,
contexte frais, **instance SÉPARÉE** de l'implémenteur, de l'auteur du pli et du premier relecteur G2. Correction **C-V-1** du
checkpoint-2 (`e97ff7c`) : « le pli `cfa7e8f..73077bb` n'a aucun relecteur séparé … le faire relire par une instance séparée ».
**R-20 : aucun commit, aucun fichier du worktree modifié.** Rejeux/recomputes/mutants sur COPIE `F:\tmp\g2d-bellb1bis\`
(`git -C F:\Monark-wt-bellb1bis archive 73077bb | tar -x` + `npm ci --cache F:/tmp/npm-cache`, TMP/TEMP=F:\tmp). Bruts hors dépôt
`F:\PRODUITS\etude-2026-09-20\bell-b1bis-raws\**` lus en partagé. **Aucun appel réseau** (`confirmVault` re-lu → pris comme record
`confirm-reread-2026-09-20.json`, non re-tiré). Aucune clé/URL, aucun close en clair.

**Provenance du pli (C-V-1, « consigner qui a écrit le pli »).** Fold `73077bb` « G2 fold C-G2-1..8 (worker `claude-opus-4-8`) »,
committé par l'orchestrateur `claude-fable-5-1`. Chaîne : `cfa7e8f` (1er G2, relecteur Opus 4.8, instance A) → `73077bb` (pli des
findings, worker implémenteur Opus 4.8, instance B) → `e97ff7c` (checkpoint-2, validateur `claude-fable-5-1`). Je suis l'**instance C**
(≠ A, ≠ B). Objet : `git diff cfa7e8f 73077bb` (455 lignes de diff ; 194 insertions / 35 suppressions ; 73 lignes dans `discover.ts`).

Verdict : **ACCEPTE-AVEC-CORRECTIONS** — **0 bloquant, 0 majeur, 3 mineurs, 5 observations**. Les 8 findings d'origine (C-G2-1..8)
sont **implémentés et prouvés de première main** ; les mineurs sont (1) une **ligne de sha fausse dans la table C-G2-4 elle-même**
(PROVENANCE), et (2/3) deux **trous de couverture** sur des branches fail-closed/défensives **neuves** du fold (2 mutants de mon cru
survivent). Aucun n'a d'impact code/donnée. Détail, essais et classe seam/docs ci-dessous.

---

## Synthèse des vérifications de première main (rien « cru sur parole »)

- **Réducteur `leanFromDiscovery` recomputé PAR MOI (pas le script de l'implémenteur), byte-for-byte 4/4.**
  `apps/bell/_g2d_recompute.mts` (importe `leanFromDiscovery` de la COPIE ; lit les 4 bruts complets + `confirm-reread`). (A)
  `leanFromDiscovery(brut_gelé)+"\n"` == fichier committé **moins** les 2 champs C-G2-1, 4/4 ; (B) `leanFromDiscovery(brut + champs
  first-hand)+"\n"` == fichier committé **EXACT**, 4/4. Les 4 `sha256(LF)` == PROVENANCE (« Committed data-file pins ») == table PLI
  (`04734e85…`/`d55fead2…`/`b36a716f…`/`b340d898…`). Bruts gelés **sans** `executable`/`authority_kind` (mesuré `false/false`) ; ces 2
  champs viennent first-hand du `confirm-reread` (`owner_of_owner_matches_committed:true` 4/4, `executable:true`,
  `authority_kind:"program"`, `faults:0`, 16 `getAccountInfo` 8 helius/8 chainstack). Réducteur **déterministe** (aucun tri/arrondi/`Date`,
  passe-plat `founding_pool` + `vault_share_of_sample`).
- **Suite complète verte sur la COPIE** : `npm run test` **477/477** ; Bell **94/94** ; racine `test/*.test.ts` **91/91** (`ci-gates` +
  `no_secret_in_repo`/`bell_no_secret_in_repo` + `series_pinned_are_declared_and_hashed`) ; `typecheck` 0 ; `eslint` (4 fichiers changés)
  0 ; `gate:vocab` 0 (176 fichiers) ; `lang:gate --scope bell` 0 ; `lint:ratchet` 69/69 ; `export:check` 0.
- **R-25 sous la pathspec `STAT=` exacte de `ci.yml:65`** : `git diff --shortstat 5c29871 73077bb -- <STAT=>` = **10 fichiers, 1 174 +
  27 = 1 201 ≤ 1 205 (marge 4)** ; two-dot == three-dot. **PROVENANCE-founding-discovery.md EST compté** (`.md` sous
  `apps/bell/test/fixtures/`, hors carve-out `docs/**/*.md` — confirmé `--name-only` et C-V-4 « 1 ligne PROVENANCE = 1 202/1 205 »).
  `PINNED_BELL_SHA 0cfbed20…` **inchangé prouvé** : `collect.ts` **absent du fold** (seul `collect.test.ts` change) ; les 4 occurrences
  du delta sont des mentions doc « inchangé », aucune ligne ±ne touche la valeur ; `bell_pinned_sha_reduces_to_b3a_by_subtraction`
  vert. *Base* : `merge-base(main,73077bb)=0c47b31` ≠ `5c29871` ; 1 201 est mesuré contre `5c29871` (fold checkpoint-1 = base PR du lot,
  cohérent avec PLI/1er G2/checkpoint-2). Contre `main`, ~18 552 = divergence cumulée de branche, hors sujet.
- **Table « shas au gel final » (C-G2-4) re-vérifiée 6/6 contre les bytes committés `73077bb`** : `discover.ts c033ea4d`,
  `collect.ts 0ffa5cb1`, `pools.ts 29a920d1`, `collect.test.ts ff78466e`, `discover.test.ts f4a11ceb` = **OK** ; **PROVENANCE**
  table=`bc3e4b90…` **≠ committé `cf48f528…`** = **DRIFT → C-G2D-1**.
- **C-G2-6 — rapport auto-descriptif SANS fuite (empirique).** `apps/bell/_g2d_report_leak.mts` : `runDiscoverCli` appelé avec des
  providers **portant des secrets dans l'URL** (`…/?api-key=FAKEKEY_SECRET_123`, `…/FAKEHEXPATH_SECRET_456`). Le `discover-report.json`
  produit ne contient **AUCUN** des 6 needles (`FAKEKEY…`/`FAKEHEXPATH…`/`api-key`/`https://`/`helius-rpc.com`/`chainstack.com/`) :
  seuls `operators:["helius","chainstack"]` (noms via `operatorOf`→`providerOf`, labels DNS jamais la clé), fenêtres en secondes,
  seuil, compteurs. `credits_recomputed=30` pour 3 gTfA (3×10) — formule correcte.
- **C-G2-3 — rang PoC TSLAx recompté first-hand** (tri desc de `vault_share_of_sample` du brut) : `CY9Xzc1z…` = **rang 7** (part
  0,0753) parmi 8 vaults — le « 7ᵉ » du fold est **correct** (le « 6ᵉ » d'origine était faux).
- **R-13** : grep `TODO|FIXME|XXX|HACK` sur les lignes `+` du delta = **0**. **R-3/duplication** : voir C-G2D-8.
- **Isolation** : delta = `apps/bell/**` + `docs/PLI` + `docs/adr`. Aucun `fleet.ts`/README/site/skills ; Bell reste `upcoming`. Hygiène :
  0 clé/URL/bearer dans le delta ET les bruts.
- **Mutants** : **6 rejoués** (3 annoncés + 3 de mon cru). **3 annoncés TUÉS** ; **1 mien tué** (clause porteuse) ; **2 miens
  SURVIVENT** → C-G2D-2/C-G2D-3. Restauration sha-exacte vérifiée (`discover.ts c033ea4d`, `collect.ts 0ffa5cb1`). Table plus bas.

---

## FINDINGS

### C-G2D-1 — MINEUR — la table « shas au gel final » (correction C-G2-4) porte une sha FAUSSE pour PROVENANCE
**Preuve (first-hand).** PLI §PLI-G2, table C-G2-4 : `…/PROVENANCE-founding-discovery.md | bc3e4b90f16e9cd4… (supersède 12d13d80…)`.
Or `git show 73077bb:…/PROVENANCE-founding-discovery.md | sha256sum` = **`cf48f52810c4eb48…`**. `bc3e4b90…` ne correspond à AUCUN état
de la chaîne : `e6ddbca`(offline)=`12d13d80`, `cfa7e8f`=`90a0893e`, `73077bb`(fold)=`cf48f528`. C'est une sha **fantôme**. Les 5 autres
lignes de la table matchent les bytes committés (re-vérifié). **Ironie** : C-G2-4 a été levé PRÉCISÉMENT parce que la table §5 avait des
shas périmés (`pools.ts`/PROVENANCE) ; la table de remplacement **réintroduit** le défaut sur PROVENANCE (probablement une sha calculée
avant un dernier edit de PROVENANCE — un fichier `.md` distinct du PLI, donc pas d'auto-référence, mais non re-pinné au commit).
**Impact.** Le CONTENU de PROVENANCE est correct (sa propre table « Committed data-file pins » des 4 JSON matche mon recompute) ;
seule la **méta-table du PLI** est fausse sur la ligne PROVENANCE. Un vérificateur R-21 comparant le fold à sa propre table trouve un
écart. Aucun impact code/donnée.
**Correction — DOCS seule (0 ligne R-25).** Remplacer `bc3e4b90…` par `cf48f528…` dans la table PLI (docs/PLI = `docs/**/*.md` exclu).
**error_origin : worker** (table PLI-G2) + **orchestrateur** (le spot-check R-21 « sha discover.ts == rapport » n'a pas couvert
PROVENANCE au commit). Non bloquant, mais **c'est un défaut sur la correction même que j'approuve** — à corriger avant clôture.

### C-G2D-2 — MINEUR (couverture) — 2ᵉ branche `unread` de `confirmVault` non exercée (MUTANT SURVIVANT M-B1)
**Preuve.** `confirmVault` (`discover.ts:163-172`) a DEUX chemins `authorityKind:"unread"` : (1) `auth===null || auth.owner===null`
(l.165) — autorité illisible ; (2) `prog===null` (l.169) — autorité lue **non-System**, mais le **compte programme** échoue au quorum.
Le cas (D) `bell_discover_confirm_vault_executable_and_system_owned` (assert `discover.test.ts:204`) couvre le chemin (1) seul.
**Mutant M-B1** (l.169 `"unread"`→`"program"`) : `node --test apps/bell/test/discover.test.ts` = **pass 8, fail 0 → SURVIVANT**.
**Impact.** Branche fail-closed **correcte** mais non testée ; les 4 pools sont `(program,true)` ⇒ **aucune dette de donnée**. Une
régression future y passerait la CI.
**Correction — CODE (⇒ seam `-b1-bis-i-b`) OU item formé.** Un cas dans (D) avec un `call` distinguant l'adresse autorité (owner
non-System) de l'adresse programme (quorum raté) ⇒ `authority_kind:"unread"`. `discover.test.ts` est **compté R-25** ⇒ ~5 lignes >
marge 4 ⇒ **seam**. Alternative zéro-dette : item `PR-B-CONFIRMVAULT-UNREAD` (déclencheur `-b1-bis-ii` ; orchestrateur → worker).
**error_origin : worker.** Non bloquant.

### C-G2D-3 — MINEUR (couverture) — fallback `signature` top-level de `sigOfBody` non exercé (MUTANT SURVIVANT M-B3)
**Preuve.** `sigOfBody` (`discover.ts:60-64`) : `signatures[0]`, **sinon** `body.signature` top-level (l.63), sinon `""`. Le test de
dédup (`discover.test.ts:220-227`) n'utilise QUE `transaction.signatures:[sig]`. **Mutant M-B3** (retirer `: typeof top === "string" ?
top` du return) : **pass 8, fail 0 → SURVIVANT**.
**Impact.** Branche **défensive** (les corps gTfA `full` réels portent `transaction.signatures[0]` — forme = item `PR-B-GTFA-SHAPE`).
Non testée ; **aucune dette de donnée**.
**Correction — CODE (⇒ seam) OU item formé** (~3 lignes `discover.test.ts`, comptées ; ou repli sous l'item de C-G2D-2).
**error_origin : worker.** Non bloquant.

### C-G2D-4 — OBSERVATION (mineur) — dédup SILENCIEUSE : `sampledTx` peut revenir au compte brut sans aucun signal publié
**Preuve.** Si les corps gTfA `full` réels ne portent ni `transaction.signatures[0]` ni `signature` top-level (forme = item ouvert
`PR-B-GTFA-SHAPE`), `sigOfBody` rend `""` pour CHAQUE corps ⇒ la clause `""`=DISTINCT fait de la dédup un **no-op** ⇒ `sampledTx`
**revient silencieusement au compte brut** (la déviation C-G2-8 s'auto-annule sans erreur). Or ni `DiscoveryFile` (`discover.ts:174-182`)
ni `discover-report.json` ne publient `dedup_removed` ni `bodies_without_signature` (grep négatif confirmé — seul le commentaire l.59).
On ne peut donc pas SAVOIR, sur un run réel, si la dédup a fait quelque chose. Observabilité manquante **directement sur la déviation
déclarée**.
**Correction — CODE (⇒ seam) OU sous-item de `PR-B-DISCOVER-DEDUP`.** Publier `dedup_removed`/`bodies_without_signature` au rapport
(1–2 lignes `discover.ts`, compté ⇒ seam) ; ou sous-item « publier les compteurs de dédup au prochain run ». **error_origin : worker.**
Non bloquant (déviation déjà gatée avant consommation `-ii`).

### C-G2D-5 — OBSERVATION (corrobore C-V-4) — double sémantique de `sampled_tx` sous-déclarée dans le fold
**Preuve.** Le fold déclare la déviation C-G2-8 mais (a) ne nomme pas la **DOUBLE SÉMANTIQUE** (CODE : `sampledTx` = tx DISTINCTES après
dédup ; fichiers committés : `sampled_tx:15000` = compte BRUT du run pré-enregistré SANS dédup, = 3×5×1000 vérifié) ; (b) l'adjudication
« vaults proches du seuil … sans effet sur le `founding_pool` retenu » est vraie pour le vault top (0,32–0,52) mais **passe sous silence**
que l'**ENSEMBLE RETENU** près de 0,05 (`9mAp…`0,0546, `BxgKh8…`0,0532, `GZFBZa…`0,0597, `EoJb3b…`0,0612) peut changer. **C-V-4 forme
déjà** cette correction ; je confirme de façon indépendante. **C-4 reste sincère** (compare registre ⇔ fichier statique, aucun re-tally) ;
`15000` = historique gelé non reproductible par le code courant, re-mesuré par `PR-B-DISCOVER-DEDUP` avant tout usage `-ii`. Forme d'un
re-tirage **compatible** (mêmes clés de haut niveau ; seules valeurs varient). **Docs seule** (PLI/ADR = 0 R-25). error_origin : worker.

### C-G2D-6 — OBSERVATION — `authority_kind` « enum fermé » : fermé au TYPAGE + à la CONSTRUCTION `confirmVault` + `deepEqual` C-4, PAS par un rejet de schéma au chargement
**Preuve.** `AuthorityKind` contraint le retour de `confirmVault`, `FoundingPoolRef` et `FOUNDING_POOLS` (le `typecheck` rejette un
littéral hors-enum en `pools.ts`). **Production** : fermé par construction (les 4 `return` de `confirmVault` n'émettent que des membres —
M-A1 le prouve). **Chargement JSON** : **aucun** `ajv`/`zod`/schéma (grep négatif) ; le garde est le `deepEqual` C-4 **contre le registre
typé**. Une valeur hand-éditée dans un JSON n'est pas rejetée en propre ; elle rougit C-4 seulement si elle diffère du registre.
**Cohérent avec le design** (aucun champ d'artefact n'a de validation de charge). État déclaré ; **aucune action requise**.

### C-G2D-7 — OBSERVATION (résidu de C-G2-2) — `lean == brut` réel prouvé first-hand mais TOUJOURS hors CI (test de FORME sur brut SYNTHÉTIQUE)
**Preuve.** `bell_discovery_lean_reducer_shape` (`discover.test.ts:207-218`) exerce `leanFromDiscovery` sur un brut **SYNTHÉTIQUE** inline
(forme/ordre/`_count`/`measure_note`) — **aucun** test CI ne rejoue le réducteur sur les 4 bruts pinnés réels ; la preuve byte-for-byte
réelle vit dans l'out-of-tree `verify-reducer.mts` (hors CI). **Je l'ai recomputée 4/4** ⇒ aucune dette de donnée, mais le trou de
couverture CI persiste. Un test CI serait CODE (`discover.test.ts` compté ⇒ seam) ; **item formé** déjà amorcé (C-G2-2). error_origin :
orchestrateur.

### C-G2D-8 — OBSERVATION — duplication R-3 : le wrapper `counted` de `runDiscoverCli` recopie celui de `produceTrajectories`
**Preuve.** `runDiscoverCli` (`discover.ts:236-238`) et `produceTrajectories` (`rebase-produce.ts:97-98`) portent le même motif
`callsByMethod`/`const counted: JsonRpcCall = (u,m,p)=>{callsByMethod[m]=…; return call(u,m,p);}` (discover ajoute `callsByOperator`).
Le commentaire du fold l'**assume** (« Same pattern as produceTrajectories »). Duplication **connue et petite** (2–3 lignes). La
factoriser en helper partagé serait CODE inter-fichiers (⇒ seam). **Déclaré ici** (la checklist veut la duplication au registre, pas
qu'elle soit tue parce que le générateur en était conscient). error_origin : worker. Non bloquant — item optionnel.

**Corroboration C-V-5 (pas un nouveau finding).** Mon delta montre bien la l.25 pré-enregistrée du PLI en paire `-`/`+` : la ligne
originale « R-25 = 854 ≤ 1 205 » est **supprimée** puis **remplacée** par la version annotée `~~854~~ [erratum…]`. La prose du fold
« retrait par annotation, **non par réécriture des bytes** pré-enregistrés » **contredit** le diff (les bytes originaux SONT réécrits).
C-V-5 forme déjà la reformulation (« l'original reste lisible à `bdfff31` », error_origin orchestrateur) ; je confirme.

---

## Points adversariaux du mandat — statut

1. **Dédup par signature (`tallyFoundingVault`)** : clé = `signatures[0]` (fallback top-level), sinon `""`. **`""`=DISTINCT clause
   PORTEUSE** : M-B2 (la retirer) TUE `bell_discover_founding_vault_from_tally` (10 corps synthétiques sans signature ⇒ `sampledTx`
   s'effondrerait à 1). Dédup **avant** le tally, ensemble concaténé des 3 points ⇒ **inter-points ET intra-point** (correct : même sig =
   mêmes balances). Tx multi-vaults : un corps = une signature ⇒ le tally compte chaque compte distinct 1× (`seen` par corps) — non
   affecté. `sampledTx = bodies.length` **après** dédup ; numérateur/dénominateur rétrécissent ensemble. **C-4 sincère** (§C-G2D-5).
   **Risque silencieux** → C-G2D-4. **Mon mutant** : M-A3 (dédup retirée) ⇒ RED.
2. **C-G2-1 enum & portage** : porté `confirmVault`→`discoverFounding` (l.198)→`FoundingPoolRef`→`DiscoveryFile`→JSON→lean (passe-plat)
   →`FOUNDING_POOLS`→C-4 `deepEqual` (vérifié : lecture + recompute + M-A1). `unread` : vault **RETENU** + signalé, jamais rejeté ⇒
   cohérent erratum C-5. Fermeture d'enum → C-G2D-6. 2ᵉ branche `unread` non testée → C-G2D-2.
3. **Réducteur** : déterministe/idempotent ; byte-for-byte **4/4 de ma main** ; test de forme sur brut **synthétique** (C-G2D-7).
4. **C-G2-5 (mulBits)** : M-A2 (retirer l'égalité `mulBits`, = MINE1 survivant du 1er G2) ⇒ cas `mulDiverge` ⇒ **RED** — trou fermé.
   **C-G2-6 (rapport)** : auto-descriptif, **0 fuite** empirique, `credits_recomputed` correct (gTfA×10 + rpc×1) par `runMain`.
5. **Régressions** : tout vert ; R-25 1201/1205 (marge 4) ; `PINNED_BELL_SHA` inchangé ; table shas 5/6 OK, 1 drift (C-G2D-1).
6. **Mutants** : table ci-dessous.
7. **Anti-close (delta)** : décimaux AJOUTÉS = `0.05` (seuil), `0.0753`/`0.0532`/`0.0546`/`0.0597`/`0.0612` (parts de pool), `0.4` (part
   synthétique), `1.0039` (multiplicateur de rebase ScaledUiAmount ~1,00x), `3.3` (prose « 3,3k ») ; entiers `1000`/`1100`/`5000`
   (montants synthétiques), `15000` (`sampled_tx`), `2026` (année), `9033670` (réf commit ADR). **Aucun n'est un close.** Scan numérique
   anti-close fait par le checkpoint-2 sur le **surensemble** `5c29871→73077bb` (3 759 jetons, **0 coïncidence**, 3 formes ratifiées) ;
   mon delta ⊂ surensemble. **0 close en clair.**

---

## Table des mutants (COPIE ; restauration sha-exacte vérifiée `discover.ts c033ea4d` / `collect.ts 0ffa5cb1`)
| # | Mutant | Fichier | Test rejoué | Attendu | Résultat |
|---|---|---|---|---|---|
| M-A1 (annoncé) | `authority_kind` hardcodé `"program"` (branche System) | discover.ts | discover.test.ts | rouge | **RED** (fail=1, cas B) |
| M-A2 (annoncé) | retirer l'égalité `mulBits` (MINE1 du 1er G2) | collect.ts | collect.test.ts | rouge | **RED** (fail=1, `mulDiverge`) |
| M-A3 (annoncé) | dédup retirée (garde toujours) | discover.ts | discover.test.ts | rouge | **RED** (fail=1, `sampledTx`=2) |
| M-B2 (mien) | retirer la clause `""`=DISTINCT | discover.ts | discover.test.ts | rouge | **RED** (fail=1, `founding_vault_from_tally`) → clause porteuse |
| **M-B1 (mien)** | **2ᵉ branche `unread` (`prog===null`)→`"program"`** | **discover.ts** | **discover.test.ts** | **rouge** | **SURVIVANT (fail=0)** → **C-G2D-2** |
| **M-B3 (mien)** | **casser le fallback `signature` top-level** | **discover.ts** | **discover.test.ts** | **rouge** | **SURVIVANT (fail=0)** → **C-G2D-3** |
Bilan : **4/6 tués** ; 2 survivants = trous de couverture sur des branches fail-closed/défensives **neuves** du fold, mineurs.

## R-25 (pathspec `STAT=` de `ci.yml:65`) et classe seam/docs par finding
`git diff --shortstat 5c29871 73077bb -- <STAT=>` = **10 fichiers, 1 174 + 27 = 1 201 ≤ 1 205 (marge 4)** ; two-dot == three-dot.
`PROVENANCE-…md` **compté** ; `docs/PLI`+`docs/adr` **exclus**.
- **C-G2D-1** ⇒ **docs seule** (PLI, 0 R-25) — corriger `bc3e4b90…`→`cf48f528…`.
- **C-G2D-2, C-G2D-3, C-G2D-4** ⇒ **CODE** (tests / champ rapport dans `discover.test.ts`/`discover.ts`, **comptés** ; total > marge 4)
  ⇒ **seam `-b1-bis-i-b`** OU **items formés** (déclencheur `-b1-bis-ii`). Décision orchestrateur.
- **C-G2D-5** ⇒ docs seule (déjà C-V-4). **C-G2D-7** ⇒ item (déjà C-G2-2) ; test CI = CODE ⇒ seam. **C-G2D-6** ⇒ aucune action.
  **C-G2D-8** ⇒ item optionnel (factoriser = CODE ⇒ seam).

## Modes MAST observés
- **FM-3.1 (vérification incomplète)** : C-G2D-2/C-G2D-3 (mutants survivants), C-G2D-4 (dédup silencieuse), C-G2D-7 (byte-for-byte réel
  hors CI).
- **FM-1.3 (traçabilité/déclaration sous-formée)** : C-G2D-1 (sha fausse dans la table de traçabilité), C-G2D-5 (double sémantique),
  corroboration C-V-5.
- **Mitigation dominante confirmée** : l'oracle d'exécution non-LLM est réel — réducteur EXÉCUTÉ sur les bruts (recompute first-hand),
  rapport/mesure via `runMain`, fermeture d'enum prouvée par mutant. Indépendance de vérification tenue (contexte frais, recompute de ma
  main, mutants de mon cru, 0 réseau).

## Verdict G2-DELTA : **ACCEPTE-AVEC-CORRECTIONS**
Le pli `cfa7e8f..73077bb` corrige **correctement et de façon prouvée** les 8 findings (C-G2-1 enregistré bout-en-bout ; C-G2-2 réducteur
byte-for-byte 4/4 ; C-G2-3 rang **7ᵉ** confirmé first-hand ; C-G2-5 `mulBits` — MINE1 tué ; C-G2-6 rapport sans fuite ; C-G2-7 orphelin
annoté ; C-G2-8 dédup déviation déclarée). Tout vert (477/477, R-25 1201/1205, `PINNED_BELL_SHA` inchangé, hygiène propre, Bell
`upcoming`). **Zéro bloquant, zéro majeur.** Corrections dues avant clôture zéro-dette : **C-G2D-1 (mineur, docs — la table C-G2-4 se
corrige elle-même)** ; **C-G2D-2/C-G2D-3/C-G2D-4 (mineurs/obs, CODE)** ⇒ seam `-b1-bis-i-b` ou items formés à déclencheur `-b1-bis-ii`,
**au choix de l'orchestrateur, jamais un dû nu** ; **C-G2D-5** docs (déjà C-V-4) ; **C-G2D-7** item (déjà C-G2-2) ; **C-G2D-6/C-G2D-8**
état déclaré / item optionnel. **Marge R-25 = 4** : toute fermeture par code tire le seam — signalé.
