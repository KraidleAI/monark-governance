Modèle résolu : claude-opus-4-8[1m]

# G2-DELTA (reprise décision 116) — Lot GARDE-HELIUS-1b-0, pli `25e8de4`

- **Rôle** : relecteur G2 (contexte frais). **Modèle** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`, effort max ; Opus 5 banni).
- **Pli** : `lot/garde-helius-1b-0` @ `25e8de4f9241bcab9b9e3863ccad3a0b6e28a9f8` (ee8a94f ancêtre). 5 fichiers : `transport.ts`,
  `errors.ts`, `reconcile.ts`, `transport-hardening.test.ts`, ADR. Relu dans mon clone `F:\tmp\g2-garde1b0\tree` : `git fetch origin`
  puis `git checkout 25e8de4` (HEAD vérifié = 25e8de4, base 5394dfe présente, node_modules déjà en place ; `require.resolve('@monark/rpc-guard')`
  => `...\tree\packages\rpc-guard\src\index.ts`, A-2). **R-20** : aucun commit. **A-7** : aucune variable d'environnement affichée ;
  tout oracle/mutant/probe sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL
  -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`. Écritures : `F:\tmp\g2-garde1b0\` seul.

## Ce que le pli change (mesuré)
- `transport.ts` : **C-1** GET verbatim — après `JSON.parse`, `if (isGet) return parsed;` (l.247) : un `getOps` renvoie le corps TEL
  QUEL (pas de `.result`, pas de contrôle `error` JSON-RPC ; `NonJsonBody` conservé). **C-2** 403 structurel — `res.status === 403 ?
  undefined : parseRetryAfterMs(...)` (l.235) : un 403 ne porte JAMAIS de `retryAfterMs`, même avec en-tête `retry-after`.
- `errors.ts` : commentaire — `retryAfterMs` undefined pour 403 PAR CONSTRUCTION (garde explicite), pas par chance d'en-tête absent.
- `reconcile.ts` : commentaire C-6/121 — le ledger somme le TOTAL compte (pas de filtre réseau) ; un compte MIXTE => item formé.
- `transport-hardening.test.ts` (+96) : 4 tests neufs + renforcements (sosies d'hôte suffixe/préfixe, 7-clés).
- ADR (+81/−26) : section **Tuyaux 1b-0 (entrée/sortie/état/test)**, C-1 corps verbatim (1b0-A), C-2 structurel + 3xx GET (1b0-C),
  correction C-5 ripple, item reconcile mixte (1b0-G), oracle 777/775/0/2 + R-25 638 + 19 mutants.

## (7) Invariant `apps/**` — **PASS**
`git diff --stat 5394dfe 25e8de4 -- apps` = **`apps/sentinel/test/ukemi-guard-record.test.ts` SEUL** (22 ins/17 del, l'inversion). `scripts/`
= VIDE. Les 9 fichiers gelés (7 U-4b + u3-realized + adapter-narabi) = VIDE vs 5394dfe (frozen intact).

## (6) Oracle complet ×1 sous `env -u` — **PASS**
| Gate | Exit | Mesuré |
|---|---|---|
| `npm run ci` | **0** | **777 / pass 775 / fail 0 / skip 2** (skips attendus : `u4_redraw` [2b-iii], `fetch_only_inside_client` [until 1b]) |
| `npm run lint` | **0** | clean |
| `npm run lint:ratchet` | **0** | **69/69** |
| `npm run lang:gate` | **0** | 0 hit |
| `npm run export:check` | **0** | 0 chemin interdit, 0 FR |
- **R-25 (pathspec ci.yml:65, base 5394dfe)** recomputé sur mon clone = **588 ins + 50 del = 638** = attendu. 638 <= 1150. (Mon F-1
  antérieur — RENDU 517 — est SOLDÉ : l'ADR écrit désormais 638.)

## (5) Mutants — **PASS**
- **Harnais `F:\tmp\garde1b0\mutants.mjs` (19) rejoué** sous env -u : **19/19 KILLED**, `OK - all KILLED and every file restored
  byte-exact`, `git status` propre après. Comptage 14->19 = **net +5**, décomposé exactement : **6 entrées AJOUTÉES** (`C-1 (fold) GET
  unwrapped`, `C-2 (fold) 403 guard removed`, `F-2 (fold) redirect suivi on GET`, `C-7 (fold) endsWith`, `C-7 (fold) network on every
  operator`, `C-8 (fold) default network stamp`), **1 RETIRÉE** (l'ancien `D-9b 403 default retry-after (?? 1000)`, dont la find-string
  n'existe plus, supersédé par `C-2 (fold)`), **1 RE-POINTÉE** (`C-3b`, find MAJ vers la nouvelle ligne `res.status === 403 ? undefined
  : parseRetryAfterMs(...)`). (L'ADR « +7 mutants » se lit 6 ajoutés + 1 re-pointé/touché, PAS un net.)
- **Mes 5 mutants** (`F:\tmp\g2-garde1b0\g2-mutants.mjs`, points distincts) : **G2-a/b/c/d/e tous KILLED**, `git status` propre.

## (3) Mes F-2 + les 3 survivants du validateur — TOUS TUÉS — **PASS**
- **F-2 (mon G2-e)** : `redirect:"manual"` retiré du fetch **GET** => `transport_3xx_on_get_operator_is_hard_stop_never_followed`
  ROUGE. Mon trou de couverture est FERMÉ (test neuf du pli). Nommé aussi dans le harnais 19 (`F-2 (fold) redirect suivi on GET`, KILLED).
- **VH-a2 endsWith** = `C-7 (fold) structural host relaxed to endsWith` (admet le préfixe `xapi.xstocks.fi`) => KILLED par le renfort
  sosie du test `xstocks_issuer_get_uses_get_and_structural_host` (rejets suffixe `api.xstocks.fi.evil.invalid` + préfixe `xapi.xstocks.fi`).
- **VH-b2** = `C-7 (fold) network stamped on EVERY operator` (helius gagne `network`) => KILLED par
  `universe_course_stamps_network_only_on_chainstack_not_helius` (helius + chainstack dans UNE course : ligne helius SANS network).
- **VH-d3** = `C-8 (fold) legacy chainstack line stamped default network` (8e clé) => KILLED par le renfort 7-clés de
  `cycle_ledger_mixes_legacy_and_network_lines`.

## (1) C-1 checkpoint-2 : GET verbatim — sonde MIENNE à travers `openGuardedClient` — **PASS**
Sonde `F:\tmp\g2-garde1b0\g2-probe.mjs` (vraie pile `openGuardedClient`, fetch bouchonné, sous env -u) :
- corps objet `{assets:[1]}` => valeur résolue `{"assets":[1]}` (deep-equal) ; tableau NU `[1]` => valeur résolue `[1]`. **résolu === corps**.
- **Mutant « GET désenveloppé » à travers `openGuardedClient`** : j'ai muté `if (isGet) return parsed;` => `if (false) return parsed;`
  sur le disque, rejoué la sonde => `AssertionError: actual undefined - expected {assets:[1]}` (exit ≠ 0) : le corps résout `undefined`
  (= l'univers vide SILENCIEUX / fail-open que le pli ferme), prouvé au niveau `openGuardedClient`, pas seulement au test. Restauré
  BYTE-EXACT (sha256 `f95567f3…` identique avant/après, `git status` propre).

## (2) C-2 checkpoint-2 : 403 + `retry-after: 5` => `retryAfterMs === undefined` — **PASS**
Sonde à travers `openGuardedClient` (opérateur helius, fetch => 403 + `retry-after:5`) : l'appel jette un `TransportError` `code=403`,
`retryAfterMs === undefined` (structurel). Mutant « 403 guard removed » (`res.status === 403 ? undefined` => `parseRetryAfterMs(...)`)
ROUGE via `transport_403_carries_no_retry_after_even_with_header` (harnais 19, KILLED).

## (4) C-8 : ordre des 7 clés — **PASS**
Sonde à travers `openGuardedClient` (course chainstack SANS `opts.network` = ligne legacy) : la ligne 0 de `chainstack.jsonl` a
`Object.keys` == `["prev_entry_sha256","cycle_id","tariff_version","by_op_method","outcome","credits_derived","entry_sha256"]` (7 clés,
AUCUN `network`, AUCUN `reason`). Le test `cycle_ledger_mixes_legacy_and_network_lines` épingle ce même ordre fermé (assertion neuve du
pli) ; mutant C-8 « default network stamp » (8e clé) ROUGE. La byte-identité C-R-b6 est donc ASSERTÉE (pas seulement rejouée).

## C-5 (ruling orchestrateur : ripple recorder => 1b-iii) — **ÉCART SIGNALÉ (non bloquant, doc orchestrateur)**
L'ADR 1b0-E, au pli, CORRIGE l'attribution G1 initiale (« 1b-i ») : elle est FAUSSE car le ripple édite
`apps/sentinel/src/ukemi/record.ts`, qu'AUCUN de 1b-i/1b-ii/1b-iii ne touche (tous scopes `apps/bell`, G0 §3.1 l.110-112). L'ADR
**PROPOSE DEUX options** — (a) un lot Ukemi/NARABI recorder dédié, (b) une EXTENSION EXPLICITE du périmètre 1b-iii à `record.ts` — et
DÉFÈRE le choix « à un RULING orchestrateur, pas une décision worker » (comportement R-20 correct ; le pli ne s'auto-attribue pas la
règle). **Écart** : le ruling orchestrateur est désormais 1b-iii, mais le pli ne l'a pas encore RECORDÉ. Liste fermée pour la reprise
(propriétaire orchestrateur, R-20 ; à la prochaine touche ADR/G0) : **(a)** l'en-tête `### 1b0-E ... (item ii ; ripple 1b-i)` (ADR
l.561) est une ligne de CONTEXTE non modifiée => il porte encore « ripple **1b-i** » alors que son propre CORPS écrit que 1b-i « etait
donc FAUX » (en-tête PÉRIMÉ dans le pli) ; **(b)** le corps propose 1b-iii comme UNE des deux options et défère — il ne l'écrit pas
comme DÉCIDÉ ; **(c)** le G0-1b §3.1 l.112 (ligne 1b-iii) ne mentionne à ce jour NI `record.ts` NI le ripple (couplage cross-lot NON
déclaré dans le G0 1b-iii, vérifié). Non bloquant : le pli forme l'item
avec déclencheur (« 1er lot éditant record.ts, OU 1re course verrouillant >= 2 opérateurs sur cycle-ids distincts ») et défère
correctement ; l'inversion de récupération 1b0-D reste valide indépendamment. NB utile du pli : il rectifie aussi la mention erronée
« 1b-iii de-skippe le test sentinel » (les 2 seuls skips sont `u4_redraw` [scripts] et `fetch_only_inside_client` [test/ racine] ; le
test sentinel a été INVERSÉ, pas skippé).

## Statut de mes findings G1 antérieurs (F-1/F-2/F-3) — TOUS SOLDÉS par le pli
- **F-1** (RENDU R-25 517 faux) : l'ADR écrit désormais **638** (mesuré identique). Soldé.
- **F-2** (3xx sur GET non couvert) : test neuf `transport_3xx_on_get_operator_is_hard_stop_never_followed` + mutant nommé ; mon G2-e
  passe de SURVIVANT à TUÉ. Soldé.
- **F-3** (ADR sans ligne Tuyaux consolidée) : section **« Tuyaux 1b-0 (entrée/sortie/état/test) [pli C-4] »** ajoutée. Soldé.

## VERDICT G2-DELTA : **PASS**
Le pli résout les deux BLOQUANTES checkpoint-2 (C-1 GET verbatim — prouvé à travers `openGuardedClient`, fail-open fermé ; C-2 403
structurel sans `retryAfterMs`), tue les 3 survivants du validateur (VH-a2/b2/d3) et mon F-2, et solde mes F-1/F-3. Vérifications
refaites sur mon clone : invariant `apps/**` = seul le test sentinel inversé ; oracle 777/775/0/2 + lint/ratchet(69/69)/lang/export = 0 ;
R-25 638 <= 1150 ; harnais 19/19 KILLED byte-exact + mes 5 KILLED ; sondes C-1/C-2/C-8 à travers `openGuardedClient` vertes + mutant C-1
ROUGE end-to-end (restauré byte-exact). **Unique résidu** : ÉCART DOC C-5 (l'ADR/le G0 1b-iii doivent RECORDER le ruling orchestrateur
ripple=>1b-iii, propriétaire orchestrateur R-20) — non bloquant, item déjà formé avec déclencheur, worker ayant correctement déféré.
