# G0 du lot V-1 : `public-text-deny` admet le dépôt de la spécification

- **Base** : `base/chantier-moteur-2026-10-03` = `ec0e023d`. **Branche** : `recherches/v1-spec-url-allow`. Cible : la base, avant SURFACES-1-1-0.
- **Acte** : décision de porte de MONARK (message `d0f39ea` de la messagerie RECHERCHES, « Acte de porte V-1 »). La note de version 1.1.0 et le message servi `apps/harness/src/tools/gate.ts:902` nomment `https://github.com/KraidleAI/monark-kata-spec`, public depuis le 2026-10-01 ; l'investisseur a confirmé son usage le 2026-10-05.

## Périmètre fermé

| Fichier | Ce qui change |
|---|---|
| `scripts/public-text-deny.mjs:117` | `URL_ALLOW` gagne une troisième origine, `^https:\/\/github\.com\/KraidleAI\/monark-kata-spec(?:[/?#]|$)`, même forme et même drapeau `i` que `KraidleAI/Monark` |
| `scripts/public-text-deny.mjs:12` | commentaire : « the two public origins » devient « the three public origins » |
| `test/public-text-deny.test.ts` | un test neuf, `public_text_gate_admits_the_spec_repository` |

Rien d'autre ne change dans la porte. Le fichier n'est pas exporté (liste blanche de `export-public.mjs`), aucun octet servi ne bouge.

## Test rouge et tueur

- `public_text_gate_admits_the_spec_repository` :
  - admis : l'adresse nue, `/blob/main/KATA-SPEC.md`, `#x`, `?y`, la même adresse en casse mêlée (drapeau `i`, comme pour `Monark`) ;
  - refusés par la règle (g) : `…/monark-kata-spec-x`, `…/monark-kata-specs`, `…/monark-kata`, `http://…`, `…/recherches`, `…/monark-governance`.
- Rouge à la base par assertion (l'adresse nue rend `g`).
- Tueur : `// killer: scripts/public-text-deny.mjs:117 CONST "|^https:\/\/github\.com\/KraidleAI\/monark-kata-spec(?:[/?#]|$)" -> ""` : retirer l'alternative fait rougir le cas admis.

## Preuve prévue

red-proof (`--draw n`), ancres, R-25 (ordre de 20), `test/public-text-deny.test.ts` et les suites qui importent la porte (`release-public-flow`, `export-public`, `site-build-fleet`, `dojo-page`, `dojo-served`), `test:main`, tsc, eslint, `lint:ratchet`, `gate:vocab`, `lang:gate`. Windows : test pur, sans fichier ni chemin.
