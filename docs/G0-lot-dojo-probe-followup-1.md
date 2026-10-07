# G0 du lot DOJO-PROBE-FOLLOWUP-1 : les notes N-1, N-3 et N-4 de la G2 de #220 (la sonde du Dōjō)

RECHERCHES, 2026-10-07. Base `1cddd2e5` (tronc `lot/etude-suite`). Item : `docs/ETAT.md` l.1505-1512 (DOJO-PROBE-FOLLOWUP-1).
Sources : la G2 de #220 (pièce `pieces/2026-10-07-G2-220/G2-220.md` de RECHERCHES, notes N-1 à N-4) ; le partage 80/20 de MONARK,
item 5 (« N-1 d abord : `SMTP_PASS` lu d un fichier `0600` au moment d envoyer »). Ce lot ne touche ni Bell, ni un déploiement, ni
un secret : du code, des tests et le texte du RUNBOOK que le fondateur jouera.

## Provenance

- Modèle : `claude-opus-5-5`, effort non consigné à la rédaction. Heure lue au départ (`date -u`) : 2026-10-07T09:06:07Z.
- Pli de la G2 de MONARK (message `2026-10-07-MONARK-vers-RECHERCHES-g2-229-230`, trois M et six m) : `claude-opus-5-5`, effort low
  (réglage de la session de pli), heure lue 2026-10-07T10:15:30Z. Un commit ordinaire, `6ecf76d1`, d'un seul parent (`e6318730`),
  sans réécriture (corrigé au pli suivant : ce point disait « commits de fusion seuls », vrai du seul `f83e3c30` de la partie 2).
- Pli de la décision de MONARK (message `2026-10-07-MONARK-vers-RECHERCHES-229-230-plis-recus`, question 1) : l'acte du courriel de
  la §25 prend le libellé (4b), après (4) et avant le timer, qui garde (5). Texte et épingles du test seuls, sans effet sur le code ;
  `claude-opus-5-5`, effort low (défaut de l'agent, non consigné alors ; erratum 23 de l'atelier RECHERCHES), heure lue
  2026-10-07T10:49:50Z. Ces deux plis à effort low sont hors du réglage des corrections (effort max) ; MONARK le consigne au JOURNAL.
- Pli de la G2 ciblée de MONARK (message `2026-10-07-MONARK-vers-RECHERCHES-g2f-229-230`, commit `f46b464` de RECHERCHES, cinq m) :
  `claude-opus-5-5`, **effort max**, heure lue au départ (`date -u`) 2026-10-07T11:55:38Z. Commits ordinaires sur `5dad61fa`, sans
  réécriture.
- Worktree détaché neuf à chaque pli ; `/home/user/monark-governance` n'est pas modifié. Node v24.21.0.
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

