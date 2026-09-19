# ADR-EC — Lots « E-coûteux » : fermeture des écarts P1 avant release, cartographie générale, zéro dette
- **Statut** : **proposé (G0)** — plan approuvé par l'investisseur le 2026-09-19 (« ok plan ») ; checkpoint-1 validateur en cours.
- **Décision investisseur fondatrice (verbatim, 2026-09-19)** : « le prochain release doit sortir sans aucune dette, même pas un point virgule, cartographie générale avant release, on s'assure que tout fonctionne, tout est branché, aucune dette n'est laissée. » Complète la décision 19 (release gate zéro dette) et ADR-M018 D4 (cartographie à chaque clôture de phase).
- **Rattachement** : `docs/RAPPORT-PASSE-P1-2026-09-19.md` §3.c (items E1-E10 formés avec déclencheur), `docs/CARTOGRAPHIE-P1-2026-09-19.md`, ADR-M017 (D3 skill/DEMO, D4 tests nommés), ADR-M018 (D1 built ⇔ branché, D3 tuyaux, D4 cartographie), ADR-M019 (1) h5 `attested`, ADR-W1 (b) rendu `wiring`, ADR-M013 (régimes T0/T1/T2), ADR-M003 D9 (R-25), CHANTIERS §E.
- **Provenance** : rédigé par l'orchestrateur `claude-fable-5-1` le 2026-09-19 ; aucun code écrit ; mesures citées relues dans le code à HEAD `lot/etude-suite` `8c20ab4`.

