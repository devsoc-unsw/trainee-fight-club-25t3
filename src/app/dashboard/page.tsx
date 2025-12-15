import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <div className="flex h-screen bg-black-700 text-white">
        {/* Sidebar */}
        <aside className="flex w-64 flex-col border-r border-white/10 bg-[#161616]">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-white/10">
            <Link
              href="/"
              className="text-3xl font-semibold tracking-tight text-[oklch(0.627_0.265_303.9)]"
            >
              Zanki
            </Link>
          </div>

          {/* Navigation */}
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

          {/* Profile */}
          <div className="border-t border-white/10 px-6 py-4">
            <div className="text-sm font-medium">Profile</div>
          </div>
        </aside>

        {/* Main content */}
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
              <p className="mt-2 text-2xl font-semibold text-red-400">$9,999</p>
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
            <div className="rounded-lg bg-white/5 p-6">Sankey diagram here</div>

            <div className="rounded-lg bg-white/5 p-6">
              Other diagrams (line graphs, pie charts etc.)
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
