"use client";

import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { MonarkLockup, NarabiLockup, UkemiLockup, BellLockup } from "@/components/lockups";
import { NARABI_ROUTE } from "@/lib/narabi-live";

// Charter C site chrome (decision 145; rulings 146): a thin SITE BAR (MONARK · Fleet · Narabi · Ukemi · Bell +
// baseline) above the HEADER (lock-up + primary nav + theme button). The lock-up follows the route: the MONARK
// horizontal lock-up (32 px, 24 px under 720 px — orchestrator ruling) on the company pages, the product lock-up
// on /narabi, /ukemi and /bell*. Under 720 px the primary nav becomes a horizontally scrolling row instead of
// disappearing (designer NOTE-retouche-mobile point 1: a hidden nav is a content cut). No status is written here.
const SITE_BAR: readonly { href: string; label: string }[] = [
  { href: "/", label: "MONARK" },
  { href: "/fleet", label: "Fleet" },
  { href: NARABI_ROUTE, label: "Narabi" },
  { href: "/ukemi", label: "Ukemi" },
  { href: "/bell", label: "Bell" },
];

// Primary nav — the company pages (MONARK.dc.html navDef, ADR-M004 D15 naming). Unchanged routes.
const NAV_ITEMS: readonly { href: string; label: string }[] = [
  { href: "/products", label: "Products" },
  { href: "/fleet", label: "Fleet" },
  { href: "/how", label: "How it works" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/token", label: "Token" },
  { href: "/integrators", label: "Integrators" },
];

interface Brand {
  href: string;
  label: string;
  Lockup: ComponentType<SVGProps<SVGSVGElement>>;
  className: string;
}

function brandFor(pathname: string): Brand {
  if (isActive(pathname, NARABI_ROUTE)) return { href: NARABI_ROUTE, label: "MONARK Narabi", Lockup: NarabiLockup, className: "c-logo" };
  if (isActive(pathname, "/ukemi")) return { href: "/ukemi", label: "MONARK Ukemi", Lockup: UkemiLockup, className: "c-logo" };
  if (isActive(pathname, "/bell")) return { href: "/bell", label: "MONARK Bell", Lockup: BellLockup, className: "c-logo" };
  return { href: "/", label: "MONARK", Lockup: MonarkLockup, className: "c-logo c-logo--monark" };
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const brand = brandFor(pathname);
  const { Lockup } = brand;

  return (
    <>
      <div className="c-sitebar">
        {SITE_BAR.map((item) => (
          <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
        <span className="c-right">it abstains so DeFi can act.</span>
      </div>
      <header className="c-header">
        <Link className="c-brand" href={brand.href} aria-label={brand.label}>
          <Lockup className={brand.className} />
        </Link>
        <nav aria-label="Primary" className="c-nav">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button type="button" className="c-themebtn" onClick={toggleTheme} aria-label="Toggle dark theme">
          {theme}
        </button>
      </header>
    </>
  );
}
