# G0 du lot DOJO-PROBE-FOLLOWUP-1 : les notes N-1, N-3 et N-4 de la G2 de #220 (la sonde du Dōjō)

RECHERCHES, 2026-10-07. Base `1cddd2e5` (tronc `lot/etude-suite`). Item : `docs/ETAT.md` l.1505-1512 (DOJO-PROBE-FOLLOWUP-1).
Sources : la G2 de #220 (pièce `pieces/2026-10-07-G2-220/G2-220.md` de RECHERCHES, notes N-1 à N-4) ; le partage 80/20 de MONARK,
item 5 (« N-1 d abord : `SMTP_PASS` lu d un fichier `0600` au moment d envoyer »). Ce lot ne touche ni Bell, ni un déploiement, ni
un secret : du code, des tests et le texte du RUNBOOK que le fondateur jouera.

## Provenance

- Modèle : `claude-opus-5-5`, effort standard. Heure lue au départ (`date -u`) : 2026-10-07T09:06:07Z.
- Worktree détaché neuf, branche `recherches/dojo-probe-followup-1` ; `/home/user/monark-governance` n'est pas modifié. Node v24.21.0.
- Sémantique de `UnsetEnvironment=` lue dans systemd.exec(5) : « applied as final step when the environment list passed to executed
  processes is compiled. That means it may undo assignments from any configuration source, including [...] EnvironmentFile= ».

## Découpe

N-2 (un test par garde de `reportOk`) ne change aucune ligne de production : ses tests sont verts à la base, et red-proof en mode F2P
les refuse (« green at base »). N-2 part donc dans un second lot, en mode `--test-only`, avec son propre G0. Ce lot-ci porte N-1, N-3
et N-4, chacun avec un test rouge à la base par assertion.

## N-1 : le parent ne garde plus `SMTP_PASS` dans son environnement

Constat : l'enfant vérificateur tourne sous le même uid `probe` que le parent ; `/proc/<ppid>/environ` lui est lisible
(PTRACE_MODE_READ, que Yama ne restreint pas). La liste fermée `VERIFIER_ENV` est une hygiène, pas une isolation.

Changement :

1. **Le mot de passe vient d'un fichier, lu au moment d'envoyer.** `readSmtpPass(path)` ouvre le fichier (`O_NOFOLLOW` hors Windows),
   lit son `fstat` sur le même descripteur, exige un fichier régulier d'au plus `SMTP_PASS_MAX_BYTES` (1 024) octets et, sous POSIX,
   aucun bit de groupe ni d'autre (`mode & 0o077 === 0`). Une seule ligne, sa fin de ligne ôtée, non vide. Tout autre cas rend
   `null`, et le courriel dû donne `alert_error: "smtp_unconfigured"` (ensemble fermé `AlertError` inchangé) : fermé.
   `alertOf` ne l'appelle qu'après `check`, donc après la fin de l'enfant (`execFile` ne rend qu'à la sortie de l'enfant, tué au
   besoin par SIGKILL), et seulement quand un courriel est dû. Chemin : `DEFAULT_SMTP_PASS_FILE`
   (`/etc/monark/dojo-probe-smtp-pass`), ou `--smtp-pass-file`. `mailConfigOf` ne lit plus jamais `SMTP_PASS`.
2. **Le refus d'un mot de passe dans l'environnement.** À l'étape 1, après le refus de `NODE_TLS_REJECT_UNAUTHORIZED=0`, un
   `SMTP_PASS` présent dans l'environnement de la sonde donne la raison neuve `secret_in_environment`, avant tout GET et donc avant
   l'enfant. La sonde reste malsaine tant que le déploiement laisse passer le nom ; elle écrit son enregistrement et envoie le
   courriel (le mot de passe vient du fichier).
3. **L'unité.** `UnsetEnvironment=` reçoit `SMTP_PASS` après la liste du service de publication. `EnvironmentFile=/etc/monark/probe.env`
   reste, pour les clés non secrètes partagées avec `monark-probe.service`. Si systemd ne retirait pas le nom, le point 2 le dirait.
4. **Le RUNBOOK §25.** L'acte (1) lit le propriétaire et le mode du fichier (`probe 600`) ; un acte (1b) le crée à partir de la
   ligne `SMTP_PASS` de `probe.env`, sans l'imprimer. Il reste au fondateur, comme tout le §25.

Ce que N-1 ne fait pas : le fichier reste lisible par l'uid `probe`, donc par un enfant compromis qui l'ouvrirait lui-même. Une
frontière vraie demande l'enfant sous un autre uid (un acte de déploiement, hors de ce lot). Le gain est réel mais borné : le secret
n'est plus dans `/proc/<ppid>/environ`, n'est hérité par aucun processus, et n'est en mémoire du parent qu'après la fin de l'enfant.

