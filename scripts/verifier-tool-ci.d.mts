// Types of scripts/verifier-tool-ci.mjs (VERIFIER-TOOL-CI-1, docs/G0-lot-verifier-tool-ci-1.md).
export declare const TOOL: string;
export declare const REGISTRY: string;
export declare const WINDOWS_ONLY: string[];
export declare const NOT_RUN: Record<string, string>;
export declare const VECTORS: { repository: string; commit: string; path: string; sha256: string; bytes: number; exit: number; end: string[]; stdout: string; notice: string };
export declare const vectorsProblems: (data: Uint8Array | null) => string[];
export declare const steps: (repo: string, w: string, win: boolean) => [check: string, script: string, args: string[], want: number][];
export declare const formOf: (text: string) => string[];
export declare const treesOf: (text: string) => string[];
export declare const interpreterProblems: (info: { implementation: string; version: string; releaselevel: string }, pin: string | undefined) => string[];
export declare const accountProblems: (trees: string[], present: Record<string, boolean>, checks: string[], runs?: ReturnType<typeof steps>) => string[];
export declare const outputProblems: (check: string, out: string, status: number | string | null | undefined, want: number, win: boolean) => { problems: string[]; skipped: string[] };
