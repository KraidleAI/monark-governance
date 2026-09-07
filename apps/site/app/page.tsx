import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className={cn("mx-auto max-w-2xl p-8")}>
      <h1 className="text-2xl font-semibold tracking-tight">MONARK</h1>
      <p className="mt-4 text-gray-600">
        Tokenisation layer and frozen interface contracts for the fleet. This is the public
        foundation; the deck, fleet view and roadmap arrive in the next slice.
      </p>
    </main>
  );
}
