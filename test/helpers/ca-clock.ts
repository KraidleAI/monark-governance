// test/helpers/ca-clock.ts -- lot E-2a CA trio: one clock for the in-process harness (startServer's clock, which also writes
// its Date header) and for the deployment CA run as a child (VERIFY_HARNESS_TEST_CLOCK_MS, refused off a loopback target), so
// the two time-dependent kata checks of scripts/verify-harness.mjs are deterministic in tests. Both clocks start at the
// instant given and run with real time from there.

/** A grid instant of the 1h class plus 30 s: inside the window of +-225 s that gate_kata_call needs. */
export const CA_TEST_CLOCK_MS = Date.parse("2026-10-07T12:00:30Z");

/** A clock that reads `startMs` now and runs with real time (the in-process harness's clock). */
export function caServerClock(startMs: number = CA_TEST_CLOCK_MS): () => number {
  const t0 = performance.now();
  return () => startMs + Math.round(performance.now() - t0);
}

/** The environment of a CA child whose run clock starts at `startMs`. */
export const caEnv = (startMs: number = CA_TEST_CLOCK_MS, env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv => ({ ...env, VERIFY_HARNESS_TEST_CLOCK_MS: String(startMs) });
