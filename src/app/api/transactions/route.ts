import { createClient } from "@/utils/server";
import { NextResponse } from "next/server";

function generateBaseHash(
  date: string,
  description: string,
  debit: any,
  credit: any,
  balance: number,
) {
  const d = debit || "0";
  const c = credit || "0";
  return `${date}-${description.trim()}-${d}-${c}-${balance}`;
}

export async function POST(request: Request) {
  // Initialize Supabase
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Auth Error:", error?.message);
    return NextResponse.json(
      { error: "Unauthorized: No active user found" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { transactions } = body;

    // Frequency map to handle multiple identical transactions in one day
    const frequencyMap: Record<string, number> = {};

    const formattedData = transactions.map((t: any) => {
      // Clean the inputs
      const debitVal = t.debit ? Math.abs(parseFloat(t.debit)) : null;
      const creditVal = t.credit ? Math.abs(parseFloat(t.credit)) : null;

      // Calculate the "Net Amount" for easy math later
      const netAmount = creditVal ? creditVal : debitVal ? -debitVal : 0;

      // Clean balance string (remove "$" and "CR")
      const cleanBalance = parseFloat(
        t.balance.replace(/[$,]/g, "").replace(" CR", ""),
      );

      // Generate Hash
      const baseHash = generateBaseHash(
        t.date,
        t.description,
        debitVal,
        creditVal,
        cleanBalance,
      );

      // Handle duplicates in the same batch
      if (frequencyMap[baseHash]) {
        frequencyMap[baseHash] += 1;
      } else {
        frequencyMap[baseHash] = 1;
      }
      const uniqueHash = `${baseHash}-${frequencyMap[baseHash]}`;

      return {
        user_id: user.id,
        date: t.date,
        description: t.description,
        debit: debitVal,
        credit: creditVal,
        amount: netAmount,
        balance: cleanBalance,
        transaction_hash: uniqueHash,
      };
    });

    const { data, error: dbError } = await supabase
      .from("transactions")
      .upsert(formattedData, {
        onConflict: "user_id, transaction_hash",
        ignoreDuplicates: true,
      })
      .select();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, count: data.length });
  } catch (error: any) {
    console.error("Processing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Initialize Supabase
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth Error:", authError?.message);
    return NextResponse.json(
      { error: "Unauthorized: No active user found" },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id);

  return NextResponse.json({ data, error });
}

export async function DELETE(request: Request) {
  // Initialize Supabase
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth Error:", authError?.message);
    return NextResponse.json(
      { error: "Unauthorized: No active user found" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: 'Missing "id" parameter' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ data, error });
}
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  // Update ALL fields
  const { error } = await supabase
    .from("transactions")
    .update({
      date: body.date,
      description: body.description,
      category: body.category,
      debit: body.debit,
      credit: body.credit,
      amount: body.amount,
      balance: body.balance,
    })
    .eq("id", body.id);

  return NextResponse.json({ error });
}
