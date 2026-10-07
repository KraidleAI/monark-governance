// Types of scripts/address-literals.mjs (the address-literal gate of the tracked tree; docs/G0-lot-host-address-gate.md).
import type { BlockList } from "node:net";

/** A refused literal: where it is, its family and a mask that prints no digit of it (never the literal itself). */
export interface Hit {
  file: string;
  line: number;
  col: number;
  kind: 4 | 6;
  mask: string;
}
export interface Verdict {
  hits: Hit[];
  /** "<file> <literal>" for each pair of LISTED met in the tree. */
  used: Set<string>;
  read: number;
}
export declare const SELF: string;
export declare const EXEMPT: BlockList;
export declare const LISTED: Readonly<Record<string, Readonly<Record<string, string>>>>;
export declare function literals(text: string): [literal: string, col: number, kind: 4 | 6][];
export declare function mask(literal: string): string;
export declare function scan(root: string, env?: NodeJS.ProcessEnv): Verdict;
export declare function stale(v: Verdict): string[];
export declare function report(v: Verdict): string;
