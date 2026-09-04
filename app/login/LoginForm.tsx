"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  GoogleIcon,
  AppleIcon,
  FacebookIcon,
} from "@/components/auth/SocialIcons";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Visual only — no real auth in v1
    setTimeout(() => {
      router.push("/");
    }, 600);
  }

  return (
    <>
      {/* Social buttons */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => alert("Sign in with Google — coming soon")}
        >
          <GoogleIcon /> Continue with Google
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => alert("Sign in with Apple — coming soon")}
        >
          <AppleIcon /> Continue with Apple
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => alert("Sign in with Facebook — coming soon")}
        >
          <FacebookIcon /> Continue with Facebook
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-text-muted">
        <div className="h-px flex-1 bg-border" />
        <span>or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-surface/60 py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-border bg-surface/60 py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-cream"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-text-secondary">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-surface text-accent focus:ring-accent"
            />
            Remember me
          </label>
          <a href="#" className="text-accent-bright hover:underline">
            Forgot password?
          </a>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        New to Movbox?{" "}
        <Link href="/signup" className="font-medium text-accent-bright hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
