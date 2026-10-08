# FAITS : `**` et `Math.pow`, spécification et V8 de Node 24.21.0 (lecture pour Q-V3 de PXC-02, demande 10 (a) de l ADR v3)

MONARK (Opus 5.5), navigateur interne, lu le 2026-10-08 de 09:56 à 10:04 UTC (`now.mjs`). Niveau **[lu]**, pages primaires.

## Spécification : ECMA-262, 17e édition (juin 2026), `https://262.ecma-international.org/17.0/`
- §6.1.6.1.3 `Number::exponentiate` : « It returns an implementation-approximated value representing the result of raising base to the
  exponent power. » Les étapes ne fixent que les cas limites (NaN, zéros, infinis).
- §21.3.2.27 `Math.pow` : `ToNumber` des deux opérandes, puis `Return Number::exponentiate(base, exponent)`. C est la même opération que
  `**`.
- §21.3.2, note : pour `pow` et les autres fonctions de `Math`, « some latitude is allowed in the choice of approximation algorithms ».
- §4.2, « implementation-approximated » : la définition est renvoyée à une source externe ; les implémentations conformes choisissent
  librement.
- **Réponse** : la spécification ne fixe pas le résultat. Elle le laisse à l implémentation, hors des cas limites.

## V8 tel que l embarque Node 24.21.0 (`process.versions.v8` = `13.6 (révision 233.17, build node.53)`)
- `src/numbers/ieee754.cc` au tag `13.6 (révision 233.17)`, fonction `v8::internal::math::pow`.
  - Si `v8_flags.use_std_math_pow` est vrai : NaN et `±1 ** ±∞` sont traités à part, puis `y == 2` rend `x * x` et `y == 0.5` rend
    `std::sqrt(x + 0)` ; sinon **`return std::pow(x, y);`**.
  - Sinon : `base::ieee754::legacy::pow(x, y)`, l implémentation propre de V8 (`src/base/ieee754.h` l.83-96, espace `legacy`).
- `src/flags/flag-definitions.h` l.1029 au même tag : `DEFINE_BOOL(use_std_math_pow, true,`. Sur ce poste, `node --v8-options` donne
  « use std::pow instead of our custom implementation », `default: --use-std-math-pow`.
- **Réponse** : sous Node 24.21.0, `**` et `Math.pow` appellent le `std::pow` de la bibliothèque C de la machine. Hors des cas `y == 2`
  et `y == 0.5`, le résultat dépend donc de cette bibliothèque : glibc sous Linux, CRT de Microsoft sous Windows, libm de macOS. Même
  version de Node ne veut pas dire même nombre sur toute machine. Rien dans ces sources ne garantit l égalité au bit près entre deux
  plates-formes.

## Mesure jointe (Windows 10, Node 24.21.0, ce poste), pour une comparaison sous Linux
Octets IEEE 754 (petit-boutiste, en hexadécimal) de `a ** b` :
| a | b | résultat | octets |
|---|---|---|---|
| 1.0000001 | 1e7 | 2.7182816941320818 | `f2e60c790abf0540` |
| 2.5 | 3.7 | 29.67413253642086 | `dd182df393ac3d40` |
| 10 | -7.3 | 5.011872336272725e-8 | `e0a8b8cf43e86a3e` |
| 0.9999 | 12345.678 | 0.2909425271540516 | `851ac967cd9ed23f` |
| 1.5 | 0.3333333333333333 | 1.1447142425533319 | `f582b0e1bf50f23f` |

Une égalité sur ces cinq cas ne prouverait rien en général. Une différence suffirait à prouver l écart.

## Conséquence pour Q-V3
Les deux réponses de la demande sont « non ». Q-V3 reste donc (c). La promesse de rejeu ne peut revenir (a) que si chaque ligne
enregistre aussi la plate-forme et la bibliothèque C, et si le rejeu se fait sur la même. Ou bien si le calcul n utilise plus `**` ni
`Math.pow` sur des valeurs qui finissent dans la ligne publiée, par exemple avec une puissance entière par multiplications, ou un calcul
en entiers.
