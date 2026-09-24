# G2 — Lot T-1a-ii-a (MONARK Bell : collecteur faits iii-iv + jambe Ethereum)

- **Relecteur** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, R-1), instance séparée, contexte frais. NON générateur. Aucun commit / aucun `git` d'écriture (R-20). Vérification par rejeu ; toute écriture sous `F:\tmp\g2-t1aiia\`.
- **Delta relu** : worktree `F:\Monark-wt-bell2a` (HEAD/base `88c3324`, non committé). Copie de l'arbre (hors node_modules/.git, 9.7M) → `F:\tmp\g2-t1aiia\tree\`, `npm ci` frais (cache `F:/tmp/npm-cache`, TMP=F:/tmp), rejeu là.
- **Verdict : APPROUVÉ-AVEC-CORRECTIONS** (C-1a, CA-11a, C-10a mineure). Aucun défaut d'intégrité de données ; oracle 336/336, R-25 tenue, faits i-iv + jambe ETH corrects et prouvés par mutants ; branchement CA-11 tenu (Bell `upcoming`, sorties hors arbre par défaut).

## §1 — Oracle rejoué (copie fraîche, TMP=F:/tmp)

| Gate | Résultat mesuré |
|---|---|
| `npm run ci` (gate:vocab+tsc+test) | **tests 336 / pass 336 / fail 0**, duration 30 333 ms ✓ |
| `npm run lint` | propre (0 sortie) ✓ |
| `npm run lint:ratchet` | **69/69** ✓ |
| `node scripts/lang-gate.mjs --scope root,contracts,schemas,site` | **0 hit** (site GATED) ✓ |
| `npm run export:check` | OK, 0 forbidden path ✓ |
| `npm run gate:vocab` | 162 fichiers, 0 forbidden ; **apps/bell/src couvert** (mesuré : `guarantee` planté dans volume.ts ⇒ FAILED « ADR-B0 D1 ») ✓ |
| `no_secret_in_repo` (racine) | vert ; mutant UUID-en-contexte ⇒ RED (voir mutants) ✓ |
| **R-25** (ci.yml:52 exact, working tree vs `88c3324`, index temporaire) | **13 fichiers, 1080 ins + 14 del = 1094 < 1205** — recompté indépendamment, = annonce worker ✓ ; jambe ETH incluse, seam -a2 non déclenché |

R-25 recomputée avec `GIT_INDEX_FILE` temporaire (read-tree 88c3324 + add -N) : l'index réel du worktree n'a PAS été touché (status sha `978ac98b…` identique avant/après). Pathspec incluant les 3 exclusions Bell `apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}`.

## §2 — Recompute indépendant de la série (contre-mesure MAST « rejeu circulaire », assignée au G2)

Calcul SANS import de gap.ts (BigInt + Math.log), 8 fills de `tslax-weekend-fills.jsonl`, close synthétique 364,5 (ancre du test, PAS le close Polygon) :

| Grandeur | Indépendant | Code `collect()` | Match |
|---|---|---|---|
| Σ\|base\| / Σ\|quote\| | 193751892 / 705693060 | (idem) | — |
| vwap (floor 10 déc.) | 364.2251194119 | 364.2251194119 | ✓ |
| g_t = ln(vwap/364,5) | −0.0007544151 | −0.0007544151 | ✓ |
| exceed 1/2/5 % | false/false/false | 0/0/0 | ✓ |
| anchor / regime | 2026-09-18 / weekend | (idem, assert test) | ✓ |
| bell_sha | — | `4375042c…fab6fa46` = **PINNED** | ✓ |

⇒ le digest épinglé correspond à un calcul mathématiquement correct ; le rejeu n'est PAS circulaire (C-5 satisfait, MAST « fixture auto-enregistrée » levé par recompute séparé).

## §3 — Table C-1..C-14 (chacune vérifiée dans le code)

