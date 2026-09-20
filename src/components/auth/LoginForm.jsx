"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useCart } from "@/features/cart/CartProvider";

/**
 * Map NextAuth error codes / thrown error messages to user-friendly strings.
 */
function resolveErrorMessage(errorParam) {
  if (!errorParam) return "";

  // Explicit rate-limit codes
  if (errorParam === "TooManyAttempts") {
    return "Too many login attempts. Please try again in 15 minutes.";
  }

  // Thrown error message that NextAuth may pass through
  if (errorParam.startsWith("Too many login attempts")) {
    return errorParam;
  }

  // Generic credential failure
  if (errorParam === "CredentialsSignin") {
    return "Invalid email or password";
  }

  // Any other error
  return "An error occurred. Please try again.";
}

/**
 * Format milliseconds into MM:SS countdown string.
 */
function formatCountdown(ms) {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mergeCart } = useCart();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Rate-limit state
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfterMs, setRetryAfterMs] = useState(0);

  // ---- Handle redirect-based errors from NextAuth (?error=...) ----
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const message = resolveErrorMessage(errorParam);
      setServerError(message);

      // If this is a rate-limit error, disable the form and start countdown
      if (
        errorParam === "TooManyAttempts" ||
        errorParam.startsWith("Too many login attempts")
      ) {
        setIsRateLimited(true);
        // Parse "try again in X minutes" from the message
        const match = message.match(/(\d+)\s*minute/);
        if (match) {
          const ms = parseInt(match[1], 10) * 60 * 1000;
          setRetryAfterMs(ms);
        }
      }

      // Clean up the URL so the error doesn't re-appear on refresh
      window.history.replaceState({}, "", "/login");
    }
  }, [searchParams]);

  // ---- Countdown timer ----
  useEffect(() => {
    if (!isRateLimited || retryAfterMs <= 0) return;

    const interval = setInterval(() => {
      setRetryAfterMs((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, retryAfterMs > 0]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRateLimited) return;

    setServerError("");
    if (!validate()) return;

    setIsLoading(true);

    try {
      // ---- Pre-flight rate limit check (client-side path) ----
      const rateRes = await fetch("/api/auth/check-rate-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const rateData = await rateRes.json();

      if (!rateData.allowed) {
        const retryMs = rateData.retryAfter
          ? new Date(rateData.retryAfter).getTime() - Date.now()
          : 15 * 60 * 1000;
        const minutes = Math.ceil(retryMs / 60000);
        const msg = `Too many login attempts. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`;
        setServerError(msg);
        setIsRateLimited(true);
        setRetryAfterMs(Math.max(retryMs, 0));
        setIsLoading(false);
        return;
      }

      // ---- Actual sign-in ----
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Distinguish rate-limit from bad credentials via the pre-flight check
        // If pre-flight said allowed but signIn still failed → bad credentials
        setServerError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      await mergeCart();
      router.push("/account");
      router.refresh();
    } catch (error) {
      setServerError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const formDisabled = isLoading || isRateLimited;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--surface-soft)" }}
    >
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="heading-lg text-center mb-6">Login to Your Account</h1>

          {/* ---- Error banner ---- */}
          {serverError && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                background: "var(--danger-soft)",
                color: "var(--danger)",
                border: "1px solid var(--danger)",
              }}
            >
              {serverError}
              {isRateLimited && retryAfterMs > 0 && (
                <span className="block mt-1 font-mono text-xs opacity-80">
                  Try again in {formatCountdown(retryAfterMs)}
                </span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              required
              disabled={formDisabled}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              required
              disabled={formDisabled}
            />

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="link text-sm">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="btn-full"
              size="lg"
              disabled={formDisabled}
            >
              {isRateLimited ? "Login Disabled" : "Login"}
            </Button>
          </form>

          <p
            className="mt-6 text-center text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