Windows : il n'y a pas de bits de mode POSIX. Node y rapporte `0o666` ou `0o444` quel que soit l'ACL ; le contrôle des bits y est
sauté (motif `test/dojo-collect-deploy.test.ts` l.190) et le fichier est accepté. La sonde ne tourne que sur Bell (Linux) ; les
tests vérifient les deux comportements, chacun sur sa plateforme.

## N-3 : la chronologie de l'hôte jugée avant le GET du mandataire

`pair` jugeait `timeline_malformed` après les deux GET. Hôte malformé et mandataire injoignable donnaient `unreachable/proxy`, contre
l'en-tête (« GETs: host before proxy »). Le jugement de la tête passe juste après le GET de l'hôte : aucun GET du mandataire sur une
chronologie d'hôte sans tête. Le verdict ne change pas ; la raison et le nombre de GET, si.

## N-4 : le calendrier dit vrai sur le collecteur

La phrase « one CPU-bound job at a time » du timer est fausse : `monark-dojo-collect.timer` tire toutes les 5 minutes sur Bell
(CPUQuota 25 %) et chevauche chaque course de la sonde. Le commentaire dit ce qui est : aucun départ de la sonde ne chevauche une
publication ni `monark-probe` ; le collecteur tourne à côté, et les deux quotas font la moitié d'un vCPU sur deux. Un test lit les
unités du collecteur, exige sa grille de 5 minutes (donc le chevauchement), et borne la somme des deux quotas à un vCPU.

## Tests et tueurs

- `dojo_live_probe_mails_on_the_transition` (modifié : l'environnement n'a plus `SMTP_PASS`, le mot de passe vient du fichier, et le
  faux SMTP lit l'AUTH) : scripts/probe-dojo-live.mjs:282 CONST "readSmtpPass(opts.smtpPassFile ?? DEFAULT_SMTP_PASS_FILE)" -> "env.SMTP_PASS"
- `dojo_live_probe_reads_the_smtp_password_from_its_file_after_the_verifier` : le fichier n'existe qu'une fois l'enfant fini (l'enfant
  le crée) ; sont refusés un fichier ouvert au groupe (POSIX), un lien symbolique (POSIX), une valeur vide, deux lignes, et un
  fichier au-delà de `SMTP_PASS_MAX_BYTES` ; la §25 du RUNBOOK crée le fichier ; scripts/probe-dojo-live.mjs:249 CONST "(st.mode & 0o077) !== 0" -> "false"
- `dojo_live_probe_refuses_a_password_in_its_environment` : scripts/probe-dojo-live.mjs:210 CONST "(opts.env ?? process.env).SMTP_PASS !== undefined" -> "false"
- `dojo_probe_units_are_hardened` (modifié : `UnsetEnvironment` porte `SMTP_PASS`) : deploy/monark-dojo-probe.service:29 CONST " SMTP_PASS" -> ""
- `dojo_live_probe_judges_the_host_timeline_before_the_proxy` : scripts/probe-dojo-live.mjs:164 CONST "timeline && host.head === null" -> "false"
- `dojo_probe_timer_shares_the_host_with_the_collector` : deploy/monark-dojo-collect.service:54 CONST "CPUQuota=25%" -> "CPUQuota=80%"

Les numéros de ligne sont ceux de la tête.

## Mutants à la main (fichier restauré après chacun, sha256 vérifié)

- Tués : `O_NOFOLLOW` retiré (le test du lien), la borne `SMTP_PASS_MAX_BYTES` retirée, la fin de ligne gardée (deux tests).
- Équivalents sous Linux :
  - `!st.isFile()` retiré : un répertoire fait échouer `readFileSync` (EISDIR, rattrapé : `null`), une FIFO sans écrivain se lit vide
    (`O_NONBLOCK`) : `null` dans les deux cas. La garde reste, en défense ;
  - la garde `process.platform !== "win32"` retirée : rien ne change sous Linux par construction ; sous Windows, chaque fichier serait
    refusé et le test du courriel rougirait (rejeu Windows de MONARK).

## Preuves (Node v24.21.0)

- `node scripts/red-proof.mjs --base 1cddd2e5 --gel <tête> --draw 6 --seed 20261007` : `red-proof OK`, 6 tests jugés F2P (rouges à la
  base par `ERR_ASSERTION`), 9 inchangés ; 6 tueurs tirés, 6 tués. RED-PROOF.json, sha256 `aed587cd6a07925a…`.
- `node --test` de la sonde et de ses voisins (`probe-narabi`, `dojo-publish-deploy`, `dojo-collect-deploy`, `ci-gates`,
  `loopback-guard`) : 134 sur 134.
- `tsc --noEmit` : 0. eslint, `lang:gate`, `gate:vocab`, `lint:ratchet` (69/69) : propres. winlint `--base 1cddd2e5` : 7 fichiers,
  aucun danger.
- R-25 (forme de la CI, `docs/**/*.md` exclus) : 194 lignes, pour une borne de 547.
- Aucun réseau réel : serveurs et faux SMTP sur la boucle locale, par `test/helpers/loopback.ts`.
