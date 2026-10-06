// apps/site/components/dojo/dojo-figures.tsx -- the one path by which /dojo renders a figure: a sentence of lib/dojo-copy.ts whose
// {name} parts are replaced by the figure of that name, read by property access from the figures of one head (lib/dojo-served.ts,
// sentenceParts: a name the state does not carry throws, so the build reds rather than render a sentence without its figure), each
// in its own element. No figure is typed here. No hook and no "use client": rendered by the server and by the reread component.
import { sentenceParts, type DojoShownFigures } from "@/lib/dojo-served";

/** One sentence of the closed list, its figures filled in from `figures`. */
export function DojoSentence({ text, figures }: { text: string; figures: DojoShownFigures }) {
  return (
    <>
      {sentenceParts(text, figures).map((part, i) =>
        typeof part === "string" ? (
          part
        ) : (
          <span key={i} className="font-mono break-all">
            {part.value}
          </span>
        ),
      )}
    </>
  );
}
