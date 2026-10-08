# RUNBOOK — vitrine `monarkgate.tech` (`apps/site`) : redéploiement

Mesuré sur le VPS le 2026-09-18 (lecture seule) : unité `monark.service`, `WorkingDirectory=/opt/monark-app/apps/site`,
`ExecStart=/opt/monark-app/node_modules/.bin/next start -p 3000`, Node v24.21.0, arbre `/opt/monark-app` = copie du dépôt **sans `.git`**
(build du 2026-09-11), Caddy `monarkgate.tech` → `localhost:3000` avec `handle_path /narabi/*` statique (sentinelle) inséré dans le même bloc.
Déploiement = action sortante sous go investisseur (ADR-M010) ; régime de contenu selon ADR-M013 (T0/T1/T2).

## Procédure (orchestrateur, depuis un `main` propre — jamais depuis un arbre portant les fichiers d'un autre lot)
0. **Ancres Bell (lots SITE-CHARTE-C et BELL-OTS-ANCHOR-1)** : deux registres, `docs/course-bell/ANCHORS.md` (course) et `docs/bell-publications/ANCHORS.md` (enregistrements publiés). Après une nouvelle publication Bell, dans cet ordre : `node scripts/sync-bell-served.mjs` (données v4 avec `lines[]` ; la synchro écrit elle-même l'entrée de `apps/site/data/manifest.sha256.json` ; épingle `PINNED_FILE_SHA256` de `test/bell-served.test.ts` re-posée sur le sha256 imprimé), puis l'ancre de la ligne (étape 13 bis de `docs/RUNBOOK-bell.md`), puis `node scripts/sync-bell-anchors.mjs` (qui refuse, avant toute écriture, une ligne de registre au-delà de `lines[]` ou non liée à sa ligne). Après une nouvelle ancre de course ou une preuve mise à niveau seules (même tête) : `node scripts/sync-bell-anchors.mjs` seul. Puis rebuild (`npm run build -w @monark/site`), et committer `apps/site/public/bell/anchors/` (et les données le cas échéant) avec l'ancre — sinon `bell_anchors_served_register_matches_source` ou `bell_publication_anchors_served_register_matches_source` rougit.
1. **Export propre** : `git worktree add --detach <scratch>/wt-<sha> <sha>` puis, depuis ce worktree, `node scripts/export-public.mjs --out <scratch>/site-<sha>`
   (même surface que le miroir public ; `apps/site` en marche complète). Vérifier `EXPORT-MANIFEST.json` et l'absence de `node_modules`/`.next`.
2. **Sauvegarde VPS** : `ssh root@VPS 'tar czf /opt/monark-app.bak-$(date -u +%Y%m%d-%H%M).tgz --exclude=monark-app/node_modules --exclude=monark-app/apps/site/.next -C /opt monark-app'`.
3. **Transfert** : `tar czf - -C <scratch>/site-<sha> . | ssh root@VPS 'mkdir -p /opt/monark-app.new && tar xzf - -C /opt/monark-app.new'`.
4. **Build sur le VPS** (hors ligne de la prod, dans `.new`) : `cd /opt/monark-app.new && npm ci --omit=dev=false && cd apps/site && npx next build` —
   sortie conservée ; échec ⇒ **abandon**, `.new` supprimé, prod intacte.
5. **Bascule atomique** : `mv /opt/monark-app /opt/monark-app.prev && mv /opt/monark-app.new /opt/monark-app && systemctl restart monark` ;
   `systemctl is-active monark` ; `curl -sI https://monarkgate.tech/ | head -1` (200) ; contrôle des routes touchées (`/fleet`, `/narabi…`) ;
   `curl -s https://monarkgate.tech/narabi/state.json | head -c 80` (Caddy inchangé, statique toujours servi).
6. **Rollback** (≤ 1 min) : `mv /opt/monark-app /opt/monark-app.failed && mv /opt/monark-app.prev /opt/monark-app && systemctl restart monark`.
7. **Journal** : sha déployé, heure UTC, sortie du build, codes HTTP ; `.prev` conservé 7 jours puis supprimé.

Ligne datée 2026-10-03 09:1x UTC (orchestrateur, item RUNBOOK-VITRINE-TAR-ORDER-1) : à l étape 2, les `--exclude` précèdent `-C /opt monark-app` ; GNU tar 1.35 (version lue sur le serveur ce jour) a rendu le code 2 avec l ordre ancien (exclusions après le membre) à l envoi du 2026-10-03, et 0 avec cet ordre.

## Invariants
- Jamais de `git` sur le VPS ; jamais de secret dans l'arbre (la vitrine n'en a pas) ; Caddy n'est **pas** touché par un déploiement de contenu.
- Les fichiers de la sentinelle (`/var/lib/monark-sentinel/public`) ne sont jamais dans `/opt/monark-app`.
- (2026-10-04, SERVED-PENDING-1, Q-SP1-2) Aucun envoi du site tant que `apps/site/data/harness-pending.json` existe dans l arbre
  exporté, sauf au temps (ii), après sa promotion : les traces BYO et H5 suivraient l instantané en attente avant T0.
