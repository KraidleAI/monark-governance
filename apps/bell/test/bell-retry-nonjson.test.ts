// MONARK Bell -- BELL-RETRY-1: a NonJsonBody (HTTP 200 + a non-JSON body) is a TRANSIENT provider fault (bounded
// retry), not a fatal STOP. CONTEXT (journal de course 14:21 UTC): the TSLAx draw STOPped on a `FATAL HTTP 200` =
// TransportError name "NonJsonBody" (packages/rpc-guard/src/transport.ts:241 `raise(op,"NonJsonBody",res.status,text)`
// => TransportError.code = res.status). isTransient (../src/quorum.ts) did NOT classify it transient => withRetry
// rejected AT ONCE => the scan aborted. This lot: isTransient makes a NonJsonBody with status 200/429/5xx transient
// (a NonJsonBody on a 4xx != 429 stays fatal); statusOf labels it "non-json <status>" (never "HTTP 200", which masked
// the class). These are UNIT oracles (withRetry + statusOf over TransportError objects built EXACTLY as the transport
// raises them). The A-8 real-shape recovery on the exact guarded --rebase-crosscheck path (a real gateway HTML body
// over globalThis.fetch => NonJsonBody@200 => retried => verdict "equal", retries_by_method incremented) lives in
// rebase-crosscheck.test.ts (test `bell_crosscheck_guarded_nonjsonbody_200_gateway_html_is_retried_and_metered`).
// Named mutants (mutants.mjs, source mutation + sha-exact restore, R-20 -- never git checkout):
//   M1 NonJsonBody removed from isTransient; M2 4xx admitted (>=500 -> >=400); M3 200 dropped; M4 5xx dropped;
//   M5 statusOf old label ("HTTP 200"); M6 onRetry fires on the final attempt; M7 retry unbounded; M8 exhaustion
//   throws a generic Error.
import { test } from "node:test";
import assert from "node:assert/strict";
import { statusOf, withRetry } from "../src/quorum.ts";
import { TransportError } from "@monark/rpc-guard";

const noSleep = { sleep: (): Promise<void> => Promise.resolve() };
// A NonJsonBody EXACTLY as the transport raises it: raise(op,"NonJsonBody",res.status,text) constructs a
// TransportError whose .name is "NonJsonBody" and whose .code is the HTTP status (errors.ts:38, transport.ts:193).
const nonJson = (code: number): TransportError =>
  new TransportError("helius", `rpc-guard: NonJsonBody for operator 'helius' (code ${String(code)})`, "NonJsonBody", code);

// (1) retry taken AND metered on a NonJsonBody@200 then success. The metering is the EXACT caller pattern of the
// draw (rebase-crosscheck.ts:672): withRetry(fn, { onRetry: () => retriesByMethod[method] += 1 }). This is the field
// (retries_by_method) that read 0 when TSLAx STOPped. Non-vacuous (D-2): a synthetic 2-hiccup vector, a recomputed
// counter, and the resolved body asserted by value.
test("bell_retry_nonjson_200_is_retried_then_succeeds_and_is_metered", async () => {
  const retriesByMethod: { getTransactionsForAddress: number } = { getTransactionsForAddress: 0 };
  let attempts = 0;
  const val = await withRetry(() => {
    attempts += 1;
    if (attempts <= 2) return Promise.reject(nonJson(200)); // two gateway hiccups (HTTP 200 + HTML), then the real body
    return Promise.resolve({ slot: 1, retried: true });
  }, { tries: 4, onRetry: () => { retriesByMethod.getTransactionsForAddress += 1; }, ...noSleep });
  assert.deepEqual(val, { slot: 1, retried: true }, "the bounded retry RESOLVED the eventual real body (a NonJsonBody@200 is transient)");
  assert.equal(attempts, 3, "exactly 2 failing attempts then 1 success = 3 calls");
  assert.equal(retriesByMethod.getTransactionsForAddress, 2, "TWO retries METERED into retries_by_method (mutant 'NonJsonBody removed' / '200 dropped' => throws on attempt 1, 0 retries => reds)");
});

