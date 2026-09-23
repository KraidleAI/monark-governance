> Persisté par l'orchestrateur `claude-fable-5-1` le 2026-09-23 depuis `F:/tmp/t1b-g0/RULINGS-orchestrateur.md` (sha256 1da85a27b18538054fb58e70ee8442daf1f996eda7057c1a8d3e375e1809e787). G0 par le worker Opus 5.5 ; checkpoint-1 ACCEPTE-AVEC-CORRECTIONS C-1..C-10 pliées (v2) ; rulings R-T1b-1..7 ; DNS posé 13:49Z ; décision 147 (E-2 close).

# Rulings orchestrateur sur le G0 T-1b-backend (Fable 5.1, décision 143, 2026-09-23 13:44Z)

Entrée : `ADR-T1b-backend.md` (sha256 d32ed37e…), `SPRINT-BACKLOG.md` (ab2f184e…), `RENDU.md` (b3beeea5…).

- **R-T1b-1 — `earliest_publish_utc`** : « refus du lot entier dès qu'une session est en avance » RETENU (le `bell_sha` reste celui du collecteur ; aucune publication partielle).
- **R-T1b-2 — `close_source`** : NON servi (même motif que `adv_source` : décision 69, aucun nom de fournisseur de données cash sur une surface publique ; le second `test()` de `no-cash-provider-name.test.ts` couvre les deux champs).
- **R-T1b-3 — ESC-2 (garde de la clé)** : formule arrêtée APRÈS I-G2-2 (lecture du périmètre des sauvegardes Hostinger, acte investisseur) ; aucune clé générée avant. Porte maintenue.
- **R-T1b-4 — K-1** : DÉCOUPLÉ de T-1b (objet = clé Narabi, `flow.ts:52`) ; K-1 reste un item à son propre déclencheur ; CHANTIERS :45/:84 à amender au G7 du lot.
- **R-T1b-5 — E-1 (report de la collecte VPS au lot b)** : option C RETENUE sous la décision 143 (choix de périmètre journalisé, investisseur informé) ; jusqu'au lot b, la publication est un acte opérateur et la cible « ≤ 10 min » d'ADR-B0 D8 n'est ni tenue ni revendiquée (à écrire dans l'amendement ADR-B0 D2/D8).
- **R-T1b-6 — E-2 (exposition des fichiers de données avant le retour du juriste, décision 79)** : HORS de ma délégation (acte juridique/identité) → ESCALADE-INVESTISSEUR maintenue ; le lot peut être codé et déployé jusqu'à la porte « première publication » exclue ; Bell reste `upcoming`.
- **R-T1b-7 — NARABI-COPY-ATOMIC-1** : item formé accepté (propriétaire orchestrateur ; déclencheur : prochain lot touchant `apps/narabi/.../run.ts` ou tout redéploiement Narabi).
- Actes investisseur nommés, non faits : DNS A `bell.monarkgate.tech`, décision sauvegardes (I-G2-2), clé/compte Helius pour le lot b.

## Rulings complémentaires (orchestrateur, 13:59Z et 14:07Z, pour le pli v2 des corrections cp-1)
- C-1 : déviation de la décision 54 (`.timer` de collecte → lot b) journalisée, `error_origin` planificateur, investisseur informé (CHANTIERS 14:08 UTC).
- C-2 : BELL-ACCESS-LOG-1 déclenché par la décision 78 ; AUCUN journal d'accès Caddy jusqu'à ce déclencheur ; forme RGPD rulée alors (GO 147 couvre les textes).
- C-5 : Caddyfile dédié remplacé en bloc et importé par le Caddyfile principal si l'hôte en porte un, sinon remplacement.
- C-9 : racine de confiance = trousseau committé (`--keyring`) ; absent ⇒ « auto-cohérent seulement ».
- C-10 : un seul chemin de clé publique, `/bell/pubkey.json`, servi ET référencé par ADR-B0/78 (amendement) ; hôte = Bell (`bell.monarkgate.tech`), ruling confirmé après lecture du rendu v2.
- Mission G1 PR-1 : base = pointe `lot/etude-suite` ≥ `adc3260`, worktree `F:\Monark-wt-t1b` (branche `lot/t1b-backend`), rendus sous `F:\tmp\t1b-a1\`.