- (2026-10-05, UKEMI-PENDING-SNAPSHOT-1, M3) Idem pour `apps/site/data/ukemi-pending.json` ; la promotion ukemi est refusée tant
  que `harness-pending.json` existe ; à T0, l ordre : CA, sync du harnais, puis sync ukemi.
- (2026-10-05 14:3x UTC, SITE-SEND-GUARD-MECH-1, lot CM-3c-4a de C', #164) Ces deux règles sont aussi mécaniques depuis C' :
  `node scripts/export-public.mjs --out` refuse avant toute écriture tant qu un `*-pending.json` est dans l arbre ou qu un fichier servi
  porte `pending_since` (échec fermé sur un fichier illisible ; aucun drapeau de contournement ; `--check` n est pas gardé).
  `release-public` passe par `--out` : de C2 à T0, il est bloqué aussi en `--dry-run`, et son refus ne tombe qu après les portes locales
  complètes (environ 15 min). La promotion à T0 lève la garde d elle-même.
- (2026-10-06, SURFACES-1-1-0) Depuis #181 (RELEASE-PREFLIGHT-SEND-GUARD-1), le refus de `release-public`, `--dry-run` compris, tombe au pré-vol, avant toute porte locale (`scripts/release-public.mjs`, `preflight`) : la durée de l entrée précédente ne vaut plus.

## Ordre de T0 (contrat 1.1.0, lot T0-TOOLING-1)

Ligne datée 2026-10-06 (RECHERCHES, lot T0-TOOLING-1, ordre accepté par MONARK) : les actes de T0, dans cet ordre, chacun après le succès du précédent, sans retouche à la main sur l hôte ni dans les données. Les commandes locales partent de la racine du dépôt, sur la branche de T0.

1. **Déploiement du harnais** (`docs/RUNBOOK-harness.md` §1 et « Update » ; avant cette commande par le nom, la clé d hôte de monarkgate.tech copiée sous ce nom une fois, RUNBOOK-harness §0) : `git archive --format=tar.gz HEAD apps packages schemas fixtures package.json package-lock.json deploy scripts/verify-harness.mjs | ssh -i ~/.ssh/monark_vps root@monarkgate.tech "mkdir -p /opt/monark-harness && tar xzf - -C /opt/monark-harness"`, puis sur l hôte `cd /opt/monark-harness && npm ci && chown -R monark:monark . && systemctl restart monark-harness`.
2. **CA, verte seulement** : `node scripts/verify-harness.mjs --out docs/deploy-CA-harness.json --kata-wait-max 3150`. Au besoin, la course attend que son horloge soit à moins de 225 s de l heure pleine suivante (UTC), jusqu à 52 min 30 s au plus, et affiche son attente ; voir RUNBOOK-harness §6. Sortie 0 et `VERIFY OK — all checks passed.` exigés ; la CA n est écrite que si les 18 contrôles passent et que les deux hôtes, `api.` et `mcp.`, passent une poignée de main TLS authentifiée. Une passe rouge sort en 1 et écrit `docs/deploy-CA-harness.json.failed` ; la dernière CA verte reste ; on corrige et on relance, rien d autre. Option inconnue, répétée ou vide : sortie 2. Journal : `sha256sum docs/deploy-CA-harness.json`, empreinte reportée dans `docs/JOURNAL-PROVENANCE.md`. **Une CA relancée après l acte 3 oblige à refaire les actes 3, 4, 5 et 6** : chaque synchro lie ses corps à la CA (`checked_at`, empreintes).
3. **Synchro du harnais** : `node scripts/sync-harness-served.mjs`, la commande nue (jamais le mode en attente). Elle promeut `harness-pending.json` et écrit elle-même le manifeste canonique : entrée de `harness-served.json` posée, entrée et fichier `harness-pending.json` retirés. Un échec nomme ce qui est écrit ; une coupure se reprend en relançant la même commande, `node scripts/sync-harness-served.mjs`, sans retouche.
4. **Synchro Narabi** : `node scripts/sync-narabi-served.mjs`. Elle relit l empreinte `openapi` de la CA neuve et pose elle-même son entrée du manifeste.
5. **Synchro ukemi** : `node scripts/sync-ukemi-served.mjs`, la commande nue. Refusée tant que `harness-pending.json` existe (acte 3 d abord) ; elle promeut `ukemi-pending.json` et tient le manifeste ; une coupure se reprend de même, `node scripts/sync-ukemi-served.mjs`.
6. **Ré-épinglage et commit** : `node scripts/repin-served.mjs` réécrit `PINNED` de `test/harness-served.test.ts` depuis les fichiers (épingles tapées à dessein ; la ligne `harness-pending.json` part avec son fichier). Les autres tests liés à T0 se dérivent des fichiers : rien d autre à toucher. Puis `npm run ci` vert, et un seul commit aux chemins explicites, journal compris (l arbre doit rester propre pour l acte 9) : `git add docs/deploy-CA-harness.json docs/JOURNAL-PROVENANCE.md apps/site/data/harness-served.json apps/site/data/harness-pending.json apps/site/data/narabi-served.json apps/site/data/ukemi-served.json apps/site/data/ukemi-pending.json apps/site/data/manifest.sha256.json test/harness-served.test.ts`, puis `git commit`.
7. **Envoi du site** : la procédure ci-dessus, étapes 1 à 7, depuis ce commit porté sur `main` : `node scripts/export-public.mjs --out <scratch>/site-<sha>` (la garde d envoi est levée par les actes 3 et 5). Puis la liste « Contrôle après l envoi de T0 » ci-dessous, page par page.
8. **Publication de la spécification** : `node scripts/spec-publish.mjs --release contract-1.1.0 --date <YYYY-MM-DD> --out <dir> --root recherches=<recherches> --root previous=<monark-kata-spec@ddfee9e>`, la date étant le jour de T0 ; `<recherches>` est un clone de `recherches` à `1107e12` ou après, `<monark-kata-spec@ddfee9e>` un clone propre de `monark-kata-spec` extrait à ce commit, `<dir>` un répertoire absent ou vide hors de tout arbre git. Attendu pour la date 2026-10-06 (répétition de la G2 delta) : 49 fichiers, `MANIFEST.sha256` `66d31d82122587a9da8725f3e19b39b43f371de826c1e9f311ea6a1755d4eb16` ; une autre date change `VERSION`, donc cette empreinte.
9. **Release du miroir `v0.9.0`** : les notes vont dans `docs/public-notes/v0.9.0.md` (genre `notes`, anglais) et le message du commit du miroir dans `docs/public-notes/v0.9.0.commit.md` (genre `message`, titre de 50 points de code au plus, sur le modèle `v0.8.0: …`), committés sur `main` avant la release ; aucun marqueur en capitales entre accolades ne doit rester (la porte le refuse). Le tag du miroir n est pas la version du contrat. Puis `node scripts/release-public.mjs --message docs/public-notes/v0.9.0.commit.md` avec `MONARK_PUBLIC_MIRROR` posé. L outil refuse `--tag` et `--notes` par construction : le tag annoté `v0.9.0` et `gh release create v0.9.0 --repo KraidleAI/Monark --title v0.9.0 --notes-file docs/public-notes/v0.9.0.md --verify-tag` restent à l orchestrateur (`docs/adr/ADR-PUBLIC-CADENCE-1.md`, §3.2 point 4).

## Contrôle après l envoi de T0

Ligne datée 2026-10-06 (RECHERCHES, lot T0-TOOLING-1, d après la relecture des actes de T0, §3) : ce qu on mesure pour dire « servi », après l acte 7.

- **`/openapi.json`** : `curl -s https://api.monarkgate.tech/openapi.json | sha256sum` rend `61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0`, la valeur du contrôle `openapi` de la CA, de `bodies_sha256["/openapi.json"]` de `harness-served.json`, de `body_sha256` de `ukemi-served.json` et de `gate.openapi_sha256` de `narabi-served.json` ; on la reporte dans la NOTICE.
- **CA** : 18 contrôles verts (15 à la T0 du 2026-10-06 ; 18 depuis le trio de la CA d E-2a, #225) ; empreintes en processus attendues : `gate_call` `701e9b06…`, `gate_liq_call` `e2bfb18b…`, `calibrate_call` `f169e9f6…`, `health` `d754b2fe…`.
- **Pages** :
  - `/` : « Eight frozen contracts (AttestedBook upcoming until served) » ; JSON de la simulation en `schema_version` `"1.1.0"` ;
  - `/docs` : « the eight frozen contracts » ;
  - `/how` : « the scores digest it came from » ;
  - `/ukemi` : libellé « scores digest », valeur `a9277222…` ;
  - `/ukemi/course` : « served scores digest a927722276941a4f8f677bab3625b8ee3128ecf84d2d078da0a316b42a6ee3c8 », jamais `e7e67366…` ; `read_at` postérieur au `checked_at` de la CA ;
  - `/narabi`, `/docs/narabi` : « scores digest » `e44a68b6`, plus de `c9793b28` ;
  - `/integrators` : les deux `scores_sha256` de la boucle BYO égaux (`3e12ae9e2e06…`) ; « served version 0.4.0 » ; ni `calib_digest` ni `set_digest` ;
  - `/docs/integrators` : même boucle ; « Last deploy check <checked_at de la CA neuve>: 18 of 18 controls » ;
  - partout : 0 « calibration digest », 0 `calib_digest`, 0 `set_digest`.
