# FAITS-RESERVED-NAMES-CERTS-1 — RFC 2606 §2 et CA/Browser Forum BR (noms réservés, certificats publics) lus sur place (orchestrateur, 2026-09-27) — complète FAITS-RFC6761-INVALID-1 (lot RG-RECONCILE-1c, Q-5)

Méthode : navigateur interne refusé (`rfc-editor.org` « denied », 19:1xZ) ; lecture par `curl` de la page primaire, comme pour RFC 6761 à 14:07:53Z. Copies brutes : `F:\tmp\dojo\rfc2606.txt` (sha256 `b6869c898470…`), `F:\tmp\dojo\cabforum-BR.md` (sha256 `e4a399749c29…`).

## RFC 2606 (BCP 32), « Reserved Top Level DNS Names », Eastlake & Panitz, juin 1999 — `https://www.rfc-editor.org/rfc/rfc2606.txt`, HTTP 200, 19:13:14Z
- §2 [lu] : quatre TLD réservés « .test », « .example », « .invalid », « .localhost », « without fear of conflicts with current or future actual TLD names in the global DNS ».
- §2 [lu] : « ".invalid" is intended for use in online construction of domain names that are sure to be invalid and which it is obvious at a glance are invalid. »

## CA/Browser Forum, « Baseline Requirements for the Issuance and Management of Publicly-Trusted TLS Server Certificates », **version 2.3.0** (dépôt primaire du Forum `github.com/cabforum/servercert`, `docs/BR.md`, branche `main`, lu par `raw.githubusercontent.com`, HTTP 200, 19:16:31Z, 4 146 l.)
- §1.6.1 Definitions, l.375 [lu] : « **Internal Name**: A string of characters (not an IP address) in a Common Name or Subject Alternative Name field of a Certificate that cannot be verified as globally unique within the public DNS at the time of certificate issuance because it does not end with a Top-Level Domain registered in IANA's Root Zone Database. »
- §4.2.2 Approval or rejection of certificate applications, l.1335 [lu] : « CAs SHALL NOT issue Certificates containing Internal Names or Reserved IP Addresses, as such names cannot be validated according to Section 3.2.2.4 … »
- Historique l.64 [lu] : ballot 112 (2014-04-03) remplace « Internal Server Name » par « Internal Name ».

## Conséquence pour RG-RECONCILE-1c (TY-9, seconde barrière « la clé ne part que dans une session TLS validée »)
- `.invalid` est réservé (RFC 2606 §2) et n'est pas délégué dans la zone racine de l'IANA (il figure au registre des noms à usage spécial de RFC 6761, pas au Root Zone Database) ⇒ tout nom en `.invalid` est un **Internal Name** au sens BR §1.6.1 ⇒ aucune AC publiquement reconnue ne PEUT émettre de certificat pour lui (BR §4.2.2, « SHALL NOT »). Une session TLS « validée » vers `x.invalid` sous un magasin de confiance public est donc impossible ; la classe de test `.invalid` ne peut pas faire sortir la clé par TLS validé. [inf] à partir des trois passages [lu].
- Limite déclarée → item : un magasin de confiance local altéré (AC privée ajoutée sur l'hôte) contourne la barrière ; couvert par HELIUS-TLS-BARRIER-1 (Q-7 de 1c, déclencheur avant A-7) — l'ADR le cite.
- Non lu ici : la liste IANA Root Zone Database elle-même (l'absence de `.invalid` y est une conséquence de RFC 2606/6761, [2nd] tant qu'elle n'est pas lue) — ligne à ajouter si un G2 la demande.
