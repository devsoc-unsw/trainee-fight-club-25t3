"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { Button } from "@/app/components/ui/button";
import { Loader2 as Spinner } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      await supabase.auth.signOut();
      
      router.refresh();
      
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
    >
      {isLoading ? (
        <Spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <></>
      )}
      Sign Out
    </Button>
  );
}