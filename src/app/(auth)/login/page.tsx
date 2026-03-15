"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OAuthButtons } from "@/components/oauth-buttons";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex bg-bg-primary">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="text-2xl font-extrabold text-text-primary tracking-tight mb-10 block"
          >
            SaaSKit
          </Link>

          <div
            className="p-8 bg-bg-secondary rounded-2xl border-2 border-border"
            style={{ boxShadow: "6px 6px 0px rgba(255, 255, 255, 0.06)" }}
          >
            <h1 className="text-2xl font-extrabold text-text-primary mb-1">Sign in to SaaSKit</h1>
            <p className="text-text-muted text-sm mb-6">Enter your credentials to continue</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-bold text-text-secondary mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-bg-primary border-2 border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-orange focus:outline-none transition-colors duration-150"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-bold text-text-secondary mb-1.5"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-primary border-2 border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-orange focus:outline-none transition-colors duration-150"
                  required
                />
              </div>

              {error && <p className="text-error text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 btn-primary disabled:btn-disabled text-base"
              >
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-bg-secondary px-3 text-text-muted font-medium">or</span>
              </div>
            </div>

            <OAuthButtons />

            <p className="text-center mt-5 text-sm text-text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-accent-orange font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right — Decorative violet panel */}
      <div className="hidden lg:flex flex-1 bg-bg-violet items-center justify-center relative overflow-hidden">
        {/* Decorative blob shapes */}
        <svg
          className="absolute -top-20 -right-20 w-80 h-80 opacity-40"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="100" fill="var(--bg-primary)" />
        </svg>
        <svg
          className="absolute -bottom-16 -left-16 w-64 h-64 opacity-30"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="100" fill="var(--bg-primary)" />
        </svg>
        <div className="relative z-10 text-center px-12">
          <h2 className="text-6xl font-extrabold text-text-dark tracking-tighter leading-[0.9] mb-4">
            LAUNCH
            <br />
            YOUR
            <br />
            <span className="italic text-white">SAAS.</span>
          </h2>
          <p className="text-text-dark/60 text-lg font-medium mt-4">
            Payments, taxes, and compliance
            <br />
            handled for you.
          </p>
          <span className="inline-block mt-6 px-4 py-1.5 bg-white/80 text-text-dark text-xs font-bold rounded-full border-2 border-black/10">
            Merchant of Record
          </span>
        </div>
      </div>
    </div>
  );
}
