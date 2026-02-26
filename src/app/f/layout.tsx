import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share Your Feedback",
  description: "Quick feedback form — takes less than 60 seconds.",
  robots: "noindex, nofollow",
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] bg-bg flex items-center justify-center p-4">
      {children}
    </main>
  );
}