| C-n | Statut | Preuve / localisation |
|---|---|---|
| **C-1** politique quorum | **CORRECTION (C-1a + C-1b)** | **Primitive** `quorum2` testée (concordance signatures `signaturesSetKey` quorum.ts:99 ; `bell_no_quorum_on_single_provider`). **(C-1a) LISTE non portée par le code** : `PUBLIC_SOLANA` (rpc.ts:18-19, **hors delta**) contient encore `solana-rpc.publicnode.com` ; `solanaEndpoints({})` la retourne (mesuré) ; `providerOf` ⇒ `['solana.com','publicnode.com']` = 2ᵉ distinct ⇒ run par défaut = quorum sans Helius. Retraite en commentaire seul (quorum.ts:3)+G1 §2 ; run réel conforme par *override opérateur* (journal `providers:["helius-rpc.com","solana.com"]`), pas par le code. **(C-1b) politique d'échantillonnage des corps NON testée + divergence avalée** : `liveSolanaFills` (collect.ts:217) n'est **pas exportée** ⇒ sampling/coverage/émission `quorum_sampled` = réseau-seul, aucun test unitaire (`bell_abstentions_counted` **injecte** `["quorum_sampled"]` collect.test.ts:143 ⇒ teste le COMPTAGE, pas la politique). Pire : un `QuorumDisagreementError` sur un corps échantillonné est **avalé** (collect.ts:257 exclut NoQuorum/Disagreement des `faults`, puis `continue` ; `sampled++` seulement au succès) ⇒ ni `no_quorum`, ni fault, ni compteur de divergence : le signal de désaccord Helius/mainnet-beta disparaît, absorbé en « trou de couverture » `quorum_sampled`, et les ~75 % corps single-provider **restent publiés** (= MAST « lecture Helius seule prise pour vraie » déguisée). **Non bloquant -a** (corps divergent jamais publié ; run réel `faults=[]`), mais le mot « politique testée » surclamerait. `error_origin=générateur`. |
| **C-2** import providerOf seul | ✓ | quorum.ts:13 importe seulement `providerOf` (+ `createHash` stdlib) ; aucun import de rpc2/quorum2 (grep). ethereum.ts:16 importe `makeUkemiPool.getLogsRange` tel quel (attendu par C-2 jambe ETH). |
| **C-3** PoR nommé / résidu | ✓ | supply.ts:68-74 `POR_SOURCES` (The Network Firm, `onchainFeed:null` ⇒ `por_unavailable` ; TSLAon Ondo 403 abstention) [lu]. |
| **C-4** Token-2022 RPC plain + multiplicateur | ✓ | supply.ts:41-52 `readMintToken2022` (supply/decimals/multiplier/paused/permanentDelegate) ; paused/delegate lus-consignés non rendus (collect.ts:145-146). |
| **C-5** série réduite non vacuous | ✓ | Voir §2 (recompute indépendant concordant + sha épinglé). |
| **C-6** ADV ratio seul | ✓ | volume.ts (`VolumeRatio` = `vol_ratio`+`multiplier_unit` seuls) ; ADV jamais stocké (collect.ts:131,137,139). Garde `adv\|share_volume\|volume_ref` (digest.ts:32). **Dérivabilité ADV** (vol_ratio+volumeBase) déclarée par le worker comme *point checkpoint-2* (digest.ts:14-16, honnête, parité ESC-1 c) — pas une décision de ce lot. |
| **C-7** tueur du ratio | ✓ | test `bell_ratio_killer_adv_and_unit` (ADV≠⇒ratio≠ ; mult≠1⇒`multiplier_unit` ; adv≤0⇒throw). |
| **C-8** seuils 1/2/5 % | ✓ | collect.ts:125 `exceeds(gap.gT, 1/2/5)`. |
| **C-9** carte fermée + comptée | ✓ | residuals.ts (union HALT+COLLECTOR, liaison type-level à `HaltResidue` L40-42) ; `bell_abstentions_counted` + `bell_residual_map_is_single_source`. **Bonus honnête** : residuals.ts:8-9 signale que `resume_date_gt_halt_date` (présent halts.ts:55) était omis de l'énumération C-9 ⇒ code prévaut. |
| **C-10** fuite de clé | ✓ | `statusOf` scrub (quorum.ts:45-52) ; provenance/journal `providerOf` seul ; motif UUID `api-key=` (no-secret-in-repo.test.ts) ; mutant « URL brute dans erreur » ⇒ RED (voir mutants) ; run réel : grep url/uuid/api-key = 0 (exit 1). |
| **C-11** bornes par pool | **différé -b** (traçabilité) | state.json porte `window` global (collect.ts:178) ; bornes par pool = course fondatrice = -b. *Déclencheur* : spike -b (profondeur Helius par pool). À nommer en G1 §8 (absent). |
| **C-12** items (g) census/MWCB/Ondo | **différé -b** (traçabilité) | Explicitement -b (ADR D1). *Déclencheur* : -b après G7 -a. À nommer en G1 §8. |
| **C-13** aucun artefact Helius | ✓ | PROVENANCE : capture `api.mainnet-beta.solana.com` (public), single-provider récent, méthode nommée ; re-sha LF : fills `7f81f670ffd2`, mint `230972b98ef4`, PROVENANCE `c5a1338caab2` = G1 §1. Sorties Helius seulement hors arbre. |
| **C-14** exclusion R-25 | ✓ | `SERIES_EXCLUDED_ROOTS += apps/bell/test/fixtures/series` (ci-gates.test.ts, 1 ligne) + 3 pathspecs dérivés ci.yml:52 ; PROVENANCE same-dir. |

