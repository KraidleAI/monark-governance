# PR-4 — Compteur ClawHub `@kraidle/monark` : capture datée (lue à l'écran par l'orchestrateur, page connectée `kraidle`)

| Capture (UTC) | Onglet | Valeur affichée | Versions listées | Audit | Source |
|---|---|---|---|---|---|
| 2026-09-18 ~19:30 (session précédente) | Downloads « 30d » | **219** | 1.0.0 (11/09), 1.0.1 (11/09), 1.0.2 (17/09), 1.0.3 (18/09, Latest) | Pass | page `clawhub.ai/kraidle/skills/monark`, texte extrait du DOM |
| 2026-09-18 20:35:40 | Downloads « 30d » | **226** | idem | Pass | `innerText` du `<main>` extrait par script, verbatim ci-dessous |

Verbatim (20:35:40 UTC) : « Bookmark 0 Downloads All time 30d 7d 226 30 days Security audit Pass Last updated 14h ago Current version v1.0.3 License MIT-0 ».

**Ce que la capture établit** : un compteur « Downloads » affiché par ClawHub, valeur 226 sur l'onglet 30 jours au 2026-09-18 20:35 UTC (+7 en ~1 h par
rapport à la lecture précédente), sur une skill listée depuis le 11/09 (v1.0.0). **Ce qu'elle n'établit pas** : la définition du compteur (uniques,
réinstallations, bots, `All time` non affiché séparément), la répartition par jour et par version (l'interface ne l'expose pas ; l'API
`clawhub.ai/api/skills/monark` rend 404 — advisor-marché), et surtout **pulls ≠ appels** (ADR-M006 D8 mesure des POST `tools/call` d'origine ≠ MONARK).
**Niveau** : [lu orchestrateur, écran, capture textuelle datée] ; « 8 jours » = date de v1.0.0, inférence, pas une donnée du compteur.
**Statut** : partiel — l'investisseur ne dispose pas d'un export (« je ne sais pas ce que c'est ») ; demande formée au mainteneur ClawHub si un export
existe (tentative : API 404, 2026-09-18). Ne fonde aucune mesure de demande.
