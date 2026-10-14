// scripts/test-counts-reporter.d.mts: the type surface of the reporter (TEST-COUNT-FLOOR-1), for test/test-count-floor.test.ts; not exported.
/** A node --test reporter: per test file, its tests reported, whether its process sent a summary of its own, their full names, and, above 0, how many of them another process ran too, as one JSON text. */
export default function testCounts(source: Iterable<{ type: string; data: unknown }> | AsyncIterable<{ type: string; data: unknown }>): AsyncGenerator<string>;
