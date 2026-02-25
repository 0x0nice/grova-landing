"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Skeleton } from "@/components/ui/skeleton";

function OnboardingGuard() {
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

  return <OnboardingWizard />;
}

export default function OnboardingPage() {
  return (
    <AuthProvider>
      <OnboardingGuard />
    </AuthProvider>
  );
}
