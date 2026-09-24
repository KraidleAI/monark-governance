"use client";

import { useState } from "react";

// Copies the request template to the clipboard, so the request can be sent from ANY mail client — including a
// browser with no mail handler, where a `mailto:` click does nothing (measured on a desktop browser). No
// form, no network: the text is the same template the mailto link carries (lib/bell-contact.ts, single source).
export function CopyTemplate({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  }
  return (
    <span>
      <button type="button" className="c-mono c-btn" onClick={() => void copy()}>
        copy the template
      </button>
      {state === "copied" ? <span className="c-small c-muted"> copied — paste it into a new e-mail</span> : null}
      {state === "failed" ? <span className="c-small c-muted"> copy is blocked here — select the text above and copy it</span> : null}
    </span>
  );
}
