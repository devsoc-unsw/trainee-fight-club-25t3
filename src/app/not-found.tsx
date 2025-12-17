"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#09090b] p-4 text-center">
    <div className="space-y-4">
      <h1 className="text-6xl font-bold text-purple-500">404</h1>
      <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
      <p className="max-w-md text-zinc-400">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
    </div>
    <button
      onClick={() => router.push('/')}
      className="rounded-md bg-purple-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
    >
      Return to Home
    </button>
  </div>
);
}