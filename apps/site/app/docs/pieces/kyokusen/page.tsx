import type { Metadata } from "next";
import { PieceDocPage } from "@/components/docs/piece-doc-page";
import { pieceDescription } from "@/lib/docs-pieces";

// /docs/pieces/kyokusen: one piece of the engine. The name and the status are read from the fleet register by the shared
// page; the description is composed from the register name and the tagline of lib/docs-pieces.ts, with no status and no
// number. The root test pins this folder set to the register's slugs, both ways.
export const metadata: Metadata = {
  title: "Kyokusen · Docs · MONARK",
  description: pieceDescription("Kyokusen", "kyokusen"),
};

export default function Page() {
  return <PieceDocPage slug="kyokusen" />;
}
