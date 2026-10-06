// Types of scripts/registry-root.mjs (lot R25-REGISTRY-ROOT-1, ADR-M003 D9 septdecies).
export declare const REGISTRY_ROOT: string;
export declare const REGISTRY_DECL: string;
export declare const declaredWaves: (row: string) => string[];
export declare function registryRootProblems(absRoot: string): { problems: string[]; registries: string[] };
