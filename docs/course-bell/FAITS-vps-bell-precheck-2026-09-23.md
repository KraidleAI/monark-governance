# FAITS — contrôles sur place du VPS Bell avant déploiement T-1b (SSH lecture seule, orchestrateur `claude-fable-5-1`, 2026-09-23 17:0x UTC)

Commandes : `ssh -i ~/.ssh/monark_vps root@178.16.131.29` (lecture seule : `systemctl --version`, `caddy version`, `node -v`, `npm -v`, `id bell`, `ls`, `cat /etc/caddy/Caddyfile`, `ufw status numbered`, `systemctl cat caddy`, `systemctl list-units`). Aucune écriture, aucun redémarrage.

| contrôle (RUNBOOK-bell, S-12 « contrôles sur place ») | valeur mesurée |
|---|---|
| hostname | `bell` (`srv1993906.hstgr.cloud`, 178.16.131.29) |
| systemd | **259** (259.5-0ubuntu3.4) ≥ 247 ⇒ `LoadCredential=` disponible |
| Caddy | `/usr/bin/caddy` **v2.11.4**, unité `caddy` active, `ExecStart=/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile` |
| `/etc/caddy/Caddyfile` | **défaut du paquet** (21 lignes : bloc `:80 { root * /usr/share/caddy ; file_server }` + commentaires) ; aucun autre site ⇒ ruling C-5 : REMPLACEMENT en bloc (pas `import`), sha du défaut consigné avant |
| ports en écoute | `:80` (caddy, pid 10474) seulement ; aucun `:443` tant qu'aucun site nommé |
| ufw | actif : 22/tcp, 80/tcp, 443/tcp ALLOW IN (v4 et v6) ⇒ ACME possible |
| node / npm | v24.21.0 / 11.19.0 |
| utilisateur `bell` | ABSENT (à créer, `User=bell` de l'unité) |
| `/var/lib/monark-bell`, `/etc/monark/bell`, `/opt/monark-bell` | ABSENTS (à créer par le RUNBOOK) |
| `/opt/monark-probe` | présent (`DEPLOYED-SHA`, `probe-narabi.mjs`), `monark-probe.timer` actif — hors périmètre, intact |
| unité transitoire | `run-p19072-i21642.service` **failed** (simulation `probe-narabi.mjs --now 2026-09-23T12:00:00Z --out /tmp/probe-sim.json`, lancée via `systemd-run` le 2026-09-23) — item **PROBE-SIM-UNIT-1** (propriétaire orchestrateur ; déclencheur : prochain acte sur `/opt/monark-probe` ; `systemctl reset-failed` + lecture du journal, jamais dans le lot T-1b) |
| disque | 94 G libres sur 96 G |

Porte S-12 « contrôles sur place » : PRÉ-SATISFAITE sur ces valeurs ; à rejouer à l'identique dans la séquence de mise en ligne (RUNBOOK-bell, PR-3).
