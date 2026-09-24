// apps/site/lib/ukemi-panel-copy.ts — the served text the Ukemi fleet panel carries (components/ukemi-panel.tsx).
// Pure data — NO React/Next import — so the root test can import it under node:test and assert byte-identity with the
// harness gate module (the single source of the served text), as it does for lib/ukemi-copy.ts. Digit-free: the panel
// names the cascade tool's class in words, never by its identifier (which carries a digit).
//
// Kept apart from lib/ukemi-copy.ts on purpose: the /ukemi body must never carry the word "cascade" (its built-HTML
// gate reds on it), while the fleet panel describes the cascade tool that feeds the gate today.

/** BYTE-IDENTICAL to the gate module's CASCADE_UNCALIBRATED_SENTENCE (the served /cascade and /gate texts carry it). */
export const CASCADE_UNCALIBRATED_SENTENCE =
  "no cascade calibration is committed; the gate abstains (under_calib) on this class";

/** EQUAL to the gate module's TASK_LIQ_ELIGIBLE: the class id under which the served gate takes Ukemi's
 *  liquidation-exposure measure (the /ukemi page states what the gate serves for it). */
export const LIQ_TASK_CLASS = "liquidation-eligible-coverage";