## §4 — Findings additionnels (hors table C)

- **CA-11a (CORRECTION)** — garde `--out` trouée + non testée. `main()` collect.ts:306 `resolve(out).startsWith(repoRoot)` est **sensible à la casse du lecteur** : `path.resolve('f:/…')` conserve `f:` minuscule (mesuré win32) ; `--out f:/…/tree/out-hole --pools ZZZ` ⇒ garde ne tire PAS (exit 0) et **écrit state/timeline/journal DANS l'arbre** (mesuré). Cas majuscule OK. De plus la garde vit dans `main()` = **hors CI** : mutant 9 (garde retirée) ne rougit AUCUN test. Défaut par défaut inoffensif (`F:/tmp/bell-out`) et Bell non publié, mais CA-11 est une règle dure. `error_origin=générateur`. **Fix** : conteneur robuste (`path.relative`, casse normalisée) extrait en fonction pure `assertOutsideRepo(out,root)` + test unitaire.
- **C-10a (CORRECTION mineure)** — `bell_no_secret_in_repo` (bell.test.ts) étendu à quorum/collect/supply/volume/residuals (**5**) mais **ethereum.ts omis** (6 nouveaux src). Couvert par le walk racine `no_secret_in_repo` (arbre entier) ⇒ pas de trou de sécurité, mais incohérence + G1 §1 mal compté (« 5 nouveaux src » ⇒ 6). `error_origin=générateur`. **Fix** : ajouter `ethereum.ts` à la liste + corriger le libellé G1.
- **series_pinned faux-vert (observation 18 confirmée par mesure)** — dossier série Bell vidé ⇒ `series_pinned_are_declared_and_hashed` **GREEN** (faux-vert sur racine absente). Fichiers présents ⇒ le garde couvre bien Bell (pin PROVENANCE retiré ⇒ RED). Donc **lot -a protégé** ; faux-vert = risque futur, item worker valide (déclencheur : prochain lot touchant ci-gates.test.ts ; ajouter une ancre « racine Bell non vide »).

## §5 — Mutants (attendu RED sauf 9/10a ; restauration sha 12-hex = G1 §1)

