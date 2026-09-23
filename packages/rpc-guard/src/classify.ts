// MONARK rpc-guard - the SINGLE SOURCE of the RPC error vocabulary (GARDE-HELIUS-2b C-4). The recorder used to carry
// its own `isResultLimit` / `isPlanLimited` regexes and its own revert criterion in apps/sentinel/src/ukemi/rpc2.ts;
// under the migration those live HERE and rpc2.ts IMPORTS them (the apps -> packages direction is licit). One home
// means the transport's closed-vocabulary hint (D6) and the recorder's range-split / plan-bench / revert decisions can
// never drift apart - the inter-package conformance test pins `predicate(hint) === predicate(body)` for all three.
import { RpcError } from "./errors.ts";

// The recorder's range/result-cap predicate (calque apps/sentinel/src/ukemi/rpc2.ts:67, byte-for-byte the same set of
// alternatives). A body matching this on an HTTP 400 is a too-large range: getLogsVia splits it.
export const isResultLimit = (m: string): boolean => /more than|result|range is too|10000|query returned|limit exceeded|block range|too large|response size|maximum allowed|ranges? over|narrow your filter/i.test(m);
// A drpc free-plan 400 ("ranges over 10000 blocks are not supported on free plan") matches isResultLimit via "10000"
// but splitting cannot satisfy it (the block is the PLAN, not the range) - detect it and let the caller bench once.
export const isPlanLimited = (m: string): boolean => /free plan/i.test(m);
// The revert-text criterion (calque rpc2.ts:54): an EVM execution revert names itself. Kept as a STRING predicate so
// the conformance test can pin `isRevertText(hint) === isRevertText(body)` alongside the other two.
export const isRevertText = (m: string): boolean => /execution reverted|revert/i.test(m);

// The CLOSED vocabulary (D6): the LITERAL tokens of the three predicates above, the declared super-set the transport
// is allowed to reprise from a PAID operator's body. A key - in any case, %-encoded, hex, base64, or split by a blank -
// cannot be a member of this fixed set of English phrases and the constant "10000", so C-GD-2 (a server-transformed
// key) and the "key split by whitespace" residual are CLOSED STRUCTURALLY for paid operators, not merely bounded. The
// regex alternative `ranges? over` is expanded to its TWO literals so a canonical hint is never itself a regex.
export const ERROR_HINT_TOKENS: readonly string[] = [
  "more than", "result", "range is too", "10000", "query returned", "limit exceeded", "block range", "too large",
  "response size", "maximum allowed", "ranges over", "range over", "narrow your filter", // isResultLimit
  "free plan",                                                                            // isPlanLimited
  "execution reverted", "revert",                                                          // isRevertText
];

// Build the closed-vocabulary hint of a server body (D6 / C-5): the SORTED, DEDUPLICATED set of CANONICAL tokens
// (literals from ERROR_HINT_TOKENS, never the substring lifted from the body) whose lower-cased form occurs in the
// body. Sorted + deduplicated (C-5, supersedes the "order of appearance" of the first D6 draft) so the hint is a pure
// function of WHICH tokens are present, carrying no positional information from the body. Every returned token is a
// vocabulary literal, so `isResultLimit(hint) === isResultLimit(body)` etc. hold by construction (each predicate's
// alternatives are all tokens). An empty hint ("") means the body carried no vocabulary token.
export function closedHint(body: string): string {
  const low = body.toLowerCase();
  const found = ERROR_HINT_TOKENS.filter((t) => low.includes(t));
  return [...new Set(found)].sort().join(", ");
}

// Is this rejection an EVM execution revert (deterministic, identical across honest providers) rather than a
// transport/rate fault (GARDE-HELIUS-2b C-1, calque rpc2.ts:53)? A canonical RpcError whose code is 3 (EIP-1474
// "execution error") or -32000 (common node "server error" for reverts) AND whose message names a revert. C-1(c) adds
// the PAID rule: a paid operator's revert with NO `.data` is BENCHED (returns false), never concorded - under D6 two
// different paid reverts would share the same closed-vocabulary message, so without the discriminating `.data` they
// must not be read as one on-chain fact. Keyless reverts (their scrubbed message IS the datum) concord on the message.
export function isRpcRevert(e: unknown): e is RpcError {
  if (!(e instanceof RpcError)) return false;
  if (!(e.code === 3 || e.code === -32000)) return false;
  if (!isRevertText(e.message)) return false;
  // C-1(c) + GARDE-HELIUS-2b-ii R-A (D-"0x"): a PAID revert with no `.data` OR an empty `.data` ("0x") is BENCHED
  // (returns false), never concorded. Under D6 two different paid reverts share the same closed-vocabulary message,
  // so without a NON-empty discriminating `.data` they must not be read as one on-chain fact; "0x" (a bare revert
  // with no reason) carries no discriminator. Keyless reverts (their scrubbed message IS the datum) are unaffected.
  if (e.unit !== "keyless" && (e.data === undefined || e.data === "0x")) return false;
  return true;
}

// UKEMI-REVERT-1 (incident REVERT-PAID-1, 2026-09-23; ADR-GARDE-HELIUS amendment R-A-bis) - the BARE revert class,
// ADDITIVE: `isRpcRevert` above is UNCHANGED (a paid bare revert stays benched for every other consumer); this predicate
// only NAMES the class, so the recorder's quorum can pair a PAID bare revert with a KEYLESS witness that is itself bare.
// A bare revert is a canonical RpcError whose code is 3 or -32000, which carries NO validated `.data` (absent, or the
// empty "0x"), and whose NORMALIZED text (trimmed, lower-cased, whitespace-collapsed - calque rpc2.ts revertKey) is the
// revert WITHOUT a reason:
//   - KEYLESS: the scrubbed message (exposed without preamble, transport.ts raise) is EXACTLY "execution reverted";
//   - PAID: the closed-vocabulary `detail` (D6) is EXACTLY closedHint("execution reverted") = "execution reverted, revert".
// Under D6, closedHint("execution reverted") === closedHint("execution reverted: <reason>") (a reason is not vocabulary):
// on the PAID side "bare" is decided by `.data` ALONE, the reason text is decidable only on the KEYLESS witness. That is
// the structural reason the quorum admits a paid bare revert ONLY against a keyless bare witness and never compares
// messages across units. Measured wire form (G1 probe 2026-09-23, description() of the GHO oracle source @23414968):
// drpc.org AND chainstack both answer {code: 3, message: "execution reverted"} with NO `data` key. No regex here: the
// closed vocabulary stays the three predicates above (C-4 structural test unchanged).
const BARE_REVERT_TEXT = "execution reverted";
const normalizedText = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, " ");
export function isBareRevert(e: unknown): e is RpcError {
  if (!(e instanceof RpcError)) return false;
  if (!(e.code === 3 || e.code === -32000)) return false;
  if (!(e.data === undefined || e.data === "0x")) return false;
  return e.unit === "keyless" ? normalizedText(e.message) === BARE_REVERT_TEXT : normalizedText(e.detail) === closedHint(BARE_REVERT_TEXT);
}
