// apps/site/components/dojo/dojo-figures.tsx -- the one path by which /dojo renders a figure: a sentence of lib/dojo-copy.ts whose
// {name} parts are replaced by the figure of that name, read by property access from the figures the committed record composes
// (lib/dojo-served.ts), each in its own element. No figure is typed here. A name the state does not carry throws, so the build
// reds rather than render a sentence without its figure. Server component (no "use client").
import type { DojoPageFigures } from "@/lib/dojo-served";

export type DojoShownFigures = Exclude<DojoPageFigures, { state: "E0" }>;

/** One sentence of the closed list, its figures filled in from `figures`. */
export function DojoSentence({ text, figures }: { text: string; figures: DojoShownFigures }) {
  const values = new Map<string, string>(Object.entries(figures));
  return (
    <>
      {text.split(/(\{[a-z_]+\})/).map((part, i) => {
        const name = /^\{([a-z_]+)\}$/.exec(part)?.[1];
        if (name === undefined) return part;
        const value = name === "state" ? undefined : values.get(name);
        if (value === undefined) throw new Error(`dojo figures: the sentence names ${name}, a figure this state does not carry (fail-closed)`);
        return (
          <span key={i} className="font-mono break-all">
            {value}
          </span>
        );
      })}
    </>
  );
}
