# ADR-CODEQL-ALERTS-1 — Remédiation des 25 alertes CodeQL ouvertes sur `main` (2026-09-24)

- **Statut** : proposé (G0) — checkpoint-1 validateur dû avant tout code (R-22).
- **Rattachement** : ADR-M004 D7 (surfaces publiques, CRA-B : SECURITY.md, SBOM), ADR-M003 D11 (workflow bloquant, test 38), ADR-GARDE-HELIUS (transport `rpc-guard`), Lot CI-site (`scripts/assert-fleet-html.mjs`). Décision investisseur 169 / fenêtre publique du 2026-09-24 : la PR #89 a déclenché l'analyse CodeQL (configuration par défaut GitHub, langages actions + javascript-typescript) qui a versé 20 alertes nouvelles ; après fusion, `main` porte **25 alertes ouvertes** (19 `high`, 6 `medium`), listées ci-dessous (lecture API `code-scanning/alerts?ref=refs/heads/main`, 02:2x UTC).
- **Motif** : règle Dettes (aucune dette de sécurité nue) ; le dépôt de gouvernance est public pendant les fenêtres de push ; le check CodeQL (non requis) est rouge sur chaque PR tant que ces alertes existent.

## Inventaire (numéro d'alerte GitHub · règle · fichier:ligne · nature)
| # | Sévérité | Règle | Emplacement | Nature réelle |
|---|---|---|---|---|
| 25, 26 | high | `js/incomplete-hostname-regexp` | `packages/rpc-guard/src/transport.ts:41-42` | **runtime** : motif d'hôte avec `.` non échappé (`drpc.org`, `mevblocker.io`) — un hôte `drpcXorg` matcherait ; classification `providerOf` |
| 27, 28, 29 | high | `js/bad-tag-filter`, `js/incomplete-multi-character-sanitization` ×2 | `scripts/assert-fleet-html.mjs:61,70` | **script CI** : retrait de `<script>` / `<!-- -->` par regex avant contrôle du HTML rendu ; le HTML n'est pas servi par ce script, mais un filtre incomplet fausserait le contrôle |
| 13-24 | high (12) | `js/incomplete-url-substring-sanitization` | tests : `apps/bell/test/{bell-adv-1:344, guard-collect-1bii:191, universe:558,747}`, `apps/harness/test/gate-liq:251`, `apps/sentinel/test/{sentinel-retry:266, ukemi-guard-record:725,783,834}`, `test/{probe-narabi:322, u3-realized-param:267,287}` | **tests** : assertions `url.includes("host")` là où l'intention est « l'hôte de l'URL est exactement X » — faux positif de sécurité, mais assertion faible (un stub avec `evil.com/?x=chainstack.com` passerait) |
| 31 | high | `js/regex-injection` | `apps/bell/test/helpers/bell-served.ts:171` | **helper de test** : `new RegExp(valeur)` sans échappement |
| 30 | high | `js/stored-xss` | `test/bell-caddy.ts:213` | **helper de test** : valeur lue d'un fichier réinjectée dans un HTML de contrôle |
| 7-12 | medium (6) | `actions/missing-workflow-permissions` | `.github/workflows/ci.yml:23,35,108,122,135,161` | **workflow** : aucun bloc `permissions` — le `GITHUB_TOKEN` garde les droits par défaut du dépôt |

