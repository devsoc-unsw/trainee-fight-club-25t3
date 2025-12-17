"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Loader2 as Spinner } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
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
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Create an account
          </h1>
          <p className="text-sm text-zinc-400">
            Enter your email below to create your account
          </p>
        </div>

        {success ? (
          <div className="p-4 text-center border border-green-900/50 bg-green-900/20 rounded-md">
            <h3 className="text-sm font-medium text-green-400">Check your email</h3>
            <p className="mt-1 text-xs text-zinc-400">
              We&apos;ve sent you a confirmation link. Be sure to check your spam folder.
            </p>
            <Button 
              className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-white"
              onClick={() => router.push("/auth/login")}
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-md">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSignup}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="name@example.com"
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-purple-600 focus:border-purple-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-zinc-900 border-zinc-800 text-white focus:ring-purple-600 focus:border-purple-600"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                {isLoading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
            </form>

            <div className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-purple-500 hover:underline">
                Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}