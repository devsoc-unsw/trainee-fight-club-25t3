"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tooltip, Sankey } from "recharts";
import { Loader2 } from "lucide-react";
import SankeyNode from "@/components/sankey-node";

// Define a type for safety
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
      // Simulate a quick check or just proceed
      setLoading(false);

      // Get sankey data from local storage
      if (typeof window !== "undefined") {
        const storedData = localStorage.getItem("sankeyData");
        if (storedData) {
          try {
            setChartData(JSON.parse(storedData));
          } catch (e) {
            console.error("Failed to parse local storage data", e);
          }
        }
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold mb-6">Welcome back, user</h1>

      {/* Stats Grid */}
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

      {/* Charts Area */}
      <div className="grid gap-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-6">
            
            {/* Sankey Chart Container */}
            <div className="rounded-lg border border-border bg-card/50 p-6 min-w-xl overflow-x-auto">
              <h2 className="text-lg font-semibold mb-4">Sankey Chart</h2>
              
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
                <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground/40">
                  <p>No data found.</p>
                  <Link
                    href="/dashboard/entry"
                    className="text-primary hover:underline mt-2"
                  >
                    Upload a statement
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              Other diagrams (line graphs, pie charts etc.)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}