1. **Le mot de passe vient d'un fichier, lu au moment d'envoyer.** `readSmtpPass(path)` ouvre le fichier (`O_NOFOLLOW` hors Windows :
   seul un lien symbolique au dernier composant du chemin est refusé ; un lien dur n'est pas vu), lit son `fstat` sur le même
   descripteur, exige un fichier régulier d'au plus `SMTP_PASS_MAX_BYTES` (1 024) octets et, sous POSIX, aucun bit de groupe ni d'autre
   (`mode & 0o077 === 0`). Il lit ensuite UN tampon de `SMTP_PASS_MAX_BYTES + 1` octets sur le même descripteur et refuse un compte
   d'octets autre que la taille du `fstat` (un fichier qui a grossi ou rétréci, un périphérique) : la lecture est bornée, jamais
   jusqu'à EOF. Le texte doit être de l'UTF-8 valide (`TextDecoder` en `fatal: true`) sans BOM (`ignoreBOM: true`, puis U+FEFF
   refusé), une seule ligne, sa fin de ligne (`\n` ou `\r\n`) ôtée, non vide. Tout autre cas rend
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
4. **Le RUNBOOK §25.** L'acte (1b) crée le fichier par l'analyseur de systemd lui-même : `install` le crée vide (`probe`, 0600),
   puis une tâche transitoire `systemd-run --wait --collect --quiet -p EnvironmentFile=/etc/monark/probe.env` y écrit la valeur de
   `SMTP_PASS` développée DANS la tâche (`printf "%s\n" "$$SMTP_PASS"`, entre guillemets simples côté appelant : le gestionnaire
   développe les variables d'une commande transitoire et rend `$$` en `$`, systemd-run(1) [lu : `man/systemd-run.xml` de systemd,
   branche main, dernier commit du fichier `06247b08` (2026-07-14 ; blob `e9c63843`), l.102-105 ; tag v259 (objet `b2a31f27`, commit
   `9ca43348` ; blob `d18b80fa`), l.100-101, la version de Bell (`systemd 259 (259.5-0ubuntu3.4)`, `docs/RUNBOOK-bell.md` l.77)],
   donc le shell de la tâche reçoit `"$SMTP_PASS"`). La valeur est donc celle que systemd donne à `monark-probe` (guillemets et échappements défaits, dernière
   affectation gagnante), non le texte brut de la ligne. Le `stat` de (1b) lit le propriétaire et le mode (`probe 600`) ; la taille
   n'est jamais imprimée, (1b) n'affiche que `size-ok`. Un acte (4b), avant le timer, prouve le chemin du courriel sur la forme du §2
   du déploiement de la sonde dans RUNBOOK-sentinel : départ simulé forcé malsain (`--now` à +2 j, `--out` jetable), fichier de mail
   appliqué par systemd, `-p UnsetEnvironment=SMTP_PASS` ; attendu `"alert_error": null`. Il s'ouvre par `rm -f` de la fiche jetable
   (décision de MONARK) : la sonde lit son alerte précédente dans `--out` (`readPriorAlert`), et la fiche d'une course coupée
   (`alerted: true`, même jour) réafficherait l'attendu sans envoi. Il envoie UN vrai courriel, à l'adresse
   d'alerte déjà configurée et à nulle autre, et entre dans l'autorisation de déploiement unique (Q-20). Il demande l'arbre de (2) :
   il se place donc après (4) et avant le timer, qui garde (5) ; d'où son libellé (4b). La liste « Never » de la sonde nomme
   `/etc/monark/dojo-probe-smtp-pass` (cat, head, tail, less, xxd, od, base64, tout digest affiché). Le fichier de (1b) est une
   seconde copie de `SMTP_PASS` : RUNBOOK-sentinel (§1 du déploiement de la sonde) et l'acte (9) neuf de la §25 disent qu'après la pose
   ou le changement de `SMTP_PASS`, (1b) puis (4b) sont rejoués ; sans eux, le premier courriel dû de la sonde échouerait en
   `smtp_auth_failed`, visible à la seule lecture quotidienne (7). Le test de la §25 épingle (1b), (4b), leur ordre ((1b), (4),
   (4b), puis le timer en (5)), la liste et, dans le seul bloc de (4b), la ligne systemd-run de `--uid=probe --gid=probe` à `$C`,
   `--now $N`, le `--out` jetable et l'ouverture par `rm -f` ; il épingle aussi la règle de rotation dans les deux RUNBOOK. Tout le
   §25 reste au fondateur.

Ce que N-1 ne fait pas : le fichier reste lisible par l'uid `probe`, donc par un enfant compromis qui l'ouvrirait lui-même. Une
frontière vraie demande l'enfant sous un autre uid (un acte de déploiement, hors de ce lot) : item DOJO-PROBE-UID-BOUNDARY-1, que
MONARK forme dans ETAT avant le G7 de ce lot (périmètre avec `monark-probe.service`, constructions candidates et leur prix,
déclencheur avant DOJO-PROBE-MIRROR-1). Le gain est réel mais borné : le secret
n'est plus dans `/proc/<ppid>/environ`, n'est hérité par aucun processus, et n'est en mémoire du parent qu'après la fin de l'enfant.

Windows : il n'y a pas de bits de mode POSIX. Node y rapporte `0o666` ou `0o444` quel que soit l'ACL ; le contrôle des bits y est
sauté (motif `test/dojo-collect-deploy.test.ts` l.190) et le fichier est accepté. La sonde ne tourne que sur Bell (Linux). Les deux
cas propres à POSIX (fichier ouvert au groupe, lien symbolique) sont dans un sous-test sauté sous win32, avec la raison « win32: no
POSIX mode bits, no O_NOFOLLOW » : le rapport de Windows dit ce qu'il ne vérifie pas.

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
  faux SMTP lit l'AUTH) : scripts/probe-dojo-live.mjs:285 CONST "readSmtpPass(opts.smtpPassFile ?? DEFAULT_SMTP_PASS_FILE)" -> "env.SMTP_PASS"
