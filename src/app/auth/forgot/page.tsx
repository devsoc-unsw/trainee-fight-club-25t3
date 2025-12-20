"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Loader2 as Spinner, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/update-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (error: any) {
      setError(error.error_description || error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </p>
        </div>

        {success ? (
          <div className="p-4 text-center border border-green-500/50 bg-green-500/10 rounded-md">
            <h3 className="text-sm font-medium text-green-500">
              Check your email
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
            </p>
            <div className="mt-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-primary hover:text-primary/80 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/50 rounded-md">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleReset}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="name@example.com"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>

            <div className="flex justify-center">
              <Link
                href="/auth/login"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
