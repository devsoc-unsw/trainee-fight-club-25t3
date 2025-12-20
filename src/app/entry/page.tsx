"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DataEntryPage() {
  const router = useRouter();

  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfMsg, setPdfMsg] = useState("");

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
      console.log("Nodes:", data.sankey_data.nodes);
      console.log("Links:", data.sankey_data.links);

      setPdfMsg("Analysis complete!");

      const sankeyData = {
        nodes: data.sankey_data.nodes,
        links: data.sankey_data.links,
      };

      localStorage.setItem("sankeyData", JSON.stringify(sankeyData));
    } catch (err) {
      console.error(err);
      setPdfMsg("Error processing PDF.");
    }
  }

  return (
    <>
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

      <div style={{ padding: 24, maxWidth: 420 }}>
        <h2>Upload PDF</h2>
        <form onSubmit={handlePdfUpload}>
          <div style={{ marginBottom: 10 }}>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files) setPdfFile(e.target.files[0]);
              }}
              style={{ width: "100%", padding: 10 }}
            />
          </div>
          <button type="submit" disabled={!pdfFile}>
            Parse PDF
          </button>
          {pdfMsg && <p style={{ marginTop: 10 }}>{pdfMsg}</p>}
        </form>
      </div>
    </>
  );
}
