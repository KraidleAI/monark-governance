// scripts/test-counts-reporter.d.mts: the type surface of the reporter (TEST-COUNT-FLOOR-1), for test/test-count-floor.test.ts; not exported.
/** A node --test reporter: per test file, the tests its process reported, whether it sent a summary of its own, and their full names, as one JSON text. */
export default function testCounts(source: Iterable<{ type: string; data: unknown }> | AsyncIterable<{ type: string; data: unknown }>): AsyncGenerator<string>;
