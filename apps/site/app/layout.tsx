import type { ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Charter C typefaces (decision 145; OFL, decisions 105/107): Space Grotesk (variable) for the interface and
// prose, JetBrains Mono (variable) for data, Archivo Black for the wordmarks. SELF-HOSTED from the committed OFL
// files in app/fonts/ (licences beside them) through next/font/local — no font host is contacted, at build or at
// run time. Newsreader (long-form serif, /writing) is KEPT (ruling Q6) and still comes from next/font/google:
// fetched at BUILD time and then self-hosted by next/font (no runtime request); no local OFL copy of it exists
// yet — procurement request formed in the lot report (SITE-CHARTE-C), which would move it to next/font/local.
const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-wght.ttf",
  weight: "300 700",
  variable: "--font-space-grotesk",
  display: "swap",
});
const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-wght.ttf",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
});
const archivoBlack = localFont({
  src: "./fonts/ArchivoBlack-Regular.ttf",
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

// Static metadata only (honesty lint scans title/description; no digits). No generateMetadata (gate
// no_generate_metadata_in_apps_site). Description reprised from the existing shell, unchanged.
export const metadata: Metadata = {
  title: "MONARK",
  description:
    "MONARK — a company of agent-products on one coverage-controlled gate that emits commit, defer, or abstain, and a depletable authorization budget.",
};

// Apply the theme before first paint (ruling Q5): the stored explicit choice if any, else the system preference
// (prefers-color-scheme). try/catch for privacy-mode safety. The client ThemeProvider then syncs React state.
const themeInit =
  "(function(){try{var d=document.documentElement,s=null;try{s=localStorage.getItem('monark-theme')}catch(e){}var t=(s==='dark'||s==='light')?s:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark'){d.classList.add('dark')}d.style.colorScheme=t}catch(e){}})();";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${archivoBlack.variable} ${newsreader.variable} font-sans`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
