// Inside a React component (e.g., app/dashboard/page.tsx)
"use client";

export default function UploadButton() {
  const handleUpload = async () => {
    // Example data
    const payload = {
      transactions: [
        {
          date: "2023-10-27",
          description: "Woolworths",
          debit: "50.00",
          credit: null,
          balance: "1000.00",
        },
        {
          date: "2023-10-27",
          description: "Woolworths",
          debit: "50.00",
          credit: null,
          balance: "950.00",
        },
      ],
    };

    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(result);
  };

  return <button onClick={handleUpload}>Upload Transactions</button>;
}
