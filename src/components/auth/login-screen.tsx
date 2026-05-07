"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/providers/auth-provider";
import { trackEvent } from "@/providers/analytics-provider";
import Link from "next/link";

type AuthMode = "signin" | "signup" | "forgot";

const API = process.env.NEXT_PUBLIC_API_URL!;

interface FormError {
  message: string;
  isNetwork: boolean;
}

/**
 * Translate raw auth/network errors into something a user can act on.
 * Browsers report fetch failures with vendor-specific messages
 * ("load failed" on Safari, "Failed to fetch" on Chrome/Firefox);
 * those are unhelpful in the UI.
 */
function classifyError(err: unknown): FormError {
  const raw = err instanceof Error ? err.message : "";
  const networkLike =
    /load failed|failed to fetch|networkerror|network request failed|fetch failed|err_name_not_resolved/i.test(
      raw
    );
  if (networkLike) {
    return {
      isNetwork: true,
      message:
        "We couldn't reach the auth server. Check your connection — or try Demo mode below.",
    };
  }
  if (/supabase(url|key) is required/i.test(raw)) {
    return {
      isNetwork: true,
      message: "Login isn't configured for this environment. Try Demo mode below.",
    };
  }
  return {
    isNetwork: false,
    message: raw || "Something went wrong.",
  };
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, ease: "easeOut" as const },
};

export function LoginScreen() {
  const searchParams = useSearchParams();
  const initialMode: AuthMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<FormError | null>(null);
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const session = await signIn(email, password);
        trackEvent("user_signed_in");

        // Smart redirect: new users → onboarding, returning users → dashboard
        try {
          const res = await fetch(`${API}/projects`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          });
          if (res.ok) {
            const projects = await res.json();
            if (Array.isArray(projects) && projects.length === 0) {
              router.push("/onboarding");
              return;
            }
          }
        } catch {
          // If project check fails, fall through to dashboard
        }
        router.push("/dashboard");
      } else if (mode === "signup") {
        const msg = await signUp(email, password);
        trackEvent("user_signed_up");
        setInfo(msg);
      } else {
        await resetPassword(email);
        setInfo("Check your email for a reset link.");
      }
    } catch (err) {
      setError(classifyError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-10 py-6 max-md:px-5">
        <Logo size="lg" />
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-footnote text-text3 hover:text-text2 transition-colors uppercase"
          >
            Back
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Center card */}
      <div className="flex-1 flex items-center justify-center px-5">
        <motion.div
          className="w-full max-w-[400px] bg-surface border border-border rounded-lg p-8"
          {...fadeUp}
        >
          <span className="block font-mono text-caption text-text3 uppercase mb-4">
            Dashboard
          </span>

          <h1 className="font-serif text-[clamp(1.75rem,3.2vw,2.4rem)] font-normal leading-[1.1] text-text mb-2">
            {mode === "forgot" ? (
              <>
                Reset <em className="text-text2">password.</em>
              </>
            ) : mode === "signup" ? (
              <>
                Sign <em className="text-text2">up.</em>
              </>
            ) : (
              <>
                Sign <em className="text-text2">in.</em>
              </>
            )}
          </h1>

          <p className="text-callout text-text2 font-light mb-6">
            {mode === "forgot"
              ? "Enter your email and we'll send a reset link."
              : "Sign in to manage your projects and feedback."}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {mode !== "forgot" && (
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            )}

            {error && (
              <div
                role="alert"
                className="font-mono font-normal text-footnote text-red flex flex-col gap-1.5"
              >
                <p>{error.message}</p>
                {error.isNetwork && (
                  <Link
                    href="/dashboard/inbox?demo"
                    className="text-accent hover:text-accent/80 transition-colors uppercase tracking-[0.04em]"
                  >
                    Try Demo →
                  </Link>
                )}
              </div>
            )}

            {info && (
              <p
                role="status"
                className="font-mono font-normal text-footnote text-accent"
              >
                {info}
              </p>
            )}

            <Button type="submit" variant="fill" loading={loading} className="w-full">
              {mode === "forgot"
                ? "Send reset link"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </form>

          <div className="mt-5 flex flex-col gap-2 text-center">
            {mode === "signin" && (
              <>
                <button
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setInfo("");
                  }}
                  className="font-mono text-footnote text-text3 hover:text-text2 transition-colors cursor-pointer"
                >
                  Don&apos;t have an account?{" "}
                  <span className="text-accent">Sign up</span>
                </button>
                <button
                  onClick={() => {
                    setMode("forgot");
                    setError(null);
                    setInfo("");
                  }}
                  className="font-mono text-footnote text-text3 hover:text-text2 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </>
            )}
            {mode === "signup" && (
              <button
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setInfo("");
                }}
                className="font-mono text-footnote text-text3 hover:text-text2 transition-colors cursor-pointer"
              >
                Already have an account?{" "}
                <span className="text-accent">Sign in</span>
              </button>
            )}
            {mode === "forgot" && (
              <button
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setInfo("");
                }}
                className="font-mono text-footnote text-text3 hover:text-text2 transition-colors cursor-pointer"
              >
                Back to <span className="text-accent">sign in</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
