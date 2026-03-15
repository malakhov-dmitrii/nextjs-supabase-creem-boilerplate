import { type NextRequest, NextResponse } from "next/server";
import { creem } from "@/lib/creem";
import { isDemoMode } from "@/lib/demo/mode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatTransaction } from "./helpers";

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json({ transactions: [] });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get customer ID from subscription
  const { data: subscription } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("creem_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!subscription?.creem_customer_id) {
    return NextResponse.json({ transactions: [] });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");

  try {
    const result = await creem.transactions.search(
      subscription.creem_customer_id,
      undefined,
      undefined,
      page,
      20,
    );
    const items = (result as unknown as { items?: unknown[] }).items ?? [];
    const formatted = (items as Array<Record<string, unknown>>).map((tx) =>
      formatTransaction({
        id: (tx.id ?? tx.transactionId ?? "") as string,
        amount: (tx.amount ?? 0) as number,
        currency: (tx.currency ?? "usd") as string,
        status: (tx.status ?? "unknown") as string,
        created_at: (tx.created_at ?? tx.createdAt ?? 0) as string | number,
      }),
    );
    return NextResponse.json({ transactions: formatted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch transactions";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
