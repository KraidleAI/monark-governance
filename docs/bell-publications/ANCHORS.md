# ANCHORS — Bell publications (ADR-BELL-OTS-ANCHOR-1 D3, décisions 186 et 188)

Un registre séparé du registre de course (`docs/course-bell/ANCHORS.md`, gelé). Une ligne = une ancre OpenTimestamps d'un manifeste de publication (ADR D1 : la ligne signée `timeline.jsonl#L<n>` = son `line_hash`, le préfixe `timeline.jsonl#L1-L<n>` = le digest du miroir de l'étape 13, les deux immuables nommés par la ligne). Rempli et committé par l'orchestrateur seulement (R-20). Servi sous `/bell/anchors/` par `scripts/sync-bell-anchors.mjs` étendu (PR-A) ; l'état « anchored » n'est affirmé qu'avec un enregistrement de bloc Bitcoin dans la preuve (D5, D6), jamais sur une preuve pendante.

Limite (D8) : une preuve OpenTimestamps établit qu'un manifeste existait avant un bloc Bitcoin, jamais un instant. Une preuve pendante, dont le nonce est perdu, est une ancre perdue : la paire manifeste et preuve est copiée durablement dès le stamp (`F:/PRODUITS/bell-mirror/ots/`), avant tout `ots upgrade` (C-6).

| date_u | seq | kind | line_hash | prefix_sha256 | manifest_sha256 | commit | ots_ref | note |
|---|---|---|---|---|---|---|---|---|
| 2026-09-24T13:37:02Z | 2 | publication | `ef3b06f2ff93951e200a6559b42ab66df5ac4aa38b86d3aa763c118c766f6464` | `fba1824d9dc4a9218246dc9dd14107f89a6f14d2250c62a6cea0e3db7ccfd28b` | `602ff93d60dbf10fe96b0b2cfcd5b8ff439d2d0019f4daa362e9dd6ad3f16946` | `<commit>` | `timeline-seq2-manifest.txt.ots` | ancre de rattrapage (D9.1, GO 188), couvre seq 1 par le préfixe ; preuve pendante (4 attestations, 0 bloc) au commit, upgrade à rejouer ; ligne écrite le 2026-09-24T14:16:24Z |
