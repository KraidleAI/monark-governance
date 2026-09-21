# CHECKPOINT-2 - Bell T-1a-iii-a1-bis - avis du validateur-humain (verbatim, claude-fable-5-1, 2026-09-21, HEAD juge 9992e5b)

# AVIS CHECKPOINT-2 (LIVRABLE) : Bell T-1a-iii-a1-bis — ACCEPTE-AVEC-CORRECTIONS (C-V-1 à C-V-4 bloquantes)

Les revendications centrales du ledger tiennent sous mon propre rejeu. Quatre écarts entre revendications et tests bloquent : borne de sous-compte fausse, `seq` non vérifié, sonde C-11 qui peut STOPper, assainisseur incomplet. Le ruling (a) sur D4 est licite sous conditions. Aucune escalade investisseur.

## 1. Contrôle d'entrée et artefacts
- Artefacts lus : `docs/G0-lot-t1a-iii-a1-bis.md`, `F:\tmp\a1bis-g1\RENDU-G1.md`, `docs/G7-lot-t1a-iii-a1.md:14-18`, `docs/G2-DELTA-lot-t1a-iii-a1.md`, le diff `4f81f67..9992e5b`, les logs `F:\tmp\a1bis-g1\matrix-clean-82\`. La G2 parallèle n'a pas été lue.
- HEAD jugé `9992e5b`, un commit, `git show --stat` = 11 fichiers, 448 insertions et 50 suppressions. Les 11 sha256 des blobs HEAD, du worktree et du RENDU concordent. Aucun fichier de registre public, `ci.yml` ou `package.json` dans le diff.
- Rejeu sur copie `git archive HEAD` dans `F:\tmp\cp2-a1bis\copy`, jonction `node_modules`, harnais dans `F:\tmp\cp2-a1bis\replay\`.
- Oracle rejoué hors ligne : `npm run ci` 578 tests, 0 échec ; `eslint` exit 0 ; ratchet 69/69.
- Preuve de non-écriture : `git status` à 0 ligne sur `F:\Monark-wt-a1bis` et `F:\Monark` ; 4 sha du dépôt identiques avant et après ; la copie a été restaurée byte-exact après chaque mutant.

## 2. Points (a) à (j), mesurés par moi

**(a) Borne write-behind ≤ 2 : non atteinte.** Simulation de kill (`replay/ledger-replay.mts`, état disque figé à chaque envoi) : pire sous-compte 3 sur une page, 5 sur 5 pages.
- Le `persist()` de pagination n'est qu'au `finally` de la boucle (`universe-cli.ts:160`), donc le sous-compte vaut le nombre de pages lues.
- Le tick de la sonde C-11 n'est persisté qu'au premier confirm.
- Sur un STOP ordinaire à la sonde, l'ancre reste à 1 pour 2 ticks : c'est un sous-compte sans kill.
- Les GET émetteur ne sont pas facturés ; l'exposition payante reste ≤ 2 RPC. La borne déclarée en ticks logiques est fausse.

**(a) Pas de reset silencieux du compteur : conforme.** Les cas journal seul, ancre vide, tronquée, `{}` ou chaîne, ligne déchirée, première ligne ôtée et ligne `null` jettent tous.
- Une troncature du journal en frontière de ligne garde l'ancre (pas de baisse).
- Ancre en avance acceptée, baisse refusée.
- Journal supprimé ou vidé avec ancre abaissée est accepté : c'est la réécriture coordonnée déclarée. Elle ne peut pas être resserrée sans casser la fenêtre de crash d'avant le premier append.
- Défaut mineur : une ancre non entière est acceptée, alors que `verifyChain` exige des entiers.

**(b) `verifyChain` :** `prev` cassé, édition sans re-hachage et `calls_cumulative` décroissant sont refusés.
- `seq` n'est pas vérifié : les suites 0,7,3, les doublons et les négatifs passent si la chaîne est bien hachée.
- Le mutant « seq figé à 0 côté écrivain » survit.
- Le commit annonce « monotone seq », ce qui n'est pas implanté.

**(c) Shim no-egress :** avec le shim, `http.request`, `https.request`, `net.connect` et `fetch` sont tous bloqués (`replay/probe.mjs`, port loopback fermé). Sans shim, témoin `ECONNREFUSED`.
- Le shim bloque aussi le loopback. Ce n'est pas un défaut : il est confiné au sous-processus de `spawnSync`.
- Le mutant « patch `net.Socket.prototype.connect` retiré » laisse le test 22 vert. Le CLI n'utilise que `fetch` (`:255,269`) et la ceinture `fetch` produit seule `SHIM:`.
- Aucun test committé ne prouve donc le verrou niveau `net` (C-8). Un autre test qui oublierait `--import` n'est détecté par rien. Aucun autre `spawn` du CLI n'existe dans `apps/bell/test`.

**(d) Sonde C-11 :** elle est bien comptée au budget (`--max-calls` 15 échoue, 16 passe).
- Les réponses 404, 400, 429, 500 et les erreurs de transport sont avalées ; zéro retry constaté.
- Un 403 ou un 3xx passé-fin STOPpe le run, brut non sauvé. `Fatal403Error` et `RedirectBlockedError` héritent de `BudgetExceededError`, donc le catch les re-jette.
- La sonde est placée avant la sauvegarde du brut (`:169-178` contre `:180`).
- Trois mutants survivent : catch retiré, re-jet budget retiré, `maxRetries:0` retiré. Seul le +1 GET est couvert par un test.

**(f) Drain :** c'est de l'hygiène correcte, 10 lignes, sans danger. Le worker l'a mesuré : il ne ferme pas le flake.
- Le commentaire de `server.test.ts` près de `:242-246` affirme « ×100 matrix (0 failures, power ≈ 0.966) ». C'est faux en code committé.
- Les commentaires « so no loopback handle survives --test-force-exit » portent une causalité réfutée.

**(g)** R-25 = 498 : reproduit.

**(h)** L'exclusion du méta-test 42 de la matrice est déclarée et motivée. L'item de capture du test imbriqué en échec est formé.

**(i)** CONV-2 : son déclencheur est déjà tiré (`88c63bb` fusionné). Sous la règle Dettes, il faut un lot nommé, pas « prochain lot de convergence ».

**(j) Risque de fusion :** l'aperçu `merge-tree` en lecture seule donne 0 marqueur de conflit.
- Parmi les 11 fichiers, seul `test/probe-narabi.test.ts` a changé sur `lot/etude-suite`. `apps/harness/test/*` y est inchangé depuis `4f81f67`, contrairement à ce que tu annonçais.
- Ce fichier y gagne des sites `net.createServer`, où `closeAllConnections` ne s'applique pas. Le recensement « 10 sites » est relatif à la base ancienne.
- Le G7 rejoue `ci && lint && lint:ratchet` sur l'arbre fusionné et refait le recensement.

## 3. Ruling (e) — finding D4 : licite sous conditions, sinon contournement
R-22 tient. `ci.yml` et `package.json` sont hors diff, l'invariant de `ci.yml:3` (jobs bloquants, pas de `continue-on-error`) et le verrou `ci-gates.test.ts:1329` sont intacts. L'oracle ×100 a été exécuté et a réfuté le diagnostic du G2-delta : c'est son rôle. Pas d'escalade, sauf si tu choisis l'option (b) ou (c), qui touchent un flag verrouillé par ADR.

Quatre conditions fermées :
1. **Attribution corrigée.** Sur 4/100 échecs, seuls 2 portent la signature `async.c:76` (run-008, run-057). Les runs 044 (`h5-e2e-probe`) et 097 (`http.test.ts`) sont des échecs niveau fichier non signés. « libuv » est mesuré pour 2 et inféré pour 2.
2. **Relance bornée.** La relance est une pratique locale Windows uniquement, licite seulement si le log porte la signature exacte. Tout rouge non signé reste un rouge. Aucun retry en CI.
3. **Item formé avec recherche.** Il faut l'issue amont Node/libuv sourcée. « Bug connu » sans source est un défaut (P1). Si elle est introuvable, procurement. Déclencheur : bump Node/libuv, ou premier rouge de cette forme sur ubuntu. Propriétaire : orchestrateur.
4. **C-G2D-1 n'est pas clos.** Il est re-formé et re-diagnostiqué. La liste des gates de course (`docs/G7-lot-t1a-iii-a1.md:18`) change donc, et ce changement doit figurer sur la fiche de GO de course remise à l'investisseur. L'amendement du critère du plan est un texte daté, `error_origin` = plan (diagnostic du G2-delta).

## 4. Checklist
- **CA-6 : corrections.** Tests verts et mutants du G0 tous rouges, mais quatre propriétés revendiquées n'ont aucun tueur (C-V-1 à C-V-3, C-V-5).
- **CA-7 : correction.** Voir le point 3 et CONV-2.
- **CA-8 : conforme.** Worker `claude-opus-4-8[1m]` différent de la G2 et de moi, `error_origin` renseignés. Attribution D4 à corriger.
- **CA-9 : conforme.** Rejeu exécuté par moi sur copie fraîche, sans lire la G2.
- **CA-10 : conforme.** Aucun argument de vitesse ; R-25 = 498.
- **CA-11 : conforme.** Le test C-5 exécute la composition depuis le journal écrit par le run jusqu'à la ligne de tête de la provenance. Tout reste `upcoming`.
- **Anti-close bis : conforme pour le diff.** 6 littéraux décimaux ajoutés, aucun de nature prix réel, 0 coïncidence dans les 5 dossiers de bruts pinnés sous `F:\PRODUITS\etude-2026-09-20\`. Aucune fixture touchée. L'assaut sur l'assainisseur donne C-V-4.
- **CA-1 à CA-5 : n-a.** Couvertes au checkpoint-1.

## 5. Corrections — liste fermée

**C-V-1 (bloquante) — borne ≤ 2 fausse.** `persist()` dans le corps de la boucle de pages et en `finally` de la sonde, plus un test de fenêtre de kill. À défaut, re-déclarer la borne partout : `:196-198`, l'en-tête de `universe.ts` et le texte C-1 du G0. `error_origin` = plan et worker.

**C-V-2 (bloquante) — sonde C-11.**
- Déplacer la sonde après la sauvegarde du brut.
- Trancher le cas 403 et 3xx passé-fin : soit re-jet restreint au vrai budget, soit STOP déclaré par ruling daté.
- Ajouter les tests : 404 passé-fin donne un run ok et `http_404` en provenance ; 0 retry ; budget épuisé à la sonde jette.
- Nit : un corps non-tableau donne `array_len=0`, ce qui perd l'information de forme.
- `error_origin` = worker et plan.

**C-V-3 (bloquante) — `seq`.** `seq !== index` rend `ok:false`. Ajouter l'assertion et le mutant. Ancre entière exigée. `error_origin` = worker.

**C-V-4 (bloquante avant course) — assainisseur.**
- La forme à virgule du littéral synthétique 13b passe.
- Un code devise accolé à un chiffre passe, avant ou après, faute de frontière de mot.
- Correctif : décimale en `[.,]`, et code devise adjacent à un chiffre. Re-prouver l'identité des 16 champs de la fixture. À défaut, déclarer ces résidus par texte daté.
- `error_origin` = plan, ma forme C-7 du checkpoint-1, et worker.

**C-V-5 (non bloquante) — shim.** Committer un test du verrou `net` sous shim. Mon `probe.mjs` en est la forme.

**C-V-6 (non bloquante) — docs.** Commentaires faux de `server.test.ts` à corriger, attribution D4 du RENDU à corriger, CONV-2 à nommer en lot.

## 6. Décision
**ACCEPTE-AVEC-CORRECTIONS.** C-V-1 à C-V-4 sont à plier avant G7, puis G2-delta sur le pli. Le ruling (a) est licite sous les quatre conditions du point 3. Aucune ESCALADE-INVESTISSEUR : aucune décision de valeur ni de périmètre, aucune dérogation à un gate G.

## 7. AM-1
- **Attrapé :** la borne ≤ 2 fausse, `seq` non vérifié, la sonde qui peut STOPper et qui précède le brut, 4 mutants survivants dont 3 sur C-11, l'assainisseur virgule et code accolé, le verrou `net` sans preuve, 2 échecs de matrice sur 4 non signés.
- **Manqué par moi au checkpoint-1 :** la forme `\b` de C-7, la hiérarchie `Fatal403Error ⊂ BudgetExceededError` dans le texte de C-11, et la boucle de pages dans la phrase C-1.

## 8. Modèle résolu (R-1)
`claude-fable-5-1`.

Note hors lot : le serveur MCP `plugin:vercel:vercel` demande une autorisation côté utilisateur, à faire via `claude mcp` ou `/mcp` en session interactive. Non utilisé ici.
# Re-acceptation Bell a1-bis (pli 72b3cb9)

# RÉ-ACCEPTATION SUR PIÈCES : Bell T-1a-iii-a1-bis, pli `72b3cb9` — ACCEPTE-AVEC-CORRECTIONS

Mes quatre corrections bloquantes sont closes, mes rejeux le confirment. Il reste une liste fermée non bloquante : quatre branches du pli sans tueur, et deux de mes conditions D4 mal reportées dans le rendu.

## 1. Contrôle d'entrée
- HEAD jugé `72b3cb9`, `git status` du worktree à 0 ligne.
- Les 12 blobs HEAD concordent avec `F:\tmp\a1bis-g1\final-sha-v2.txt` : 12/12 recalculés par moi.
- `git diff --stat 9992e5b..HEAD` : 13 fichiers, soit les 11 annoncés plus deux documents (`CHECKPOINT2`, `G2`).
- `ci.yml`, `package.json`, `ci-gates.test.ts` et tout registre public sont hors du diff.
- Rejeu sur copie fraîche `git archive HEAD` dans `F:\tmp\cp2-a1bis\copy2`, jonction `node_modules`. Harnais dans `F:\tmp\cp2-a1bis\replay\*-v2.mts`, `mutants-v2.mjs`, `mut-v4b.mjs`.
- Aucun réseau, aucun git d'écriture, aucune G2 lue (CA-9).

## 2. Re-exécutions
- **Fichier `apps/bell/test/universe.test.ts` : 30/30 verts**, dont 8e, 12b, 13b, 22 et 23.
- **C-V-1 tenu.** Ma simulation de kill, indépendante du test 8e, donne un pire sous-compte de 2, sur 1 page comme sur 5 pages (3 et 5 avant le pli). La pagination et la sonde sont à 1 tick de retard, le confirm à 2 au plus. L'ancre suit le tick de la sonde.
- **C-V-2 tenu.** 404, 400, 429, 500, transport, 403, 3xx et corps non-tableau laissent tous le run ok, brut sauvé, 2 GET, 0 retry. `past_end_probe` est typé : `http_403`, `redirect_blocked`, `not_array`. Un budget épuisé à la sonde arrête le run avec le brut déjà sauvé (absent avant le pli).
- **C-V-3 tenu.** Les suites `seq` 0,7,3, les doublons et les négatifs sont refusés. Une ancre non entière jette.
- **C-V-4 tenu.** La forme à virgule et les codes devise accolés à un chiffre, avant ou après, sont vidés. Le test 13b re-prouve l'identité des 16 champs de la fixture ; `USDx` et `USDCx` sont préservés.
- **C-V-5 tenu.** Le test 23 rougit quand le patch `net` est retiré.
- **Mutants de mon choix : 14 joués, 10 rouges, 4 survivants.** La copie a été restaurée byte-exact après chacun.
  - Rouges : persist par page, avalement du 403, re-jet du budget pur, `maxRetries:0`, `seq !== index`, `seq` figé côté écrivain, ancre entière, devise revenue à `\b`, décimale revenue au point seul, patch `net`.
  - Survivants :
    - persist du `finally` de la sonde retiré ;
    - avalement de `RedirectBlockedError` retiré ;
    - `transport_error` transformé en re-jet ;
    - sauvegarde du brut déplacée après la sonde.
  - Pour ces quatre, le comportement livré est correct (mesuré ci-dessus). Seul le test verrou manque.
- **Non rejoué ce tour :** l'oracle complet. Tu le rejoues sur l'arbre fusionné ; mon rejeu de `9992e5b` reste valable pour les fichiers inchangés.

## 3. Conditions du ruling (a) sur D4
1. **Attribution : tenue pour l'essentiel.** « 2 signés et 2 inférés » figure au rendu `:126-127`. À corriger : la phrase du rendu `:118-120` « CONFIRMÉ de première main par les DEUX relecteurs (validateur + G2…) ». J'ai lu la signature dans les logs du worker. Je n'ai pas reproduit le flake : mon unique run complet était vert.
2. **Relance : non tenue, texte à corriger.** J'avais écrit « relance locale Windows uniquement, aucun retry en CI ». Le rendu `:128-129` et `:144-145` écrit « relance CI licite si le log porte la signature ».
   - La source citée dit le bogue propre à Windows, et la CI tourne sur ubuntu. Un rouge sur ubuntu ne peut donc pas porter cette signature et reste rouge.
   - Une « relance de job » en CI serait le contournement de R-22 que j'excluais.
3. **Item formé avec source : tenu.** Le fichier de faits daté `F:\PRODUITS\etude-2026-09-21\bell-a1bis\FAITS-flake-libuv-windows-2026-09-21.md` existe : lecture au navigateur interne à 13:03 UTC, `nodejs/node#56645` et `#61999` marqués [lu], backports 22.x et 24.x déclarés NON LU.
   - Je n'ai pas de réseau : je constate l'existence et la forme du fichier, pas son contenu en ligne.
   - À compléter dans l'item : un déclencheur, soit « bump Node, ou lecture du backport 24.x ».
4. **Liste des gates de course : reste à porter au G7.** `docs/G7-lot-t1a-iii-a1.md:18` est inchangé dans ce pli, ce qui est normal (R-20). Au G7, il faut :
   - C-G2D-1 re-formé et re-diagnostiqué ;
   - l'amendement daté du critère D4 dans le G0 et dans `docs/G2-DELTA-lot-t1a-iii-a1.md:71-82` ;
   - la mention sur la fiche de GO de course remise à l'investisseur.

   Sans ces trois éléments, le G7 ne clôt pas (CA-7).

## 4. Checklist
- **CA-6 : conforme sous C-R-1.** L'oracle du fichier est rejoué et vert. Les quatre propriétés de mon avis ont désormais chacune un tueur, et ces tueurs rougissent chez moi.
- **CA-7 : correction.** Voir les conditions 2 et 4. CONV-2 est nommé en lot GARDE-HELIUS-1b (`universe-cli.ts:124-129`) : conforme. Le résidu « phantom-fresh » (C-G2b-3) est déclaré avec sa borne et son correctif cible : conforme, item formé.
- **CA-8 : conforme.** Worker, G2 et validateur sont distincts, `error_origin` renseignés. La sur-attribution de la condition 1 reste à corriger.
- **CA-9 : conforme.** Copie fraîche, harnais à moi, 14 mutants joués par moi.
- **CA-10 : conforme.** Surface R-25 : 683 lignes, soit 632 insertions et 51 suppressions hors `docs`, pour 681 annoncé. L'écart de 2 lignes tient au pathspec exact ; le total est sous 1 205. À re-mesurer au G7 avec la commande de `ci.yml:65`.
- **CA-11 : conforme.** Le test C-5 exécute toujours la composition depuis le journal écrit par le run jusqu'à la ligne de tête de la provenance. Aucun registre public n'est dans le diff ; Bell reste `upcoming`.
- **Anti-close bis : conforme.** Le pli n'ajoute que des chaînes synthétiques de test dans 13b. Aucune fixture n'est touchée, aucun brut n'est copié. Cet avis ne cite aucune valeur.

## 5. Corrections — liste fermée, non bloquantes avant G7

Pas de re-passage devant moi : tu constates toi-même que les 4 mutants de C-R-1 passent au rouge.

**C-R-1 — quatre assertions dans 8e et 12b.** `error_origin` = worker.
- Ancre à jour au GET de la sonde et au premier RPC.
- Sous-cas `RedirectBlockedError` à la sonde, avec `redirect_blocked` en provenance.
- Sous-cas erreur de transport, avec `transport_error` en provenance.
- Dans 12b (c), brut présent après le STOP budget. C'est le seul cas qui observe l'ordre « brut avant sonde ».

**C-R-2 — texte de la condition 2.** Le corriger dans le rendu et dans le G7 : relance locale Windows seulement, aucun retry en CI. Retirer « confirmé de première main par le validateur ». `error_origin` = worker (report inexact de l'avis).

**C-R-3 — au G7.** Amendements datés du critère D4, de la liste des gates de course et de la fiche de GO ; déclencheur de l'item libuv. `error_origin` = plan, propriétaire orchestrateur.

**C-R-4 — commentaire et résidu de l'assainisseur.** `error_origin` = worker.
- Le commentaire d'en-tête de l'assainisseur (`universe.ts:~408-411`) décrit encore l'ancienne forme « word-boundary » et « `\d+\.\d+` ». À aligner.
- Nommer au résidu déclaré (ADR D-b) les variantes de l'entier nu mesurées : entier suivi d'un ticker de stablecoin ou d'un mot, décimale sans partie entière.

## 6. Décision
**ACCEPTE-AVEC-CORRECTIONS** (C-R-1 à C-R-4, aucune bloquante pour la fusion). Aucune ESCALADE-INVESTISSEUR. Si l'orchestrateur maintenait une « relance CI », ce serait une dérogation de gate, donc une escalade obligatoire.

## 7. Preuve de non-écriture
- `F:\Monark-wt-a1bis` : `git status` à 0 ligne, HEAD `72b3cb9`, sha de `universe.ts` et `universe-cli.ts` identiques avant et après mes rejeux.
- `F:\Monark` : une ligne non suivie, `docs/G7-lot-narabi-ops-1c.md`. Elle est étrangère à mes rejeux, produite par l'orchestrateur en parallèle. Son HEAD a avancé à `c4981d0`.

## 8. AM-1
- **Attrapé ce tour :** 4 branches du pli sans tueur, dont l'ordre « brut avant sonde » que le test 12b revendique en en-tête sans l'observer. La condition 2 réécrite en « relance CI », qui est une dérive de R-22. Une confirmation qui m'est prêtée à tort.
- **Manqué au tour précédent :** le cas « phantom-fresh » d'un `--out` déplacé, attrapé par la G2 (C-G2b-3). Je l'avais classé en réécriture coordonnée sans voir la variante accidentelle.

## 9. Modèle résolu (R-1)
`claude-fable-5-1`.
