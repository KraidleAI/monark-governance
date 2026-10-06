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

## Complément après la G2 (`docs/G2-lot-v1-spec-url-allow.md`, non bloquante)

Le périmètre s'élargit au repli des constats N-1, N-2, M-1 et M-2. N-1 et N-2 existaient déjà sur l'origine `KraidleAI/Monark` ; ils sont repliés ici plutôt que d'ouvrir un item, parce que la troisième origine en héritait.

- **N-1.** Une adresse admise est aussi testée sous sa forme résolue (`new URL(url).href`), ce qui résout `..` et `%2e%2e`. Une adresse que `URL` ne lit pas est refusée (fermé par défaut).
- **N-2.** Une adresse admise ne porte qu'un seul `://` : aucune adresse ne peut être imbriquée dans la requête ou le fragment.
- **M-1 et M-2.** Trois vecteurs de refus de plus : `https://example.org/<spec>`, `github.com/evil/monark-kata-spec` et `<spec>.evil.com`.

Deux tests neufs, chacun avec son tueur :
- `public_text_gate_resolves_dot_segments` ;
- `public_text_gate_refuses_a_url_nested_in_an_allowed_one`.

Ils sont rouges sur `e0ac3fc1` (commit `3ccc199b`) et verts au repli (`dcaff101`).
