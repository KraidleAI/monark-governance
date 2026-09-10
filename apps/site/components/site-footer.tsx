import Link from "next/link";
import { MonarkMark } from "@/components/marks/monark-mark";

// Footer link columns — MONARK.dc.html L447-449. Routes land on the pages built by the later F-site
// lots; the hrefs are correct now. "For integrators" -> /integrators (ADR-M004 D15).
const COMPANY: readonly { href: string; label: string }[] = [
  { href: "/fleet", label: "Fleet" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/token", label: "Token" },
];
const BUILD: readonly { href: string; label: string }[] = [
  { href: "/products", label: "Products" },
  { href: "/how", label: "How it works" },
  { href: "/integrators", label: "For integrators" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-soft">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-7 px-6 pb-8 pt-12">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-[0.06em]">
            <MonarkMark className="size-[26px]" />
            <span>MONARK</span>
          </Link>
          <p className="max-w-[300px] text-sm leading-relaxed text-muted-foreground">
            It abstains, so it can act.
            <br />
            Every label on this site is Built or Upcoming.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            Company
          </div>
          {COMPANY.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            Build
          </div>
          {BUILD.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            Proof
          </div>
          <Link href="/console">
            Console <span className="font-mono text-[10px] text-muted-foreground">UPCOMING</span>
          </Link>
          <Link href="/writing">Writing</Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 px-6 pb-7 font-mono text-[11px] text-muted-foreground">
        <span>MONARK — a company of agent-products for DeFi and inference.</span>
        <span>No confidence field, anywhere.</span>
      </div>
    </footer>
  );
}
