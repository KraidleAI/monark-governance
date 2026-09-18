# G1 — lot F-site-10 « page Narabi live » (ADR-M012 D4 ; régime T1, ADR-M013)

## Provenance
- **Worker** : Opus 4.8 épinglé — modèle résolu tel quel `claude-opus-4-8[1m]` (R-1 ; préfixe
  `claude-opus-4-8` vérifiable par l'orchestrateur avant consommation), effort `max`. Opus 5 banni,
  non utilisé.
- **Date** : 2026-09-18. **Base** : HEAD au lancement `d533922` ; l'orchestrateur (Fable 5) a avancé
  `main` pendant la passe en committant le hotfix **M012-f** (`1447c05`, puis `36eb5c3` journal deploy) —
  R-20 respecté : le worker n'a jamais committé, seul l'orchestrateur le fait. Oracle final rejoué à HEAD
  `36eb5c3`.
- **Réviseur** : revue G2 fraîche + verdict G7 par l'orchestrateur (T1 : worker, G2 fraîche, oracle ; pas
  de checkpoint validateur).
- **Protégés M012-f non touchés** (vérifié `git status`) : `apps/harness/**`, `fixtures/**`,
  `test/h5-e2e-probe.test.ts`, `test/byo-demo-probe.test.ts`, `docs/G1-lot-m012f.md` (désormais committés
  par l'orchestrateur, hors de mon diff).
- **Zéro dépendance nouvelle** (aucun changement à `package.json` / lockfile).

## Fichiers livrés (sha256, non committés — le worker ne committe pas, R-20)
| Fichier | État | sha256 |
|---|---|---|
| `apps/site/lib/narabi-live.ts` | nouveau | `f0d0747a2d49bf0dd1212aecf1b8fbb1ecc97407068d1e3a34bb27867a1db79d` |
| `apps/site/lib/narabi-snapshot.ts` | nouveau | `32f9b80455706a9c21471f3ec2ea2d98ad036d490b9401fabd3f469c71d6e67e` |
| `apps/site/components/narabi/narabi-live.tsx` | nouveau | `414feac7e53aa546d21ee48f70dc8694e7bfb972e04b8ea8f086c68057e880c4` |
| `apps/site/app/narabi/page.tsx` | nouveau | `2c2e2f2e2415aa5af0191af6f869b12d8ed73ae7c5d4f455ff6775443205baa9` |
| `test/narabi-live.test.ts` | nouveau | `504790c9f52ea962499c1a398c2b42cf223c291a9cd64e631b003c9fc09e1f58` |
| `apps/site/components/placeholder-panel.tsx` | modifié (+19 −1) | `dadf1d61c6eaf03066ef7952e5f94f267c1756577e085b92c3c5b06e3390f4ee` |
| `apps/site/app/fleet/page.tsx` | modifié (+9) | `363b128050b391a09a66b0771ae33c877a99571a91dca194939cf5d3b76e1c1d` |
| `apps/site/components/site-header.tsx` | modifié (+4 −1) | `3bffc4f0db5847492524aa1b097166f99952424c7a01ca9e2b483bfb005c510c` |

## Route retenue : `/narabi` (sans slash final) — mesure Caddy [lu]
Lecture de `deploy/Caddyfile.monark-narabi.snippet` : la vitrine sert `handle_path /narabi/*` (fichiers
statiques de la sentinelle) **avant** `reverse_proxy localhost:3000`. Sémantique du matcher de chemin Caddy,
source primaire **[lu] 2026-09-18** (`caddyserver.com/docs/caddyfile/matchers`, section *path*) :
> « `/foo/*` will not match `/foo` » ; « Path matching is an exact match by default. » (matches
> case-insensitive)

Conséquence **mesurée** (pas devinée) :
- le bare **`/narabi`** n'est **pas** capté par `/narabi/*` → il tombe sur `reverse_proxy localhost:3000`
  et atteint Next → **route retenue** ;
- `/narabi/state.json` et `/narabi/timeline.jsonl` **sont** sous `/narabi/*` → servis par le `file_server`
  (c'est voulu : la page les lit en fetch relatif même-origine) ;
- **`/narabi/live` rejeté** : il est sous `/narabi/*`, donc le `file_server` le renverrait en 404 (pas de
  fichier `live`) — c'est le mutant du test 6.
- `deploy/Caddyfile.monark-harness` (blocs `mcp.`/`api.` → `:3001`) ne touche ni la vitrine ni `/narabi`.
- `apps/site/next.config.mjs` : pas de `trailingSlash`/`basePath` (défaut `false`) → `/narabi` est
  canonique. Seul `/narabi/` (avec slash) est capté par Caddy ; tous les liens pointent exactement
  `/narabi` (const unique `NARABI_ROUTE`, source des liens page/fleet/header/test).

## Honnêteté (aucun chiffre littéral rendu en dur)
- Toute valeur numérique rendue passe par une **lecture dynamique** (accès propriété `{state.tracker.q}`,
  appel `{unitFraction(params.c)}` / `{fmtNum(params.eps)}` / `{fmtNum(state.projected_bound_leq_target_T)}`)
  → invisible au honesty-lint (test 44), qui ne scanne que les positions **rendues** (texte JSX, littéral
  enfant JSX, attribut visible, metadata). Les constantes 1/24 (via `unitFraction(params.c)` = « 1/24 »),
  0,1 (`params.eps` / `params.alpha` = δ_target = α) et 1789 (`state.projected_bound_leq_target_T`) viennent
  **de `state.json`** — jamais tapées.
- **Aucune arithmétique en position rendue** (`{pg.page + 1}` serait rougi) : `paginate()` et
  `recomputeRecipe()` bâtissent les libellés/recette en `.ts` (non-rendu) → rendus via une lecture.
- **Un seul const de copie porteur de chiffres qui rend** : `D8_SENTENCE` (porte « 2024 » et « 24h »),
  rendu `{D8_SENTENCE}` (lecture → jamais un littéral). Il est **octet-identique** à
  `test/ci-gates.test.ts` `D8_SENTENCE` et au bloc README (test 4). Tout autre const de copie
  (`WHY_SEVEN`, `TRACKER_ADAPTS`, `NO_COVERAGE_MEASURED`, `STATUS_IS_A_WORD`) est **sans chiffre** (test 3 :
  `scanNumericText === []`) ; « seven » / « one week » sont écrits en toutes lettres.
- **T ≥ 7 expliqué** : « seven daily steps = one week of verifiable replay before we speak of a series » ;
  « the tracker adapts; the gate does not yet » ; « no coverage is measured » — le T courant affiché est la
  valeur lue `{state.tracker.t}` (0 aujourd'hui). La borne imprimée est la quantité Angelopoulos–Barber–Bates
  `(B + η₁)/(T·η_T)` (notation propre, aucun chiffre ASCII), c = B = `{unitFraction(params.c)}`,
  ε = `{fmtNum(params.eps)}`, > cible jusqu'à T = `{state.projected_bound_leq_target_T}` = 1789.
- **gate:vocab** (scope site) vert : « adaptive » ne qualifie que « quantile tracker » ; jamais
  `adaptive (cover|guarantee|region|gate)` ni `(coverage|region|gate) adapt` ; ni `predicts`/`confidence`/
  `accuracy`. Aucun nom de champ de contrat gelé n'est quoté (accès `line.burns` nu, libellés en texte JSX ;
  `frozen_contract_fields_stay_dynamic` vert). Pas de jauge, pas de couleur=statut (« status is a word »).

## Snapshot committé (repli dev/test, jamais silencieux)
`apps/site/lib/narabi-snapshot.ts` = capture **octet-exacte** des fichiers publiés, tirée de
`https://monarkgate.tech/narabi/` le 2026-09-18 (générée par script depuis les octets `curl`, `JSON.stringify`,
roundtrip utf8 prouvé) :
- `state.json` : sha256 `7abd7ab40c47599589683f6a857974c49636114f104bd93f68b4961aafdecf2d` (400 o) ;
- `timeline.jsonl` : sha256 `1803f5128ae59e77cf8553b54a5ce5f9740903b9f63d259e951bcad4c73e2ad5` (1309 o).
En production (même origine) : fetch relatif `/narabi/state.json` + `/narabi/timeline.jsonl` servis par
Caddy. En dev/test (localhost sans Caddy) : repli sur le snapshot **avec badge « snapshot » déclaré** +
date de capture + erreur live enregistrée (test 5). `loadNarabi` reçoit son `fetchText` par injection (le
module `.ts` ne référence jamais `fetch`/`window` — double-compile racine nodenext / bundler Next, comme
`lib/fleet.ts`).

## Tests racine (`test/narabi-live.test.ts`, `node --test`) — un mutant nommé par test
| Test | Vérifie | Mutant |
|---|---|---|
| `narabi_live_parses_real_state_shape` | forme réelle de `state.json` (tracker/q/t/q1/params, digest 64 hex, projected T, replay_q) + timeline (day, T, pair_status, line_hash) **et sha256 octet-exact** = fichier publié | flip d'un octet dans `narabi-snapshot.ts` → sha rougit |
| `narabi_live_bound_formula_matches_timeline_ts` | `projectedBoundT(δ)` recalculé depuis `apps/sentinel/src/timeline.ts` == `state.projected_bound_leq_target_T` (1789) ; `bound(T) ≤ cible < bound(T−1)` ; `DRIFT_THRESHOLD`/`CALM_WINDOW`/`BOUND_TARGET`/`c`/`B`/`eps` == sentinelle | changer le T projeté du snapshot ou une const → égalité rougit |
| `narabi_live_t_geq_7_explanation_present` | `WHY_SEVEN` porte seven/one week/series/replay/recompute ; copies **sans chiffre** ; rendues `{ID}` dans le composant | un chiffre dans une copie → `scanNumericText` rougit ; suppression du `{WHY_SEVEN}` → carrier rougit |
| `narabi_live_d8_byte_identical` | `D8_SENTENCE` reconstruit depuis `test/ci-gates.test.ts` (segments `"([^"]*)"`, borne `const MUTANTS` car la phrase contient des `;`) == const du lot ; rendu `{D8_SENTENCE}` | altérer un octet de D8 → égalité rougit |
| `narabi_live_snapshot_badge_when_fetch_fails` | fetch en échec → `sourceKind:"snapshot"`, source dit « snapshot » + date, `liveError` enregistré ; fetch OK → `sourceKind:"live"`, `liveError:null` | forcer le repli snapshot toujours → `good.sourceKind` rougit |
| `narabi_live_route_not_shadowed_by_caddy` | lit le snippet, extrait `handle_path` ; `/narabi` non-shadowé ; `/narabi/state.json` + `/narabi/timeline.jsonl` shadowés (servis) ; sémantique Caddy encodée | `NARABI_ROUTE = "/narabi/live"` → shadowé → 1re boucle rougit |

## Oracle (brut, HEAD 36eb5c3, arbre + changements non committés)
```
npm run ci        : gate:vocab OK (138 fichiers) ; typecheck exit 0 ; tests 270 / pass 270 / fail 0
                    (264 baseline mesuré + 6 nouveaux)
npm run lint      : exit 0 (eslint .)
npm run lint:ratchet : 69/69 (le fichier de test n'ajoute AUCUNE violation ; plafond inchangé)
lang-gate --scope site : 0 hit
export:check      : check OK — 0 chemin interdit, 0 hit FR (scope inclut apps/site, my new files greens)
git diff --check  : exit 0 (aucun blanc parasite)
next build (apps/site) : ✓ compiled, TypeScript OK, /narabi prérendu statique (13 pages générées)
```

## R-25 (taille de lot) — mesure et déviation déclarée
- **Mesuré** : 1043 lignes changées (1009 nouveaux fichiers + 34 ins/del des 3 fichiers modifiés), hors
  `docs/G1-lot-*.md` (exclu du décompte CI r25).
- **Gate CI r25 (VIBEGATES_PR_LIMIT = 1205, ADR-M003 D9)** : **VERT** (1043 < 1205).
- **Déviation vs la cible mission « < 700 »** : dépassée. Motif documenté (pas une dette nue) : le lot est
  un **port complet du concept B** — 5 panneaux spécifiés (fenêtres, dérive, tracker, recompute, registre)
  + logique pure typée + snapshot octet-exact + oracle **6 tests nommés** (tous exigés par la mission). À
  périmètre constant, < 700 imposerait de retirer un panneau ou des tests (interdit par le mini-plan). 
  **Découpe naturelle** disponible pour l'orchestrateur si la cible 700 est tenue : **PR-A land en premier**
  = `narabi-live.ts` + `narabi-snapshot.ts` + `test/narabi-live.test.ts` (logique + oracle, ~690 l ;
  aucune UI) ; puis **PR-B** = composant + page + éditions fleet/placeholder/header (~360 l).
  **Rectifié par la G2 (C-1) : cette découpe est INVALIDE telle quelle** — `test/narabi-live.test.ts` lit le composant (`readComponent`,
  tests 3c/4), donc PR-A seule rougit 2 tests (ENOENT) ; une découpe verte devrait scinder aussi le fichier de test. **Retenu : PR unique**
  (1043 < 1205), déviation déclarée.

## Déviations / notes
- **Header nav** : ajout d'**une** entrée `{ href: NARABI_ROUTE, label: "Narabi" }` (motif `NAV_ITEMS`
  existant ; aucun test ne verrouille `NAV_ITEMS`, vérifié) — la mission l'autorise (« si un motif existe »),
  utile pour l'annonce du jour. `/narabi` ajouté aussi au panneau Narabi de `/fleet` (lien register-keyed via
  `AGENT_LIVE`, miroir de `AGENT_MARKS` — le registre `fleet.ts` gelé n'est pas modifié).
- **Date projetée de la borne** : rendue avec **hypothèse imprimée**. L'anchor de repli (avant qu'un pas
  n'existe) = J0+1 = **2026-09-18**. Ce n'est PAS un off-by-one vs la mémoire « T=1 le 19 00:52 » : « le 19 »
  est l'**heure de publication** ; le **jour de fenêtre** du 1er pas est le **2026-09-18** (par
  `apps/sentinel/src/timeline.ts step()` : le pas est attribué à `l.day` = jour de la 2ᵉ fenêtre de la 1re
  paire évaluable, soit la fenêtre 09-18 qui utilise la vélocité du 09-17, publiée ~00:52 le 09-19). L'anchor
  J0+1 **coïncide** donc avec ce jour de fenêtre attendu ; une fois T≥1, la **timeline supersède** l'anchor
  (`projectedBoundDate` lit `firstStep = l.day` de la 1re ligne évaluable). L'assumption affichée dit qu'une
  fenêtre non évaluable de plus repousse la date — direction honnête. À T≥1789 (~2031) l'écart d'un jour est
  négligeable ; l'assumption est imprimée à côté.
- **Transform d'affichage `read at`** : déplacé de la position rendue vers le `.ts`
  (`readAtLabel(iso)`), rendu `{readAtLabel(data.fetchedAt)}` — cohérent avec la règle « aucune arithmétique
  en position rendue » (revue G2).
- **`AGENT_LIVE[a.name]`** (fleet) : typé `string` sous le tsconfig site actuel (pas de
  `noUncheckedIndexedAccess`) ; le garde `liveHref ?` gère l'absence à l'exécution. Si un lot futur active
  `noUncheckedIndexedAccess` côté site, ce site d'appel rougira (note, hors lot).
- **Schedule de publication** : lu **server-side** depuis `deploy/monark-sentinel.timer`
  (`OnCalendar=*-*-* 00:30:00 UTC`, `RandomizedDelaySec=1800`) et passé en prop au board (jamais un « 52 » nu)
  — source unique, pas de dérive.
- **Snapshot = données du jour** : le live (`curl`) était joignable et **identique** au snapshot du concept B
  (mêmes sha) ; capture fraîche re-tirée et vérifiée. T = 0 le 2026-09-17 (J0 publié) ; premier pas T = 1
  attendu 2026-09-19 ~00:52 UTC.
```
