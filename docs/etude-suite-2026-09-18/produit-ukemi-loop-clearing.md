# Produit — Ukemi mode L : loop-clearing

Le trou et l’audit des 6 idées EN : [ukemi-eisenberg-noe-audit.md](./ukemi-eisenberg-noe-audit.md).

**Statut.** Mode de **Ukemi**, pas un nouvel agent. Le seul sous-produit EN qui survit l’audit.

**Une phrase.** Le loop de l’utilisateur est un réseau Eisenberg–Noe à \(n\) petit. Choc \(D\) → équité résiduelle en **intervalle** → `flatten | reduce | hold`. Pas un health factor, pas un score.

---

## 1. Produit

### 1.1 Ce que c’est

1. Lire les jambes on-chain du wallet (Aave e-mode, un Morpho, un PT).
2. Construire \(\Pi, e, \bar p\) — le recyclage est le graphe.
3. Pour un choc nommé \(D\) (depeg LST, gap 53 h, unlock) : fictitious default → \(E(D)\).
4. Adapter → `Prediction`. Hikae → intervalle.
5. `GateDecision`. Kessai exécute l’unwind si `commit`.
6. Résidus nommés : `capo_oracle`, `lt_bonus_path_break`, `fire_sale_lambda`, `primary_closed_weekend`.

### 1.2 Ce que ce n’est pas

- Un oracle systémique Aave↔Compound.
- DeFi Saver (seuil 105 % → 110 %).
- Un searcher MEV.
- DebtRank / score 0–100.
- Un 12ᵉ kanji.

### 1.3 Objet

\[
p^* \;=\; \Phi_{\mathrm{EN}}(e,\Pi,D),\qquad E(D)=\text{équité résiduelle}.
\]

Cifuentes : \(D\) peut être endogène (\(P \leftarrow P - \Lambda Q_{\mathrm{liq}}\)). Rogers–Veraart : ne pas prétendre que \(p^*\) est unique si tu mets des coûts de liquidation dans \(\Phi\).

Analogie : LGD d’un dossier de crédit structuré (plusieurs tranches, un même underlying), pas un stress test BCE du système bancaire.

---

## 2. Acheteurs et chiffres

**Payeur.** Looper / risk lead (profil 03). Pas Aave DAO (Chaos a refusé $5 M).

| Fait | Chiffre | Source |
|---|---|---|
| Dette loopée (pic) | **>65 %**, equity **<15 %** | FC26 |
| Recursif Aave V3 | **>20 %** 2023–25 | BoC 2026 |
| Eligible @ 5 % LST | **$1,38 Md** ; bad debt protocole **$0** si continu | Gatto 2026 |
| Jump 10 % | **$47 M** bad debt protocole | Gatto |
| CAPO faux positif | **$26,9 M** | Chaos 2026 |
| DFS keeper | 0,05 %, trigger **point** | DFS août 2026 |
| Bonus e-mode | **1 %** (LT 0,95) | Gatto / Pool |

**Pricing.** 10–20 % du bonus évité, ou 2–8 bps du notionnel loopé / an, ou licence desk $2–10 k/mois. 12 mois solo : **$40–180 k** si 1–3 desks. Plafond : DFS ajoute un intervalle — alors le wedge = résidus nommés (CAPO, week-end, wrapping).

---

## 3. MVP 30 jours

- 1 wallet, Aave v3 ETH e-mode.
- \(D \in \{3,5,7,10\}\%\), \(n\le 3\).
- Histogramme \(E(D)\), pas de \(p\).
- Replay CAPO 10 mars 2026 + 10 oct. 2025.
- Telegram `flatten|hold`.

Pas de keeper au jour 1 (DFS l’a). Pas de token.

---

## 4. Biblio courte (ordre)

1. Eisenberg–Noe (2001) — fictitious default.
2. Gatto (2026) SSRN 7157638 — calibration live book.
3. DeFi Saver (août 2026) — ce que tu ne clones pas.
4. Rogers–Veraart (2013) — avant d’écrire « unique ».
5. Gibbs–Candès ACI + Chow (1970) — le feu.
6. Cifuentes / Lehar–Parlour — mode C, après.
