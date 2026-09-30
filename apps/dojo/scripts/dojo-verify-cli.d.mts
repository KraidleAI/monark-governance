// apps/dojo/scripts/dojo-verify-cli.d.mts -- type surface of dojo-verify-cli.mjs (TS7016 sidecar, precedent dojo-verify.d.mts): the URL
// transport and the CLI of the reader's verifier (ADR-DOJO-PR-1B-5 PLI-1); the core's types come from dojo-verify.mjs. Runtime = dojo-verify-cli.mjs.
import type { Source, VerifyBounds } from "./dojo-verify.mjs";

/** T-1 and T-2 on the raw string: https anywhere, http on 127.0.0.1 or [::1] only, no ? nor # (ADR-DOJO-PR-1B-4 D-1). */
export function urlAllowed(u: unknown): boolean;
/** A served base URL (D-1); `note` names the TLS variables of the environment, null without any (T-9 amended). */
export function urlSource(base: string, bounds?: VerifyBounds): Source & { readonly note: string | null };
export function runVerifyCli(argv: readonly string[]): Promise<number>;
