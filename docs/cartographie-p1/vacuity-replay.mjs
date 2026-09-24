// docs/cartographie-p1/vacuity-replay.mjs — reproduces ADR-M019 D2 vacuity on the served cascade class.
// Read-only, disposable, deterministic (NO timestamp). Node 24 strips TS types natively; @monark/* resolve
// via the workspace node_modules. Run from repo root: `node docs/cartographie-p1/vacuity-replay.mjs`.
// Claim under test: cascade-liquidable-24h abstains under_calib and its GateDecision is BYTE-IDENTICAL
// for yhat ∈ {100, 999999, −5} — the Ukemi prediction CONTENT does not influence the served decision.
import { createHash } from "node:crypto";
import { runGate } from "../../apps/harness/src/tools/gate.ts";

const PARAMS = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0, tool: "perps_order_preview", clockOpen: true };
const cascadePred = (yhat) => ({ schema_version: "1.0.0", task_class: "cascade-liquidable-24h", yhat, predictor_id: "internal:ukemi-cascade-v0", produced_at: "2026-09-04T00:00:00Z" });

// Canonical JSON with recursively sorted keys ⇒ a stable digest independent of key order.
function canon(v) {
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  if (v && typeof v === "object") return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
  return JSON.stringify(v);
}

const YHATS = [100, 999999, -5];
const rows = YHATS.map((y) => {
  const d = runGate(cascadePred(y), { ...PARAMS });
  const s = canon(d);
  return { yhat: y, action: d.action, reason: d.reason, region: d.verdict.region, qhat: d.verdict.qhat, n_calib: d.verdict.n_calib, sha256: createHash("sha256").update(s, "utf8").digest("hex") };
});

const digests = [...new Set(rows.map((r) => r.sha256))];
const identical = digests.length === 1;
for (const r of rows) console.log(`yhat=${String(r.yhat).padStart(7)}  action=${r.action}  reason=${r.reason}  region=${canon(r.region)}  qhat=${JSON.stringify(r.qhat)}  n_calib=${r.n_calib}  sha=${r.sha256.slice(0, 16)}`);
console.log("distinct_decision_digests=" + digests.length + "  (byte-identical across yhat: " + identical + ")");
console.log("region_label_schema=" + (rows[0].region.label_schema ?? "(none)") + "  region_kind=" + rows[0].region.kind + "  labels=" + JSON.stringify(rows[0].region.labels));
console.log("VACUITY_CONFIRMED=" + (identical && rows.every((r) => r.reason === "under_calib")));
