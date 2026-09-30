claude-fable-5-1

# FAITS — en-têtes du mandataire Caddy `reverse_proxy` (FAITS-CADDY-PROXY-HEADERS-1, F3 de PR-4c-1) — lu sur place le 2026-09-30T02:11Z

Lecture sur place par l orchestrateur (navigateur interne), règle du 2026-09-20. Source : https://caddyserver.com/docs/caddyfile/directives/reverse_proxy [lu]. Citations ≤ 25 mots. La version de Caddy installée sur l hôte du site n est PAS lue ici : à relever (`caddy version`) à l acte DOJO-SITE-PROXY-1.

- **K-1 (en-têtes passés)** : « By default, Caddy passes through incoming headers—including Host—to the backend without modifications, with three exceptions » : il pose ou augmente `X-Forwarded-For`, pose `X-Forwarded-Proto` et `X-Forwarded-Host` ; les valeurs entrantes de ces trois en-têtes sont ignorées par défaut (anti-usurpation).
- **K-2 (CDN devant Caddy)** : avec un CDN en amont, `trusted_proxies` (option globale `servers > trusted_proxies`) définit les plages de confiance ; la page signale un risque d usurpation de `X-Forwarded-For` derrière Cloudflare, avec un contournement documenté par Authelia (non lu).
- **K-3 (compression)** : en transport `http`, Caddy pose `Accept-Encoding: gzip` s il manque ; `compression off` le désactive.
- **K-4 (HTTPS en amont, décisif pour F3)** : « it is often necessary to override the Host header with the configured upstream address when proxying to HTTPS » : `header_up Host {upstream_hostport}` ; « Since Caddy v2.11.0, this is done automatically ». Comme la version de l hôte n est pas établie, l extrait F3 pose EXPLICITEMENT `header_up Host {upstream_hostport}` (sans effet nuisible en 2.11+). `X-Forwarded-Host` reste passé.
- **K-5 (TLS amont)** : `tls` est activé automatiquement par le schéma `https://` ; `tls_insecure_skip_verify` est « Do not use in production » : jamais posé ; `tls_server_name` disponible.
- **K-6 (réponses)** : `header_down` modifie les en-têtes de réponse ; `handle_response` peut intercepter par statut.

## Conséquences pour l extrait F3 (`deploy/Caddyfile.monark-dojo-site.snippet`, PR-4c-1b)

- `handle_path /dojo-served/*` → `reverse_proxy https://dojo.monarkgate.tech` avec `header_up Host {upstream_hostport}` (K-4), GET seuls, chemins fermés (`timeline.jsonl`, `lines/*`, `dojo/pubkey.json`), `header_down Cache-Control "no-store"` (DOJO-EDGE-CACHE-1, D-P6) ; aucune option `tls_insecure_*` (K-5) ; le contrôle `cf-cache-status` et `caddy version` sont relevés à l acte DOJO-SITE-PROXY-1.
- Non établi ici : la présence d un CDN devant le site (K-2) et l état de `trusted_proxies` : à lire dans le Caddyfile déployé à l acte.
