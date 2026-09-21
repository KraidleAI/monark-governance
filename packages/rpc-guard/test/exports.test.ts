import { test } from "node:test";
import assert from "node:assert/strict";
// Resolve the package BY NAME (Node self-reference via the `exports` field). A third-party consumer sees exactly
// this surface; a deep import is refused. Both are proven WITHOUT installing a node_modules symlink.
import { operatorLabels } from "@monark/rpc-guard";

test("third_party_script_cannot_obtain_endpoint", async () => {
  const mod = await import("@monark/rpc-guard");
  // A distinctive fake endpoint: if any label/serialized surface leaked it, the token below would appear.
  const env = { BELL_SOLANA_RPC: "https://example.invalid/SECRET-HELIUS", HELIUS_API_KEY: "fake-not-a-real-key" };
  const labels = operatorLabels(env);
  assert.ok(labels.length >= 1, "at least one operator label is exposed");
  for (const l of labels) {
    assert.doesNotMatch(String(l), /https?:|example\.invalid|SECRET|api-key/i, `label leaks an endpoint: ${String(l)}`);
  }
  // No exported symbol is itself a URL string.
  for (const [k, v] of Object.entries(mod)) {
    if (typeof v === "string") assert.doesNotMatch(v, /https?:\/\//, `exported '${k}' is a URL string`);
  }
});

test("exports_map_forbids_deep_import", async () => {
  // Non-literal specifier so tsc does not statically resolve (and error on) the intentionally-blocked path; Node
  // resolves it at runtime through the `exports` map and refuses it.
  const deep: string = "@monark/rpc-guard/src/client.ts";
  await assert.rejects(
    () => import(deep),
    (e: unknown) => (e as { code?: string }).code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
    "a deep import must be refused by the exports map",
  );
});