// (2) the predicate matrix, by status. Transient (retried to exhaustion = `tries` attempts): 200, 429, and every 5xx
// (502/503/504). Fatal (exactly ONE attempt, re-thrown at once): a 4xx != 429 (400, 404) AND a 2xx != 200 (201, 204 --
// R-BR1, checkpoint-2 C-2). The transient set adds ONLY 200 to the existing HttpError set {429, >=500} -- matching the
// mission's "200/502/503/504 transient, 4xx != 429 fatal"; the predicate is LITERAL `=== 200`, not a 2xx range.
test("bell_retry_nonjson_transient_matrix_200_5xx_429_and_fatal_4xx", async () => {
  for (const code of [200, 429, 502, 503, 504]) {
    let n = 0;
    await assert.rejects(() => withRetry(() => { n += 1; return Promise.reject(nonJson(code)); }, { tries: 3, ...noSleep }));
    assert.equal(n, 3, `a NonJsonBody@${String(code)} is TRANSIENT (retried tries=3 times; mutant '200 dropped' / '5xx dropped' => 1 => reds)`);
  }
  for (const code of [400, 404]) {
    let n = 0;
    await assert.rejects(() => withRetry(() => { n += 1; return Promise.reject(nonJson(code)); }, { tries: 3, ...noSleep }));
    assert.equal(n, 1, `a NonJsonBody@${String(code)} (4xx != 429) is FATAL (exactly ONE attempt; mutant 'status 400 admitted' (>=500 -> >=400) => 3 => reds)`);
  }
  // R-BR1 (checkpoint-2 C-2): a NonJsonBody on a 2xx != 200 (201 Created, 204 No Content) stays FATAL. The predicate is
  // LITERAL `=== 200`, not a 2xx range, so ONLY the gateway-HTML-at-200 case is transient. Pins the R-BR1 residue.
  for (const code of [201, 204]) {
    let n = 0;
    await assert.rejects(() => withRetry(() => { n += 1; return Promise.reject(nonJson(code)); }, { tries: 3, ...noSleep }));
    assert.equal(n, 1, `a NonJsonBody@${String(code)} (2xx != 200) is FATAL (exactly ONE attempt; mutant V4 '=== 200 widened to [200,300)' => 3 => reds)`);
  }
});

// (3) exhaustion after tries=4 re-throws the SAME, NAMED NonJsonBody error (class + status preserved, so the journal
// names it and the caller can meter it), with onRetry fired tries-1 = 3 times (never on the final attempt) and exactly
// tries = 4 bounded attempts.
test("bell_retry_nonjson_200_exhaustion_rethrows_named_error", async () => {
  let onRetry = 0, attempts = 0;
  const err = await withRetry(() => { attempts += 1; return Promise.reject(nonJson(200)); },
    { tries: 4, onRetry: () => { onRetry += 1; }, ...noSleep }).then(() => null, (e: unknown) => e);
  assert.ok(err instanceof TransportError, "exhaustion re-throws the LAST error, a TransportError (mutant 'exhaustion throws a generic Error' => reds)");
  assert.equal(err.name, "NonJsonBody", "the re-thrown error is NAMED NonJsonBody (the class is not masked)");
  assert.equal(err.code, 200, "the re-thrown error CARRIES its status 200");
  assert.equal(attempts, 4, "exactly tries=4 bounded attempts (mutant 'retry unbounded' => >4 => reds)");
  assert.equal(onRetry, 3, "onRetry fired tries-1 = 3 times, never on the final attempt (mutant 'onRetry on the final attempt' => 4 => reds)");
});

// (4) statusOf labels a NonJsonBody "non-json <status>", never "HTTP 200" (the label that masked the class when the
// TSLAx draw STOPped). It reads .code for the status suffix; an HttpError is UNCHANGED ("HTTP <code>") -- the branch is
// NonJsonBody-only.
test("bell_retry_statusof_nonjson_labels_non_json_status_not_http", () => {
  assert.equal(statusOf(nonJson(200)), "non-json 200", "statusOf(NonJsonBody@200) => 'non-json 200' (mutant 'statusOf old label' => 'HTTP 200' => reds)");
  assert.equal(statusOf(nonJson(503)), "non-json 503", "statusOf reads .code for the status suffix");
  assert.notEqual(statusOf(nonJson(200)), "HTTP 200", "NEVER 'HTTP 200' -- that label masked the NonJsonBody class (the journal's FATAL HTTP 200)");
  assert.equal(statusOf(new TransportError("helius", "busy", "HttpError", 503)), "HTTP 503", "an HttpError is still 'HTTP <code>' (the new branch is NonJsonBody-only)");
});
