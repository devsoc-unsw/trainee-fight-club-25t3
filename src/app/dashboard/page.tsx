import Link from "next/link";

export default function DashboardPage() {
  return (
    // navbar
    <>
      <header className="w-full border-b border-white bg-gray-900">
        <nav className="relative mx-auto flex h-16 max-w-7xl items-center px-6">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-purple-600"
            >
              Zanki
            </Link>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-10">
            <Link
              href="/entry"
              className="text-sm font-medium text-white hover:text-white transition-colors"
            >
              Upload Data
            </Link>

            <Link
              href="/chatbot"
              className="text-sm font-medium text-white hover:text-white transition-colors"
            >
              AI Chatbot
            </Link>
          </div>

          <div className="ml-auto flex items-center">Profile</div>
        </nav>
      </header>

      <main>
        <div>side bar goes here</div>

        <div>Welcome back, user</div>

        <div>
          <div>Sankey diagram here</div>

          <div>Other diagrams (line graphs, pie charts etc.)</div>
        </div>
      </main>
    </>
  );
}
