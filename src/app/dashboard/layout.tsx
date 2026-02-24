"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { NavBar } from "@/components/dashboard/nav-bar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { session, loading, isDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session && !isDemo) {
      router.push("/login");
    }
  }, [loading, session, isDemo, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Skeleton className="w-48 h-6" />
      </div>
    );
  }

  if (!session && !isDemo) return null;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Demo banner */}
      {isDemo && (
        <div className="bg-accent/10 border-b border-accent/20 px-5 py-2 text-center">
          <span className="font-mono text-footnote text-accent">
            Demo Mode — data is simulated
          </span>
        </div>
      )}

      <NavBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — 240px on desktop, hidden on mobile */}
        <div className="w-[240px] shrink-0 max-md:hidden">
          <Sidebar />
        </div>

        {/* Main content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-6 max-md:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
