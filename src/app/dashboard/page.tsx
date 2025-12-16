"use client";

import Link from "next/link";
import { Tooltip, Sankey } from "recharts";
import SankeyNode from "@/app/components/sankey-node";

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
            <div className="text-sm font-medium">Profile</div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-xl font-semibold mb-6">Welcome back, user</h1>

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
              <p className="text-sm text-white/60">
                Biggest Category (Last Month)
              </p>
              <p className="mt-2 text-2xl font-semibold">Rent</p>
              <p className="text-sm text-white/60">$4,000</p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg bg-white/5 p-6">
              <div className="grid gap-6">
                <div className="rounded-lg bg-white/5 p-6 min-w-xl">
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
                    <Tooltip />
                  </Sankey>
                </div>

                <div className="rounded-lg bg-white/5 p-6">
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
