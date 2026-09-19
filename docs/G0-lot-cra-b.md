# G0 — Sprint backlog lot CRA-B : items « sans regret » du règlement UE 2024/2847 (avis advisor 2026-09-19, voie B, décision investisseur 29/35)
Orchestrateur `claude-fable-5-1`, 2026-09-19. Base : `lot/etude-suite` (HEAD du moment du lancement). Branche `lot/cra-b`, worktree `F:\Monark-wt-crab`. Cadre : `docs/AVIS-ADVISOR-CRA-2026-09-19.md` §4 (7 items sans regret), `docs/AUDIT-ENTREE-CRA-2026-09-19.md`, décision 24 (escalade compliance), décision 21 (surface publique = bloquant), règle Branchement (frontière produit = cartographie). KraidleAI = company, USA (décisions investisseur). Déclencheur : avant la cartographie pré-release (SBOM et SECURITY.md sont des surfaces publiques). Régime site : **T0** si la page `/security` est reportée (voir L-1), sinon T2 (`apps/site`, commit `site[T2]`).

## Objectif (une phrase)
Rendre MONARK prêt à l'article 14 (notification) et à la divulgation coordonnée sans attendre l'avis du juriste, par des artefacts publics vérifiés en CI, sans affirmer que le CRA s'applique ni qu'il ne s'applique pas.

