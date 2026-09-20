# CHECKPOINT-1 (PLAN) — lot NARABI-OPS-1b

Avis du `validateur-humain`, modèle résolu **`claude-fable-5-1`** (R-1), instance séparée à contexte frais, 2026-09-20. Persisté par l'orchestrateur `claude-fable-5-1` depuis l'avis rendu (texte condensé aux §1-3, liste des corrections et escalades **intégrale**). Artefact jugé : `docs/G0-lot-narabi-ops-1b.md` au commit `e55e3ba`, sha256 `0e71f6492632109f9867a23298449aec3b503493e41873f539c84e9aa6eb4a1e` (recalculé conforme par le validateur). Aucune écriture, aucune action sortante ; `git status` vide en fin d'avis ; le fait 10 (Hostinger) n'a pas été relu par le validateur : il reste [lu worker seul].

## Décision
**ACCEPTE-AVEC-CORRECTIONS** — bloquantes **C-1 à C-8 et C-10** (à plier dans le G0 avant tout code) — **plus ESCALADE-INVESTISSEUR E-1..E-3**. Aucune escalade ne bloque le G1 de la détection (-1b-i). E-3 avant de coder la machine à états L-2 ; E-1 et E-2 avant le go de déploiement.

## Vérification des faits (synthèse)
- Tous les renvois fichier:ligne du G0 sont exacts sur pièces (`run.ts`, `rpc.ts`, `timeline.ts` — 31 champs hachés comptés —, timer, `sentinel-retry.test.ts`, `vocab-banned.json`, `ci.yml:65` et limite 1205 en `:43`, CHANTIERS, G7, ADR, `no-secret`).
- `chainstack`/`exit_code` absents de la surface servie, présents sur stdout seulement (`run.ts:180`) : exact.
- Proxy `exit_code` : exact pour le run publiant ; limite non déclarée = crash entre `run.ts:188` et `:191` (append fait, copie partielle) ⇒ ligne visible et sortie 1 (C-9).
- Proxy `providerOf ∈ {chainstack.com, p2pify.com}` : logique exacte (`rpc.ts:68-71`), mais la fixture committée porte 3 lignes × 8 endpoints, aucune origine Chainstack (C-5). L'hypothèse 2 écrit `endpoints[8]`, index positionnel proscrit par le fait 3 (C-12).
- Mesuré : `probe_line_hash_equals_sentinel_lineHashOf` est aveugle à 3 permutations de l'ordre dupliqué sur les 3 lignes committées (`c1_ok↔regime.floor`, `regime.stress↔drift_flag`, `s_raw↔s`), 5 sur la seule dernière ligne (C-1).
- Machine de test en UTC+1 : un mutant heure locale survit aux trois `--now` du G0 ; `DEADLINE` non bornée (C-4).
- Échec d'envoi SMTP non spécifié : une transition consommée sur échec = plus aucun retry (C-2).

## Checklist
CA-1 correction (C-1, C-3, C-4) ; CA-2 escalade partielle (E-1..E-3) ; CA-3 conforme (RUNBOOK oublié, C-11) ; CA-4 conforme ; CA-5 correction (six modes MAST manquants : C-2, C-6, C-7, C-8) ; CA-6..CA-8, CA-10 n-a au PLAN ; CA-7 correction (items à déclencheur échu ou circulaire, affirmation Hostinger sans source : C-10, C-13, C-14) ; CA-9 conforme ; CA-11 / CA-11 durci / Branchement : **correction bloquante** (C-5, C-6, C-10).

## Corrections — liste fermée

