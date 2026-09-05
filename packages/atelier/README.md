# @monark/atelier — écran de démo local (Phase 1, Lot D)

Atelier **local** (ADR-M002 D0/D1, cap hackathon) : une page servie sur `127.0.0.1` qui **rejoue les
9 états gelés** de `fixtures/` racine — verdict de couverture, décision **COMMIT / DEFER / ABSTAIN** avec
sa raison, **B_t qui se consomme**, **deux horloges**, et la chaîne **Shōgen → HIKAE → UKEMI** en trois
panneaux. Conçu pour le stream de jugement. Inspiré de l'atelier Grok (input), **code le nôtre**.

```bash
npm run atelier --workspace @monark/atelier
```

## Ce que l'écran dit — et ne dit pas

- **Deux horloges, nommées pour ce qu'elles sont sur fixtures** : « couverture avant décision »
  (horodatage du verdict) et « label arrivé à t+w » (w = 15 min, beachhead `btc-dir-15m`, D8). L'explication
  « avant l'ordre / après le fill ; le kill-switch n'est pas un stop-loss » vit **ici et dans l'ADR, pas dans
  le rendu** : MONARK ne passe aucun ordre.
- **B_t** est la capacité d'autorisation restante (ADR-CERT-MONARK) — **jamais un rendement**.
- **Silence calibré = résultat** : 3 COMMIT / 2 DEFER / 3 ABSTAIN / 1 `under_calib`, tous visibles.
- **UKEMI** est affiché **non branché** (Phase 1) — rien n'est simulé à sa place.
- **Aucun mot du gate vocab** à l'écran : le paquet entier **et** le rendu passent `scripts/grep-forbidden.mjs`
  (test 26, mutant vérifié).

## Architecture (zéro dépendance, zéro réseau)

| Fichier | Rôle |
|---|---|
| `src/state.ts` | **état pur** depuis une `GateDecision` gelée (`@monark/contracts`, closed-check avant tout rendu) |
| `src/render.ts` | **rendu pur** en chaînes HTML (testable en node, sans DOM) |
| `src/fixtures-loader.ts` | lecture disque des 9 états racine |
| `src/market-stubs.ts` | `perps_order_preview` / `perps_order_execute` : **lèvent** s'ils sont invoqués |
| `serve.js` | serveur `node:http` local ; rend côté serveur, sert `index.html` / `style.css` / `main.js` |
| `main.js` | glue DOM minimale (bascule d'état) — **aucune donnée, aucun `fetch`** |

Le `tsconfig.json` du paquet ajoute `lib: DOM` sans toucher la racine (D13) ; les modules TS restent
sans DOM, ce qui les rend typables et testables par la racine.

## Tests (ADR-M002 D11, Lot D)

24 `atelier_state_oracle` · 25 `atelier_replays_root_fixtures` · 26 `atelier_no_forbidden_vocab` ·
27 `perps_stubs_throw` · 28 `atelier_no_network`. Les moteurs H et U sont consommés **par contrat**
(fixtures) ; ils se branchent à leur merge.
