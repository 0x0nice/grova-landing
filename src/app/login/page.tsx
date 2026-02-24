"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { LoginScreen } from "@/components/auth/login-screen";

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>
  );
}
