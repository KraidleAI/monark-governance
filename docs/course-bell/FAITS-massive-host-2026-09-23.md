# FAITS — MASSIVE-HOST-1 : `api.polygon.io` est-il encore servi pour `v2/aggs` ? (lecture sur place, orchestrateur `claude-fable-5-1`, 2026-09-23)

Contexte : le code de la jambe cash interroge `https://api.polygon.io` (`apps/bell/src/close.ts:203` [lu]) ; la documentation Massive donne `api.massive.com` (G1 BELL-ADV-1 §1). Précondition P-6 de Q6-COURSE-1 (`F:/tmp/q6course/PRECONDITIONS.md`, DF-1). Règle « lecture sur place » (investisseur 2026-09-20) : navigateur interne, faits [lu] avant tout agent.

## 1. Documentation Massive (navigateur interne, 14:02 UTC)

- `https://massive.com/docs/rest/stocks/aggregates/custom-bars` [lu] — endpoint `GET /v2/aggs/ticker/{stocksTicker}/range/{multiplier}/{timespan}/{from}/{to}` ; plans : « Stocks Starter $29/mo — 15-minute delayed — 5 years » (« Included in all Stocks plans ») ; paramètres `adjusted` (défaut `true`), `sort`, `limit` (max 50 000, défaut 5 000) ; champs `c h l n o t v vw`, `next_url` ; exemple d'URL : « https://api.massive.com/v2/aggs/ticker/AAPL/range/1/day/… » (citation ≤ 25 mots). Aucune mention de `polygon.io`, d'une migration ni d'une date de fin de l'ancien hôte sur cette page.
- `https://massive.com/docs/rest/quickstart` [lu] — authentification « Query String Parameter (e.g., ?apiKey=YOUR_API_KEY) » ou « Authorization: Bearer YOUR_API_KEY » ; hôte `api.massive.com` seul cité. Recherche dans la page de « polygon.io », « migration », « legacy » : 0 occurrence.

## 2. Sonde SANS clé (curl, `env -u POLYGON_API_KEY`, 14:02:59 UTC) — même requête `v2/aggs/ticker/AAPL/range/1/day/2026-09-01/2026-09-02?adjusted=true`

| hôte | HTTP | redirection | IP distante | corps |
|---|---|---|---|---|
| `api.polygon.io` | **401** | aucune | adresse du fournisseur | `{"status":"ERROR","request_id":"…","error":"API Key was not provided"}` |
| `api.massive.com` | **401** | aucune | adresse du fournisseur | `{"status":"ERROR","request_id":"…","error":"API Key was not provided"}` |

Lecture : les deux hôtes servent l'endpoint (même forme d'erreur, même réseau /24) ; `api.polygon.io` n'est ni redirigé ni refusé au 2026-09-23. Aucune clé envoyée, aucune donnée de marché lue.

## 3. Ruling (décision 143)

- **P-6 SATISFAITE** pour Q6-COURSE-1 : `close.ts:203` peut rester sur `api.polygon.io` pour cette course (hôte servi, mesuré) ; toute réponse 3xx/404/410 en course = STOP fail-closed (déjà le comportement de la jambe cash : abstention `no_close_ref`).
- **Item MASSIVE-HOST-1 reformé** : basculer `close.ts` sur `api.massive.com` (hôte documenté) — propriétaire orchestrateur ; déclencheur : prochain lot touchant `apps/bell/src/close.ts` (1b-iii jambe cash sous la garde, CASH-KEYLESS-SKIP-1) ; pièce probante à la bascule : cette sonde rejouée sur le nouvel hôte.
- Non lu : page d'annonce de migration Polygon → Massive (introuvable depuis la doc) ; [abs] jusqu'à lecture.
