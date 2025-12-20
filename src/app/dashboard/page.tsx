"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sankey, Tooltip } from "recharts";
import { Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import SankeyNode from "@/components/sankey-node";

// Type definitions
type CategorySummary = {
  category: string;
  spent: number;
  received: number;
  count: number;
};

type MetricsData = {
  total_spent: number;
  total_received: number;
  net_cash_flow: number;
  transaction_count: number;
  category_summary: CategorySummary[];
};

type SankeyData = {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
};

// Currency formatter helper
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(val);
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [chartData, setChartData] = useState<SankeyData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Small delay for UI smoothness
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (typeof window !== "undefined") {
        try {
          // 1. Get Metrics Data
          const storedMetrics = localStorage.getItem("analysisMetrics");
          if (storedMetrics) {
            setMetrics(JSON.parse(storedMetrics));
          }

          // 2. Get Sankey Data (Stored separately)
          const storedSankey = localStorage.getItem("sankeyData");
          if (storedSankey) {
            setChartData(JSON.parse(storedSankey));
          }
        } catch (e) {
          console.error("Failed to parse local storage data", e);
        }
      }
      setLoading(false);
    };

    loadData();
  }, []);

  // Calculate biggest category safely
  const biggestCategory =
    metrics?.category_summary && metrics.category_summary.length > 0
      ? metrics.category_summary[0] // API sorts this by spent desc
      : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold mb-6">Financial Overview</h1>

      {/* --- Metrics Section --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        {/* Net Cash Flow */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Net Cash Flow
            </p>
            <p
              className={`mt-2 text-2xl font-bold ${
                (metrics?.net_cash_flow || 0) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {metrics ? formatCurrency(metrics.net_cash_flow) : "$0.00"}
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs text-muted-foreground">
            {metrics && metrics.net_cash_flow >= 0 ? (
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
            )}
            {metrics ? "Based on recent upload" : "No data available"}
          </div>
        </div>

        {/* Total Spending */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Spending
            </p>
            <p className="mt-2 text-2xl font-bold text-red-500">
              {metrics ? formatCurrency(metrics.total_spent) : "$0.00"}
            </p>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Across {metrics?.transaction_count || 0} transactions
          </div>
        </div>

        {/* Biggest Category */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Top Expense
            </p>
            <p className="mt-2 text-2xl font-bold truncate">
              {biggestCategory ? biggestCategory.category : "N/A"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {biggestCategory
                ? formatCurrency(biggestCategory.spent)
                : "$0.00"}
            </p>
          </div>
          <div className="mt-4 w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{
                width:
                  metrics && biggestCategory
                    ? `${(biggestCategory.spent / metrics.total_spent) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* --- Charts Section --- */}
      <div className="grid gap-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-6">
            {/* Sankey Chart */}
            <div className="rounded-lg border border-border bg-card/50 p-6 min-w-xl overflow-x-auto">
              <h2 className="text-lg font-semibold mb-4">Sankey Chart</h2>

              {chartData && chartData.links.length > 0 ? (
                <Sankey
                  width={700}
                  height={600}
                  data={chartData}
                  nodePadding={20}
                  nodeWidth={15}
                  margin={{ top: 10, bottom: 50, left: 10, right: 10 }}
                  link={{ stroke: "#4ade80", strokeOpacity: 0.3 }}
                  node={<SankeyNode />}
                >
                  <Tooltip
                    formatter={(value: any) => formatCurrency(value as number)}
                  />
                </Sankey>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground/40">
                  <DollarSign className="w-12 h-12 mb-4 opacity-20" />
                  <p>No visualization data found.</p>
                  <Link
                    href="/dashboard/entry"
                    className="text-primary hover:underline mt-2 font-medium"
                  >
                    Upload a bank statement
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
