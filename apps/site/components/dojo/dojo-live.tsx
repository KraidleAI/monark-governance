"use client";

// apps/site/components/dojo/dojo-live.tsx -- the figures section of /dojo. First paint (the build): the committed figures and the
// sentence that says what a browser that can then does. In a browser that runs this script, the reread of lib/dojo-live.ts runs over
// a same-origin GET of the published files (the site's proxy to the Dojo host: never cached, redirected or credentialed), with Web
// Crypto for SHA-256 and Ed25519, under the limits of the reader's tool (the module's own: none is passed here). The view of
// lib/dojo-served.ts decides what is shown: the reread head only when Ed25519 answers the committed anchor's known answer and every
// check holds; else the committed figures and the sentence of the outcome, never its reason. Every figure goes through
// components/dojo/dojo-figures.tsx; every sentence is read from lib/dojo-copy.ts.
import { useEffect, useState } from "react";
import { rereadDojoHead, signatureOf, signingBytes, type DojoLiveGet, type Sha256, type VerifyEd25519 } from "@/lib/dojo-live";
import { dojoBodyOf, dojoFirstViewOf, dojoLiveViewOf, DOJO_LIVE_FETCH_INIT, DOJO_LIVE_PREFIX, type DojoLiveView } from "@/lib/dojo-served";
import type { DojoServedData } from "@/lib/dojo-served-load";
import { DOJO_TEXT as T } from "@/lib/dojo-copy";
import { DojoSentence } from "@/components/dojo/dojo-figures";

const sha256: Sha256 = async (bytes) => new Uint8Array(await crypto.subtle.digest("SHA-256", Uint8Array.from(bytes)));
const verifyEd25519: VerifyEd25519 = async (x, message, signature) => {
  const key = await crypto.subtle.importKey("jwk", { kty: "OKP", crv: "Ed25519", x }, { name: "Ed25519" }, false, ["verify"]);
  return crypto.subtle.verify({ name: "Ed25519" }, key, Uint8Array.from(signature), Uint8Array.from(message));
};
const get: DojoLiveGet = (rel, signal) => fetch(`${DOJO_LIVE_PREFIX}${rel}`, { ...DOJO_LIVE_FETCH_INIT, signal });

/** The figures of the committed record, then those of the head reread in the browser when every check holds. */
export function DojoLive({ committed }: { committed: DojoServedData }) {
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
  return (
    <section className="c-section flex flex-col gap-3 text-sm text-foreground">
      <p className="text-base">
        <DojoSentence text={T[head]} figures={view.figures} />
      </p>
      <p>{view.note}</p>
      {rest.map((k) => (
        <p key={k}>
          <DojoSentence text={T[k]} figures={view.figures} />
        </p>
      ))}
    </section>
  );
}