## Livrables (liste fermée)
| # | Fichier | Contenu | Test / oracle |
|---|---|---|---|
| L-1 | `SECURITY.md` (racine, anglais) | canal de divulgation coordonnée (adresse e-mail dédiée **à fournir par l'investisseur** — placeholder interdit : si absente au G1, le fichier nomme le formulaire GitHub « Report a vulnerability » / Security Advisories comme canal unique), périmètre (dépôt public, service hébergé `monarkgate.tech`), délais d'accusé de réception (72 h) et de réponse, politique de divulgation (90 j), versions supportées (`HARNESS_VERSION` courante), **aucune promesse de prime**, aucune formule probatoire (« secure », « certified ») ; renvoi vers `docs/PROCEDURE-notification-CRA.md` | test racine `security_policy_present_and_closed` : fichier présent, sections nommées présentes (Reporting, Scope, Timelines, Supported versions), scrub PROBATIVE (`public_surfaces_make_no_probative_claim` étendu à `SECURITY.md`), mutant « section Reporting retirée » ⇒ rouge |
| L-2 | `docs/PROCEDURE-notification-CRA.md` (interne, français admis ? **non** : dépôt public ⇒ anglais) | horloge art. 14 : alerte précoce 24 h, notification 72 h, rapport final 14 j (vulnérabilité activement exploitée) / 24 h + 72 h + 1 mois (incident grave), plateforme unique ENISA + CSIRT national ; qui déclenche (mainteneur), quoi transmettre, où consigner (`docs/JOURNAL-PROVENANCE.md` ligne datée) ; **texte conditionnel** : « if MONARK is in scope as a manufacturer » ; références aux articles cités [lu] dans l'audit d'entrée | lang-gate (anglais) ; test `notification_procedure_declares_clocks` (les trois délais présents, mutant « 72 h → 7 days » ⇒ rouge) |
| L-3 | SBOM en CI | job `g6-compliance` : `npm sbom --sbom-format cyclonedx --omit dev` → artefact `sbom.cdx.json` uploadé par run (`actions/upload-artifact`), **et** script `scripts/sbom.mjs` qui le génère localement ; à la release : joint au tag (déclencheur release, hors lot) | test `ci_publishes_sbom` (le job contient l'étape nommée, mutant retirée ⇒ rouge) ; `npm sbom` exécuté localement sans réseau, sortie validée (JSON, `bomFormat: CycloneDX`, ≥ 1 composant) |
| L-4 | `docs/PRODUCT-BOUNDARY.md` (anglais) | frontière produit = ce qui est distribué (paquets exportés `scripts/export-public.mjs`, image/binaire éventuel, service hébergé) vs ce qui ne l'est pas (docs de gouvernance, fixtures) ; tableau composant → distribué ? → surface (site, MCP, HTTP) → responsable ; alimenté par la cartographie de branchement existante (`fleet.ts` `wiring`) | test `product_boundary_matches_export_list` : chaque entrée `exported` de `export-public.mjs` figure dans le tableau (mutant : ligne retirée ⇒ rouge) |
| L-5 | Déclaration « no personal data required » | dans `SECURITY.md` §Data et `README.md` (une phrase) : le harness ne demande ni ne stocke de donnée personnelle ; **mesuré** par le worker : grep `email|name|ip|user` dans `apps/harness/src`, `apps/site`, `skills/` → chaque hit qualifié (aucun champ personnel collecté ; logs = domaines de fournisseurs) | test `no_personal_data_fields_in_served_schemas` : aucun champ `email|phone|address|ip|user_id` dans `schemas/*.json` ni dans les schémas projetés MCP |
| L-6 | Template G6 du corpus | `C:\Users\KACIMI\compiliance et ingénierie locielle et architecturale\templates\` : corriger le template G6 (échéance notification « 11/09/2026 » présentée comme passée → conditionnelle à l'applicabilité) — **hors dépôt**, plié par l'orchestrateur, pas le worker | — |
| L-7 | `docs/adr/ADR-CRA-B.md` | contexte (audit + avis advisor), décision (voie B), alternatives (A maintenant ; rien), conséquences, **tuyaux** : `SECURITY.md` → GitHub (surface publique servie par GitHub, test L-1), SBOM → artefact CI (test L-3) → release (déclencheur), procédure → journal ; questions au juriste reprises telles quelles (§5 de l'avis) | doc (0 R-25) |

## Critères d'acceptation
1. Aucune affirmation d'applicabilité ou de conformité au CRA (« compliant », « certified », « in scope ») : formulations conditionnelles ; scrub probatoire vert sur les nouveaux fichiers.
2. `npm run ci` = base + 5 tests verts ; lint 0 ; ratchet 69/69 ; lang-gate 0 (tout en anglais, y compris L-2) ; export:check 0 ; `npm sbom` local produit un CycloneDX valide.
3. Mutants : 5 (un par test) rouges, restauration prouvée.
4. R-25 ≤ 400 (docs `docs/**/*.md` exclus ; `SECURITY.md` racine, tests, `ci.yml`, script comptent).
5. CA-11 : aucun composant nouveau ; `fleet.ts` inchangé ; surfaces publiques ajoutées = `SECURITY.md`, `README` (une phrase), déclarées dans l'ADR avec leur test ; page `/security` du site **reportée** à un lot site (T2) — item formé, déclencheur CI-site.
6. Aucun secret, aucune adresse e-mail inventée ; si l'investisseur ne fournit pas d'adresse, canal GitHub seul, dit explicitement.

## Hors périmètre
Avis juriste (avant premier accès payant, décision 35) ; voie A (steward/fabricant déclaré) ; page `/security` du site ; publication de la SBOM sur le tag (release).

## Tuyaux (ADR-M018 D3)
`SECURITY.md` → lu par GitHub (onglet Security) et par les chercheurs ; procédure → journal de provenance ; SBOM → artefact CI par run → release. Tests L-1..L-5.

## Risques (MAST)
Formule qui affirme la conformité (contre-mesure : scrub + relecture G2) ; e-mail placeholder (interdit) ; SBOM générée mais jamais publiée (contre-mesure : déclencheur release nommé) ; procédure en français dans un dépôt public (lang-gate).

## Rôles
Worker Opus 4.8 (G1) → G2 fraîche → checkpoint-2 → G7 → fusion. Checkpoint-1 : validateur avant tout code. Dû investisseur au G1 : **adresse e-mail de divulgation** (ou confirmation « GitHub seul »).
