"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "../components/mode-toggle";
import SignOutButton from "../components/ui/sign-out";

type Txn = {
  id: string;
  date: string;
  description: string;
  category: string;
  debit: string;
  credit: string;
};

const CATEGORIES = [
  "Income",
  "Transport",
  "Food & Dining",
  "Entertainment",
  "Shopping",
  "Health & Fitness",
  "Bills & Utilities",
  "Subscriptions",
  "Transfers & Savings",
  "Rent & Housing",
  "Personal",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function toNum(x: string) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

export default function DataEntryPage() {
  const router = useRouter();
  const [startingBalance] = useState<number>(1000);
  const [rows, setRows] = useState<Txn[]>([
    { id: uid(), date: todayISO(), description: "", category: "", debit: "", credit: "" },
    { id: uid(), date: todayISO(), description: "", category: "", debit: "", credit: "" },
  ]);

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const balances = useMemo(() => {
    let bal = startingBalance;
    return rows.map((r) => {
      bal = bal - toNum(r.debit) + toNum(r.credit);
      return bal;
    });
  }, [rows, startingBalance]);

  function updateRow(id: string, patch: Partial<Txn>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: uid(), date: todayISO(), description: "", category: "", debit: "", credit: "" },
    ]);
  }

  function deleteRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function validateRows() {
    const anyFilled = rows.some(
      (r) => r.description.trim() || r.category || r.debit || r.credit
    );
    if (!anyFilled) return "Add at least one transaction.";

    for (const r of rows) {
      const d = toNum(r.debit);
      const c = toNum(r.credit);
      if (r.debit && r.credit && (d !== 0 || c !== 0)) {
        return "For a row, fill either Debit OR Credit (not both).";
      }
      if ((r.debit || r.credit) && (!r.category || !r.description.trim())) {
        return "If you enter an amount, please also add Description + Category.";
      }
    }
    return "";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const err = validateRows();
    if (err) {
      setMsg(err);
      return;
    }

    const transactionsToSend = rows
      .filter((r) => r.description.trim() || r.category || r.debit || r.credit)
      .map((r) => ({
        date: r.date,
        description: r.description.trim(),
        category: r.category,
        debit: toNum(r.debit),
        credit: toNum(r.credit),
      }));

    setSaving(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: transactionsToSend }),
      });

      router.push("/dashboard");
    } catch {
      setMsg("Network error.");
      setSaving(false);
    }
  }

  return (
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
            href="/dashboard"
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
          >
            Dashboard
          </Link>

          <Link
            href="/entry"
            className="rounded-md px-3 py-2 text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground"
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
        <h1 className="text-xl font-semibold mb-6 text-foreground">Entry</h1>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <form onSubmit={handleSave} className="p-6">
            <div className="grid grid-cols-[130px_200px_180px_110px_110px_120px_50px] gap-3 px-2 pb-3 text-sm font-bold text-muted-foreground">
              <div>Date</div>
              <div>Description</div>
              <div>Category</div>
              <div>Debit ($)</div>
              <div>Credit ($)</div>
              <div>Balance ($)</div>
              <div></div>
            </div>

            <div className="flex flex-col gap-3">
              {rows.map((r, idx) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[130px_200px_180px_110px_110px_120px_50px] gap-3 items-end p-2 rounded-lg border border-border bg-card/50"
                >
                  <div>
                    <input
                      type="date"
                      value={r.date}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        updateRow(r.id, { date: newValue });
                      }}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={r.description}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        updateRow(r.id, { description: newValue });
                      }}
                      placeholder="e.g. Woolworths"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <select
                      value={r.category}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        updateRow(r.id, { category: newValue });
                      }}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select…</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      step="0.01"
                      value={r.debit}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        updateRow(r.id, { debit: newValue });
                      }}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      step="0.01"
                      value={r.credit}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        updateRow(r.id, { credit: newValue });
                      }}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <input
                      readOnly
                      value={balances[idx].toFixed(2)}
                      className="w-full px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground text-sm"
                    />
                  </div>

                  <div className="flex items-end pb-0">
                    <button
                      type="button"
                      onClick={() => deleteRow(r.id)}
                      className="w-10 h-10 rounded-md border border-input bg-red-500 hover:bg-red-600 text-white transition text-base"
                      title="Delete"
                      aria-label="Delete row"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={addRow}
                className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground text-sm font-semibold transition"
              >
                ➕ Add Transaction
              </button>
            </div>

            {msg && (
              <p className="mt-4 text-sm font-semibold text-red-500">{msg}</p>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 rounded-md border border-input bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold transition"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Transactions"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}