## Décision
### D1 — Workflow : `permissions: contents: read` au niveau du workflow
Un seul bloc `permissions:` en tête de `ci.yml` (`contents: read`) ; les jobs qui téléversent un artefact (SBOM, CRA-B) n'ont besoin d'aucun droit supplémentaire (`actions/upload-artifact` écrit dans les artefacts du run, pas dans le dépôt). Aucun `if:` (test 38). Le workflow public dérivé (`scripts/export-public.mjs` strippe les jobs internes) hérite du bloc. Test racine : `ci_workflow_declares_least_privilege_permissions` (bloc présent, `contents: read`, aucun `write`).
### D2 — `transport.ts` : classification d'hôte par analyse d'URL, pas par regex
`providerOf`/la classification des fournisseurs compare `new URL(u).hostname` à une liste fermée d'hôtes (égalité ou suffixe `.` + domaine), jamais une regex sur la chaîne brute. Sémantique inchangée pour les URL réelles (tests existants de `rpc-guard` verts) ; mutant : `drpcXorg` ⇒ non classé.
### D3 — `assert-fleet-html.mjs` : extraction de texte sans regex de balises
Le contrôle du HTML rendu (`/fleet`, `/ukemi`) extrait le texte par un tokenizer minimal maison (scan caractère par caractère : balises `<…>` fermées au premier `>`, blocs `<script`/`<style` fermés au premier `</script`/`</style` insensible à la casse et aux espaces avant `>`, commentaires `<!--` fermés au premier `-->`) — sans dépendance nouvelle (R-8), avec tests unitaires sur les cas CodeQL (`</script >`, `<scr<script>ipt>`, `<!-<!---->-`). Les assertions existantes (digit-free, header, served notes) sont inchangées ; mutant : un `<script >` non fermé laissé dans le texte ⇒ rouge.
### D4 — Tests : assertions d'hôte exactes
Un helper partagé `test/helpers/url-host.ts` (`hostOf(url)` = `new URL(url).hostname`, `assertHost(url, expected)` = égalité ou suffixe de domaine) remplace chaque `includes("host")` des 12 sites ; les assertions gagnent en force (un stub `evil.com/?x=host` rougit). Le helper vit sous `test/helpers/` (exporté ? vérifier `export-public` : les tests exportés qui l'importent l'exigent — ajouter à la whitelist si un test exporté l'importe).
### D5 — Helpers de test : `bell-served.ts:171` échappe la valeur (`escapeRegExp`) ou compare par égalité ; `bell-caddy.ts:213` : la valeur est encodée (`escapeHtml`) avant insertion ou le contrôle compare des chaînes, jamais un HTML construit.
### D6 — Preuve
Local : oracle 7 portes + `npm test` seul ; **CodeQL ne s'exécute qu'en public** : la preuve de fermeture est la re-analyse sur la PR de la prochaine fenêtre (0 alerte nouvelle, 25 alertes « fixed »). Items : aucune alerte n'est « dismissed » sans correctif ; si une alerte se révèle un faux positif indépassable, elle est **dismissed avec justification écrite** (raison « false positive » + lien ADR), jamais ignorée.

## Tuyaux
| Tuyau | Entrée | Sortie | Test |
|---|---|---|---|
| ci.yml → GitHub Actions | bloc `permissions` | jobs sans droits d'écriture | `ci_workflow_declares_least_privilege_permissions` + CodeQL re-analyse |
| `transport.ts` → quorum | URL fournisseur | étiquette d'hôte | tests `rpc-guard` + mutant D2 |
| `assert-fleet-html.mjs` → g3-site | HTML rendu | texte contrôlé | tests unitaires D3 + job `g3-site` |

## MAST
Dérive (affaiblir un test pour faire taire CodeQL) : chaque assertion remplacée est plus forte, jamais retirée ; vérification incorrecte (fermer l'alerte par « dismiss ») : interdit sauf faux positif justifié (D6) ; secret-leak : aucun (A-7).

## Oracle et R-25
Oracle complet ; R-25 attendu ≈ 250-400 (< 1 205), worktree `F:/Monark-wt-codeql` (`lot/codeql-alerts-1` sur `lot/etude-suite`). Worker `claude-opus-5-5` effort max ; G2 fraîche ; checkpoint-2 ; G7 ; PR à la prochaine fenêtre publique (CodeQL = preuve de fermeture).

## Items formés
- CODEQL-DEFAULT-SETUP-1 : conserver la configuration par défaut (elle a produit ces alertes utiles) ; décider si le check CodeQL devient **requis** sur `main` après remédiation (décision investisseur, protection de branche).
- CODEQL-PRIVATE-1 : en privé, CodeQL ne tourne pas (fenêtre publique seulement) — la prochaine PR l'exercera.

## Points à trancher au checkpoint-1
1. D3 tokenizer maison vs dépendance (`parse5`) : reco maison (R-8, zéro dépendance runtime, surface minuscule).
2. D4 : suffixe de domaine autorisé (`*.chainstack.com`) ou égalité stricte par site ? Reco : égalité par défaut, suffixe seulement où le test le motive.
3. Rendre le check CodeQL requis après remédiation ? (investisseur.)
