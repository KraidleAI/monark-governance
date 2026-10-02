"use client";

// apps/site/components/dojo/dojo-live.tsx -- the figures section of /dojo. First paint (the build): the committed figures and the
// sentence that says what a browser that can then does. In a browser that runs this script, the reread of lib/dojo-live.ts runs over
// a same-origin GET of the published files (the site's proxy to the Dojo host: never cached, redirected or credentialed), with Web
// Crypto for SHA-256 and Ed25519, under the limits of the reader's tool (the module's own: none is passed here). The view of
// lib/dojo-served.ts decides what is shown: the reread head only when Ed25519 answers the committed anchor's known answer and every
// check holds; else the committed figures and the sentence of the outcome, never its reason. Every figure goes through dojo-figures.tsx,
// every sentence is read from lib/dojo-copy.ts. Then the table (dojo-table.tsx, keyed by the head shown) and the fold of the tier sentences.
import { useEffect, useState, type ReactNode } from "react";
import { rereadDojoHead, signatureOf, signingBytes, type DojoLiveGet, type Sha256, type VerifyEd25519 } from "@/lib/dojo-live";
import { dojoBodyOf, dojoFirstViewOf, dojoFoldOf, dojoLiveViewOf, dojoTableKeyOf, DOJO_LIVE_FETCH_INIT, DOJO_LIVE_PREFIX, type DojoLiveView } from "@/lib/dojo-served";
import type { DojoServedData } from "@/lib/dojo-served-load";
import { DOJO_TEXT as T } from "@/lib/dojo-copy";
import { DojoSentence } from "@/components/dojo/dojo-figures";
import { DojoTable } from "@/components/dojo/dojo-table";

const sha256: Sha256 = async (bytes) => new Uint8Array(await crypto.subtle.digest("SHA-256", Uint8Array.from(bytes)));
const verifyEd25519: VerifyEd25519 = async (x, message, signature) => {
  const key = await crypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x }, { name: "Ed25519" }, false, ["verify"]);
  return crypto.subtle.verify({ name: "Ed25519" }, key, Uint8Array.from(signature), Uint8Array.from(message));
};
const get: DojoLiveGet = (rel, signal) => fetch(`${DOJO_LIVE_PREFIX}${rel}`, { ...DOJO_LIVE_FETCH_INIT, signal });

/** The figures of the committed record, then those of the head reread in the browser when every check holds; `counted`: the page's part of the fold. */
export function DojoLive({ committed, counted }: { committed: DojoServedData; counted: ReactNode }) {
  const [view, setView] = useState<DojoLiveView>(() => dojoFirstViewOf(committed, T));
  useEffect(() => {
    let current = true;
    const reread = () => rereadDojoHead(committed, { sha256, verifyEd25519, get });
    void dojoLiveViewOf(committed, { verifyEd25519, signingBytes, signatureOf, reread, text: T }).then((v) => {
      if (current) setView(v);
    });
    return () => {
      current = false;
    };
  }, [committed]);
  const [head, ...rest] = dojoBodyOf(view.figures);
  const [open, folded] = dojoFoldOf(rest);
  return (
    <section className="c-section flex flex-col gap-3 text-sm text-foreground">
      <p className="text-base">
        <DojoSentence text={T[head]} figures={view.figures} />
      </p>
      <p>{view.note}</p>
      {open.map((k) => (
        <p key={k}>
          <DojoSentence text={T[k]} figures={view.figures} />
        </p>
      ))}
      <DojoTable key={dojoTableKeyOf(view)} view={view} get={get} sha256={sha256} />
      <details className="text-muted-foreground">
        <summary className="cursor-pointer">{T.foldCounted}</summary>
        <div className="mt-3 flex flex-col gap-3">
          {folded.map((k) => (
            <p key={k}>
              <DojoSentence text={T[k]} figures={view.figures} />
            </p>
          ))}
          {counted}
        </div>
      </details>
    </section>
  );
}
