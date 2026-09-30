claude-fable-5-1

# FAITS — Ed25519 dans WebCrypto (FAITS-WEBCRYPTO-ED25519-1) et cache par défaut du bord Cloudflare (DOJO-EDGE-CACHE-1) — lu sur place le 2026-09-30T01:27Z

Lecture sur place par l orchestrateur (navigateur interne), règle du 2026-09-20. Citations ≤ 25 mots.

## W-1, W-2 — https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign [lu]

- **W-1** : « To use Ed25519, pass the string Ed25519 or an object of the form { name: "Ed25519" }. »
- **W-2** : Ed25519 est défini par la RFC 8032 (famille EdDSA), selon la même page.

## W-3 — https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/SubtleCrypto.json (source des tableaux de compatibilité de MDN, branche `main`) [lu]

- `verify.ed25519` et `importKey.ed25519`, `version_added` : Chrome 137, Firefox 129, Safari 17, Node.js 16.17.0, Deno 1.26, Bun 1.0.0 ; Edge, Chrome Android, Firefox Android, Safari iOS, Opera, Samsung Internet, WebView : `mirror` (reprennent le moteur de base). Aucun drapeau, aucune implémentation partielle notée.
- **Conséquence (PR-4c-1, TY-3)** : un navigateur plus ancien que ces versions n a pas Ed25519 : l import échoue, la page le dit (TXT-14b), jamais TXT-14a (M-L7) ; aucune bibliothèque de repli n est ajoutée sans décision.

## C-1 à C-3 — https://developers.cloudflare.com/cache/concepts/default-cache-behavior/ [lu]

- **C-1** : « Cloudflare only caches based on file extension and not by MIME type. The Cloudflare CDN does not cache HTML or JSON by default. » ; la liste des extensions mises en cache par défaut ne contient ni `JSON` ni `JSONL`.
- **C-2** : Cloudflare ne met pas en cache quand `Cache-Control` vaut `private`, `no-store`, `no-cache` ou `max-age=0`, quand `Set-Cookie` existe, ou pour une méthode autre que GET.
- **C-3** : une règle de cache (« Cache Rules ») peut tout mettre en cache ; son absence sur la zone n est PAS établie ici (tableau de bord du compte, non lu).

## Conséquences

- **DOJO-EDGE-CACHE-1** : garde retenue : le mandataire F3 (`deploy/Caddyfile.monark-dojo-site.snippet`) pose `Cache-Control: no-store` sur ses réponses et le navigateur fetch en `cache: "no-store"` (déjà au D-1) ; **reste à MESURER** après le déploiement du mandataire : `cf-cache-status` des trois chemins (attendu `DYNAMIC` ou `BYPASS`, jamais `HIT`) : acte de vérification de DOJO-SITE-PROXY-1.
