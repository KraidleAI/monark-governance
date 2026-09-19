"use client";

// The animated B_t budget meter. `segments` cells fill up to the current budget (0..1).
// No rendered numeric literal: the fill count is computed and every dimension lives in inline styles /
// non-visible attributes (not honesty-lint surfaces). Reduced-motion drops the fill transition.
import { useTheme } from "@/components/theme-provider";

const DEFAULT_SEGMENTS = 20;

export function GateMeter({ budget, segments = DEFAULT_SEGMENTS }: { budget: number; segments?: number }) {
  const { reducedMotion } = useTheme();
  const filled = Math.round(budget * segments);
  return (
    <div
      role="meter"
      aria-label="B_t remaining authorization budget"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={budget}
      style={{ display: "flex", gap: 3, height: 10 }}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            borderRadius: 3,
            background: i < filled ? "var(--hikae)" : "var(--meter-empty)",
            opacity: 1,
            transition: reducedMotion ? "none" : "background .5s, opacity .5s",
          }}
        />
      ))}
    </div>
  );
}