| # | Mutant | Cible | Résultat | Restauration |
|---|---|---|---|---|
| 1 | statusOf renvoie message brut | bell_journal…no_key | RED ✓ | quorum.ts `a90633c57b3a` |
| 2 | compteur figé (`counts[r]=1`) | bell_abstentions_counted | RED ✓ | collect.ts `3f0126d8c339` |
| 3 | retrait `adv` de CLOSE_KEY | bell_ratio_killer | RED ✓ | digest.ts `839c982dc153` |
| 4 | UUID en contexte `api-key=` | no_secret_in_repo | RED ✓ | volume.ts `d521dd87cda3` |
| 5 | 1 octet série (baseDelta) | bell_collector_replays | RED ✓ | fills `7f81f670ffd2` |
| 5b | 1 octet série | series_pinned (racine) | RED ✓ | fills `7f81f670ffd2` |
| 6 | carte résidus partielle | bell_residual_map_is_single_source | RED ✓ | residuals.ts `f31d10a840db` |
| **7 (mien)** | no_quorum accepté comme quorum (quorum.ts:91) | bell_no_quorum_on_single_provider | RED ✓ | quorum.ts `a90633c57b3a` |
| **8 (mien)** | int256 sans extension de signe (ethereum.ts:31) | bell_eth_v3_swap_decode_and_vwap | RED ✓ | ethereum.ts `6795a3ca99da` |
| **9 (mien)** | garde `--out` neutralisée (collect.ts:306) | bell + ci-gates + no-secret | **tous GREEN** ⇒ trou de couverture CA-11 confirmé | collect.ts `3f0126d8c339` |
| **10a (mien)** | dossier série Bell vidé | series_pinned | **GREEN = FAUX-VERT** (obs. 18) | (dir restauré) |
| **10b (mien)** | pin PROVENANCE retiré, données présentes | series_pinned | RED ✓ (garde couvre Bell présent) | PROVENANCE `c5a1338caab2` |

## §6 — CA-11 branchement

- `apps/site/lib/fleet.ts` : **NON modifié** (hors delta), **0 occurrence Bell/Kane** ⇒ Bell reste `upcoming`. Publication = T-1b (déclaré ADR/CLAUDE.md Branchement).
- Sorties hors arbre : garde `--out` (défaut `F:/tmp/bell-out`) + run réel écrit dans `F:\tmp\bell-out` (mesuré). Réserve : trou de casse CA-11a ci-dessus.
- Tuyaux ADR ⇔ code : `collecteur → state.json + timeline.jsonl` (D1) ⇔ collect.ts:357-358 ; consommateur = T-1b (pas encore) ⇒ statut `upcoming` correct (pièce non branchée sur chemin servi = upcoming, règle Branchement respectée).

## §7 — Run réel §5 (scan seul, aucune clé lue, aucun crédit Helius dépensé)

- `F:/tmp/bell-out/{state.json,timeline.jsonl,journal.json}` existent ; `bell_sha = e30ed838…300b` (préfixe **e30ed838** = G1 §2).
- Scan fuite (sans pipe) : `grep -REn 'https?://|api[-_]?key|UUID'` = **exit 1 (aucune fuite)**.
- journal.json : `providers:["helius-rpc.com","solana.com"]` (domaines seuls), `quorum:2`, `faults:[]`, `residual_total:3`. timeline : n_fills=155, `quorum_coverage=0.25316…`, genesis chain. Conforme G1 §2, C-10 tenu sur la sortie réelle.
- fixtures : le mint fixture porte `https://xstocks-metadata.backed.fi/…` (URI métadonnée on-chain Token-2022, publique, pas un secret ; aucun scanner ne trippe). Note, pas un défaut.

## §8 — Items O-n formés (déclencheur, jamais un dû nu)