### Bloquantes
- **C-1. Garde de dérive des 31 champs.** Test racine important `hashedFields` et `lineHashOf` de `apps/sentinel/src/timeline.ts`, sur une ligne **synthétique à 31 valeurs deux à deux distinctes** (p. ex. chaque champ valant son propre chemin) : séquence `hashedFields()` == liste ordonnée exportée par le `.mjs`, hash identiques. L'égalité sur les lignes committées reste le second oracle. Mutants exigés : `s_raw↔s` et `c1_ok↔regime.floor`, tous deux rouges.
- **C-2. Alerte jamais perdue.** Mail d'alerte ssi `status==="unhealthy" && !alerted` ; `alerted:=true` **seulement après acceptation de DATA (250)** ; mail de rétablissement ssi `healthy && prev.alerted` ; échec d'envoi ⇒ `alert_error` dans `narabi.json` et exit 1. Test : factice refuse au run 1 (535 ou fermeture) puis accepte au run 2 ⇒ **exactement 1 mail**. Mutant : `alerted` posé avant l'envoi ⇒ rouge. Même sémantique pour le rétablissement.
- **C-3. Un scénario tueur nommé par mutant du critère 2.** `unreachable` : port loopback fermé **et** dépassement de délai ; changement de `reason` (lag puis `chain_broken` sur copie scratch) ⇒ 0 mail ; `SMTP_PASS` marqueur absent de stdout/stderr/`narabi.json`, présent sur le fil seulement dans AUTH ; `ALERT_TO` absent de stdout et de `narabi.json`.
- **C-4. Fuseau et bornes d'échéance.** `--now` ajoutés : `2026-09-21T09:45Z` ⇒ `healthy` ; un `…T23:30Z` (jour local ≠ jour UTC) ; `…T10:29Z` sain et `…T10:30Z` en lag (épingle `DEADLINE`) ; cas `lag_days < 0` ⇒ `healthy` ; test de cohérence `OnCalendar` du timer ≥ `DEADLINE` du `.mjs`.
- **C-5. Tuyau « endpoints → proxy chainstack » (CA-11 durci).** `probe_provider_of_matches_sentinel` = garde du duplicat, **pas** preuve de branchement (hôtes écrits à la main). Sorties licites : **(a)** le test fait tourner le **producteur réel** (`run.ts`, calque `sentinel-retry.test.ts:231-244`) avec `CHAINSTACK_ETH_URL=https://ethereum-mainnet.core.chainstack.com` (sans clé, précédent `:248`), passe la ligne à 9 endpoints à la sonde ⇒ `chainstack_present=true`, `false` sans la variable ; **(b)** capture réelle de la surface post-déploiement, sha-pinnée avec PROVENANCE, par l'orchestrateur (résout aussi l'item hérité (i)). À défaut : tuyau `upcoming`.
- **C-6. Transport exécuté et sonde jamais pendue.** Test avec serveur `node:http` loopback servant les octets de la fixture, `PROBE_URL` pointé dessus (`http://` admis sur loopback seul, même garde que SMTP) ; délais déclarés et testés (fetch, socket SMTP, `TimeoutStartSec`, taille de réponse bornée) ; réessai borné du GET avant `unreachable`.
- **C-7. Injection SMTP.** `reason`, `provider`, `last_day` viennent de contenu **distant** : assainissement CR/LF + longueur bornée, dot-stuffing de DATA, sujet constant ; test avec un endpoint scratch portant `\r\n.\r\nRCPT TO:<x>` ⇒ exactement 1 message, 1 destinataire, aucune commande injectée.
- **C-8. Config SMTP absente ⇒ bruyante.** `SMTP_HOST` ou `ALERT_TO` manquant à une transition ⇒ `alert_error:"smtp_unconfigured"`, exit 1, `alerted:false`, jamais de crash ; test. En -1b-ii (ou lot unique) : `EnvironmentFile=/etc/monark/probe.env` **sans `-`** ; le `-` n'est tolérable que dans -1b-i sans mail.
- **C-10. Registre honnête (CA-11).** Remplacer « **built** au gel » (table des tuyaux, L-5) par : « code + test non-LLM ; wired at deploy ; `upcoming` jusqu'au premier mail reçu (décision 58) ». Reformer l'item dead-man avec déclencheur réel : **avant le go de déploiement** ; résiduel « sonde morte = silence » écrit en toutes lettres au RUNBOOK tant que l'item est ouvert.

