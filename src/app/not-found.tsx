"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4 text-center text-foreground">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">
          Page Not Found
        </h2>
        <p className="max-w-md text-muted-foreground">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <Button onClick={() => router.push("/dashboard")} size="lg">
        Return to Home
      </Button>
    </div>
  );
}
