# G7 du lot V-1 : `public-text-deny` admet le dépôt de la spécification

- **Base** : `ec0e023d`. **Tête de code** : `dcaff101`. **Branche** : `recherches/v1-spec-url-allow`.
- **G0** : `docs/G0-lot-v1-spec-url-allow.md`, avec son complément d'après G2. **G2** : `docs/G2-lot-v1-spec-url-allow.md`, non bloquante, repliée.

## Commits

| Commit | Contenu |
|---|---|
| `c763314f` | G0 et test rouge `public_text_gate_admits_the_spec_repository` |
| `e0ac3fc1` | `URL_ALLOW` gagne la troisième origine ; le commentaire l.12 dit « three » |
| `3ccc199b` | repli de la G2 : tests rouges (`..` résolu, adresse imbriquée, trois refus de plus) |
| `dcaff101` | repli de la G2 : une adresse admise l'est aussi sous sa forme résolue (`new URL`), avec un seul `://` |

## Mesures

- **red-proof** (`--base ec0e023d --gel dcaff101 --draw 3 --seed 37`) : OK. Trois tests jugés (F2P), quatre inchangés, trois tueurs tirés, trois tués.
- **Tueurs tirés à la main**, avec contrôle de la restauration par sha256 :
  - l.117 : l'alternative retirée rougit l'admission ;
  - l.119 : sans la règle d'un seul `://`, le test de l'adresse imbriquée rougit ;
  - l.120 : sans la forme résolue, le test des segments `..` rougit.
- **Ancres** : 3 tueurs, 3 ANCRE, 0 DERIVE, 0 PERDU.
- **R-25** : STAT 36 insertions, 3 suppressions, 39 changées (borne 547 par lot) ; CONTENT_STAT 0 ; GREEN.
- **Suites qui importent la porte** (`public-text-deny`, `release-public-flow`, `export-public`, `site-build-fleet`, `dojo-page`, `dojo-served`) : 58 sur 58 à `e0ac3fc1`. `public-text-deny` seul, 7 sur 7 à `dcaff101`.
- **Contrôles statiques** : `tsc --noEmit`, `lint:ratchet`, `gate:vocab` et `lang:gate` à 0. `eslint` ignore `scripts/public-text-deny.mjs` par configuration ; le test passe `eslint`.
- **`test:main`** : résultat dans le message de la PR. La CI le rejoue.
- **Octets servis** : aucun. Le fichier est réservé à la gouvernance (hors de la liste blanche de `export-public.mjs`) et n'est pas dans le graphe du harnais.
- **Windows** : tests purs, sans fichier ni chemin, sans saut.

## Résidus

- Aucun constat de la G2 ne reste ouvert : N-1, N-2, M-1 et M-2 sont repliés ; N-3 (drapeau `i`) est accepté tel quel, comme pour `KraidleAI/Monark`.
