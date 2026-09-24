"use client";

// Contract address (CA) field with a copy button (investor request 2026-09-18, ADR-M013 T0). The
// address arrives as a prop from the server page (identifier read, never a rendered literal here), so
// the honesty lint's numeric scan sees no digits in this file. Copy uses the Clipboard API when the
// browser grants it; the field stays select-all so a manual copy always works. Label + address only:
// no chain name, no price, no buy call (securities floor).
import { useRef, useState } from "react";

type CopyState = "idle" | "copied" | "manual";

export function CaCopy({ address }: { address: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const codeRef = useRef<HTMLElement>(null);
  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(address);
      ok = true;
    } catch {
      // Clipboard API refused (permission or embedded browser): select the field and use the legacy
      // command, which copies in every browser that still ships it.
      const node = codeRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        try {
          ok = document.execCommand("copy");
        } catch {
          ok = false;
        }
      }
    }
    setState(ok ? "copied" : "manual");
    window.setTimeout(() => setState("idle"), 1800);
  };
  const copied = state === "copied";
  return (
    <div className="rounded-2xl bg-ink px-6 py-5 text-paper">
      <div className="mb-3 font-mono text-xs uppercase tracking-wide text-paper/70">Contract address (CA)</div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <code
          ref={codeRef}
          className="block min-w-0 flex-1 select-all break-all rounded-xl border border-paper/20 bg-paper/10 px-3 py-2 font-mono text-sm leading-6 text-paper"
          aria-label="Contract address"
        >
          {address}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-live="polite"
          className="shrink-0 rounded-xl bg-paper px-4 py-2 font-mono text-sm text-ink transition-colors hover:bg-paper/90 focus-visible:outline-2 focus-visible:outline-focus"
        >
          {copied ? "Copied" : state === "manual" ? "Select and copy" : "Copy"}
        </button>
      </div>
      <p className="mt-3 text-xs text-paper/70">Address only. No price, no buy call.</p>
    </div>
  );
}
