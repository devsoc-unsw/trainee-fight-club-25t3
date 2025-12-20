"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

type TipCardProps = {
  metrics: any; // The summary data object
};

export default function TipCard({ metrics }: TipCardProps) {
  const [tip, setTip] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Check if we already have a tip saved for today
    const savedTip = localStorage.getItem("dailyFinancialTip");
    const savedDate = localStorage.getItem("dailyFinancialTipDate");
    const today = new Date().toDateString();

    if (savedTip && savedDate === today) {
      setTip(savedTip);
    } else {
      // If no tip for today, generate one
      generateTip();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics]);

  async function generateTip() {
    if (!metrics || loading) return; // Prevent double clicks
    setLoading(true);

    try {
      const res = await fetch("/api/generate-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics }),
      });

      const data = await res.json();

      if (data.tip) {
        setTip(data.tip);
        // Save to local storage
        localStorage.setItem("dailyFinancialTip", data.tip);
        localStorage.setItem("dailyFinancialTipDate", new Date().toDateString());
      }
    } catch (err) {
      console.error(err);
      setTip("Could not load tip. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-end gap-4 mb-8">
      {/* Mascot Image - Now Clickable */}
      <div 
        className="relative w-30 h-30 shrink-0 drop-shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95"
        onClick={generateTip}
        title="Click me for a new tip!"
      >
        <Image
          src="/mula.png" 
          alt="Moola the Mascot"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Speech Bubble */}
      <div className="relative flex-1 bg-card border border-border p-6 rounded-2xl rounded-bl-none shadow-sm">
        {/* CSS Trick for the speech bubble tail */}
        <div className="absolute -left-3 bottom-0 w-0 h-0 border-t-[15px] border-t-transparent border-r-[15px] border-r-border border-b-[0px] border-b-transparent">
            <div className="absolute -top-[13px] left-[1px] w-0 h-0 border-t-[14px] border-t-transparent border-r-[14px] border-r-card border-b-[0px] border-b-transparent"></div>
        </div>

        <div className="flex justify-between items-start gap-4">
          <div className="w-full">
            <h3 className="text-x font-bold text-primary uppercase mb-2 tracking-wide">
              Moola's Tip of the Day
            </h3>

            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-lg italic">Hmm, let me think...</span>
              </div>
            ) : (
              <p className="text-lg font-medium text-foreground leading-relaxed italic">
                &ldquo;{tip || "Loading insights..."}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}