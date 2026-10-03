# G0 du lot CM-1 : BYO-NEAR-NAME-1 (S-11)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` (ACCEPTÉ 2026-10-03), partie CM-1, ligne B-1 du §5 (et B-0, hérité de la base).
- **Base** : `404480e8` (`base/chantier-moteur-2026-10-03`). Auteur : RECHERCHES.
- **Point** : S-11 de l'audit P3. La garde anti-surcharge BYO (`apps/harness/src/tools/gate.ts:737-750`) compare des chaînes exactes : une classe ou une clé imitant une classe commise (casse, espace en tête ou en fin, adresse en casse de somme de contrôle) est acceptée en BYO et rend `commit` sous ce nom.

## Règle (B-1, telle qu'acceptée)

Sur le seul chemin BYO (`params.calibration` présent), avant tout calcul :
1. une `task_class` ou un `predictor_id` qui commence ou finit par un blanc (classe `\s` Unicode) rend un 400 nommé ;
2. la classe et la clé sont abaissées en minuscules **ASCII** (A à Z seulement) ; la garde refuse si :
   - la classe abaissée est une classe commise sur la CLASSE (`btc-dir-15m`, `cascade-liquidable-24h`, `liquidation-eligible-coverage`) ;
   - le couple (classe abaissée, clé abaissée) égale un couple commis abaissé (l'adresse `0x…` en casse de somme de contrôle tombe ici) ;
   - la classe abaissée suit le motif réservé des classes kata `^(btc|eth|bnb|sol)-(dir|range|mae-down|mae-up)-(1h|4h)$` ;
   - la clé abaissée commence par `kata:` ;
3. le message des cas déjà refusés aujourd'hui est inchangé octet pour octet ; les nouveaux cas portent un message qui nomme la règle.

Hors BYO, rien ne change : une classe inconnue rend déjà 400 (`gate.ts:797`).

## Tests (rouges à la base, `apps/harness/test/gate-byo-lookalike.test.ts`)

- T-1 : les neuf noms imitants de la sonde de MONARK ([S] §Priorité 1) rendent `HarnessToolError` ;
- T-2 : blancs en tête et en fin (espace, tabulation, U+00A0) sur la classe et sur la clé ;
- T-3 : motif kata réservé (casse quelconque) et préfixe `kata:` ;
- T-4 (garde du comportement) : un BYO honnête (`acme-model-x`, `acme-btc-dir-1h`, et une autre population sur `stable-run-velocity-24h`) reste en 200 avec un verdict identique ; les messages existants restent identiques.

Chaque test nomme son mutant tueur sur la ligne au-dessus.

## Résidu déclaré

Les homoglyphes non ASCII (par exemple un « с » cyrillique dans `btс-dir-15m`) ne sont pas abaissés et passent, mais seulement en appel direct de `runGate` : au servi, le schéma gelé `prediction.schema.json:11,13` (`^[ -~]+$`, `minLength 1`), appliqué par `http.ts:91` et par la frontière MCP, les refuse déjà en 400 (mesuré par la G2). Il refuse aussi la tabulation et U+00A0 : au servi, seule l'espace ASCII en tête ou en fin atteint la garde, et les cas tabulation et U+00A0 de T-2 ne valent que pour l'appel direct. BYO-HOMOGLYPH-1 se réduit donc à l'appel direct de `runGate` (hors contrat) et ne demande aucun changement servi.

## Taille et sortie

Environ 40 lignes de code (`gate.ts`, `calibration.ts`) et 150 de tests ; une PR, R-25 sous 1 150. Oracle : `npm run typecheck`, `npm test` (le seul échec toléré est `bell-served.test.ts:153` dans un clone superficiel). Revue G2 par une instance neuve, puis G7 ; déploiement par MONARK sur le sha donné, après le go de l'investisseur.
