"use client";

import Link from "next/link";
import { Tooltip, Sankey } from "recharts";
import SankeyNode from "@/app/components/sankey-node";
import SignOutButton from "../components/ui/sign-out";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { Loader2 as Spinner } from "lucide-react";

// Define a type for safety (optional but recommended)
type SankeyData = {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<SankeyData | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }
      setLoading(false);

      // get sankey data from local storage
      const storedData = localStorage.getItem("sankeyData");
      if (storedData) {
        try {
          setChartData(JSON.parse(storedData));
        } catch (e) {
          console.error("Failed to parse local storage data", e);
        }
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <Spinner className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-black-700 text-white">
        <aside className="flex w-64 flex-col border-r border-white/10 bg-[#161616]">
          <div className="flex h-16 items-center px-6 border-b border-white/10">
            <Link
              href="/"
              className="text-3xl font-semibold tracking-tight text-[oklch(0.627_0.265_303.9)]"
            >
              Zanki
            </Link>
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
            <Link
              href="/entry"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-white/5 transition"
            >
              Upload Data
            </Link>
            <Link
              href="/chatbot"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-white/5 transition"
            >
              AI Chatbot
            </Link>
          </nav>

          <div className="border-t border-white/10 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Profile</div>
              <SignOutButton />
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-xl font-semibold mb-6">Welcome back, user</h1>

          {/* stats cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
            <div className="rounded-lg bg-white/5 p-6">
              <p className="text-sm text-white/60">Net Cash Flow</p>
              <p className="mt-2 text-2xl font-semibold text-green-400">
                +$1,234
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-6">
              <p className="text-sm text-white/60">Total Spending</p>
              <p className="mt-2 text-2xl font-semibold text-red-400">
                -$9,999
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-6">
              <p className="text-sm text-white/60">Biggest Category</p>
              <p className="mt-2 text-2xl font-semibold">Rent</p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg bg-white/5 p-6">
              <div className="grid gap-6">
                <div className="rounded-lg bg-white/5 p-6 min-w-xl">
                  <h2 className="text-lg font-semibold mb-4">Sankey Chart</h2>

                  {/* render conditionally based on if data exists */}
                  {chartData ? (
                    <Sankey
                      width={700}
                      height={600}
                      data={chartData}
                      nodePadding={20}
                      nodeWidth={15}
                      margin={{ top: 10, bottom: 50, left: 10, right: 10 }}
                      link={{ stroke: "#ffffff", strokeOpacity: 0.5 }}
                      node={<SankeyNode />}
                    >
                      <Tooltip />
                    </Sankey>
                  ) : (
                    <div className="flex h-[300px] flex-col items-center justify-center text-white/40">
                      <p>No data found.</p>
                      <Link
                        href="/entry"
                        className="text-purple-400 hover:underline mt-2"
                      >
                        Upload a statement
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
