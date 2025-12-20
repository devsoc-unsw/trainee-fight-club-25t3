"use client";

import { Tooltip, Sankey } from "recharts";
import SankeyNode from "@/components/sankey-node";

export default function DashboardPage() {
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
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    color: "var(--popover-foreground)",
                  }}
                  itemStyle={{
                    color: "var(--popover-foreground)",
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
    </div>
  );
}