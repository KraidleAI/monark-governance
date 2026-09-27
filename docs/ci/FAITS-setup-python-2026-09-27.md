# FAITS — `actions/setup-python` (item CI-SETUP-PYTHON-PIN-1, NARABI-2 C-10) — 2026-09-27

Lecture sur place par l'orchestrateur (`claude-fable-5-1`), avant le G1 de N2-1b. Navigateur interne : `github.com` refusé (« denied or failed ») → navigateur externe (Chrome), onglet propre créé puis fermé ; l'onglet de l'investisseur n'a pas été touché. API GitHub : lecture seule via `gh api` (précédent `ci.yml:9`, 2026-09-19 ; conditions déjà lues). Rien téléchargé hors un JSON de manifeste (texte, sous `F:\tmp`).

## Faits [lu]
| # | Fait | Source | Heure UTC |
|---|---|---|---|
| 1 | Dernière release : **v7.0.0**, publiée 2026-07-20T03:15:01Z | `gh api repos/actions/setup-python/releases/latest` | 20:58:28 |
| 2 | Tag `v7.0.0` → `object.type` = **commit**, sha **`5fda3b95a4ea91299a34e894583c3862153e4b97`** | `gh api repos/actions/setup-python/git/ref/tags/v7.0.0` | 20:58:36 |
| 3 | Tag flottant `v7` → même sha `5fda3b95…` (commit) | `gh api …/git/ref/tags/v7` | 20:58:36 |
| 4 | Page de release : « v7.0.0 Latest », « Immutable release. Only release title and notes can be modified. », sha court « 5fda3b9 » ; « 9 commits to main since this release » ; changements : « Migrate to ESM and upgrade dependencies (#1330) », « Remove the pip-install input (#1336) », « Pin SHA commits and update docs (#1338) » | `https://github.com/actions/setup-python/releases/tag/v7.0.0` (Chrome) | 20:58:5x |
| 5 | Manifeste des versions : 3.14.x disponibles = 3.14.7, 3.14.6, 3.14.5, 3.14.5-rc.1, 3.14.4, 3.14.3 ; fichiers linux pour 3.14.7 : `platform_version` 22.04 (hôte `ubuntu-latest`, `ci.yml:29`) | `raw.githubusercontent.com/actions/python-versions/main/versions-manifest.json` (copie `F:\tmp\narabi-px2\python-versions-manifest.json`, sha `fbfbfe5d…`) | 20:59:02 |

## Décision (orchestrateur)
- Ligne à poser dans `g3-verification` (`ci.yml:126`) : `uses: actions/setup-python@5fda3b95a4ea91299a34e894583c3862153e4b97 # v7.0.0 (gh api repos/actions/setup-python/git/ref/tags/v7.0.0 -> object.type=commit, measured 2026-09-27)` ; ligne de provenance ajoutée au bloc `ci.yml:6-10`.
- `python-version: "3.14"` (X.Y) : minor de l'oracle local mesuré (3.14.5, pli C-10) ; le patch peut différer (3.14.7 en CI) — S4′ ne dépend pas du patch (arithmétique entière stdlib) ; l'égalité de sortie entre local et CI est prouvée par le rejeu, non supposée.
- Non lu : les notes de v7.0.0 hors la page (« pip-install input » retiré : sans effet, aucun `pip` n'est employé).
