// test/helpers/host-clock.ts -- lot L2-P1-c5-bis-b (2026-10-05): a run on a host clock driven by hand, driven until it settles. The
// recorder's clean stop arms the seal's bound on that clock only once its links have closed, after real disk work that load delays:
// driven to a fixed instant, then awaited, a run can wait on a timer that nothing fires (G7 of the lot, "Blocage de l'oracle").
/** Calls `advance` (one step of the host clock) until `run` settles, at most `steps` times; whether it settled. */
export async function settles(run: Promise<unknown>, advance: () => Promise<void>, steps: number): Promise<boolean> {
  let done = false;
  run.then(() => { done = true; }, () => { done = true; });
  for (let i = 0; i < steps && !done; i += 1) await advance();
  return done;
}
