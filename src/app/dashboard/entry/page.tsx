"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react"; // Ideally use an icon if you have lucide-react installed

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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfMsg, setPdfMsg] = useState("");

  const [startingBalance] = useState<number>(1000);
  const [rows, setRows] = useState<Txn[]>([
    {
      id: uid(),
      date: todayISO(),
      description: "",
      category: "",
      debit: "",
      credit: "",
    },
    {
      id: uid(),
      date: todayISO(),
      description: "",
      category: "",
      debit: "",
      credit: "",
    },
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
      {
        id: uid(),
        date: todayISO(),
        description: "",
        category: "",
        debit: "",
        credit: "",
      },
    ]);
  }

  function deleteRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function validateRows() {
    const anyFilled = rows.some(
      (r) => r.description.trim() || r.category || r.debit || r.credit,
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

    // Filter and Map rows to match the API expectation
    const transactionsToSend = rows
      .map((r, index) => {
        // We map using the index to grab the calculated balance for this row
        const currentBalance = balances[index];

        return {
          date: r.date,
          description: r.description.trim(),
          category: r.category,
          debit: r.debit, // Sending as string or number is fine, your API parses it
          credit: r.credit,
          // CRITICAL: Convert balance to string because your API calls .replace() on it
          balance: currentBalance.toFixed(2).toString(),
        };
      })
      // Filter out empty rows (where nothing was entered)
      .filter((t) => t.description || t.debit || t.credit);

    setSaving(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: transactionsToSend }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to save");
      }

      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      setMsg(error.message || "Network error.");
      setSaving(false);
    }
  }

  async function handlePdfUpload(e: React.FormEvent) {
    e.preventDefault();
    setPdfMsg("");

    if (!pdfFile) {
      setPdfMsg("Please select a PDF file.");
      return;
    }

    try {
      // parse pdf into raw text
      const formData = new FormData();
      formData.append("pdfFile", pdfFile);

      const parseRes = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!parseRes.ok) {
        setPdfMsg("Failed to parse PDF.");
        return;
      }

      const parseData = await parseRes.json();
      const rawText = parseData.text;

      setPdfMsg("PDF parsed! Analysing...");

      // send raw pdf text to the parser
      const analyzeRes = await fetch(
        "https://bank-statement-parser-tp25t3-production.up.railway.app/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            raw_statement: rawText,
          }),
        },
      );

      if (!analyzeRes.ok) {
        setPdfMsg("Failed to analyse statement.");
        return;
      }

      const data = await analyzeRes.json();

      // store data for sankey chart
      console.log("Nodes:", data.sankey_data.nodes);
      console.log("Links:", data.sankey_data.links);

      setPdfMsg("Analysis complete!");

      const sankeyData = {
        nodes: data.sankey_data.nodes,
        links: data.sankey_data.links,
      };
      localStorage.setItem("sankeyData", JSON.stringify(sankeyData));

      // store data for other metrics
      const metricsData = {
        total_spent: data.total_spent,
        total_received: data.total_received,
        net_cash_flow: data.net_cash_flow,
        transaction_count: data.transaction_count,
        category_summary: data.category_summary,
      };

      localStorage.setItem("analysisMetrics", JSON.stringify(metricsData));
    } catch (err) {
      console.error(err);
      setPdfMsg("Error processing PDF.");
    }
  }

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <h1 className="text-xl font-semibold mb-6 text-foreground">Entry</h1>

      <div className="rounded-lg border border-border bg-card shadow-sm mb-8">
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

      {/* Improved Upload PDF Section */}
      <div className="rounded-lg border border-border bg-card shadow-sm p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-primary" />
          Upload Bank Statement
        </h2>
        <form onSubmit={handlePdfUpload} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files) setPdfFile(e.target.files[0]);
              }}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50
                file:mr-4 file:py-1 file:px-3 file:rounded-md file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 file:transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!pdfFile}
            className="w-full md:w-auto px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>

          {pdfMsg && (
            <p
              className={`text-sm font-medium ${pdfMsg.includes("Success") || pdfMsg.includes("complete") ? "text-green-500" : "text-muted-foreground"}`}
            >
              {pdfMsg}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
