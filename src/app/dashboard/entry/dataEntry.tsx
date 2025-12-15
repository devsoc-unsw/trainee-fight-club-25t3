import React from 'react';
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DataEntryPage() {
  const router = useRouter();
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!source.trim() || !target.trim() || !amount) {
      setMsg("Fill source, target, and amount.");
      return;
    }

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: source.trim(),
          target: target.trim(),
          amount: Number(amount),
        }),
      });
      if (!res.ok) {
        setMsg("Save failed.");
        return;
      }
      setMsg("Saved!");
      router.push("/dashboard"); 
    } catch {
      setMsg("Network error.");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h1>Manual Entry</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            placeholder="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <input
            placeholder="Target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <button type="submit">Save</button>
        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
}
