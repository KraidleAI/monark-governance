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
