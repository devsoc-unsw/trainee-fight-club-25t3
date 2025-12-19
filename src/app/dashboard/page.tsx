"use client";

import Link from "next/link";
import { Tooltip, Sankey } from "recharts";
import SankeyNode from "@/app/components/sankey-node";
import SignOutButton from "../components/ui/sign-out";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { Loader2 as Spinner } from "lucide-react";
import { ModeToggle } from "../components/mode-toggle";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Check if User is Logined In
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // Loading Screen (Fixed colors)
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // temp hard coded data
  const sankeyData = {
    nodes: [
      { name: "Salary" },
      { name: "Freelance" },
      { name: "Rent" },
      { name: "Food" },
      { name: "Entertainment" },
      { name: "Savings" },
    ],
    links: [
      { source: 0, target: 2, value: 1200 },
      { source: 0, target: 3, value: 400 },
      { source: 0, target: 5, value: 300 },
      { source: 1, target: 3, value: 200 },
      { source: 1, target: 4, value: 150 },
    ],
  };

  return (
    <>
      <div className="flex h-screen bg-background text-foreground">
        <aside className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <div className="flex h-16 justify-between items-center px-6 border-b border-sidebar-border">
            <Link
              href="/"
              className="text-3xl font-semibold tracking-tight text-primary"
            >
              Zanki
            </Link>
            <ModeToggle />
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
            <Link
              href="/entry"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
            >
              Upload Data
            </Link>

            <Link
              href="/chatbot"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
            >
              AI Chatbot
            </Link>
          </nav>

          <div className="border-t border-sidebar-border px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Profile</div>
              <SignOutButton />
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-xl font-semibold mb-6">Welcome back, user</h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">Net Cash Flow</p>
              <p className="mt-2 text-2xl font-semibold text-green-500">
                +$1,234
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">Total Spending</p>
              <p className="mt-2 text-2xl font-semibold text-red-500">
                -$9,999
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Biggest Category (Last Month)
              </p>
              <p className="mt-2 text-2xl font-semibold">Rent</p>
              <p className="text-sm text-muted-foreground">$4,000</p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="grid gap-6">
                
                {/* 6. Chart Container: Needs explicit border/card style */}
                <div className="rounded-lg border border-border bg-card/50 p-6 min-w-xl">
                  <h2 className="text-lg font-semibold mb-4">Sankey Chart</h2>
                  <Sankey
                    width={700}
                    height={400}
                    data={sankeyData}
                    nodePadding={50}
                    nodeWidth={15}
                    margin={{ top: 20, bottom: 20, left: 20, right: 120 }}
                    link={{ stroke: "#4ade80", strokeOpacity: 0.5 }}
                    node={<SankeyNode />}
                  >
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', color: 'var(--popover-foreground)' }}
                      itemStyle={{
                        color: 'var(--popover-foreground)' 
                      }}
                    />
                  </Sankey>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  Other diagrams (line graphs, pie charts etc.)
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}