- `dojo_live_probe_reads_the_smtp_password_from_its_file_after_the_verifier` : le fichier n'existe qu'une fois l'enfant fini (l'enfant
  le crée) ; sont acceptés `"pw\r\n"` (rend `pw`) et `"x".repeat(1023) + "\n"` (1 024 octets) ; sont refusés une valeur vide, une
  ligne vide, deux lignes, un fichier au-delà de `SMTP_PASS_MAX_BYTES`, un BOM et un octet UTF-8 invalide ; sous POSIX (sous-test),
  un fichier ouvert au groupe et un lien symbolique ; sous Linux (sous-test, sauté ailleurs avec sa raison), un fichier régulier de
  procfs dont la taille du `fstat` n'est pas le compte d'octets (`/proc/self/personality` : 0400, taille 0, 9 octets lus) ; la §25 du
  RUNBOOK crée le fichier par systemd et prouve le courriel avant le timer (sous l'uid de l'unité, départ forcé, fiche jetable
  effacée d'abord), et la rotation de `SMTP_PASS` rejoue (1b) puis (4b), dans RUNBOOK-sentinel et dans la §25 ;
  scripts/probe-dojo-live.mjs:248 CONST "st.size > SMTP_PASS_MAX_BYTES" -> "false" (tué sous les deux plateformes par le cas
  de 1 025 octets ; l'ancien tueur `:249` sur les bits de mode était mort-né sous win32, constat M1 de la G2)
- `dojo_live_probe_refuses_a_password_in_its_environment` : scripts/probe-dojo-live.mjs:210 CONST "(opts.env ?? process.env).SMTP_PASS !== undefined" -> "false"
- `dojo_probe_units_are_hardened` (modifié : `UnsetEnvironment` porte `SMTP_PASS`) : deploy/monark-dojo-probe.service:29 CONST " SMTP_PASS" -> ""
- `dojo_live_probe_judges_the_host_timeline_before_the_proxy` : scripts/probe-dojo-live.mjs:164 CONST "timeline && host.head === null" -> "false"
- `dojo_probe_timer_shares_the_host_with_the_collector` : deploy/monark-dojo-collect.service:54 CONST "CPUQuota=25%" -> "CPUQuota=80%"

Les numéros de ligne sont ceux de la tête.

Ré-ancrage (constat M3 de la G2) : ce lot déplace des lignes de la sonde ; les tueurs des neuf tests qu'il ne change pas suivent
leurs lignes, texte inchangé : :161→:168, :162→:169, :68→:74, :191→:198, :190→:197, :220→:228, :147→:153, :48→:54, et
:306→:333 (MONARK donnait :330 à `e6318730` ; la lecture bornée ajoute trois lignes). `verifie-ancres` de RECHERCHES sur l'arbre
plié : « tueurs 1523 ; ANCRE 1523 ; DERIVE 0 ; PERDU 0 ». Chacun des 15 tueurs du fichier, tiré seul à la tête, fait rougir son
propre test par assertion. Le pli de la G2 ciblée ne touche pas le code de la sonde : rejoué sur son arbre, `verifie-ancres` donne
« tueurs 1523 ; ANCRE 1523 ; DERIVE 0 ; PERDU 0 » (fichier : 15 sur 15, contre `5dad61fa`), et les 15 tueurs, tirés chacun seul,
rougissent chacun leur test par assertion (cinq rougissent aussi un test voisin, par la même mutation de la sonde).

## Mutants à la main (fichier restauré après chacun, sha256 vérifié)

- Tués (par assertion, seul le test du mot de passe rougit) : `O_NOFOLLOW` retiré (le lien), la borne `st.size > ...` remplacée par
  `false` ou par `>=` (les cas de 1 025 et de 1 024 octets), `fatal: true` → `false` (l'octet invalide), `ignoreBOM: true` → `false`
  (le BOM), `/\r?\n$/` → `/\n$/` (le cas CRLF), le contrôle des bits de mode retiré (sous POSIX). La lecture par chemin (mutant D de
  la G2) n'est plus exprimable : la lecture se fait par `readSync` sur le descripteur.
- `n !== st.size` remplacé par `false` (survivant déclaré jusqu'au constat F2 de la G2 ciblée) : tué sous Linux par le sous-test
  procfs (`'00000000' !== null`, ERR_ASSERTION ; seul le test du mot de passe rougit). La raison donnée avant (« seule une course le
  distingue ») était inexacte : un fichier régulier de procfs annonce une taille 0 et rend des octets, sans course (vérifié ici :
  `stat` donne `regular empty file 400`, `readSync` rend 9 octets `00000000\n` ; source du noyau lue par MONARK, fs/proc/base.c).
  Sous Windows, le sous-test est sauté et ce mutant y survit.
- Mutants du RUNBOOK, tués par assertion (seul le test du mot de passe rougit) : dans (4b), `--uid=probe --gid=probe` retiré (R1 du
  constat F1 : la preuve lancée en root), `--now $N` retiré (R2 : aucun courriel dû), le `--out` jetable changé, l'ouverture par
  `rm -f` retirée ; « (1b) then » retiré de la règle de rotation, dans RUNBOOK-sentinel ou dans l'acte (9) ; l'acte (9) sans son
  libellé.
- Survivants déclarés :
  - `SMTP_PASS_MAX_BYTES + 1` → `SMTP_PASS_MAX_BYTES` (le tampon) et `n !== st.size` → `n > st.size` : atteints par une course
    seulement (constat F2), un fichier qui change entre le `fstat` et la lecture. Le premier n'accepte qu'un fichier annoncé à
    1 024 octets qui a grossi (lu tronqué à sa taille), le second qu'un fichier qui a rétréci (moins d'octets lus que sa taille).
    Aucun test ne produit cette course ; que la lecture reste bornée par le tampon de `SMTP_PASS_MAX_BYTES + 1` octets n'est tenu
    par aucun test.
  - la position `0` de `readSync` remplacée par `null` (la position courante) : équivalent, le descripteur est neuf (position 0).
  - `!st.isFile()` retiré (reclassé, constat m de la G2) : il n'est PAS équivalent en général. Sans lui, un répertoire échoue à la
    lecture (EISDIR, rattrapé : `null`) et une FIFO échoue à la lecture positionnée (rattrapé : `null`) ; un périphérique caractère (`/dev/zero`, taille
    0 au `fstat`) rend `SMTP_PASS_MAX_BYTES + 1` octets, refusés par `n !== st.size`. Avant la lecture bornée, il était survivant sur
    périphérique (lecture sans fin) ; avec elle, il est équivalent sous les cas connus, et la garde reste, en défense ;
  - la garde `process.platform !== "win32"` retirée : rien ne change sous Linux par construction ; sous Windows, chaque fichier serait
    refusé et le test du courriel rougirait (rejeu Windows de MONARK).

## Preuves (Node v24.21.0, Linux ; arbre plié)

- `node scripts/red-proof.mjs --base 1cddd2e5 --gel <arbre plié> --draw 6 --seed 20261007` : `red-proof OK`, 6 tests jugés F2P
  (rouges à la base par `ERR_ASSERTION`), 9 inchangés ; 6 tueurs tirés, 6 tués, dont `:248`. RED-PROOF.json, sha256
  `a1a5ad885e2066bf…`. Rejoué au pli de la G2 ciblée, même commande sur son arbre : `red-proof OK`, 6 jugés F2P, 9 inchangés,
  6 tueurs tirés et tués (dont `:248`), refusals vide ; digest du gel `614bd0a9b5049bd0…` (les `docs/**/*.md` sont hors du digest).
- Windows : MONARK a rejoué `6ecf76d1` et `5dad61fa` sous Windows (G2 ciblée, pièce `g2f-229-230.json`) : 15 tests réussis et le
  sous-test POSIX sauté avec sa raison, red-proof OK (6 tueurs tirés, 6 tués, dont `:248`). L'arbre du pli de la G2 ciblée n'y a pas
  tourné : le sous-test procfs y est sauté avec sa raison (« procfs is Linux only »), et `n !== st.size` → `false` y survit ; les
  épingles du RUNBOOK ne dépendent d'aucune plateforme.
- `node --test` de la sonde : 17 sur 17 (15 tests et 2 sous-tests). Avec ses voisins (`probe-narabi`, `probe-narabi-state`,
  `dojo-publish-deploy`, `dojo-collect-deploy`, `ci-gates`, `loopback-guard`, `verify-dojo`) : 151 sur 151 (150 avant le sous-test
  procfs). Un premier jet de (1b) par `printenv` rougissait
  `dojo_runbook_never_prints_private_key` (le RUNBOOK n'a pas de `printenv` hors de ses passages d'interdits) : (1b) écrit donc par
  `printf`, comme MONARK l'a décidé.
- `tsc --noEmit` : 0. eslint `.` : 0. `lang:gate`, `gate:vocab` (348 fichiers), `export:check` : propres. `lint:ratchet` : 69/69.
  winlint `--base 1cddd2e5` : 8 fichiers (RUNBOOK-sentinel en plus), aucun danger. `verifie-ancres` : 0 PERDU sur tout le dépôt.
- R-25 (forme de la CI, `docs/**/*.md` exclus) : 190 + 55 = 245 lignes, pour une borne de 547 (234 avant ce pli).
- Aucun réseau réel : serveurs et faux SMTP sur la boucle locale, par `test/helpers/loopback.ts`.
