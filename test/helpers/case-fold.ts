// test/helpers/case-fold.ts -- names that differ only by case, the cause of PR #243's red on Windows: on a case-insensitive file
// system (NTFS; APFS and HFS+ by default) two such names are one entry, so a fixture that writes both keeps one file of the two,
// while Linux keeps both and stays green. A name is each prefix of a path, its folders and the path itself; two names are one group
// when their segments are equal once lower-cased after NFC normalisation. That rule is this repository's own: stricter than NTFS on
// the NFC axis (NTFS keeps a composed and a decomposed spelling apart, the macOS file systems merge them), and not the NTFS upcase
// table nor a full case fold. Digits print as x in the error: a fixture name may carry a host address, and a test log of a public
// repository is public.

/** A path segment as this repository compares it: NFC, then lower case. */
export const fold = (segment: string): string => segment.normalize("NFC").toLowerCase();

/**
 * The groups of names, among `paths` and their parent folders, that are equal once each segment is folded: each group holds two or
 * more distinct spellings, sorted; the groups are sorted by their first spelling. No group means the list is safe on NTFS.
 */
export function caseOnlyCollisions(paths: readonly string[]): string[][] {
  const spellings = new Map<string, Set<string>>(); // folded name -> its distinct spellings
  for (const p of paths) {
    const parts = p.split("/").filter((s) => s !== "");
    for (let i = 1; i <= parts.length; i++) {
      const name = parts.slice(0, i).join("/"), key = parts.slice(0, i).map(fold).join("/");
      let seen = spellings.get(key);
      if (seen === undefined) { seen = new Set(); spellings.set(key, seen); }
      seen.add(name);
    }
  }
  return [...spellings.values()].filter((s) => s.size > 1).map((s) => [...s].sort()).sort((a, b) => ((a[0] ?? "") < (b[0] ?? "") ? -1 : 1));
}

const mask = (name: string): string => name.replace(/\d+/g, "x");

/** The error refuseCaseOnlyCollisions throws: its message names `where` and each group, digits masked. */
export class CaseOnlyCollisionError extends Error {
  constructor(where: string, groups: readonly (readonly string[])[]) {
    super(`${where}: paths equal once case is folded, one entry on a case-insensitive file system: ${groups.map((g) => g.map(mask).join(" ~ ")).join("; ")}`);
    this.name = "CaseOnlyCollisionError";
  }
}

/** Throws a CaseOnlyCollisionError when two of `paths`, their parent folders included, are equal once case is folded. */
export function refuseCaseOnlyCollisions(paths: readonly string[], where: string): void {
  const groups = caseOnlyCollisions(paths);
  if (groups.length > 0) throw new CaseOnlyCollisionError(where, groups);
}
