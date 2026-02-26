"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Skeleton } from "@/components/ui/skeleton";

const API = process.env.NEXT_PUBLIC_API_URL!;

function OnboardingGuard() {
  const { session, loading, isDemo } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!session && !isDemo) {
      router.push("/login");
      return;
    }

    // If authenticated (not demo), check if user already has projects
    if (session) {
      fetch(`${API}/projects`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((projects) => {
          if (Array.isArray(projects) && projects.length > 0) {
            router.push("/dashboard");
          } else {
            setChecking(false);
          }
        })
        .catch(() => setChecking(false));
    } else {
      // Demo mode — skip check
      setChecking(false);
    }
  }, [loading, session, isDemo, router]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Skeleton className="w-48 h-6" />
      </div>
    );
  }

  if (!session && !isDemo) return null;

  return <OnboardingWizard />;
}

export default function OnboardingPage() {
  return (
    <AuthProvider>
      <OnboardingGuard />
    </AuthProvider>
  );
}
