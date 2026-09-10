"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MonarkMark } from "@/components/marks/monark-mark";
import { useTheme } from "@/components/theme-provider";

// Primary nav — MONARK.dc.html navDef (data model L712). "Integrators" routes to /integrators
// (ADR-M004 D15 renamed the design's #/api to avoid the route-handler confusion).
const NAV_ITEMS: readonly { href: string; label: string }[] = [
  { href: "/products", label: "Products" },
  { href: "/fleet", label: "Fleet" },
  { href: "/how", label: "How it works" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/token", label: "Token" },
  { href: "/integrators", label: "Integrators" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = (): void => setMenuOpen(false);

  return (
    <header
      className="sticky top-0 z-40 border-b border-border backdrop-blur-md"
      style={{ background: "color-mix(in oklab, var(--paper) 88%, transparent)" }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-5 px-6">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[0.06em]"
        >
          <MonarkMark className="size-[30px]" />
          <span>MONARK</span>
        </Link>

        {/* Desktop nav — shown by breakpoint (lg), never by a JS width flag. */}
        <nav aria-label="Primary" className="ml-3 hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-lg px-[11px] py-2 text-sm transition-colors hover:bg-soft",
                  active ? "bg-soft text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex size-9 items-center justify-center rounded-[10px] border border-border bg-transparent font-mono text-[13px] transition-colors hover:bg-soft"
          >
            {theme === "dark" ? "☾" : "☼"}
          </button>

          <Link
            href="/integrators"
            className="hidden h-9 items-center rounded-[10px] bg-primary px-3.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-85 sm:inline-flex"
          >
            For integrators
          </Link>

          {/* Mobile menu toggle — shown below lg; a toggle, not a width-state. */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="inline-flex h-9 items-center rounded-[10px] border border-border bg-transparent px-3 text-[13px] transition-colors hover:bg-soft lg:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          aria-label="Primary"
          className="flex flex-col gap-0.5 border-t border-border bg-background px-4 pb-4 pt-2 lg:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "flex min-h-[44px] items-center rounded-lg px-2.5 text-base",
                isActive(pathname, item.href) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/integrators"
            onClick={closeMenu}
            className="flex min-h-[44px] items-center rounded-lg px-2.5 text-base text-monark-t"
          >
            For integrators
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
