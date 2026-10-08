# FAITS — périmètre des sauvegardes Hostinger du VPS Bell (I-G2-2, lecture sur place, orchestrateur `claude-fable-5-1`, 2026-09-23 16:4x UTC)

Contexte : item I-G2-2 (lot T-1b-backend, cp-1 C-8/G-b) — « lecture du périmètre des sauvegardes Hostinger AVANT la génération de la clé Ed25519 » ; ruling R-T1b-3 (ESC-2 : formule de garde de la clé arrêtée après cette lecture). Lecture via Claude in Chrome, session investisseur hPanel (décision 148 « GO pour tout »), aucune modification de compte.

## 1. Pages lues [lu]

- `https://hpanel.hostinger.com/vps` — deux VPS : `srv1969719.hstgr.cloud` KVM 2 `monarkgate.tech` (vitrine/harness, expire 2026-10-10) ; **`srv1993906.hstgr.cloud` KVM 2 `bell.monarkgate.tech`** (Bell, « En cours d'exécution », expire 2026-10-20).
- `https://hpanel.hostinger.com/vps/1993906/overview` — Ubuntu 26.04 LTS, Paris, 2 cœurs / 8 GB / 100 GB, disponibilité « 3 jours 11 heures », « Snapshot et sauvegardes : 0 », « Planification actuelle des sauvegardes : Hebdomadaires », « Renouvellement automatique : Activé », pare-feu « 0 » règle, scanner de logiciels malveillants « Pas installé ».
- `https://hpanel.hostinger.com/vps/1993906/backups` — « Aucune sauvegarde pour le moment » ; « Les sauvegardes sont exécutées automatiquement, en fonction du programme sélectionné » ; « Programme actuel de sauvegarde : Hebdomadaires » ; offre payante « sauvegardes quotidiennes automatiques 5,99 €/mois » (non souscrite) ; snapshot manuel : « Un snapshot capture l'état actuel de votre VPS, y compris les fichiers, les configurations et les paramètres système » (citation ≤ 25 mots).

## 2. Faits retenus

| fait | valeur | source |
|---|---|---|
| sauvegardes existantes au 2026-09-23 | 0 | overview + backups |
| programme | hebdomadaire, automatique, inclus dans le pack | backups |
| périmètre | image de l'état du VPS : fichiers, configurations, paramètres système (snapshot ; les sauvegardes hebdomadaires sont du même type, Hostinger ne documente pas d'exclusion de chemin sur la page) | backups |
| exclusion de chemins possible | NON documentée sur la page (aucune option de périmètre) — [abs] pour la documentation Hostinger détaillée | backups |
| sauvegardes quotidiennes | offre payante non souscrite, NON retenue | backups |
| pare-feu hPanel | 0 règle (le pare-feu de l'hôte est celui d'Ubuntu) | overview |

## 3. Conséquence pour ESC-2 (ruling orchestrateur R-T1b-3, décision 148)

Toute clé privée écrite sur le disque du VPS Bell sera **incluse dans les sauvegardes hebdomadaires Hostinger** (copie hors de notre contrôle, chiffrement et rétention non lus). Aucune exclusion par chemin n'est offerte. Options examinées : (a) clé chiffrée au repos par `systemd-creds encrypt` — la clé d'hôte `/var/lib/systemd/credential.secret` est sur le même disque, donc dans la même image : protection nulle contre l'image ; TPM absent sur KVM (non vérifié, [abs]) ; (b) refuser les sauvegardes — le programme hebdomadaire est celui du pack, sa désactivation n'est pas offerte sur la page ; (c) **accepter et borner** : la clé Bell ne signe que des faits publics (origine, jamais vérité — ADR-B0 D2, décision 78) ; sa compromission se traite par **rotation contre-signée** (ADR-T1b §D13), jamais par une perte de données.

**Formule ESC-2 arrêtée** : (1) clé générée SUR le VPS Bell par l'orchestrateur (jamais sur le poste, jamais dans le dépôt), fichier `/etc/credstore/bell-ed25519.key` en `0600 root:root`, chargée par `LoadCredential=` dans un service sans réseau (`PrivateNetwork=yes`, ADR-T1b §D8) ; (2) **fait déclaré dans l'ADR et sur `/bell/method`** : « the private key is contained in the host provider's weekly backups » — toute restauration de sauvegarde ou snapshot manuel ultérieur est traité comme un **événement d'exposition ⇒ rotation contre-signée immédiate**, journalisée dans la timeline servie ; (3) aucun snapshot manuel n'est créé (bouton non utilisé) ; (4) la clé publique est publiée par trois canaux concordants (`/bell/pubkey.json`, ADR, README) et le trousseau committé est la racine de confiance (cp-1 C-9) ; (5) item **BELL-KEY-ROTATION-CAL-1** : rotation planifiée au premier des deux : incident d'exposition ou 90 jours (propriétaire orchestrateur, déclencheur daté 2026-12-22). Porte I-G2-2 LEVÉE ; la génération de la clé attend le G7 PR-1/PR-2 (outillage de rotation présent avant la première clé).
