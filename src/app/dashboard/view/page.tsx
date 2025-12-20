"use client";

import { useEffect, useState } from "react";
import { ReceiptText, Trash2, Pencil, Loader2 } from "lucide-react";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TransactionsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State for the Edit Modal
  const [editItem, setEditItem] = useState<any | null>(null);

  // State for the Delete Confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch Data
  const refresh = async () => {
    const res = await fetch("/api/transactions");
    const json = await res.json();
    setData(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  // delete logic
  const executeDelete = async () => {
    if (!deleteId) return;

    setData((prev) => prev.filter((t) => t.id !== deleteId));

    await fetch(`/api/transactions?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
  };

  // save logic
  const saveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/transactions", {
      method: "PATCH",
      body: JSON.stringify(editItem),
    });
    setEditItem(null);
    refresh();
  };

  // Helper for Net Amount Calculation
  const handleAmountChange = (field: "debit" | "credit", val: string) => {
    if (!editItem) return;
    const numVal = parseFloat(val) || 0;
    const newItem = { ...editItem, [field]: numVal };

    const deb = field === "debit" ? numVal : newItem.debit || 0;
    const cred = field === "credit" ? numVal : newItem.credit || 0;
    newItem.amount = cred > 0 ? cred : deb > 0 ? -deb : 0;

    setEditItem(newItem);
  };

  const fmtMoney = (n: number | null) => {
    if (n === null || n === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <ReceiptText className="text-primary h-6 w-6" />
      </div>

      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right text-red-500">Debit</th>
                <th className="p-4 text-right text-green-500">Credit</th>
                <th className="p-4 text-right">Balance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((t) => (
                <tr key={t.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 text-muted-foreground whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="p-4 font-medium">{t.description}</td>
                  <td className="p-4">
                    {t.category ? (
                      <span className="bg-secondary px-2 py-1 rounded text-xs border border-border">
                        {t.category}
                      </span>
                    ) : (
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs italic">
                        Uncategorized
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right text-red-500/80 font-mono">
                    {t.debit ? fmtMoney(t.debit) : "-"}
                  </td>
                  <td className="p-4 text-right text-green-500/80 font-mono">
                    {t.credit ? fmtMoney(t.credit) : "-"}
                  </td>
                  <td className="p-4 text-right text-muted-foreground font-mono">
                    {t.balance ? fmtMoney(t.balance) : "-"}
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditItem(t)}
                      className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(t.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              transaction from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>

          <form onSubmit={saveTx} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editItem?.date || ""}
                  onChange={(e) =>
                    setEditItem({ ...editItem, date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Input
                  value={editItem?.category || ""}
                  onChange={(e) =>
                    setEditItem({ ...editItem, category: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={editItem?.description || ""}
                onChange={(e) =>
                  setEditItem({ ...editItem, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label className="text-red-500">Debit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editItem?.debit || ""}
                  onChange={(e) => handleAmountChange("debit", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-green-500">Credit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editItem?.credit || ""}
                  onChange={(e) => handleAmountChange("credit", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Balance</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editItem?.balance || ""}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      balance: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-right mt-2">
              Net Amount:{" "}
              <span
                className={
                  editItem?.amount < 0
                    ? "text-red-500 font-medium"
                    : "text-green-500 font-medium"
                }
              >
                {fmtMoney(editItem?.amount)}
              </span>
            </div>

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
