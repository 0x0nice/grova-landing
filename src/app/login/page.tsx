"use client";

import { Suspense } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { LoginScreen } from "@/components/auth/login-screen";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-bg flex items-center justify-center">
            <Skeleton className="w-48 h-6" />
          </div>
        }
      >
        <LoginScreen />
      </Suspense>
    </AuthProvider>
  );
}