- **O-1 (C-1a)** : retirer `solana-rpc.publicnode.com` de `PUBLIC_SOLANA` (rpc.ts:18-19, 1 ligne, **aucun test ne l'épingle** — vérifié). **Option (a) recommandée** : le défaut devient `[mainnet-beta]` seul ⇒ toute lecture sans clé Helius = `no_quorum` (fail-closed **exactement** ce que C-1 exige « une lecture seule = no_quorum »), au lieu d'un quorum silencieux sans Helius — l'option (a) rend le défaut honnête, elle ne plie pas seulement la correction. Alt (b) : garder spike-only + test `bell_archival_list_excludes_publicnode` + assertion « Helius présent » en run archival + reformuler G1 §2. *Déclencheur* : pli avant G7 -a (le run fondateur -b en dépend).
- **O-2 (CA-11a)** : `assertOutsideRepo(out,root)` pure (casse-normalisée, `path.relative`) + test unitaire. *Déclencheur* : pli avant G7 -a.
- **O-3 (C-10a)** : ajouter `ethereum.ts` à la liste `bell_no_secret_in_repo` + corriger G1 §1 (6 src). *Déclencheur* : pli avant G7 -a.
- **O-4** : ancre « racine Bell non vide » dans `series_pinned` (faux-vert 10a). *Déclencheur* : prochain lot touchant ci-gates.test.ts (item worker confirmé).
- **O-5 (traçabilité)** : nommer en G1 §8 « différé -b, déclencheur nommé » : C-11 (bornes par pool), C-12 (census/MWCB/Ondo), **et C-4 hypothèse « multiplicateur constant jul-oct 2025 déclarée vérifiée/non-vérifiée »** (non faite en -a, pas de VWAP fondatrice ; requise avant -b). *Déclencheur* : révision G1 ou -b.
- **O-6 (C-1b)** : rendre la divergence corps-niveau **visible** — bump `no_quorum` du pool si ≥1 corps échantillonné diverge (ou champ journal `body_disagreements`) au lieu de l'avaler en `quorum_sampled` ; **extraire la boucle de sampling en fonction pure testable** (rejeu offline de coverage/quorum_sampled/divergence). *Déclencheur* : **avant le run fondateur -b** (c'est là que la divergence Helius/mainnet-beta mord).
- **O-7 (R-3 micro)** : collect.ts:320 réimplémente `providerOf` inline (importé L27) avec le même fallback `return u` qui échouerait une chaîne brute si `new URL` lève — utiliser l'import. *Déclencheur* : pli avant G7 -a.

## §10 — Checklist G2 (points AgileCoder / pièges catalogués)

- **Revue 3 étapes** menée : (1) contrôles de base — 0 implémentation vide, 0 import non résolu (tsc strict vert), 0 TODO/FIXME/`as any` (grep exit 1) ; (2) conformité backlog — chaque fichier livré ↔ tâche ADR D1, rien en trop ; (3) critères d'acceptation — voir tables C-n et mutants.
- **R-3 duplication** : `quorum.ts` est un **calque déclaré** de `quorum2` (rpc2.ts) — **exception ADR C-2(b)** explicite (la closure `quorum2` appartient au lot U-1a-hard, non exporté ; import de fichier interdit) ⇒ PAS un R-3 non traité. La jambe ETH, elle, **importe** `makeUkemiPool.getLogsRange` (pas de copie). Seul micro-doublon réel = O-7 (providerOf inline).
- **R-8 dépendances** : 0 changement `package.json`/`apps/bell/package.json`/`package-lock.json` ; Node built-ins seuls. Aucun paquet halluciné à vérifier.
- **C-7 non-régression** : `bell_volume_dedup_by_signature` **existe bien** (bell.test.ts:106, dédup par signature testée en T-1a-i) — l'affirmation C-7 « déjà committé » est exacte (vérifié, pas cru).
- **Validation d'entrée / booléens / crypto** (pièges CodeScene/Perry) : décodage int256 signé prouvé (mutant 8) ; `assertNoClose` lookbehind `(?<!no_)` n'exempte que `no_close` (pas un vrai close) ; sha/chaîne de hash déterministes (canonical trié) ; aucune source d'aléa dans le quorum (déterministe, rejeu bit-identique).

## §9 — Preuve « aucune écriture dans F:\Monark* »

- `F:\Monark-wt-bell2a` `git status --porcelain` : **sha `978ac98b…` identique avant/après** toute la revue (14 entrées inchangées). Delta du lot intact, HEAD `88c3324`.
- `F:\Monark` (dépôt principal, `lot/etude-suite`) : HEAD a avancé `3f2f19c → 23551ca` et les 2 docs non suivis ont disparu — **changement EXTERNE de l'orchestrateur** (reflog : `commit … G7-lot-e-registre CLOSED … T-1a-ii-a delivered → fresh G2`), R-20 licite (seul l'orchestrateur committe). **Non imputable au relecteur** : aucun `git` d'écriture ni écriture de fichier émis vers `F:\Monark*` ; toutes mes écritures sous `F:\tmp\g2-t1aiia\` (copie, logs, scripts hors arbre). `3f2f19c` reste ancêtre ; le worktree du lot n'est pas affecté.
