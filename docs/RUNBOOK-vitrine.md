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

1. **Déploiement du harnais** (`docs/RUNBOOK-harness.md` §1 et « Update ») : `git archive --format=tar.gz HEAD apps packages schemas fixtures package.json package-lock.json deploy scripts/verify-harness.mjs | ssh -i ~/.ssh/monark_vps root@31.97.155.188 "mkdir -p /opt/monark-harness && tar xzf - -C /opt/monark-harness"`, puis sur l hôte `cd /opt/monark-harness && npm ci && chown -R monark:monark . && systemctl restart monark-harness`.
2. **CA, verte seulement** : `node scripts/verify-harness.mjs --out docs/deploy-CA-harness.json`. Sortie 0 et `VERIFY OK — all checks passed.` exigés. Une passe rouge sort en 1, n écrit pas `docs/deploy-CA-harness.json` (la dernière CA verte reste) et écrit `docs/deploy-CA-harness.json.failed` ; on corrige et on relance, rien d autre. Une option inconnue est refusée (sortie 2). Journal : `sha256sum docs/deploy-CA-harness.json`.
3. **Synchro du harnais** : `node scripts/sync-harness-served.mjs` (sans `--pending`). Elle promeut `harness-pending.json` et écrit elle-même le manifeste canonique : entrée de `harness-served.json` posée, entrée et fichier `harness-pending.json` retirés.
4. **Synchro Narabi** : `node scripts/sync-narabi-served.mjs`. Elle relit l empreinte `openapi` de la CA neuve et pose elle-même son entrée du manifeste.
5. **Synchro ukemi** : `node scripts/sync-ukemi-served.mjs` (sans `--pending`). Refusée tant que `harness-pending.json` existe (étape 3 d abord) ; elle promeut `ukemi-pending.json` et tient le manifeste.
6. **Ré-épinglage et commit** : `node scripts/repin-served.mjs` réécrit `PINNED` de `test/harness-served.test.ts` depuis les fichiers (épingles tapées à dessein ; la ligne `harness-pending.json` part avec son fichier). Les autres tests liés à T0 se dérivent des fichiers : rien d autre à toucher. Puis `npm run ci` vert, et un seul commit aux chemins explicites : `git add docs/deploy-CA-harness.json apps/site/data/harness-served.json apps/site/data/harness-pending.json apps/site/data/narabi-served.json apps/site/data/ukemi-served.json apps/site/data/ukemi-pending.json apps/site/data/manifest.sha256.json test/harness-served.test.ts`, puis `git commit`.
7. **Envoi du site** : la procédure ci-dessus, étapes 1 à 7, depuis ce commit porté sur `main` : `node scripts/export-public.mjs --out <scratch>/site-<sha>` (la garde d envoi est levée par les étapes 3 et 5).
8. **Publication de la spécification** : `node scripts/spec-publish.mjs --release <id> --date <YYYY-MM-DD> --out <dir>` (identifiant de la version 1.1.0 déclaré par le lot SPEC-1-1-0-RELEASE).
9. **Release du miroir `v0.9.0`** : les notes vont dans `docs/public-notes/v0.9.0.md` (genre `notes`, anglais) et le message du commit du miroir dans `docs/public-notes/v0.9.0.commit.md` (genre `message`, titre de 50 points de code au plus, sur le modèle `v0.8.0: …`), committés sur `main` avant la release ; aucun marqueur `{…}` en capitales ne doit rester (la porte le refuse). Le tag du miroir n est pas la version du contrat. Puis `node scripts/release-public.mjs --message docs/public-notes/v0.9.0.commit.md` avec `MONARK_PUBLIC_MIRROR` posé. L outil refuse `--tag` et `--notes` par construction : le tag annoté `v0.9.0` et `gh release create v0.9.0 --repo KraidleAI/Monark --title v0.9.0 --notes-file docs/public-notes/v0.9.0.md --verify-tag` restent à l orchestrateur (`docs/adr/ADR-PUBLIC-CADENCE-1.md`, §3.2 point 4).
