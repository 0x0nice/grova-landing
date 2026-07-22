import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import { FontSizeProvider } from "@/providers/font-size-provider";
import { AnalyticsProvider } from "@/providers/analytics-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { initSentry } from "@/lib/sentry";
import "./globals.css";

// Initialize Sentry at module level (before any renders)
initSentry();

export const metadata: Metadata = {
  title: "Grova - Feedback in. A decision out.",
  description:
    "Turn raw product feedback into ranked evidence, likely cause, priority, and a clear next action.",
  openGraph: {
    title: "Grova - Feedback in. A decision out.",
    description:
      "Turn raw product feedback into ranked evidence, likely cause, priority, and a clear next action.",
    url: "https://grova.dev",
    siteName: "Grova",
    images: [
      {
        url: "https://grova.dev/og.png",
        width: 1200,
        height: 630,
        alt: "Grova feedback decision brief",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grova - Feedback in. A decision out.",
    description:
      "Turn raw product feedback into ranked evidence, likely cause, priority, and a clear next action.",
    images: ["https://grova.dev/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=sentient@400,500&display=swap"
        />
        {/* Prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('grova-theme');if(t){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`,
          }}
        />
        {/* Prevent flash of wrong font size */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem('grova-font-size');if(p!==null){var m={0:0.88,1:1,2:1.14,3:1.28};var s=m[Number(p)];if(s)document.documentElement.style.setProperty('--font-scale',String(s))}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
          {/* Skip to main content link for keyboard navigation */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999]
                       bg-accent text-black font-mono text-footnote px-4 py-2 rounded"
          >
            Skip to main content
          </a>
          <ThemeProvider>
            <FontSizeProvider>
              <AnalyticsProvider>
                <ErrorBoundary>
                  <ToastProvider>
                    {children}
                    <CookieConsent />
                  </ToastProvider>
                </ErrorBoundary>
              </AnalyticsProvider>
            </FontSizeProvider>
          </ThemeProvider>
        </body>
    </html>
  );
}
