# G7 du lot P1-b1 du chantier L2 : client REST de l'enregistreur

- **Plan** : `docs/G0-lot-l2-p1-b1.md` ; ligne P1-b1 de `docs/G0-partie-l2-p1.md` §8.2. **Base** : `f5596bf3` (`origin/lot/l2-p1-a1`).
  Branche `recherches/l2-p1-b1`. Commits : `a629f2a` (G0), `6d8da91` (tests rouges), `fe70787` (code, **gel**).

## Oracle

- `node scripts/red-proof.mjs --base f5596bf3 --gel fe70787 --repo /home/user/monark-governance-l2 --draw 8 --seed 37` : **OK**, 8 tests
  jugés F2P (rouges par assertion à la base : import dynamique affirmé), 8 tueurs tirés, 8 tués. Chaque tueur vérifié tué aussi à la main.
- `npx tsc --noEmit` vert ; eslint vert sur `test/l2-rest.test.ts` (la configuration ignore `scripts/**/*.mjs`, comme pour les
  enregistreurs existants) ; `gate:vocab`, `lint:ratchet` 69/69 verts. Tests L2 : 16/16 (8 de la place factice, 8 neufs).
- R-25 : 3 fichiers, +413/−0, soit **413 lignes comptées**, sous 547 (plan : 274 à 358).

## Autocontrôle

- Aucun réseau : la place factice de boucle locale et un message publié à la main sur le canal ; `fetch` et `WebSocket` globaux pris
  au piège dans le fichier de test.
- Aucune adresse journalisée : le test publie un socket portant deux adresses et vérifie leur absence de `requests.jsonl` ; le code ne
  lit ni `connectParams` ni le socket au-delà de `getPeerCertificate()`.
- Corps gardé avant lecture : `exchangeInfoFacts` et `logTimeOffset` lisent le corps rendu après son écriture ; un corps illisible
  reste gardé (test 1).
- Aucune valeur de marché ni trame réelle : valeurs synthétiques.
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` présent dans le worktree n'est pas commis.

## Écarts au plan

- Taille : c 153 (en-tête de discipline compris), d 81, t 179 contre c 100, d 31, t 143 à 227 ; total sous 547.
- `Retry-After` absent ou illisible : 60 s (Q-B1-2).
- SERIES-TLS-PEER-LOG-1 prouvé ici sur un message de test du canal seulement ; la preuve sur la place reste à M-1 (§9 du plan).
- FAITS-L2-ACCESS-3 (d) et (f), prérequis du G1, absents : les noms de clés lus d'`exchangeInfo` sont à confirmer (Q-B1-1).

## Sortie

Prêt pour le contrôle par diff de MONARK et la G2 de la partie P1.