### Non bloquantes (à plier aussi, ou item formé avec déclencheur)
- **C-9.** Recalculer `line_hash` de **toutes** les lignes (coût nul) ; soit lire aussi `state.json` et vérifier `digest == digest_T` de la dernière ligne, soit former l'item ; préciser le fait 2 (« exit 0 sauf crash entre `:188` et `:191` ») ; option : mémoriser le dernier `line_hash` vu dans `narabi.json` (réécriture d'historique) — inclure ou former.
- **C-11. Plan de déploiement.** Branche source exacte (`lot/etude-suite`, pas `main HEAD`) ; `ExecStart` et chemin d'installation sur Bell déclarés ; garde du secret explicitée (l'investisseur pose le fichier lui-même, **ou** `SMTP_PASS` en variable User-scope relayée par stdin sans affichage, calque décision 53 ; mot de passe aléatoire ≥ 20 caractères) ; `docs/RUNBOOK-sentinel.md` §Sonde externe ajouté à L-5 ; G2 : absence de `rejectUnauthorized:false` et de `NODE_TLS_REJECT_UNAUTHORIZED` ; au déploiement : essai à nom d'hôte erroné refusé.
- **C-12.** Hypothèse 2 : retirer `endpoints[8]`.
- **C-13.** Item « durée du run » : déclencheur échu ⇒ mesure à lire par l'orchestrateur dans le journal live, marge 09:30 + 30 min ⇒ 10:30 justifiée par cette mesure **avant le gel** ; timer à plusieurs tirs après l'échéance (p. ex. 10:30, +2 h, +6 h).
- **C-14. Hostinger.** Fait 10 lu par WebFetch du worker (résumé possible) ⇒ relecture par un chercheur Sonnet 5, items auth/tarif/quotas routés vers lui. Q3 « zéro action DNS » **non sourcé** : rayer ou sourcer (voir E-2).
- **C-15.** Seam **ferme** : -1b-i détection, -1b-ii alerte (R-25, CA-10 ; le client SMTP mérite une G2 dédiée).

## Questions Q1..Q7
Q1 surface existante (tranché ; `health.json` = item formé, déclencheur : premier incident que la fraîcheur n'aurait pas vu) ; Q2 chainstack au corps du mail seulement + dans `narabi.json` (tranché) ; Q3 From = To d'accord sur le principe, prémisse DNS non sourcée (E-2) ; Q4 dead-man (E-1) ; Q5 coût (E-2) ; Q6 465 implicite seul dans ce lot, repli 587 = item formé, déclencheur « 465 refusé au mail de test » (tranché, l'orchestrateur adjuge) ; Q7 oui, clos sur source (`grep-forbidden.mjs:209-216` : `files[]` par `isFile()` sans filtre d'extension ; la prose d'alerte subit aussi `\bcascade\b` et `would have alerted`).

## ESCALADE-INVESTISSEUR
- **E-1 (dead-man).** Si le VPS Bell ou la sonde meurt, plus aucune alerte ne part : (a) service de heartbeat externe (dépendance tierce nouvelle) ; (b) surveillance croisée site↔Bell au lot T-1b (action DNS ⇒ go) ; (c) risque résiduel accepté, contrôle manuel périodique consigné au RUNBOOK.
- **E-2 (boîte).** Sur quel domaine la boîte dédiée ? Plan e-mail Hostinger existant ou à souscrire (coût) ? Si `@monarkgate.tech` : MX/SPF/DKIM = action DNS soumise au go.
- **E-3 (politique d'alerte).** Panne de plusieurs jours : un seul mail au début + un au rétablissement (plan actuel), ou un rappel quotidien (1 mail/jour max) ?

## AM-1 — ce que la checklist a attrapé
Oracle d'égalité du hash aveugle à 3 permutations (mesuré) ; alerte perdue à jamais sur échec SMTP ; config SMTP optionnelle et muette (`-`) ; mutant de fuseau survivant sur machine UTC+1 ; tuyau chainstack dit « built » sur des hôtes inventés (fixture à 8 endpoints) ; trois mutants sans test tueur ; injection CRLF depuis du contenu distant ; deux items à déclencheur échu ; affirmation DNS/Hostinger sans source ; politique d'alerte tranchée en silence.