## Contexte (mesuré à `8c20ab4`)
| Écart | Où (mesuré) | Nature |
|---|---|---|
| E7 « verified » surclaim ×6 | `README.md:48,111,112` ; `apps/site/components/shogen-panel.tsx:51,57,63` | prose publique (Shōgen atteste l'origine et le hash, jamais la vérité — ADR-M017/M012 D4) |
| skill/DEMO (ADR-M017 D3) | `skills/monark/{SKILL,DEMO,INTEGRATION}.md` | description `{prediction, params}` + prise `attested` à décrire honnêtement |
| E8 `MONARK_PHASE` export mort | `packages/monark/src/index.ts:23` | constante sans consommateur (census 1) |
| E3 garde `TEST_ROOTS` sans `packages/*/test/` | `test/ci-gates.test.ts:637` | exclusion non documentée |
| E5/R1 hygiène de dépendances | `eslint.config.mjs`, `package.json` des workspaces | aucune règle `import/no-extraneous-dependencies` ; recherche jointe RAPPORT P1 §3.b |
| CRA/ENISA (G6) | — | veille de compliance non faite (audit d'entrée, template corpus) |
| E2 registre : 1 `integration_test` pour N jambes | `apps/site/lib/fleet.ts` (Hikae, Narabi) | modèle `wiring.integration_test` scalaire |
| E10 snapshot Narabi committé en retard | `apps/site` (fixture Narabi T=0) vs live (T=1, `c4d05af`) | re-capture + re-sha |
| E6 rendu `wiring.served_by` (trou numérique) | `apps/site` (tripwire + scan) | note honnête sans chiffre, ADR-W1 (b) |
| E1 étape h5 portant `attested` | `apps/harness` (fil MCP `attest → gate`) | aucun appelant réel ne prouve la prise |
| E9 région `label_schema:"up|down"` sur classe numérique `cascade-liquidable-24h` | `apps/harness/src/tools/gate.ts`, région committée, h5 | octet servi malhonnête ; re-pin h5 |
| K-1 clés Ed25519 | Narabi sert `attestor.key:"deadbeef"` (`packages/monark/src/flow.ts:52`) | placeholder public ; préalable U-6 / T-1b / tout `built` de sentinelle |

## Décision
**D1 — Quatre lots, chacun < 1 205 lignes R-25, un worktree chacun, worker `claude-opus-4-8` max, G2 fraîche + checkpoint-2 chacun, aucun registre `fleet.ts` modifié hors G7.**
| Lot | Contenu | Régime site (M013) | Ordre | Estimation |
|---|---|---|---|---|
| **E-honnêteté** (`lot/e-honnetete`) | E7 ×6 (formulation : « attested testimony — origin and bytes, not truth ») ; skill/DEMO (M017 D3) ; E8 retrait ; E3 documentation de l'exclusion (commentaire + test nommé) ; E5 règle eslint `import/no-extraneous-dependencies` + test `deps_hygiene` (le fichier `test/deps-hygiene.test.ts` existe : l'étendre, ne pas dupliquer) ; CRA/ENISA = `docs/AUDIT-ENTREE-2026-09-19.md` (template corpus, item de compliance) | **T0** (prose) | maintenant, ∥ U-1b-a | ≈ 300 l. |
| **E-registre** (`lot/e-registre`) | E2 : `wiring.integration_test` devient liste (une par jambe) dans `fleet.ts` + test de gel `fleet_register_built_set_is_frozen` re-pinné ; E10 : re-capture du snapshot Narabi live + re-sha PROVENANCE same-dir ; E6 : note honnête sans chiffre pour `served_by` (avec le `designer` pour le rendu, W1 (b)) | **T2** (`fleet.ts` touché) — commit `site[T2]` | maintenant, ∥ E-honnêteté (fichiers disjoints : `apps/site/lib/fleet.ts`, fixtures Narabi, composant `wiring`) | ≈ 400 l. |
| **H-attested** (`lot/h-attested`) | E1 : un appelant réel de la prise `attested` = étape h5 portant `AttestedPrice` (fixture Shōgen committée), test d'intégration non-LLM `h5_carries_attested` ; E9 : région de classe numérique `label_schema:"numeric"` pour `cascade-liquidable-24h` (précédent ADR-M019 D2 amendé) + re-pin h5 (`PROVENANCE-h5` same-dir) | — (harness) | **après U-1b-a** (pas de croisement `packages/contracts`) ; sérialisé avec les autres lots harness (U-4 ensuite) | ≈ 500 l. |
| **K-1** (`lot/k-1-keys`) | clé Ed25519 réelle du recorder : génération HORS dépôt (runbook, clé privée sur le VPS seul), `attestor.key` publique committée + servie `/narabi/pubkey`, signature de la forme canonique (`sig`) sur Narabi, test `no_secret_in_repo` étendu, rotation documentée (`RUNBOOK-sentinel.md`) ; Bell réutilise le motif (ADR-B0 D8, clé séparée) | **T0/T1** (page `/narabi/pubkey`) | après E-registre (touche `apps/site`) | ≈ 350 l. |

**D2 — Cartographie générale pré-release (M018 D4)** : après atterrissage des quatre lots + U-1b-a sur `lot/etude-suite`, un worker en **contexte frais** produit `docs/CARTOGRAPHIE-PRE-RELEASE-<date>.md` : graphe réel (imports mesurés `madge`/grep + flux à l'exécution) de toutes les pièces, statut « câblé / fixture / absent » par paire, comparé au registre public (`fleet.ts`, README, site, skills) ; **tout écart = dette au sens de la règle Dettes, corrigée avant release** ; puis checkpoint validateur CA-11 sur la cartographie ; puis release (tag, miroir public via `release-public.mjs`).

**D3 — Définition de « zéro dette » pour cette release** : CHANTIERS §E ne contient plus aucun item dont le déclencheur est antérieur ou égal à la release ; les items dont le déclencheur est postérieur (U-4, U-6, T-1b…) restent formés **et sont listés nommément dans les notes de release** comme « upcoming » avec leur déclencheur — jamais un « dû » nu. Items **hors de notre main** (ratifications D-ADJ / bFloor ; census Bell 839+395 + flux MWCB ; Helius ; VPS) : bloquants tant que non tranchés par l'investisseur ; la release ne sort pas sans.

**D4 — R-25 de la PR d'intégration** : hors de cet ADR (décision investisseur (a)/(b)/(c) due, BASCULEMENT §5.10) ; les quatre lots sont chacun sous 1 205.

## Tuyaux (ADR-M018 D3)
| Lot | Entrée | Sortie / consommateur servi | Test d'intégration non-LLM |
|---|---|---|---|
| E-honnêteté | prose | README, site, skill (surfaces publiques exportées) | `site-honesty.test.ts` (scrub « verified » étendu), `export:check`, `gate:vocab` |
| E-registre | `fleet.ts` | site `/fleet` (registre servi), freeze test | `fleet_register_built_set_is_frozen` re-pinné ; `narabi-live.test.ts` (snapshot = live) |
| H-attested | fixture `AttestedPrice` | h5 → `gate` (prise `attested` consommée) | `h5-e2e-probe.test.ts` étendu : `h5_carries_attested` ; région numérique servie |
| K-1 | clé publique | `/narabi/pubkey` servi + `sig` sur chaque ligne Narabi | `narabi-live.test.ts` : vérification de signature sur le live |

## Alternatives rejetées
- Tout fermer dans un seul lot : R-25 > 1 205 et deux régimes site mélangés. Rejeté.
- Reporter E1/E9 à U-4 : laisserait deux écarts « avant release » ouverts ; U-4 est postérieur à la release. Rejeté (H-attested tiré en avant).
- Cartographie par l'orchestrateur : générateur = relecteur (règle §F). Rejeté : worker en contexte frais.

## Conséquences
- Positives : release avec CHANTIERS §E vide de tout item au déclencheur ≤ release ; registre public vrai (M018) ; clés réelles.
- Négatives (assumées) : 4 G2 + 4 checkpoints ; `fleet.ts` touché (T2) ; K-1 exige une action investisseur (clé privée sur le VPS, hors dépôt).
- Items formés : ratifications, census Bell, MWCB, Helius, VPS (investisseur) ; U-1b-b, U-2…U-7, T-1a-ii, T-1b…T-3 = upcoming, déclencheurs nommés dans CHANTIERS.

## Points à trancher (checkpoint-1)
- (P1) Formulation exacte de remplacement de « verified » (proposée : « attested (origin + bytes), never truth ») — validateur.
- (P2) E2 : liste `integration_test[]` vs un test unique agrégé par jambe — proposé : liste.
- (P3) K-1 : qui détient la clé privée (ESC-2 (a) : orchestrateur déploie, clé sur l'hôte) — déjà tranché pour Bell, à confirmer pour Narabi.
