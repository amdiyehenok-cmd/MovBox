"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  GoogleIcon,
  AppleIcon,
  FacebookIcon,
} from "@/components/auth/SocialIcons";

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const pwChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/");
    }, 600);
  }

  return (
    <>
      <div className="space-y-2">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => alert("Sign up with Google — coming soon")}
        >
          <GoogleIcon /> Continue with Google
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => alert("Sign up with Apple — coming soon")}
        >
          <AppleIcon /> Continue with Apple
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => alert("Sign up with Facebook — coming soon")}
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
            Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-border bg-surface/60 py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>
        </div>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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
          {password && (
            <ul className="mt-2 space-y-1 text-xs">
              <li
                className={`flex items-center gap-1.5 ${
                  pwChecks.length ? "text-success" : "text-text-muted"
                }`}
              >
                <Check className="h-3 w-3" /> 8+ characters
              </li>
              <li
                className={`flex items-center gap-1.5 ${
                  pwChecks.upper ? "text-success" : "text-text-muted"
                }`}
              >
                <Check className="h-3 w-3" /> One uppercase letter
              </li>
              <li
                className={`flex items-center gap-1.5 ${
                  pwChecks.number ? "text-success" : "text-text-muted"
                }`}
              >
                <Check className="h-3 w-3" /> One number
              </li>
            </ul>
          )}
        </div>

        <label className="flex items-start gap-2 text-xs text-text-secondary">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border bg-surface text-accent focus:ring-accent"
          />
          <span>
            I agree to the{" "}
            <a href="#" className="text-accent-bright hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-accent-bright hover:underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent-bright hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
