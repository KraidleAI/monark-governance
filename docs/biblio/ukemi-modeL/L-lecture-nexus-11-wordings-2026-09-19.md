# L — Lecture des 11 wordings Nexus Mutual procurés par l'investisseur (2026-09-19)
Lecteur `claude-sonnet-5` (effort max, discipline doc 03, aucun appel advisor pendant l'extraction) ; persisté par l'orchestrateur. Archive : `F:\PRODUITS\etude-2026-09-19\nexus-mutual\` (11 PDF + `SHA256SUMS.txt`, calculés par l'orchestrateur — le lecteur n'a pas Bash). Origine : `C:\Users\KACIMI\Downloads\nexus mutual\`.

## 0. Identification (11/11 authentiques Nexus Mutual / OpenCover×Nexus ; aucune collision)
| CID (court) | Titre exact | Pages | Produit | sha256 (16) |
|---|---|---|---|---|
| QmVqZC… | Nexus Mutual Baseline Yield Cover Terms and Conditions | 9 | Baseline Yield Cover (vault) | 651b5b426174c419 |
| QmaUco… | Nexus Mutual Crypto Cover Terms & Conditions | 15 | Bundled : Custody A + Protocol B + Depeg C + ETH Slashing D | 557c1bc06f7afda1 |
| QmRKcA… | Nexus Mutual ETH Slashing Umbrella Cover T&C | 5 | ETH Slashing umbrella | 635e20b90ea0fc41 |
| QmYgZN… | Nexus Mutual Follow-On Cover T&C | 6 | Follow-On (wrapper) | c551694a7f70b1b2 |
| **QmdvjhNEvF…** | **Nexus Mutual Leveraged Liquidation Cover Terms and Conditions** | **11** (pas 8) | Leveraged Liquidation Cover — **wording COURANT** | **b339a1f3f4af9ad2** (= sha annoncé ADR-M020, vérifié) |
| QmUJFW… | Vault Cover Terms and Conditions (opencover × Nexus) | 11 | Bundled Protocol A + Depeg B | 833cdac07028441d |
| QmYvjt… | The Retail Mutual Cover (« TRM Cover ») — Cover Wording | 9 | Stop Loss + Excess of Loss pour un MGA (le plus proche de « Quota Share ») | 46641998abbe1349 |
| Qma6vv… | Nexus Mutual Non-EVM Protocol Cover T&C | 10 | Protocol Cover non-EVM | a2312bac08d21d01 |
| QmW1ZU… | Nexus Mutual Fund Portfolio Cover T&C | 16 | Bundled A/B/C/D + Risk Framework + Governing Law (BVI) / Jurisdiction (Cayman) | c5a8ec11ad960cec |
| Qma8uA… | Nexus Mutual Generalized Fund Portfolio Cover T&C | 16 | idem QmW1ZU **sans** clauses 28-29 (Governing Law/Jurisdiction) | 2893de9a9373c3c0 |
| QmQQ88… | Nexus Mutual Protocol Cover Terms and Conditions | 10 | Protocol Cover standard EVM | 9d831f51fc158b38 |
Doublons : aucun strict ; QmW1ZU ≈ Qma8uA à deux clauses près.

## 1. Qui paie en cas de shortfall / insuffisance du pool
**Nexus Mutual (le mutual) est le payeur dans les 11 documents, jamais un tiers.** La variable est le niveau de calcul :
- **Précédent le plus net d'un payeur de shortfall AGRÉGÉ** : **Baseline Yield Cover (QmVqZC)** cl. 1.2 p. 2 « The Vault Liabilities being greater than the Vault Assets as at the most recent calendar quarter end » ; Claim Amount = excédent des Liabilities sur les Assets (cl. 3 p. 2) ; **deductible 0 %** pour cette clause (p. 7) ; symétrique cl. 9 Profit Share 20 % × Distributable Bonus versé au mutual. Stop-loss bidirectionnel sur le bilan d'un vault, trimestriel, non par déposant. **Fait nouveau pour Ukemi classe C.**
- « Liquidation Failure » (QmaUco p. 12 et famille Protocol Cover) : « Keepers are unable to liquidate collateral backing unhealthy borrow positions, resulting in bad debt that is subsequently socialized » — cause couverte (motif bad debt Aave), mais Claim Amount reste la perte individuelle sur 2 h.
- TRM (QmYvjt) : Stop Loss sur le livre entier du MGA (Aggregate Limit 50 % des contributions, Cover Year 2025/26) — payé au MGA.
- **Leveraged Liquidation Cover (Qmdvjh) : aucun mécanisme de pool** — tout par position individuelle (Impacted Account / Principal Funds), 11 pages vérifiées.

## 2. Wording courant Qmdvjh vs QmUcBkZQ (lecture antérieure)
- **Deemed liquidation 1.1.1** : identique mot pour mot (Fixed-rate / Hardcoded Oracle ; 1.1.1.1 contrefactuel « If the Designated Protocol had used a Market-Based Oracle instead, a liquidation would have actually occurred » ; 1.1.1.2 annonce publique de pertes matérielles) ; **toujours aucun organe ni méthodologie** pour trancher le contrefactuel.
- **Clause 1.2 nouvelle** (p. 2) : « the assets backing the Covered Token suffer material losses resulting in a change in the Reference Value by the Depeg Percentage » — nouveau covered event (Reference Value vs Market Value en 1.1), même mécanique individuelle ; ancienne 1.2 (Oracle Failure/Manipulation) → 1.3 ; conditions communes renumérotées 1.4-1.7 ; calcul cl. 2 regroupe 1.1 et 1.2.
- **« Pas de shortfall » : TIENT** pour le wording courant. Payeur des primes = bénéficiaire = looper individuel (« "User" means the end-user of the Designated Protocol », p. 9) — option A de la typologie advisor-marché.
- Assessment par vote : condition opérative explicite dans 9/11 documents ; **absente dans Qmdvjh** (définition passive de Claim Assessor p. 6 seulement) et dans TRM.
- Délais Qmdvjh : cool-down 7 j, fenêtre 35 j après Cover Period, **aucune clause « Redeeming »** (p. 6-7). Comparatif complet dans le rapport lecteur (Baseline Yield 1 j / 90 j / 30 j ; Bundled A 14 j-100 j / 120 j ; ETH Slashing 72 h / 60 j ; TRM 425 j).

## 3. Exclusions
Oracle : exclusion dans la famille Protocol Cover (mouvements de prix, sauf seuils Oracle Failure 1 % stable / 2,5 % autres) — absente de Qmdvjh (c'est le covered event). Depeg : exclu du volet Protocol dans les bundles (anti double compte). **Governance : jamais une exclusion** — péril couvert « Governance Takeovers » (famille Protocol Cover) ; absent de Qmdvjh. Exclusion commune phishing / clés / malware / miner behaviour (Qmdvjh cl. 5.2 p. 3).

## 4. Contradictions relevées (non tranchées)
1. Qmdvjh : deductible **5 % vs 2,5 %** — Explanatory Note 1 (p. 10-11 : $2 500/$100 000) contredit la définition et la Note 2 (5 %, p. 7/11) ; seul document à deux Explanatory Notes ; persistant depuis QmUcBkZQ.
2. Numéro de société CRS : 11353187 dans 8 docs ; **14509454** dans QmYgZN (attribué ailleurs à « Future Risk Solutions », QmYvjt p. 6) — copier-coller probable.
3. « Claim Amount » (Qmdvjh p. 6) renvoie à la clause 5 (Exclusions) au lieu de la 4 — erreur persistante.

## 5. NON TROUVÉ
Terme « Quota Share » verbatim (plus proche : Stop Loss/XoL TRM) ; **toute Annexe instanciée** (tokens couverts, Depeg Percentage, Acceptable Leverage Limit, Cover Amount, primes) — absente des 11 ; référence on-chain désignant Qmdvjh comme courant (vient de la page « Cover wordings », non revisitée) ; Member Agreement (lien p. 1, non ouvert) ; date d'effectivité dans Qmdvjh.

## 6. Conséquences pour ADR-M020
- PR-UK-8 : « 8 p. » → **11 p.** (erreur de l'orchestrateur, `error_origin` orchestrateur) ; sha `b339a1f3…` **vérifié** ; procurement « wording courant » **CLOS** (lecture faite).
- Classe C (payeur de shortfall) : **précédent Baseline Yield Cover** à porter dans l'avis payeur (ADR-M020 / advisor-marché) — un mutual peut payer un shortfall de bilan agrégé, deductible 0 %, avec profit share symétrique.
- Reste formé : Annexe instanciée (demande de procurement : page « Cover wordings » docs.nexusmutual.io + Member Smart Contract Data d'un cover réel — à lire dans le navigateur intégré à la prochaine occasion).
