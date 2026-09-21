# G2-DELTA — RELECTEUR (instance séparée, contexte frais) — Bell **T-1a-iii-a1-bis** pli `72b3cb9`

## Modèle résolu (R-1)
`claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé). RELECTEUR G2-DELTA.
**R-20 : aucun commit, aucun workflow, aucune écriture dans le dépôt.** Vérification par RE-EXÉCUTION en arbre ISOLÉ,
restauration byte-exacte. **AUCUN réseau** (test 42 exclu ; test 23 = loopback fermé, pas d'egress). Advisor intégré 2×.

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le pli `72b3cb9` (sur le G1 `9992e5b` que j'ai relu) **implémente correctement les 6 corrections** C-V-1..C-V-5 + C-G2b-3 :
**les 8 mutants (7 listés + 1 de mon cru) sont ROUGE de première main**, l'intégrité de reprise per-page × seq===index est
**prouvée** au travers d'une frontière de crash, et la sonde C-11 n'STOPpe plus sur 403/3xx. **MAIS** le pli **casse le gate
`npm run lint` (exit 1)** — une régression que le RENDU worker déclare faussement verte — et R-25 est **683** (annoncé 681).
La correction de lint est **BLOQUANTE** (gate rouge, R-22) mais triviale (1 caractère) ; le fond est sain. D'où
PASS-AVEC-CORRECTIONS, pas FAIL.

---

## Méthode (reproductible — R-21)
Arbre isolé `git archive 72b3cb9 | tar -x` sous `F:\tmp\g2d-a1bis\tree\` (909 fichiers) ; `node_modules` = jonction vers
`F:\Monark\node_modules` ; **jamais** `git checkout`/`npm ci`. Node 24.15.0. **Les 12 shas de départ == worker
`final-sha-v2.txt`** (byte pour byte : `universe.ts 5d4b528f…`, `universe-cli.ts 03ca162d…`, `universe.test.ts b8b0e962…`,
`net-probe.mjs c6e186a8…`, `no-network.mjs 0d3d0da7…` inchangé). **ALL 12 BYTE-EXACT RESTORED** après mutants
(`F:\tmp\g2d-a1bis\{baseline,final}-sha.txt`). **Worktree `F:\Monark-wt-a1bis` PROPRE à l'entrée et à la sortie** (lecture
seule). Test 42 (`export-public`) exclu (fait `npm ci` + egress registre, interdit) — **son run worker n'est donc PAS
re-vérifié par ce G2** (dépendance réseau+install), item hors périmètre bell/universe.

---

## 1. Oracle re-exécuté — **lint ROUGE (régression + fausse déclaration)**
| Gate | Mesuré (isolé) | Statut |
|---|---|---|
| `gate:vocab` | exit 0 — 188 fichiers | ✅ |
| `typecheck` (`tsc --noEmit`) | exit 0 | ✅ |
| `test` (verbatim, − test 42) | **579 pass / 0 fail, exit 0** ; 0 flake async.c ce run | ✅ (576 + 3 nouveaux : 8e, 12b, 23) |
| **`lint` (`eslint .`)** | **exit 1** — `apps/bell/test/universe.test.ts:524:22 'url' is defined but never used @typescript-eslint/no-unused-vars` | ❌ **RÉGRESSION** |
| `lint:ratchet` | exit 0 — 69/69 | ✅ |
| `lang:gate` (bell) | 0 hit | ✅ |

**C-VD-1 (BLOQUANTE — gate rouge + fausse déclaration, error_origin = worker).** Le pli introduit un `url` inutilisé dans le
`httpGet` du sous-cas 12b(c) (`universe.test.ts:524` : `const httpGet = (url: string): Promise<HttpGetResult> =>
Promise.resolve({…})`), que `@typescript-eslint/no-unused-vars` **rejette (exit 1)**. **Le G1 `9992e5b` passait lint (exit 0
en revue précédente)** ⇒ régression du pli. **Le RENDU worker déclare `lint (eslint .) exit 0`** (`RENDU-G1.md:156`) — **FAUX,
mesuré exit 1** (déterministe : re-run direct sur le fichier = 1 problem, exit 1). L'oracle `npm run ci && npm run lint && npm
run lint:ratchet` **ÉCHOUE** donc au 2ᵉ maillon. **Correctif** : `url` → `_url` (ou l'utiliser). Re-jouer `npm run lint` ⇒
doit être exit 0. **Aucun test ne couvre le lint** — seul le gate le prend ; d'où l'importance de le rejouer, pas de le lire.

**R-25** : base `4f81f67`, pathspec **verbatim** `ci.yml:65`, HEAD `72b3cb9` ⇒ **`12 files changed, 632 insertions, 51
deletions` = CHANGED 683** (annoncé **681** ⇒ **C-VD-2, non bloquant** : +2 sous-compte du RENDU ; error_origin = worker
mesure ; **683 ≤ 1 205**, marge large). Docs `.md` exclus (les 2 docs persistés ne comptent pas). Numstat : universe.ts
141/10, universe-cli.ts 72/11, universe.test.ts 307/30, net-probe.mjs 50/0, no-network.mjs 20/0, server.test.ts 36/0, +6
fichiers à 1/0. **Anti-close bis** : `git diff 9992e5b..72b3cb9 --stat -- apps/bell/test/fixtures/**` = **VIDE** (aucune fixture modifiée ;
les chaînes prix du test 13b sont des ENTRÉES asserties vidées, pas des fixtures publiées).

---

## 2. Table correction → code → test → mutant (rejoué ROUGE de première main)
| Corr. | Code (fichier:ligne) | Test | Mutant → résultat mesuré |
|---|---|---|---|
| **C-V-1** persist per-page | `universe-cli.ts:164` `persist()` dans la boucle + `:196` probe `finally` ; borne réécrite `universe.ts:160` | 8e `bell_universe_pagination_persists_per_page_kill_window` | **persist hors boucle retiré** → 8e **ROUGE** (`exit=1`) ; borne mesurée (§3-A) |
| **C-V-2** sonde après le brut + catch typé | `universe-cli.ts:171` brut d'abord, `:177-196` sonde (catch mappe 403/3xx/4xx, re-jet cap pur, `:191` `Fatal403Error`) | 12b `bell_universe_c11_probe_observes_never_stops_except_budget` (a/b/c) | **maxRetries:0 retiré** → **ROUGE** ; **Fatal403 catch retiré** → **ROUGE** ; **re-jet budget retiré** → **ROUGE** (3/3) |
| **C-V-3** seq===index + ancre entière | `universe.ts:208` `e.seq !== index`, `:245` `!Number.isInteger(anchorCalls)` | 12 (seq figé/négatif/non-monotone + ancre 16.5) | **check seq retiré** → 12 **ROUGE** ; ancre fractionnaire refusée (mesuré) |
| **C-V-4/C-G2b-1** frontière de lettre + décimale `[.,]` | `universe.ts:422` `(?<![A-Za-z])(…)(?![A-Za-z])/i`, `:423` `\d+[.,]\d+` | 13b `bell_universe_identity_text_sanitized_no_false_reject` | **régression regex** → 13b **ROUGE** (voir §3-D pour la nuance du mutant `\b`) ; contre-exemples §3-D |
| **C-V-5** verrou `net` | `no-network.mjs` `net.Socket.prototype.connect` ; helper `net-probe.mjs` (loopback FERMÉ) | 23 `bell_universe_no_network_shim_blocks_at_net_level` | **patch `net` retiré** → 23 **ROUGE** (net/http/https → ECONNREFUSED loopback, 0 egress) |
| **C-G2b-3** phantom-fresh | `universe-cli.ts:124-129` (commentaire DÉCLARÉ) | (déclaration, pas de code) | §3-E : déclaration **suffisante** (CONV-2 nommé, hôte fusionné) |

Restauration byte-exacte vérifiée après CHAQUE mutant (sha256 == baseline).

---

## 3. Analyses demandées (mesurées)

**(A) C-V-1 — la borne réécrite est-elle ce que le code tient ?** OUI. Le pli ajoute `persist()` **dans le corps de la boucle
de pages** (`universe-cli.ts:164`) + un `persist()` dans le `finally` de la sonde (`:196`). **Test 8e** (qui espionne lui-même
l'ancre avant chaque GET) **asserte** qu'à la page p l'ancre persistée vaut ≥ p ⇒ **ticks ≤ 1 page de retard** — il **passe
pristine et rougit sous le mutant** (je n'ai pas écrit de spy séparé : la mesure EST l'assertion de 8e). Le kill-dur ne perd
qu'un tick en vol ; ce GET est un GET ISSUER **non payant**. **Chemin PAYANT (Chainstack confirm)** : `persist()` par-mint
(`:207` `finally`) inchangé ⇒ **≤ 2 RPC** (une confirmation quorum-2). La borne réécrite (`universe.ts:160` : « PAID ≤ 2 RPC ;
ticks ≤ 1 page behind ») **correspond au code**. Mutant « persist hors boucle » ⇒ 8e ROUGE (`anchorAtGet=[0,0,…]`). *(Le test
asserte `>=`, donc « ≤ 1 en retard », pas « exactement le compte de pages » — direction conservatrice, correcte.)*

**(B) C-V-2 — sonde après le brut, 3 mutants.** Le brut sha-pinné est écrit **AVANT** la sonde (`universe-cli.ts:171`) ⇒
la preuve est durable même si la sonde STOP. Le catch mappe explicitement `Fatal403Error→http_403`,
`RedirectBlockedError→redirect_blocked` (avalés), `BudgetExceededError`**pur**→throw (seul STOP), `HttpStatusError→http_N`.
`makeBudgetedCall.tick()` est **check-then-increment** (`collect.ts:300` `if (n >= maxCalls) throw` **avant** `n += 1`) ⇒ au
cap la sonde jette un `BudgetExceededError` **pur** sans dépasser l'ancre (12b(c) premise tenue, **aucun dépassement de cap**).
Les 3 mutants (maxRetries:0 retiré → 4 retries → probeCalls=5 ; Fatal403 catch retiré → 403 re-jeté → STOP ; re-jet budget
retiré → cap avalé) **rougissent 12b** (mesuré, 3/3).

**(C) C-V-3 — seq===index.** `verifyChain` exige `e.seq !== index ⇒ ok:false` (`universe.ts:208`) ⇒ un `seq` non monotone,
négatif, ou en double est refusé (chaque entrée bien hachée). Mutant seq-figé-à-0 (2 entrées `seq=0`) → la 2ᵉ a `seq 0 ≠ index
1` → ROUGE. Ancre **entière** exigée (`!Number.isInteger`) ⇒ ancre `16.5` refusée (mesuré). Retirer le check → 12 ROUGE.

**(D) C-V-4 — sanitizer + MON contre-exemple.** Pristine mesuré : **VIDÉ** — `USD12`, `12USD`, `AAPL USD150`, `EUR3`,
`JPY100` (devise collée à un chiffre) ; `1,234`, `Fund 2,5` (virgule décimale) ; `100 USD`, `buy USD`, `AAPL USD` (code en fin
de chaîne). **PRÉSERVÉ (correct)** — `USDx`, `USDCx`, `EURCx`, 16/16 fixture. **Contre-exemples que J'AI trouvés (résidus
BORNÉS, non des régressions)** : (i) **`5USDx` SURVIT** — un chiffre en tête d'un symbole (`5`+`USD`+lettre `x`) : la
préservation `USDx` (lookahead lettre) admet un montant collé à un symbole ; **assumé** par le design C-V-4. (ii) **`100 CNY`,
`50 INR`, `300 kr` SURVIVENT** — devises **hors liste fermée** (CNY/INR/kr ∉ USD/EUR/GBP/CHF/JPY/CAD/AUD) : limite déclarée
de la liste fermée (les xStocks sont US/EU ⇒ USD/EUR sont les codes pertinents). (iii) **`1,234` est désormais VIDÉ** — un
**nouveau faux-rejet** introduit par `[.,]` (séparateur de milliers pris pour une décimale) ; direction conservatrice, à
connaître. Aucun de ces trois n'est un « code devise listé + montant en forme standard » qui survivrait — **le pli ferme ce
trou** (mesuré pristine : `USD12`/`AAPL USD150`/`EUR3` → `""`). **Honnêteté sur le mutant 13b** : mes deux tentatives de
restaurer `\b` ont produit (échappement perl/node) un regex NU `/(USD|…)/i` (sans `\b`), qui **rougit quand même** 13b — mais
via l'assertion `emptied: USD 12` (le regex nu vide `USDx` aussi), **pas** via « forme collée survit ». La régression regex
est donc **prouvée porteuse** (le sanitizer casse si on abîme le regex), mais le fait précis « `\b` laisse passer les formes
collées » est mesuré par (i) la sonde G1 `p-fix` (regex `\b` : `USD12` cur=false) et (ii) la mesure pristine ci-dessus (la
frontière-lettre du pli les vide). **Je ne prétends PAS avoir exécuté le mutant `\b` exact.**

**(E) C-G2b-3 — phantom-fresh : déclaration suffisante.** Le pli DÉCLARE le résidu (`universe-cli.ts:124-129`) : exposition
bornée par `--max-calls`/run, correctif = garde **C-8** de `@monark/rpc-guard` (`ensureCycleDir` : parent DOIT préexister),
migration à **CONV-2 = GARDE-HELIUS-1b**. **Vérifié [lu]** : (i) `88c63bb` résout — « Merge lot/garde-helius-1a … package
upcoming », **touche 20 fichiers `packages/rpc-guard`** ⇒ l'hôte C-8 **existe déjà** ; (ii) `G7-lot-t1a-iii-a1.md:18` : la
**première course est GATÉE par garde-helius** ⇒ aucune course PAYANTE ne précède le garde C-8. **Conclusion : déclaration
SUFFISANTE** (item formé, déclencheur nommé, hôte fusionné, exposition bornée, backstop = ledger de CYCLE write-ahead qui est
lui-même un gate de course). Pas un trou réel d'ici la course. *(Réserve mineure : `garde-helius-1b` doit effectivement porter
la migration avant la 1ʳᵉ course payante — mais la course est séparément gatée par garde-helius, donc l'ordre est contraint.)*

**(F) C-V-5 — verrou `net` (test 23) + hygiène.** `net-probe.mjs` exerce net.connect/http/https/fetch contre un **port
loopback FERMÉ** (bind :0, lit le port, close, puis connecte au port fermé) : **aucun egress** (refus LOCAL immédiat). Avec le
shim : les 4 rapportent `SHIM:` ; témoin sans shim : net/http/https → `ECONNREFUSED` (loopback), fetch → `SHIM:` (ceinture).
Mutant (patch `net` retiré) → net/http/https reviennent à `ECONNREFUSED` → 23 ROUGE (le patch `net`, pas la ceinture fetch,
est porteur). Le probe **ferme son serveur avant de connecter** ⇒ pas de `TCPServerWrap` rémanent ; la suite complète
(579/0, incl. test 23 + le drain test) passe sans flake async.c ce run ⇒ pas d'interaction avec D4.

**(G) MON mutant/vérification non listée — reprise per-page × seq===index à travers un crash (point 7).** Kill mid-pagination
(`writeFile` throw au 3ᵉ écrit d'ancre) ⇒ le 3ᵉ persist de boucle jette AVANT d'écrire (ancre resterait 2), **mais le
`finally { persist() }` de boucle re-tire ensuite** (4ᵉ écrit d'ancre = 3, append seq2) ⇒ sur disque **ancre=3, tête=entry2
(calls 3)**, journal = 3 entrées, `verifyChain.ok` (le `finally` a fermé l'écart). La reprise lit `prior.calls=3`. **RESUME** ⇒ re-pagine et continue la chaîne : journal = **9 entrées, `verifyChain.ok=true`,
seq CONTIGU 0..8, calls_cumulative MONOTONE 1..9** ⇒ **C-V-1 (per-page) × C-V-3 (seq===index) TIENNENT à travers une frontière
de run**. Bonus : crash « append perdu après l'ancre » ⇒ ancre en avance ⇒ **reprise SANS throw** (conservativité per-page :
ancre ≥ tête, jamais un faux « downward »). Aucune régression de la reprise introduite par le per-page.

---

## 4. error_origin (proposé au G7)
- **C-VD-1 (lint rouge + fausse déclaration « lint exit 0 ») = worker** — régression du pli (le G1 passait) + revendication
  d'oracle non vérifiée (R-21). **BLOQUANTE** (gate non discrétionnaire, R-22).
- **C-VD-2 (R-25 683 vs annoncé 681) = worker** (mesure) — non bloquant (≤ 1 205).
- C-V-1..C-V-5 + C-G2b-3 : **implémentation worker fidèle aux corrections G2/checkpoint-2** ; tous les mutants rougissent,
  aucun fail-open ARGENT ; résidus sanitizer bornés (5USDx, devises hors-liste, faux-rejet `1,234`) — à connaître, non bloquants.

## 5. Ce qui est PROUVÉ vert (résumé adversarial)
8 mutants ROUGE de première main (persist-hors-boucle ; sonde ×3 : maxRetries0/Fatal403/re-jet-budget ; seq-check ; `\b`
restauré ; patch-net retiré ; + mon point-7 reprise) ; borne per-page/paid mesurée conforme ; sonde n'STOPpe plus sur 403/3xx
(avale, brut durable avant) ; seq===index + ancre entière ; sanitizer ferme le trou devise-collée/virgule/fin-de-chaîne ;
verrou `net` prouvé **sans egress** (loopback fermé) ; phantom-fresh déclaré **suffisamment** (hôte C-8 fusionné, course gatée) ;
reprise per-page intègre à travers un crash ; 579/0, ratchet 69/69, vocab/lang 0 ; worktree propre. **Un seul blocage : le gate
`npm run lint` est ROUGE** (régression triviale + déclaration worker fausse) ⇒ **PASS-AVEC-CORRECTIONS** (bloquant C-VD-1 à
corriger + re-jouer `npm run lint` avant merge ; le fond est sain).

**R-20 : je ne committe pas, je ne déclenche aucun workflow. Sortie = donnée brute pour l'orchestrateur (R-21).**
