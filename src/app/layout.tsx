import type { Metadata } from "next";
import { instrumentSerif, geistMono } from "@/lib/fonts";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grova — Feedback triage for developers",
  description:
    "Capture user feedback, use AI to filter and score submissions, then deliver structured fix briefs ready for implementation.",
  openGraph: {
    title: "Grova — Feedback triage for developers",
    description:
      "Capture user feedback, use AI to filter and score submissions, then deliver structured fix briefs ready for implementation.",
    url: "https://grova.dev",
    siteName: "Grova",
    images: [
      {
        url: "https://grova.dev/og.png",
        width: 1200,
        height: 630,
        alt: "Grova — Feedback, triaged.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grova — Feedback triage for developers",
    description:
      "Capture user feedback, use AI to filter and score submissions, then deliver structured fix briefs ready for implementation.",
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
      className={`${instrumentSerif.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('grova-theme');if(t){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`,
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
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </body>
    </html>
  );
}
