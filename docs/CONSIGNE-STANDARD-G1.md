# CONSIGNE STANDARD G1 — exigences d'entrée de tout worker de code (MONARK, décision investisseur 122, 2026-09-21)

Objet : faire attraper AU G1 ce que les revues G2 / checkpoint-2 attrapent aujourd'hui en récidive (mesuré sur les 18 lots du 21/09 : 5 à 9 corrections par lot, presque toutes de la liste ci-dessous). Aucun gate n'est retiré : G2 ‖ checkpoint-2, pli, G2-delta, G7 sur l'arbre fusionné restent intégraux. Cette consigne est CITÉE par l'orchestrateur dans chaque mission G1 et le rendu porte une section « Consigne standard : point par point » (fait / n-a avec motif).

## A. Environnement et preuve
- A-1 Première ligne du rendu : « Modèle résolu : <id exact> » (R-1) ; stop si ce n'est pas `claude-opus-4-8…`.
- A-2 `node_modules` du worktree reconstruit par `F:\tmp\g2-garde2bi\mk-nm.ps1` (`@monark/*` → le worktree) ; `require.resolve('@monark/rpc-guard')` dans le rendu. Retrait : `rm-nm.ps1`, jamais `Remove-Item -Recurse`.
- A-3 Codes de retour capturés DIRECTEMENT (`cmd > log 2>&1; echo exit=$?`), jamais après un pipe ; oracle complet : `gate:vocab`, `typecheck`, `test` (compte pass/fail/skip), `lint`, `lint:ratchet`, `lang:gate`, `export:check`.
- A-4 `DELIVERED.sha256` (chemins relatifs au worktree, tous les fichiers touchés) ; rendu sous `F:\tmp\<lot>\` ; aucun commit (R-20) ; rien sur `C:` ; aucun réseau (fetch bouchonné, clés factices, hôtes `.invalid`).
- A-5 R-25 mesuré vs la base avec le pathspec VERBATIM de `.github/workflows/ci.yml:65` (docs exclus) ; > 1 150 ⇒ STOP + seam pré-déclaré, jamais un dépassement rendu.
- A-6 Invariants byte-identiques listés AVANT/APRÈS (sha) ; tout fichier du gel U-4b (`docs/adr/ADR-U4b-calibration-episode-frais.md` D4 + amendement) intact, sinon STOP + demande de consultation formée.

## B. Sécurité des secrets (récidives : 2a C-R-1, 2a C-R-3, 2b-i C-R-1, 1b C-2)
- B-1 Aucun texte libre d'un corps de réponse d'opérateur PAYANT dans un message/journal : indice à vocabulaire FERMÉ seulement (D6). Test nommé par opérateur payant (chainstack ET helius) — un mutant `paid = op === "<un seul>"` doit rougir.
- B-2 Expurger PUIS tronquer, sur tous les chemins ; test « clé à cheval sur la coupure ».
- B-3 Formes de la clé à couvrir : brute, userinfo, query, hex, base64, partielle, fractionnée — chaque forme non couverte est déclarée résidu à l'ADR (jamais tue).
- B-4 Lecture de clé : le code ne SONDE pas l'env (`env.X`, `env["X"]`, `"X" in env`, destructuration) hors du module allowlisté ; opérateurs et cycle = arguments CLI explicites, REQUIS sans défaut.
- B-5 Grep CI fail-closed : motifs `fetch(`, `node:http(s)`, `undici`, `child_process`, lecture de clé sous TOUTES les formes ; allowlist `Map<path,trigger>` avec non-vacuité PAR ENTRÉE + mutant « entrée retirée de la portée ».
- B-6 Hôtes : le label d'opérateur ne résout qu'un hôte ADMIS par la conformité des sources (`api.mainnet.solana.com`, pas `mainnet-beta`) ; test hôte + mutant.

## C. Identités et erreurs (récidives : 2b C-1, 1b C-1, 1b C-3)
- C-1 Une seule classe canonique par erreur (`RpcError`, `TransportError`, `BudgetExceededError`), ré-exportée, `instanceof` stable ; mutant « classe locale restaurée » rouge.
- C-2 Un refus de budget n'est JAMAIS réessayé ; test `*_budget_refusal_is_not_retried` + mutant.
- C-3 Une seule couche de retry ; 403/3xx/Retry-After conservés lors d'une migration (test par sémantique, mutant « redirect suivi »).
- C-4 Classifieurs (`isResultLimit`/`isPlanLimited`/`isRpcRevert`) importés de `classify.ts` ; test structurel « chaque alternative de regex ∈ `ERROR_HINT_TOKENS` » ; garde de code (3 / −32000) épinglée.

## D. Tests qui prouvent (récidives : 1b C-4 lock-test vacueux, b1b C-V-1, 2b-i C-G-1..3)
- D-1 Chaque test imposé a son mutant nommé ROUGE, rejoué par un harnais (`mutants.mjs` : mutation transitoire, test nommé, restauration byte-exacte par sha) ; un test sans mutant qui le tue est déclaré « déclaratif », jamais « couverture ».
- D-2 Un test vert sur une entrée vide/legacy n'est pas une preuve : vecteur synthétique NON vide, liste FERMÉE des clés attendues, valeur recomputée.
- D-3 Test d'intégration non-LLM de bout en bout par tuyau déclaré (seul `globalThis.fetch` bouchonné, pas de faux client) ; c'est lui qui autorise « branché » (règle Branchement) ; `built` seulement à la première course rapprochée.
- D-4 Aucune assertion affaiblie lors d'une adaptation (diff des tests annoté : + / − avec motif).

## E. Concurrence et état (récidives : 1d Q3, 2a lock)
- E-1 Verrou de cycle : `openSync("wx")` ; un verrou périmé (SIGTERM, crash) est DÉTECTABLE et récupérable, jamais un blocage définitif ; test + mutant.
- E-2 Ledger durable hors dossier de travail, parent pré-existant, jamais « reset-on-missing » (HELIUS-1).
- E-3 Cooldowns/backoffs déclarés à l'ADR avec leur valeur.

## F. Rédaction
- F-1 ADR : chaque pièce livrée a sa ligne « Tuyaux » (entrée / sortie / état / test) ; aucun renvoi vers `F:\tmp` (sources en dépôt seulement) ; résidus nommés avec déclencheur.
- F-2 ASCII dans les sources ; `gate:vocab` propre (le mot `score` nu compris) ; aucune clé réelle, même factice ressemblante.
- F-3 Déviations D-n déclarées au rendu, jamais un contournement ; blocage ou double échec ⇒ demande de consultation formée (R-26).

Amendements : par ligne datée ci-dessous, à chaque récidive nouvelle relevée en G2/checkpoint-2.
- 2026-09-22 — **G-1 (orchestrateur et rédacteurs de G0)** : tout plan ou ruling touchant une pièce PUBLIQUE (outil servi, liste d'outils, registre `built`/`upcoming`, README, skill, site, export) relit d'abord les décisions investisseur qui la nomment (`grep -n "<pièce>" docs/CHANTIERS.md`) et les cite. Récidive fondatrice : ruling U-4b-2 contre la décision 51, attrapé par le checkpoint-1.
- 2026-09-21 — **A-7 (secrets de l'environnement hérité)** : le shell d'un agent hérite des VRAIES clés User (`HELIUS_API_KEY`, `CHAINSTACK_*_URL`, `POLYGON_API_KEY`, `DATABENTO_API_KEY`). Interdits : afficher une variable ou l'environnement (`env`, `printenv`, `set`, `echo $X`, `Get-ChildItem env:`, `console.log(process.env…)`), même pour diagnostiquer ; contrôle par PRÉSENCE ou LONGUEUR seulement. Tout oracle, test ou mutant se lance avec les variables payantes RETIRÉES du process (`env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY npm run …`) — ce qui ferme aussi le faux vert « mutant rouge seulement si la clé ambiante est là » (2b-iii C-R-2). Récidive fondatrice : relecteur G2 2b-iii, valeurs imprimées dans un transcript (incident du 21/09, rotation recommandée).
- 2026-09-22 — **A-8 (entrée de forme réelle)** : un test d'intégration alimente le code avec un corps/une entrée DANS LA FORME que la SOURCE réelle produit (réponse de l'API telle qu'elle est documentée et telle qu'elle a été enregistrée), JAMAIS dans la forme que l'aval attend. Récidive fondatrice : GARDE-HELIUS-1b-0 C-1 (checkpoint-2) — le test enveloppait le corps de l'émetteur dans un cadre JSON-RPC ; le code désenveloppait `json.result` ; sur tout corps réel la valeur résolue était `undefined` ⇒ univers vide silencieux (fail-open), vert en CI. Preuve exigée : au moins un test par tuyau externe avec un corps de forme réelle (objet ET tableau nu quand l'API admet les deux), assertant `résolu === corps`.
- 2026-09-22 — **A-9 (le mot interdit dans la phrase réellement servie)** : tout grep d'interdit (« interval », probabilité, « verified » nu, etc.) porte sur la ou les phrases EFFECTIVEMENT servies dans l'état livré (registre vide, abstention, erreur), pas seulement sur la phrase nominale. Récidive fondatrice : U-4b-2a C-2 (checkpoint-2) — « interval » injecté dans `LIQ_EMPTY_REGISTRY_SENTENCE` (la seule phrase servie en -2a) survivait aux 794 tests. Preuve exigée : le mutant d'injection est rejoué sur CHAQUE constante servie du chemin livré, et sur `honestyText` (sortie composée), pas sur une constante intermédiaire.
- 2026-09-22 — **A-10 (liage de sortie sur surface servie)** : pour chaque valeur cablee vers une surface SERVIE (registre -> pilule, constante -> phrase, snapshot -> chiffre), un test non-LLM asserte que la SORTIE servie EGALE sa source (liage), pas seulement que « le code lit la bonne source » (entree) ni que « le jeton est present » (presence). Preuve exigee : un mutant qui PRESERVE la lecture et ALTERE la sortie (type-valide) est rejoue sur le chemin de l'artefact reel (build -> assertion) et rougit. Recidive fondatrice : SITE-RELEASE-1 X5 (checkpoint-2) — pilule Ukemi lisant `.status` mais inversant la valeur rendue survivait a G1 et G2 (composition executee, sortie non assertee).

- **A-11 (2026-09-22, pli NARABI-OPS-1d, C-V-5)** : tout harnais de mutants (`mutants.mjs`) lance `node --test --test-reporter=tap`, normalise CRLF, et n'accepte un mutant comme « tué » que si le TAP porte `not ok … - <nom du test tueur attendu>` (`byIntended`) ; un mutant rouge par un autre test seulement est signalé, jamais compté. Mesuré : le reporter par défaut sous win32 (pipe) n'émettait aucun nom de test rouge — l'attribution G1 n'était pas observée.

- **A-12 (2026-09-22, G2-delta NARABI-OPS-1d O-3)** : toute trace d'exécution produite hors oracle standard (docker, CI, sonde) porte un EN-TÊTE auto-identifiant — sha de l'arbre (`git rev-parse HEAD` ou `git get-tar-commit-id`), digest d'image/plateforme, version de node, commande exacte — et, pour un mutant, le diff de mutation, le sha du fichier muté et le sha de restauration ; un run CI est cité par son id de run et de job (jamais par le seul numéro de PR). Un extrait sans en-tête n'est pas une preuve R-21.
