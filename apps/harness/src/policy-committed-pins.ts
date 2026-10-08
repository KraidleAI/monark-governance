/**
 * The pins of the committed kata tables of wave 1: pure data, no import. Above the marked block, constants that a reviewed
 * change writes by hand, never the table writer: the two closed lists of classes held back, the pinned retire lists and the
 * per-release table of recompute reports. Inside the marked block, what the offline table writer rewrites: the sha256 of
 * each committed table file and the pinned registry file. Empty pins serve every kata class with no row.
 */

/** Held back by the digest floor: exactly the classes whose registry digests the publication refuses. */
export const FLOOR_HELD_CLASSES: readonly string[] = ["bnb-dir-4h", "btc-dir-4h", "eth-dir-4h", "sol-dir-4h"];
/** Held back by the serving order (range and path rows ship before direction rows): emptied by the release of the directions. */
export const ORDER_HELD_CLASSES: readonly string[] = ["bnb-dir-1h", "btc-dir-1h", "eth-dir-1h", "sol-dir-1h"];
/** The committed retire lists (apps/harness/data/kata/retire/), each with the sha256 of its bytes, written by the commit that adds the list. */
export const COMMITTED_RETIRE_LISTS: readonly { readonly file: string; readonly sha256: string }[] = [];
/**
 * One entry per recompute report (apps/harness/data/kata/recompute/), written by the commit that adds the report, never
 * recomputed from the bytes read: `release` is a logical name ("wave1-bands", "wave1-directions"), not a folder, and
 * `scope` the classes whose rows cite that report.
 */
export const COMMITTED_REPORTS: readonly { readonly release: string; readonly file: string; readonly report_sha256: string; readonly scope: readonly string[] }[] = [];

// BEGIN committed tables: rewritten by the table writer, never by hand.
export const COMMITTED_TABLES: Readonly<Record<string, string>> = {};
export const COMMITTED_REGISTRY: { readonly file: string; readonly sha256: string } | null = null;
// END committed tables
